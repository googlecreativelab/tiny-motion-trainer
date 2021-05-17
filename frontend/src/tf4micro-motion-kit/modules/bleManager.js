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

/**
 * File bleManager.js - handles communcation between webpage and Arduino
 * including transfering of models
 * @author Rikard Lindstrom
 */

import bleFileTransfer from "./bleFileTransfer.js";
import EventHandler from "./EventHandler.js";

/********************************************************************
 * Colorized Logging
 *******************************************************************/

const log = (...args) => {
  console.log(
    "%c -> bleManager.js " + args.join(", "),
    "background: DarkOliveGreen; color: #F0F2F6; display: block;"
  );
};

/********************************************************************
 * BLE UUIDS
 *******************************************************************/


function UUID_GEN(val) {
  return "81c30e5c-" + val + "-4f7d-a886-de3e90749161";
}

const SERVICE_UUID              = UUID_GEN("0000");

const IMU_DATA_RX_UUID          = UUID_GEN("1001");
const IMU_DATA_LABELS_RX_UUID   = UUID_GEN("1002");
const VERSION_RX_UUID           = UUID_GEN("1003");
const INFERENCE_RX_UUID         = UUID_GEN("1004");

const NUM_CLASSES_UUID          = UUID_GEN("2001");
const NUM_SAMPLES_UUID          = UUID_GEN("2002");
const CAPTURE_DELAY_UUID        = UUID_GEN("2003");
const THRESHOLD_UUID            = UUID_GEN("2004");
const DISABLE_MAGNETOMETER_UUID = UUID_GEN("2005");

const STATE_TX_UUID             = UUID_GEN("3001");
const STATE_RX_UUID             = UUID_GEN("3002");
const FILE_TYPE_TX_UUID         = UUID_GEN("3003");
const HAS_MODEL_RX_UUID         = UUID_GEN("3004");

const META_TX_UUID              = UUID_GEN("4001");
const META_RX_UUID              = UUID_GEN("4002");

/********************************************************************
 * States / Types - Matches Arduino ENUM
 *******************************************************************/

const STATES = {
  IDLE_DISCONNECTED: 0, // Arduino was just turned on
  IDLE_CONNECTED: 1, // BLE was connected
  FILE_TRANSFER: 2, // File transfer mode
  INFERENCE: 3, // Inference is happening and published
  IMU_DATA_PROVIDER: 4, // Send IMU data over BLE for IMU Trainer
  ERROR_STATE: 5, // Something went wrong
  CALIBRATION: 6,
  INFERENCE_AND_DATA_PROVIDER: 7
};

const FILE_TYPES = {
  MODEL_FILE: 0,
  TEST_FILE: 1
};

/********************************************************************
 * Service / characteristics
 *******************************************************************/

let service;
let device;

// Characteristics
let numClassesTxChar,
  numSamplesTxChar,
  captureDelayTxChar,
  thresholdTxChar,
  disableMagnetometerTx,
  stateTxChar,
  stateRxChar,
  inferenceRxChar,
  imuDataRxChar,
  metaRxChar,
  metaTxChar,
  fileTransferTypeTxChar,
  hasModelRxChar,
  dataLabelsRxChar,
  versionRxChar;

// Keep track of connection
let isConnected = false;
let hasModel = false;

const eventHandler = new EventHandler(
  "inference",
  "imudata",
  "disconnect",
  "connect",
  "file-transfer-progress",
  "file-transfer-completed",
  "file-transfer-error",
  "quick-inference",
  "state-change",
  "has-model"
);

/********************************************************************
 * Methods
 *******************************************************************/

function handleInferenceChange(event) {
  const values = new Uint8Array(event.target.value.buffer);
  eventHandler.dispatchEvent("inference", {
    index: values[0],
    score: values[1],
    velocity: values[2],
  });
}

async function updateHasModel(){
  const reader = await hasModelRxChar.readValue();
  const v = await reader.getUint8();
  hasModel = v;
  eventHandler.dispatchEvent('has-model', hasModel);
}

function handleHasModelChange(event){
  const value = event.target.value;
  const v = new Uint8Array(value.buffer)[0];
  console.log(v)
  hasModel = v;
  eventHandler.dispatchEvent('has-model', hasModel);
}

function handleIMUDataChange(event) {
  const data = new Float32Array(event.target.value.buffer);
  eventHandler.dispatchEvent("imudata", data);
}

function onDisconnected(event) {
  eventHandler.dispatchEvent("disconnect");
  isConnected = false;
}

async function connect() {
  log("Requesting device ...");

  device = await navigator.bluetooth.requestDevice({
    filters: [{ services: [SERVICE_UUID] }],
  });

  log("Connecting to device ...");

  device.addEventListener("gattserverdisconnected", onDisconnected);

  const server = await device.gatt.connect();

  log("Getting primary service ...");
  service = await server.getPrimaryService(SERVICE_UUID);

  bleFileTransfer.setupService(service);
}

function handleStateChange(e){
  const reader = e.target.value;
  const byte = new Uint8Array(reader.buffer)[0];
  const state = Object.keys(STATES).find(k=>STATES[k]===byte);
  if(state === STATES.ERROR_STATE){
    eventHandler.dispatchEvent('error',new Error('Arduion is in error state'));
  }
  console.log('state cahnge')
  eventHandler.dispatchEvent('state-change', state);
}

bleFileTransfer.addEventListener("progress", (p) => {
  eventHandler.dispatchEvent("file-transfer-progress", p);
});

bleFileTransfer.addEventListener("completed", (p) => {
  eventHandler.dispatchEvent("file-transfer-completed", p);
});

bleFileTransfer.addEventListener("error", (p) => {
  eventHandler.dispatchEvent("file-transfer-error", p);
});

const bleManagerApi = {
  async connect() {
  
    await connect();
    console.log('SETUP CONNECT!')  
    numClassesTxChar        = await service.getCharacteristic(NUM_CLASSES_UUID);
    numSamplesTxChar        = await service.getCharacteristic(NUM_SAMPLES_UUID);
    captureDelayTxChar      = await service.getCharacteristic(CAPTURE_DELAY_UUID);
    thresholdTxChar         = await service.getCharacteristic(THRESHOLD_UUID);
    stateTxChar             = await service.getCharacteristic(STATE_TX_UUID);
    inferenceRxChar         = await service.getCharacteristic(INFERENCE_RX_UUID);
    imuDataRxChar           = await service.getCharacteristic(IMU_DATA_RX_UUID);
    metaRxChar              = await service.getCharacteristic(META_RX_UUID);
    metaTxChar              = await service.getCharacteristic(META_TX_UUID);
    stateRxChar             = await service.getCharacteristic(STATE_RX_UUID);
    fileTransferTypeTxChar  = await service.getCharacteristic(FILE_TYPE_TX_UUID);
    disableMagnetometerTx   = await service.getCharacteristic(DISABLE_MAGNETOMETER_UUID);
    hasModelRxChar          = await service.getCharacteristic(HAS_MODEL_RX_UUID);
    versionRxChar           = await service.getCharacteristic(VERSION_RX_UUID);
    dataLabelsRxChar        = await service.getCharacteristic(IMU_DATA_LABELS_RX_UUID);

    await inferenceRxChar.startNotifications();
    inferenceRxChar.addEventListener(
      "characteristicvaluechanged",
      handleInferenceChange
    );

    await imuDataRxChar.startNotifications();
    imuDataRxChar.addEventListener(
      "characteristicvaluechanged",
      handleIMUDataChange
    );

    await hasModelRxChar.startNotifications();
    hasModelRxChar.addEventListener("characteristicvaluechanged", handleHasModelChange)
   updateHasModel();

    await stateRxChar.startNotifications();
    stateRxChar.addEventListener("characteristicvaluechanged", handleStateChange);

    isConnected = true;
  },

  async disconnect() {
    await bleManagerApi.setState('IDLE_DISCONNECTED');
    await device.gatt.disconnect()
  },

  async transferFile(fileBuffer, fileType){
    if(FILE_TYPES[fileType] === undefined){
      throw new Error(`Unknown file type: ${fileType}, valid options are: ${Object.keys(FILE_TYPES).join(', ')}`)
    }
    if (!isConnected) {
      throw new Error("modelBleTransfer not connected");
    }

    // Set state to file transfer
    const stateArray = Uint8Array.of(STATES.FILE_TRANSFER);
    await stateTxChar.writeValue(stateArray);
    

    const fileTypeArray = Uint8Array.of(FILE_TYPES[fileType]);
    await fileTransferTypeTxChar.writeValue(fileTypeArray);

    // transfer file
    return bleFileTransfer.transferFile(fileBuffer);
  },

  async transferModel(
    modelBuffer,
    numClasses,
    threshold,
    numSamples,
    captureDelay,
    useMagnetometer
  ) {
    if (!isConnected) {
      throw new Error("modelBleTransfer not connected");
    }

    // Write settings
    const numClassesArray = Uint8Array.of(numClasses);
    await numClassesTxChar.writeValue(numClassesArray);

    const numSamplesArray = Int32Array.of(numSamples);
    await numSamplesTxChar.writeValue(numSamplesArray);

    const thresholdArray = Float32Array.of(threshold);
    await thresholdTxChar.writeValue(thresholdArray);

    const captureDelayArray = Int32Array.of(captureDelay);
    await captureDelayTxChar.writeValue(captureDelayArray);

    const disableMagnetometerArray = Uint8Array.of(!useMagnetometer);
    await disableMagnetometerTx.writeValue(disableMagnetometerArray);

    // transfer file
    return bleManagerApi.transferFile(modelBuffer, 'MODEL_FILE')
  },

  async setDisableMagnetometer(value){
    const disableMagnetometerArray = Uint8Array.of(value);
    await disableMagnetometerTx.writeValue(disableMagnetometerArray);
  },

  async setState(state) {
    if (STATES[state] === undefined) {
      throw new Error(
        `Invalid state ${state}. Available states are ${Object.keys(
          STATES
        ).join(", ")}`
      );
    }
    const stateTxChar = await service.getCharacteristic(STATE_TX_UUID);
    const stateArray = Uint8Array.of(STATES[state]);
    await stateTxChar.writeValue(stateArray);
  },

  async writeMetaRaw(bytes) {
    if (bytes.length > 64) {
      throw new Error("Meta length has a 64 byte limit");
    }
    await metaTxChar.writeValue(bytes);
  },

  async readMetaRaw() {
    const reader = await metaRxChar.readValue();
    const bytes = new Uint8Array(reader.buffer);
    return bytes;
  },

  async writeMetaString(message) {
    const bytes = new Uint8Array(64);
    message.split("").forEach((c, i) => {
      bytes[i] = c.charCodeAt(0);
    });
    return this.writeMetaRaw(bytes);
  },

  async readMetaString() {
    const bytes = await this.readMetaRaw();
    let utf8Decoder = new TextDecoder();
    let message = utf8Decoder.decode(bytes);
    return message;
  },

  async readDataProviderLabels(){
    const reader = await dataLabelsRxChar.readValue();
    const bytes = new Uint8Array(reader.buffer);
    let utf8Decoder = new TextDecoder();
    let labels = utf8Decoder.decode(bytes);
    // fix typo bug in Arduino sketch (v005)
    labels = labels.replace('max.zl','mag.z')
    return labels;
  },

  async readVersion(){
    const reader = await versionRxChar.readValue();
    const bytes = new Uint8Array(reader.buffer);
    return bytes[0];
  },

  async getState() {
    const reader = await stateRxChar.readValue();
    const byte = new Uint8Array(reader.buffer)[0];
    return Object.keys(STATES).find((k) => STATES[k] === byte);
  },

  addEventListener(...args) {
    return eventHandler.addEventListener(...args);
  },

  removeEventListener(...args) {
    return eventHandler.removeEventListener(...args);
  },

  once(...args){
    return eventHandler.once(...args);
  },

  propagateEventsTo(_eventHandler) {
    eventHandler.propagateTo(_eventHandler);
  },
};

export default bleManagerApi;
