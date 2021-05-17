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
  import { popPrompt } from "../../../stores/ui/actions";

  import Prompt from "./Prompt.svelte";
</script>

<Prompt>
  <div class="inner">
    <h1>Whooops!</h1>
    <p class="instructions h2">
      We ran out of memory and won't be able to recover your recordings between
      page reloads. Please make sure to save often.
    </p>
    <div class="button-row">
      <button class="button primary" on:click={popPrompt}>Ok, got it</button>
    </div>
  </div>
</Prompt>

<style lang="scss">
  h1 {
    margin-bottom: 15px;
    margin-top: 69px;
  }

  .button-row {
    display: flex;
    justify-content: center;
    margin-bottom: 73px;
    button {
      margin: 0 10px !important;
    }
  }
  .instructions {
    margin-bottom: 34px;
  }

  .inner {
    position: relative;
    text-align: center;
    z-index: 1;
    max-width: 800px;
    padding: 0 70px;
    button {
      margin: 6px auto;
    }
  }

  footer {
    margin-top: 53px;
  }
</style>
