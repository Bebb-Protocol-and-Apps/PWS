<script>
  export let entity

// Helper functions to check whether the Entity has got a valid URL that can be displayed
  const entityHasValidUrl = () => {
    return isValidUrl(entity.externalId);
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
    } catch (e) {
      console.error('in isValidUrl');
      console.error(e);
      console.error(url);
      return false;
    }
    return true;
  };

  const inputHandler = function(e) {
    if (!isValidUrl(e.target.value)) {
      e.target.value = null;
      e.target.placeholder = "Please only enter valid URLs";
    }
  };
</script>

{#if entityHasValidUrl()}
  <div class="space-neighbor-preview">
    <iframe src={entity.externalId} title="Entity Preview" width="100%" height="auto"></iframe>
    <button on:click={() => window.open(entity.externalId,'_blank')} class="active-app-button bg-slate-500 text-white py-2 px-4 rounded font-semibold">Visit Neighbor</button>
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
