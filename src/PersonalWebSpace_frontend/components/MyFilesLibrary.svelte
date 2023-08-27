<script>
  import { onMount } from "svelte";
  import { store } from "../store";

  import spinner from "../assets/loading.gif";

  export let selectedFile;

  let userFiles = [];
  let retrievingFilesInProgress = false;

  // Function to handle click on preview button
  function handlePreview(item) {
    selectedFile = item;
  };

  onMount(async () => {
    retrievingFilesInProgress = true;
    let fileRetrievalResponse = await $store.backendActor.listUserFileIdsAndNames();
    // @ts-ignore
    if (fileRetrievalResponse.Ok && fileRetrievalResponse.Ok.FileIdsAndNames) {
      // @ts-ignore
      userFiles = fileRetrievalResponse.Ok.FileIdsAndNames;
    };
    retrievingFilesInProgress = false;    
  });
</script>

<div class="library-items-list space-y-1">
  {#if retrievingFilesInProgress}
    <img class="h-6 block" src={spinner} alt="loading animation" />
  {:else}
    {#each userFiles as item (item.file_name)}
      <div class="library-item">
        <span>{item.file_name}</span>
        <button on:click={() => handlePreview(item)} class="library-item-button">Preview</button>
      </div>
    {/each}
  {/if}
</div>

<style>
  .library-items-list {
    border: 1px solid white;
    border-radius: 10px;
    margin-bottom: 2vmin;
    padding: 2vmin;
    overflow-y: auto;
    height: 200px;
  }

  .library-item {
    border: 0.5px solid white;
    border-radius: 10px;
    margin-bottom: 2vmin;
    padding: 1.5vmin;
  }

  .library-item-button {
    border: 0.3px solid white;
    padding: 0.7vmin;
  }
</style>





