<script lang="ts">
  import { onMount } from "svelte";
  import { fly, scale } from 'svelte/transition';
  import { quadOut } from 'svelte/easing';

  import { Hamburger } from 'svelte-hamburgers';
  import type { Principal } from "@dfinity/principal";

  import { store, appDomain } from "../store";

  import Login from "../components/LoginSpace.svelte";
  import NotFound from "./NotFound.svelte";
  import SpaceNeighbors from "../components/SpaceNeighbors.svelte";
  import SpaceInfo from "../components/SpaceInfo.svelte";
  import GlbModelPreview from "../components/GlbModelPreview.svelte";
  import ItemLibrary from "../components/ItemLibrary.svelte";
  import EnvironmentLibrary from "../components/EnvironmentLibrary.svelte";
  import MediaContentPreview from "../components/MediaContentPreview.svelte";
  import EnvironmentPreview from "../components/EnvironmentPreview.svelte";
  import FileSpacePreview from "../components/FileSpacePreview.svelte";
  import MyFilesLibrary from "../components/MyFilesLibrary.svelte";
  
  import { getEntityClipboardRepresentation } from '../helpers/entity.js';
  import { extractSpaceMetadata } from '../helpers/space_helpers.js';
  import { supportedImageExtensions, supportedVideoExtensions, supported3dModelExtensions } from "../helpers/utils";
  
  import { canisterId as backendCanisterId } from "canisters/PersonalWebSpace_backend";
  import type { Entity, EntityAttachedBridgesResult, Bridge } from "src/integrations/BebbProtocol/bebb.did";
  

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
    }
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

  // Initiate functionality to save edits user made to scene in Inspector
  const loadSaveButton = () => {
    // Use Back To Scene button for saving edits made in Inspector
    var elements = document.body.getElementsByClassName("toggle-edit");
    var saveButton = elements.item(0);
    if(saveButton) {
      var clone = saveButton.cloneNode(true);
      // @ts-ignore
      clone.onclick = saveButtonOnClick;
      clone.textContent = "Save My Changes and Exit";
      // @ts-ignore
      clone.title = "Click to confirm your edits and store the updated space";
      saveButton.replaceWith(clone);
      // Hide button with save icon
      var elements = document.body.getElementsByClassName("button fa fa-save");
      var toggleElement = elements.item(0);
      // @ts-ignore
      toggleElement.style.display = 'none';    
    } else {
      // Inspector hasn't loaded yet
      setTimeout(() => {
        loadSaveButton();
      }, 500);
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
      }, 500);
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
                  // @ts-ignore
                  const currentAttribute = AFRAME.INSPECTOR.selectedEntity.getAttribute(property);
                  // Set the value explicitly on the entity element (which will also add the class propertyRowDefined to the PropertyRow such that it appears bold in the Inspector's right panel)
                  // @ts-ignore
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
      }, 500);
    };
  };

  const customizeLeftPanel = () => {
    const leftPanelElement = document.getElementById("scenegraph");
    if(leftPanelElement) {
      // Initiate Save Button to persist changes made
      loadSaveButton();
      // Remove elements of the Inspector that we don't want
      removeUndesiredInspectorButtons();
      // Add dropdown menu with options to add elements to the space
      addDropdownMenuForNewElements();
    } else {
      // Inspector hasn't loaded yet
      setTimeout(() => {
        customizeLeftPanel();
      }, 500);
    };
  };

  const addLinkButtonToToolbar = (toolbar) => {
    // Create a new anchor element
    const newButton = document.createElement("a");
    // Add required properties to the anchor element
    newButton.title = "link";
    newButton.className = "button fa fa-external-link";
    // Add click event listener to the new button
    newButton.addEventListener("click", function() {
      // Remove 'active' class from other toolbar buttons
      const toolbarButtons = toolbar.querySelectorAll(".button");
      toolbarButtons.forEach(button => button.classList.remove("active"));
      // Add 'active' class to this button
      newButton.classList.add("active");
      // @ts-ignore
      if (AFRAME.INSPECTOR.selectedEntity) {
        // Show a popup for URL input
        const url = prompt("Enter the URL to link the selected item. The link will be displayed when the item is clicked.");
        if (isValidUrl(url)) {
          // Here you can handle the URL, for example, attach it to the selected item
          // @ts-ignore
          AFRAME.INSPECTOR.selectedEntity.setAttribute('new-tab-link', { href: url });
        } else {
          alert("The URL you entered is not valid. Please try again.");
        };
      } else {
        alert("Please select an item in the scene to add a link to.");
      };
      newButton.classList.remove("active");
    });
    // Add the new button to the toolbar (as first child)
    toolbar.prepend(newButton);
  };

  const customizeCentralToolbar = () => {
    // Get the toolbar element by its ID
    const toolbar = document.getElementById("transformToolbar");
    if(toolbar) {
      // Add a new button for adding a URL link to an item to the toolbar
      addLinkButtonToToolbar(toolbar);
    } else {
      // Inspector hasn't loaded yet
      setTimeout(() => {
        customizeCentralToolbar();
      }, 500);
    };
  };

  const changeInspectorCameraPosition = () => {
    // Ensure Inspector has loaded successfully
    const toolbar = document.getElementById("transformToolbar");
    if(toolbar) {
      // Set the Inspector's camera to match the last scene view (the user had before opening the Inspector)
      // @ts-ignore
      AFRAME.INSPECTOR.cameras.perspective.position.set(AFRAME.INSPECTOR.cameras.original.object3D.position.x, AFRAME.INSPECTOR.cameras.original.object3D.position.y, AFRAME.INSPECTOR.cameras.original.object3D.position.z);
      // @ts-ignore
      AFRAME.INSPECTOR.cameras.perspective.rotation.set(AFRAME.INSPECTOR.cameras.original.object3D.rotation.x, AFRAME.INSPECTOR.cameras.original.object3D.rotation.y, AFRAME.INSPECTOR.cameras.original.object3D.rotation.z);
    } else {
      // Inspector hasn't loaded yet
      setTimeout(() => {
        changeInspectorCameraPosition();
      }, 500);
    };
  };

  // Edit mode options
  //  Function to toggle whether any Edit Mode option's popup is open
  let openEditModelPopup = false;
  const toggleOpenEditModePopup = () => {
    // Close all option popups
    openUploadModelFilePopup = false;
    openItemsToAddLibraryPopup = false;
    openAddMediaContentPopup = false;
    openEnvironmentOptionPopup = false;
    openAddFromMyFilesPopup = false;
    // Toggle whether the Edit Mode popup is open
    openEditModelPopup = !openEditModelPopup;
    resetUploadVariables();
  };

  const resetUploadVariables = () => {
    isAddingLibraryItemInProgress = false;
    wasLibraryItemAddedSuccessfully = false;

    isFileUploadInProgress = false;
    wasFileUploadedSuccessfully = false;

    isAddingItemInProgress = false;
    wasItemAddedSuccessfully = false;

    isAddingEnvironmentInProgress = false;
    wasEnvironmentAddedSuccessfully = false;

    isAddingMyFileInProgress = false;
    wasMyFileAddedSuccessfully = false;
  };

  // Media Content
    // uses several variables from Upload model file option
  let openAddMediaContentPopup = false;

  // Add via URL
  let webHostedItemUrl = "";
  let isAddingItemInProgress = false;
  let wasItemAddedSuccessfully = false;

  // Library
  let openItemsToAddLibraryPopup = false;
  let userSelectedLibraryItemURL = "";
  // Manage status of adding item to show buttons and subtexts appropriately
  let isAddingLibraryItemInProgress = false;
  let wasLibraryItemAddedSuccessfully = false;
  const setAddingLibraryItemInProgress = async () => {
    isAddingLibraryItemInProgress = true;
  };
  const setLibraryItemWasAdded = async () => {
    isAddingLibraryItemInProgress = false;
    wasLibraryItemAddedSuccessfully = true;
  };

  const addLibraryItemToSpace = async () => {
    await setAddingLibraryItemInProgress();
    // Include the library item selected by the user as a new entity in the Space
    if (isValidLibraryItem(userSelectedLibraryItemURL)) {
      try {
        let scene = document.querySelector('a-scene');
        var modelEntity = scene.ownerDocument.createElement('a-entity');
        modelEntity.setAttribute('gltf-model', `url(${userSelectedLibraryItemURL})`);
        modelEntity.setAttribute('position', '0 3 -6');
        modelEntity.setAttribute('id', 'userAddedLibraryItem_' + Math.random().toString(36).substr(2, 9));
        // @ts-ignore
        modelEntity.setAttribute('animation-mixer');
        scene.appendChild(modelEntity);
      } catch (error) {
        console.error("Adding Library Item to Space Error:", error);
      };
    };
    await setLibraryItemWasAdded();
  };

  // My Files (Personal User Library with files uploaded by the user)
  let openAddFromMyFilesPopup = false;
  let userSelectedMyFile = {
    file_id: "",
    file_name: "",
  };
  let setMyFileAs360Degree = false;

  let isAddingMyFileInProgress = false;
  let wasMyFileAddedSuccessfully = false;
  const setAddingMyFileInProgress = () => {
    isAddingMyFileInProgress = true;
  };
  const setMyFileWasAdded = () => {
    isAddingMyFileInProgress = false;
    wasMyFileAddedSuccessfully = true;
  };
  const isValidMyFile = (myFile) => {
    return myFile && myFile.file_id !== "" && myFile.file_name !== "";
  };

  const addMyFileToSpace = async () => {
    setAddingMyFileInProgress();
    // Include the file selected by the user as a new entity in the Space
    if (isValidMyFile(userSelectedMyFile)) {
      try {
        const fileURL = process.env.DFX_NETWORK === "local"
          ? `http://127.0.0.1:4943/file/fileId=${userSelectedMyFile.file_id}?canisterId=${backendCanisterId}` // e.g. http://127.0.0.1:4943/file/fileId=888?canisterId=bkyz2-fmaaa-aaaaa-qaaaq-cai
          : `https://${backendCanisterId}.raw${appDomain}/file/fileId=${userSelectedMyFile.file_id}`; // e.g. https://vee64-zyaaa-aaaai-acpta-cai.raw.ic0.app/file/fileId=777
      
        const imageExtensions = supportedImageExtensions;
        const videoExtensions = supportedVideoExtensions;
        const modelExtensions = supported3dModelExtensions;

        const fileName = userSelectedMyFile.file_name;
        const isImage = imageExtensions.some(ext => fileName.endsWith(ext));
        const isVideo = videoExtensions.some(ext => fileName.endsWith(ext));
        const isModel = modelExtensions.some(ext => fileName.endsWith(ext));
        
        let scene = document.querySelector('a-scene');
        const set360DegreeContent = setMyFileAs360Degree ? true : false;
        let contentEntity;
        if (isModel) {
          const modelEntityId = 'modelFromUserFile_' + userSelectedMyFile.file_id;
          contentEntity = scene.ownerDocument.createElement('a-entity');
          contentEntity.setAttribute('gltf-model', `url(${fileURL})`);
          contentEntity.setAttribute('position', '0 3 -6');
          contentEntity.setAttribute('id', modelEntityId);
          // @ts-ignore
          contentEntity.setAttribute('animation-mixer');
          scene.appendChild(contentEntity);
        } else if (isImage) {
          const imageEntityId = 'imageFromUserFile_' + userSelectedMyFile.file_id;
          const assetImageEntityId = 'asset_' + imageEntityId;
          function loaded() {
            // Determine whether the image is 360 degree and set the appropriate attribute
            if (set360DegreeContent) {
              contentEntity = scene.ownerDocument.createElement('a-sky');
              contentEntity.setAttribute('src', `#${assetImageEntityId}`);
              contentEntity.setAttribute('id', imageEntityId);
              contentEntity.setAttribute('rotation', '0 -130 0');
              const existingSky = scene.querySelector('a-sky');
              if (existingSky) {
                scene.replaceChild(contentEntity, existingSky);
              } else {
                scene.appendChild(contentEntity);
              };
            } else {
              contentEntity = scene.ownerDocument.createElement('a-image');
              contentEntity.setAttribute('src', `#${assetImageEntityId}`);
              contentEntity.setAttribute('id', imageEntityId);
              contentEntity.setAttribute('position', '0 3 -6');
              scene.appendChild(contentEntity);
            };
          };
          const existingImageAsset = scene.querySelector(`#${assetImageEntityId}`);
          if (existingImageAsset) {
            loaded();
          } else {
            // Create a new img element
            var newImageAsset = document.createElement('img');
            newImageAsset.setAttribute('id', assetImageEntityId);
            newImageAsset.setAttribute('crossorigin', 'anonymous');
            newImageAsset.setAttribute('src', fileURL);
            // Append the new a-asset to the a-assets element
            var assets = document.querySelector('a-assets');
            assets.appendChild(newImageAsset);
            newImageAsset.addEventListener('load', loaded);
          };
        } else if (isVideo) {
          const videoEntityId = 'videoFromUserFile_' + userSelectedMyFile.file_id;
          const assetVideoEntityId = 'asset_' + videoEntityId;
          function loaded() {
            // Determine whether the video is 360 degree and set the appropriate attribute
            if (set360DegreeContent) {
              contentEntity = scene.ownerDocument.createElement('a-videosphere');
              contentEntity.setAttribute('src', `#${assetVideoEntityId}`);
              contentEntity.setAttribute('id', videoEntityId);
              contentEntity.setAttribute('rotation', '0 -130 0');
              contentEntity.setAttribute('autoplay', true);
              contentEntity.setAttribute('loop', true);
              const existingVideosphere  = scene.querySelector('a-videosphere');
              if (existingVideosphere) {
                scene.replaceChild(contentEntity, existingVideosphere);
              } else {
                scene.appendChild(contentEntity);
              };
            } else {
              contentEntity = scene.ownerDocument.createElement('a-video');
              contentEntity.setAttribute('src', `#${assetVideoEntityId}`);
              contentEntity.setAttribute('id', videoEntityId);
              contentEntity.setAttribute('position', '0 3 -6');
              contentEntity.setAttribute('video-play-on-click', true); // Add component to play video on click
              scene.appendChild(contentEntity);
            };
          };
          const existingVideoAsset = scene.querySelector(`#${assetVideoEntityId}`);
          if (existingVideoAsset) {
            loaded();
          } else {
            // Create a new video element
            var newVideoAsset = document.createElement('video');
            newVideoAsset.setAttribute('id', assetVideoEntityId);
            newVideoAsset.setAttribute('crossorigin', 'anonymous');
            newVideoAsset.setAttribute('src', fileURL);
            // Append the new a-asset to the a-assets element
            var assets = document.querySelector('a-assets');
            assets.appendChild(newVideoAsset);
            newVideoAsset.addEventListener('loadeddata', loaded);
          };
        };
      } catch (error) {
        console.error("Adding My File to Space Error:", error);
      };
    };
    setMyFileWasAdded();
  };


  // Upload model file
  let openUploadModelFilePopup = false;
  let files;
  let is360Degree = false; // This will store the state of the checkbox
  let userUploadedFileURL;
  let fileSizeToUpload;
  let fileSizeUploadLimit = 2000000; // 2 MB
  // Subtexts to display
  const clickFileUploadSubtext = "Click and we'll upload this item to your Space for you.";
  const inProgressSubtext = "Uploading the item to your Space, just a moment...";
  const createdSubtext = "Ohh yeah, your item made it to your Space! You can see it in the Space now and might want to change its position and other attributes in the Edit Mode.";
  const fileTooBigText = "Hmm, this file is too big. Please select a file smaller than 2 MB.";
  // Manage status of creation to show buttons and subtexts appropriately
  let isFileUploadInProgress = false;
  let fileToUpload = "";
  let wasFileUploadedSuccessfully = false;

  const setFileUploadInProgress = async (space) => {
    isFileUploadInProgress = true;
    fileToUpload = space;
  };

  const setFileWasUploaded = async () => {
    isFileUploadInProgress = false;
    wasFileUploadedSuccessfully = true;
  };

  const userFileInputHandler = function(userFiles = files) {
    if (!userFiles || userFiles.length === 0) {
      return false;
    };
    const userFile = userFiles[0];
    let fileName = userFile.name; // get the name of the file
    if (fileName.endsWith('.glb')) {
      try {
        userUploadedFileURL = URL.createObjectURL(userFile);
        fileSizeToUpload = userFile.size;
        addUserFileToScene(files);
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    } else if (supportedImageExtensions.some(ext => fileName.endsWith(ext))) {
      try {
        userUploadedFileURL = URL.createObjectURL(userFile);
        fileSizeToUpload = userFile.size;
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    } else if (supportedVideoExtensions.some(ext => fileName.endsWith(ext))) {
      try {
        userUploadedFileURL = URL.createObjectURL(userFile);
        fileSizeToUpload = userFile.size;
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    } else {
      console.error('The uploaded file is not a supported file.');
      return false;
    }
  };

  const addImageFileToScene = function(userFiles) {
    const userFile = userFiles[0];
    if (userFile) {
      //var fileURL = URL.createObjectURL(userFile);
      // create a new A-Frame entity for the image
      // First, get the iframe element
      let iframe = document.querySelector('.media-content-space-preview iframe');
      if (iframe) {
        // @ts-ignore
        var fileURL = iframe.contentWindow.URL.createObjectURL(userFile);
        // Use the 'load' event to ensure the iframe's contents are fully loaded
        // Get the A-Frame scene inside the iframe
        // @ts-ignore
        let aScene = iframe.contentWindow.document.querySelector('#aSceneForModelPreview');
        // Now you can interact with the scene...
        if (aScene) {
          if (aScene.hasLoaded) {
            // Create a new A-Frame entity for the image
            var imageEntity = aScene.ownerDocument.createElement('a-image');
            // Set the src attribute to the URL of your image
            imageEntity.setAttribute('src', `url(${fileURL}).jpg`);
            // Set the width and height
            imageEntity.setAttribute('width', '2');
            imageEntity.setAttribute('height', '1');
            // Set the position
            imageEntity.setAttribute('position', '0 1.6 -2');
            imageEntity.setAttribute('id', 'imageFromUserFile');
            if (!aScene.querySelector('#imageFromUserFile')) {
              aScene.appendChild(imageEntity);
            } else {
              aScene.replaceChild(imageEntity, aScene.querySelector('#imageFromUserFile'));
            };
          } else {
            aScene.addEventListener('loaded', function () {
              // Create a new A-Frame entity for the image
              var imageEntity = aScene.ownerDocument.createElement('a-image');
              // Set the src attribute to the URL of your image
              imageEntity.setAttribute('src', `url(${fileURL}).jpg`);
              // Set the width and height
              imageEntity.setAttribute('width', '2');
              imageEntity.setAttribute('height', '1');
              // Set the position
              imageEntity.setAttribute('position', '0 1.6 -2');
              imageEntity.setAttribute('id', 'imageFromUserFile');
              if (!aScene.querySelector('#imageFromUserFile')) {
                aScene.appendChild(imageEntity);
              } else {
                aScene.replaceChild(imageEntity, aScene.querySelector('#imageFromUserFile'));
              }
            });
          }
        } else {
          // Set timeout and try again
          setTimeout(() => {
            addUserFileToScene(userFiles);
          }, 500);
        }
      } else {
        // Set timeout and try again
        setTimeout(() => {
          addImageFileToScene(userFiles);
        }, 500);
      }    
    }
  };

  const addUserFileToScene = function(userFiles) {
    const userFile = userFiles[0];
    if (userFile) {
      var fileURL = URL.createObjectURL(userFile);
      // create a new A-Frame entity for the GLB model
      // First, get the iframe element
      let iframe = document.querySelector('.glb-model-space-preview iframe');
      if (iframe) {
        // Use the 'load' event to ensure the iframe's contents are fully loaded
        // Get the A-Frame scene inside the iframe
        // @ts-ignore
        let aScene = iframe.contentWindow.document.querySelector('#aSceneForModelPreview');
        // Now you can interact with the scene...
        if (aScene) {
          if (aScene.hasLoaded) {
            var modelEntity = aScene.ownerDocument.createElement('a-entity');
            modelEntity.setAttribute('gltf-model', `url(${fileURL})`);
            modelEntity.setAttribute('position', '0 3 -6');
            modelEntity.setAttribute('id', 'modelFromUserFile');
            modelEntity.setAttribute('animation-mixer');
            if (!aScene.querySelector('#modelFromUserFile')) {
              aScene.appendChild(modelEntity);
            } else {
              aScene.replaceChild(modelEntity, aScene.querySelector('#modelFromUserFile'));
            }
          } else {
            aScene.addEventListener('loaded', function () {
              var modelEntity = aScene.ownerDocument.createElement('a-entity');
              modelEntity.setAttribute('gltf-model', `url(${fileURL})`);
              modelEntity.setAttribute('position', '0 3 -6');
              modelEntity.setAttribute('id', 'modelFromUserFile');
              modelEntity.setAttribute('animation-mixer');
              if (!aScene.querySelector('#modelFromUserFile')) {
                aScene.appendChild(modelEntity);
              } else {
              aScene.replaceChild(modelEntity, aScene.querySelector('#modelFromUserFile'));
            }
            });
          }
        } else {
          // Set timeout and try again
          setTimeout(() => {
            addUserFileToScene(userFiles);
          }, 500);
        }
      } else {
        // Set timeout and try again
        setTimeout(() => {
          addUserFileToScene(userFiles);
        }, 500);
      }    
    }
  };

  const createNewItemInSpace = async (sourceType) => {
    if (sourceType === "WebHosted") {
      if (isValidUrl(webHostedItemUrl)) {
        // Create a new a-asset element
        var newAsset = document.createElement('a-asset-item');
        newAsset.setAttribute('id', 'userAddedAsset_' + webHostedItemUrl);
        newAsset.setAttribute('crossorigin', 'anonymous');
        newAsset.setAttribute('src', webHostedItemUrl);
        // Append the new a-asset to the a-assets element
        var assets = document.querySelector('a-assets');
        assets.appendChild(newAsset);
        function loaded() {
          let scene = document.querySelector('a-scene');
          let contentEntity = scene.ownerDocument.createElement('a-entity');
          contentEntity.setAttribute('src', '#userAddedAsset_' + webHostedItemUrl);
          contentEntity.setAttribute('position', '0 3 -6');
          contentEntity.setAttribute('id', 'userAddedItem_' + webHostedItemUrl);
          scene.appendChild(contentEntity);
        };
        newAsset.addEventListener('load', loaded);
      } else {
        console.error("URL Failed Check Before Adding Item");
      };  
    } else {
      if (userFileInputHandler(files) && (fileSizeToUpload <= fileSizeUploadLimit)) {
        await setFileUploadInProgress(sourceType);
        // Upload the user's file to the backend canister and include it as a new entity in the Space for the user
        if (sourceType === "UserUploadedGlbModel") {
          // Store file for user
          const arrayBuffer = await files[0].arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const byteArray = Array.from(uint8Array);
          let fileUploadResult;
          try {
            fileUploadResult = await $store.backendActor.uploadUserFile(files[0].name, byteArray)
          } catch (error) {
            console.error("File Upload Error:", error);
          };
          if (fileUploadResult.Ok) {
            const fileURL = process.env.DFX_NETWORK === "local"
              ? `http://127.0.0.1:4943/file/fileId=${fileUploadResult.Ok.FileId}?canisterId=${backendCanisterId}` // e.g. http://127.0.0.1:4943/file/fileId=888?canisterId=bkyz2-fmaaa-aaaaa-qaaaq-cai
              : `https://${backendCanisterId}.raw${appDomain}/file/fileId=${fileUploadResult.Ok.FileId}`; // e.g. https://vee64-zyaaa-aaaai-acpta-cai.raw.ic0.app/file/fileId=777
            try {
              let scene = document.querySelector('a-scene');
              var modelEntity = scene.ownerDocument.createElement('a-entity');
              modelEntity.setAttribute('gltf-model', `url(${fileURL})`);
              modelEntity.setAttribute('position', '0 3 -6');
              modelEntity.setAttribute('id', 'userUploadedModel_' + fileUploadResult.Ok.FileId);
              // @ts-ignore
              modelEntity.setAttribute('animation-mixer');
              scene.appendChild(modelEntity);
            } catch (error) {
              console.error("Adding Uploaded Model to Space Error:", error);
            };
          } else {
            console.error("File Upload Error:", fileUploadResult);
          };
        } else if (sourceType === "UserUploadedMediaContent") {
          // Capture 360-degree toggle
          const set360DegreeContent = is360Degree ? true : false;
          // Store file for user
          const arrayBuffer = await files[0].arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const byteArray = Array.from(uint8Array);
          let fileUploadResult;
          try {
            fileUploadResult = await $store.backendActor.uploadUserFile(files[0].name, byteArray)
          } catch (error) {
            console.error("File Upload Error:", error);
          };
          if (fileUploadResult.Ok) {
            const fileURL = process.env.DFX_NETWORK === "local"
              ? `http://127.0.0.1:4943/file/fileId=${fileUploadResult.Ok.FileId}?canisterId=${backendCanisterId}` // e.g. http://127.0.0.1:4943/file/fileId=888?canisterId=bkyz2-fmaaa-aaaaa-qaaaq-cai
              : `https://${backendCanisterId}.raw${appDomain}/file/fileId=${fileUploadResult.Ok.FileId}`; // e.g. https://vee64-zyaaa-aaaai-acpta-cai.raw.ic0.app/file/fileId=777
            try {
              let fileName = files[0].name; // get the name of the file
              let scene = document.querySelector('a-scene');
              var contentEntity;
              if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.gif') || fileName.endsWith('.svg')) {
                // Create a new a-asset element
                var newImageAsset = document.createElement('img');
                newImageAsset.setAttribute('id', 'userUploadedImageAsset_' + fileUploadResult.Ok.FileId);
                newImageAsset.setAttribute('crossorigin', 'anonymous');
                newImageAsset.setAttribute('src', fileURL);
                // Append the new a-asset to the a-assets element
                var assets = document.querySelector('a-assets');
                assets.appendChild(newImageAsset);
                function loaded() {
                  // Determine whether the image is 360 degree and set the appropriate attribute
                  if (set360DegreeContent) {
                    contentEntity = scene.ownerDocument.createElement('a-sky');
                    contentEntity.setAttribute('src', '#userUploadedImageAsset_' + fileUploadResult.Ok.FileId);
                    contentEntity.setAttribute('id', 'userUploaded360Image_' + fileUploadResult.Ok.FileId);
                    contentEntity.setAttribute('rotation', '0 -130 0');
                    const existingSky = scene.querySelector('a-sky');
                    if (existingSky) {
                      scene.replaceChild(contentEntity, existingSky);
                    } else {
                      scene.appendChild(contentEntity);
                    };
                  } else {
                    contentEntity = scene.ownerDocument.createElement('a-image');
                    contentEntity.setAttribute('src', '#userUploadedImageAsset_' + fileUploadResult.Ok.FileId);
                    contentEntity.setAttribute('position', '0 3 -6');
                    contentEntity.setAttribute('id', 'userUploadedImage_' + fileUploadResult.Ok.FileId);
                    scene.appendChild(contentEntity);
                  };
                };
                newImageAsset.addEventListener('load', loaded);
              } else if (fileName.endsWith('.mp4') || fileName.endsWith('.mov')) {
                // Create a new a-asset element
                var newVideoAsset = document.createElement('video');
                newVideoAsset.setAttribute('id', 'userUploadedVideoAsset_' + fileUploadResult.Ok.FileId);
                newVideoAsset.setAttribute('crossorigin', 'anonymous');
                newVideoAsset.setAttribute('src', fileURL);
                // Append the new a-asset to the a-assets element
                var assets = document.querySelector('a-assets');
                assets.appendChild(newVideoAsset);
                function loaded() {
                  // Determine whether the video is 360 degree and set the appropriate attribute
                  if (set360DegreeContent) {
                    contentEntity = scene.ownerDocument.createElement('a-videosphere');
                    contentEntity.setAttribute('src', '#userUploadedVideoAsset_' + fileUploadResult.Ok.FileId);
                    contentEntity.setAttribute('id', 'userUploaded360Video_' + fileUploadResult.Ok.FileId);
                    contentEntity.setAttribute('rotation', '0 -130 0');
                    contentEntity.setAttribute('autoplay', true);
                    contentEntity.setAttribute('loop', true);
                    const existingVideosphere  = scene.querySelector('a-videosphere');
                    if (existingVideosphere) {
                      scene.replaceChild(contentEntity, existingVideosphere);
                    } else {
                      scene.appendChild(contentEntity);
                    };
                  } else {
                    contentEntity = scene.ownerDocument.createElement('a-video');
                    contentEntity.setAttribute('src', '#userUploadedVideoAsset_' + fileUploadResult.Ok.FileId);
                    contentEntity.setAttribute('position', '0 3 -6');
                    contentEntity.setAttribute('id', 'userUploadedVideo_' + fileUploadResult.Ok.FileId);
                    contentEntity.setAttribute('video-play-on-click', true); // Add component to play video on click
                    scene.appendChild(contentEntity);
                  };
                };
                newVideoAsset.addEventListener('loadeddata', loaded);
              } else {
                console.error('The uploaded file type is not supported.');
                return false;
              };
            } catch (error) {
              console.error("Adding Uploaded File to Space Error:", error);
            };
          } else {
            console.error("File Upload Error:", fileUploadResult);
          };
        };
        await setFileWasUploaded();
      } else {
        console.error("File Failed Check Before Upload");
      };
    };
  };

// Add environment option
  let openEnvironmentOptionPopup = false;
  let userSelectedEnvironmentOption = "default";
  let isAddingEnvironmentInProgress = false;
  let wasEnvironmentAddedSuccessfully = false;

  const addEnvironmentToSpace = () => {
    if (!isAddingEnvironmentInProgress) {
      isAddingEnvironmentInProgress = true;
      wasEnvironmentAddedSuccessfully = false;
      try {
        let scene = document.querySelector('a-scene');
        var environmentEntity = scene.ownerDocument.createElement('a-entity');
        environmentEntity.setAttribute('environment', `preset: ${userSelectedEnvironmentOption}`);
        environmentEntity.setAttribute('id', 'presetEnvironmentSelectedByUser');
        // Ensure that only one environment is added to the scene
        var existingEnvironment = document.body.querySelector("#presetEnvironmentSelectedByUser");
        if (existingEnvironment) {
          scene.replaceChild(environmentEntity, existingEnvironment);
        } else {
          scene.appendChild(environmentEntity);
        };
      } catch (error) {
        console.error("Adding Environment to Space Error:", error);
      };
      wasEnvironmentAddedSuccessfully = true;
      isAddingEnvironmentInProgress = false;
    };
  };

// Prepare dropdown menu
  const addDropdownMenuForNewElements = () => {
    var elements = document.body.getElementsByClassName("button fa fa-plus");
    var addEntityButton = elements.item(0);
    if(addEntityButton) {
      const dropdownMenu = document.createElement("div");
      dropdownMenu.id = "dropdownMenu";
      // Style dropdownMenu
      dropdownMenu.style.backgroundColor = "white";
      dropdownMenu.style.boxSizing = "content-box";
      dropdownMenu.style.color = "#92374d";
      dropdownMenu.style.fontSize = "13px";
      dropdownMenu.style.left = "5px";
      dropdownMenu.style.lineHeight = "normal";
      dropdownMenu.style.padding = "6px 10px";
      dropdownMenu.style.textAlign = "center";
      dropdownMenu.style.textDecoration = "none";
      dropdownMenu.style.top = "3px";
      dropdownMenu.style.width = "210px";

      // Create dropdown button
      const dropdownMenuButton = document.createElement("button");
      // @ts-ignore
      dropdownMenuButton.id = "dropdownMenuButton";
      // @ts-ignore
      dropdownMenuButton.innerHTML = "Add Items to Space";
      // Style dropdownMenuButton
      dropdownMenuButton.style.cursor = "pointer";
      dropdownMenuButton.style.border = "none";
      dropdownMenuButton.style.textAlign = "center";
      dropdownMenuButton.style.fontWeight = "bold";
      dropdownMenuButton.style.width = "100%";

      // Create dropdown content div
      const dropdownMenuContent = document.createElement("div");
      dropdownMenuContent.id = "dropdownMenuContent";
      dropdownMenuContent.classList.add("dropdown-content");

      // Close popups for adding items to space if user clicks outside of it
      const closePopupsOnClickOutside = function(event) {
        if (!event.target.closest('#editOptionPopupsContainer')) {
          toggleOpenEditModePopup();
          window.removeEventListener("click", closePopupsOnClickOutside , false);
        }
      };

      // Create "Media Content" option
      const mediaContentOption = document.createElement("a");
      mediaContentOption.href = "javascript:;"; // "empty" behavior, i.e. shouldn't do anything
      mediaContentOption.id = "mediaContentOption";
      mediaContentOption.classList.add("dropdownOption");
      mediaContentOption.innerHTML = "Add Media";
      mediaContentOption.onclick = function() {
        toggleOpenEditModePopup();
        // Handle media content action
        openAddMediaContentPopup = true;
        setTimeout(() => {
          window.addEventListener("click", closePopupsOnClickOutside , false);
        }, 1000);
      };

      // Create "Library" option
      const libraryOption = document.createElement("a");
      libraryOption.href = "javascript:;"; // "empty" behavior, i.e. shouldn't do anything
      libraryOption.id = "itemsToAddLibrary";
      libraryOption.classList.add("dropdownOption");
      libraryOption.innerHTML = "Items Library";
      libraryOption.onclick = function() {
        toggleOpenEditModePopup();
        // Handle library action
        openItemsToAddLibraryPopup = true;
        setTimeout(() => {
          window.addEventListener("click", closePopupsOnClickOutside , false);
        }, 1000);
      };

      // Create "My Files" option
      const myFilesOption = document.createElement("a");
      myFilesOption.href = "javascript:;"; // "empty" behavior, i.e. shouldn't do anything
      myFilesOption.id = "addFromMyFiles";
      myFilesOption.classList.add("dropdownOption");
      myFilesOption.innerHTML = "My Files";
      myFilesOption.onclick = function() {
        toggleOpenEditModePopup();
        // Handle my files action
        openAddFromMyFilesPopup = true;
        setTimeout(() => {
          window.addEventListener("click", closePopupsOnClickOutside , false);
        }, 1000);
      };

      // Create "Upload Object" option
      const uploadFileOption = document.createElement("a");
      uploadFileOption.href = "javascript:;"; // "empty" behavior, i.e. shouldn't do anything
      uploadFileOption.id = "uploadFile";
      uploadFileOption.classList.add("dropdownOption");
      uploadFileOption.innerHTML = "Upload Object";
      uploadFileOption.onclick = function() {
        toggleOpenEditModePopup();
        // Handle upload object action
        openUploadModelFilePopup = true;
        setTimeout(() => {
          window.addEventListener("click", closePopupsOnClickOutside , false);
        }, 1000);
      };

      // Create "Environment" option
      const addEnvironmentOption = document.createElement("a");
      addEnvironmentOption.href = "javascript:;"; // "empty" behavior, i.e. shouldn't do anything
      addEnvironmentOption.id = "addEnvironment";
      addEnvironmentOption.classList.add("dropdownOption");
      addEnvironmentOption.innerHTML = "Environment";
      addEnvironmentOption.onclick = function() {
        toggleOpenEditModePopup();
        // Handle add environment action
        openEnvironmentOptionPopup = true;
        setTimeout(() => {
          window.addEventListener("click", closePopupsOnClickOutside , false);
        }, 1000);
      };

      // Create "Add New Entity" option (from the + button ("Add Entity"), i.e. it keeps the onclick behavior of adding a new a-entity)
      const addNewEntityOption = addEntityButton;
      // @ts-ignore
      addNewEntityOption.href = "javascript:;"; // "empty" behavior, i.e. shouldn't do anything
      addNewEntityOption.id = "addNewEntity";
      addNewEntityOption.classList.remove("button");
      addNewEntityOption.classList.remove("fa");
      addNewEntityOption.classList.remove("fa-plus");
      addNewEntityOption.classList.add("dropdownOption");
      addNewEntityOption.innerHTML = "Add New Entity";

      // Add options to dropdown menu
      dropdownMenuContent.appendChild(libraryOption);
      dropdownMenuContent.appendChild(myFilesOption);
      dropdownMenuContent.appendChild(mediaContentOption);
      dropdownMenuContent.appendChild(uploadFileOption);
      dropdownMenuContent.appendChild(addEnvironmentOption);
      dropdownMenuContent.appendChild(addNewEntityOption);

      // Add button and dropdown menu to div
      dropdownMenu.appendChild(dropdownMenuButton);
      dropdownMenu.appendChild(dropdownMenuContent);

      // Add event listener to dropdown button
      // @ts-ignore
      dropdownMenuButton.onclick = function() {
        if (dropdownMenuContent.style.display === "block") {
          dropdownMenuContent.style.display = "none";
        } else {
          dropdownMenuContent.style.display = "block";
          var dropdownOptions = document.getElementsByClassName("dropdownOption");
          for (var i = 0; i < dropdownOptions.length; i++) {
            var dropdownOption = dropdownOptions[i];
            // @ts-ignore
            dropdownOption.style.color = "white";
            // @ts-ignore
            dropdownOption.style.fontWeight = "bold";
          }
        }
      };

      // Close dropdown menu if user clicks outside of it
      window.onclick = function(event) {
        if (!event.target.matches('#dropdownMenuButton')) {
          var dropdowns = document.getElementsByClassName("dropdown-content");
          for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            // @ts-ignore
            if (openDropdown.style.display === 'block') {
              // @ts-ignore
              openDropdown.style.display = 'none';
            }
          }
        }
      };

      var elements = document.body.getElementsByClassName("button fa fa-save");
      var toggleElement = elements.item(0);
      toggleElement.replaceWith(dropdownMenu);
    } else {
      // Inspector hasn't loaded yet
      setTimeout(() => {
        addDropdownMenuForNewElements();
      }, 500);
    };
  };

  /**
   * This function removes any undesired buttons from the Aframe inspector
   * This should only be called once the Aframe inspector is loaded
   */
  const removeUndesiredInspectorButtons = () => {
      // Remove the resume button since it isn't useful
      document.getElementById('playPauseScene').style.display = 'none';
      // Remove the gltfIcon since it isn't useful
      for (let i =0; i < document.getElementsByClassName('gltfIcon').length; i++) {
        // @ts-ignore
        document.getElementsByClassName('gltfIcon')[i].style.display = 'none';
      }

      // Now that we removed the button update the padding to make it look better
      for (let i =0; i < document.getElementsByClassName('toolbarActions').length; i++) {
        // @ts-ignore
        document.getElementsByClassName('toolbarActions')[i].style.paddingTop = '10px';
      }
  }

  /**
   * This function updates any helper text for relevant buttons on the Aframe inspector
   */
  const updateHelperText = () => {
    // Update the helper text of the save button
    var elements = document.body.getElementsByClassName("button fa fa-save");
    for (const saveButton of elements) {
      // @ts-ignore
      saveButton.title = "Save changes to your canister";
    };

    // Update helper text of adding item
    var elements = document.body.getElementsByClassName("button fa fa-plus");
    for (const addButton of elements) {
      // @ts-ignore
      addButton.title = "Add a new item";
    };
  }

  // Change A-Frame's default Inspector according to our specific requirements
  const customizeInspector = () => {
    // Move the Inspector's initial camera view to the current view
    changeInspectorCameraPosition();
    // Remove any 3D Neighbors from the scene
    remove3dNeighborsFromScene();
    // Hide VR menu
    hideVRMenu();
    // Customizes the left panel
    customizeLeftPanel();
    // Customize features on the Right Panel
    customizeRightPanel();
    // Customize the toolbar (top center)
    customizeCentralToolbar();
  };

  const editButtonOnClick = async () => {
    // Open the AFrame Inspector (automatically injected by AFrame)
    // @ts-ignore
    await document.querySelector('a-scene').components.inspector.openInspector();
    open = false;
    // Wait until the Inspector has loaded
    setTimeout(() => {
      customizeInspector();     
    }, 500);
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
      // Movements in Space
      loadSpaceMovements();
      // VR menu
      loadVRMenu();
      sceneCustomizationsLoaded = true;
    } else {
      setTimeout(() => {
        loadSceneCustomizations();
      }, 500);
    };    
  };

  function loadSpaceMovements () {
    // Find the camera entity
    let cameraEntity = document.querySelector('a-entity[camera]');
    // Enable flying in the space (i.e. pressing the forward button always moves into the direction of view, incl. up and down)
    // ts-ignore
    cameraEntity.setAttribute('wasd-controls', { acceleration:65, fly:true });
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

    // Check that there isn't a menuEntity already attached to the camera and only append it if not
    if (!document.getElementById('OIM-VR-menu')) {
      // Append the new menu entity as a child of the camera entity (i.e. it will move with the camera)
      cameraEntity.appendChild(menuEntity);
    } else {
      // Replace the existing menu entity with the new one
      cameraEntity.replaceChild(menuEntity, document.getElementById('OIM-VR-menu'));
    };
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

  const entityHasValidUrl = (entity: Entity) => {
    return isValidUrl(entity.entitySpecificFields);
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

  const isValidLibraryItem = (url) => {
    if (url === "") {
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
        neighborEntity.setAttribute('id', `OIM-VR-neighbor-${neighbor.id}`);
        neighborEntity.setAttribute('web-portal', `url:${neighbor.entitySpecificFields}; text:${neighbor.name[0] || "Neighbor " + neighborIndex};`);
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
    let spaceNeighborsResponse : EntityAttachedBridgesResult;
    let retrievedNeighborEntities : Entity[] = [];
    try {
      try {
          spaceNeighborsResponse = await $store.protocolActor.get_from_bridge_ids_by_entity_id(spaceEntityId);
      } catch (error) {
          console.error("Error Getting Bridges", error);
          return null;                
      };
      // @ts-ignore
      if (spaceNeighborsResponse && spaceNeighborsResponse.Ok && spaceNeighborsResponse.Ok.length > 0) {
        // @ts-ignore
        const bridgesRetrieved : EntityAttachedBridges = spaceNeighborsResponse.Ok;
        const bridgeIds = [];
        let getBridgeRequestPromises = [];
        for (var i = 0; i < bridgesRetrieved.length; i++) {
            if (bridgesRetrieved[i] && bridgesRetrieved[i].id && bridgesRetrieved[i].linkStatus.hasOwnProperty('CreatedOwner')) {
                bridgeIds.push(bridgesRetrieved[i].id);
                getBridgeRequestPromises.push($store.protocolActor.get_bridge(bridgesRetrieved[i].id)); // Send requests in parallel and then await all to speed up
            };
        };
        const getBridgeResponses = await Promise.all(getBridgeRequestPromises);
        let getConnectedEntityRequestPromises = [];
        for (var j = 0; j < getBridgeResponses.length; j++) {
            if (getBridgeResponses[j].Err) {
                console.error("Error retrieving Bridge", getBridgeResponses[j].Err);
            } else {
                const bridge : Bridge = getBridgeResponses[j].Ok;
                getConnectedEntityRequestPromises.push($store.protocolActor.get_entity(bridge.toEntityId)); // Send requests in parallel and then await all to speed up
            };
        };
        const getConnectedEntityResponses = await Promise.all(getConnectedEntityRequestPromises);
        for (var j = 0; j < getConnectedEntityResponses.length; j++) {
            if (getConnectedEntityResponses[j].Err) {
                console.error("Error retrieving connected Entity", getConnectedEntityResponses[j].Err);
            } else {
                const connectedEntity : Entity = getConnectedEntityResponses[j].Ok;
                retrievedNeighborEntities.push(connectedEntity);
            };
        };
      };
    } catch(err) {
        console.error("Error getting SpaceNeighbors", err);
    };

    // Only load Neighbors if they haven't been loaded yet or reload if new Neighbors have been added
    if (retrievedNeighborEntities.length === 0) {
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
      loadNeighborsIn3D(retrievedNeighborEntities);
      numberOfNeighbors = retrievedNeighborEntities.length;
      neighborsIn3DLoaded = true;
    } else if (retrievedNeighborEntities.length > numberOfNeighbors) { // New Neighbors have been added
      // Remove all existing Neighbors from the scene
      remove3dNeighborsFromScene();
      // Load Neighbors in 3D
      loadNeighborsIn3D(retrievedNeighborEntities);
      numberOfNeighbors = retrievedNeighborEntities.length;
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

    loadingInProgress = false;
  };

// User clicked to see Space's metadata
  let spaceMetadata = {
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
  let spaceMetadataHasBeenExtracted = false;
  let showSpaceInfoView = false;

  const spaceInfoButtonOnClick = () => {
    if (!spaceMetadataHasBeenExtracted) {
      // Only extract data from spaceNft on first load
        // and not again later on, as data in spaceMetadata might have been updated
      extractSpaceMetadata(spaceNft, spaceMetadata); // Fill with Space's info from NFT metadata
      // Fill additional fields for usage in SpaceInfo
      spaceMetadata.id = spaceNft.id;
      spaceMetadata.spaceOwnerPrincipal = spaceOwnerPrincipal;
      spaceMetadata.spaceData = spaceNft.metadata[0].data;
      spaceMetadataHasBeenExtracted = true;
    };

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
        {remove3dNeighborsFromScene()}
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
        <SpaceInfo bind:spaceMetadata={spaceMetadata} />
      {/if}
    {/if}
    <div style="position: absolute; height: 100%; width: 100%;">
      {@html spaceString}
    </div>
  <!-- Edit Mode Popups -->
    {#if openEditModelPopup}
      <div id="editOptionPopupsContainer">
        <!-- Upload Model File -->
        {#if openUploadModelFilePopup}
          <div class="editOptionPopup">
            <!-- Edit Button may only be displayed if logged-in user is space's owner -->
            {#if isViewerSpaceOwner()}
              <h3 class="text-l font-semibold">Upload a GLB Model File</h3>
              <form on:submit|preventDefault={() => createNewItemInSpace("UserUploadedGlbModel")}>
                <label for="userUploadedFileInput" class="text-base">Select a glb file from your device:</label>
                <input
                  bind:files
                  id="userUploadedFileInput"
                  type="file"
                  class="urlInput text-black font-bold"
                  accept=".glb, .gltf"
                />
                {#if files}
                  {#key files}  <!-- Element to rerender everything inside when files change (https://www.webtips.dev/force-rerender-components-in-svelte) -->
                    <GlbModelPreview bind:modelUrl={userUploadedFileURL} modelType={"UserUploaded"}/>
                    {#if userFileInputHandler(files)}
                      {#if isFileUploadInProgress}
                        <button type='button' id='fileUploadButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Add This Model!</button>
                        <p id='fileUploadSubtext'>{inProgressSubtext}</p>
                      {:else if wasFileUploadedSuccessfully}
                        <button type=submit id='fileUploadButton' class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Add This Model!</button>
                        <p id='fileUploadSubtext'>{createdSubtext}</p>
                      {:else}
                        {#if fileSizeToUpload <= fileSizeUploadLimit}
                          <button type=submit id='fileUploadButton' class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Add This Model!</button>
                          <p id='fileUploadSubtext'>{clickFileUploadSubtext}</p>
                        {:else}
                          <button type='button' id='fileUploadButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Add This Model!</button>
                          <p id='fileUploadSubtext'>{fileTooBigText}</p>
                        {/if}
                      {/if}
                    {:else}
                      <button disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Add This Model!</button>
                      <h3 class="py-4 items-center leading-8 text-center text-xl font-bold">Please provide a valid GLB Model File.</h3>
                    {/if}
                  {/key}
                {/if}
              </form>
              <p class="text-base">Find glb files on <a href='https://sketchfab.com/3d-models?sort_by=-likeCount' target='_blank' rel="noreferrer" class='underline'>Sketchfab</a> or <a href='https://www.turbosquid.com/Search/3D-Models/free' target='_blank' rel="noreferrer" class='underline'>TurboSquid</a></p>
            {:else}
              <p class="spaceMenuItem" transition:fly={{ y: -15, delay: 50 * 1 }}>
                You need to be the space's owner to use this feature.
              </p>
            {/if}
          </div>

          <hr transition:scale={{ duration: 650, easing: quadOut, opacity: 1 }} />
        <!-- Library option -->
        {:else if openItemsToAddLibraryPopup}
          <div class="editOptionPopup">
            <!-- Edit Button may only be displayed if logged-in user is space's owner -->
            {#if isViewerSpaceOwner()}
              <h3 class="text-l font-semibold">Add an Item to Your Space</h3>
              <form on:submit|preventDefault={() => addLibraryItemToSpace()}>
                <p class="text-base">Select an item from the Library:</p>
                {#key userSelectedLibraryItemURL}  <!-- Element to rerender everything inside when the item changes (https://www.webtips.dev/force-rerender-components-in-svelte) -->
                  <GlbModelPreview bind:modelUrl={userSelectedLibraryItemURL} modelType={"WebHosted"}/>
                  {#if isValidLibraryItem(userSelectedLibraryItemURL)}
                    {#if isAddingLibraryItemInProgress}
                      <button type='button' id='addLibraryItemButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Add This Item!</button>
                      <p id='addLibraryItemSubtext'>{inProgressSubtext}</p>
                    {:else if wasLibraryItemAddedSuccessfully}
                      <button type=submit id='addLibraryItemButton' class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Add This Item!</button>
                      <p id='addLibraryItemSubtext'>{createdSubtext}</p>
                    {:else}
                      <button type=submit id='addLibraryItemButton' class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Add This Item!</button>
                      <p id='addLibraryItemSubtext'>{clickFileUploadSubtext}</p>
                    {/if}
                  {:else}
                    <button disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Add This Item!</button>
                    <h3 class="py-4 items-center leading-8 text-center text-xl font-bold">Please try another item.</h3>
                  {/if}
                {/key}
              </form>
              <ItemLibrary bind:modelUrl={userSelectedLibraryItemURL}/>
            {:else}
              <p class="spaceMenuItem" transition:fly={{ y: -15, delay: 50 * 1 }}>
                You need to be the space's owner to use this feature.
              </p>
            {/if}
          </div>
        <!-- My Files option -->
        {:else if openAddFromMyFilesPopup}
          <div class="editOptionPopup">
            <!-- Edit Button may only be displayed if logged-in user is space's owner -->
            {#if isViewerSpaceOwner()}
              <h3 class="text-l font-semibold">Add an Item to Your Space</h3>
              <form on:submit|preventDefault={() => addMyFileToSpace()}>
                <p class="text-base">Select from your previously uploaded files:</p>
                {#key userSelectedMyFile}
                  {#if isValidMyFile(userSelectedMyFile)}
                    <FileSpacePreview fileToPreview={userSelectedMyFile} bind:is360Degree={setMyFileAs360Degree}/>
                    {#if isAddingMyFileInProgress}
                      <button type='button' id='addMyFileButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Add This Item!</button>
                      <p id='addMyFileSubtext'>{inProgressSubtext}</p>
                    {:else if wasMyFileAddedSuccessfully}
                      <button type=submit id='addMyFileButton' class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Add This Item!</button>
                      <p id='addMyFileSubtext'>{createdSubtext}</p>
                    {:else}
                      <button type=submit id='addMyFileButton' class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Add This Item!</button>
                      <p id='addMyFileSubtext'>{clickFileUploadSubtext}</p>
                    {/if}
                  {/if}
                {/key}
              </form>
              <MyFilesLibrary bind:selectedFile={userSelectedMyFile}/>
            {:else}
              <p class="spaceMenuItem" transition:fly={{ y: -15, delay: 50 * 1 }}>
                You need to be the space's owner to use this feature.
              </p>
            {/if}
          </div>
        <!-- Media Content option -->
        {:else if openAddMediaContentPopup}
          <div class="editOptionPopup">
            <!-- Edit Button may only be displayed if logged-in user is space's owner -->
            {#if isViewerSpaceOwner()}
              <h3 class="text-l font-semibold">Upload an Image or Video</h3>
              <!-- 360-degree toggle -->
              <div class="py-2">
                <input type="checkbox" bind:checked={is360Degree} id="360Toggle">
                <label for="360Toggle" class="ml-2">Set as 360-degree item</label>
              </div>
              <form on:submit|preventDefault={() => createNewItemInSpace("UserUploadedMediaContent")}>
                <label for="userUploadedFileInput" class="text-base">Select the file from your device:</label>
                <input
                  bind:files
                  id="userUploadedFileInput"
                  type="file"
                  class="urlInput text-black font-bold"
                  accept="image/jpeg, image/jpg, image/png, image/gif, image/svg, video/mp4, video/mov"
                />
                {#if files}
                  {#key files}  <!-- Element to rerender everything inside when files change (https://www.webtips.dev/force-rerender-components-in-svelte) -->
                    {#if userFileInputHandler(files)}
                      {#key is360Degree} 
                        <MediaContentPreview bind:contentUrl={userUploadedFileURL} contentFiles={files} is360Degree={is360Degree}/>
                      {/key}
                      {#if isFileUploadInProgress}
                        <button type='button' id='fileUploadButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Add This Item!</button>
                        <p id='fileUploadSubtext'>{inProgressSubtext}</p>
                      {:else if wasFileUploadedSuccessfully}
                        <button type=submit id='fileUploadButton' class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Add This Item!</button>
                        <p id='fileUploadSubtext'>{createdSubtext}</p>
                      {:else}
                        {#if fileSizeToUpload <= fileSizeUploadLimit}
                          <button type=submit id='fileUploadButton' class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Add This Item!</button>
                          <p id='fileUploadSubtext'>{clickFileUploadSubtext}</p>
                        {:else}
                          <button type='button' id='fileUploadButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Add This Item!</button>
                          <p id='fileUploadSubtext'>{fileTooBigText}</p>
                        {/if}
                      {/if}
                    {:else}
                      <button disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Add This Item!</button>
                      <h3 class="py-4 items-center leading-8 text-center text-xl font-bold">Please provide a valid file.</h3>
                    {/if}
                  {/key}
                {/if}
              </form>
              <!-- <form on:submit|preventDefault={() => createNewItemInSpace("WebHostedGlbModel")}>
                <label for="userProvidedUrlInput" class="text-base">Or paste the URL to the media:</label>
                <input
                    id="userProvidedUrlInput"
                    bind:value={webHostedItemUrl}
                    placeholder="Input the URL here"
                    class="urlInput text-black font-bold"
                />
                <p class="text-base">Make sure you've got access to the media for it to display properly.</p>
                {#if webHostedItemUrl !== ""}
                  {#key webHostedItemUrl}  Element to rerender everything inside when webHostedItemUrl changes (https://www.webtips.dev/force-rerender-components-in-svelte)
                    {#if isValidUrl(webHostedItemUrl)}
                      <GlbModelPreview bind:modelUrl={webHostedItemUrl} modelType={"WebHosted"}/>
                      {#if isAddingItemInProgress}
                        <button type='button' id='createButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Add This Item!</button>
                        <p id='addItemByUrlSubtext'>{inProgressSubtext}</p>
                      {:else if wasItemAddedSuccessfully}
                        <button type=submit id='createButton' class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Add This Item!</button>
                        <p id='addItemByUrlSubtext'>{createdSubtext}</p>
                      {:else}
                        <button type=submit id='createButton' class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Add This Item!</button>
                        <p id='addItemByUrlSubtext'>{clickFileUploadSubtext}</p>
                      {/if}
                    {:else}
                      <button disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Add This Item!</button>
                      <h3 class="py-4 items-center leading-8 text-center text-xl font-bold">Please provide a valid URL you're allowed to access.</h3>
                    {/if}
                  {/key}
                {/if}
              </form> -->
            {:else}
              <p class="spaceMenuItem" transition:fly={{ y: -15, delay: 50 * 1 }}>
                You need to be the space's owner to use this feature.
              </p>
            {/if}
          </div>
        <!-- Environment option -->
        {:else if openEnvironmentOptionPopup}
          <div class="editOptionPopup">
            <!-- Edit Button may only be displayed if logged-in user is space's owner -->
            {#if isViewerSpaceOwner()}
              <h3 class="text-l font-semibold">Add an Environment to Your Space</h3>
              <form on:submit|preventDefault={() => addEnvironmentToSpace()}>
                <p class="text-base">Select an envrionment from the list:</p>
                {#key userSelectedEnvironmentOption}  <!-- Element to rerender everything inside when the selection changes (https://www.webtips.dev/force-rerender-components-in-svelte) -->
                  <EnvironmentPreview bind:envToPreview={userSelectedEnvironmentOption}/>
                  {#if isAddingEnvironmentInProgress}
                    <button type='button' id='addEnvironmentButton' disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Add This Environment!</button>
                    <p id='addEnvironmentSubtext'>{inProgressSubtext}</p>
                  {:else if wasEnvironmentAddedSuccessfully}
                    <button type=submit id='addEnvironmentButton' class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Add This Environment!</button>
                    <p id='addEnvironmentSubtext'>{createdSubtext}</p>
                  {:else}
                    <button type=submit id='addEnvironmentButton' class="active-app-button bg-slate-500 text-white font-bold py-2 px-4 rounded">Add This Environment!</button>
                    <p id='addEnvironmentSubtext'>{clickFileUploadSubtext}</p>
                  {/if}
                {/key}
              </form>
              <EnvironmentLibrary bind:envSelected={userSelectedEnvironmentOption}/>
            {:else}
              <p class="spaceMenuItem" transition:fly={{ y: -15, delay: 50 * 1 }}>
                You need to be the space's owner to use this feature.
              </p>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
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

  .dropdown-content {
    display: none;
    position: absolute;
    background-color: #f1f1f1;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
  }

  .dropdown-content a {
    color: antiquewhite;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
  }

  .dropdown-content a:hover {background-color: #ddd;}

  div.editOptionPopup {
    z-index: 10;
    position: relative;
    height: 35%; 
    width: 35%;
    margin: auto;
    text-align: center;
    font-size: 1.5em;
    letter-spacing: 0.15em;
    padding: 1em;
    padding-top: 50px;
    padding-left: 50px;
    background: #1d1d2f;
    opacity: 95%;
    color: #eef;
  }

  .urlInput {
    width: 100%;
  }

</style>
