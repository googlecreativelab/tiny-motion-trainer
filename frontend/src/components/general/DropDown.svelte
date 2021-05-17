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

  export let options = [];
  export let selector;
  export let onSelect = () => {};

  let top = 0;
  let left = 0;
  let selectorEl;
  let el;

  function updatePosition() {
    const { width } = el.getBoundingClientRect();
    const targetRect = selectorEl.getBoundingClientRect();
    top = targetRect.top + 40;
    left = targetRect.left;
    if (left + width + 40 > window.innerWidth) {
      left -= width;
      left += targetRect.width;
    }
  }

  function handleSelect(value) {
    onSelect(value);
  }

  onMount(() => {
    selectorEl = document.querySelector(selector);
    if (!selectorEl) {
      throw new Error("No match for selector: " + selector);
    }

    window.addEventListener("resize", updatePosition, false);

    updatePosition();
    return () => {
      window.removeEventListener("resize", updatePosition, false);
    };
  });
</script>

<ul
  bind:this={el}
  class="drop-down-menu"
  style={`top: ${top}px; left: ${left}px`}
>
  {#each options as { label, value }}
    <li
      class="drop-down-menu-item"
      on:click|capture={() => handleSelect(value)}
    >
      <button>{@html label}</button>
    </li>
  {/each}
  <slot />
</ul>

<style lang="scss">
  @import "@scss/vars";

  ul {
    position: absolute;
    border: $border-width solid $color-fg-primary;
    background-color: $color-bg-primary;
    padding: 0 0;
    li {
      padding: 1em;
      border-top: 1px solid #e1e1e6;
      button {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
  }
</style>
