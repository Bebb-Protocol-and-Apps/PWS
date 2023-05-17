<script lang="ts">
  import { onMount } from "svelte";
  import { store } from "../store";
  let files;

  $: if (files) {
    handleFiles(files);
  }

   // Function will try to upload the passed in files to the canisters
  async function handleFiles(files) {
    console.log(files);

    for (const file of files) {
      console.log(`${file.name}: ${file.size} bytes`);
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const byteArray = Array.from(uint8Array);
      console.log(byteArray);
      try {
      console.log(await $store.backendActor.listUserFileNames());
    } catch (error) {
    console.error("Error:", error);
  }
      // Assuming you have a canister object with a method `storeFile`
      try {
      console.log(await $store.backendActor.uploadUserFile(file.name, byteArray));
    } catch (error) {
    console.error("Error:", error);
  }
    }
  }



</script>

<label for="many">Upload multiple files of any type:</label>
<input
	bind:files
	id="many"
	multiple
	type="file"
  
/>
