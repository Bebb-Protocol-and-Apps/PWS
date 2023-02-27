<script>
  import { onMount } from "svelte";

  import UserSpace from "./UserSpace.svelte";

  import { initiateCollapsibles } from "../helpers/space_helpers.js";
  
  export let spaces

  onMount(initiateCollapsibles);
</script>

<div id='userSpaces' class="space-y-4">
  {#each spaces as space}
    <UserSpace space={space} />
  {/each}
</div>
