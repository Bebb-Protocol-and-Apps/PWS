<script lang="ts">
  import { onMount, afterUpdate } from "svelte";
  import { store } from "../store";
  
  import Topnav from "../components/Topnav.svelte";
  import Footer from "../components/Footer.svelte";
  import UserSpace from "../components/UserSpace.svelte";

  import { initiateCollapsibles } from "../helpers/space_helpers.js";

  import spinner from "../assets/loading.gif"; // TODO: load other assets (e.g. html pages) similarly (see https://vitejs.dev/guide/assets.html: Referenced assets are included as part of the build assets graph, will get hashed file names, and can be processed by plugins for optimization)

  const numberOfRandomSpacesToLoad = 3;
  let loading = true;
  let loadedRandomSpaces = [];
  let currentIndex = 0;
  let loadingNewSpaces = false;

  const nextSpace = async () => {
    if (loadingNewSpaces) {
      return;
    };
    if (currentIndex < loadedRandomSpaces.length - 2) {
      currentIndex++;
    } else {
      if (currentIndex + 1 < loadedRandomSpaces.length) {
        currentIndex++;
        await loadUserSpaces();
      } else {
        await loadUserSpaces();
        currentIndex++;
      };
    }
  };

  const prevSpace = () => {
    if (currentIndex > 0) {
      currentIndex--;
    }
  };

  const loadUserSpaces = async () => {
    loadingNewSpaces = true;
    let requestPromises = [];
    for (var i = 0; i < numberOfRandomSpacesToLoad; i++) {
      requestPromises.push($store.backendActor.getRandomSpace()); // Send requests in parallel and then await all to speed up
    };
    const spaceNFTResponses = await Promise.all(requestPromises);
    let randomSpaces = [];
    let randomSpacesIds = []; // Don't show the same Space multiple times
    for (var j = 0; j < spaceNFTResponses.length; j++) {
      if (!spaceNFTResponses[j].Err && !randomSpacesIds.includes(spaceNFTResponses[j].Ok.id)) {
        randomSpaces.push(spaceNFTResponses[j].Ok);
        randomSpacesIds.push(spaceNFTResponses[j].Ok.id);
      };
    };
    loadedRandomSpaces = [...loadedRandomSpaces, ...randomSpaces];
    loading = false;
    loadingNewSpaces = false;
  };

  onMount(loadUserSpaces);
  afterUpdate(initiateCollapsibles);
</script>

<Topnav />

<section id="spaces" class="py-7 space-y-3 items-center text-center bg-slate-100">
  <h3 class="text-xl font-bold">Explore Web Spaces</h3>
  {#if loading}
    <p id='spacesSubtext'>Searching the Open Internet Metaverse for a few random Spaces to show you...</p>
    <img class="h-12 mx-auto" src={spinner} alt="loading animation" />
  {:else}
    <div id='randomSpaces' class="space-y-1">
      {#if currentIndex > 0}
        <button on:click={prevSpace} class="active-app-button bg-slate-500 text-white py-2 px-4 rounded font-semibold">Previous</button>
      {:else}
        <button disabled class="bg-slate-500 text-white py-2 px-4 rounded font-bold opacity-50 cursor-not-allowed">Previous</button>
      {/if}
      {#if loadingNewSpaces}
        <button disabled class="bg-slate-500 text-white py-2 px-4 rounded font-bold opacity-50 cursor-not-allowed">Next</button>
        <img class="h-12 mx-auto" src={spinner} alt="loading animation" />
      {:else}
        <button on:click={nextSpace} class="active-app-button bg-slate-500 text-white py-2 px-4 rounded font-semibold">Next</button>
      {/if}
      {#key currentIndex}
        <UserSpace space={loadedRandomSpaces[currentIndex] ? loadedRandomSpaces[currentIndex] : loadedRandomSpaces[currentIndex--]} spaceIframeHeight={"500px"}/>
      {/key}
    </div>
  {/if}
</section>

<div class='clearfix'></div>

<Footer />
