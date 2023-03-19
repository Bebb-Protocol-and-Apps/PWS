<script lang="ts">
  import { onMount } from "svelte";
  import { PersonalWebSpace_backend } from "canisters/PersonalWebSpace_backend";
  import { store } from "../store";
  
  import Topnav from "../components/Topnav.svelte";
  import Footer from "../components/Footer.svelte";
  import UserSpaces from "../components/UserSpaces.svelte";

  import spinner from "../assets/loading.gif"; // TODO: load other assets (e.g. html pages) similarly (see https://vitejs.dev/guide/assets.html: Referenced assets are included as part of the build assets graph, will get hashed file names, and can be processed by plugins for optimization)

  const numberOfRandomSpacesToLoad = 3;
  let loading = true;
  let loadedRandomSpaces = [];

  const loadUserSpaces = async () => {
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
    loadedRandomSpaces = randomSpaces;
    loading = false;
  };

  onMount(loadUserSpaces);
</script>

<Topnav />

<section id="spaces" class="py-7 space-y-6 items-center text-center bg-slate-100">
  <h3 class="text-xl font-bold">Explore Web Spaces</h3>
  {#if loading}
    <p id='spacesSubtext'>Searching the Open Internet Metaverse for a few random Spaces to show you...</p>
    <img class="h-12 mx-auto" src={spinner} alt="loading animation" />
  {:else}
    <p id='spacesSubtext'>These are a few Spaces that OIM Users own:</p>
    <div id='randomSpaces' class="space-y-4">
      <UserSpaces spaces={loadedRandomSpaces} />
    </div>
  {/if}
</section>

<div class='clearfix'></div>

<Footer />
