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

import { get } from "svelte/store";
import { clearPersistantStorage } from "../aggregatedActions";
import { getModelJson, modelFromJson } from "../train/actions";
import { trainedModel } from "../train/store";
import persistStore from "../utils/persistStore";
import { fileHandle, hasFile, fileVersion } from "./store";

const isChromeOs = /(CrOS)/.test(navigator.userAgent);

async function writeJsonFile(fileHandle) {
  // Create a FileSystemWritableFileStream to write to.
  const writable = await fileHandle.createWritable();
  const data = persistStore.serialize();
  if (get(trainedModel)) {
    data.model = await getModelJson();
  }

  data.version = get(fileVersion);
  const contents = JSON.stringify({ version: fileVersion, ...data });

  await writable.write(contents);
  await writable.close();
}

async function readFile(fileHandle) {
  const fileData = await fileHandle.getFile();

  const reader = new FileReader();
  const readJson = async (e) => {
    const text = e.target.result;
    const data = JSON.parse(text);
    // @TODO - send user to a previous version
    // if current no longer reads file
    // const version = data.version || "2";
    // if (version != fileVersion) {
    //   if (
    //     confirm(
    //       `File version mismatch. Loaded file version: ${version}. Go to the old website?`
    //     )
    //   ) {
    //     location.href = <other url>;
    //   }
    //   return;
    // }

    // we've gotten this far, time to clear storage
    clearPersistantStorage();

    persistStore.deserialize(data);
    trainedModel.set(null);
    if (data.model) {
      await modelFromJson(data.model);
    }
  };

  reader.onload = readJson;
  reader.readAsText(fileData);
}

export async function saveFile() {
  if (get(hasFile)) {
    writeJsonFile(get(fileHandle));
  } else {
    return saveFileAs();
  }
}

export async function saveFileAs() {
  const $fileHandle = await window.showSaveFilePicker({
    types: [
      {
        description: "JSON File",
        accept: { "application/json": [".json"] },
      },
    ],
  });
  writeJsonFile($fileHandle);
  fileHandle.set($fileHandle);
}

export async function loadFile() {
  const [$fileHandle] = await window.showOpenFilePicker({
    multiple: false,
    types: isChromeOs
      ? undefined
      : [
          {
            description: "JSON File",
            accept: { "application/json": [".json"] },
          },
        ],
  });
  await readFile($fileHandle);
  fileHandle.set($fileHandle);
}
