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
  import Prompt from "./Prompt.svelte";
  import CheckboxInput from "../CheckboxInput.svelte";
  import Icon from "../Icon.svelte";
  import {
    downloadTfJSModel,
    downloadTrainedModel,
  } from "../../../stores/aggregatedActions";

  let downloadOption = "arduino"; // || 'tfjs'
  let quantize = false;
  let isProcessing = false;

  function toggleArduinoSketch() {
    if (downloadOption === "arduino") {
      downloadOption = "tfjs";
    } else {
      downloadOption = "arduino";
    }
  }

  function toggleTFJSSketch() {
    if (downloadOption === "tfjs") {
      downloadOption = "arduino";
    } else {
      downloadOption = "tfjs";
    }
  }

  async function handleDownload() {
    switch (downloadOption) {
      case "arduino":
        isProcessing = true;
        await downloadTrainedModel(quantize);
        isProcessing = false;
        break;
      case "tfjs":
        await downloadTfJSModel();
        break;
      default:
        throw new Error("Unknown download option");
    }
  }
</script>

<Prompt>
  <div class="inner">
    <h1>Select files to download</h1>
    <p class="instructions h2 row">
      <label for="model_and_example" on:click={toggleArduinoSketch}
        ><CheckboxInput
          name="model_and_example"
          value={downloadOption === "arduino"}
        /><span> Arduino model and example</span></label
      >
      <label for="model_and_example" on:click={toggleTFJSSketch}
        ><CheckboxInput
          name="model_and_example"
          value={downloadOption === "tfjs"}
        /><span> TFJS Model</span></label
      >
    </p>
    <div class="button-row">
      <button
        class="button primary icon-button"
        on:click={handleDownload}
        disabled={isProcessing}
      >
        <Icon icon="download_24px.svg" />
        {#if !isProcessing}
          Download
        {:else}
          Processing...
        {/if}
      </button>

      <label class="quantize" for="model_and_example"
        ><CheckboxInput
          name="model_and_example"
          bind:value={quantize}
          disabled={downloadOption !== "arduino"}
        /><span> Quantize</span></label
      >
    </div>
  </div>
</Prompt>

<style lang="scss">
  h1 {
    margin-bottom: 15px;
    margin-top: 64px;
  }

  .quantize {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    label {
      margin-right: 11px;
    }
  }

  .button-row {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-bottom: 35px;
    button {
      margin: 0 10px 10px 10px !important;
    }
  }
  .instructions {
    margin-bottom: 41px;
    margin-top: 34px;
    margin-right: 11px;

    label {
      display: flex;
      align-items: center;
      &:first-child {
        margin-right: 36px;
      }
    }
  }

  .inner {
    position: relative;
    text-align: center;
    z-index: 1;
    max-width: 800px;
    padding: 0 113px;
    button {
      margin: 6px auto;
    }
  }
</style>
