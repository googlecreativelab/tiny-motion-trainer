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
  export let yLabels = ["0", "0.25", "0.50", "0.75", "1.00"];
  export let maxX = 100;
  export let data = [
    new Array(maxX).fill(0).map((_, i) => i / maxX),
    new Array(maxX).fill(0).map(() => Math.random()),
  ];

  const width = 500;
  const height = 300;

  const colors = ["#FF6F00", "#FFA800"];
  let xLabels = [];
  let xPadding = 30;
  let yPadding = 16;
  $: xLabelStepLen = width / xLabels.length;
  $: xStepLen = (width - xPadding * 2) / maxX;
  $: yStepLen = height / (yLabels.length - 1);

  function updateXLabels() {
    if (maxX <= 10) {
      xLabels = new Array(maxX)
        .fill(0)
        .map((_, i) => i + 1)
        .filter((i) => (i + 1) % 2);
    } else {
      xLabels = new Array(maxX)
        .fill(0)
        .map((_, i) => i + 1)
        .filter((i) => i % Math.floor(maxX / 5) === 0);
    }
    xLabelStepLen = width / xLabels.length;
  }

  $: updateXLabels(maxX);
  updateXLabels();
</script>

<div class="graph">
  <svg
    {width}
    {height}
    viewBox={`0 0 ${width} ${height}`}
    fill="#999"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
  >
    <text class="x-label notation-text" x={4} y={height - yPadding}>0</text>
    {#each xLabels as x, i}
      <line
        x1={(i + 1) * xLabelStepLen}
        y1={0}
        x2={(i + 1) * xLabelStepLen}
        y2={height}
        stroke="#E1E1E6"
        stroke-dasharray="3 3"
      />
      <text
        class="x-label notation-text"
        text-anchor="end"
        x={(i + 1) * xLabelStepLen - 8}
        y={294}>{x}</text
      >
    {/each}
    {#each yLabels as y, i}
      <line
        x1={width}
        y1={(i + 1) * yStepLen}
        y2={(i + 1) * yStepLen}
        stroke="#E1E1E6"
        stroke-dasharray="3 3"
      />
      <text
        class="y-label notation-text"
        x={4}
        y={height - (i - 0.2) * yStepLen}>{y}</text
      >
    {/each}
  </svg>

  <svg
    {width}
    {height}
    viewBox={`0 0 ${width} ${height}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
  >
    {#each data as data, j}
      {#each data as d, i}
        <circle
          cx={xPadding + (i + 0.75) * xStepLen}
          cy={height - 4 - (yPadding + d * (height - yPadding * 2))}
          r="4"
          stroke="none"
          fill={colors[j]}
        />
      {/each}
    {/each}
  </svg>
</div>

<style lang="scss">
  @import "@scss/vars";
  .graph {
    height: 0;
    width: 100%;
    padding-bottom: ((300/500) * 100%);
    position: relative;
    background-color: $color-bg-tertiary;
    svg,
    div {
      position: absolute;
    }

    .x-label {
      text-align: right;
    }
    svg {
      top: 0;
      left: 0;
      width: 100%;
      height: auto;

      border: 1px solid $color-bg-quaternary;
    }

    color: #999;
  }
</style>
