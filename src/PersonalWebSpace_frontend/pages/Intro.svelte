<script lang="ts">
  import { push } from "svelte-spa-router";
  import { store } from "../store";
  import Login from "../components/Login.svelte";
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
</style>
