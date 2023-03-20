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
    await AFRAME.INSPECTOR.close();
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

  const customizeCopyEntityHtmlToClipboardButton = () => {
    // By default, the Copy entity HTML to clipboard button loads the Intro page when clicked
    // Suppress this behavior
    // Button to export entity to HTML looks like this: <a href="#" title="Copy entity HTML to clipboard" data-action="copy-entity-to-clipboard" class="button fa fa-clipboard"></a> 
    // and is part of the Inspector's Right Panel
    // it changes depending on which element is selected, thus we have to observe these changes and suppress the behavior each time the button is loaded
    const rightPanelElement = document.getElementById("rightPanel");
    if(rightPanelElement) {
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
    } else {
      // Inspector hasn't loaded yet
      setTimeout(() => {
        customizeCopyEntityHtmlToClipboardButton();
      }, 1000);
    };
  };

  const customizeInspector = () => {
  // Change A-Frame's default Inspector according to our specific requirements
    // Ensure that all changes made will be included in updated HTML to be sent to backend
    captureUpdateEvents();
    // Initiate Save Button to persist changes made
    loadSaveButton();
    // Avoid that Copy entity HTML to clipboard button loads the Intro page when clicked
    customizeCopyEntityHtmlToClipboardButton();
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
    const spaceNFTResponse = await $store.backendActor.getSpace(Number(params.spaceId));
    
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
