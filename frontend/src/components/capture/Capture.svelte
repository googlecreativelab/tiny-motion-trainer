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
  import { addLabel } from "../../stores/capture/actions";
  import { labels } from "../../stores/capture/store";
  import { trainIsUnlocked } from "../../stores/train/store";
  import TextInput from "../general/TextInput.svelte";
  import CaptureList from "./CaptureList";

  let newLabelName = "";
  let newLabelError = null;

  $: if ($labels.includes(newLabelName)) {
    newLabelError = "Label must be unique";
  } else {
    newLabelError = "";
  }

  function handleAddLabel() {
    newLabelError = null;
    if (newLabelName.length > 0) {
      try {
        addLabel(newLabelName);
        newLabelName = "";
      } catch (e) {
        newLabelError = e.toString();
      }
    }
  }
</script>

<h1>Capture your data</h1>
<p class="subhead-1">
  Create a new label to record data for each gesture. A minimum of two gestures
  and three samples of each gesture is required to train your model, though we
  recommend recording at least 20 samples for better results. Choosing a lower
  number of samples in settings will speed up this process
</p>

<div class="row capture_svelte_input_row">
  <TextInput
    label="Add unique label"
    bind:value={newLabelName}
    onEnter={handleAddLabel}
    errorMessage={newLabelError}
  />
  <button
    class="button primary"
    disabled={newLabelName.length === 0 || newLabelError}
    on:click={handleAddLabel}>Create new</button
  >
</div>

<CaptureList />

<!-- {#if !$trainIsUnlocked}
  <div class="row warning notation-text">
    * We need at least 2 labels and 3 recordings for each. Recommended is at
    least 2- recordings for each label.
  </div>
{/if} -->
<style lang="scss">
  .row {
    button {
      margin-left: 1rem;
    }
  }
</style>
