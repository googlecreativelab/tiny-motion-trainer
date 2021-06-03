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
  import NumberInput from "../general/NumberInput.svelte";
  import Slider from "../general/Slider.svelte";

  export let value = 0;
  export let min = 0;
  export let max = 999999;
  export let step = 1;
  export let name = "";
  export let label = "";
  export let onChange = () => {};

  let _internalValue = min;

  function safeSetValue(value) {
    if (!Number.isInteger(value * (1 / step))) {
      _internalValue = Math.round(value / step) * step;
    }
  }
  // fix for MDCSliderFoundation: Slider value must be valid based on the step value error.
  $: safeSetValue(_internalValue);
  $: safeSetValue(value);
  $: _internalValue = value;

  safeSetValue(value);
</script>

<NumberInput bind:value={_internalValue} {onChange} {min} {max} {label} />
<Slider
  {name}
  bind:value={_internalValue}
  {min}
  {max}
  {step}
  {onChange}
  {label}
/>
