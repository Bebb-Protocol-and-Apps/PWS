<script>
  export let modelUrl;
  modelUrl = modelUrl;

  const baseUrl = process.env.NODE_ENV !== "development" ? "https://vdfyi-uaaaa-aaaai-acptq-cai.raw.ic0.app/" : "./";

  // Define the items
  let items = [
    { name: 'Couch', url: baseUrl + 'couch.glb' },
    { name: 'Discovery Space Shuttle', url: baseUrl + 'discovery_space_shuttle.glb' },
    { name: 'Laptop', url: baseUrl + 'laptop.glb' },
    { name: 'Table', url: baseUrl + 'rectangle_table.glb' },
    { name: 'Bed', url: baseUrl + 'single_bed.glb' },
    { name: 'Spacestation', url: baseUrl + 'spacestation_scene_texture_test.glb' },
    { name: 'Bookshelf', url: baseUrl + 'standart_bookshelf.glb' },
    { name: 'Wardrobe', url: baseUrl + 'twin_wardrobe.glb' },
    { name: 'Gaming Chair', url: baseUrl + 'gaming_chair.glb' },
    { name: 'Lamp', url: baseUrl + 'cylinder_lamp.glb' },
    { name: 'Blue Flower', url: baseUrl + 'blue_flower.glb' },
    { name: 'Armchair', url: baseUrl + 'armchair.glb' },
  ];

  // Function to handle click on preview button
  function handlePreview(itemUrl) {
    modelUrl = itemUrl;
  }
</script>

<div class="library-items-list space-y-1">
  {#each items as item (item.name)}
    <div class="library-item">
      <span>{item.name}</span>
      <button on:click={() => handlePreview(item.url)} class="library-item-button">Preview</button>
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





