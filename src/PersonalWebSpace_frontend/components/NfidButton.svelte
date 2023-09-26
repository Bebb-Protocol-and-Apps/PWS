<script lang="ts">
  import { onMount } from "svelte";
  import { store } from "../store";

  import { AuthClient } from "@dfinity/auth-client";

  import spinner from "../assets/loading.gif";
  import Button from "./Button.svelte";

  export let loading;
  export let toggleModal;

  async function connect() {
    loading = "nfid";
    store.nfidConnect();
    loading = "";
    toggleModal();
  };
</script>

<Button
  on:click={connect}
  disabled={loading}
  style={"lg:h-16 2xl:h-20 lg:rounded-[55px]"}
>
  {#if loading === "nfid"}
    <img class="h-6 block" src={spinner} alt="loading animation" />
  {:else}
    NFID (incl. Google, MetaMask, WalletConnect, passkey)
  {/if}
</Button>
