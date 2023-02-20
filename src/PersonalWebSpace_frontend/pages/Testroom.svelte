<script lang="ts">
  import { onMount } from "svelte";

  let spaceString;

  const addAFrameTestRoom = async () => {
    console.log('in Testroom addAFrameTestRoom');
    const resp = await fetch("testroom.html");
    //console.log('in index addAFrameTestRoom resp', resp);
    spaceString = await resp.text();
    //console.log('in index addAFrameTestRoom html', html);
    //document.write(html);
  };

  onMount(addAFrameTestRoom);
</script>

{#if spaceString}
  <div style="position: absolute; height: 100%; width: 100%;">
    {@html spaceString}
  </div>
{/if}
