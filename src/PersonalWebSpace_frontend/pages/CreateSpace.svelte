<script lang="ts">
  import { store } from "../store";
  import Login from "../components/Login.svelte";
  import Button from "../components/Button.svelte";
  import Topnav from "../components/Topnav.svelte";
  import Footer from "../components/Footer.svelte";
  import GlbModelPreview from "../components/GlbModelPreview.svelte";

  import { getStringForSpaceFromModel } from "../helpers/space_helpers";

  let webHostedGlbModelUrl : string = "";

  const createNewDefaultUserSpace = async (element, defaultSpaceNumber : Number) => {
    element.setAttribute("disabled", true);
    if (defaultSpaceNumber === 1) {
      document.getElementById("createSubtextDefault1").innerText = "Creating your Personal Web Space, just a moment...";
      const resp = await fetch("defaultRoom.html"); // Fetches default space 1
      const defaultSpaceHtml = await resp.text();
      const space = await $store.backendActor.createSpace(defaultSpaceHtml);
      document.getElementById("createSubtextDefault1").innerText = "Ohh yeah, you just got yourself a new Personal Web Space!";
    };
    element.removeAttribute("disabled");
  };

  const createNewUserSpaceFromModel = async (element, modelType : string) => {
    element.setAttribute("disabled", true);
    if (modelType === "WebHostedGlbModel" && urlInputHandler(webHostedGlbModelUrl)) {
      document.getElementById("createSubtextWebHostedGlbModel").innerText = "Creating your Personal Web Space, just a moment...";
      const spaceHtml = getStringForSpaceFromModel(webHostedGlbModelUrl);
      const space = await $store.backendActor.createSpace(spaceHtml);
      document.getElementById("createSubtextWebHostedGlbModel").innerText = "Ohh yeah, you just got yourself a new Personal Web Space!";
    };
    element.removeAttribute("disabled");
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
  <iframe src="#/defaultspace/1" title="The Web3 Cockpit" width="100%" height="auto"></iframe>
  {#if !$store.isAuthed}
    <button type='button' id='createButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Create This Space!</button>
    <p id='createSubtextDefault1'>Please log in first.</p>
  {:else}
    <button type='button' id='createButton' on:click={(e) => createNewDefaultUserSpace(e.target, 1)} class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Create This Space!</button>
    <p id='createSubtextDefault1'>Click and we'll generate this 3D room for you (Your Space, Your Realm, Your Virtual Home) which you can edit afterwards. Fun fact: The Space is an NFT itself and will be sent to your wallet. This way you know it's truly yours!</p>
  {/if}
  <!-- From Model -->
  <h3 class=" text-xl font-semibold">Create Your Space From an Existing Model:</h3>
  <!-- Web-Hosted GLB Model -->
  <h3 class="text-l font-semibold">GLB Model Hosted on the Web</h3>
  <form on:submit|preventDefault={(e) => createNewUserSpaceFromModel(e.target, "WebHostedGlbModel")}>
    <input
        bind:value={webHostedGlbModelUrl}
        placeholder="Input the URL of the glb model here"
        class="urlInput text-black font-bold"
    />
    {#if webHostedGlbModelUrl !== ""}
      {#if urlInputHandler(webHostedGlbModelUrl)}
        {#key webHostedGlbModelUrl}  <!-- Element to rerender everything inside when webHostedGlbModelUrl changes (https://www.webtips.dev/force-rerender-components-in-svelte) -->
          <GlbModelPreview bind:modelUrl={webHostedGlbModelUrl}/>
        {/key}
        {#if !$store.isAuthed}
          <button type='button' id='createButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Create This Space!</button>
          <p id='createSubtextWebHostedGlbModel'>Please log in first.</p>
        {:else}
          <button type=submit id='createButton' class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Create This Space!</button>
          <p id='createSubtextWebHostedGlbModel'>Click and we'll generate this Space from the provided model for you. Fun fact: The Space is an NFT itself and will be sent to your wallet. This way you know it's truly yours!</p>
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
