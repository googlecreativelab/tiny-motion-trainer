/* Copyright 2021 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

/*
 * API for TinyML Experiments
 *
 */

import bleManager from "./modules/bleManager.js";
import EventHandler from "./modules/EventHandler.js";

const eventHandler = new EventHandler(
  "inference",
  "connect",
  "disconnect",
  "imudata"
);

// let all events from bleManager propagate
bleManager.propagateEventsTo(eventHandler);

// Simple validation
function validate(val, name, type) {
  if (typeof val !== type) {
    throw new Error(
      `Argument ${name} is required and needs to be a ${type}. Received ${val}`
    );
  }
}

function loadFile(modelUrl) {
  return new Promise((resolve, reject) => {
    const oReq = new XMLHttpRequest();
    oReq.open("GET", modelUrl, true);
    oReq.responseType = "arraybuffer";

    oReq.onload = function () {
      const arrayBuffer = oReq.response;
      if (arrayBuffer) {
        resolve(arrayBuffer);
      } else {
        reject(new Error("Failed fetching arrayBuffer"));
      }
    };

    oReq.onerror = reject;
    oReq.send(null);
  });
}

export function getState() {
  return bleManager.getState();
}

export function writeMetaString(msg) {
  return bleManager.writeMetaString(msg);
}

export function readMetaString() {
  return bleManager.readMetaString();
}


export function readVersion(){
  return bleManager.readVersion();
}


export function readDataProviderLabels(){
  return bleManager.readDataProviderLabels();
}

let _isConnected = false;
export async function connect() {
  await bleManager.connect();
  _isConnected = true;
  eventHandler.dispatchEvent("connect");
}

export function isConnected() {
  return _isConnected;
}

export async function disconnect() {
  return bleManager.disconnect().then(() => {
    _isConnected = false;
    eventHandler.dispatchEvent("disconnect");
  });
}

export async function setState(state) {
  await bleManager.setState(state);
}

export async function calibrate() {
  return new Promise(async (resolve, reject) => {
    await bleManager.setState("CALIBRATION");
    const unsub = bleManager.addEventListener("state-change", (state) => {
      console.log("state change", state);
      if (state !== "CALIBRATION") {
        unsub();
        resolve();
      }
    });
  });
}

export async function transferFile({ file, fileType }) {
  if (typeof file !== "string" && !(file instanceof ArrayBuffer)) {
    throw new Error(
      "file need to be either a string or an instance of ArrayBuffer"
    );
  }

  try {
    const fileBuffer =
      file instanceof ArrayBuffer ? file : await loadFile(file);
    if (!_isConnected) {
      console.log('not connecteds')
      await bleManager.connect();
    }

    try {
      await bleManager.transferFile(fileBuffer, fileType);
    } catch (e) {
      console.trace(e);
    }
  } catch (e) {
    console.error(e);
    throw new Error(`Failed loading model at ${file}, check the url`);
  }
}

export function setDisableMagnetometer(value){
  return bleManager.setDisableMagnetometer(value);
}

export async function transferModel({
  model,
  numClasses,
  threshold,
  numSamples,
  captureDelay,
  useMagnetometer = true,
}) {
  if (typeof model !== "string" && !(model instanceof ArrayBuffer)) {
    throw new Error(
      "model need to be either a string or an instance of ArrayBuffer"
    );
  }

  validate(numClasses, "numClasses", "number");
  validate(threshold, "threshold", "number");
  validate(numSamples, "numSamples", "number");
  validate(captureDelay, "captureDelay", "number");

  try {
    const modelBuffer =
      model instanceof ArrayBuffer ? model : await loadFile(model);
    if (!_isConnected) {
      await bleManager.connect();
    }
    try {
      await bleManager.transferModel(
        modelBuffer,
        numClasses,
        threshold,
        numSamples,
        captureDelay,
        useMagnetometer
      );
    } catch (e) {
      console.trace(e);
    }
  } catch (e) {
    console.error(e);
    throw new Error(`Failed loading model at ${model}, check the url`);
  }
}

export function addEventListener(eventName, callback) {
  return eventHandler.addEventListener(eventName, callback);
}

export function removeEventListener(eventName, callback) {
  return eventHandler.removeEventListener(eventName, callback);
}
