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

import { get, writable } from "svelte/store";

export default function (initial, validStates) {
  const store = writable(initial);
  const { subscribe, set, update } = store;

  subscribe((v) => {
    if (!validStates.includes(v)) {
      throw new Error(
        `Invalid state set (${v}). Valid states are: ${validStates.join(", ")}`
      );
    }
  });

  const compare = (state) => {
    if (!validStates.includes(state)) {
      throw new Error(
        `Invalid state check (${state}). Valid states are: ${validStates.join(
          ", "
        )}`
      );
    }
    return state === get(store);
  };
  return {
    subscribe,
    set,
    update,
    compare,
  };
}
