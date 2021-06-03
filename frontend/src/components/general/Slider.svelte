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
  import Slider from "@smui/slider/styled";
  export let value = 0;
  export let min = 0;
  export let max = 100;
  export let step = 1;
  export let name;
  export let label = "";
  export let onChange = () => {};
</script>

<Slider
  bind:value
  {min}
  {max}
  {step}
  input$aria-label={label}
  input$name={name}
  on:MDCSlider:change={() => onChange(value)}
/>

<style lang="scss">
</style>
