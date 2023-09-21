<script lang="ts">
  import { push } from "svelte-spa-router";
  import Button from "../components/Button.svelte";
  import Topnav from "../components/Topnav.svelte";
  import Footer from "../components/Footer.svelte";
</script>

<Topnav />

<div class="grid grid-cols-1 md:grid-cols-2 gap-0">
  <div style="background-color: #fff3e9">
    <img class="w-full p-32" src="/images/intro.svg" alt="Protocol intro graphic" />
  </div>
  <!-- ... -->
  <div class="p-12 flex flex-col justify-center">
    <h3 class="text-4xl text-gray-600 mb-8">
      Do you want to have your own Virtual Home, become part of the Open Metaverse Neighborhood and have your Personal Web Space as a 3D webpage?
    </h3>
    <button on:click={toggleModal} type="button" class="w-48 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-full text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Login</button>
  </div>
</div>

<!--
<section id="login" class="py-7 space-y-6 items-center text-center bg-slate-100">
  {#if !$store.isAuthed}
    <Login />
  {:else}
    <h3 class="font-bold">You're Logged In</h3>
    <div>Principal: {$store.principal}</div>
    <Button on:click={() => store.disconnect()}>disconnect</Button>
  {/if}
</section>
-->

<!-- Main Hero Section -->
<div class="intro-hero-section">
  <img src="./FutureWebInitiative_OpenInternetMetaverse_banner.png" alt="Open Internet Metaverse banner" class="intro-hero-background-image">
  <div class="intro-hero-overlay">
    <h1>Discover Your Space in the Open Internet Metaverse</h1>
    <p class="intro-lead-text">Experience an open, decentralized, 3D internet where you own your virtual home.</p>
  </div>
</div>

<!-- Create Space Section -->
<section id="create" class="intro-section-container">
  <h3 class="intro-section-header">Craft Your Personal Universe</h3>
  <p class="intro-section-text">
    Create a fully customizable virtual 3D room where you can express yourself. Plus, each space you generate is an NFT sent directly to your wallet.
  </p>
  <button
    on:click={() => push("#/create")}
    class="flex items-center justify-center disabled:shadow-none hover:shadow shadow-black dark:shadow-white text-xl lg:text-base 2xl:text-xl bg-blue-300 hover:bg-blue-500 dark:bg-black border-2 border-black dark:border-white dark:text-white h-12 lg:h-10 w-full rounded-3xl font-mono -mb-0.5"
  >Create Your Space</button>
</section>

<div class="grid grid-cols-1 md:grid-cols-2 gap-0">
  <div class="p-12 flex flex-col justify-center">
    {#if !$store.isAuthed}
      <h3 id='createSubtext' class="text-4xl text-gray-600 mb-8">Log in to generate a 3D room which you can edit afterwards. The Space is an NFT itself and will be sent to your wallet. This way you know it's truly yours!</h3>
    {:else}
      <h3 id='createSubtext' class="text-4xl text-gray-600 mb-8">Generate a 3D room for yourself (Your Space, Your Realm, Your Virtual Home) which you can edit afterwards. Fun fact: The Space is an NFT itself and will be sent to your wallet. This way you know it's truly yours!</h3>
    {/if}
    <button id='createButton' on:click={() => push("#/create")} type="button" class="w-48 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-full text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Create space</button>
  </div>

  <div style="background-color: #007bc2">
    <img class="w-full p-32" src="/images/create-space.svg" alt="Protocol intro graphic" />
  </div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-0">
  <div style="background-color: #ffce47">
    <img class="w-full p-32" src="/images/my-space.svg" alt="Protocol intro graphic" />
  </div>
  <!-- ... -->
  <div class="p-12 flex flex-col justify-center">
    {#if !$store.isAuthed}
      <p class="text-4xl text-gray-600 mb-8" >Log in to see which Spaces you own in the Open Internet Metaverse.</p>
      <button type='button' id='viewMySpacesButton'  class="w-48 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-full text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Login</button>
    {:else}
      <p class="text-4xl text-gray-600 mb-8" id='spacesSubtext'>See which Spaces you own in the Open Internet Metaverse.</p>
      <button type='button' id='viewMySpacesButton' on:click={() => push("#/myspaces")} class="w-48 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-full text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">My spaces</button>
    {/if}
  </div>
</div>

<!-- View Spaces Section -->
<section id="spaces" class="intro-section-container intro-bg-alternate">
  <h3 class="intro-section-header">Explore Your Metaverse</h3>
  <p class="intro-section-text">
    View the 3D rooms you've already created and journey through your personalized metaverse.
  </p>
  <button
    on:click={() => push("#/myspaces")}
    class="flex items-center justify-center disabled:shadow-none hover:shadow shadow-black dark:shadow-white text-xl lg:text-base 2xl:text-xl bg-blue-300 hover:bg-blue-500 dark:bg-black border-2 border-black dark:border-white dark:text-white h-12 lg:h-10 w-full rounded-3xl font-mono -mb-0.5"
  >View My Spaces</button>
</section>

<!-- Explore OIM Section -->
<section id="explore" class="intro-section-container">
  <h3 class="intro-section-header">Discover the Unknown</h3>
  <p class="intro-section-text">
    Embark on a journey through the Open Internet Metaverse and experience random spaces, one at a time.
  </p>
  <button
    on:click={() => push("#/explore")}
    class="flex items-center justify-center disabled:shadow-none hover:shadow shadow-black dark:shadow-white text-xl lg:text-base 2xl:text-xl bg-blue-300 hover:bg-blue-500 dark:bg-black border-2 border-black dark:border-white dark:text-white h-12 lg:h-10 w-full rounded-3xl font-mono -mb-0.5"
  >Experience OIM Now</button>
</section>


<!-- Detailed Information about Open Internet Metaverse -->
<section id="oim-detail" class="intro-section-container intro-bg-alternate">
  <h3 class="intro-section-header">The Vision of the Open Internet Metaverse</h3>
  <img src="./FutureWebInitiative_OpenInternetMetaverse_img.png" alt="The Vision of the Open Internet Metaverse" class="intro-detail-image">
  
  <p class="intro-section-text">
    The Open Internet Metaverse is not just an alternate reality; it's an extension of the existing Internet. Our aim is to enhance digital interactions, providing users with the power to create their own 3D spaces as easily as creating a Webpage.
  </p>

  <p class="intro-section-text">
    We leverage the Internet Computer (ICP) to provide a decentralized space where ownership, transparency, and interoperability are guaranteed. Through this, you benefit from true ownership and control.
  </p>

  <p class="intro-section-text">
    Our mission is to reshape the way people interact online, by merging physical and virtual realities into a unified, interconnected ecosystem. Within the Open Internet Metaverse, you're not just a visitor; you're a creator, an explorer, and a stakeholder in this new digital frontier.
  </p>
</section>

<Footer />

<style global>
/* NOTE: these styles are global and affect any element in the app. Thus, ensure that there aren't any conflicts with the class names chosen (i.e. avoid generic names as they might conflict with an A-Frame class, e.g. content which is used in the Inspector)  */
  .App-logo {
    height: 15vmin;
    pointer-events: none;
  }

  .App-header {
    margin-top: 150px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: calc(10px + 2vmin);
  }

  .App-link {
    color: rgb(26, 117, 255);
  }

  .demo-button {
    background: #a02480;
    padding: 0 1.3em;
    margin-top: 1em;
    border-radius: 60px;
    font-size: 0.7em;
    height: 35px;
    outline: 0;
    border: 0;
    cursor: pointer;
    color: white;
  }

  .demo-button:active {
    color: white;
    background: #979799;
  }

  .space-details-collapsible {
    padding: 7px;
    text-align: center;
    border: none;
    outline: none;
    cursor: pointer;
  }

  .active-app-button:hover, .space-details-collapsible:hover {
    background-color: #555;
  }

  .space-details-content {
    display: none;
    overflow: hidden;
  }

  .intro-hero-section {
    position: relative; /* Added to make it a parent for absolute positioning */
    height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5rem 0;
    text-align: center;
  }
  .intro-hero-section h1 {
    font-size: 3.5rem;
    color: #fff;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
    font-weight: bold;
  }
  .intro-lead-text {
    font-size: 1.7rem;
    color: #ddd;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
    font-weight: bold;
  }
  .intro-hero-background-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1; /* Set z-index to -1 to make it below the text content */
    object-fit: cover; /* Cover the entire div without distortion */
  }
  .intro-hero-section::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3));
    background-repeat: no-repeat;
    background-position: center center;
    background-attachment: fixed;
    z-index: 0; /* Layer it above the image but below the text */
  }
  .intro-hero-overlay {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
  }
  .intro-section-container {
    padding: 4rem 0;
    text-align: center;
  }
  .intro-section-header {
    font-size: 2.2rem;
    margin-bottom: 1rem;
  }
  .intro-section-text {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }
  .intro-bg-alternate {
    background-color: #eaf1f7;
  }
  .intro-detail-image {
    display: block;
    max-width: 400px;
    height: auto;
    margin: auto;
    margin-bottom: 1rem;
  }
</style>
