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
  import { onMount } from "svelte";
  import { get } from "svelte/store";

  import { setImuDataMode } from "../../stores/bleInterfaceStore/actions";

  import {
    captureDelay,
    captureSamples,
    captureThreshold,
    minMaxValues,
  } from "../../stores/captureSettings/store";

  import { imuVelocity } from "../../stores/bleInterfaceStore/store";

  import LinearProgress from "../general/LinearProgress.svelte";
  import SettingsInput from "./SettingsInput.svelte";
  import { hasRecordings } from "../../stores/capture/store";
  import { clearRecordings } from "../../stores/capture/actions";
  import ChangeAfterRecordPrompt from "./ChangeAfterRecordPrompt.svelte";

  let clearRecordPrompt;

  async function checkForRecordings(store, value) {
    if ($hasRecordings) {
      clearRecordPrompt.show((didClear) => {
        if (didClear) {
          store.set(value);
        } else {
          const prevValue = get(store);
          store.set(value);

          setTimeout(() => {
            store.set(prevValue);
          }, 10);
        }
      });
    } else {
      store.set(value);
    }
  }
  onMount(() => {
    setImuDataMode();
  });

  function handleCloseChangeAfterRecordPrompt(didClear) {}
</script>

<h1>Choose your capture settings.</h1>
<p class="subhead-1">
  Drag the sliders below to customize how your motion data will be captured.
</p>
{#if false}
  <div class="row">
    <button class="button primary">Auto Detect</button>
    <p>what is this?</p>
  </div>
{/if}

<div class="row settings">
  <div class="panel">
    <div>
      <h2 class="h2" for="capture-threshold">Capturing threshold</h2>
      <p>
        The minimum motion to start recording. Once motion above the threshold
        is detected, recording begins. The results are used by the model to
        approximate gestures.
      </p>
    </div>
    <div>
      <div class="form-container input-align-right">
        <SettingsInput
          name="capturing-threshold"
          value={$captureThreshold}
          label="Capture threshold"
          onChange={(value) => checkForRecordings(captureThreshold, value)}
          min={minMaxValues.captureThreshold[0]}
          max={minMaxValues.captureThreshold[1]}
          step={0.001}
        />
        <LinearProgress
          progress={$imuVelocity}
          color="secondary"
          buffer={0}
          noTransition={true}
          black={true}
        />
      </div>
    </div>
  </div>

  <div class="panel">
    <div>
      <h2 class="h2" for="number-of-samples">Number of samples</h2>
      <p>
        The recording happens at about 100 samples per second. Choosing a lower
        number of samples will speed up the process of capturing your motion
        data..
      </p>
    </div>
    <div>
      <div class="form-container input-align-right">
        <SettingsInput
          name="number-of-samples"
          value={$captureSamples}
          label="Number of samples to record"
          onChange={(value) => checkForRecordings(captureSamples, value)}
          min={minMaxValues.captureSamples[0]}
          max={minMaxValues.captureSamples[1]}
          step={1}
        />
      </div>
    </div>
  </div>

  <div class="panel">
    <div>
      <h2 class="h2" for="delay-between-captures">
        Delay between captures (seconds)
      </h2>
      <p>
        In seconds, provide how long to wait after one recording was made before
        allowing another. This is to prevent double triggering.
      </p>
    </div>
    <div>
      <div class="form-container input-align-right">
        <SettingsInput
          name="delay-between-captures"
          value={$captureDelay}
          label="Delay in seconds between captures"
          onChange={(value) => checkForRecordings(captureDelay, value)}
          min={minMaxValues.captureDelay[0]}
          max={minMaxValues.captureDelay[1]}
          step={0.001}
        />
      </div>
    </div>
  </div>
</div>

<ChangeAfterRecordPrompt
  onClose={handleCloseChangeAfterRecordPrompt}
  bind:this={clearRecordPrompt}
/>

<style lang="scss">
  .row {
    &.settings {
      flex-direction: column;
      align-items: flex-start;
    }
    button {
      margin-right: 15px;
    }
  }
  .panel {
    display: flex;
    justify-content: space-between;
    > div {
      margin: 0;
      &:first-child {
        width: 36%;
        margin-right: 24px;
      }
      &:last-child {
        width: 64%;
      }
    }
  }

  .form-container {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap-reverse;
  }
</style>
