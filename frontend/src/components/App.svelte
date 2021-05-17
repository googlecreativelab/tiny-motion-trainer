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
  import { Router, Route } from "svelte-routing";
  import Capture from "./capture/Capture.svelte";
  import Main from "./main/Main.svelte";
  import Settings from "./settings/Settings.svelte";
  import Splash from "./splash/Splash.svelte";
  import Test from "./test/Test.svelte";
  import Train from "./train/Train.svelte";
  import UnsavedProjectPrompt from "./general/prompts/UnsavedProjectPrompt.svelte";
  import { promptStack } from "../stores/ui/store";
  import ConnectPrompt from "./general/prompts/ConnectPrompt.svelte";
  import { onMount } from "svelte";
  import { pushErrorMessage, pushPropmt } from "../stores/ui/actions";
  import persistStore, { dirty } from "../stores/utils/persistStore";
  import LocalStorageFullPrompt from "./general/prompts/LocalStorageFullPrompt.svelte";
  import MemoryTest from "./dev/MemoryTest.svelte";
  import DownloadModelPrompt from "./general/prompts/DownloadModelPrompt.svelte";
  import ErrorMessage from "./general/ErrorMessage.svelte";
  import LabelDeleteTest from "./dev/LabelDeleteTest.svelte";

  export let url = "";

  const basepath = BASE_PATH === "" ? "/" : BASE_PATH;

  onMount(() => {
    if ($dirty) {
      pushPropmt("unsaved_project", 1);
    }

    persistStore.onError((error) => {
      if (error.name === "LocalStorageError") {
        pushPropmt("localstorage_full");
      } else if (error.name === "DeserializeError") {
        pushErrorMessage(
          "Something went wrong. Please check the console for more details."
        );
      } else {
        pushErrorMessage(error.message);
      }
    });
  });
</script>

<Router {url} {basepath}>
  <main>
    <Route path="/"><Splash /></Route>
    <Route path="/settings"><Main><Settings /></Main></Route>
    <Route path="/capture"><Main><Capture /></Main></Route>
    <Route path="/train"><Main><Train /></Main></Route>
    <Route path="/test"><Main><Test /></Main></Route>
    <Route path="/mem-test"><Main><MemoryTest /></Main></Route>
    <Route path="/label-test"><Main><LabelDeleteTest /></Main></Route>
  </main>
</Router>

{#if $promptStack}
  {#if $promptStack[$promptStack.length - 1].name === "unsaved_project"}
    <UnsavedProjectPrompt />
  {:else if $promptStack[$promptStack.length - 1].name === "connect"}
    <ConnectPrompt />
  {:else if $promptStack[$promptStack.length - 1].name === "localstorage_full"}
    <LocalStorageFullPrompt />
  {:else if $promptStack[$promptStack.length - 1].name === "download_model"}
    <DownloadModelPrompt />
  {/if}
{/if}

<ErrorMessage />

<style lang="scss">
  main {
    height: 100vh;
  }
</style>
