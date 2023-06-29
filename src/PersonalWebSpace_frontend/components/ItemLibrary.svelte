<script>
  export let modelUrl;
  modelUrl = modelUrl;

  // Define the items
  let items = [
    { name: 'Discovery Space Shuttle', url: 'http://172.31.141.171:3000/discovery_space_shuttle.glb' },
    { name: 'Couch', url: 'http://172.31.141.171:3000/couch.glb' },
    { name: 'Laptop', url: 'http://172.31.141.171:3000/laptop.glb' },
    { name: 'Table', url: 'http://172.31.141.171:3000/rectangle_table.glb' },
    { name: 'Bed', url: 'http://172.31.141.171:3000/single_bed.glb' },
    { name: 'Spacestation', url: 'http://172.31.141.171:3000/spacestation_scene_texture_test.glb' },
    { name: 'Bookshelf', url: 'http://172.31.141.171:3000/standart_bookshelf.glb' },
    { name: 'Wardrobe', url: 'http://172.31.141.171:3000/twin_wardrobe.glb' },
    { name: 'Gaming Chair', url: 'http://172.31.141.171:3000/gaming_chair.glb' },
    { name: 'Lamp', url: 'http://172.31.141.171:3000/cylinder_lamp.glb' },
    { name: 'Blue Flower', url: 'http://172.31.141.171:3000/blue_flower.glb' },
    { name: 'Armchair', url: 'http://172.31.141.171:3000/armchair.glb' },
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





