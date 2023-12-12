# Dev Notes
### These are notes taken during the development work.

need to use single quotes in HTML to store as Text (which has double quotes)

remove all newlines and other space (used for exampleString): https://www.textfixer.com/tools/remove-line-breaks.php

Example how to inject Svelte component into HTML document:
```bash
  setTimeout(() => {
    console.log("Login button - Delayed for 1 second.");
    var div = document.createElement('DIV');
    div.setAttribute("style","position: absolute;top: 0;right: 0;width: 100%;height: 2em;display: flex;justify-content: end;align-items: end;z-index: 10;")
    const embed = new Login({
      target: div,
    });
    document.body.prepend(div);
  }, 1000);
```

HTML as string in Svelte needs the ending script tag to be escaped (see https://github.com/sveltejs/svelte/issues/5810)

Element to rerender everything inside when webHostedGlbModelUrl changes (https://www.webtips.dev/force-rerender-components-in-svelte), e.g.:
```bash
{#key webHostedGlbModelUrl} <GlbModelPreview bind:modelUrl={webHostedGlbModelUrl}/> {/key}
```

CORS issues in A-Frame: https://github.com/aframevr/aframe/issues/2156

Secure Iframes:
- https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
- https://www.w3schools.com/tags/att_iframe_sandbox.asp
- https://developer.mozilla.org/en-US/docs/Web/Security/IFrame_credentialless
- https://www.w3schools.com/tags/att_iframe_referrerpolicy.asp

3D Neighbor visualization in Space view:

A-Frame libraries:
```bash
  <!-- <script src="https://unpkg.com/aframe-web-portals@1.0.1/dist/aframe-web-portals.umd.js"></script> -->
  <!-- <script src="https://unpkg.com/aframe-websurfaces@1.4.0/dist/aframe-websurfaces.umd.js"></script> -->
```

Space Neighbors local testing with dummy entities:
```bash
  /* // for local testing, fill with dummy data
    const dummyTestEntity1 = {
      internalId: "internalEntityId1",
      creationTimestamp: 11111,
      creator: spaceNft.owner,
      owner: spaceNft.owner,
      settings: null,
      entityType: "Webasset",
      name: null,
      description: null,
      keywords: null,
      externalId: "https://vdfyi-uaaaa-aaaai-acptq-cai.ic0.app/#/space/0",
      entitySpecificFields: null,
      listOfEntitySpecificFieldKeys: null,
  };
  const dummyTestEntity2 = {
      internalId: "internalEntityId2",
      creationTimestamp: 2222,
      creator: spaceNft.owner,
      owner: spaceNft.owner,
      settings: null,
      entityType: "Webasset",
      name: null,
      description: null,
      keywords: null,
      externalId: "https://vdfyi-uaaaa-aaaai-acptq-cai.ic0.app/#/space/1",
      entitySpecificFields: null,
      listOfEntitySpecificFieldKeys: null,
  };
  const dummyTestEntity4 = {
      internalId: "internalEntityId4",
      creationTimestamp: 44444444444,
      creator: spaceNft.owner,
      owner: spaceNft.owner,
      settings: null,
      entityType: "Webasset",
      name: null,
      description: null,
      keywords: null,
      externalId: "https://vdfyi-uaaaa-aaaai-acptq-cai.ic0.app/#/space/3",
      entitySpecificFields: null,
      listOfEntitySpecificFieldKeys: null,
  };
  const dummyTestEntity3 = {
      internalId: "internalEntityId3",
      creationTimestamp: 3333333,
      creator: spaceNft.owner,
      owner: spaceNft.owner,
      settings: null,
      entityType: "Webasset",
      name: null,
      description: null,
      keywords: null,
      externalId: "https://vdfyi-uaaaa-aaaai-acptq-cai.ic0.app/#/space/2",
      entitySpecificFields: null,
      listOfEntitySpecificFieldKeys: null,
  };
  spaceNeighborsResponse = [dummyTestEntity1, dummyTestEntity2, dummyTestEntity3, dummyTestEntity4]; */
```

NFT related calls:
dfx canister --network ic call PersonalWebSpace_backend metadata "(\"yxqhi-2ikor-uwiaa-aaaaa-caat4-yaqca-aaaaa-a\")"

dfx canister --network ic call PersonalWebSpace_backend tokens "(\"cda4n-7jjpo-s4eus-yjvy7-o6qjc-vrueo-xd2hh-lh5v2-k7fpf-hwu5o-yqe\")"

dfx canister --network ic call PersonalWebSpace_backend balance "(\"cda4n-7jjpo-s4eus-yjvy7-o6qjc-vrueo-xd2hh-lh5v2-k7fpf-hwu5o-yqe\")"

dfx canister --network ic call PersonalWebSpace_backend http_request "(
  record {
    body = vec { };
    headers =  vec { };
    method = \"\";
    url = \"tokenid=yxqhi-2ikor-uwiaa-aaaaa-caat4-yaqca-aaaaa-a\";
  }
)"

dfx canister --network ic call PersonalWebSpace_backend createSpace "(\"<html>  <head>     <script src="https://aframe.io/releases/1.4.2/aframe.min.js"></script>     <script src="//cdn.rawgit.com/donmccurdy/aframe-extras/v3.8.3/dist/aframe-extras.min.js"></script>    <script src="https://mannymeadows.github.io/Noosa/aframe-sun-sky.min.js"></script>  </head>  <body>    <a-scene cursor="rayOrigin: mouse" gltf-model="dracoDecoderPath: https://www.gstatic.com/draco/v1/decoders/;" inspector="" keyboard-shortcuts="" screenshot="" vr-mode-ui="" device-orientation-permission-ui="" raycaster="direction: 0.9544506796854287 -0.10164039183312146 -0.2805229594810959; origin: -4.846717797159805 5.074580504821491 2.3289351396596443; useWorldCoordinates: true">       <a-assets>        <a-asset-item id="island-glb" src="tropical_island_modified.glb"></a-asset-item>       <a-asset-item id="sunbed-glb" src="at_a_beach_modified.glb"></a-asset-item>  </a-assets>      <a-entity camera="active: true" look-controls wasd-controls="acceleration:65; fly:true" position="0 4.6 0"></a-entity>       <a-light type="directional" intensity="0.9" position="-1 -2 2" light=""></a-light>      <a-light type="directional" intensity="1.0" position="2 1 -1" light=""></a-light>      <a-entity environment="preset: arches" position="7 -7 -9" ></a-entity>       <a-ocean color="#92E2E2" width="350" depth="250" density="150" speed="2" opacity="0.5"></a-ocean>  <a-entity gltf-model="#island-glb" scale="1 1 1" position="0 3 -5" id="Island" animation-mixer></a-entity>      <div class="a-loader-title" style="display: none;"></div> <div class="a-loader-title" style="display: none;"></div><div class="a-loader-title" style="display: none;"></div><div class="a-loader-title" style="display: none;"></div><div class="a-loader-title" style="display: none;"></div><div class="a-loader-title" style="display: none;"></div></a-scene>  </body> </html>\")"
        