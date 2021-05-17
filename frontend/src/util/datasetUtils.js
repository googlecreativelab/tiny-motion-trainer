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

const seedrandom = require("seedrandom");
const SEED = "Hello";

export function shuffleData(inputs, outputs) {
  const rand = seedrandom(SEED);

  const indexes = inputs.map((_, i) => i);
  indexes.sort(() => rand() - 0.5);

  const shuffledInputs = [];
  const shuffledOutputs = [];

  indexes.forEach((i, j) => {
    shuffledInputs[j] = inputs[i];
    shuffledOutputs[j] = outputs[i];
  });

  return [shuffledInputs, shuffledOutputs];
}

export function splitArray(data, fract) {
  const splitPoint = Math.round(data.length * fract);
  const a = data.slice(0, splitPoint);
  const b = data.slice(splitPoint, data.length);
  return [a, b];
}

export function shuffleAndSplitDataSet([X, Y], splitRatio = 0.8) {
  const [shuffled_X, shuffled_Y] = shuffleData(X, Y);
  const [train_X, test_X] = splitArray(shuffled_X, splitRatio);
  const [train_Y, test_Y] = splitArray(shuffled_Y, splitRatio);

  return [train_X, train_Y, test_X, test_Y];
}

export function rescale(minIn, maxIn, minOut, maxOut, [X, Y]) {
  const rescaledX = [];
  const a = minOut - minIn;
  const scaleRatio = (maxOut - minOut) / (maxIn - minIn);

  X.forEach((row) => {
    rescaledX.push(row.map((v) => (v + a) * scaleRatio));
  });
  return [rescaledX, Y];
}
