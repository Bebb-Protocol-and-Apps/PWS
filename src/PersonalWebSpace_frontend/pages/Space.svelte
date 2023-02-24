<script lang="ts">
  import { onMount } from "svelte";
  import { fly, scale } from 'svelte/transition';
  import { quadOut } from 'svelte/easing';

  import { Hamburger } from 'svelte-hamburgers';
  import type { Principal } from "@dfinity/principal";

  import { store } from "../store";

  import Login from "../components/LoginSpace.svelte";
  import LoginModal from "../components/LoginModal.svelte";
  import Button from "../components/Button.svelte";
  import NotFound from "./NotFound.svelte";

  import spinner from "../assets/loading.gif"; // TODO: load other assets (e.g. html pages) similarly (see https://vitejs.dev/guide/assets.html: Referenced assets are included as part of the build assets graph, will get hashed file names, and can be processed by plugins for optimization)
  
  import { getEntityClipboardRepresentation } from '../helpers/entity.js';

  import { PersonalWebSpace_backend } from "canisters/PersonalWebSpace_backend";
    import ObjAframe from "./ObjAframe.svelte";

// This is needed for URL params
  export let params;

// Whether hamburger menu is open
  let open;

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

// Extract metadata fields from Space NFT
  const extractSpaceMetadata = (targetObject) => {
    for (var j = 0; j < spaceNft.metadata[0].key_val_data.length; j++) {
      let fieldKey = spaceNft.metadata[0].key_val_data[j].key;
      if (fieldKey === "spaceName") {
        targetObject.updatedSpaceName = spaceNft.metadata[0].key_val_data[j].val.TextContent;
      } else if (fieldKey === "spaceDescription") {
        targetObject.updatedSpaceDescription = spaceNft.metadata[0].key_val_data[j].val.TextContent;
      } else if (fieldKey === "ownerName") {
        targetObject.updatedOwnerName = spaceNft.metadata[0].key_val_data[j].val.TextContent;      
      } else if (fieldKey === "ownerContactInfo") {
        targetObject.updatedOwnerContactInfo = spaceNft.metadata[0].key_val_data[j].val.TextContent;      
      };
    };    
  };

// User clicked on Edit Space
  //TODO: Further customize Inspector
    // Button to export entity to HTML looks like this: <a href="#" title="Copy entity HTML to clipboard" data-action="copy-entity-to-clipboard" class="button fa fa-clipboard"></a>
      // Change href to not do anything/not change route
  const saveButtonOnClick = async () => {
    // Get updated scene and write it to backend
    console.log('in Space saveButton onclick');
    // Get edited scene HTML as String
    const updatedSceneHtml = getEntityClipboardRepresentation(AFRAME.scenes[0]); //TODO: get final updated HTML
    console.log('updatedSceneHtml', updatedSceneHtml);
    const updatedSceneHtmlLast = getEntityClipboardRepresentation(AFRAME.scenes[AFRAME.scenes.length-1]);
    console.log('updatedSceneHtmlLast', updatedSceneHtmlLast);
    console.log('document.querySelector(a-scene)', document.querySelector('a-scene'));
    const updatedSceneHtmlAScene = getEntityClipboardRepresentation(document.querySelector('a-scene'));
    console.log('updatedSceneHtmlAScene', updatedSceneHtmlAScene);
    // Close Inspector and hide button Inspect Scene
    await AFRAME.INSPECTOR.close();
    var elements = document.body.getElementsByClassName("toggle-edit");    
    var toggleElement = elements.item(0);
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
      updatedSpaceData: newHTML,
      updatedOwnerName: "",
      updatedOwnerContactInfo: "",
      updatedSpaceDescription: "",
      updatedSpaceName: "",
    };
    extractSpaceMetadata(updateInput); // Fill additional fields needed for update
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
      toggleElement.hidden = false;
      var clone = saveButton.cloneNode(true);
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
    if (AFRAME.INSPECTOR) {
      AFRAME.INSPECTOR.on('entityupdate', function(event){enableExportOfAllChangesMade(event)}, true);
    } else {
      // Inspector hasn't loaded yet
      setTimeout(() => {
        captureUpdateEvents();
      }, 1000);
    };
  };

  const customizeInspector = () => {
  // Change A-Frame's default Inspector according to our specific requirements
    // Ensure that all changes made will be included in updated HTML to be sent to backend
    captureUpdateEvents();
    // Initiate Save Button to persist changes made
    loadSaveButton();
  };

  const editButtonOnClick = async () => {
    // Open the AFrame Inspector (automatically injected by AFrame)
    await document.querySelector('a-scene').components.inspector.openInspector();
    open = false;
    // Wait until the Inspector has loaded
    setTimeout(() => {
      customizeInspector();     
    }, 1000);
  };

// Load Space scene from data stored in backend canister
  let loadingInProgress = true;
  let spaceLoadingError = false;
  let spaceNft;
  let spaceLoaded = false;
  let spaceString;
  let spaceOwnerPrincipal : Principal;
  
  const addSceneFromSpace = async () => {
    // If viewer is logged in, make authenticated call
    let spaceNFTResponse;
    if ($store.isAuthed) {
      spaceNFTResponse = await $store.backendActor.getSpace(Number(params.spaceId));
    } else {
      spaceNFTResponse = await PersonalWebSpace_backend.getSpace(Number(params.spaceId));
    };
    
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

      /* Example how to inject Svelte component into HTML document
      setTimeout(() => {
        console.log("Login button - Delayed for 1 second.");
        var div = document.createElement('DIV');
        div.setAttribute("style","position: absolute;top: 0;right: 0;width: 100%;height: 2em;display: flex;justify-content: end;align-items: end;z-index: 10;")
        const embed = new Login({
          target: div,
        });
        document.body.prepend(div);
      }, 1000); */
    };
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
        <div class="spaceMenu">
          <!-- Edit Button may only be displayed if logged-in user is space's owner -->
          {#if isViewerSpaceOwner()}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <p class="spaceMenuItem" on:click={() => editButtonOnClick()} transition:fly={{ y: -15, delay: 50 * 1 }}>
              Edit Space
            </p>
          {/if}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <p class="spaceMenuItem" transition:fly={{ y: -15, delay: 50 * 2 }}>
            <a href="#/" target="_blank">About OIM</a>
          </p>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <p class="spaceMenuItem" on:click={() => logout()} transition:fly={{ y: -15, delay: 50 * 3 }}>
            Logout
          </p>
        </div>

        <hr transition:scale={{ duration: 650, easing: quadOut, opacity: 1 }} />
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
</style>
