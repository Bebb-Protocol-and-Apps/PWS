<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  import { addElementToSpace } from '../helpers/ai_assistant_helpers.js';

  export let viewerIsSpaceOwner: Boolean = false;

  const aiAssistantUrl = "https://xfl6h-3qaaa-aaaai-acq3a-cai.raw.icp0.io/#/embedagent"; // TODO
  
  const allowedOrigins = [
    "https://xfl6h-3qaaa-aaaai-acq3a-cai.icp0.io",
    "https://xfl6h-3qaaa-aaaai-acq3a-cai.raw.icp0.io",
  ];

  // Functionality to get the position in the scene for a new element to be added
  async function checkCollisionAtPosition(sceneEl, positionToCheck) {
    // Convert the position to a THREE.Vector3 if it's not already one
    var position = positionToCheck;
    // @ts-ignore
    if (!(position instanceof THREE.Vector3)) {
      // @ts-ignore
      position = new THREE.Vector3(positionToCheck.x, positionToCheck.y, positionToCheck.z);
    };

    // Direction for raycasting (downward in this case, but can be any direction)
    // @ts-ignore
    var direction = new THREE.Vector3(0, -1, 0);

    // Create a raycaster
    // @ts-ignore
    var raycaster = new THREE.Raycaster(position, direction.normalize());

    // Check for collisions
    var collisions = raycaster.intersectObjects(sceneEl.object3D.children, true);

    if (collisions.length > 0) {
      return collisions[0]; // return the collided entity
    } else {
      return false;
    };
  };

  async function checkPositionForEntity(sceneEl, positionToCheck, checksConducted = 0) {
    // check the position with checkCollisionAtPosition 
    const collision = await checkCollisionAtPosition(sceneEl, positionToCheck);
    
    // if there is a collision, determine a good next position (e.g., to the right of it)
    if (collision && collision.distance < 0.1 && checksConducted < 5) {
      // Assuming we're moving to the right of the collided entity, adjust the x-coordinate. You might want to adjust the value '1' depending on your scene scale.
      const nextPosition = {
        x: collision.object.position.x + 1, // moving to the right; adjust as needed
        y: collision.object.position.y, // same height
        z: collision.object.position.z // same depth
      };
      return await checkPositionForEntity(sceneEl, nextPosition, checksConducted++); // recursive check with the new position
    } else {
      return positionToCheck;
    };
  };

  const addedElements = []; // already added elements
  /* 
    an element looks like this:
    {
      elementType: "image" || "video" || "model",
      src: urlToAsset, // asset for element will be loaded from here
      elementSubType: e.g. "360Degree" || "gltf", // optional, depends on elementType
      assetId: existingContentAssetToUseForElement, // optional
      assignedPosition: positionInScene,
    }
  */

  async function calculateElementPosition(elementData) {
    let proposedPosition;
    if (addedElements.length === 0) {
      let yOffset = 2;
      switch (elementData.elementType) {
        case 'model':
          yOffset += 3;
          break;
        case '3D-model':
          yOffset += 3;
          break;
      };
      // @ts-ignore
      proposedPosition = new THREE.Vector3(-2, yOffset, -6); // starting position
    } else {
      const lastElement = addedElements[addedElements.length - 1];
      let xOffset;
      let yOffset = 0;
      switch (lastElement.elementType) {
        case 'image':
          xOffset = 0.2;
          break;
        case 'video':
          xOffset = 2;
          break;
        case 'model':
          xOffset = 2;
          break;
        case '3D-model':
          xOffset = 2;
          break;
        default:
          xOffset = 2; // handle unknown types or adjust as necessary
      };
      switch (elementData.elementType) {
        case 'image':
          xOffset += 1;
          break;
        case 'video':
          xOffset += 2.5;
          break;
        case 'model':
          xOffset += 3;
          yOffset += 3;
          break;
        case '3D-model':
          xOffset += 3;
          yOffset += 3;
          break;
        default:
          xOffset += 3; // handle unknown types or adjust as necessary
          yOffset += 1.5;
      };
      // @ts-ignore
      proposedPosition = new THREE.Vector3(lastElement.assignedPosition.x + xOffset, lastElement.assignedPosition.y + yOffset, lastElement.assignedPosition.z);
    };
    // Check if the proposed position is free, or find the next suitable position
    const suitablePosition = await checkPositionForEntity(document.querySelector('a-scene'), proposedPosition);
    // assign the position to the elementData
    elementData.assignedPosition = suitablePosition;

    // Add element data to the list of added elements
    addedElements.push(elementData);
  };
  
  const handleMessage = async (event) => {
    // Check if event.origin is in allowedOrigins
    if (!allowedOrigins.includes(event.origin)) return;

    let { action, data } = event.data;
    if (action === 'addElementToSpace') {
      console.log("Debug Heeeyaa");
      data = JSON.parse(data);
      await calculateElementPosition(data);
      addElementToSpace(data);
    };
  };

  onMount(() => {
    window.addEventListener('message', handleMessage);
  });

  onDestroy(() => {
    window.removeEventListener('message', handleMessage);
  });
</script>

<div class="ai-assistant-overlay">
  <iframe src={aiAssistantUrl} title="AI Assistant window" width="100%" height="100%"></iframe>
  <!-- {#if viewerIsSpaceOwner}
    <p>You can configure this assistant on the DeVinci app</p>
  {/if} -->
  <button on:click={() => window.open(aiAssistantUrl,'_blank')} class="active-app-button bg-slate-500 text-white py-2 px-4 rounded">Go to DeVinci</button>
</div>

<style>
  .ai-assistant-overlay {
    border: 1px solid white;
    border-radius: 10px;
    z-index: 10;
    position: fixed;
    height: 60%; 
    width: 40%;
    /* margin-left: 4%;
    margin-top: 2%; */
    top: 2%;
    left: 4%;
    text-align: center;
    padding-top: 0.5em;
    padding-bottom: 0.5em;
    background: #1d1d2f;
    opacity: 70%;
    color: #eef;
  }
</style>
