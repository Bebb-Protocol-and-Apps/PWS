import { canisterId as PersonalWebSpace_frontend_canister_id } from "canisters/PersonalWebSpace_frontend";

export const formatUserSpaces = (userSpaces) => {
  // transform userSpaces list to string holding HTML ready to be displayed  
  var userSpacesString = ``;
  for (let i = 0; i < userSpaces.length; i++) {
    const space = userSpaces[i];
    userSpacesString += `<div class='responsive' width="100%" height="auto"> <div class='space'> `;
    const spaceURL = `https://${PersonalWebSpace_frontend_canister_id}.raw.ic0.app/#/space/${space.id}`;
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

export const initiateCollapsibles = () => {
  var coll = document.getElementsByClassName('space-details-collapsible');
  var i;

  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener('click', function() {
      this.classList.toggle('active-app-button');
      var content = this.nextElementSibling;
      if (content.style.display === 'block') {
        content.style.display = 'none';
      } else {
        content.style.display = 'block';
      }
    });
  }
};
