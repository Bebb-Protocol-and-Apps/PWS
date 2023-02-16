import { PersonalWebSpace_backend, canisterId, createActor } from "../../declarations/PersonalWebSpace_backend";
const PersonalWebSpace_frontend_canister_id = "vdfyi-uaaaa-aaaai-acptq-cai"; // deployed on mainnet
//import { AuthClient } from "@dfinity/auth-client";
import { html, render } from "lit-html";
// https://internetcomputer.org/docs/current/developer-docs/build/frontend/webpack-config/
// https://github.com/Toniq-Labs/stoic-identity 
import { StoicIdentity } from "ic-stoic-identity";
//import { AccountIdentifier, LedgerCanister, ICP } from "@dfinity/nns";
//import { HttpAgent } from "@dfinity/agent";
import * as THREE from 'three';
import { OBJLoader  } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
//import * as AFrameInspector from 'aframe-inspector';
import { getEntityClipboardRepresentation } from './entity.js';


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
/* 
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
} */

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

const formatUserSpaces = (userSpaces) => {
  // transform userSpaces list to string holding HTML ready to be displayed  
  var userSpacesString = ``;
  for (let i = 0; i < userSpaces.length; i++) {
    const space = userSpaces[i];
    userSpacesString += `<div class='responsive' width="100%" height="auto"> <div class='space'> `;
    const spaceURL = `https://${PersonalWebSpace_frontend_canister_id}.raw.ic0.app/?spaceId=${space.id}`;
    userSpacesString += `<a target='_blank' href="${spaceURL}" > <iframe src="${spaceURL}" alt='Your flaming hot Personal Web Space' width="100%" height="auto"></iframe> </a> `;
    //userSpacesString += `<button onclick="window.open('${spaceURL}','_blank')">View</button> <button class='editbutton' >Edit</button> `;
    userSpacesString += `<button onclick="window.open('${spaceURL}','_blank')">View</button> `;
    userSpacesString += `<button type='button' class='collapsible'>See Details</button>`;
    // show space details
    var spaceDetails = `<div class='content'> `;
    var spaceName = "";
    var spaceDescription = "";
    var ownerName = "";
    var ownerContactInfo = "";
    var creationTime = 0;
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

const loadUserSpaces = async (actor) => {
  const userSpaces = await actor.getCallerSpaces();
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
    //initiateEditButtons(actor, userSpaces);
  }
};

const notLoggedInContent = html`<div class="container">
  <h3><b>We're glad you're here! Get started right away by logging in:</b></h3>
  <button type="button" id="stoicLoginButton">Log in with Stoic Wallet</button>
  <p>You need to be logged in to create and update spaces. If you want to see others' spaces first, click on the Explore tab</p>
</div>`;

export const renderNotLoggedIn = async () => {
  const createButton = document.getElementById("createButton");
  createButton.setAttribute("disabled", true);
  document.getElementById("spacesSubtext").innerText = "Let's see which spaces you own; log in to get started.";
  render(notLoggedInContent, document.getElementById("login"));
};

export const renderLoggedIn = async (actor, authClient, identity) => {
  render(html``, document.getElementById("login"));
  const createButton = document.getElementById("createButton");
  createButton.removeAttribute("disabled");
  createButton.onclick = async () => {
    createButton.setAttribute("disabled", true);
    document.getElementById("createSubtext").innerText = "Creating your Personal Web Space, just a moment...";

    const resp = await fetch("spaces.html");
    const defaultSpaceHtml = await resp.text();
    const space = await actor.createSpace(defaultSpaceHtml);
    document.getElementById("createSubtext").innerText = "Ohh yeah, you just got yourself a new Personal Web Space!";
    
    // reload user's spaces
    loadUserSpaces(actor);

    createButton.removeAttribute("disabled");
  };
  document.getElementById("spacesSubtext").innerText = "Let's see which spaces you own:";
  // load user's spaces
  loadUserSpaces(actor);
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

const showLandingPage = async () => {
  const resp = await fetch("landing_page.html");
  const html = await resp.text();
  //console.log('in index.js html');
  //console.log(html);
  document.write(html);
}

const saveButtonOnClick = async () => {
  console.log('in addScene saveButton onclick');
  // Get updated scene and write it to backend
  //console.log('AFRAME', AFRAME);
  //console.log('AFRAME.INSPECTOR.history.updates', AFRAME.INSPECTOR.history.updates);
  //console.log('AFRAME.INSPECTOR.scene.toJSON', AFRAME.INSPECTOR.scene.toJSON());
  //console.log('AFRAME.INSPECTOR.scene.object3D', AFRAME.INSPECTOR.scene.object3D);
  //console.log('getEntityClipboardRepresentation(document.querySelector(a-scene))', getEntityClipboardRepresentation(document.querySelector('a-scene')));
  const updatedSceneHtml = getEntityClipboardRepresentation(AFRAME.scenes[0]);
  console.log('updatedSceneHtml', updatedSceneHtml);
  const upperHTML = `<html>
  <head>
    <script src="https://aframe.io/releases/1.3.0/aframe.min.js"></script>
  </head>
  <body>`;
  const lowerHTML = `</body> </html>`;
  const newHTML = upperHTML + updatedSceneHtml + lowerHTML;
  // Write space's updated HTML to backend canister
  //document.body.innerHTML = updatedSceneHtml;
  // Close Inspector and hide button Inspect Scene
  await AFRAME.INSPECTOR.close();
  var elements = document.body.getElementsByClassName("toggle-edit");    
  var toggleElement = elements.item(0);
  toggleElement.hidden = true;  
};

const loadSaveButton = () => {
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
    setTimeout(() => {
      loadSaveButton();
    }, 1000);
  };
};

const editButtonOnClick = async () => {
  await document.querySelector('a-scene').components.inspector.openInspector();
  setTimeout(() => {
    loadSaveButton();      
  }, 1000);
};

const loginButtonOnClick = async () => {
  console.log('in loginButtonOnClick');
  /* await StoicIdentity.load().then(async identity => {
    console.log('in addScene identity');
    console.log(identity);
    if (identity !== false) {
      //ID is an already connected wallet!
    } else {
      //No existing connection, lets make one!
      identity = await StoicIdentity.connect();
    }
    
    //Lets display the connected principal!
    console.log(identity.getPrincipal().toText());
    
    //Create an actor canister
    const mint_actor = createActor(canisterId, {
      agentOptions: {
        identity,
      },
    });
    console.log('in addScene mint_actor');
    console.log(mint_actor);
    
    //Disconnect after
    //StoicIdentity.disconnect();
  }); */
  /* const stoicIdentity = await StoicIdentity.load();
  console.log('in loginButtonOnClick stoicIdentity');
  console.log(stoicIdentity);
  if (stoicIdentity !== false) {
    //ID is an already connected wallet!
    console.log('in loginButtonOnClick stoicIdentity not false');
  } */
  const identity = await StoicIdentity.connect();
  console.log('in loginButtonOnClick identity');
  console.log(identity);
  const mint_actor = createActor(canisterId, {
    agentOptions: {
      identity,
    },
  });
  console.log('in loginButtonOnClick mint_actor');
  console.log(mint_actor);
};

const loadLoginButton = () => {
  var loginButton = document.getElementById(
    "login-button"
  );
  // const loginButton = document.querySelector('#login-button');
  if(!loginButton) {
    setTimeout(() => {
      console.log("Login button - Delayed for 1 second.");
      loadLoginButton();
    }, 1000);
  } else {
    loginButton.onclick = loginButtonOnClick;
  };
};

const loadEditButton = () => {
  var editButton = document.getElementById(
    "edit-button"
  );
  if(!editButton) {
    setTimeout(() => {
      console.log("Edit button - Delayed for 1 second.");
      loadEditButton();
    }, 1000);
  } else {
    editButton.onclick = editButtonOnClick;
  };
};

const addScene = async () => {
  const resp = await fetch("spaces.html");
  const html = await resp.text();
  document.write(html);

  loadLoginButton();
  loadEditButton();  
}

const addSceneFromSpace = async (spaceId) => {
  console.log('in index addSceneFromSpace');
  const spaceNFTResponse = await PersonalWebSpace_backend.getSpace(Number(spaceId));
  console.log('in index spaceNFTResponse');
  console.log(spaceNFTResponse);
  const spaceHtml = spaceNFTResponse.Ok.metadata[0].data;
  var string = new TextDecoder().decode(spaceHtml);
  string = string.replace(/\\"/g, '"');
  console.log('in index string removed escapes');
  console.log(string);
  document.write(string);
  // Add common elements 
  // Login Button
  // Edit Button 
}

const addSceneFromModel = async () => {
  //https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_obj_mtl.html

  console.log('in index addSceneFromModel');
  const scene = new THREE.Scene();  
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.z = 3
  const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
	scene.add( ambientLight );
	const pointLight = new THREE.PointLight( 0xffffff, 0.8 );
  pointLight.position.set(2.5, 7.5, 15)
  scene.add( pointLight );
	camera.add( pointLight );
	scene.add( camera );

  function loadModel() {

    object.traverse( function ( child ) {

      if ( child.isMesh ) child.material.map = texture;

    } );

    object.position.y = - 95;
    scene.add( object );
  }

  const manager = new THREE.LoadingManager( loadModel );
  //const textureLoader = new THREE.TextureLoader( manager );
	//const texture = textureLoader.load( 'textures/uv_grid_opengl.jpg' );
  //const modelLoader = new OBJLoader(manager);
  const modelLoader = new OBJLoader();
	modelLoader.load('workshopSet.obj', function ( workshopObject ) {
    console.log('workshopObject', workshopObject);
    //workshopObject.position.y = - 95;

    scene.add(workshopObject);

  }, undefined, function ( error ) {

    console.error( error );

  } );

  const onProgress = function ( xhr ) {

    if ( xhr.lengthComputable ) {

      const percentComplete = xhr.loaded / xhr.total * 100;
      console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

    }

  };

  new MTLLoader()
					//.setPath( './' )
					.load( 'workshopSet.mtl', function ( materials ) {

						materials.preload();

						new OBJLoader()
							.setMaterials( materials )
							//.setPath( 'models/obj/male02/' )
							.load( 'workshopSet.obj', function ( object ) {

								object.position.y = - 95;
								scene.add( object );

							}, onProgress, function ( error ) {

                console.error( error );
            
              } );

					} );

  const renderer = new THREE.WebGLRenderer();
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  //document.body.appendChild( renderer.domElement );
  //document.body = renderer.domElement;
  //document.write(renderer.domElement);
  var code_container = document.createElement("div");
  code_container.appendChild( renderer.domElement );
  document.body.replaceChildren( renderer.domElement )
  //document.getElementsByTagName('body')[0].replaceChildren = code_container;
  camera.lookAt( scene.position );
  renderer.render(scene, camera);

  function animate() {
    requestAnimationFrame( animate );
    renderer.render(scene, camera);
  }
  animate();
}

const addAFrameSceneFromModel = async () => {
  console.log('in index addAFrameSceneFromModel');
  //https://github.com/aframevr/aframe/blob/master/docs/components/obj-model.md
  //https://www.futurelearn.com/info/courses/a-beginners-guide-to-creating-a-webvr-experience-using-aframe/0/steps/328745
  //https://jgbarah.github.io/aframe-playground/figures-04/
  const resp = await fetch("aframeobj.html");
  console.log('in index addAFrameSceneFromModel resp', resp);
  const html = await resp.text();
  console.log('in index addAFrameSceneFromModel html', html);
  document.write(html);
}

const addAFrameTestRoom = async () => {
  console.log('in index addAFrameTestRoom');
  const resp = await fetch("testroom.html");
  console.log('in index addAFrameTestRoom resp', resp);
  const html = await resp.text();
  console.log('in index addAFrameTestRoom html', html);
  document.write(html);
}

if (window.location.href.endsWith('/spaces')) {
  addScene();
} else if (window.location.href.includes('?spaceId=')) {
  const urlParams = new URLSearchParams(window.location.search);
  const spaceId = urlParams.get('spaceId');
  addSceneFromSpace(spaceId);
} else if (window.location.href.includes('/objtest')) {
  addSceneFromModel();
} else if (window.location.href.includes('/objaframe')) {
  addAFrameSceneFromModel();    
} else if (window.location.href.includes('/testroom')) {
  addAFrameTestRoom();    
} else {
  //showLandingPage();
  init();
  //addScene();
};
