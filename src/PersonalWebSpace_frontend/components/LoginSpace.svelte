<script lang="ts">
  import LoginModal from "./LoginModal.svelte";

  let openModal = false;

  function toggleModal() {
    console.log("in LoginSpace toggleModal");
    openModal = !openModal;
  }

  function handleEscape({ key }) {
    if (key === "Escape") {
      openModal = false;
    }
  }
</script>

<svelte:window on:keyup={handleEscape} />

<button
  on:click={toggleModal}
  class="hover:shadow dark:hover:shadow-white flex-1 lg:flex-none font-mono -ml-0.5 text-xl lg:text-base 2xl:text-xl bg-white dark:bg-black border-black dark:border-white dark:text-white border-2 rounded-t-3xl lg:rounded-t-none lg:rounded-b-[37px] lg:min-w-[300px]"
  >login</button
>

<div class={openModal ? "" : "hidden"}>
  <LoginModal {toggleModal} />
</div>

<style>
  button {
    position: absolute;
    top: 0;
    right: 0;
    min-width: 80px;
    width: 80px;
    display: flex;
    justify-content: center;
    align-items: end;
    z-index: 10;
    /* cursor: pointer;
    margin-right: 1.5rem;
    margin-left: 1.5rem;
    margin-top: 1rem;
    border-radius: 0.2rem;
    background-color: #565656;
    color: #fff;
    font-weight: 700;
    padding: 0.5rem 1.4rem;
    font-size: 1.5rem;
    z-index: 100;
    opacity: 95%; */
  }
</style>
