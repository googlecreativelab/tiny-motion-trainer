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

import { errorStack, promptStack } from "./store";

export function pushPropmt(name, priority = 0) {
  promptStack.update(($stack) => {
    const newStack = [...($stack || []), { name, priority }];
    newStack.sort((a, b) => a.priority - b.priority);
    return newStack;
  });
}

export function popPrompt() {
  promptStack.update(($stack) => {
    const newStack = $stack.slice(0, $stack.length - 1);
    if (newStack.length === 0) {
      return null;
    }
    return newStack;
  });
}

export function pushErrorMessage(msg) {
  errorStack.update(($errorStack) => {
    return [...$errorStack, msg];
  });
}

export function popErrorMessage() {
  errorStack.update(($errorStack) => {
    const newErrorStack = $errorStack.slice(0, $errorStack.length - 1);
    return newErrorStack;
  });
}
