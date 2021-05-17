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

let button;
let settings;

function updateConnected(){
  if(api.isConnected()){
    button.removeAttribute('disabled');
  } else {
    button.setAttribute('disabled', true);
  }
}

async function handleCalibrationClick(){
  button.innerText = 'Calibrating...';
  settings.onCalibrationBegin && settings.onCalibrationBegin()
  await api.calibrate();
  button.innerText = 'Calibrate';
  settings.onCalibrationComplete && settings.onCalibrationComplete();
}

export default function(containerEl, _settings = {}){
  if (typeof containerEl === "string") {
    let _containerEl = document.querySelector(containerEl);
    if (!_containerEl) {
      throw new Error(`Failed finding a element with selector ${containerEl}`);
    }
    containerEl = _containerEl;
  }

  settings = _settings;

  button = document.createElement('button');
  button.innerText = 'Calibrate';
  button.classList.add("tf4micro-motion-kit-calibration-button");

  api.addEventListener('connect', updateConnected);
  api.addEventListener('disconnect', updateConnected);
  updateConnected();

  button.addEventListener('click',handleCalibrationClick, false);

  containerEl.appendChild(button);

  return button;
}