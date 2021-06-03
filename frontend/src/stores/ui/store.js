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

import { derived, readable, writable } from "svelte/store";
import { isLoaded as isTrainLoaded } from "../train/store";

export const imuDataColors = readable([
  "#f94144",
  "#f8961e",
  "#f9c74f",
  "#43aa8b",
  "#577590",
  "#277da1",
  "#ef476f",
  "#118ab2",
  "#06d6a0",
  "#f15bb5",
  "#9b5de5",
  "#00f5d4",
]);

// add anything else that requires loading here
export const isFullyLoaded = derived([isTrainLoaded], ([$isTrainLoaded]) => {
  return $isTrainLoaded;
});

export const promptStack = writable(null);

export const hasShownConnectPrompt = writable(false);

export const sketchFileUrl = readable(
  "https://github.com/googlecreativelab/tf4micro-motion-kit/releases/latest"
);

export const errorStack = writable([]);
