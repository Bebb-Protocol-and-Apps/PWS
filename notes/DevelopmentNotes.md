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
        