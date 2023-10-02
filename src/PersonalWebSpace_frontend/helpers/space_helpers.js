import { canisterId as PersonalWebSpace_frontend_canister_id } from "canisters/PersonalWebSpace_frontend";
import { supportedImageExtensions, supportedVideoExtensions } from "./utils";

export const formatUserSpaces = (userSpaces) => {
  // transform userSpaces list to string holding HTML ready to be displayed  
  var userSpacesString = ``;
  for (let i = 0; i < userSpaces.length; i++) {
    const space = userSpaces[i];
    userSpacesString += `<div class='responsive' width="100%" height="auto"> <div class='space'> `;
    const spaceURL = `https://${PersonalWebSpace_frontend_canister_id}.ic0.app/#/space/${space.id}`;
    userSpacesString += `<a target='_blank' href="${spaceURL}" > <iframe src="${spaceURL}" alt='Your flaming hot Personal Web Space' width="100%" height="auto"></iframe> </a> `;
    userSpacesString += `<button onclick="window.open('${spaceURL}','_blank')" class="active-app-button bg-slate-500 text-white py-2 px-4 rounded font-semibold">View</button> `;
    userSpacesString += `<button type='button' class="space-details-collapsible bg-slate-500 text-white py-2 px-4 rounded font-semibold">See Details</button>`;
    // show space details
    var spaceDetails = `<div class='space-details-content'> `;
    var spaceName = "";
    var spaceDescription = "";
    var ownerName = "";
    var ownerContactInfo = "";
    var creationTime;
    for (var j = 0; j < space.metadata[0].key_val_data.length; j++) {
      let fieldKey = space.metadata[0].key_val_data[j].key;
      if (fieldKey === "spaceName") {
        spaceName = space.metadata[0].key_val_data[j].val.TextContent;
      } else if (fieldKey === "spaceDescription") {
        spaceDescription = space.metadata[0].key_val_data[j].val.TextContent;
      } else if (fieldKey === "ownerName") {
        ownerName = space.metadata[0].key_val_data[j].val.TextContent;      
      } else if (fieldKey === "ownerContactInfo") {
        ownerContactInfo = space.metadata[0].key_val_data[j].val.TextContent;      
      } else if (fieldKey === "creationTime") {
        creationTime = new Date(Number(space.metadata[0].key_val_data[j].val.Nat64Content) / 1000000); 
      }
    }
    spaceDetails += `<p>Owner: ${space.owner}</p> `;
    spaceDetails += `<p>Owner Name: ${ownerName}</p> `;
    spaceDetails += `<p>Owner Contact Info: ${ownerContactInfo}</p> `;
    spaceDetails += `<p>Space Name: ${spaceName}</p> `;
    spaceDetails += `<p>Space Description: ${spaceDescription}</p> `;
    spaceDetails += `<p>Creation Time: ${creationTime}</p> `;
    spaceDetails += `</div> `;
    userSpacesString += spaceDetails;
    userSpacesString += `</div> </div>`;    
  }
  return userSpacesString;
};

// Named event listener function such that it will only be attached once (anonymous event listeners may be attached mulitple times, so in casu each time initiateCollapsibles is called which messes up the functionality)
const addCollapsibleFunctionality = (event) => {
  event.target.classList.toggle('active-app-button');
  var content = event.target.nextElementSibling;
  if (content.style.display === 'block') {
    content.style.display = 'none';
  } else {
    content.style.display = 'block';
  };
};

export const initiateCollapsibles = () => {
  var coll = document.getElementsByClassName('space-details-collapsible');
  var i;
  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener('click', addCollapsibleFunctionality);
  };
};

export const getStringForSpaceWithEnvironment = (envToPreview) => {
  return `<html>
    <head>
      <script src="https://aframe.io/releases/1.4.2/aframe.min.js"></script>
      <script src="https://unpkg.com/aframe-environment-component@1.3.3/dist/aframe-environment-component.min.js"></script>
    </head>
    <body>
      <a-scene cursor="rayOrigin: mouse" gltf-model="dracoDecoderPath: https://www.gstatic.com/draco/v1/decoders/;">
        <a-entity camera="active: true" look-controls wasd-controls="acceleration:65; fly:true" position="0 1.6 0"></a-entity>
        
        <a-light type="directional" intensity="0.9" position="-1 -2  2"></a-light>
        <a-light type="directional" intensity="1.0" position=" 2  1 -1"></a-light>

        <a-entity environment="preset: ${envToPreview}"></a-entity>
      </a-scene>
    </body>
  </html>`;
};

export const getStringForSpaceFromModel = (modelUrl) => {
  return `<html>
    <head>
      <script src="https://aframe.io/releases/1.4.2/aframe.min.js"></script>
    </head>
    <body>
      <a-scene cursor="rayOrigin: mouse" gltf-model="dracoDecoderPath: https://www.gstatic.com/draco/v1/decoders/;">
        <a-assets>
          <img crossorigin="anonymous" id="groundTexture" src="https://cdn.aframe.io/a-painter/images/floor.jpg">
          <img crossorigin="anonymous" id="skyTexture" src="https://cdn.aframe.io/a-painter/images/sky.jpg">
        </a-assets>

        <a-entity camera="active: true" look-controls wasd-controls="acceleration:65; fly:true" position="0 1.6 0"></a-entity>

        <a-light type="directional" intensity="0.9" position="-1 -2  2"></a-light>
        <a-light type="directional" intensity="1.0" position=" 2  1 -1"></a-light>

        <a-plane src="#groundTexture" rotation="-90 0 0" position="0 -0.01 0" height="100" width="100"></a-plane>
        <a-sky color="#ECECEC"></a-sky>

        <a-entity gltf-model="url(${modelUrl}).glb" position="0 3 -6"  animation-mixer></a-entity>
      </a-scene>
    </body>
  </html>`;
};

export const getStringForSpaceFromUserUploadedModel = () => {
  return `<html>
    <head>
      <script src="https://aframe.io/releases/1.4.2/aframe.min.js"></script>
    </head>
    <body>
      <a-scene id="aSceneForModelPreview" cursor="rayOrigin: mouse" gltf-model="dracoDecoderPath: https://www.gstatic.com/draco/v1/decoders/;">
        <a-assets>
          <img crossorigin="anonymous" id="groundTexture" src="https://cdn.aframe.io/a-painter/images/floor.jpg">
          <img crossorigin="anonymous" id="skyTexture" src="https://cdn.aframe.io/a-painter/images/sky.jpg">
        </a-assets>

        <a-entity camera="active: true" look-controls wasd-controls="acceleration:65; fly:true" position="0 1.6 0"></a-entity>

        <a-light type="directional" intensity="0.9" position="-1 -2  2"></a-light>
        <a-light type="directional" intensity="1.0" position=" 2  1 -1"></a-light>

        <a-plane src="#groundTexture" rotation="-90 0 0" position="0 -0.01 0" height="100" width="100"></a-plane>
        <a-sky color="#ECECEC"></a-sky>
      </a-scene>
    </body>
  </html>`;
};

export const getStringForSpaceFromVideoFile = (videoUrl) => {
  return `<html>
    <head>
      <script src="https://aframe.io/releases/1.4.2/aframe.min.js"></script>
    </head>
    <body>
      <a-scene cursor="rayOrigin: mouse" gltf-model="dracoDecoderPath: https://www.gstatic.com/draco/v1/decoders/;">
        <a-assets>
          <img crossorigin="anonymous" id="groundTexture" src="https://cdn.aframe.io/a-painter/images/floor.jpg">
          <img crossorigin="anonymous" id="skyTexture" src="https://cdn.aframe.io/a-painter/images/sky.jpg">
          <video id="videoToPreview" autoplay loop="true" src="${videoUrl}"></video>
        </a-assets>

        <a-entity camera="active: true" look-controls wasd-controls="acceleration:65; fly:true" position="0 1.6 0"></a-entity>

        <a-light type="directional" intensity="0.9" position="-1 -2  2"></a-light>
        <a-light type="directional" intensity="1.0" position=" 2  1 -1"></a-light>

        <a-plane src="#groundTexture" rotation="-90 0 0" position="0 -0.01 0" height="100" width="100"></a-plane>
        <a-sky color="#ECECEC"></a-sky>

        <a-video src="#videoToPreview" position="0 1.6 -3"></a-video>
      </a-scene>
    </body>
  </html>`;
};

export const getStringForSpaceFrom360VideoFile = (videoUrl) => {
  return `<html>
    <head>
      <script src="https://aframe.io/releases/1.4.2/aframe.min.js"></script>
    </head>
    <body>
      <a-scene cursor="rayOrigin: mouse" gltf-model="dracoDecoderPath: https://www.gstatic.com/draco/v1/decoders/;">
        <a-assets>
          <video id="360videoToPreview" autoplay loop="true" src="${videoUrl}"></video>
        </a-assets>

        <a-entity camera="active: true" look-controls wasd-controls="acceleration:65; fly:true" position="0 1.6 0"></a-entity>

        <a-light type="directional" intensity="0.9" position="-1 -2  2"></a-light>
        <a-light type="directional" intensity="1.0" position=" 2  1 -1"></a-light>

        <a-videosphere src="#360videoToPreview" rotation="0 -130 0"></a-videosphere>
      </a-scene>
    </body>
  </html>`;
};

export const getStringForSpaceFromImageFile = (imageUrl) => {
  return `<html>
    <head>
      <script src="https://aframe.io/releases/1.4.2/aframe.min.js"></script>
    </head>
    <body>
      <a-scene cursor="rayOrigin: mouse" gltf-model="dracoDecoderPath: https://www.gstatic.com/draco/v1/decoders/;">
        <a-assets>
          <img crossorigin="anonymous" id="groundTexture" src="https://cdn.aframe.io/a-painter/images/floor.jpg">
          <img crossorigin="anonymous" id="skyTexture" src="https://cdn.aframe.io/a-painter/images/sky.jpg">
          <img crossorigin="anonymous" id="imageToPreview" src="${imageUrl}">
        </a-assets>

        <a-entity camera="active: true" look-controls wasd-controls="acceleration:65; fly:true" position="0 1.6 0"></a-entity>

        <a-light type="directional" intensity="0.9" position="-1 -2  2"></a-light>
        <a-light type="directional" intensity="1.0" position=" 2  1 -1"></a-light>

        <a-plane src="#groundTexture" rotation="-90 0 0" position="0 -0.01 0" height="100" width="100"></a-plane>
        <a-sky color="#ECECEC"></a-sky>

        <a-image src="#imageToPreview" position="0 1.6 -3"></a-image>
      </a-scene>
    </body>
  </html>`;
};

export const getStringForSpaceFrom360ImageFile = (imageUrl) => {
  return `<html>
    <head>
      <script src="https://aframe.io/releases/1.4.2/aframe.min.js"></script>
    </head>
    <body>
      <a-scene cursor="rayOrigin: mouse" gltf-model="dracoDecoderPath: https://www.gstatic.com/draco/v1/decoders/;">
        <a-assets>
          <img crossorigin="anonymous" id="skyTexture" src="${imageUrl}">
        </a-assets>

        <a-entity camera="active: true" look-controls wasd-controls="acceleration:65; fly:true" position="0 1.6 0"></a-entity>

        <a-light type="directional" intensity="0.9" position="-1 -2  2"></a-light>
        <a-light type="directional" intensity="1.0" position=" 2  1 -1"></a-light>

        <a-sky src="#skyTexture" rotation="0 -130 0"></a-sky>
      </a-scene>
    </body>
  </html>`;
};

export const getStringForSpaceFromMediaFile = (mediaUrl, fileName, is360Degree) => {
  if (supportedImageExtensions.some(ext => fileName.endsWith(ext))) {
    if (is360Degree) {
      return getStringForSpaceFrom360ImageFile(mediaUrl);
    } else {
      return getStringForSpaceFromImageFile(mediaUrl);
    };
  } else if (supportedVideoExtensions.some(ext => fileName.endsWith(ext))) {
    if (is360Degree) {
      return getStringForSpaceFrom360VideoFile(mediaUrl);
    } else {
      return getStringForSpaceFromVideoFile(mediaUrl);
    };
  } else {
    return getStringForSpaceFromImageFile(mediaUrl);    
  }
};

// Extract metadata fields from Space NFT
export const extractSpaceMetadata = (spaceNft, targetObject, forUpdatingSpace = false) => {
  if (spaceNft && spaceNft.metadata && spaceNft.metadata.length > 0) {
    if (forUpdatingSpace) {
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
        } else if (fieldKey === "aboutDescription") {
          targetObject.updatedAboutDescription = spaceNft.metadata[0].key_val_data[j].val.TextContent;      
        };
      };
    } else {
      for (var j = 0; j < spaceNft.metadata[0].key_val_data.length; j++) {
        let fieldKey = spaceNft.metadata[0].key_val_data[j].key;
        if (fieldKey === "creationTime") {
          targetObject[fieldKey] = new Date(Number(spaceNft.metadata[0].key_val_data[j].val.Nat64Content) / 1000000); 
        } else {
          targetObject[fieldKey] = spaceNft.metadata[0].key_val_data[j].val.TextContent;
        };
      };
    };
  };
};

// Format Space metadata for Space update call
export const formatSpaceMetadataForUpdate = (spaceMetadata, targetObject) => {
  if (spaceMetadata) {
    targetObject.updatedSpaceName = spaceMetadata.spaceName;
    targetObject.updatedSpaceDescription = spaceMetadata.spaceDescription;
    targetObject.updatedOwnerName = spaceMetadata.ownerName;
    targetObject.updatedOwnerContactInfo = spaceMetadata.ownerContactInfo;
  };
};
