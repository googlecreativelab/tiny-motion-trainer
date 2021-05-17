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

import { get } from "svelte/store";
import * as tf from "@tensorflow/tfjs";
import IMUCapturer from "@/util/IMUCapturer";
import { connect, setImuDataMode } from "../bleInterfaceStore/actions";
import { isConnected } from "../bleInterfaceStore/store";
import { trainedModel } from "../train/store";
import { testPredictions } from "./store";

import * as captureSettings from "../captureSettings/store";

let imuCapturer;
export async function beginTesting() {
  // make sure we have a model to test
  if (!get(trainedModel)) {
    throw new Error("No trained model available");
  }

  if (imuCapturer) {
    throw new Error("Testing already in progress");
  }
  // make sure we're connected
  if (!get(isConnected)) {
    await connect();
  }

  await setImuDataMode();

  imuCapturer = new IMUCapturer({
    numSamples: get(captureSettings.captureSamples),
    captureDelay: get(captureSettings.captureDelay),
    sensitivity: get(captureSettings.captureThreshold),
    onCaptureComplete: (data) => {
      const preparedData = [];
      data.forEach((recording) => {
        preparedData.push(...recording);
      });

      const tensor = tf.tensor([preparedData]);
      const predictionsTensor = get(trainedModel).predict(tensor);
      const [predictions] = predictionsTensor.arraySync();
      testPredictions.set(predictions);
    },
    thresholdFilter: [1, 1, 1, 1, 1, 1, 0, 0, 0],
    useMagnetometer: get(captureSettings.useMagnetometer),
  });

  imuCapturer.start();
}

export async function endTesting() {
  if (imuCapturer) {
    imuCapturer.stop();
    imuCapturer = null;
  }
}
