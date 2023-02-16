<script lang="ts">
  import { onMount } from "svelte";

  const addAFrameTestRoom = async () => {
    console.log('in Testroom addAFrameTestRoom');
    const resp = await fetch("testroom.html");
    //console.log('in index addAFrameTestRoom resp', resp);
    const html = await resp.text();
    //console.log('in index addAFrameTestRoom html', html);
    document.write(html);
  };

  onMount(addAFrameTestRoom);
</script>
