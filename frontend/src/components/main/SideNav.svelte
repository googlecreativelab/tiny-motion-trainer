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
  import { Link } from "svelte-routing";
  import { testIsUnlocked } from "../../stores/test/store";
  import { trainIsUnlocked } from "../../stores/train/store";
  import Icon from "../general/Icon.svelte";
</script>

<nav>
  <ul>
    <li
      class="h2 menu-item"
      class:active={location.pathname.includes(BASE_PATH + "/settings")}
    >
      <Link to="settings">
        <span class="icon"><Icon icon="settings_24px.svg" /></span>Choose your
        settings
      </Link>
    </li>
    <li
      class="h2 menu-item"
      class:active={location.pathname.includes(BASE_PATH + "/capture")}
    >
      <Link to="capture">
        <span class="icon"><Icon icon="capture_24px.svg" /></span>Capture your
        data
      </Link>
    </li>
    <li
      class="h2 menu-item"
      class:active={location.pathname.includes(BASE_PATH + "/train")}
      class:disabled={!$trainIsUnlocked}
      aria-disabled={!$trainIsUnlocked}
    >
      <Link to="train">
        <span class="icon"><Icon icon="train_24px.svg" /></span>Train your model
      </Link>
    </li>
    <li
      class="h2 menu-item"
      class:active={location.pathname.includes(BASE_PATH + "/test")}
      class:disabled={!$testIsUnlocked}
      aria-disabled={!$testIsUnlocked}
    >
      <Link to="test">
        <span class="icon"><Icon icon="test_24px.svg" /></span>Test your model
      </Link>
    </li>
  </ul>
</nav>

<style lang="scss">
  @import "@scss/vars";

  .menu-item {
    width: 100%;
    padding: 1rem 0 1rem 27px;
    display: flex;
    align-items: center;

    &:hover {
      :global(a) {
        opacity: 0.5;
      }
    }

    &.disabled {
      opacity: 0.25;
      pointer-events: none;
    }
    .icon {
      display: block;
      margin-right: 1rem;
    }

    :global(a) {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: inherit;
    }
    &.active {
      border-top: $border-width solid $color-fg-primary;
      border-bottom: $border-width solid $color-fg-primary;
      background-color: $color-bg-highlight;
      padding: (14.5px - $border-width) 0 (14.5px - $border-width) 27px;
    }
  }
</style>
