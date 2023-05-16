<!-- ImagePreviewDataUrl.svelte -->
<script>
  let file;
  let url;
  import { store } from "../store";

  async function handleFileChange(event) {
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

        // Step 2: Create a File object from the Blob
        const fileName = fileData.Ok.File.file_name; // Replace with the actual file name
        const lastModified = Date.now(); // Replace with the actual last modified timestamp if available

        const file = new File([blob], fileName, { type: "application/octet-stream", lastModified });

        // Now you have a File object
        console.log(file);
        url = URL.createObjectURL(file);


      }
    } catch (error) {
    console.error("Error:", error);
  }
  }
</script>

<input type="file" on:change="{handleFileChange}" accept="image/*" />
{#if url}
  <img src="{url}" alt="Preview" />
{/if}