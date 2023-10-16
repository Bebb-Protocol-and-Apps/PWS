const isValidUrl = (url) => {
  try {
    new URL(url);
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
};

function addImageEntityToScene(elementData, assetId, aScene) {
  console.log("Debug addImageEntityToScene");
  if (!elementData || !assetId || !aScene) {
    return;
  };
  // Determine whether the image is 360 degree and set the appropriate attribute
  if (elementData.elementSubType === "360Degree") {
    const contentEntity = aScene.ownerDocument.createElement('a-sky');
    contentEntity.setAttribute('src', '#' + assetId);
    const newElementId = `assistantAdded360Image_${Math.random().toString(16).slice(2)}`;
    contentEntity.setAttribute('id', newElementId);
    contentEntity.setAttribute('rotation', '0 -130 0');
    console.log("Debug addImageEntityToScene contentEntity ", contentEntity);
    const existingSky = aScene.querySelector('a-sky');
    if (existingSky) {
      aScene.replaceChild(contentEntity, existingSky);
    } else {
      aScene.appendChild(contentEntity);
    };
  } else {
    const contentEntity = aScene.ownerDocument.createElement('a-image');
    contentEntity.setAttribute('src', '#' + assetId);
    const newElementId = `assistantAddedImage_${Math.random().toString(16).slice(2)}`;
    contentEntity.setAttribute('id', newElementId);
    contentEntity.setAttribute('position', '0 6 -6'); // TODO
    console.log("Debug addImageEntityToScene contentEntity ", contentEntity);
    aScene.appendChild(contentEntity);
  };
};

function addVideoEntityToScene(elementData, assetId, aScene) {
  console.log("Debug addVideoEntityToScene");
  if (!elementData || !assetId || !aScene) {
    return;
  };
  // Determine whether the video is 360 degree and set the appropriate attribute
  if (elementData.elementSubType === "360Degree") {
    const contentEntity = aScene.ownerDocument.createElement('a-videosphere');
    contentEntity.setAttribute('src', '#' + assetId);
    const newElementId = `assistantAdded360Video_${Math.random().toString(16).slice(2)}`;
    contentEntity.setAttribute('id', newElementId);
    contentEntity.setAttribute('rotation', '0 -130 0');
    contentEntity.setAttribute('autoplay', true);
    contentEntity.setAttribute('loop', true);
    console.log("Debug addVideoEntityToScene contentEntity ", contentEntity);
    const existingVideosphere  = aScene.querySelector('a-videosphere');
    if (existingVideosphere) {
      aScene.replaceChild(contentEntity, existingVideosphere);
    } else {
      aScene.appendChild(contentEntity);
    };
  } else {
    const contentEntity = aScene.ownerDocument.createElement('a-video');
    contentEntity.setAttribute('src', '#' + assetId);
    const newElementId = `assistantAddedVideo_${Math.random().toString(16).slice(2)}`;
    contentEntity.setAttribute('id', newElementId);
    contentEntity.setAttribute('position', '0 6 -6'); // TODO
    console.log("Debug addVideoEntityToScene contentEntity ", contentEntity);
    contentEntity.setAttribute('video-play-on-click', true); // Add component to play video on click
    aScene.appendChild(contentEntity);
  };
};

function addModelEntityToScene(elementData, assetId, aScene) {
  console.log("Debug addModelEntityToScene");
  if (!elementData || !assetId || !aScene) {
    return;
  };
  if (!elementData.elementSubType) {
    elementData.elementSubType = "gltf";
  };
  if (elementData.elementSubType === "gltf") {
    const contentEntity = aScene.ownerDocument.createElement('a-entity');
    contentEntity.setAttribute('gltf-model', '#' + assetId);
    const newElementId = `assistantAddedModel_${Math.random().toString(16).slice(2)}`;
    contentEntity.setAttribute('id', newElementId);
    contentEntity.setAttribute('position', '0 6 -6'); // TODO
    // @ts-ignore
    contentEntity.setAttribute('animation-mixer');
    console.log("Debug addModelEntityToScene contentEntity ", contentEntity);
    aScene.appendChild(contentEntity);
  };
};

function addIframeEntityToScene(elementData, assetId, aScene) {
  console.log("Debug addIframeEntityToScene elementData ", elementData);
  if (!elementData || !aScene) { // no asset needed for iframe
    return;
  };
  if (isValidUrl(elementData.src)) {
    console.log("Debug addIframeEntityToScene elementData.src ", `url:${elementData.src}`);
    // Create a new entity for the iframe
    const contentEntity = aScene.ownerDocument.createElement('a-entity');
    // Set properties on the new entity
    contentEntity.setAttribute('web-portal', `url:${elementData.src}; text:Video; width:4.4; height:3; frameWidth:0.03; sandboxPortal:false; isInteractable:true; enableOnClickTransition:false;`);
    const newElementId = `assistantAddedIframe_${Math.random().toString(16).slice(2)}`;
    contentEntity.setAttribute('id', newElementId);
    contentEntity.setAttribute('position', '0 1 -6'); // TODO
    console.log("Debug addIframeEntityToScene contentEntity ", contentEntity);
    aScene.appendChild(contentEntity);

    // DEBUG
   /*  const contentEntity2 = aScene.ownerDocument.createElement('a-entity');
    contentEntity2.setAttribute('web-portal', `url:https://www.youtube.com/embed/R9gz7uxEL4Q; text:YtLink; sandboxPortal:false;`);
    const newElementId2 = `assistantAddedIframe_${Math.random().toString(16).slice(2)}`;
    contentEntity2.setAttribute('id', newElementId2);
    contentEntity2.setAttribute('position', '-2 2 -6');
    //<iframe width="560" height="315" src="https://www.youtube.com/embed/R9gz7uxEL4Q" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
    const contentEntity3 = aScene.ownerDocument.createElement('a-entity');
    contentEntity3.setAttribute('web-portal', `url:https://c5rfj-tqaaa-aaaan-qd5qq-cai.icp0.io/; text:YtLink; sandboxPortal:false;`);
    const newElementId3 = `assistantAddedIframe_${Math.random().toString(16).slice(2)}`;
    contentEntity3.setAttribute('id', newElementId3);
    contentEntity3.setAttribute('position', '2 2 -6');
    aScene.appendChild(contentEntity2);
    aScene.appendChild(contentEntity3); */
  };
};

const loadedElementCallback = (elementData, assetId, aScene) => {
  console.log("Debug loadedElementCallback elementData.elementType ", elementData.elementType);
  if (elementData.elementType === "image") {
    addImageEntityToScene(elementData, assetId, aScene);
  } else if (elementData.elementType === "video") {
    addVideoEntityToScene(elementData, assetId, aScene);
  } else if (elementData.elementType === "model") {
    addModelEntityToScene(elementData, assetId, aScene);
  } else if (elementData.elementType === "iframe") {
    addIframeEntityToScene(elementData, assetId, aScene);
  };
};

/* 
  elementData should look like this:
  JSON object (potentially stringified)
  {
    elementType: "image" || "video" || "model",
    src: urlToAsset, // asset for element will be loaded from here
    elementSubType: e.g. "360Degree" || "gltf", // optional, depends on elementType
    assetId: existingContentAssetToUseForElement, // optional
  }
*/
export const addElementToSpace = (elementData, aScene = null) => {
  if (typeof elementData === 'string' || elementData instanceof String) {
    // @ts-ignore
    elementData = JSON.parse(elementData);
  };
  console.log("Debug addElementToSpace elementData ", elementData);
  if (!aScene) {
    aScene = document.querySelector('a-scene');
  };
  console.log("Debug addElementToSpace aScene ", aScene);

  let existingAsset;
  if (elementData.assetId) {
    existingAsset = aScene.querySelector(`#${elementData.assetId}`);
  };
  if (existingAsset) {
    loadedElementCallback(elementData, elementData.assetId, aScene);
  } else {
    // Create a new asset
    let assetType = 'img';
    let eventToListenTo = 'load'; // the different file types emit different events that we need to listen to
    if (elementData.elementType === "model" || elementData.elementType === "3D-model") {
      elementData.elementType = "model";
      assetType = 'a-asset-item';
      eventToListenTo = 'loaded';
    } else if (elementData.elementType === "video") {
      assetType = 'video';
      eventToListenTo = 'loadeddata';
      if (elementData.src.includes("embed")) {
        // Video cannot be loaded directly but must be embedded via an iframe
        elementData.elementType = "iframe";
        return loadedElementCallback(elementData, elementData.assetId, aScene); // iframe elements don't load via an asset in A-Frame
      };
    };
    console.log("Debug addElementToSpace assetType ", assetType);

    var newAsset = document.createElement(assetType);
    const newAssetId = `assistantAddedAsset_${Math.random().toString(16).slice(2)}`;
    newAsset.setAttribute('id', newAssetId);
    newAsset.setAttribute('crossorigin', 'anonymous');
    newAsset.setAttribute('src', elementData.src);
    // Append the new a-asset to the a-assets element
    var assets = document.querySelector('a-assets');
    assets.appendChild(newAsset);
    console.log("Debug addElementToSpace newAsset ", newAsset);
    newAsset.addEventListener(eventToListenTo, function(){
      console.log("Debug newAsset.addEventListener elementData ", elementData);
      loadedElementCallback(elementData, newAssetId, aScene);
    });
  };
};