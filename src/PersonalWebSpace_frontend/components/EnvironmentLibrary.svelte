<script>
  export let envSelected;
  envSelected = envSelected;

  // Define the environment presets (from: https://github.com/supermedium/aframe-environment-component)
  const environments = [
    { name: 'Default', aframePreset: 'default' },
    { name: 'Contact', aframePreset: 'contact' },
    { name: 'Egypt', aframePreset: 'egypt' },
    { name: 'Checkerboard', aframePreset: 'checkerboard' },
    { name: 'Forest', aframePreset: 'forest' },
    { name: 'Goaland', aframePreset: 'goaland' },
    { name: 'Yavapai', aframePreset: 'yavapai' },
    { name: 'Goldmine', aframePreset: 'goldmine' },
    { name: 'Threetowers', aframePreset: 'threetowers' },
    { name: 'Poison', aframePreset: 'poison' },
    { name: 'Arches', aframePreset: 'arches' },
    { name: 'Tron', aframePreset: 'tron' },
    { name: 'Japan', aframePreset: 'japan' },
    { name: 'Dream', aframePreset: 'dream' },
    { name: 'Volcano', aframePreset: 'volcano' },
    { name: 'Starry', aframePreset: 'starry' },
    { name: 'Osiris', aframePreset: 'osiris' },
    { name: 'Moon', aframePreset: 'moon' }
  ];


  // Function to handle click on preview button
  function handlePreview(env) {
    envSelected = env;
  }
</script>

<div class="library-items-list space-y-1">
  {#each environments as item (item.name)}
    <div class="library-item">
      <span>{item.name}</span>
      <button on:click={() => handlePreview(item.aframePreset)} class="library-item-button">Preview</button>
    </div>
  {/each}
</div>

<style>
  .library-items-list {
    border: 1px solid white;
    border-radius: 10px;
    margin-bottom: 2vmin;
    padding: 2vmin;
    overflow-y: auto;
    height: 200px;
  }

  .library-item {
    border: 0.5px solid white;
    border-radius: 10px;
    margin-bottom: 2vmin;
    padding: 1.5vmin;
  }

  .library-item-button {
    border: 0.3px solid white;
    padding: 0.7vmin;
  }
</style>





