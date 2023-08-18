<script lang="ts">
  import type { Entity } from "src/integrations/BebbProtocol/bebb.did";

  export let entity : Entity;
  export let viewerIsSpaceOwner: Boolean = false;
  export let deleteSpaceNeighborFunction; // Function passed to delete the link between the Space and the Neighbor

// Helper functions to check whether the Entity has got a valid URL that can be displayed
  const entityHasValidUrl = () => {
    return isValidUrl(entity.entitySpecificFields);
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
    } catch (e) {
      console.error(e);
      return false;
    }
    return true;
  };

// Owner clicked to delete the link to this Neighbor
  let linkDeletionInProgress = false;
  let successfullyDeletedLink = false;
  let errorDeletingLink = false;

  const deleteLinkFromSpaceToNeighbor = async () => {
    linkDeletionInProgress = true;
    if (deleteSpaceNeighborFunction && entity.id) {
      try {
          const deleteNeighborResponse = await deleteSpaceNeighborFunction(entity.id);
          if (deleteNeighborResponse) {
            successfullyDeletedLink = true;
          } else {
            errorDeletingLink = true;
          }
      } catch(err) {
          console.error("Delete Link err", err);
          errorDeletingLink = true;
      };
    };
    linkDeletionInProgress = false;
  };
</script>

{#if entityHasValidUrl()}
  <div class="space-neighbor-preview space-y-1">
    <a target="_blank" rel="noreferrer" href={entity.entitySpecificFields} >
      <iframe src={entity.entitySpecificFields} title="Entity Preview" width="100%" height="auto" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin"></iframe>
    </a>
    <button on:click={() => window.open(entity.entitySpecificFields,'_blank')} class="active-app-button bg-slate-500 text-white py-2 px-4 rounded font-semibold">Visit Neighbor</button>
    {#if viewerIsSpaceOwner}
      {#if linkDeletionInProgress}
        <button disabled class="bg-slate-500 text-white py-2 px-4 rounded font-bold opacity-50 cursor-not-allowed">Deleting...</button>
      {:else}
        {#if successfullyDeletedLink}
          <button disabled class="bg-slate-500 text-white py-2 px-4 rounded font-bold opacity-50 cursor-not-allowed">Deleted</button>
        {:else}
          <button on:click={() => deleteLinkFromSpaceToNeighbor()} class="active-app-button bg-slate-500 text-white py-2 px-4 rounded font-semibold">Delete Link</button>
          {#if errorDeletingLink}
            <h3 class="py-4 items-center leading-8 text-center text-xl font-bold">Unlucky, the deletion didn't work. Please give it another try.</h3>
          {/if}
        {/if}
      {/if}
    {/if}
    <button type="button" class="space-details-collapsible bg-slate-500 text-white py-2 px-4 rounded font-semibold">See Details</button>
    <div class="space-details-content">
      <p>Address: {entity.entitySpecificFields}</p>
      <p>Owner: {entity.owner}</p>
    </div>
  </div>
{/if}

<style>
  .space-neighbor-preview {
    border: 1px solid white;
    border-radius: 10px;
    margin-bottom: 2vmin;
    padding: 2vmin;
    width: 100%;
    height: auto;
  }
</style>
