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
  import CaptureGraph from "./CaptureGraph.svelte";
  import padWithZeros from "@/util/padWithZeros";
  import { removeRecording } from "../../../stores/capture/actions";

  // recordings here is for one single label
  export let recordings;
  export let filter = null;
  export let labelIndex;
</script>

<!-- recordings might be undefined while deleting a label-->
{#if recordings}
  {#if recordings.length === 0}
    <div class="no-recordings subhead-2">
      <span>Record to populate</span>
    </div>
  {:else}
    {#each [...recordings].reverse() as data, index}
      <CaptureGraph
        {data}
        {filter}
        label={padWithZeros(
          recordings.length - index,
          Math.max(2, Math.floor(recordings.length / 100) + 1)
        )}
        onDelete={() =>
          removeRecording(labelIndex, recordings.length - 1 - index)}
      />
    {/each}
    {#each Array(Math.max(0, 3 - recordings.length)) as i}
      <div />
    {/each}
  {/if}
{/if}

<style lang="scss">
  @import "@scss/vars";

  .no-recordings {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dotted $color-bg-quaternary;
    width: 233px;
    height: 110px;
    color: $color-fg-secondary;
  }
</style>
