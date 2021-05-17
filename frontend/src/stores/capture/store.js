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

import { writable, get, derived, readable } from "svelte/store";
import persistStore from "@/stores/utils/persistStore";
import { parseFloat32Array } from "../utils/valueParsers";
import { captureDelay, useMagnetometer } from "../captureSettings/store";
import stateStore from "../utils/stateStore";

export const recordings = persistStore(
  "capture.recordings",
  [],
  parseFloat32Array
);

persistStore.onError(() => {
  recordings.disableLocalStorage();
});

export const labels = persistStore("capture.labels", []);

export const captureState = stateStore("idle", [
  "idle",
  "armed",
  "recording",
  "waiting",
]);

export const captureDataLength = derived(
  useMagnetometer,
  ($useMagnetometer) => {
    return $useMagnetometer ? 9 : 6;
  }
);

export const armedLabelIndex = writable(-1);

labels.subscribe(($labels) => {
  if ($labels.length) {
    if (get(armedLabelIndex) === -1) {
      armedLabelIndex.set(0);
    }
  } else {
    armedLabelIndex.set(-1);
  }
});

export const captureDelayTimeout = readable(0, (set) => {
  const runTimer = function (time) {
    set(time);
    if (time > 0) {
      setTimeout(() => {
        runTimer(time - 1);
      }, 1000);
    }
  };

  const unsub = captureState.subscribe(($state) => {
    if ($state === "waiting") {
      if (get(captureDelay) > 1) {
        runTimer(get(captureDelay));
      } else {
        set(get(captureDelay));
      }
    }
  });

  return () => {
    unsub();
  };
});

export const hasRecordings = derived(recordings, ($recordings) => {
  if ($recordings) {
    for (let i = 0; i < $recordings.length; i++) {
      if ($recordings[i].length) {
        return true;
      }
    }
  }
  return false;
});
