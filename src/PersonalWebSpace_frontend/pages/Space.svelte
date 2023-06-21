<script lang="ts">
  import { onMount } from "svelte";
  import { fly, scale } from 'svelte/transition';
  import { quadOut } from 'svelte/easing';

  import { Hamburger } from 'svelte-hamburgers';
  import type { Principal } from "@dfinity/principal";

  import { store } from "../store";

  import Login from "../components/LoginSpace.svelte";
  import NotFound from "./NotFound.svelte";
  import SpaceNeighbors from "../components/SpaceNeighbors.svelte";
  import SpaceInfo from "../components/SpaceInfo.svelte";
  
  import { getEntityClipboardRepresentation } from '../helpers/entity.js';
  import { extractSpaceMetadata } from '../helpers/space_helpers.js';
  
  import { PersonalWebSpace_backend } from "canisters/PersonalWebSpace_backend";
  import type { Entity } from "src/integrations/BebbProtocol/newwave.did";
  
// This is needed for URL params
  export let params;

// Whether hamburger menu is open
  let open;

// Whether the view with the space's neighbors should be displayed
  let showNeighborsView = false;

// Close open hamburger menu
  function handleEscape({ key }) {
    if (key === "Escape") {
      open = false;
    };
  };

// Check whether the current space viewer is its owner
  const isViewerSpaceOwner = () => {
    return $store.principal.toText() === spaceOwnerPrincipal.toText();    
  };

// User clicked on Logout
  const logout = async () => {
    await store.disconnect();
    open = false;
  };

// User clicked on Edit Space
  const saveButtonOnClick = async () => {
    // Get updated scene and write it to backend
    // Get edited scene HTML as String
    // @ts-ignore
    const updatedSceneHtml = getEntityClipboardRepresentation(AFRAME.scenes[0]); // Get final updated HTML
    // Close Inspector and hide button Inspect Scene
    // @ts-ignore
    //await AFRAME.INSPECTOR.close();
    AFRAME.INSPECTOR.close();
    showVRMenu();
    var elements = document.body.getElementsByClassName("toggle-edit");    
    var toggleElement = elements.item(0);
    // @ts-ignore
    toggleElement.hidden = true;
    // Assemble new scene HTML to be stored
    const respUpper = await fetch("spacesUpperHtml.html");
    const upperHTML = await respUpper.text();
    const respLower = await fetch("spacesLowerHtml.html");
    const lowerHTML = await respLower.text();
    const newHTML = upperHTML + updatedSceneHtml + lowerHTML;
    // Write space's updated HTML to backend canister
    let updateInput = {
      id: spaceNft.id,
      updatedSpaceData: [newHTML],
      updatedOwnerName: "",
      updatedOwnerContactInfo: "",
      updatedSpaceDescription: "",
      updatedSpaceName: "",
    };
    extractSpaceMetadata(spaceNft, updateInput, true); // Fill additional fields needed for update
    // @ts-ignore
    await $store.backendActor.updateUserSpace(updateInput); // Authenticated call; only space owner may update it
    //document.body.innerHTML = updatedSceneHtml; // there shouldn't be any need to manually update the viewed page
  };

  const loadSaveButton = () => {
    // Initiate functionality to save edits user made to scene in Inspector
    var elements = document.body.getElementsByClassName("button fa fa-save");
    var saveButton = elements.item(0);
    if(saveButton) {
      var elements = document.body.getElementsByClassName("toggle-edit");    
      var toggleElement = elements.item(0);
      // @ts-ignore
      toggleElement.hidden = false;
      var clone = saveButton.cloneNode(true);
      // @ts-ignore
      clone.onclick = saveButtonOnClick;
      saveButton.replaceWith(clone);         
    } else {
      // Inspector hasn't loaded yet
      setTimeout(() => {
        loadSaveButton();
      }, 1000);
    };
  };

  const enableExportOfAllChangesMade = (entityUpdateEvent) => {
    // Background: changes made in the Inspector's scene view are only automatically reflected in the updated HTML (exported during save event) for properties that had already been present in the entity's initial HTML element (only update event is emitted, no function call: https://github.com/aframevr/aframe-inspector/blob/master/src/lib/viewport.js)
      // These properties are displayed in bold in the Inspector's right panel as they have their dedicated PropertyRow marked with a second class, propertyRowDefined (in addition to the class propertyRow)
      // Changes made to properties in the Inspector's right panel are captured as expected for later export and persisting (and get the second class propertyRowDefined added so are bold as well) (update function is called: https://github.com/aframevr/aframe-inspector/blob/master/src/components/components/PropertyRow.js)
      // We thus need to ensure that all other changes made in the scene view will be captured as expected as well such that they are exported and persisted
      // To do so, we manually set the new attribute value on the updated entity element according to the entityupdate event (the Inspector does the same for edits made in the right panel)
      // Note that this also sets the second class, propertyRowDefined, on that PropertyRow in the Inspector's right panel
    if (["position", "rotation", "scale", "visible"].includes(entityUpdateEvent.component)) {
      // Only perform updates for these types of attribute changes (as these are the ones available in the scene view and scene graph panel on the left)
        // Note that update events in the Inspector's right panel are also captured and processed here (i.e. not only scene view update events)
      entityUpdateEvent.entity.setAttribute(entityUpdateEvent.component, entityUpdateEvent.value); // adapted from: https://github.com/aframevr/aframe-inspector/blob/master/src/lib/entity.js
    };
  };

  const captureUpdateEvents = () => {
    // Changes made in the Inspector's scene view are not automatically persisted
    // Capture events which update an entity and enable that all changes will be exported to persist them
    // @ts-ignore
    if (AFRAME.INSPECTOR) {
      // @ts-ignore
      AFRAME.INSPECTOR.on('entityupdate', function(event){enableExportOfAllChangesMade(event)}, true);
    } else {
      // Inspector hasn't loaded yet
      setTimeout(() => {
        captureUpdateEvents();
      }, 1000);
    };
  };

  const customizeCopyEntityHtmlToClipboardButton = (rightPanelElement) => {
    // By default, the Copy entity HTML to clipboard button loads the Intro page when clicked
    // Suppress this behavior
    // Button to export entity to HTML looks like this: <a href="#" title="Copy entity HTML to clipboard" data-action="copy-entity-to-clipboard" class="button fa fa-clipboard"></a> 
    // and is part of the Inspector's Right Panel
    // it changes depending on which element is selected, thus we have to observe these changes and suppress the behavior each time the button is loaded
    const observer = new MutationObserver((mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type === "childList") {
          var elements = document.body.getElementsByClassName("button fa fa-clipboard"); // There could be several Buttons matched
          for (const copyEntityHtmlToClipboardButton of elements) {
            // @ts-ignore
            copyEntityHtmlToClipboardButton.href = "javascript:;"; // "empty" behavior, i.e. shouldn't do anything
          };
        };
      };        
    });
    const config = {
      characterData: true,
      attributes: false,
      childList: true,
      subtree: true,
    };
    observer.observe(rightPanelElement, config);
  };

  const customizePropertyRows = (rightPanelElement) => {
    // Background: changes made in the Inspector's scene view are only automatically reflected in the updated HTML (exported during save event) for properties that had already been present in the entity's initial HTML element (only update event is emitted, no function call: https://github.com/aframevr/aframe-inspector/blob/master/src/lib/viewport.js)
      // These properties are displayed in bold in the Inspector's right panel as they have their dedicated PropertyRow marked with a second class, propertyRowDefined (in addition to the class propertyRow)
      // Changes made to properties in the Inspector's right panel are captured as expected for later export and persisting (and get the second class propertyRowDefined added so are bold as well) (update function is called: https://github.com/aframevr/aframe-inspector/blob/master/src/components/components/PropertyRow.js)
      // We thus need to ensure that all other changes made in the scene view will be captured as expected as well such that they are exported and persisted
      // To do so, we manually set the second class, propertyRowDefined, on the PropertyRows in the Inspector's right panel
      const observer = new MutationObserver((mutationList) => {
        for (const mutation of mutationList) {
          if (mutation.type === "characterData" || mutation.type === "childList") {
            // Select all the elements
            const propertyRowElements = document.querySelectorAll('.propertyRow');
            // Loop through each propertyRow element
            propertyRowElements.forEach((propertyRowElement) => {
              if (!propertyRowElement.classList.contains('propertyRowDefined')) {
                // Find the label and input elements within the current propertyRowElement
                const labelElement = propertyRowElement.querySelector('.text');
                // Extract the property name
                const property = labelElement.textContent.trim();
                if (["position", "rotation", "scale"].includes(property)) {
                  // Only perform updates for these types of attribute changes (as these are the ones available in the scene view and scene graph panel on the left)
                  const currentAttribute = AFRAME.INSPECTOR.selectedEntity.getAttribute(property);
                  // Set the value explicitly on the entity element (which will also add the class propertyRowDefined to the PropertyRow such that it appears bold in the Inspector's right panel)
                  AFRAME.INSPECTOR.selectedEntity.setAttribute(property, currentAttribute);
                };
              };
            });
          };
        };       
    });
    const config = {
      characterData: true,
      attributes: false,
      childList: true,
      subtree: true,
    };
    observer.observe(rightPanelElement, config);
  };

  const customizeRightPanel = () => {
    const rightPanelElement = document.getElementById("rightPanel");
    if(rightPanelElement) {
      // Avoid that Copy entity HTML to clipboard button loads the Intro page when clicked
      customizeCopyEntityHtmlToClipboardButton(rightPanelElement);
      // Ensure that changes made in the Inspector's scene view are persisted
      customizePropertyRows(rightPanelElement);
    } else {
      // Inspector hasn't loaded yet
      setTimeout(() => {
        customizeRightPanel();
      }, 1000);
    };
  };

  const customizeInspector = () => {
  // Change A-Frame's default Inspector according to our specific requirements
    // Remove any 3D Neighbors from the scene
    remove3dNeighborsFromScene();
    // Hide VR menu
    hideVRMenu();
    // Initiate Save Button to persist changes made
    loadSaveButton();
    // Customize features on the Right Panel
    customizeRightPanel();
  };

  const editButtonOnClick = async () => {
    // Open the AFrame Inspector (automatically injected by AFrame)
    // @ts-ignore
    await document.querySelector('a-scene').components.inspector.openInspector();
    open = false;
    // Wait until the Inspector has loaded
    setTimeout(() => {
      customizeInspector();     
    }, 1000);
  };

  const neighborsButtonOnClick = () => {
    open = false;
    showNeighborsView = true;
  };

// Load customizations for the scene
  let sceneCustomizationsLoaded = false;
  let vrMenuLoaded = false;
  let neighborVisualizationImageLoaded = false;
  let neighborsIn3DLoaded = false;
  let numberOfNeighbors = 0;

  function loadSceneCustomizations() {
    // Ensure a-scene has loaded, otherwise wait and try again
    const aScene = document.querySelector('a-scene');
    if (aScene) {
      // VR menu
      loadVRMenu();
      sceneCustomizationsLoaded = true;
    } else {
      setTimeout(() => {
        loadSceneCustomizations();
      }, 1000);
    };    
  };

  function loadVRMenu() {
    // Create a new element for the VR menu
    let menuEntity = document.createElement('a-entity');

    // Set properties on the new menu element
    menuEntity.setAttribute('id', 'OIM-VR-menu');
    menuEntity.setAttribute('geometry', 'primitive: plane; height: 0.2; width: 0.6');
    menuEntity.setAttribute('material', 'color: #333; opacity: 0.6');
    menuEntity.setAttribute('position', '-1.9 -1 -1.5'); // Position relative to the camera
    let isMenuOpen = false;
    const toggleMenu = () => {
      // When clicked, the menu items should change visiblity
      document.querySelectorAll('.menu-item').forEach(button => button.setAttribute('visible', `${!button.getAttribute('visible')}`));
      // The menu itself should also change size
      isMenuOpen = !isMenuOpen;
      if(isMenuOpen){
        openMenuText.setAttribute('position', '0 0.21 0.01'); // Position relative to the menu (top)
        menuEntity.setAttribute('geometry', 'primitive: plane; height: 0.5; width: 0.6');
      } else {
        openMenuText.setAttribute('position', '0 0.01 0.01'); // Position relative to the menu (center)
        menuEntity.setAttribute('geometry', 'primitive: plane; height: 0.2; width: 0.6');
      }
    };
    menuEntity.addEventListener('click', toggleMenu);

    // Create text entity as child of the menu like to indicate that the menu can be opened
    let openMenuText = document.createElement('a-text');
    openMenuText.setAttribute('class', 'menu-item');
    openMenuText.setAttribute('value', 'Open Menu');
    openMenuText.setAttribute('align', 'center');
    openMenuText.setAttribute('color', '#FFF');
    openMenuText.setAttribute('position', '0 0.01 0.01'); // Position relative to the menu (center)
    openMenuText.setAttribute('visible', 'true'); // Initially set to visible
    // Make the text smaller to fit the menu
    openMenuText.setAttribute('scale', '0.5 0.5 0.5');

    // Create another text entity as child of the menu to indicate that the menu can be closed
    let closeMenuText = document.createElement('a-text');
    closeMenuText.setAttribute('class', 'menu-item');
    closeMenuText.setAttribute('value', 'Close Menu');
    closeMenuText.setAttribute('align', 'center');
    closeMenuText.setAttribute('color', '#FFF');
    closeMenuText.setAttribute('position', '0 0.17 0.01'); // Position relative to the menu (top)
    closeMenuText.setAttribute('visible', 'false'); // Initially set to invisible
    // Make the text smaller to fit the menu
    closeMenuText.setAttribute('scale', '0.5 0.5 0.5');  

    // Create a button to load the Space's Neighbors in 3D as a child of the menu
    let buttonEntity = document.createElement('a-entity');
    buttonEntity.setAttribute('class', 'menu-item');
    buttonEntity.setAttribute('visible', 'false'); // Initially set to invisible
    buttonEntity.setAttribute('geometry', 'primitive: box; height: 0.15; width: 0.5; depth: 0.01');
    buttonEntity.setAttribute('material', 'color: #555; opacity: 0.8');
    buttonEntity.setAttribute('position', '0 -0.01 0.015'); // Position relative to the menu
    buttonEntity.addEventListener('click', function () {
      // Only trigger loading if button is visible (and thus was explicitly clicked)
      if (buttonEntity.getAttribute('visible')) {
        loadSpaceNeighborsIn3D();
      };
    });
    buttonEntity.addEventListener('mouseenter', function () {
      buttonEntity.setAttribute('material', 'color: #888');
    });
    buttonEntity.addEventListener('mouseleave', function () {
      buttonEntity.setAttribute('material', 'color: #555');
    });
    // Add text to the button
    let buttonText = document.createElement('a-text');
    buttonText.setAttribute('value', 'Load Neighbors');
    buttonText.setAttribute('align', 'center');
    buttonText.setAttribute('color', '#FFF');
    buttonText.setAttribute('position', '0 0 0.01'); // Position relative to the button
    // Make the text smaller to fit the button
    buttonText.setAttribute('scale', '0.3 0.3 0.3');
    buttonEntity.appendChild(buttonText);

    // Add the elements to the menu
    menuEntity.appendChild(openMenuText);
    menuEntity.appendChild(closeMenuText);
    menuEntity.appendChild(buttonEntity);

    // Find the camera entity
    let cameraEntity = document.querySelector('a-entity[camera]');

    // Append the new menu entity as a child of the camera entity (i.e. it will move with the camera)
    cameraEntity.appendChild(menuEntity);
    vrMenuLoaded = true;
  };

  const extractSpaceEntityId = () => {
    if (spaceNft && spaceNft.metadata && spaceNft.metadata.length > 0) {
        for (var j = 0; j < spaceNft.metadata[0].key_val_data.length; j++) {
            let fieldKey = spaceNft.metadata[0].key_val_data[j].key;
            if (fieldKey === "protocolEntityId") {
                return spaceNft.metadata[0].key_val_data[j].val.TextContent;
            };
        };
    };
  };

  const entityHasValidUrl = (entity) => {
    return isValidUrl(entity.externalId);
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

  function loadNeighborVisualizationImage() {
    if (!neighborVisualizationImageLoaded) {
      // Create a new a-asset element
      var newAsset = document.createElement('img');
      newAsset.setAttribute('id', 'OIM__NeighborVisualization__Webportal_');
      newAsset.setAttribute('src', './OIM_NeighborVisualization_Webportal.png');
      // Append the new a-asset to the a-assets element
      var assets = document.querySelector('a-assets');
      assets.appendChild(newAsset);
      neighborVisualizationImageLoaded = true;
    };
  };

  function loadNeighborsIn3D(spaceNeighbors: Entity[]) {
    // Create a new entity for each neighbor
    let neighborIndex = 0;
    for (const neighbor of spaceNeighbors) {
      // Only display neighbors that have a valid URL
      if (entityHasValidUrl(neighbor)) {
        // Create a new entity for the neighbor
        let neighborEntity = document.createElement('a-entity');
        // Set properties on the new neighbor entity
        neighborEntity.setAttribute('id', `OIM-VR-neighbor-${neighbor.internalId}`);
        neighborEntity.setAttribute('web-portal', `url:${neighbor.externalId}; text:${neighbor.name[0] || "Neighbor " + neighborIndex};`);
        neighborEntity.setAttribute('position', `${-5 - neighborIndex*3} 1.25 -10`); // Position all Neighbors along one line
        // Add the neighbor entity to the scene
        let scene = document.querySelector('a-scene');
        scene.appendChild(neighborEntity);
        neighborIndex++;
      };
    };    
  };

  const loadSpaceNeighborsIn3D = async () => {
    // Load the Space's Neighbors from Bebb Protocol and display them in 3D in the scene
    const spaceEntityId = extractSpaceEntityId();
    let spaceNeighborsResponse: Entity[] = [];
    try {
        spaceNeighborsResponse = await $store.protocolActor.get_bridged_entities_by_entity_id(spaceEntityId, true, false, false);
    } catch(err) {
        console.log("Error getting SpaceNeighbors", err);
    };
    // Only load Neighbors if they haven't been loaded yet or reload if new Neighbors have been added
    if (spaceNeighborsResponse.length === 0) {
      // Show message that this Space doesn't have Neighbors in scene
      // Create a new entity for the message
      let messageEntity = document.createElement('a-entity');
      // Set properties on the new message entity
      messageEntity.setAttribute('id', 'OIM-VR-noNeighborsMessage');
      messageEntity.setAttribute('text', `value: This Space doesn't have Neighbors; align: center; color: #000000; width: 5; wrapCount: 20;`);
      messageEntity.setAttribute('scale', '0.5 0.5 0.5');
      messageEntity.setAttribute('position', `-1.8 -0.9 -2`);
      // Find the camera entity
      let cameraEntity = document.querySelector('a-entity[camera]');
      // Add the message entity to the camera entity (i.e. it will move with the camera)
      cameraEntity.appendChild(messageEntity);
      // Remove message after 4 seconds
      setTimeout(() => {
        cameraEntity.removeChild(messageEntity);
      }, 4000);
    } else if (!neighborsIn3DLoaded) { // Neighbors haven't been loaded yet
      // Load visualization for Neighbors in VR/fullscreen mode
      loadNeighborVisualizationImage();
      // Load Neighbors in 3D
      loadNeighborsIn3D(spaceNeighborsResponse);
      numberOfNeighbors = spaceNeighborsResponse.length;
      neighborsIn3DLoaded = true;
    } else if (spaceNeighborsResponse.length > numberOfNeighbors) { // New Neighbors have been added
      // Remove all existing Neighbors from the scene
      remove3dNeighborsFromScene();
      // Load Neighbors in 3D
      loadNeighborsIn3D(spaceNeighborsResponse);
      numberOfNeighbors = spaceNeighborsResponse.length;
    };
  };

  const remove3dNeighborsFromScene = () => {
    // Remove all existing 3D Neighbors from the scene
    const scene = document.querySelector('a-scene');
    const neighborEntities = scene.querySelectorAll('a-entity[id^="OIM-VR-neighbor-"]');
    for (const neighborEntity of neighborEntities) {
      scene.removeChild(neighborEntity);
    };
    neighborsIn3DLoaded = false;
  };

  const hideVRMenu = () => {
    // Hide the VR menu
    const vrMenu = document.querySelector('#OIM-VR-menu');
    vrMenu.setAttribute('visible', 'false');
  };

  const showVRMenu = () => {
    // Show the VR menu
    const vrMenu = document.querySelector('#OIM-VR-menu');
    vrMenu.setAttribute('visible', 'true');
  };

// Load Space scene from data stored in backend canister
  let loadingInProgress = true;
  let spaceLoadingError = false;
  let spaceNft;
  let spaceLoaded = false;
  let spaceString;
  let spaceOwnerPrincipal : Principal;
  
  const addSceneFromSpace = async () => {
    // If viewer is logged in, make authenticated call (otherwise, default backendActor in store is used)
    // @ts-ignore
    const spaceNFTResponse: NftResult = await $store.backendActor.getSpace(Number(params.spaceId));
    
    loadingInProgress = false;
    if (spaceNFTResponse.Err) {
      spaceLoadingError = true;
    } else {
      spaceNft = spaceNFTResponse.Ok;
      const spaceHtml = spaceNFTResponse.Ok.metadata[0].data;
      var string = new TextDecoder().decode(spaceHtml);
      spaceString = string.replace(/\\"/g, '"');
      spaceLoaded = true;
      spaceOwnerPrincipal = spaceNFTResponse.Ok.owner;
      loadSceneCustomizations();
    };
  };

// User clicked to see Space's metadata
  const spaceMetadata = {
    spaceName: "",
    spaceDescription: "",
    creationTime: "",
    ownerName: "",
    ownerContactInfo: "",
    aboutDescription: "",
    id: null,
    spaceOwnerPrincipal: null,
    spaceData: null,
  };
  let showSpaceInfoView = false;

  const spaceInfoButtonOnClick = () => {
    extractSpaceMetadata(spaceNft, spaceMetadata); // Fill with Space's info from NFT metadata
    // Fill additional fields for usage in SpaceInfo
    spaceMetadata.id = spaceNft.id;
    spaceMetadata.spaceOwnerPrincipal = spaceOwnerPrincipal;
    spaceMetadata.spaceData = spaceNft.metadata[0].data;

    open = false;
    showSpaceInfoView = true;
  };

  onMount(addSceneFromSpace);
</script>

<svelte:window on:keyup={handleEscape} />

<div>
  {#if loadingInProgress}
    <h1 class="items-center text-center font-bold text-xl bg-slate-300">Loading this Space for You!</h1>
  {:else if spaceLoadingError}
    <NotFound />
  {:else if spaceLoaded}
    {#if !$store.isAuthed}
      <Login />
    {:else}
      <div class="hamburgerParent">
        <Hamburger
          bind:open />
      </div>

      {#if open}
        {showNeighborsView=false}
        {showSpaceInfoView = false}
        <div class="spaceMenu">
          <!-- Edit Button may only be displayed if logged-in user is space's owner -->
          {#if isViewerSpaceOwner()}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <p class="spaceMenuItem" on:click={() => editButtonOnClick()} transition:fly={{ y: -15, delay: 50 * 1 }}>
              Edit Space
            </p>
          {/if}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <p class="spaceMenuItem" on:click={() => neighborsButtonOnClick()} transition:fly={{ y: -15, delay: 50 * 2 }}>
            Discover Neighbors
          </p>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <p class="spaceMenuItem" on:click={() => spaceInfoButtonOnClick()} transition:fly={{ y: -15, delay: 50 * 3 }}>
            Space Info
          </p>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <p class="spaceMenuItem" transition:fly={{ y: -15, delay: 50 * 4 }}>
            <a href="#/" target="_blank">About OIM</a>
          </p>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <p class="spaceMenuItem" on:click={() => logout()} transition:fly={{ y: -15, delay: 50 * 5 }}>
            Logout
          </p>
        </div>

        <hr transition:scale={{ duration: 650, easing: quadOut, opacity: 1 }} />
      {:else if showNeighborsView}
        <div class="spaceNeighborsView max-h-screen overflow-y-auto">
          <SpaceNeighbors spaceNft={spaceNft} />
        </div>
      {:else if showSpaceInfoView}
        <SpaceInfo spaceMetadata={spaceMetadata} />
      {/if}
    {/if}
    <div style="position: absolute; height: 100%; width: 100%;">
      {@html spaceString}
    </div>
  {/if}
</div>

<style>
  .hamburgerParent {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 100;
  }
  div.spaceMenu {
    z-index: 10;
    position: relative;
    height: 60%; 
    width: 50%;
    margin: auto;
    text-align: center;
    font-size: 1.5em;
    letter-spacing: 0.15em;
    padding: 1em;
    padding-top: 0;
    background: #1d1d2f;
    opacity: 80%;
    color: #eef;
  }
  p.spaceMenuItem {
    cursor: pointer;
    width: max-content;
    margin: 1rem auto;
  }
  p.spaceMenuItem:hover {
    text-decoration: underline;
  }
  div.spaceNeighborsView {
    z-index: 20;
    position: relative;
    height: 80%; 
    width: 80%;
    margin: auto;
    text-align: center;
    font-size: 1.5em;
    letter-spacing: 0.15em;
    padding: 1em;
    padding-top: 0;
    background: #2b6163;
    opacity: 80%;
    color: #eef;
  }
</style>
