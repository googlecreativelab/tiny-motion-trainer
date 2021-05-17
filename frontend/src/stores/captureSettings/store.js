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

import { derived } from "svelte/store";
import { dataLabels } from "../bleInterfaceStore/store";
import persistStore from "../utils/persistStore";
import { clampValue } from "../utils/valueParsers";

export const minMaxValues = {
  captureThreshold: [0, 1],
  captureSamples: [1, 200],
  captureDelay: [0, 60],
};

export const captureThreshold = persistStore(
  "captureSettings.captureThreshold",
  0.2,
  clampValue(...minMaxValues.captureThreshold)
);

export const captureSamples = persistStore(
  "captureSettings.captureSamples",
  20,
  clampValue(...minMaxValues.captureSamples)
);

export const captureDelay = persistStore(
  "captureSettings.captureDelay",
  0.2,
  clampValue(...minMaxValues.captureDelay)
);

export const useMagnetometer = persistStore(
  "captureSettings.useMagnetometer",
  false
);

export const captureImuLabels = derived(
  [dataLabels, useMagnetometer],
  ([$dataLabels, $useMagnetometer]) => {
    if (!$dataLabels) {
      return [];
    }
    if ($useMagnetometer) {
      return [...$dataLabels];
    } else {
      return $dataLabels.slice(0, 6);
    }
  }
);
