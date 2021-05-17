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

import * as bleApi from "tf4micro-motion-kit/api";
import DataRecorder from "./DataRecorder";

function sliceArray(array, begin, end) {
  const sliced = new Float32Array(end - begin);

  for (var i = 0; i < begin + end; ++i) {
    sliced[i] = array[begin + i];
  }
  return sliced;
}

function nowSec() {
  return performance.now() * 0.001;
}

function checkParam(paramName, value, checkFn) {
  if (!checkFn(value)) {
    throw new Error(`Missing required parameter: ${paramName}. Got ${value}`);
  }
}
class IMUCapturer {
  constructor({
    numSamples,
    sensitivity,
    captureDelay,
    thresholdFilter,
    useMagnetometer,
    onCaptureComplete = () => {},
    onReadyToCapture = () => {},
    onCaptureBegin = () => {},
  }) {
    checkParam("numSamples", numSamples, isFinite);
    checkParam("sensitivity", sensitivity, isFinite);
    checkParam("captureDelay", captureDelay, isFinite);
    checkParam("thresholdFilter", thresholdFilter, Array.isArray);

    this.numSamples = numSamples;
    this.sensitivity = sensitivity;
    this.captureDelay = captureDelay;

    this.handleDataReceived = this.handleDataReceived.bind(this);

    this.isArmed = false;
    this.isRecording = false;

    this.onCaptureBegin = onCaptureBegin;
    this.onCaptureComplete = onCaptureComplete;
    this.onReadyToCapture = onReadyToCapture;
    this.thresholdFilter = thresholdFilter;
    this.useMagnetometer = useMagnetometer;
  }

  handleDoneCapturing() {
    let capture;
    if (this.dataRecorder) {
      capture = this.dataRecorder.buffer;
    }

    this.dataRecorder = null;
    this.isRecording = false;
    this.isArmed = true;

    this.onCaptureComplete(capture);
    this.lastCaptureTs = nowSec();
  }

  handleDataReceived(data) {
    if (!this.useMagnetometer) {
      data = sliceArray(data, 0, 6);
    } else {
      data = sliceArray(data, 0, 9);
    }

    if (this.isArmed && !this.isRecording) {
      if (this.lastCaptureTs) {
        if (nowSec() - this.lastCaptureTs < this.captureDelay) {
          return;
        } else {
          this.onReadyToCapture();
        }
      }

      const thresholdValues = data.filter((_, i) => this.thresholdFilter[i]);
      const avarageValue =
        thresholdValues.reduce((a, b) => a + Math.abs(b), 0) /
        thresholdValues.length;
      if (avarageValue >= this.sensitivity) {
        if (this.lastCaptureTs) {
          if (nowSec() - this.lastCaptureTs < this.captureDelay) {
            console.log("too close to call!");
            return;
          }
        }

        this.isRecording = true;
        this.dataRecorder = new DataRecorder(this.numSamples);
        this.onCaptureBegin();
      }
    }

    if (this.isRecording) {
      this.dataRecorder.record(data);
      if (this.dataRecorder.isFull()) {
        this.handleDoneCapturing();
      }
    }
  }

  start() {
    this.isArmed = true;
    bleApi.addEventListener("imudata", this.handleDataReceived);
  }

  stop() {
    bleApi.removeEventListener("imudata", this.handleDataReceived);
    this.dataRecorder = null;
    this.isRecording = false;
    this.recordingLabel = -1;
    this.isArmed = false;
  }
}

export default IMUCapturer;
