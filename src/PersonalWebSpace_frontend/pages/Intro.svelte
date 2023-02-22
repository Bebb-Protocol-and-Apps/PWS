<script lang="ts">
  import { onMount } from "svelte";
  import { canisterId as PersonalWebSpace_frontend_canister_id } from "canisters/PersonalWebSpace_frontend";
  import { store } from "../store";
  import Login from "../components/Login.svelte";
  import Button from "../components/Button.svelte";

  const createNewUserSpace = async (element) => {
    element.setAttribute("disabled", true);
    document.getElementById("createSubtext").innerText = "Creating your Personal Web Space, just a moment...";
    
    const resp = await fetch("space.html");
    const defaultSpaceHtml = await resp.text();
    const space = await $store.backendActor.createSpace(defaultSpaceHtml);
    document.getElementById("createSubtext").innerText = "Ohh yeah, you just got yourself a new Personal Web Space!";
    
    // Reload user's spaces
    loadUserSpaces();

    element.removeAttribute("disabled");
  };

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
      userSpacesString += `<button onclick="window.open('${spaceURL}','_blank')">View</button> `;
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
    const userSpaces = await $store.backendActor.getCallerSpaces();
    const numberOfSpacesUserOwns = userSpaces.length;
    if (numberOfSpacesUserOwns < 1) {
      document.getElementById("spacesSubtext").innerText = "You don't own any spaces yet. Get your Personal Web Space now by clicking on the Create tab!";
    } else {
      document.getElementById("spacesSubtext").innerText = numberOfSpacesUserOwns === 1 
        ? `Big success, you own ${numberOfSpacesUserOwns} space! Let's take a look:`
        : `Big success, you own ${numberOfSpacesUserOwns} spaces! Let's take a look:`;
      const userSpacesString = formatUserSpaces(userSpaces);
      document.getElementById("userSpaces").innerHTML = userSpacesString;
      initiateCollapsibles();
    }
  };
</script>

<div class='topnav'>
  <a href='#top'>Open Internet Metaverse</a>
  <a href='#create'>Create</a>
  <a href='#spaces'>My Spaces</a>
  <a href='#/explore'>Explore</a>
</div>

<h3>Want to have your own Virtual Home?</h3>
<h3>Want to become part of the Open Metaverse Neighborhood?</h3>
<h3>Want to have your Personal Web Space as a 3D webpage?</h3>

<section id="login">
{#if !$store.isAuthed}
  <Login />
{:else}
  <div>Principal: {$store.principal}</div>
  <div>AccountId: {$store.accountId}</div>
  <Button on:click={() => store.disconnect()}>disconnect</Button>
{/if}
</section>

<h3 id='create'><b>Create a new Personal Web Space</b></h3>
{#if !$store.isAuthed}
  <button type='button' id='createButton' disabled >Create Space</button>
{:else}
  <button type='button' id='createButton' on:click={(e) => createNewUserSpace(e.target)} >Create Space</button>
{/if}
<p id='createSubtext'>Click and we'll generate a 3D room for you (Your Space, Your Realm, Your Virtual Home) which you can edit afterwards. Fun fact: The Space is an NFT itself and will be sent to your wallet. This way you know it's truly yours!</p>

<h3 id='spaces'><b>My Personal Web Spaces</b></h3>
{#if !$store.isAuthed}
  <p id='spacesSubtext'>Log in to see which spaces you own.</p>
{:else}
  <p id='spacesSubtext'>Let's see which spaces you own...</p>
  <div id='userSpaces' class="user-spaces"></div>
  <p hidden>{loadUserSpaces()}</p>
{/if}

<div class='clearfix'></div>

<footer class='w3-light-grey w3-padding-64 w3-center' id='about'>
  <!-- <h2>About</h2> 
    <p>These are my favorite NFTs. Please enjoy!</p>   
  <br> -->
  <p>Powered by <a href='https://vdfyi-uaaaa-aaaai-acptq-cai.ic0.app/' target='_blank' class='w3-hover-text-green'>Open Internet Metaverse</a> and hosted on <a href='https://internetcomputer.org/' target='_blank' class='w3-hover-text-green'>Internet Computer</a></p>
</footer>

<style global>
  .App-logo {
    height: 15vmin;
    pointer-events: none;
  }

  .App-header {
    margin-top: 150px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: calc(10px + 2vmin);
  }

  .App-link {
    color: rgb(26, 117, 255);
  }

  .demo-button {
    background: #a02480;
    padding: 0 1.3em;
    margin-top: 1em;
    border-radius: 60px;
    font-size: 0.7em;
    height: 35px;
    outline: 0;
    border: 0;
    cursor: pointer;
    color: white;
  }

  .demo-button:active {
    color: white;
    background: #979799;
  }
</style>
