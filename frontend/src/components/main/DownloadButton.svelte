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
  import { trainedModel } from "../../stores/train/store";
  import { pushPropmt } from "../../stores/ui/actions";
  import Icon from "../general/Icon.svelte";
</script>

<button
  disabled={!$trainedModel}
  class="download-button button primary"
  on:click={() => pushPropmt("download_model")}
  ><Icon icon="download_24px.svg" />
  Download your model
</button>

<style lang="scss">
  @import "@scss/vars";
  .download-button {
    &:before {
      background: $color-bg-quaternary;
    }
  }
</style>
