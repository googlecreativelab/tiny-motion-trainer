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
  import { imuDataColors } from "@/stores/ui/store";
  import { armedLabelIndex, labels, recordings } from "@/stores/capture/store";
  import { captureImuLabels } from "@/stores/captureSettings/store";

  import Icon from "../general/Icon.svelte";
  import CaptureListLabelItem from "./CaptureListLabelItem.svelte";
  import CaptureListRecordings from "./recordings-list/CaptureListRecordings.svelte";
  import { downloadCsvForAllLabels } from "../../stores/aggregatedActions";
  import { hasRecordings } from "../../stores/capture/store";

  let showFilter = false;
  let filter = null;
  let hoverFilter = null;

  $: if ($captureImuLabels) {
    filter = new Array($captureImuLabels.length).fill(1);
  }

  function handleToggleFilter() {
    showFilter = !showFilter;
  }

  function handleToggleFilterIndex(labelIndex) {
    filter[labelIndex] = !filter[labelIndex];
  }

  function handleFilterHover(labelIndex) {
    if (filter && labelIndex > -1) {
      hoverFilter = new Array(filter.length).fill(0);
      hoverFilter[labelIndex] = 1;
    } else {
      hoverFilter = null;
    }
  }
</script>

<div class="capture-list">
  <div class="labels">
    {#if $hasRecordings}
      <button class="small subhead-2" on:click={downloadCsvForAllLabels}
        ><Icon icon="download_18px.svg" />Download All CSVs</button
      >
    {/if}
    <ul>
      {#each $labels as label, labelIndex}
        <CaptureListLabelItem
          {labelIndex}
          active={labelIndex === $armedLabelIndex}
          onSelect={() => ($armedLabelIndex = labelIndex)}
        />
      {/each}
    </ul>
  </div>
  <div class="recordings">
    {#if $hasRecordings}
      <div class="filter-section">
        <button class="small subhead-2" on:click={handleToggleFilter}
          ><Icon icon="filter_18px.svg" />Filter</button
        >
        {#if showFilter}
          <div>
            {#each $captureImuLabels as label, index}
              <button
                on:mouseenter={() => handleFilterHover(index)}
                on:mouseout={() => handleFilterHover(-1)}
                on:click={() => handleToggleFilterIndex(index)}
                class="filter-item"
                style={`color: ${
                  filter && !filter[index] ? "#999" : $imuDataColors[index]
                }`}>{label}</button
              >
            {/each}
          </div>
        {/if}
      </div>
    {/if}
    <div class="recordings-list">
      {#if $armedLabelIndex > -1}
        <CaptureListRecordings
          recordings={$recordings[$armedLabelIndex]}
          filter={hoverFilter || filter}
          labelIndex={$armedLabelIndex}
        />
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  .capture-list {
    button {
      margin-bottom: 10px;
    }
    display: flex;
    flex-direction: row;
    width: 100%;
    .labels {
      width: 289px;
      min-width: 289px;
      ul {
        width: 100%;
      }
    }
  }

  .filter-section {
    display: flex;
    justify-content: space-between;
  }
  .recordings-list {
    margin: -5px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    :global(> div) {
      margin: 5px;
      height: 110px;
    }
  }
  .recordings {
    margin-left: 24px;
    width: 100%;
  }
</style>
