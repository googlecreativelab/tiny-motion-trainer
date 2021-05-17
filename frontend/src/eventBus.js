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

const subscriptions = { reset: {} };
let id = 0;
const uidGen = () => ++id;

function subscribe(eventType, callback) {
  const id = uidGen();
  if (!subscriptions[eventType]) {
    throw new Error("No such event " + eventType);
  }
  subscriptions[eventType][id] = callback;
  return {
    unsubscribe: () => {
      delete subscriptions[eventType][id];
      if (Object.keys(subscriptions[eventType]).length === 0)
        delete subscriptions[eventType];
    },
  };
}

function publish(eventType, ...args) {
  if (!subscriptions[eventType]) {
    throw new Error("No such event " + eventType);
  }
  Object.values(subscriptions[eventType]).forEach((cb) => cb(...args));
}

export default {
  subscribe,
  publish,
};
