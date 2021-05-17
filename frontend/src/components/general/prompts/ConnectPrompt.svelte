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
  import { connect } from "@/stores/bleInterfaceStore/actions";
  import Icon from "../Icon.svelte";
  import Prompt from "./Prompt.svelte";
  import { popPrompt } from "@/stores/ui/actions";
  import { sketchFileUrl } from "../../../stores/ui/store";

  async function handleConnect() {
    await connect();
    popPrompt();
  }
</script>

<Prompt>
  <div class="inner">
    <h1>Download and connect</h1>
    <p class="instructions h2">
      Download and run the <a
        href={$sketchFileUrl}
        target="_blank"
        class="underline">latest version</a
      > of our Arduino sketch. Then connect your device via Bluetooth
    </p>
    <button class="button primary icon-button" on:click={handleConnect}
      ><Icon icon="bluetooth_24px.svg" /> Connect</button
    >
    <button on:click={popPrompt} class="notation-text"
      >Or, proceed without connecting</button
    >
    <footer class="notation-text">
      Sparkfun custom TensorFlow Lite for Microcontroller Kit are already
      pre-flashed with a compatible sketch. If you're having trouble connecting,
      press the Arduino button once to soft reset.
    </footer>
  </div>
</Prompt>

<style lang="scss">
  h1 {
    margin-bottom: 15px;
    margin-top: 69px;
  }

  .instructions {
    margin-bottom: 34px;
  }

  .inner {
    position: relative;
    text-align: center;
    z-index: 1;
    max-width: 593px;
    margin: 0 (103px - 30px);
    button {
      margin: 6px auto;
    }
  }

  footer {
    margin-top: 53px;
  }
</style>
