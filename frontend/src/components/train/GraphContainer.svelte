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
  import Graph from "./Graph.svelte";

  export let title;
  export let label1;
  export let label2;
  export let data;
  export let maxX;
  export let decimals = 3;
  $: lastValues = data.map((a) => a[a.length - 1] || 0);
</script>

<div class="graph-container">
  <h2>{title}</h2>
  <span class="label notation-text">value</span>
  <Graph {data} {maxX} />
  <span class="label notation-text">epoch</span>
  <div>
    <span class="subhead-2"
      ><span class="dot" style="background-color: #FF6F00" />{label1}
      {(lastValues[0] * 100).toFixed(decimals)}%</span
    >
    <span class="subhead-2"
      ><span class="dot" style="background-color: #FFA800" />{label2}: {(
        lastValues[1] * 100
      ).toFixed(decimals)}%</span
    >
  </div>
</div>

<style lang="scss">
  @import "@scss/vars";

  .graph-container {
    width: 504px;
    height: 301px;

    h2 {
      text-align: center;
    }

    .dot {
      width: 8px;
      height: 8px;
      display: inline-block;
      margin-right: 5px;
      border-radius: 50%;
    }
    .subhead-2 {
      margin-right: 20px;
    }
    &:first-child {
      margin-right: 10px;
    }

    .label {
      color: #999;
    }
  }
</style>
