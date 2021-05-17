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
  import Textfield from "@smui/textfield/styled";
  export let value = "";
  export let label = "";
  export let onEnter = () => {};
  export let errorMessage = "";
</script>

<div>
  <Textfield
    type="text"
    variant="outlined"
    {label}
    bind:value
    on:keyup={(e) => {
      if (e.key === "Enter") {
        onEnter();
      }
    }}
  />
  {#if errorMessage}
    <p class="errorMessage notation-text">{errorMessage}</p>
  {/if}
</div>

<style lang="scss">
  div {
    position: relative;
  }
  .errorMessage {
    color: #999;
    position: absolute;
    bottom: -1.5rem;
  }
</style>
