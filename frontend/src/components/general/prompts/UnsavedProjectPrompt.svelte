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
  import { navigate } from "svelte-routing";
  import { clearPersistantStorage } from "@/stores/aggregatedActions";
  import Prompt from "./Prompt.svelte";
  import { popPrompt } from "@/stores/ui/actions";
  import { loadFile } from "@/stores/file/actions";

  async function handleStartNew() {
    clearPersistantStorage();
    popPrompt();
    navigate("settings", { replace: true });
  }

  function navigateFromSplash() {
    if (location.pathname === BASE_PATH + "/") {
      navigate(BASE_PATH + "/settings");
    }
  }

  function handleResume() {
    popPrompt();
    navigateFromSplash();
  }

  async function handleLoadProject() {
    await loadFile();
    popPrompt();
    navigateFromSplash();
  }
</script>

<Prompt>
  <div class="inner">
    <h1>Load unsaved project?</h1>
    <p class="instructions h2">
      You have unsaved data from your last session.<br />Do you want to recover
      it?
    </p>
    <div class="row">
      <button class="button primary" on:click={handleStartNew} tabindex="1"
        >No, start a new project</button
      >
      <button class="button primary" on:click={handleResume} tabindex="2"
        >Yes, load my unsaved data.</button
      >
    </div>
    <button on:click={handleLoadProject} class="notation-text" tabindex="3"
      >Or, load a saved project</button
    >
  </div>
</Prompt>

<style lang="scss">
  h1 {
    margin-bottom: 15px;
  }

  .instructions {
    margin-bottom: 34px;
  }

  .inner {
    position: relative;
    text-align: center;
    z-index: 1;
    max-width: 593px;
    margin: 64px 130px;
    button {
      margin: 6px auto;
    }
    .row {
      justify-content: center;
      margin: 32px 0 10px 0;
      button {
        margin: 0 10px;
      }
    }
  }

  footer {
    margin-top: 53px;
  }
</style>
