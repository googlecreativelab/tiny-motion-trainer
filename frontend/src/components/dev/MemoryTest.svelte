<!--
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

/**
* @author Rikard Lindstrom <rlindstrom@google.com>
*/
-->
<script>
  import { clearPersistantStorage } from "../../stores/aggregatedActions";

  import { addLabel, addRecording } from "../../stores/capture/actions";
  import persistStore from "../../stores/utils/persistStore";

  function handleMemTest() {
    localStorage.clear();
    clearPersistantStorage();
    addLabel("test-label");
    //localStorage.removeItem('test');
    // fill storage
    var i = 0;
    try {
      for (i = 250; i <= 10000; i += 250) {
        localStorage.setItem("test", new Array(i * 1024 + 1).join("@"));
      }
    } catch (e) {
      try {
        for (i = 250; i <= 100000; i += 250) {
          localStorage.setItem("test2", new Array(i * 64 + 1).join("@"));
        }
      } catch {
        console.log("localstorage full");
      }
    }

    // try pushing some recordings
    for (let i = 0; i < 200; i++) {
      addRecording(0, [
        new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]),
        new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]),
        new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]),
        new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]),
      ]);
    }
  }
</script>

<h2>
  Clicking this button will fill local storage with gargabe and then try to push
  some recordings. It should bring up a prompt and then disable storing
  recordings (so subsequent tests will not trigger a prompt until reload)
</h2>
<div class="row">
  <button class="primary button" on:click={handleMemTest}>Memory test</button>
</div>
<div class="row">
  <button class="primary button" on:click={() => localStorage.clear()}
    >Clear local storage</button
  >
</div>
