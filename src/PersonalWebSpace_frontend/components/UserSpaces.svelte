<script lang="ts">
  import { afterUpdate } from "svelte";

  import UserSpace from "./UserSpace.svelte";

  import { initiateCollapsibles } from "../helpers/space_helpers.js";
  
  export let spaces; // Array of Space NFTs
  export let entityIdToLinkTo: string = ""; // If Entity Id is provided, each Space should include a Link button to that Entity

  afterUpdate(initiateCollapsibles);
</script>

<div id='userSpaces' class="space-y-4">
  {#each spaces as space}
    <UserSpace space={space} entityIdToLinkTo={entityIdToLinkTo} />
  {/each}
</div>
