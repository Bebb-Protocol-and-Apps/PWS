import { canisterId as PersonalWebSpace_frontend_canister_id } from "canisters/PersonalWebSpace_frontend";

export const formatUserSpaces = (userSpaces) => {
  // transform userSpaces list to string holding HTML ready to be displayed  
  var userSpacesString = ``;
  for (let i = 0; i < userSpaces.length; i++) {
    const space = userSpaces[i];
    userSpacesString += `<div class='responsive' width="100%" height="auto"> <div class='space'> `;
    const spaceURL = `https://${PersonalWebSpace_frontend_canister_id}.raw.ic0.app/#/space/${space.id}`;
    userSpacesString += `<a target='_blank' href="${spaceURL}" > <iframe src="${spaceURL}" alt='Your flaming hot Personal Web Space' width="100%" height="auto" sandbox="allow-scripts" credentialless referrerpolicy="no-referrer"></iframe> </a> `;
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

export const getStringForSpaceFromModel = (modelUrl) => {
  return `<html>
    <head><script src="https://aframe.io/releases/1.3.0/aframe.min.js"></script></head>
    <body>
      <a-scene cursor="rayOrigin: mouse" gltf-model="dracoDecoderPath: https://www.gstatic.com/draco/v1/decoders/;">
        <a-assets>
          <a-asset-item id="model-glb" src=${modelUrl} crossorigin="anonymous"></a-asset-item>
          <img crossorigin="anonymous" id="groundTexture" src="https://cdn.aframe.io/a-painter/images/floor.jpg">
          <img crossorigin="anonymous" id="skyTexture" src="https://cdn.aframe.io/a-painter/images/sky.jpg">
        </a-assets>

        <a-light type="directional" intensity="0.9" position="-1 -2  2"></a-light>
        <a-light type="directional" intensity="1.0" position=" 2  1 -1"></a-light>

        <a-plane src="#groundTexture" rotation="-90 0 0" position="0 -0.01 0" height="100" width="100"></a-plane>
        <a-sky color="#ECECEC"></a-sky>

        <a-entity gltf-model="#model-glb" position="0 0 -5"></a-entity>
      </a-scene>
    </body>
  </html>`;
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
        } /* else if (fieldKey === "aboutDescription") {
          targetObject.updatedOwnerContactInfo = spaceNft.metadata[0].key_val_data[j].val.TextContent;      
        } */;
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
