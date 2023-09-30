<script lang="ts">
  import { store } from "../store";

  import LoginModal from "./LoginModal.svelte";

  let openModal = false;

  function toggleModal() {
    openModal = !openModal;
  }

  function handleEscape({ key }) {
    if (key === "Escape") {
      openModal = false;
    }
  }
</script>

<svelte:window on:keyup={handleEscape} />

<nav class="bg-gray-800 border-gray-200 dark:bg-gray-900">
  <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4">
    <a href="#top" class="flex items-center">
      <img src="/images/open-internet-metaverse.svg" class="h-8 mr-3" alt="OIM Logo" />
    </a>
    <div class="flex items-center">
      {#if !$store.isAuthed}
        <button on:click={toggleModal} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Login</button>
      {:else}
        <button on:click={() => store.disconnect()} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Logout</button>
      {/if}
    </div>
  </div>
</nav>
<nav class="bg-gray-700 dark:bg-gray-700">
  <div class="max-w-screen-xl px-4 py-3 mx-auto">
    <div class="flex items-center">
      <ul class="flex flex-row font-medium mt-0 mr-6 space-x-8 text-sm">
        <li>
          <a href="#/create" class="text-gray-300 dark:text-white hover:underline" aria-current="page">Create</a>
        </li>
        <li>
          <a href="#/myspaces" class="text-gray-100 dark:text-white hover:underline">My Spaces</a>
        </li>
        <li>
          <a href="#/explore" class="text-gray-200 dark:text-white hover:underline">Explore</a>
        </li>
        <li>
          <a href="#/about" class="text-gray-200 dark:text-white hover:underline">About</a>
        </li>
      </ul>
    </div>
  </div>
</nav>

<div class={openModal ? "" : "hidden"}>
  <LoginModal {toggleModal} />
</div>
