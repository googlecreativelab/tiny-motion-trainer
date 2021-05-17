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

import { writable, get } from "svelte/store";

class DeserializeError extends Error {
  constructor(message) {
    super(message);
    this.name = "DeserializeError";
  }
}

class LocalStorageError extends Error {
  constructor(message) {
    super(message);
    this.name = "LocalStorageError";
  }
}

const errorCallbacks = [];
const allStores = {};

const deepCompate = (a, b) => {
  if (typeof a === "object") {
    return JSON.stringify(a) === JSON.stringify(b);
  } else {
    return a == b;
  }
};

let localStorageDisabled = !window.localStorage;

export default function persistStore(key, val, parseFn, onError) {
  const originalVal = JSON.parse(JSON.stringify(val));

  let localStorageDisabledForKey = localStorageDisabled;

  if (allStores[key]) {
    throw new Error(`Persistant store with key ${key} already exists`);
  }
  const v = localStorage.getItem(key);
  let store;
  if (v !== null && v !== undefined) {
    try {
      let data = JSON.parse(v);
      if (parseFn) {
        data = parseFn(data);
      }
      store = writable(data);
    } catch (e) {
      const error = new DeserializeError(
        `Failed parsing value ${v} for key ${key}`
      );
      errorCallbacks.forEach((cb) => cb(error));
      onError && onError(error);
    }
  } else {
    store = writable(val);
  }

  store.subscribe((val) => {
    if (key !== "persistStore.dirty" && !deepCompate(val, originalVal)) {
      dirty.set(true);
    }

    if (localStorageDisabled || localStorageDisabledForKey) {
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      const error = new LocalStorageError(e.message);
      onError && onError(error);
      errorCallbacks.forEach((cb) => cb(error));
    }
  });

  store.deserialize = (data) => {
    if (parseFn) {
      data = parseFn(data);
    }
    store.set(data);
  };

  store.reset = () => {
    store.set(originalVal);
  };

  store.disableLocalStorage = (toggle = true) => {
    localStorageDisabledForKey = toggle;
    if (window.localStorage) {
      localStorage.removeItem(key);
    }
  };

  allStores[key] = store;

  return store;
}

export const dirty = persistStore("persistStore.dirty", false);
persistStore.clearDirty = function () {
  dirty.set(false);
};

persistStore.disable = function () {
  localStorageDisabled = true;
};

persistStore.onError = (cb) => errorCallbacks.push(cb);

persistStore.reset = function () {
  Object.values(allStores).forEach((store) => store.reset());
  dirty.set(false);
};

persistStore.serialize = function () {
  return Object.keys(allStores).reduce((data, key) => {
    data[key] = get(allStores[key]);
    return data;
  }, {});
};

persistStore.deserialize = function (data) {
  try {
    Object.keys(allStores).forEach((key) => {
      if (data[key] !== undefined) {
        allStores[key].deserialize(data[key]);
      } else {
        console.warn(`Missing data for key ${key} when deserializing`);
      }
    });
  } catch (e) {
    persistStore.onError(new DeserializeError("Failed to deserialize"));
  }
  dirty.set(false);
};
