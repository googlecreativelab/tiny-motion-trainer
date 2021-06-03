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
  import { loadCsvFileToLabel } from "../../stores/aggregatedActions";

  import {
    beginRecording,
    endRecording,
    removeLabelByName,
  } from "../../stores/capture/actions";
  import { captureState, labels } from "../../stores/capture/store";
  import { captureDelayTimeout } from "../../stores/capture/store";

  import Icon from "../general/Icon.svelte";

  export let labelIndex;
  export let active = false;
  export let onSelect = () => {};

  $: label = $labels[labelIndex];

  function handleRemoveLabel() {
    removeLabelByName(label);
  }

  function handleToggleRecording() {
    if ($captureState === "idle") {
      beginRecording();
    } else {
      endRecording();
    }
  }
</script>

<li class:active>
  <button
    class="select-label-button"
    on:click={onSelect}
    aria-label="Select label"
    aria-pressed={active}
  />

  <div class="row firs-row">
    <span class="label subhead-1">{label}</span><button
      class="remove-button"
      aria-label="Delete label"
      disabled={!active}
      aria-pressed="undefined"
      on:click={handleRemoveLabel}
      ><span class="icon"><Icon icon="close_24px.svg" /></span></button
    >
  </div>
  {#if active}
    <div class="row">
      <div class="rec-button-container">
        <button
          class="button primary small rec-button"
          on:click={handleToggleRecording}
          disabled={!active}
          aria-pressed={$captureState !== "idle"}
          ><span
            class="dot"
            class:idle={$captureState === "idle"}
            class:waiting={$captureState === "waiting"}
            class:recording={$captureState === "recording"}
            class:armed={$captureState === "armed"}
          />
          {#if $captureState === "idle"}
            Start recording
          {:else}
            Stop recording
          {/if}
        </button>
        {#if ["recording", "armed", "waiting"].includes($captureState)}
          <p
            class="notation-text helper-text"
            class:idle={$captureState === "idle"}
            class:waiting={$captureState === "waiting"}
            class:recording={$captureState === "recording"}
            class:armed={$captureState === "armed"}
          >
            {#if $captureState === "recording"}
              Recording...
            {:else if $captureState === "armed"}
              Detecting motion...
            {:else if $captureState === "waiting"}
              {`Capture completed. Waiting ${$captureDelayTimeout.toFixed(
                2
              )}s...`}
            {/if}
          </p>
        {/if}
      </div>
      <button
        class="notation-text csv-button"
        disabled={!active}
        on:click={() => loadCsvFileToLabel(labelIndex)}>Upload CSV</button
      >
    </div>
  {/if}
</li>

<style lang="scss">
  @import "@scss/vars";

  @keyframes blink-animation {
    to {
      visibility: hidden;
    }
  }

  @mixin state-colors($property) {
    &.idle {
      #{$property}: #999;
    }

    &.recording,
    &.armed {
      #{$property}: #34a853;
    }

    &.waiting {
      #{$property}: #ea4335;
    }
  }

  li {
    height: 60px;
    width: 100%;
    margin: 0 0 10px 0;
    display: flex;
    flex-direction: column;
    padding: 18px 24px;
    position: relative;

    .select-label-button {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .remove-button,
    .csv-button,
    .rec-button {
      margin-right: 5px;
    }

    .remove-button {
      padding: 0;
      margin: 0;
      :global(.icon) {
        padding: 0;
        margin: 0;
      }
    }

    .rec-button-container {
      position: relative;

      .helper-text {
        position: absolute;
        bottom: -22px;
        left: 0;
        white-space: nowrap;

        @include state-colors(color);
      }
    }
    .dot {
      @include state-colors(background-color);

      &.armed {
        animation: blink-animation 0.2s steps(5, start) infinite;
      }
    }

    .row {
      margin: 0 0 10px 0;
      align-items: flex-start;
    }

    > .firs-row {
      display: flex;

      width: 100%;
      justify-content: space-between;
      align-items: center;
    }

    .icon {
      opacity: 0;
      display: none;
    }
    &.active {
      height: 132px;
    }
    &.active,
    &:hover {
      background-color: $color-bg-tertiary;
      .icon {
        opacity: 1;
        display: block;
      }
    }
  }
</style>
