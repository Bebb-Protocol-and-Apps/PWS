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

  import spinner from "../assets/loading.gif";
  
  import { getEntityClipboardRepresentation } from '../src/entity.js';

  import { PersonalWebSpace_backend } from "canisters/PersonalWebSpace_backend";
  
  const PersonalWebSpace_frontend_canister_id = "vdfyi-uaaaa-aaaai-acptq-cai"; // deployed on mainnet

// this is needed for URL params
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

// Extract metadata field from Space NFT
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

  const enableExportOfAllChangesMade = () => {
    // Background: changes made in the Inspector's scene view are only reflected in the updated HTML (exported during save event) for properties that had already been present in the entity's initial HTML element
      // These properties have their dedicated PropertyRow (in the right panel) marked with a second class, propertyRowDefined (in addition to the class propertyRow)
      // Thus, all property rows in the right panel need to have the second class propertyRowDefined and we add it to those which don't have it yet (because the property isn't present in the entity's initial HTML element)
    var elements = document.body.getElementsByClassName("propertyRow");
    console.log('in enableExportOfAllChangesMade elements', elements);
    if(elements && elements.length > 0) {
      //[ ...elements ].forEach( x => x.className += ' btn' )    
      [ ...elements ].forEach( x => x.classList.add('propertyRowDefined') );
    } else {
      // Inspector hasn't loaded yet
      setTimeout(() => {
        enableExportOfAllChangesMade();
      }, 1000);
    };
  };

  const customizeInspector = () => {
    // Change A-Frame's default Inspector according to our specific requirements
    // Ensure that all changes made will be included in updated HTML to be sent to backend
    enableExportOfAllChangesMade();
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
    <h1>Loading this Space for You!</h1>
    <img class="h-6 block" src={spinner} alt="loading animation" />
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
          <!-- Edit Button may only be displayed if logged-in user is owner -->
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
