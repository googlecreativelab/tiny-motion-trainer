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
 * File transfer code bassed on https://github.com/petewarden/ble_file_transfer
 * Modularized and added event dispatching
 */

import EventHandler from "./EventHandler.js";

let fileBlockCharacteristic = null;
let fileLengthCharacteristic = null;
let fileMaximumLengthCharacteristic = null;
let fileChecksumCharacteristic = null;
let commandCharacteristic = null;
let transferStatusCharacteristic = null;
let errorMessageCharacteristic = null;

const eventHandler = new EventHandler('error','progress','begin','completed');

let isFileTransferInProgress = false;
let isConnected = false;
let service;
let device;

const SERVICE_UUID = "bf88b656-0000-4a61-86e0-769c741026c0";
const FILE_BLOCK_UUID = "bf88b656-3000-4a61-86e0-769c741026c0";
const FILE_LENGTH_UUID = "bf88b656-3001-4a61-86e0-769c741026c0";
const FILE_MAXIMUM_LENGTH_UUID = "bf88b656-3002-4a61-86e0-769c741026c0";
const FILE_CHECKSUM_UUID = "bf88b656-3003-4a61-86e0-769c741026c0";
const COMMAND_UUID = "bf88b656-3004-4a61-86e0-769c741026c0";
const TRANSFER_STATUS_UUID = "bf88b656-3005-4a61-86e0-769c741026c0";
const ERROR_MESSAGE_UUID = "bf88b656-3006-4a61-86e0-769c741026c0";

// Display logging information in the interface, you'll want to customize this
// for your page.
const msg = (...args) => {
  console.log(
    "%c -> bleFileTransfer.js " + args.join(", "),
    "background: DarkOliveGreen; color: #F0F2F6; display: block;"
  );
};

// ------------------------------------------------------------------------------
// This section contains functions you may want to customize for your own page.

// You'll want to replace these two functions with your own logic, to take what
// actions your application needs when a file transfer succeeds, or errors out.
async function onTransferSuccess() {
  isFileTransferInProgress = false;
  let checksumValue = await fileChecksumCharacteristic.readValue();
  let checksumArray = new Uint32Array(checksumValue.buffer);
  let checksum = checksumArray[0];
  msg("File transfer succeeded: Checksum 0x" + checksum.toString(16));
  eventHandler.dispatchEvent('completed');
}

// Called when something has gone wrong with a file transfer.
function onTransferError() {
  isFileTransferInProgress = false;
  msg("File transfer error");
  eventHandler.dispatchEvent('error', new Error('File transfer failed'));
}

// Called when an error message is received from the device. This describes what
// went wrong with the transfer in a user-readable form.
function onErrorMessageChanged(event) {
  let value = new Uint8Array(event.target.value.buffer);
  let utf8Decoder = new TextDecoder();
  let errorMessage = utf8Decoder.decode(value);
  console.log("Error message = " + errorMessage);
}

// ------------------------------------------------------------------------------
// This section has the public APIs for the transfer process, which you
// shouldn't need to modify but will have to call.

async function setupService(service) {

  msg("Getting characteristics ...");
  fileBlockCharacteristic = await service.getCharacteristic(FILE_BLOCK_UUID);
  fileLengthCharacteristic = await service.getCharacteristic(FILE_LENGTH_UUID);
  fileMaximumLengthCharacteristic = await service.getCharacteristic(
    FILE_MAXIMUM_LENGTH_UUID
  );
  fileChecksumCharacteristic = await service.getCharacteristic(
    FILE_CHECKSUM_UUID
  );
  commandCharacteristic = await service.getCharacteristic(COMMAND_UUID);
  transferStatusCharacteristic = await service.getCharacteristic(
    TRANSFER_STATUS_UUID
  );
  await transferStatusCharacteristic.startNotifications();
  transferStatusCharacteristic.addEventListener(
    "characteristicvaluechanged",
    onTransferStatusChanged
  );
  errorMessageCharacteristic = await service.getCharacteristic(
    ERROR_MESSAGE_UUID
  );
  await errorMessageCharacteristic.startNotifications();
  errorMessageCharacteristic.addEventListener(
    "characteristicvaluechanged",
    onErrorMessageChanged
  );

  isFileTransferInProgress = false;
  msg("Connected to device");
}

async function transferFile(fileContents) {
  let maximumLengthValue = await fileMaximumLengthCharacteristic.readValue();
  let maximumLengthArray = new Uint32Array(maximumLengthValue.buffer);
  let maximumLength = maximumLengthArray[0];
  if (fileContents.byteLength > maximumLength) {
    msg(
      "File length is too long: " +
        fileContents.byteLength +
        " bytes but maximum is " +
        maximumLength
    );
    return;
  }

  if (isFileTransferInProgress) {
    msg("Another file transfer is already in progress");
    return;
  }

  msg("Transfering file");
  console.log(fileContents);;
  
  let fileLengthArray = Int32Array.of(fileContents.byteLength);
  await fileLengthCharacteristic.writeValue(fileLengthArray);
  let fileChecksum = crc32(fileContents);
  let fileChecksumArray = Uint32Array.of(fileChecksum);
  await fileChecksumCharacteristic.writeValue(fileChecksumArray);

  let commandArray = Int32Array.of(1);
  await commandCharacteristic.writeValue(commandArray);

  return sendFileBlock(fileContents, 0);

}

async function cancelTransfer() {
  let commandArray = Int32Array.of(2);
  await commandCharacteristic.writeValue(commandArray);
}

// ------------------------------------------------------------------------------
// The rest of these functions are internal implementation details, and shouldn't
// be called by users of this module.

function onTransferInProgress() {
  isFileTransferInProgress = true;
}

function onTransferStatusChanged(event) {
  let value = new Uint32Array(event.target.value.buffer);
  let statusCode = value[0];
  if (statusCode === 0) {
    onTransferSuccess();
  } else if (statusCode === 1) {
    onTransferError();
  } else if (statusCode === 2) {
    onTransferInProgress();
  }
}

function prepareDummyFileContents(fileLength) {
  let result = new ArrayBuffer(fileLength);
  let bytes = new Uint8Array(result);
  const contentString = "The quick brown fox jumped over the lazy dog. ";
  for (var i = 0; i < bytes.length; ++i) {
    var contentIndex = i % contentString.length;
    bytes[i] = contentString.charCodeAt(contentIndex);
  }
  return result;
}

// See http://home.thep.lu.se/~bjorn/crc/ for more information on simple CRC32 calculations.
function crc32ForByte(r) {
  for (let j = 0; j < 8; ++j) {
    r = (r & 1 ? 0 : 0xedb88320) ^ (r >>> 1);
  }
  return r ^ 0xff000000;
}

function crc32(dataIterable) {
  const tableSize = 256;
  if (!window.crc32Table) {
    const crc32Table = new Uint32Array(tableSize);
    for (let i = 0; i < tableSize; ++i) {
      crc32Table[i] = crc32ForByte(i);
    }
    window.crc32Table = crc32Table;
  }
  let dataBytes = new Uint8Array(dataIterable);
  let crc = 0;
  for (let i = 0; i < dataBytes.byteLength; ++i) {
    const crcLowByte = crc & 0x000000ff;
    const dataByte = dataBytes[i];
    const tableIndex = crcLowByte ^ dataByte;
    // The last >>> is to convert this into an unsigned 32-bit integer.
    crc = (window.crc32Table[tableIndex] ^ (crc >>> 8)) >>> 0;
  }
  return crc;
}

// This is a small test function for the CRC32 implementation, not normally called but left in
// for debugging purposes. We know the expected CRC32 of [97, 98, 99, 100, 101] is 2240272485,
// or 0x8587d865, so if anything else is output we know there's an error in the implementation.
function testCrc32() {
  const testArray = [97, 98, 99, 100, 101];
  const testArrayCrc32 = crc32(testArray);
  console.log(
    "CRC32 for [97, 98, 99, 100, 101] is 0x" +
      testArrayCrc32.toString(16) +
      " (" +
      testArrayCrc32 +
      ")"
  );
}

async function sendFileBlock(fileContents, bytesAlreadySent) {
  let bytesRemaining = fileContents.byteLength - bytesAlreadySent;

  const maxBlockLength = 128;
  const blockLength = Math.min(bytesRemaining, maxBlockLength);
  var blockView = new Uint8Array(fileContents, bytesAlreadySent, blockLength);
  return fileBlockCharacteristic
    .writeValue(blockView)
    .then((_) => {
      bytesRemaining -= blockLength;
      if (bytesRemaining > 0 && isFileTransferInProgress) {
        msg("File block written - " + bytesRemaining + " bytes remaining");
        bytesAlreadySent += blockLength;
        eventHandler.dispatchEvent('progress', bytesAlreadySent / fileContents.byteLength);
        return sendFileBlock(fileContents, bytesAlreadySent);
      }
    })
    .catch((error) => {
      console.log(error);
      msg(
        "File block write error with " +
          bytesRemaining +
          " bytes remaining, see console"
      );
    });
}

export default {
  setupService,
  transferFile,
  cancelTransfer,
  addEventListener(...args){ eventHandler.addEventListener(...args); },
  removeEventListener(...args){ eventHandler.removeEventListener(...args) },
  dummTransfer() {
    msg("Trying to write dummy file ...");
    let fileContents = prepareDummyFileContents(30 * 1024);
    transferFile(fileContents);
  },
};
