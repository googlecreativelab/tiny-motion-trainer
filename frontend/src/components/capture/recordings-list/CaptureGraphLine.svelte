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
  export let data;
  export let index;
  export let color;
  function generatePath(data) {
    const stepSize = 100 / (data.length - 1);
    // data is in "column" format, so given the index, pick all
    // entries belonging to one sensor value series
    const steps = data.map((a) => a[index]);
    const path = steps
      .map((y, index) => {
        if (!isFinite(y)) {
          throw new Error("y not finite:" + y);
        }
        if (index === 0) return `M ${0},${y * 80}`;
        return `L ${index * stepSize}, ${y * 80}`;
      })
      .join("\n");

    return path;
  }
</script>

<svg
  width="100"
  height="200"
  viewBox="0 -100 100 200"
  preserveAspectRatio="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path fill="none" stroke={color} d={generatePath(data)} />
</svg>

<style lang="scss">
  svg {
    width: 100%;
    height: 100%;
  }
</style>
