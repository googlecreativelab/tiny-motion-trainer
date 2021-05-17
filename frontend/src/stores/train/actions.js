/* ======================================================================
Copyright 2021 Google LLC
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. 
========================================================================*/

/**
 * @autor Rikard Lindstrom <rlindstrom@google.com>
 */

import * as tf from "@tensorflow/tfjs";
import { get } from "svelte/store";

import * as datasetUtils from "@/util/datasetUtils";

import {
  modelArchitecture,
  trainBachSize,
  trainEarlyStopping,
  trainEarlyStoppingMaxEpochsWithoutImprovement,
  trainEarlyStoppingMinAccuracy,
  trainedModel,
  trainEpochs,
  trainingState,
  trainLogAccuracy,
  trainLogLoss,
  trainTestSplit,
  trainValidationSplit,
} from "./store";
import { labels, recordings } from "../capture/store";

const log = (...args) => {
  console.log(
    "%c -> train/actions.js " + args.join(", "),
    "background: DarkBlue; color: #F0F2F6; display: block;"
  );
};

export function prepareDataSet() {
  const $labels = get(labels);
  const numLabels = $labels.length;
  const $recordings = get(recordings);

  const Y = [];
  const X = [];
  $labels.forEach((label, index) => {
    // one-hot
    const output = new Array(numLabels).fill(0);
    output[index] = 1;

    const recordings = $recordings[index];
    recordings.forEach((recording) => {
      const tensor = [];
      recording.forEach(([...a]) => {
        tensor.push(...a);
      });
      X.push(tensor);
      Y.push(output);
    });
  });

  return [X, Y];
}

/**
 * Compiles model based on modelArchitecture
 * @returns model
 */
function setupModel(inputShape) {
  const architecture = get(modelArchitecture);
  const numLabels = get(labels).length;

  let model = tf[architecture.type]();
  architecture.layers.forEach((layer, index) => {
    const props = { ...layer.props };
    if (index === 0) {
      props.inputShape = [inputShape];
    } else if (index === architecture.layers.length - 1) {
      //last layer, units must be numLabels
      props.units = numLabels;
    }
    model.add(tf.layers[layer.type](props));
  });

  model.compile({
    optimizer: "rmsprop",
    loss: "meanSquaredError",
    metrics: ["accuracy", "mae"],
    validationSplit: get(trainValidationSplit),
  });

  return model;
}

/**
 * Update log stores with latest data each epoch
 * @param {*} tfLogs logs object gotten from tensorflow callback
 */
function updateLogs(tfLogs) {
  trainLogAccuracy.update(($logs) => {
    $logs.train = [...$logs.train, tfLogs.acc];
    $logs.validation = [...$logs.validation, tfLogs.val_acc];
    return { ...$logs };
  });

  trainLogLoss.update(($logs) => {
    $logs.train = [...$logs.train, tfLogs.loss];
    $logs.validation = [...$logs.validation, tfLogs.val_loss];
    return { ...$logs };
  });
}

/**
 * Action to start training
 */
export async function beginTraining() {
  if (get(trainingState) !== "idle") {
    throw new Error("Already training");
  }

  //=========================================================
  // Prepeare
  //=========================================================

  trainLogAccuracy.reset();
  trainLogLoss.reset();

  //=========================================================
  // Start training
  //=========================================================

  async function train(inputs, outputs) {
    trainedModel.set(null);

    let model = setupModel(inputs[0].length);

    //=========================================================
    // Epoch Callback / Logs / Early Stopping
    //=========================================================

    const onEpochEnd = async (epoch, logs) => {
      log(`epoch: ${epoch}, accuracy: ${logs.acc}`);

      updateLogs(logs);

      // progress = epoch / ($epochs - 1);

      if (get(trainEarlyStopping)) {
        // Two conditions..
        // 1. Accuracy has to have reached min accuracy
        let maxAccuracy = 0;
        get(trainLogAccuracy).validation.forEach((v, i) => {
          maxAccuracy = Math.max(v, maxAccuracy);
        });
        log("maxAcc", maxAccuracy, get(trainEarlyStoppingMinAccuracy));
        if (maxAccuracy * 100 > get(trainEarlyStoppingMinAccuracy)) {
          let shouldStop = true;

          if (maxAccuracy === logs.val_acc) {
            // save snapshot of best model so far
            await model.save("localstorage://snapshot-model");
          }

          // 2. Accuracy has to have not increased for a set number of epochs
          let diffThreshold = 0.01; // max
          const historyCount = get(trainLogAccuracy).validation.length;
          if (
            historyCount >=
            get(trainEarlyStoppingMaxEpochsWithoutImprovement) + 1
          ) {
            const start =
              historyCount -
              get(trainEarlyStoppingMaxEpochsWithoutImprovement) -
              1;

            // we stop if we can find a higher accuracy than current
            for (let i = start; i < historyCount - 1; i++) {
              const acc = get(trainLogAccuracy).validation[i];
              if (logs.val_acc - acc > diffThreshold) {
                shouldStop = false;
                break;
              }
            }
          } else {
            shouldStop = false;
          }

          if (shouldStop) {
            trainingState.set("stop_queued");
          }
        }
      }
      if (get(trainingState) === "stop_queued") {
        model.stopTraining = true;
        trainingState.set("idle");
      }
    }; // /onEpochEnd

    // Split dataset in training / validation set
    const [x, val_x] = datasetUtils.splitArray(
      inputs,
      1 - get(trainValidationSplit)
    );
    const [y, val_y] = datasetUtils.splitArray(
      outputs,
      1 - get(trainValidationSplit)
    );

    // Remove any previous snapshot model
    try {
      await tf.io.removeModel("localstorage://snapshot-model");
    } catch {
      // should be ok, we probably didn't have a snap-shot
    }

    // start training
    const info = await model.fit(tf.tensor(x), tf.tensor(y), {
      validationData: [tf.tensor(val_x), tf.tensor(val_y)],
      epochs: get(trainEpochs),
      batchSize: get(trainBachSize),
      callbacks: { onEpochEnd },
    });

    if (get(trainEarlyStopping)) {
      // load best model
      console.log("Early stopping enabled, loading best model");
      try {
        const snapShotModel = await tf.loadLayersModel(
          "localstorage://snapshot-model"
        );
        model = snapShotModel;
      } catch (e) {
        console.error(e);
      } finally {
        try {
          // cleanup
          await tf.io.removeModel("localstorage://snapshot-model");
        } catch {}
      }
    }

    log("Done training! Final accuracy");
    return [model, info];
  }

  const dataSet = prepareDataSet();

  // split dataset in train / test
  const [train_X, train_Y, test_X, test_Y] =
    datasetUtils.shuffleAndSplitDataSet(dataSet, 1 - get(trainTestSplit));

  trainingState.set("training");

  const [_trainedModel, info] = await train(train_X, train_Y);

  trainingState.set("idle");

  trainedModel.set(_trainedModel);
}

export const stopTraining = function () {
  if (get(trainingState) !== "idle") {
    trainingState.set("stop_queued");
  }
};

export async function getModelJson() {
  if (!get(trainedModel)) {
    return null;
  }

  const model = get(trainedModel);
  await model.save("localstorage://tmp-serialize-model");
  const data = {
    info: localStorage.getItem("tensorflowjs_models/tmp-serialize-model/info"),
    model_metadata: localStorage.getItem(
      "tensorflowjs_models/tmp-serialize-model/model_metadata"
    ),
    model_topology: localStorage.getItem(
      "tensorflowjs_models/tmp-serialize-model/model_topology"
    ),
    weight_data: localStorage.getItem(
      "tensorflowjs_models/tmp-serialize-model/weight_data"
    ),
    weight_specs: localStorage.getItem(
      "tensorflowjs_models/tmp-serialize-model/weight_specs"
    ),
  };
  await tf.io.removeModel("localstorage://tmp-serialize-model");
  return data;
}

export async function modelFromJson(json) {
  localStorage.setItem(
    "tensorflowjs_models/tmp-serialize-model/info",
    json.info
  );
  localStorage.setItem(
    "tensorflowjs_models/tmp-serialize-model/model_metadata",
    json.model_metadata
  );
  localStorage.setItem(
    "tensorflowjs_models/tmp-serialize-model/model_topology",
    json.model_topology
  );
  localStorage.setItem(
    "tensorflowjs_models/tmp-serialize-model/weight_data",
    json.weight_data
  );
  localStorage.setItem(
    "tensorflowjs_models/tmp-serialize-model/weight_specs",
    json.weight_specs
  );
  const model = await tf.loadLayersModel("localstorage://tmp-serialize-model");
  await tf.io.removeModel("localstorage://tmp-serialize-model");

  trainedModel.set(model);
}

export function removeTrainedModel() {
  trainedModel.set(null);
}
