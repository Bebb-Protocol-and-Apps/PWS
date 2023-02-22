<script lang="ts">
  import { onMount } from "svelte";
  import { PersonalWebSpace_backend } from "canisters/PersonalWebSpace_backend";
  import { canisterId as PersonalWebSpace_frontend_canister_id } from "canisters/PersonalWebSpace_frontend";
  import Topnav from "../components/Topnav.svelte";
  import Footer from "../components/Footer.svelte";

  import { formatUserSpaces, initiateCollapsibles } from "../helpers/space_helpers.js";
  import spinner from "../assets/loading.gif";

  const numberOfRandomSpacesToLoad = 3;
  let loading = true;

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
    loading = false;
    const randomSpacesString = formatUserSpaces(randomSpaces);
    document.getElementById("randomSpaces").innerHTML = randomSpacesString;
    initiateCollapsibles();
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
  {/if}
  <div id='randomSpaces' class="space-y-4"></div>
</section>

<div class='clearfix'></div>

<Footer />
