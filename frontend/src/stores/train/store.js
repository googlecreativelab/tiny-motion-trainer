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
import { derived, readable, writable } from "svelte/store";
import { labels, recordings } from "../capture/store";
import persistStore from "../utils/persistStore";
import stateStore from "../utils/stateStore";

export const trainingState = stateStore("idle", [
  "idle",
  "stop_queued",
  "training",
]);

// prepare for future alternative designs
export const modelArchitecture = readable({
  type: "sequential",
  layers: [
    { type: "dense", props: { units: 50, activation: "relu" } },
    { type: "dense", props: { units: 15, activation: "relu" } },
    { type: "dense", props: { activation: "softmax" } },
  ],
});

export const trainValidationSplit = persistStore("train.validationSplit", 0.2);
export const trainTestSplit = persistStore("train.testSplit", 0.2);
export const trainEpochs = persistStore("train.epochs", 100);
export const trainBachSize = persistStore("train.batchSize", 1);
export const trainEarlyStopping = persistStore("train.earlyStopping", false);
export const trainEarlyStoppingMaxEpochsWithoutImprovement = persistStore(
  "train.earlyStopping.maxEpochsWithoutImprovement",
  5
);
export const trainEarlyStoppingMinAccuracy = persistStore(
  "train.earlyStopping.minAccuracy",
  90
);

export const trainLogAccuracy = persistStore("train.log.accurcay", {
  train: [],
  validation: [],
});

export const trainLogLoss = persistStore("train.log.loss", {
  train: [],
  validation: [],
});

export const trainedModel = writable(null);

export const trainIsUnlocked = derived(
  [recordings, labels],
  ([$recordings, $labels]) => {
    let unlocked = $labels.length >= 2;
    $labels.forEach((_, index) => {
      // we need at least 3 recordings of each label
      if (!$recordings[index] || $recordings[index].length < 3) {
        unlocked = false;
      }
    });
    return unlocked;
  }
);

export const isLoaded = writable(false);

const IDB_KEY = "trained-model";
const INDEX_DB_PATH = `indexeddb://${IDB_KEY}`;

trainedModel.subscribe(async (model) => {
  if (model) {
    await model.save(INDEX_DB_PATH);
  } else {
    try {
      await tf.io.removeModel(INDEX_DB_PATH);
    } catch (e) {
      console.log(e);
      // no model foundg
    }
  }
});

async function loadTrainedModel() {
  try {
    const model = await tf.loadLayersModel(INDEX_DB_PATH);
    if (model) {
      trainedModel.set(model);
    }
  } catch (e) {
    // no model found..
  } finally {
    isLoaded.set(true);
  }
}

loadTrainedModel();
