<script lang="ts">
  import { onMount } from "svelte";
  import { store, appDomain } from "../store";
  import Topnav from "../components/Topnav.svelte";
  import Footer from "../components/Footer.svelte";
  import GlbModelPreview from "../components/GlbModelPreview.svelte";
  import MediaContentPreview from "../components/MediaContentPreview.svelte";

  import { getStringForSpaceFromMediaFile, getStringForSpaceFromModel } from "../helpers/space_helpers";
  import { supportedImageExtensions, supportedVideoExtensions, registerKeydownEventToExitFullscreen } from "../helpers/utils";

  import { canisterId as backendCanisterId } from "canisters/PersonalWebSpace_backend";
  import { canisterId as PersonalWebSpace_frontend_canister_id } from "canisters/PersonalWebSpace_frontend";
  import type { EntityInitiationObject } from "src/integrations/BebbProtocol/bebb.did";

  let webHostedGlbModelUrl : string = "";

// Subtexts to display
  const loginSubtext = "Please log in first.";
  const clickDefaultSubtext = "Click and we'll generate this 3D room for you (Your Space, Your Realm, Your Virtual Home) which you can edit afterwards. Fun fact: The Space is an NFT itself and will be sent to your wallet. This way you know it's truly yours!";
  const clickFromModelSubtext = "Click and we'll generate this Space from the provided model for you. Fun fact: The Space is an NFT itself and will be sent to your wallet. This way you know it's truly yours!";
  const inProgressSubtext = "Creating your Personal Web Space, just a moment...";
  const createdSubtext = "Ohh yeah, you just got yourself a new Personal Web Space! You can see it on the My Spaces tab.";
  const fileTooBigText = "Hmm, this file is too big. Please select a file smaller than 2 MB.";

// Manage status of creation to show buttons and subtexts appropriately
  let isSpaceCreationInProgress = false;
  let spaceToCreate = "";
  let wasSpaceCreatedSuccessfully = false;

  const setCreationInProgress = (space) => {
    isSpaceCreationInProgress = true;
    spaceToCreate = space;
  };

  const setSpaceWasCreated = () => {
    isSpaceCreationInProgress = false;
    wasSpaceCreatedSuccessfully = true;
  };

  const createNewDefaultUserSpace = async (defaultSpace) => {
    setCreationInProgress(defaultSpace);
    if (defaultSpace === "defaultspace/0") {
      const resp = await fetch("defaultRoom_Web3Cockpit.html"); // Fetches default space 0
      const defaultSpaceHtml = await resp.text();
      await createSpace(defaultSpaceHtml);
    } else if (defaultSpace === "defaultspace/1") {
      const resp = await fetch("defaultRoom_NatureRetreat.html"); // Fetches default space 1
      const defaultSpaceHtml = await resp.text();
      await createSpace(defaultSpaceHtml);
    } else if (defaultSpace === "defaultspace/2") {
      const resp = await fetch("defaultRoom_InternetIsland.html"); // Fetches default space 2
      const defaultSpaceHtml = await resp.text();
      await createSpace(defaultSpaceHtml);
    };
    setSpaceWasCreated();
  };

  let files;
  let userUploadedFileURL;
  let fileType;
  let fileSizeToUpload;
  let fileSizeUploadLimit = 2000000; // 2 MB

  const supportedMediaExtensions = supportedVideoExtensions.concat(supportedImageExtensions);
  let is360Degree = false;

  const userFileInputHandler = function(userFiles = files, preCreation=false) {
    if (!userFiles || userFiles.length === 0) {
      return false;
    };
    const userFile = userFiles[0];
    let fileName = userFile.name; // get the name of the file
    if (fileName.endsWith('.glb')) {
      try {
        fileType = "glbModel";
        userUploadedFileURL = URL.createObjectURL(userFile);
        fileSizeToUpload = userFile.size;
        if (!preCreation) {
          addUserFileToScene(files);
        };
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    } else if (supportedMediaExtensions.some(ext => fileName.endsWith(ext))) {
      fileType = "mediaContent";
      userUploadedFileURL = URL.createObjectURL(userFile);
      fileSizeToUpload = userFile.size;
      return true;
    } else {
      console.error('The uploaded file is not a supported file.');
      return false;
    }
  };

  const addUserFileToScene = function(userFiles) {
    const userFile = userFiles[0];
    if (userFile) {
      var fileURL = URL.createObjectURL(userFile);
      // create a new A-Frame entity for the GLB model
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
            modelEntity.setAttribute('position', '0 3 -6');
            modelEntity.setAttribute('id', 'modelFromUserFile');
            modelEntity.setAttribute('animation-mixer');
            if (!aScene.querySelector('#modelFromUserFile')) {
              aScene.appendChild(modelEntity);
            } else {
              aScene.replaceChild(modelEntity, aScene.querySelector('#modelFromUserFile'));
            }
          } else {
            aScene.addEventListener('loaded', function () {
              var modelEntity = aScene.ownerDocument.createElement('a-entity');
              modelEntity.setAttribute('gltf-model', `url(${fileURL})`);
              modelEntity.setAttribute('position', '0 3 -6');
              modelEntity.setAttribute('id', 'modelFromUserFile');
              modelEntity.setAttribute('animation-mixer');
              if (!aScene.querySelector('#modelFromUserFile')) {
                aScene.appendChild(modelEntity);
              } else {
              aScene.replaceChild(modelEntity, aScene.querySelector('#modelFromUserFile'));
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

  const createSpace = async (spaceHtml) => {
    try {
      const spaceResponse = await $store.backendActor.createSpace(spaceHtml);
      // @ts-ignore
      if (spaceResponse && spaceResponse.Ok) {
        // @ts-ignore
        const spaceId = spaceResponse.Ok.id;
        setSpaceWasCreated();
        // Protocol integration: create Space as Entity in Protocol
        const externalId = `https://${PersonalWebSpace_frontend_canister_id}${appDomain}/#/space/${spaceId}`;
        let entityInitiationObject : EntityInitiationObject = {
          settings: [],
          entityType: { 'Resource' : { 'Web' : null } },
          name: ["Personal Web Space"],
          description: ["Flaming Hot Personal Web Space"],
          keywords: [["NFT", "Space", "Open Internet Metaverse", "heeyah"]] as [Array<string>],
          entitySpecificFields: [externalId],
        };
        const spaceEntityIdResponse = await $store.protocolActor.create_entity(entityInitiationObject);
        // @ts-ignore
        if (spaceEntityIdResponse && spaceEntityIdResponse.Ok) {
          // @ts-ignore
          const spaceEntityIdUpdateResponse = await $store.backendActor.updateSpaceEntityId(spaceId, spaceEntityIdResponse.Ok);
          // @ts-ignore
          if (!spaceEntityIdUpdateResponse || !spaceEntityIdUpdateResponse.Ok) {
            console.error("Update Space Error:", spaceEntityIdUpdateResponse);
          };
        } else {
          console.error("Create Entity Error:", spaceEntityIdResponse);
        };
      } else {
        console.error("Create Space Error:", spaceResponse);
      };
    } catch (error) {
      console.error("Create Space Error:", error);
    };
  };

  const createNewUserSpaceFromModel = async (modelType) => {
    if (modelType === "WebHostedGlbModel" && urlInputHandler(webHostedGlbModelUrl)) {
      setCreationInProgress(modelType);
      const spaceHtml = getStringForSpaceFromModel(webHostedGlbModelUrl);
      await createSpace(spaceHtml);
    };
    // Upload the user's file to the backend canister and create a new space for the user including the uploaded model
    if (modelType === "UserUploadedGlbModel" && userFileInputHandler(files, true) && (fileSizeToUpload <= fileSizeUploadLimit)) {
      // Store file for user
      const arrayBuffer = await files[0].arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const byteArray = Array.from(uint8Array);
      let fileUploadResult;
      try {
        fileUploadResult = await $store.backendActor.uploadUserFile(files[0].name, byteArray);
      } catch (error) {
        console.error("File Upload Error:", error);
      };
      if (fileUploadResult.Ok) {
        const url = process.env.DFX_NETWORK === "local"
          ? `http://127.0.0.1:4943/file/fileId=${fileUploadResult.Ok.FileId}?canisterId=${backendCanisterId}` // e.g. http://127.0.0.1:4943/file/fileId=888?canisterId=bkyz2-fmaaa-aaaaa-qaaaq-cai
          : `https://${backendCanisterId}.raw${appDomain}/file/fileId=${fileUploadResult.Ok.FileId}`; // e.g. https://vee64-zyaaa-aaaai-acpta-cai.raw.ic0.app/file/fileId=777
        const spaceHtml = getStringForSpaceFromModel(url);
        await createSpace(spaceHtml);
      } else {
        console.error("File Upload Error:", fileUploadResult);
      };
    };
  };

  const createNewUserSpaceFromFile = async () => {
    setCreationInProgress("UserUploadedFile");
    if (fileType === "glbModel") {
      await createNewUserSpaceFromModel("UserUploadedGlbModel")
    };
    // Upload the user's file to the backend canister and create a new space for the user including the uploaded file
    if (fileType === "mediaContent" && userFileInputHandler(files, true) && (fileSizeToUpload <= fileSizeUploadLimit)) {
      // Store file for user
      const arrayBuffer = await files[0].arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const byteArray = Array.from(uint8Array);
      let fileUploadResult;
      try {
        fileUploadResult = await $store.backendActor.uploadUserFile(files[0].name, byteArray);
      } catch (error) {
        console.error("File Upload Error:", error);
      };
      if (fileUploadResult.Ok) {
        const url = process.env.DFX_NETWORK === "local"
          ? `http://127.0.0.1:4943/file/fileId=${fileUploadResult.Ok.FileId}?canisterId=${backendCanisterId}` // e.g. http://127.0.0.1:4943/file/fileId=888?canisterId=bkyz2-fmaaa-aaaaa-qaaaq-cai
          : `https://${backendCanisterId}.raw${appDomain}/file/fileId=${fileUploadResult.Ok.FileId}`; // e.g. https://vee64-zyaaa-aaaai-acpta-cai.raw.ic0.app/file/fileId=777
        const spaceHtml = getStringForSpaceFromMediaFile(url, files[0].name, is360Degree);
        await createSpace(spaceHtml);
      } else {
        console.error("File Upload Error:", fileUploadResult);
      };
    };
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

// Helper function to scroll to specific element on the page
  // targetElQuerySelector: e.g. "#createSpaceFromUploadedItemDiv"
  function scrollIntoView( targetElQuerySelector ) {
		const el = document.querySelector(targetElQuerySelector);
		if (!el) return;
    el.scrollIntoView({
      behavior: 'smooth'
    });
  };

  const enableExitFullscreenForIframeScene = function(iframe) {
    if (iframe) {
      // Use the 'load' event to ensure the iframe's contents are fully loaded
      // Get the A-Frame scene inside the iframe
      // @ts-ignore
      const aScene = iframe.contentWindow.document.querySelector('a-scene');
      // Now you can interact with the scene...
      if (aScene) {
        if (aScene.hasLoaded) {
          registerKeydownEventToExitFullscreen(aScene);
        } else {
          aScene.addEventListener('loaded', function () {
            registerKeydownEventToExitFullscreen(aScene);
          });
        };
      } else {
        // Set timeout and try again
        setTimeout(() => {
          enableExitFullscreenForIframeScene(iframe);
        }, 1000);
      };
    } else {
      // Set timeout and try again
      setTimeout(() => {
        enableExitFullscreenForIframeScene(iframe);
      }, 1000);
    };
  };

  const enableExitFullscreenScene = () => {
    let iframes = document.getElementsByClassName("create-space-preview-iframe");
    if (iframes) {
      for (var i = 0; i < iframes.length; i++) {
        enableExitFullscreenForIframeScene(iframes[i]);
      };
    } else {
      // Set timeout and try again
      setTimeout(() => {
        enableExitFullscreenScene();
      }, 1000);
    };    
  };

  onMount(enableExitFullscreenScene);

</script>

<Topnav />

<section id="createspace" class="py-7 space-y-6 items-center text-center bg-slate-100">



  <section class="bg-white dark:bg-gray-900 bg-[url('/images/hero-pattern-dark.svg')]">
    <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 z-10 relative">	
      <a href="#createSpaceFromUploadedItemDiv" on:click|preventDefault={() => scrollIntoView("#createSpaceFromUploadedItemDiv")} class="inline-flex justify-between items-center py-1 px-1 pr-4 mb-7 text-sm text-blue-700 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800">
        <span class="text-xs bg-blue-600 rounded-full text-white px-4 py-1.5 mr-3">New</span> <span class="text-sm font-medium">
        Create your space with an uploaded item</span>
        <svg class="w-2.5 h-2.5 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
        </svg>
      </a>
      <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
        Create Your Personal Web Space</h1>
      <p class="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 lg:px-48 dark:text-gray-200">
        {#if !$store.isAuthed}
          <p id='createSubtext'>Log in to generate a 3D room (Your Space, Your Realm, Your Virtual Home) which you can edit afterwards. The Space is an NFT itself and will be sent to your wallet. This way you know it's truly yours!</p>
        {:else}
          <p id='createSubtext'>Generate a 3D room (Your Space, Your Realm, Your Virtual Home) which you can edit afterwards from the options below. The Space is an NFT itself and will be sent to your wallet. This way you know it's truly yours!</p>
        {/if}
        <!-- TODO <h3 class="text-l font-semibold">Your Web3 Cockpit</h3> -->
      </p>
    </div>
  </section>


<!-- Default Spaces -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-0">
    <div style="background-color: #007bc2">
      <!-- Default Space 1 -->
      <div class="iframe-holder">
        <iframe src="#/defaultspace/1" title="Your Nature Retreat" width="100%" height="444px" referrerpolicy="no-referrer" class="create-space-preview-iframe"></iframe>
      </div>
    </div>
    <!-- ... -->
    <div class="p-12 flex flex-col justify-center">
      <h3 class="text-4xl text-gray-600 mb-8">Your Nature Retreat</h3>
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
    </div>
  </div>

  <!-- Default Space 2 -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-0 mt-0 mb-0">
    <div class="p-12 flex flex-col justify-center">
      <h3 class="text-4xl text-gray-600 mb-8">Your Internet Island</h3>
      {#if !$store.isAuthed}
        <button type='button' id='createButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Create This Space!</button>
        <p id='createSubtextDefault2'>{loginSubtext}</p>
      {:else}
        {#if isSpaceCreationInProgress}
          <button type='button' id='createButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Create This Space!</button>
          {#if spaceToCreate === "defaultspace/2"}
            <p id='createSubtextDefault2'>{inProgressSubtext}</p>
          {/if}
        {:else if wasSpaceCreatedSuccessfully}
          <button type='button' id='createButton' on:click={() => createNewDefaultUserSpace("defaultspace/2")} class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Create This Space!</button>
          {#if spaceToCreate === "defaultspace/2"}
            <p id='createSubtextDefault2'>{createdSubtext}</p>
          {:else}
            <p id='createSubtextDefault2'>{clickDefaultSubtext}</p>
          {/if}
        {:else}
          <button type='button' id='createButton' on:click={() => createNewDefaultUserSpace("defaultspace/2")} class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Create This Space!</button>
          <p id='createSubtextDefault2'>{clickDefaultSubtext}</p>
        {/if}
      {/if}
    </div>

    <div class="iframe-holder">
      <iframe src="#/defaultspace/2" title="Your Web Space Station" width="100%" height="444px" referrerpolicy="no-referrer" class="create-space-preview-iframe"></iframe>
    </div>
  </div>

  <!-- Default Space 3 -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-0">
    <div style="background-color: #007bc2">
      <div class="iframe-holder">
        <iframe src="#/defaultspace/0" title="Your Web Space Station" width="100%" height="444px" referrerpolicy="no-referrer" class="create-space-preview-iframe"></iframe>
      </div>
    </div>
    <div class="p-12 flex flex-col justify-center">
      <h3 class="text-4xl text-gray-600 mb-8">Your Web Space Station</h3>
      {#if !$store.isAuthed}
        <button type='button' id='createButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Create This Space!</button>
        <p id='createSubtextDefault0'>{loginSubtext}</p>
      {:else}
        {#if isSpaceCreationInProgress}
          <button type='button' id='createButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Create This Space!</button>
          {#if spaceToCreate === "defaultspace/0"}
            <p id='createSubtextDefault0'>{inProgressSubtext}</p>
          {/if}
        {:else if wasSpaceCreatedSuccessfully}
          <button type='button' id='createButton' on:click={() => createNewDefaultUserSpace("defaultspace/0")} class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Create This Space!</button>
          {#if spaceToCreate === "defaultspace/0"}
            <p id='createSubtextDefault0'>{createdSubtext}</p>
          {:else}
            <p id='createSubtextDefault0'>{clickDefaultSubtext}</p>
          {/if}
        {:else}
          <button type='button' id='createButton' on:click={() => createNewDefaultUserSpace("defaultspace/0")} class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Create This Space!</button>
          <p id='createSubtextDefault0'>{clickDefaultSubtext}</p>
        {/if}
      {/if}
    </div>
  </div>

<!-- From File -->
  <div id="createSpaceFromUploadedItemDiv" class="grid grid-cols-1 md:grid-cols-2 gap-0">
    <div class="p-12 bg-green-100 flex flex-col justify-center">
      <h3 class="text-4xl text-gray-600 mb-8">Create Your Space With an Uploaded Item</h3>
    </div>

    <div class="p-12 flex flex-col text-left">
      <!-- User-Uploaded File -->
      <h3 class="text-l font-semibold">Upload a File</h3>
      <p class="text-l">It can be a 3D model, image or video (incl. 360-degree).</p>
      <p class="text-l">Supported File Types: .glb, .gltf, .mp4, .mov, .jpg, .jpeg, .png, .svg, .gif</p>
      <form on:submit|preventDefault={() => createNewUserSpaceFromFile()}>
        <label for="userUploadedFileInput">Select a file from your device:</label>
        <input
                bind:files
                id="userUploadedFileInput"
                type="file"
                class="urlInput text-black font-bold"
        />
        {#if files}
          {#key files}  <!-- Element to rerender everything inside when files change (https://www.webtips.dev/force-rerender-components-in-svelte) -->
            {#if userFileInputHandler(files)}
              {#if fileType === "glbModel"}
                <!-- User-Uploaded GLB Model File -->
                <GlbModelPreview bind:modelUrl={userUploadedFileURL} modelType={"UserUploaded"}/>
              {:else if fileType === "mediaContent"}
                <!-- User-Uploaded Image or Video File -->
                <!-- 360-degree toggle -->
                <div class="py-2">
                  <input type="checkbox" bind:checked={is360Degree} id="360Toggle">
                  <label for="360Toggle" class="ml-2">Set as 360-degree item</label>
                </div>
                {#key is360Degree}
                  <MediaContentPreview bind:contentUrl={userUploadedFileURL} contentFiles={files} is360Degree={is360Degree}/>
                {/key}
              {/if}
              {#if !$store.isAuthed}
                <button type='button' id='createButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Create This Space!</button>
                <p id='createSubtextUserUploadedFile'>{loginSubtext}</p>
              {:else}
                {#if isSpaceCreationInProgress}
                  <button type='button' id='createButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Create This Space!</button>
                  {#if spaceToCreate === "UserUploadedFile"}
                    <p id='createSubtextUserUploadedFile'>{inProgressSubtext}</p>
                  {/if}
                {:else if wasSpaceCreatedSuccessfully}
                  <button type=submit id='createButton' class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Create This Space!</button>
                  {#if spaceToCreate === "UserUploadedFile"}
                    <p id='createSubtextUserUploadedFile'>{createdSubtext}</p>
                  {:else}
                    <p id='createSubtextUserUploadedFile'>{clickFromModelSubtext}</p>
                  {/if}
                {:else}
                  {#if fileSizeToUpload <= fileSizeUploadLimit}
                    <button type=submit id='createButton' class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Create This Space!</button>
                    <p id='createSubtextUserUploadedFile'>{clickFromModelSubtext}</p>
                  {:else}
                    <button type='button' id='createButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Create This Space!</button>
                    <p id='createSubtextUserUploadedFile'>{fileTooBigText}</p>
                  {/if}
                {/if}
              {/if}
            {:else}
              <button disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Create This Space!</button>
              <h3 class="py-4 items-center leading-8 text-center text-xl font-bold">Please provide a valid File (with a supported file type).</h3>
            {/if}
          {/key}
        {/if}
      </form>
      <div class="inline-flex items-center justify-center w-full">
        <hr class="w-64 h-px my-8 bg-gray-200 border-0 dark:bg-gray-700">
        <span style="margin-left: 25%;" class="absolute px-3 font-medium text-gray-900 -translate-x-1/2 left-1/2 dark:text-white dark:bg-gray-900 mx-auto">or</span>
      </div>
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

    </div>
  </div>


</section>

<div class='clearfix'></div>

<Footer />

<style>
  .urlInput {
    width: 100%;
  }

  .iframe-holder {
    background:url(../assets/loading.gif) center center no-repeat;
  }
</style>
