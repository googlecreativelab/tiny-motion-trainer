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

import { derived, get, readable } from "svelte/store";
import * as bleApi from "tf4micro-motion-kit/api";
import persistStore from "@/stores/utils/persistStore";

export const isConnected = readable(false, (set) => {
  function handleConnected() {
    set(true);
  }
  function handleDisconnect() {
    set(false);
  }
  set(bleApi.isConnected());
  bleApi.addEventListener("connect", handleConnected);
  bleApi.addEventListener("disconnect", handleDisconnect);
  return () => {
    bleApi.removeEventListener("connect", handleConnected);
    bleApi.removeEventListener("disconnect", handleDisconnect);
  };
});

export const imuData = readable(null, (set) => {
  bleApi.addEventListener("imudata", set);
  return () => {
    bleApi.removeEventListener("imudata", set);
  };
});

export const state = readable(null, async (set) => {
  const state = await bleManager.getState();
  set(state);
  bleApi.addEventListener("state-change", set);
  return () => {
    bleApi.removeEventListener("state-change", set);
  };
});

export const imuVelocity = derived(imuData, ($imuData) => {
  // we only want accelorameter + gyro which is the 6 first values
  return $imuData
    ? $imuData.slice(0, 6).reduce((a, b) => a + Math.abs(b), 0) / 6
    : 0;
});

export const version = derived(isConnected, async ($isConnected) => {
  if ($isConnected) {
    const v = await bleApi.readVersion();
    return v;
  }
  return -1;
});

export const dataLabels = persistStore("bleInterface.dataLabels", [
  "acc.x",
  "acc.y",
  "acc.z",
  "gyro.x",
  "gyro.y",
  "gyro.z",
  "mag.x",
  "mag.y",
  "mag.z",
]);

isConnected.subscribe(async ($isConnected) => {
  if ($isConnected) {
    const labels = await bleApi.readDataProviderLabels();
    const labelArray = labels.replace(/ *\, */g, ",").split(",");
    if (!get(dataLabels).length) {
      dataLabels.set(labelArray);
    } else if (JSON.stringify(get(dataLabels)) !== JSON.stringify(labelArray)) {
      throw new Error(
        `Data provider missmatch, using a different data provider Arduino sketch?`
      );
    }
  }
});
