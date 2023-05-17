<script lang="ts">
  import { onMount } from "svelte";
  import { store } from "../store";



  const addAFrameTestRoom = async () => {
    // Assuming you have a canister object with a method `storeFile`
    try {
      console.log("calling api");
      let fileIdsResponse = await $store.backendActor.listUserFileIds();
      let fileIds = fileIdsResponse.Ok.FileIds;
      console.log("Number of FileIds found: " + fileIds.length);
      
      for (let i = 0; i < fileIds.length; i++)
      {
        let fileData = await $store.backendActor.getFile(fileIds[i]);

        // Assuming you have a Uint8Array named `byteArray`
        const byteArray = new Uint8Array(fileData.Ok.File.file_content);

        // Step 1: Convert the Uint8Array to a Blob
        const blob = new Blob([byteArray], { type: "application/octet-stream" });

        // Step 2: Create a URL and pass it to the entities
        const url = URL.createObjectURL(blob);
        
        // Step 3: Create a new entity for the new object
        let scene = document.querySelector('a-scene');
        let entity = document.createElement('a-entity');
        entity.setAttribute('gltf-model',`url(${url})`);
        entity.setAttribute('id', `item${i}`);
        let y = -i * 2;
        entity.setAttribute('position', `0 .5 ${y}`);
        entity.setAttribute('rotation', '0 45 0');
        scene.appendChild(entity);
      }
    } catch (error) {
    console.error("Error:", error);
  }
  }; 

  onMount(addAFrameTestRoom);
</script>

<a-scene cursor="rayOrigin: mouse" gltf-model="dracoDecoderPath: https://www.gstatic.com/draco/v1/decoders/;" inspector="" keyboard-shortcuts="" screenshot="" vr-mode-ui="" device-orientation-permission-ui="" raycaster="direction: 0.9544506796854287 -0.10164039183312146 -0.2805229594810959; origin: -4.846717797159805 5.074580504821491 2.3289351396596443; useWorldCoordinates: true">
  <a-assets>
    <img crossorigin="anonymous" id="groundTexture" src="https://cdn.aframe.io/a-painter/images/floor.jpg">
    <img crossorigin="anonymous" id="skyTexture" src="https://cdn.aframe.io/a-painter/images/sky.jpg">
    <!-- <a-asset-item id="room-glb" src="roomModel.glb"></a-asset-item> -->
    <a-asset-item id="ground-glb" src="ground.glb"></a-asset-item>
  </a-assets>

  <a-light type="directional" intensity="0.9" position="-1 -2 2" light=""></a-light>
  <a-light type="directional" intensity="1.0" position="2 1 -1" light=""></a-light>

  <a-sky color="#ECECEC" material="" geometry=""></a-sky>
  
  <a-entity gltf-model="ground.glb" position="0 -0.1 -5" rotation="0 -90 0" id="Ground Panel 1"></a-entity>
  <a-entity gltf-model="ground.glb" position="5 -0.1 -5" rotation="0 -90 0" id="Ground Panel 3"></a-entity>
  <a-entity gltf-model="ground.glb" position="4.99758 -0.1 -0.00467" rotation="0 -90 0" id="Ground Panel 4"></a-entity>
  <a-entity gltf-model="ground.glb" id="Ground Panel 2" position="0.02808 -0.1 -0.01568" rotation="0 -90 0"></a-entity>
  
  <div class="a-loader-title" style="display: none;"></div>
  <div class="a-loader-title" style="display: none;"></div><div class="a-loader-title" style="display: none;"></div><div class="a-loader-title" style="display: none;"></div><div class="a-loader-title" style="display: none;"></div><div class="a-loader-title" style="display: none;"></div></a-scene>
