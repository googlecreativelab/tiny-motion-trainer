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
  import LinearProgress from "@smui/linear-progress/styled";
  export let progress = 0;
  export let color = "primary";
  export let buffer = 0;
  export let noTransition = false;
  export let black = false;
  const classNames = [];

  if (noTransition) {
    classNames.push("no-transition");
  }

  if (black) {
    classNames.push("mdc-linear-progress-black");
  }
</script>

<LinearProgress {progress} {color} {buffer} class={classNames.join(" ")} />

<style lang="scss">
</style>
