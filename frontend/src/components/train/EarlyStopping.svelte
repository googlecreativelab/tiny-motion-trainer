<script>
  import {
    trainEarlyStopping,
    trainEarlyStoppingMaxEpochsWithoutImprovement,
    trainEarlyStoppingMinAccuracy,
  } from "../../stores/train/store";
  import CheckboxInput from "../general/CheckboxInput.svelte";

  import NumberInput from "../general/NumberInput.svelte";
</script>

<CheckboxInput
  name="input_early_stopping"
  bind:value={$trainEarlyStopping}
/><label class="subhead-1" for="input_early_stopping">Use early stopping</label>

{#if $trainEarlyStopping}
  <div class="input-container">
    <NumberInput
      classStr="subhead-1"
      name="early_stopping_epochs"
      label="Number of epochs before stopping"
      bind:value={$trainEarlyStoppingMaxEpochsWithoutImprovement}
      min={1}
    /><label class="subhead-1" for="early_stopping_epochs"> Epochs</label>
    <span class="helper-text notation-text">Max without progress</span>
  </div>
  <div class="input-container">
    <NumberInput
      classStr="subhead-1"
      name="early_stopping_min_acc"
      label="Early stopping (epochs)"
      bind:value={$trainEarlyStoppingMinAccuracy}
      min={1}
      max={100}
    /><label class="subhead-1" for="early_stopping_min_acc"> %</label>
    <span class="helper-text notation-text">At min accuracy</span>
  </div>
{/if}

<style lang="scss">
  label {
    margin-right: 40px;
  }

  .input-container {
    position: relative;
  }
  .helper-text {
    position: absolute;
    left: 0;
    bottom: -1.24rem;
  }
</style>
