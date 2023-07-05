<script>
  export let modelUrl;
  modelUrl = modelUrl;

  // Define the items
  let items = [
    { name: 'Couch', url: './couch.glb' },
    { name: 'Discovery Space Shuttle', url: './discovery_space_shuttle.glb' },
    { name: 'Laptop', url: './laptop.glb' },
    { name: 'Table', url: './rectangle_table.glb' },
    { name: 'Bed', url: './single_bed.glb' },
    { name: 'Spacestation', url: './spacestation_scene_texture_test.glb' },
    { name: 'Bookshelf', url: './standart_bookshelf.glb' },
    { name: 'Wardrobe', url: './twin_wardrobe.glb' },
    { name: 'Gaming Chair', url: './gaming_chair.glb' },
    { name: 'Lamp', url: './cylinder_lamp.glb' },
    { name: 'Blue Flower', url: './blue_flower.glb' },
    { name: 'Armchair', url: './armchair.glb' },
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





