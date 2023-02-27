<script lang="ts">
  import { onMount } from "svelte";
  import { PersonalWebSpace_backend } from "canisters/PersonalWebSpace_backend";
  
  import Topnav from "../components/Topnav.svelte";
  import Footer from "../components/Footer.svelte";
  import UserSpaces from "../components/UserSpaces.svelte";

  import spinner from "../assets/loading.gif";

  const numberOfRandomSpacesToLoad = 3;
  let loading = true;
  let loadedRandomSpaces = [];

  const loadUserSpaces = async () => {
    let randomSpaces = [];
    let randomSpacesIds = []; // Don't show the same Space multiple times
    for (var i = 0; i < numberOfRandomSpacesToLoad; i++) {
      const spaceNFTResponse = await PersonalWebSpace_backend.getRandomSpace(); // TODO: probably send requests in parallel and then await all to speed up
      if (!spaceNFTResponse.Err && !randomSpacesIds.includes(spaceNFTResponse.Ok.id)) {
        randomSpaces.push(spaceNFTResponse.Ok);
        randomSpacesIds.push(spaceNFTResponse.Ok.id);
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
