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
  import Prompt from "@/components/general/prompts/Prompt.svelte";
  import { clearRecordings } from "@/stores/capture/actions";

  let isShowing = false;
  let onClose;

  export const show = (callback) => {
    isShowing = true;
    onClose = callback;
  };

  function handleClearRecordings() {
    isShowing = false;
    clearRecordings();
    onClose(true);
  }

  function dismiss() {
    isShowing = false;
    onClose(false);
  }
</script>

{#if isShowing}
  <Prompt>
    <div class="inner">
      <h1>Are you sure?</h1>
      <p class="instructions h2">
        Changing these settings will clear all recordings.
      </p>
      <div class="button-row">
        <button class="button primary" on:click={dismiss}
          >No, leave unchanged</button
        >
        <button class="button primary" on:click={handleClearRecordings}
          >Yes, change settings</button
        >
      </div>
    </div>
  </Prompt>
{/if}

<style lang="scss">
  h1 {
    margin-bottom: 15px;
    margin-top: 69px;
  }

  .button-row {
    display: flex;
    justify-content: center;
    margin-bottom: 73px;
    button {
      margin: 0 10px !important;
    }
  }
  .instructions {
    margin-bottom: 34px;
  }

  .inner {
    position: relative;
    text-align: center;
    z-index: 1;
    max-width: 800px - 60px;
    padding: 10px 84px;
    button {
      margin: 6px auto;
    }
  }

  footer {
    margin-top: 53px;
  }
</style>
