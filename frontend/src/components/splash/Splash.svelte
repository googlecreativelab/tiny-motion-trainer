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
  import { Link, navigate } from "svelte-routing";
  import Logo from "@/components/general/Logo.svelte";
  import Title from "./Title.svelte";
  import { loadFile } from "../../stores/file/actions";
  import BgImage from "./BgImage.svelte";

  async function handleLoadFile() {
    await loadFile();
    navigate("settings", { replace: false });
  }
</script>

<div class="splash">
  <div class="container">
    <Logo />
    <h1><Title /></h1>
    <p class="h2">
      Capture motion data, train a model and upload it to your Arduino board
      powered by TensorFlow Lite for Microcontrollers.
    </p>
    <div class="row h-center">
      <Link to="settings"
        ><button class="button">Start new project</button></Link
      >
      <button class="button" on:click={handleLoadFile}
        >Load saved project</button
      >
    </div>
    <BgImage />
  </div>
</div>

<style lang="scss">
  @import "@scss/vars";

  .splash {
    background-color: $color-bg-secondary;

    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  h1 {
    margin: 24px 0 10px 0;
  }

  p.h2 {
    text-align: center;
    max-width: 895px;
    margin: 0 auto;
  }

  .row {
    margin: 28px 0;

    margin-bottom: 43px;
  }

  button {
    margin: 13px;
  }

  .container {
    text-align: center;
    padding-bottom: 0;
    margin-bottom: -136px;
  }
</style>
