<script lang="ts">
  import { push } from "svelte-spa-router";
  import { store } from "../store";
  import Topnav from "../components/Topnav.svelte";
  import Footer from "../components/Footer.svelte";
  import UserSpaces from "../components/UserSpaces.svelte";

  let hasLoadedSpaces = false;
  let loadedUserSpaces = [];

  const loadUserSpaces = async () => {
    const userSpaces = await $store.backendActor.getCallerSpaces();
    const numberOfSpacesUserOwns = userSpaces.length;
    if (numberOfSpacesUserOwns < 1) {
      document.getElementById("spacesSubtext").innerText = "You don't own any spaces yet. Get your Personal Web Space now by clicking on the Create tab!";
    } else {
      document.getElementById("spacesSubtext").innerText = numberOfSpacesUserOwns === 1 
        ? `Big success, you own ${numberOfSpacesUserOwns} space! Let's take a look:`
        : `Big success, you own ${numberOfSpacesUserOwns} spaces! Let's take a look:`;

      loadedUserSpaces = userSpaces;
      hasLoadedSpaces = true;
    }
  };
</script>

<Topnav />

<section id="spaces" class="py-7 space-y-6 items-center text-center bg-slate-100">
  <h3 class="text-xl font-bold">My Personal Web Spaces</h3>
  {#if !$store.isAuthed}
    <p id='spacesSubtext'>Log in to see which Spaces you own in the Open Internet Metaverse.</p>
  {:else}
    <p id='spacesSubtext'>Let's see which Spaces you own...</p>
    {#if !hasLoadedSpaces}
      <p hidden>{loadUserSpaces()}</p>
    {:else}
      <UserSpaces spaces={loadedUserSpaces} />
    {/if}
  {/if}
</section>

<section id="create" class="py-7 space-y-6 items-center text-center">
  <h3 class="font-bold">Create a new Personal Web Space</h3>
  <button type='button' id='createButton' on:click={() => push("#/create")} class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Create Space</button>
  {#if !$store.isAuthed}
    <p id='createSubtext'>Log in to generate a 3D room (Your Space, Your Realm, Your Virtual Home) which you can edit afterwards. Fun fact: The Space is an NFT itself and will be sent to your wallet. This way you know it's truly yours!</p>
  {:else}
    <p id='createSubtext'>Generate a 3D room for yourself (Your Space, Your Realm, Your Virtual Home) which you can edit afterwards. Fun fact: The Space is an NFT itself and will be sent to your wallet. This way you know it's truly yours!</p>
  {/if}
</section>

<div class='clearfix'></div>

<Footer />
