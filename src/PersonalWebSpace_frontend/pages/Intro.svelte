<script lang="ts">
  import { push } from "svelte-spa-router";
  import Topnav from "../components/Topnav.svelte";
  import Footer from "../components/Footer.svelte";
</script>

<Topnav />

<div class="grid grid-cols-1 md:grid-cols-2 gap-0">
  <div style="background-color: #007bc2">
    <img class="w-full p-32" src="/images/create-space.svg" alt="Protocol intro graphic" />
  </div>
  <!-- ... -->
  <div class="p-12 flex flex-col justify-center">
    <h3 class="text-4xl text-gray-600 mb-8">Craft Your Personal Universe</h3>
    <p class="intro-section-text">
      Create a fully customizable virtual 3D room where you can express yourself. Plus, each space you generate is an NFT sent directly to your wallet.
    </p>
    <button type="button" id='createButton' on:click={() => push("#/create")} class="w-48 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-full text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Create Space</button>
  </div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-0">
  <div class="p-12 flex flex-col justify-center">
    <h3 class="text-4xl text-gray-600 mb-8">Discover Your Metaverse</h3>
    <p class="intro-section-text">
      View the 3D rooms you've already created and journey through your personalized metaverse.
    </p>
    <button type='button' id='viewMySpacesButton' on:click={() => push("#/myspaces")} class="w-48 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-full text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">My Spaces</button>
  </div>

  <div style="background-color: #fff3e9">
    <img class="w-full p-32" src="/images/intro.svg" alt="Protocol intro graphic" />
  </div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-0">
  <div style="background-color: #ffce47">
    <img class="w-full p-32" src="/images/my-space.svg" alt="Protocol intro graphic" />
  </div>
  <!-- ... -->
  <div class="p-12 flex flex-col justify-center">
    <h3 class="text-4xl text-gray-600 mb-8">
      Explore the Unknown
    </h3>
    <p class="intro-section-text">
      Embark on a journey through the Open Internet Metaverse and experience random spaces, one at a time.
    </p>
    <button type="button" id='exploreButton' on:click={() => push("#/explore")} class="w-48 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-full text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Experience OIM Now</button>
  </div>
</div>

<div class='clearfix'></div>

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

  .intro-section-text {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }
</style>
