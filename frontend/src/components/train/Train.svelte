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
  import { navigate } from "svelte-routing";
  import NumberInput from "../general/NumberInput.svelte";
  import { beginTraining, stopTraining } from "../../stores/train/actions";
  import GraphContainer from "./GraphContainer.svelte";
  import {
    trainEpochs,
    trainingState,
    trainIsUnlocked,
    trainLogAccuracy,
    trainLogLoss,
  } from "../../stores/train/store";
  import { isFullyLoaded } from "../../stores/ui/store";
  import EarlyStopping from "./EarlyStopping.svelte";

  $: if ($isFullyLoaded) {
    if (!$trainIsUnlocked) {
      navigate(BASE_PATH, { replace: true });
    }
  }
</script>

<h1>Train your model</h1>
<p class="subhead-1">
  When the model stops improving, you're done and can stop training. If you have
  trouble getting a high accuracy, record more unique motion data.
</p>

<div class="row">
  <div class="column">
    <NumberInput
      name="input_epochs"
      classStr="subhead-1"
      bind:value={$trainEpochs}
      min={1}
    /><label class="subhead-1" for="input_epochs">Epochs</label>
  </div>
  <div class="column">
    <EarlyStopping />
  </div>
</div>

<div class="row">
  {#if $trainingState === "idle"}
    <button class="button primary" on:click={beginTraining}
      >Start training</button
    >
  {:else if $trainingState === "training"}
    <button class="button primary" on:click={stopTraining}>Stop training</button
    >
  {:else if $trainingState === "stop_queued"}
    <button class="button primary" disabled>Stopping...</button>
  {/if}

  {#if $trainingState !== "idle"}
    <p class="train-alert">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M8.27 3H15.73L21 8.27V15.73L15.73 21H8.27L3 15.73V8.27L8.27 3ZM14.9 19L19 14.9V9.1L14.9 5H9.1L5 9.1V14.9L9.1 19H14.9ZM12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15C11.4477 15 11 15.4477 11 16C11 16.5523 11.4477 17 12 17ZM13 7H11V14H13V7Z"
          fill="#ff6f00"
        />
      </svg>
      This tab needs to remain open while training is in progress.
    </p>
  {/if}
</div>

<div class="row">
  <GraphContainer
    title="Accuracy"
    label1="Train accuracy"
    label2="Validation accuracy"
    decimals={2}
    maxX={$trainEpochs}
    data={[$trainLogAccuracy.train, $trainLogAccuracy.validation]}
  />
  <GraphContainer
    title="Loss"
    label1="Train loss"
    label2="Validation loss"
    decimals={4}
    maxX={$trainEpochs}
    data={[$trainLogLoss.train, $trainLogLoss.validation]}
  />
</div>

<style lang="scss">
  @import "@scss/vars";
  label {
    margin-right: 40px;
  }

  .train-alert {
    margin-left: 35px;
    color: $color-bg-highlight;
    svg {
      vertical-align: middle;
    }
  }
</style>
