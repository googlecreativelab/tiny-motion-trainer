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
======================================================================*/

import * as tf from "@tensorflow/tfjs";
import { get } from "svelte/store";

import { arduinoTemplateVersion } from "../version";
import getDateString from "@/util/getDateString";
import { shuffleAndSplitDataSet } from "@/util/datasetUtils";
import downloadBlob from "@/util/downloadBlob";

import { removeTrainedModel } from "./train/actions";
import persistStore from "./utils/persistStore";
import { captureDataLength, labels, recordings } from "./capture/store";
import {
  captureDelay,
  captureSamples,
  captureThreshold,
} from "./captureSettings/store";
import { prepareDataSet } from "./train/actions";
import { trainedModel, trainTestSplit } from "./train/store";
import { dataLabels } from "./bleInterfaceStore/store";
import downloadText from "../util/downloadText";
import { addRecording } from "./capture/actions";
import { pushErrorMessage } from "./ui/actions";

export function clearPersistantStorage() {
  persistStore.reset();
  removeTrainedModel();
}

export async function downloadTrainedModel(quantize = false) {
  // URL to backend
  const apiUrl = "http://127.0.0.1:5000";

  let url = `${apiUrl}/proc?labels=${get(labels).join(",")}&delay=${Math.floor(
    get(captureDelay) * 1000
  )}&numSamples=${get(captureSamples)}&sensitivity=${get(captureThreshold)}`;

  url += `&version=${arduinoTemplateVersion}`;
  if (quantize) {
    url += "&quantize=true";
  }

  const rq = tf.io.browserHTTPRequest(url, {
    fetchFunc: (url, req) => {
      if (quantize) {
        const [, , test_x] = shuffleAndSplitDataSet(
          prepareDataSet(),
          1 - get(trainTestSplit)
        );
        req.body.append("quantize_data", JSON.stringify(test_x));
      }
      return fetch(url, req);
    },
  });

  const result = await get(trainedModel).save(rq);

  const blob = await result.responses[0].blob();
  downloadBlob(
    blob,
    `TinyMotionTrainer-models-and-example-pack-${getDateString()}.tgz`
  );
}

export async function downloadTfJSModel() {
  await get(trainedModel).save(
    `downloads://tiny-motion-trainer-tfjs-model-${getDateString()}`
  );
}

export function downloadCsvForLabel(labelIndex) {
  const $recordings = get(recordings);
  if (!$recordings[labelIndex][0] || $recordings[labelIndex][0].length === 0) {
    throw new Error(`Label ${labelIndex} has no recordings`);
  }
  const numLabels = $recordings[labelIndex][0][0].length;
  let $dataLabels = get(dataLabels).slice(0, numLabels);

  let csv = $dataLabels.join(",") + "\n";
  $recordings[labelIndex].forEach((recording) => {
    recording.forEach((row) => {
      row = row.slice(0, numLabels);
      csv += row.join(", ") + "\n";
    });
    csv += "\n";
  });

  const label = get(labels)[labelIndex];
  downloadText(
    `${label}_numSamples_${get(captureSamples)}_threshold_${get(
      captureThreshold
    )}_delay_${get(captureDelay)}.csv`,
    csv
  );
}

export function downloadCsvForAllLabels() {
  get(labels).forEach((_, index) => downloadCsvForLabel(index));
}

export async function loadCsvFileToLabel(labelIndex) {
  const fileHandles = await window.showOpenFilePicker({
    multiple: false,
    types: [
      {
        description: "csv",
        accept: {
          "text/*": [".csv", ".txt"],
        },
      },
    ],
  });

  const file = await fileHandles[0].getFile();
  const contents = await file.text();
  const $dataCaptureLength = get(captureDataLength);
  let rows = contents.split("\n");
  rows = rows.filter((r) => r.length > 0 && r.match(/[0-9a-zA-Z]+/g));
  // @TODO sanity check and handle errors
  const header = rows[0].split(",");
  if (header.length > $dataCaptureLength) {
    pushErrorMessage(
      `Data mismatch: your data contains more columns than expected. It should equal ${$dataCaptureLength}`
    );
    return;
  } else if (header.length < $dataCaptureLength) {
    pushErrorMessage(
      `Data mismatch: your data contains less columns than expected. It should equal ${$dataCaptureLength}`
    );
    return;
  }

  const numRows = rows.length - 1;
  if (numRows % get(captureSamples) !== 0) {
    console.log(numRows, get(captureSamples));
    pushErrorMessage(
      `Data mismatch: the number of rows in your data is not divisible by your number of samples to capture.`
    );
    return;
  }

  let recording = [];
  for (var i = 0; i < rows.length; i++) {
    const cells = rows[i].split(",");
    if (cells.length > 1) {
      if (isFinite(parseFloat(cells[0]))) {
        const values = cells.map((v) => parseFloat(v));
        recording.push(new Float32Array(values));
      }
    }
    if (recording.length == get(captureSamples)) {
      addRecording(labelIndex, recording);
      recording = [];
    }
  }
  if (recording.length !== 0) {
    alert(
      "Error: The number of rows in the CSV is not divisible by the number of samples per recordings you selected."
    );
    throw new Error("Rows not divisible by numSamples in CSV");
  }
}
