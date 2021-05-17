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
  import { popPrompt } from "@/stores/ui/actions";

  export let allowClickDismiss = true;
  let promtContainer;

  function handleClickClose(e) {
    if (allowClickDismiss && e.target === promtContainer) {
      popPrompt();
    }
  }
</script>

<div
  class="prompt container"
  bind:this={promtContainer}
  on:click={handleClickClose}
>
  <div class="content"><slot /></div>
</div>

<style lang="scss">
  @import "@scss/vars";

  .prompt {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.75);
    display: flex;
    justify-content: center;
    z-index: 9;
    align-items: center;
    .content {
      padding: 31px;
      background: $color-bg-primary;
    }
  }
</style>
