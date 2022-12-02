import { PersonalWebSpace_backend, canisterId, createActor } from "../../declarations/PersonalWebSpace_backend";

import { AuthClient } from "@dfinity/auth-client";
import { html, render } from "lit-html";
// https://internetcomputer.org/docs/current/developer-docs/build/frontend/webpack-config/
// https://github.com/Toniq-Labs/stoic-identity 
import { StoicIdentity } from "ic-stoic-identity";
import { AccountIdentifier, LedgerCanister, ICP } from "@dfinity/nns";
import { HttpAgent } from "@dfinity/agent";

const isValidUrl = (url) => {
  try {
    new URL(url);
  } catch (e) {
    console.error('in isValidUrl');
    console.error(e);
    console.error(url);
    return false;
  }
  return true;
};

const inputHandler = function(e) {
  if (!isValidUrl(e.target.value)) {
    e.target.value = null;
    e.target.placeholder = "Please only enter valid URLs";
  }
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

//function openEditView(gallery) {
const openEditView = (evt) => {
  document.getElementById("editView").style.display = "block";
  const actor = evt.currentTarget.actor;
  // fill form with Gallery data
  const gallery = evt.currentTarget.associatedGallery;
  let galleryName = "";
  let galleryDescription = "";
  let ownerName = "";
  let ownerContactInfo = "";
  let mediaUrls = [];
  const galleryDataFields = gallery.metadata[0]?.key_val_data;
  for (var i = 0; i < galleryDataFields.length; i++) {
    let fieldKey = galleryDataFields[i].key;
    if (fieldKey === "galleryName") {
      galleryName = galleryDataFields[i].val.TextContent;
    } else if (fieldKey === "galleryDescription") {
      galleryDescription = galleryDataFields[i].val.TextContent;
    } else if (fieldKey === "ownerName") {
      ownerName = galleryDataFields[i].val.TextContent;      
    } else if (fieldKey === "ownerContactInfo") {
      ownerContactInfo = galleryDataFields[i].val.TextContent;      
    } else if (fieldKey === "mediaUrls") {
      mediaUrls = galleryDataFields[i].val.TextArrayContent;      
    }    
  }
  document.getElementById("galleryname").value = galleryName;
  document.getElementById("gallerydescription").value = galleryDescription;
  document.getElementById("ownername").value = ownerName;
  document.getElementById("ownercontactinfo").value = ownerContactInfo;

  document.getElementById("galleryname").style.width = "100%";
  document.getElementById("gallerydescription").style.width = "100%";
  document.getElementById("ownername").style.width = "100%";
  document.getElementById("ownercontactinfo").style.width = "100%";

  // show bridged NFT URLs
  var urlsInputElementsToDisplay = [];
  for (var j = 0; j < mediaUrls.length; j++) {
    const inputDiv = document.createElement("div");
    inputDiv.style = "width:100%;";
    const removeButton = document.createElement("button");
    removeButton.style = "font-size:30px;width:40px;margin-right:5px;vertical-align:middle;";
    removeButton.innerHTML = "X";
    removeButton.addEventListener('click', function() {
      document.getElementById("galleryimagelinks").removeChild(inputDiv);
    });
    const input = document.createElement("input");
    input.class = "fullwidthinput";
    input.style = "width:85%;";
    input.type = "url";
    input.placeholder = "The NFT's URL";
    input.name = "galleryimagelink";
    input.addEventListener('change', inputHandler);
    if (isValidUrl(mediaUrls[j])) {
      input.value = mediaUrls[j];
    } else {
      input.value = "InvalidURL"; //potentially don't include element for invalid URL at all
    }
    inputDiv.appendChild(removeButton);
    inputDiv.appendChild(input);
    urlsInputElementsToDisplay.push(inputDiv);     
  }
  if (urlsInputElementsToDisplay.length === 0) {
    // at least one empty field should be displayed
    const inputDiv = document.createElement("div");
    inputDiv.style = "width:100%;";
    const removeButton = document.createElement("button");
    removeButton.style = "font-size:30px;width:40px;margin-right:5px;vertical-align:middle;";
    removeButton.innerHTML = "X";
    removeButton.addEventListener('click', function() {
      document.getElementById("galleryimagelinks").removeChild(inputDiv);
    });
    const input = document.createElement("input");
    input.class = "fullwidthinput";
    input.style = "width:85%;";
    input.type = "url";
    input.placeholder = "The NFT's URL";
    input.name = "galleryimagelink";
    input.addEventListener('change', inputHandler);
    inputDiv.appendChild(removeButton);
    inputDiv.appendChild(input);
    urlsInputElementsToDisplay.push(inputDiv); 
  }  
  document.getElementById("galleryimagelinks").replaceChildren(...urlsInputElementsToDisplay);

  // add updateUserGallery as onclick event to submit button
  const submitButton = document.getElementById("submitbutton");
  submitButton.onclick = async () => {
    submitButton.innerText = "Saving Your Changes...";
    submitButton.setAttribute("disabled", true);

    // collect user's links to media
    let mediaUrlsToDisplay = [];
    let urlInputElements = document.getElementById("galleryimagelinks").children;
    for (var y = 0; y < urlInputElements.length; y++) {
      if (urlInputElements[y].children[1].value !== "" && isValidUrl(urlInputElements[y].children[1].value)) { // ensure it's a url
        mediaUrlsToDisplay.push(urlInputElements[y].children[1].value);
      } 
    }

    const newGalleryData = {
      id: gallery.id,
      galleryName: document.getElementById("galleryname").value,
      galleryDescription: document.getElementById("gallerydescription").value,
      ownerName: document.getElementById("ownername").value,
      ownerContactInfo: document.getElementById("ownercontactinfo").value,
      mediaUrlsToDisplay: mediaUrlsToDisplay,
    };
    console.log("###################newGalleryData#########################");
    console.log(newGalleryData);
    const updatedGallery = await actor.updateUserGallery(newGalleryData);
    console.log("###################updatedGallery#########################");
    console.log(updatedGallery);

    // reload user's galleries
    loadUserGalleries(actor);

    submitButton.removeAttribute("disabled");
    submitButton.innerText = "Save Changes";
    // close popup
    closeEditView();
  };  
}

const initiateEditButtons = (actor, userGalleries) => {
  var coll = document.getElementsByClassName('editbutton');
  var i;
  if (userGalleries.length === coll.length) {
    for (i = 0; i < coll.length; i++) {
      coll[i].actor = actor;
      coll[i].associatedGallery = userGalleries[i];
      coll[i].addEventListener('click', openEditView);
    }
  }
};

 //function closeEditView() {
const closeEditView = () => {
  document.getElementById("editView").style.display = "none";
}

/*
const initiateCancelButtons = () => {
  var coll = document.getElementsByClassName('cancelbutton');
  var i;
  console.log('initiateCancelButtons');
  console.log(coll.length);
  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener('click', closeEditView);
  }
}; */

const formatUserGalleries = (userGalleries) => {
  // transform userGalleries list to string holding HTML ready to be displayed
  // example:
  /*<div class='responsive'>
      <div class='gallery'>
        <a target='_blank' href='https://www.w3schools.com/css/img_5terre.jpg'>
          <img src='https://www.w3schools.com/css/img_5terre.jpg' alt='Cool NFT' width='600' height='400'>
        </a>
        <button type='button' class='collapsible'>See Details</button>
        <div class='content'>
          <p>Lorem ipsum .</p>
        </div>
      </div>
    </div> */
  
  var userGalleriesString = ``;
  for (let i = 0; i < userGalleries.length; i++) {
    const gallery = userGalleries[i];
    userGalleriesString += `<div class='responsive' width="100%" height="auto"> <div class='gallery'> `;
    const galleryURL = `https://${canisterId}.raw.ic0.app/?galleryId=${gallery.id}`;
    userGalleriesString += `<a target='_blank' href="${galleryURL}" > <iframe src="${galleryURL}" alt='Your flaming hot Personal NFT Gallery' width="100%" height="auto"></iframe> </a> `;
    userGalleriesString += `<button onclick="window.open('${galleryURL}','_blank')">View</button> <button class='editbutton' >Edit</button> `;
    userGalleriesString += `<button type='button' class='collapsible'>See Details</button>`;
    // show gallery details
    var galleryDetails = `<div class='content'> `;
    var galleryName = "";
    var galleryDescription = "";
    var ownerName = "";
    var ownerContactInfo = "";
    var creationTime = 0;
    for (var j = 0; j < gallery.metadata[0].key_val_data.length; j++) {
      let fieldKey = gallery.metadata[0].key_val_data[j].key;
      if (fieldKey === "galleryName") {
        galleryName = gallery.metadata[0].key_val_data[j].val.TextContent;
      } else if (fieldKey === "galleryDescription") {
        galleryDescription = gallery.metadata[0].key_val_data[j].val.TextContent;
      } else if (fieldKey === "ownerName") {
        ownerName = gallery.metadata[0].key_val_data[j].val.TextContent;      
      } else if (fieldKey === "ownerContactInfo") {
        ownerContactInfo = gallery.metadata[0].key_val_data[j].val.TextContent;      
      } else if (fieldKey === "creationTime") {
        creationTime = new Date(Number(gallery.metadata[0].key_val_data[j].val.Nat64Content) / 1000000); 
      }
    }
    galleryDetails += `<p>Owner: ${gallery.owner}</p> `;
    galleryDetails += `<p>Owner Name: ${ownerName}</p> `;
    galleryDetails += `<p>Owner Contact Info: ${ownerContactInfo}</p> `;
    galleryDetails += `<p>Gallery Name: ${galleryName}</p> `;
    galleryDetails += `<p>Gallery Description: ${galleryDescription}</p> `;
    galleryDetails += `<p>Creation Time: ${creationTime}</p> `;
    galleryDetails += `</div> `;
    userGalleriesString += galleryDetails;
    userGalleriesString += `</div> </div>`;    
  }
  return userGalleriesString;
};

const loadUserGalleries = async (actor) => {
  const userGalleries = await actor.getCallerGalleries();
  const numberOfGalleriesUserOwns = userGalleries.length;
  if (numberOfGalleriesUserOwns < 1) {
    document.getElementById("galleriesSubtext").innerText = "You don't own any galleries yet. Get your Personal NFT Gallery now by clicking on the Create tab!";
  } else {
    document.getElementById("galleriesSubtext").innerText = numberOfGalleriesUserOwns === 1 
      ? `Big success, you own ${numberOfGalleriesUserOwns} gallery! Let's take a look:`
      : `Big success, you own ${numberOfGalleriesUserOwns} galleries! Let's take a look:`;
    const userGalleriesString = formatUserGalleries(userGalleries);
    document.getElementById("userGalleries").innerHTML = userGalleriesString;
    initiateCollapsibles();
    initiateEditButtons(actor, userGalleries);
  }
};

const notLoggedInContent = html`<div class="container">
  <h3><b>We're glad you're here! Get started right away by logging in:</b></h3>
  <button type="button" id="stoicLoginButton">Log in with Stoic Wallet</button>
  <p>You need to be logged in to create and update galleries. If you want to see others' galleries first, click on the Explore tab</p>
</div>`;

export const renderNotLoggedIn = async () => {
  const createButton = document.getElementById("createButton");
  createButton.setAttribute("disabled", true);
  document.getElementById("galleriesSubtext").innerText = "Let's see which galleries you own; log in to get started.";
  render(notLoggedInContent, document.getElementById("login"));
};

export const renderLoggedIn = async (actor, authClient, identity) => {
  render(html``, document.getElementById("login"));
  const createButton = document.getElementById("createButton");
  createButton.removeAttribute("disabled");
  createButton.onclick = async () => {
    createButton.setAttribute("disabled", true);
    document.getElementById("createSubtext").innerText = "Creating your Personal NFT Gallery, just a moment...";

    const gallery = await actor.createGallery();
    document.getElementById("createSubtext").innerText = "Ohh yeah, you just got yourself a new Personal NFT Gallery!";
    
    // reload user's galleries
    loadUserGalleries(actor);

    createButton.removeAttribute("disabled");
  };
  document.getElementById("galleriesSubtext").innerText = "Let's see which galleries you own:";
  // load user's galleries
  loadUserGalleries(actor);
};

async function handleAuthenticated(authClient, page = "index", identityProvider = "stoicWallet") {
  let mint_actor;
  let identity;
  if (identityProvider === "internetIdentity") {
    identity = await authClient.getIdentity();
    mint_actor = createActor(canisterId, {
      agentOptions: {
        identity,
      },
    });
  } else if (identityProvider === "stoicWallet") {
    identity = await StoicIdentity.connect();
    mint_actor = createActor(canisterId, {
      agentOptions: {
        identity,
      },
    });
  }

  if (page === "index") {
    renderLoggedIn(mint_actor, authClient, identity);
  } else {
    renderLoggedIn(mint_actor, authClient, identity);
  }
}

const init = async () => {
  /* const authClient = await AuthClient.create();
  if (await authClient.isAuthenticated()) {
    handleAuthenticated(authClient, "index", "internetIdentity");
  } */
  const stoicIdentity = await StoicIdentity.load();
  if (stoicIdentity !== false) {
    //ID is an already connected wallet!
    handleAuthenticated(null, "index", "stoicWallet");
  }
  renderNotLoggedIn();
  const stoicLoginButton = document.getElementById(
    "stoicLoginButton"
  );
  stoicLoginButton.onclick = async () => {
    handleAuthenticated(null, "index", "stoicWallet");
  };

  /* const loginButton = document.getElementById(
    "loginButton"
  );
  const days = BigInt(1);
  const hours = BigInt(24);
  const nanoseconds = BigInt(3600000000000);
  loginButton.onclick = async () => {
    await authClient.login({
      onSuccess: async () => {
        handleAuthenticated(authClient, "index", "internetIdentity");
      },
      identityProvider:
        process.env.DFX_NETWORK === "ic"
          ? "https://identity.ic0.app/#authorize"
          : process.env.LOCAL_II_CANISTER,
      maxTimeToLive: days * hours * nanoseconds,
    });
  }; */
}

// init();

import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const canvas = document.querySelector(".webgl");
const scene = new THREE.Scene();
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100);
camera.position.z = 2;
camera.position.set(2, 2, 2);
camera.lookAt(0,0,0);
scene.add(camera);

/* const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x781CE5 });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh); */

const ambient = new THREE.AmbientLight(0x404040, 5);
const point = new THREE.PointLight(0xE4FF00, 1, 10);
point.position.set(3, 3, 2);
scene.add(ambient);
scene.add(point);

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderConfig({ type: 'js' });
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
loader.setDRACOLoader( dracoLoader );

loader.load( 'roomModel.glb', function ( gltf ) {

	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setClearColor(0x222222);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.render(scene, camera);

function animate() {
  /* mesh.rotation.x += 0.003
  mesh.rotation.y += 0.004
  mesh.rotation.z += 0.005 */
  
  renderer.render(scene, camera)
  
  window.requestAnimationFrame(animate)
}
  
animate();