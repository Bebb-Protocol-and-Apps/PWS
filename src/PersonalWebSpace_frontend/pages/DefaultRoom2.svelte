<script lang="ts">
  import { onMount } from "svelte";

  let spaceString;

  const addAFrameTestRoom = async () => {
    const resp = await fetch("defaultRoom_InternetIsland.html");
    spaceString = await resp.text();
  };

  onMount(addAFrameTestRoom);
</script>

{#if spaceString}
  <div style="position: absolute; height: 100%; width: 100%;">
    {@html spaceString}
  </div>
{/if}
