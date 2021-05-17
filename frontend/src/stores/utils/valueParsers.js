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

export const clampValue = function (min, max) {
  return (value) => {
    if (isFinite(value)) {
      return Math.min(max, Math.max(min, value));
    } else {
      console.warn(`${value} is not finite`);
    }
  };
};

export const parseFloat32Array = function (arr) {
  if (!Array.isArray(arr) && typeof arr === "object" && arr[0] !== undefined) {
    const newArr = [];
    Object.keys(arr).forEach((k) => (newArr[k] = arr[k]));
    return new Float32Array(newArr);
  } else {
    arr = arr.map((v) => parseFloat32Array(v));
  }
  return arr;
};
