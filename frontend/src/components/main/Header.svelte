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
  import Logo from "@/components/general/Logo";
  import { onMount } from "svelte";
  import { connect, disconnect } from "@/stores/bleInterfaceStore/actions";
  import { isConnected } from "@/stores/bleInterfaceStore/store";
  import DropDown from "../general/DropDown.svelte";
  import ClearAllPrompt from "../general/prompts/ClearAllPrompt";
  import { saveFile, loadFile, saveFileAs } from "../../stores/file/actions";
  import { sketchFileUrl } from "../../stores/ui/store";

  let dropDownVisible;
  let showClearAllPrompt = false;

  function handleSaveSelect(value) {
    switch (value) {
      case "save":
        saveFile();
        break;

      case "save-as":
        saveFileAs();
        break;
    }
    dropDownVisible = null;
  }

  function handleDocumentClick(e) {
    // always close menus when user clicks anywhere except on the drop-down items
    let target = e.target;
    while (target && target !== document) {
      if (target.classList.contains("drop-down-menu-item")) {
        return;
      }
      target = target.parentNode;
    }
    dropDownVisible = null;
  }

  function handleDeviceSelect(value) {
    switch (value) {
      case "connect":
        connect();
        break;

      case "disconnect":
        disconnect();
        break;

      case "download":
        window.open($sketchFileUrl);
        break;
    }
    dropDownVisible = null;
  }

  function showDropDown(dropDownName) {
    dropDownVisible = dropDownName;
  }

  function handleLoad() {
    loadFile();
  }

  onMount(() => {
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      document.addEventListener("click", handleDocumentClick, true);
    };
  });
</script>

<header>
  <div class="branding">
    <Logo height={52} />
    <h1>Tiny Motion Trainer</h1>
  </div>
  <div class="menu subhead-1">
    <ul>
      <li>
        <button class="menu-item-save" on:click={() => showDropDown("save")}
          >Save</button
        >
        {#if dropDownVisible === "save"}
          <DropDown
            options={[
              { label: "Save Project", value: "save" },
              { label: "Save Project As...", value: "save-as" },
            ]}
            onSelect={handleSaveSelect}
            selector=".menu-item-save"
          />
        {/if}
      </li>
      <li><button on:click={handleLoad}>Load</button></li>
      <li>
        <button on:click={() => (showClearAllPrompt = true)}>Start Over</button>

        {#if showClearAllPrompt}
          <ClearAllPrompt onClose={() => (showClearAllPrompt = false)} />
        {/if}
      </li>
      <li>
        <button
          class="menu-item-device"
          on:click={() => showDropDown("settings")}>Device</button
        >

        {#if dropDownVisible === "settings"}
          <DropDown
            options={[
              {
                label: $isConnected
                  ? `Disconnect Bluetooth <span class="dot green"/>`
                  : `Connect Bluetooth <span class="dot red"/>`,
                value: $isConnected ? "disconnect" : "connect",
              },
              { label: "Download Arduino sketch", value: "download" },
            ]}
            onSelect={handleDeviceSelect}
            selector=".menu-item-device"
          />
        {/if}
      </li>
    </ul>
  </div>
</header>

<style lang="scss">
  @import "@scss/vars";
  header {
    width: 100%;
    background-color: $color-bg-secondary;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 17px;
    border-bottom: $border-width solid black;
    .branding {
      display: flex;

      h1 {
        margin: 7px 11px auto 11px;
        font-size: 33.3px;
      }
    }
    ul {
      margin-top: 4px;
    }
    li {
      display: inline-block;
      margin: 0 17px 0 0;
      button:active,
      button:focus {
        color: #fff;
      }
    }
  }
</style>
