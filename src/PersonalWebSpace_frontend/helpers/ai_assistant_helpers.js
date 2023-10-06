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
    contentEntity.setAttribute('position', '0 3 -6'); // TODO
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
    contentEntity.setAttribute('position', '0 3 -6'); // TODO
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
  // Determine whether the image is 360 degree and set the appropriate attribute
  if (elementData.elementSubType === "gltf") {
    const contentEntity = aScene.ownerDocument.createElement('a-entity');
    contentEntity.setAttribute('gltf-model', '#' + assetId);
    const newElementId = `assistantAddedModel_${Math.random().toString(16).slice(2)}`;
    contentEntity.setAttribute('id', newElementId);
    contentEntity.setAttribute('position', '0 3 -6'); // TODO
    // @ts-ignore
    contentEntity.setAttribute('animation-mixer');
    console.log("Debug addModelEntityToScene contentEntity ", contentEntity);
    aScene.appendChild(contentEntity);
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
    if (elementData.elementType === "model") {
      assetType = 'a-asset-item';
    } else if (elementData.elementType === "video") {
      assetType = 'video';
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
    newAsset.addEventListener('load', function(){
      loadedElementCallback(elementData, newAssetId, aScene);
    });
  };
};