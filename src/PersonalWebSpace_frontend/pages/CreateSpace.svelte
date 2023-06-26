<script lang="ts">
  import { store } from "../store";
  import Login from "../components/Login.svelte";
  import Button from "../components/Button.svelte";
  import Topnav from "../components/Topnav.svelte";
  import Footer from "../components/Footer.svelte";
  import GlbModelPreview from "../components/GlbModelPreview.svelte";

  import { getStringForSpaceFromModel } from "../helpers/space_helpers";

  import { canisterId as backendCanisterId } from "canisters/PersonalWebSpace_backend";

  let webHostedGlbModelUrl : string = "";

// Subtexts to display
  const loginSubtext = "Please log in first.";
  const clickDefaultSubtext = "Click and we'll generate this 3D room for you (Your Space, Your Realm, Your Virtual Home) which you can edit afterwards. Fun fact: The Space is an NFT itself and will be sent to your wallet. This way you know it's truly yours!";
  const clickFromModelSubtext = "Click and we'll generate this Space from the provided model for you. Fun fact: The Space is an NFT itself and will be sent to your wallet. This way you know it's truly yours!";
  const inProgressSubtext = "Creating your Personal Web Space, just a moment...";
  const createdSubtext = "Ohh yeah, you just got yourself a new Personal Web Space! You can see it on the My Spaces tab.";

// Manage status of creation to show buttons and subtexts appropriately
  let isSpaceCreationInProgress = false;
  let spaceToCreate = "";
  let wasSpaceCreatedSuccessfully = false;

  const setCreationInProgress = async (space) => {
    isSpaceCreationInProgress = true;
    spaceToCreate = space;
  };

  const setSpaceWasCreated = async () => {
    isSpaceCreationInProgress = false;
    wasSpaceCreatedSuccessfully = true;
  };

  const createNewDefaultUserSpace = async (defaultSpace) => {
    await setCreationInProgress(defaultSpace);
    if (defaultSpace === "defaultspace/1") {
      const resp = await fetch("defaultRoom.html"); // Fetches default space 1
      const defaultSpaceHtml = await resp.text();
      const space = await $store.backendActor.createSpace(defaultSpaceHtml);
    };
    await setSpaceWasCreated();
  };

  let files;
  let userUploadedFileURL;

  const userFileInputHandler = function(userFiles = files) {
    if (!userFiles || userFiles.length === 0) {
      return false;
    };
    const userFile = userFiles[0];
    let fileName = userFile.name; // get the name of the file
    if (fileName.endsWith('.glb')) {
      try {
        userUploadedFileURL = URL.createObjectURL(userFile);
        addUserFileToScene(files);
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    } else {
      console.log('The uploaded file is not a .glb file.');
      return false;
    }
  };

  const addUserFileToScene = function(userFiles) {
    const userFile = userFiles[0];
    if (userFile) {
      var fileURL = URL.createObjectURL(userFile);
      // create a new A-Frame entity for the GLB model
      //var modelEntity = document.createElement('a-entity');
      // First, get the iframe element
      let iframe = document.querySelector('.glb-model-space-preview iframe');
      if (iframe) {
        // Use the 'load' event to ensure the iframe's contents are fully loaded
        // Get the A-Frame scene inside the iframe
        // @ts-ignore
        let aScene = iframe.contentWindow.document.querySelector('#aSceneForModelPreview');
        // Now you can interact with the scene...
        if (aScene) {
          if (aScene.hasLoaded) {
            var modelEntity = aScene.ownerDocument.createElement('a-entity');
            modelEntity.setAttribute('gltf-model', `url(${fileURL})`);
            modelEntity.setAttribute('position', '0 0 -5');
            modelEntity.setAttribute('id', 'modelFromUserFile');
            if (!aScene.querySelector('#modelFromUserFile')) {
              aScene.appendChild(modelEntity);
            }
          } else {
            aScene.addEventListener('loaded', function () {
              var modelEntity = aScene.ownerDocument.createElement('a-entity');
              modelEntity.setAttribute('gltf-model', `url(${fileURL})`);
              modelEntity.setAttribute('position', '0 0 -5');
              modelEntity.setAttribute('id', 'modelFromUserFile');
              if (!aScene.querySelector('#modelFromUserFile')) {
                aScene.appendChild(modelEntity);
              }
            });
          }
        } else {
          // Set timeout and try again
          setTimeout(() => {
            addUserFileToScene(userFiles);
          }, 1000);
        }
      } else {
        // Set timeout and try again
        setTimeout(() => {
          addUserFileToScene(userFiles);
        }, 1000);
      }    
    }
  };

  const createNewUserSpaceFromModel = async (modelType) => {
    await setCreationInProgress(modelType);
    if (modelType === "WebHostedGlbModel" && urlInputHandler(webHostedGlbModelUrl)) {
      const spaceHtml = getStringForSpaceFromModel(webHostedGlbModelUrl);
      const space = await $store.backendActor.createSpace(spaceHtml);
    };
    // Upload the user's file to the backend canister and create a new space for the user including the uploaded model
    if (modelType === "UserUploadedGlbModel" && userFileInputHandler(files)) {
      // Store file for user
      console.log(`${files[0].name}: ${files[0].size} bytes`);
      const arrayBuffer = await files[0].arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const byteArray = Array.from(uint8Array);
      console.log(byteArray);
      let fileUploadResult;
      try {
        fileUploadResult = await $store.backendActor.uploadUserFile(files[0].name, byteArray)
        console.log("fileUploadResult ", fileUploadResult);
        console.log("fileUploadResult Ok", fileUploadResult.Ok);
      } catch (error) {
        console.error("File Upload Error:", error);
      };
      if (fileUploadResult.Ok) {
        console.log("fileUploadResult Ok[0]", fileUploadResult.Ok.FileId);
        //const blob = new Blob([uint8Array], { type: "application/octet-stream" });
        
        console.log(process.env.DFX_NETWORK);
        console.log("backendCanisterId ", backendCanisterId);
        console.log(process.env.DFX_NETWORK === "ic");
        const url = process.env.DFX_NETWORK === "ic"
          ? `https://${backendCanisterId}.raw.ic0.app/file/fileId=${fileUploadResult.Ok.FileId}` // e.g. https://vee64-zyaaa-aaaai-acpta-cai.raw.ic0.app/file/fileId=777
          : `http://127.0.0.1:4943/file/fileId=${fileUploadResult.Ok.FileId}?canisterId=${backendCanisterId}`; // e.g. http://127.0.0.1:4943/file/fileId=888?canisterId=bkyz2-fmaaa-aaaaa-qaaaq-cai
        console.log("url ", url);
        const spaceHtml = getStringForSpaceFromModel(url);
        try {
          const space = await $store.backendActor.createSpace(spaceHtml);
          console.log("space ", space);
        } catch (error) {
          console.error("Create Space Error:", error);
        };
      } else {
        console.error("File Upload Error:", fileUploadResult);
      };
    };

    await setSpaceWasCreated();
  };

// Helper functions to check whether a valid URL was provided in the form
  const isValidUrl = (url) => {
    try {
      new URL(url);
    } catch (e) {
      console.error(e);
      return false;
    }
    return true;
  };

  const urlInputHandler = function(url) {
    if (!isValidUrl(url)) {
      return false;
    };
    return true;
  };

</script>

<Topnav />

<section id="createspace" class="py-7 space-y-6 items-center text-center bg-slate-100">
  <h3 class="text-xl font-bold">Create Your Personal Web Space</h3>
  {#if !$store.isAuthed}
    <p id='createSubtext'>Log in to generate a 3D room (Your Space, Your Realm, Your Virtual Home) which you can edit afterwards. Fun fact: The Space is an NFT itself and will be sent to your wallet. This way you know it's truly yours!</p>
    <Login />
  {:else}
    <h3 class="font-bold">You're Logged In</h3>
    <Button on:click={() => store.disconnect()}>disconnect</Button>
  {/if}
  <h3 class="text-xl font-bold">Create a new Space</h3>
  <!-- Default Space(s) -->
  <h3 class="text-xl font-semibold">Spaces Ready For You:</h3>
  <!-- Default Space 1 -->
  <h3 class="text-l font-semibold">The Web3 Cockpit</h3>
  <iframe src="#/defaultspace/1" title="The Web3 Cockpit" width="100%" height="auto" referrerpolicy="no-referrer"></iframe>
  {#if !$store.isAuthed}
    <button type='button' id='createButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Create This Space!</button>
    <p id='createSubtextDefault1'>{loginSubtext}</p>
  {:else}
    {#if isSpaceCreationInProgress}
      <button type='button' id='createButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Create This Space!</button>
      {#if spaceToCreate === "defaultspace/1"}
        <p id='createSubtextDefault1'>{inProgressSubtext}</p>
      {/if}
    {:else if wasSpaceCreatedSuccessfully}
      <button type='button' id='createButton' on:click={() => createNewDefaultUserSpace("defaultspace/1")} class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Create This Space!</button>
      {#if spaceToCreate === "defaultspace/1"}
        <p id='createSubtextDefault1'>{createdSubtext}</p>
      {:else}
        <p id='createSubtextDefault1'>{clickDefaultSubtext}</p>
      {/if}
    {:else}
      <button type='button' id='createButton' on:click={() => createNewDefaultUserSpace("defaultspace/1")} class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Create This Space!</button>
      <p id='createSubtextDefault1'>{clickDefaultSubtext}</p>
    {/if}
  {/if}
  <!-- From Model -->
  <h3 class=" text-xl font-semibold">Create Your Space From an Existing Model:</h3>
  <!-- User-Uploaded GLB Model File -->
  <h3 class="text-l font-semibold">Upload a GLB Model File</h3>
  <form on:submit|preventDefault={() => createNewUserSpaceFromModel("UserUploadedGlbModel")}>
    <label for="userUploadedFileInput">Select a glb file from your device:</label>
    <input
      bind:files
      id="userUploadedFileInput"
      type="file"
      class="urlInput text-black font-bold"
    />
    {#if files}
      {#if userFileInputHandler(files)}
        {#key files}  <!-- Element to rerender everything inside when files change (https://www.webtips.dev/force-rerender-components-in-svelte) -->
          <GlbModelPreview bind:modelUrl={userUploadedFileURL} modelType={"UserUploaded"}/>
        {/key}
        {#if !$store.isAuthed}
          <button type='button' id='createButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Create This Space!</button>
          <p id='createSubtextUserUploadedGlbModel'>{loginSubtext}</p>
        {:else}
          {#if isSpaceCreationInProgress}
            <button type='button' id='createButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Create This Space!</button>
            {#if spaceToCreate === "UserUploadedGlbModel"}
              <p id='createSubtextUserUploadedGlbModel'>{inProgressSubtext}</p>
            {/if}
          {:else if wasSpaceCreatedSuccessfully}
            <button type=submit id='createButton' class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Create This Space!</button>
            {#if spaceToCreate === "UserUploadedGlbModel"}
              <p id='createSubtextUserUploadedGlbModel'>{createdSubtext}</p>
            {:else}
              <p id='createSubtextUserUploadedGlbModel'>{clickFromModelSubtext}</p>
            {/if}
          {:else}
            <button type=submit id='createButton' class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Create This Space!</button>
            <p id='createSubtextUserUploadedGlbModel'>{clickFromModelSubtext}</p>
          {/if}  
        {/if}
      {:else}
        <button disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Create This Space!</button>
        <h3 class="py-4 items-center leading-8 text-center text-xl font-bold">Please provide a valid GLB Model File.</h3>
      {/if}
    {/if}
  </form>
  <!-- Web-Hosted GLB Model -->
  <h3 class="text-l font-semibold">GLB Model Hosted on the Web</h3>
  <form on:submit|preventDefault={() => createNewUserSpaceFromModel("WebHostedGlbModel")}>
    <input
        bind:value={webHostedGlbModelUrl}
        placeholder="Input the URL of the glb model here"
        class="urlInput text-black font-bold"
    />
    {#if webHostedGlbModelUrl !== ""}
      {#if urlInputHandler(webHostedGlbModelUrl)}
        {#key webHostedGlbModelUrl}  <!-- Element to rerender everything inside when webHostedGlbModelUrl changes (https://www.webtips.dev/force-rerender-components-in-svelte) -->
          <GlbModelPreview bind:modelUrl={webHostedGlbModelUrl} modelType={"WebHosted"}/>
        {/key}
        {#if !$store.isAuthed}
          <button type='button' id='createButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Create This Space!</button>
          <p id='createSubtextWebHostedGlbModel'>{loginSubtext}</p>
        {:else}
          {#if isSpaceCreationInProgress}
            <button type='button' id='createButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Create This Space!</button>
            {#if spaceToCreate === "WebHostedGlbModel"}
              <p id='createSubtextWebHostedGlbModel'>{inProgressSubtext}</p>
            {/if}
          {:else if wasSpaceCreatedSuccessfully}
            <button type=submit id='createButton' class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Create This Space!</button>
            {#if spaceToCreate === "WebHostedGlbModel"}
              <p id='createSubtextWebHostedGlbModel'>{createdSubtext}</p>
            {:else}
              <p id='createSubtextWebHostedGlbModel'>{clickFromModelSubtext}</p>
            {/if}
          {:else}
            <button type=submit id='createButton' class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Create This Space!</button>
            <p id='createSubtextWebHostedGlbModel'>{clickFromModelSubtext}</p>
          {/if}  
        {/if}
      {:else}
        <button disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Create This Space!</button>
        <h3 class="py-4 items-center leading-8 text-center text-xl font-bold">Please provide a valid URL for the GLB Model.</h3>
      {/if}
    {/if}
  </form>
</section>

<div class='clearfix'></div>

<Footer />

<style>
  .urlInput {
    width: 100%;
  }
</style>