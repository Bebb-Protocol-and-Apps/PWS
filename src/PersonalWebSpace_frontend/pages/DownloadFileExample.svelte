<script lang="ts">
  import { onMount } from "svelte";
  import { store } from "../store";
  var files = [];

  let spaceString;

  const addAFrameTestRoom = async () => {
    const resp = await fetch("DownloadFileExample.html");
    spaceString = await resp.text();
    console.log("hi");

    // Assuming you have a canister object with a method `storeFile`
    try {
      console.log("calling api");
      let fileIdsResponse = await $store.backendActor.listUserFileIds();
      let fileIds = fileIdsResponse.Ok.FileIds;
      console.log("Number of FileIds found: " + fileIds.length);
      for (let i = 0; i < fileIds.length; i++)
      {
        let fileData = await $store.backendActor.getFile(fileIds[i]);

        // Assuming you have a Uint8Array named `byteArray`
        const byteArray = new Uint8Array(fileData.Ok.File.file_content);

        // Step 1: Convert the Uint8Array to a Blob
        const blob = new Blob([byteArray], { type: "application/octet-stream" });

        // Step 2: Create a URL and pass it to the entities
        const url = URL.createObjectURL(blob);
        if (i == 0)
        {
          const assetItem = document.getElementById('item2');
          assetItem.setAttribute('gltf-model',`url(${url})`);
        } else {
          const assetItem = document.getElementById('item3');
          assetItem.setAttribute('gltf-model',`url(${url})`);
        }
      }
    } catch (error) {
    console.error("Error:", error);
  }
  }; 

  onMount(addAFrameTestRoom);
</script>

{#if spaceString}
  <div style="position: absolute; height: 100%; width: 100%;">
    {@html spaceString}
  </div>
{/if}
