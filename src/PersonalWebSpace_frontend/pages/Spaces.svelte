<script lang="ts">
  import { onMount } from "svelte";
  import { getEntityClipboardRepresentation } from '../helpers/entity.js';

  const saveButtonOnClick = async () => {
    // Get updated scene and write it to backend
    const updatedSceneHtml = getEntityClipboardRepresentation(AFRAME.scenes[0]);
    const respUpper = await fetch("spacesUpperHtml.html");
    const upperHTML = await respUpper.text();
    const respLower = await fetch("spacesLowerHtml.html");
    const lowerHTML = await respLower.text();
    const newHTML = upperHTML + updatedSceneHtml + lowerHTML;
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
    const mint_actor = createActor(canisterId, {
      agentOptions: {
        identity,
      },
    });
  };

  const loadLoginButton = () => {
    var loginButton = document.getElementById(
      "login-button"
    );
    // const loginButton = document.querySelector('#login-button');
    if(!loginButton) {
      setTimeout(() => {
        //console.log("Login button - Delayed for 1 second.");
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
        //console.log("Edit button - Delayed for 1 second.");
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
  };

  onMount(addScene);
</script>
