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

import * as api from "./api.js";

const defaultConfig = {
  autoTransfer: true,
};
let buttonEl;
let experimentConfig;


let isConnected = false;
async function handleDisconnect() {
  isConnected = false;
  buttonEl.innerText = "Connect";
  experimentConfig.onDisconnect && experimentConfig.onDisconnect();
}

async function handleConnect() {
  isConnected = true;
  buttonEl.innerText = "Disconnect";
  console.log("connect!", experimentConfig);
  experimentConfig.onConnect && experimentConfig.onConnect();
}

function handleInference(data) {
  if (experimentConfig.onInference) {
    experimentConfig.onInference(data);
  } else {
    console.log(
      "Got gesture! You should probably supply a onInference function",
      data
    );
  }
}

function handleFileTransferProgress(p) {
  experimentConfig.onTransferProgress && experimentConfig.onTransferProgress(p);
}

function handleFileTransferCompleted(p) {
  experimentConfig.onTransferCompleted &&
    experimentConfig.onTransferCompleted(p);
}

async function handleClickConnect() {
  if (!isConnected) {
    api.removeEventListener("disconnect", handleDisconnect);
    api.removeEventListener("connect", handleConnect);
    api.removeEventListener("inference", handleInference);
    api.removeEventListener(
      "file-transfer-progress",
      handleFileTransferProgress
    );
    api.removeEventListener(
      "file-transfer-completed",
      handleFileTransferCompleted
    );

    api.addEventListener("disconnect", handleDisconnect);
    api.addEventListener("connect", handleConnect);
    api.addEventListener("inference", handleInference);
    api.addEventListener("file-transfer-progress", handleFileTransferProgress);
    api.addEventListener(
      "file-transfer-completed",
      handleFileTransferCompleted
    );

    await api.connect();
    if(experimentConfig.autoTransfer){
      await api.transferModel(experimentConfig);
    }
  } else {
   
    await api.disconnect();
  }
}

export default function (containerEl, config) {
  if (typeof containerEl === "string") {
    let _containerEl = document.querySelector(containerEl);
    if (!_containerEl) {
      throw new Error(`Failed finding a element with selector ${containerEl}`);
    }
    containerEl = _containerEl;
  }

  experimentConfig = {...defaultConfig, ...config};

  buttonEl = document.createElement("button");
  buttonEl.classList.add("tf4micro-motion-kit-connect-button");
  buttonEl.innerText = "Connect";

  buttonEl.addEventListener(
    "click",
    () => handleClickConnect(),
    false
  );

  containerEl.appendChild(buttonEl);
  return buttonEl;
}
