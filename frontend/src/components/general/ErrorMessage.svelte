<script>
  import { popErrorMessage } from "../../stores/ui/actions";

  import { errorStack } from "../../stores/ui/store";
  import Icon from "./Icon.svelte";
</script>

{#if $errorStack.length}
  <div class="error-message">
    <p class="subhead-2">
      {$errorStack[$errorStack.length - 1]}
    </p>
    <button on:click={popErrorMessage}
      ><Icon icon="close_alert_24px.svg" /></button
    >
  </div>
{/if}

<style lang="scss">
  @import "@scss/vars";
  .error-message {
    position: fixed;
    z-index: 9999;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    color: $color-fg-primary;
    background: $color-bg-highlight;
    padding: 17px 23px;
    display: flex;
    align-items: center;
    text-align: center;
    button {
      margin: 0;
      padding: 0;
      margin-right: -2px;
      margin-left: 5px;
      :global(.icon) {
        margin: 0;
      }
    }
  }
</style>
