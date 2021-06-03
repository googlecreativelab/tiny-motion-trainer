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
  import { onMount } from "svelte";
  import { pushPropmt } from "../../stores/ui/actions";
  import { hasShownConnectPrompt } from "../../stores/ui/store";

  import DownloadButton from "./DownloadButton.svelte";
  import Header from "./Header.svelte";
  import SideNav from "./SideNav.svelte";

  onMount(() => {
    if (!$hasShownConnectPrompt) {
      pushPropmt("connect");
      $hasShownConnectPrompt = true;
    }
  });
</script>

<div class="main-container">
  <Header />

  <div class="container">
    <aside class="nav-container">
      <SideNav />
      <footer>
        <DownloadButton />
      </footer>
    </aside>

    <main aria-live="polite">
      <slot />
    </main>
  </div>
</div>

<style lang="scss">
  @import "@scss/vars";

  .main-container {
    display: flex;
    height: 100%;
    flex-direction: column;
    overflow: hidden;
  }

  .container {
    display: flex;
    overflow: hidden;
    flex: 1;
  }

  main {
    width: 100%;
    padding: 60px 24px;
    overflow: auto;
  }

  aside {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-top: 54px;
    background-color: $color-bg-tertiary;
    height: 100%;
    border-right: $border-width solid $color-fg-primary;
    width: 360px;
    min-width: 360px;

    footer {
      width: 100%;
      padding: 0 25px 24px 27px;
      z-index: 1; // hack to show button :before background
      :global(button) {
        width: 100%;
      }
    }
  }
</style>
