<script lang="ts">
  import { onMount } from "svelte";
  import { PersonalWebSpace_backend } from "canisters/PersonalWebSpace_backend";
  import { canisterId as PersonalWebSpace_frontend_canister_id } from "canisters/PersonalWebSpace_frontend";
  import { store } from "../store";
  import Login from "../components/Login.svelte";

  import spinner from "../assets/loading.gif";

  const numberOfRandomSpacesToLoad = 3;
  let loading = true;

  const initiateCollapsibles = () => {
    var coll = document.getElementsByClassName('collapsible');
    var i;

    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener('click', function() {
        this.classList.toggle('active');
        var content = this.nextElementSibling;
        if (content.style.display === 'block') {
          content.style.display = 'none';
        } else {
          content.style.display = 'block';
        }
      });
    }
  };

  const formatUserSpaces = (userSpaces) => {
    // transform userSpaces list to string holding HTML ready to be displayed  
    var userSpacesString = ``;
    for (let i = 0; i < userSpaces.length; i++) {
      const space = userSpaces[i];
      userSpacesString += `<div class='responsive' width="100%" height="auto"> <div class='space'> `;
      const spaceURL = `https://${PersonalWebSpace_frontend_canister_id}.raw.ic0.app/#/space/${space.id}`;
      userSpacesString += `<a target='_blank' href="${spaceURL}" > <iframe src="${spaceURL}" alt='Your flaming hot Personal Web Space' width="100%" height="auto"></iframe> </a> `;
      userSpacesString += `<button onclick="window.open('${spaceURL}','_blank')">Visit</button> `;
      userSpacesString += `<button type='button' class='collapsible'>See Details</button>`;
      // show space details
      var spaceDetails = `<div class='content'> `;
      var spaceName = "";
      var spaceDescription = "";
      var ownerName = "";
      var ownerContactInfo = "";
      var creationTime : Date;
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

  const loadUserSpaces = async () => {
    let randomSpaces = [];
    let randomSpacesIds = []; // Don't show the same Space multiple times
    for (var i = 0; i < numberOfRandomSpacesToLoad; i++) {
      const spaceNFTResponse = await PersonalWebSpace_backend.getRandomSpace();
      if (!spaceNFTResponse.Err && !randomSpacesIds.includes(spaceNFTResponse.Ok.id)) {
        randomSpaces.push(spaceNFTResponse.Ok);
        randomSpacesIds.push(spaceNFTResponse.Ok.id);
      };
    };
    loading = false;
    const randomSpacesString = formatUserSpaces(randomSpaces);
    document.getElementById("randomSpaces").innerHTML = randomSpacesString;
    initiateCollapsibles();
  };

  onMount(loadUserSpaces);
</script>

<div class='topnav'>
  <a href='#top'>Open Internet Metaverse</a>
  <a href='#create'>Create</a>
  <a href='#spaces'>My Spaces</a>
  <a href='#/explore'>Explore</a>
</div>

<h3 id='spaces'><b>Explore Web Spaces</b></h3>
{#if loading}
  <p id='spacesSubtext'>Searching the Open Internet Metaverse for a few random Spaces to show you...</p>
  <img class="h-6 block" src={spinner} alt="loading animation" />
{:else}
  <p id='spacesSubtext'>These are a few Spaces that OIM Users own:</p>
{/if}
<div id='randomSpaces' class="user-spaces"></div>

<div class='clearfix'></div>

<footer class='w3-light-grey w3-padding-64 w3-center' id='about'>
  <!-- <h2>About</h2> 
    <p>These are my favorite NFTs. Please enjoy!</p>   
  <br> -->
  <p>Powered by <a href='https://vdfyi-uaaaa-aaaai-acptq-cai.ic0.app/' target='_blank' class='w3-hover-text-green'>Open Internet Metaverse</a> and hosted on <a href='https://internetcomputer.org/' target='_blank' class='w3-hover-text-green'>Internet Computer</a></p>
</footer>
