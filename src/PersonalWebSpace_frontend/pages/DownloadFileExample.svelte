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
      console.log(fileIdsResponse);
      console.log(fileIdsResponse.Ok.FileIds);
      let fileIds = fileIdsResponse.Ok.FileIds;
      console.log(fileIds["Ok"]);
      for (let i = 0; i < fileIds.length; i++)
      {
        let fileData = await $store.backendActor.getFile(fileIds[i]);
        console.log(fileData)
        console.log(fileData.Ok.File)
        console.log(fileData.Ok.File.file_content)

        // Assuming you have a Uint8Array named `byteArray`
        const byteArray = new Uint8Array(fileData.Ok.File.file_content);

        // Step 1: Convert the Uint8Array to a Blob
        const blob = new Blob([byteArray], { type: "application/octet-stream" });

        // Step 2: Create a File object from the Blob
        const fileName = fileData.Ok.File.file_name; // Replace with the actual file name
        const lastModified = Date.now(); // Replace with the actual last modified timestamp if available

        const file = new File([blob], fileName, { type: "application/octet-stream", lastModified });

        // Now you have a File object
        console.log(file);
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
