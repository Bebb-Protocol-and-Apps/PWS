import html2canvas from "html2canvas";
import { store } from "../store";

import type {
  EntityInitiationObject,
  BridgeInitiationObject,
  EntityAttachedBridgesResult,
  EntityAttachedBridges,
  EntityAttachedBridge,
  Bridge,
  Entity,
  EntityPreview,
  EntityFilterCriterion,
  EntityUpdateObject,
} from "src/integrations/BebbProtocol/bebb.did";

export type BebbEntity = Entity;
export type BebbEntityInitiationObject = EntityInitiationObject;
export type BebbBridgeInitiationObject = BridgeInitiationObject;
export type BebbEntityAttachedBridgesResult = EntityAttachedBridgesResult;
export type BebbEntityAttachedBridges = EntityAttachedBridges;
export type BebbEntityAttachedBridge = EntityAttachedBridge;
export type BebbBridge = Bridge;
export type BebbEntityAndBridge = { entity: BebbEntity, bridge: BebbBridge };
export type BebbEntityPreview = EntityPreview;
export type BebbEntityFilterCriterion = EntityFilterCriterion;
export type BebbEntityUpdateObject = EntityUpdateObject;

let appStore;
store.subscribe((value) => appStore = value);

export async function createBebbEntity(entityInitiationObject: BebbEntityInitiationObject) {
  if (!appStore) {
    throw new Error("Error in createBebbEntity: store not initialized");
  };
  const createEntityResponse = await appStore.protocolActor.create_entity(entityInitiationObject);
  // @ts-ignore
  if (createEntityResponse && createEntityResponse.Ok) {
    return createEntityResponse.Ok;
  } else {
    throw new Error("Error creating new Entity");   
  };
};

export async function updateBebbEntity(entityUpdateObject: BebbEntityUpdateObject) {
  console.log("Debug updateBebbEntity entityUpdateObject ", entityUpdateObject);
  if (!appStore) {
    throw new Error("Error in updateBebbEntity: store not initialized");
  };
  const updateEntityResponse = await appStore.protocolActor.update_entity(entityUpdateObject);
  console.log("Debug updateBebbEntity updateEntityResponse ", updateEntityResponse);
  // @ts-ignore
  if (updateEntityResponse && updateEntityResponse.Ok) {
    return updateEntityResponse.Ok;
  } else {
    throw new Error("Error updating Entity");   
  };
};

export async function createBebbBridge(bridgeEntityInitiationObject: BebbBridgeInitiationObject) {
  if (!appStore) {
    throw new Error("Error in createBebbBridge: store not initialized");
  };
  const createBridgeResponse = await appStore.protocolActor.create_bridge(bridgeEntityInitiationObject);
  // @ts-ignore
  if (createBridgeResponse && createBridgeResponse.Ok) {
    return createBridgeResponse.Ok;
  } else {
    throw new Error("Error creating new Bridge");
  };
};

// TODO: updateBebbBridge

export async function createBebbEntityIfNonExistent(entityInitiationObject: BebbEntityInitiationObject) {
  if (!appStore) {
    throw new Error("Error in createBebbEntityIfNonExistent: store not initialized");
  };
  
  // Check that Entity doesn't already exist in Bebb
  const entitySpecificFields = JSON.parse(entityInitiationObject.entitySpecificFields[0]);
  const filterCriteria: BebbEntityFilterCriterion[] = [{
    criterionKey: "externalId",
    criterionValue: entitySpecificFields.externalId,
  }];
  
  const matchResult = await appStore.protocolActor.match_entities(filterCriteria);

  // Check if any Entities matched the filter criteria
  if (matchResult && matchResult.Ok && matchResult.Ok.length > 0) {
    // Assuming the first matched Entity is the correct one (and there are no duplicates)
    return {
      entityId: matchResult.Ok[0].id, // Return the id of the existing Entity
      newEntityCreated: false,
    };
  };

  // Entity does not exist, so create it
  return {
    entityId: await createBebbEntity(entityInitiationObject),
    newEntityCreated: true,
  };
}


export async function createBebbEntityAndBridge(entityInitiationObject: BebbEntityInitiationObject, bridgeEntityInitiationObject: BebbBridgeInitiationObject) {
  if (!appStore) {
    throw new Error("Error in createBebbEntityAndBridge: store not initialized");
  };
  const createEntityResponse = await createBebbEntityIfNonExistent(entityInitiationObject);
  // @ts-ignore
  if (createEntityResponse) {
    // @ts-ignore
    const newNeighborEntityId = createEntityResponse.entityId;
    if (!bridgeEntityInitiationObject.toEntityId || bridgeEntityInitiationObject.toEntityId === "") {
      bridgeEntityInitiationObject.toEntityId = newNeighborEntityId;
    } else {
      bridgeEntityInitiationObject.fromEntityId = newNeighborEntityId;
    };
    const createBridgeResponse = await createBebbBridge(bridgeEntityInitiationObject);
    // @ts-ignore
    if (createBridgeResponse) {
      return {
        entityId: newNeighborEntityId,
        bridgeId: createBridgeResponse,
        newEntityCreated: createEntityResponse.newEntityCreated,
      };
    } else {
      throw new Error("Error creating new Bridge");
    };
  } else {
    throw new Error("Error creating new Entity");   
  };
};

// Helper function to find Bridge(s) between Space and a Neighbor
export const getBebbBridgesBetweenEntities = async (bebbEntityId: string, connectedBebbEntityId: string, bridgingDirection = "from"): Promise<BebbBridge[]> => {
  if (!appStore) {
    throw new Error("Error in getBebbBridgesBetweenEntities: store not initialized");
  };

  if (!connectedBebbEntityId || !bebbEntityId) {
    return null;
  };

  try {
    const bridges = await getConnectedBridgesForEntityInBebb(bebbEntityId, bridgingDirection);

    // Filter Bridges based on the connected Entity ID and the bridging direction
    return bridges.filter(bridge => {
      if (bridgingDirection === "from") {
        return bridge.toEntityId === connectedBebbEntityId;
      } else {  // If bridgingDirection is "to"
        return bridge.fromEntityId === connectedBebbEntityId;
      }
    });
  } catch (error) {
    console.error("Error in getBebbBridgesBetweenEntities ", error);
    return null;
  };
};

export async function deleteBebbBridgesByOwner(bebbBridges: BebbBridge[], ownerIdentifier: string) {
  if (!appStore) {
    throw new Error("Error in deleteBebbBridgesByOwner: store not initialized");
  };
  // Delete Bridge(s) in Bebb Protocol owned by Space owner
  let requestPromises = [];
  for (var i = 0; i < bebbBridges.length; i++) {
    const bridgeId = bebbBridges[i].id;
    if (bridgeId && bebbBridges[i].owner?.toText() === ownerIdentifier) {
      requestPromises.push(appStore.protocolActor.delete_bridge(bridgeId)); // Send requests in parallel and then await all to speed up
    };
  };
  const deletionResponses = await Promise.all(requestPromises);
  for (var j = 0; j < deletionResponses.length; j++) {
    if (deletionResponses[j].Err) {
      console.error("Error deleting Space Neighbor ", deletionResponses[j].Err);
      return null;
    };
  };
  return true;
};

function extractBridgeIds(bridgesRetrieved: BebbEntityAttachedBridges, filters = {}): string[] {
  var filteredBridges = bridgesRetrieved.filter(bridge => bridge && bridge.id);
  // @ts-ignore
  if (filters && filters.OwnerCreated) {
    filteredBridges = filteredBridges.filter((attachedBridge: BebbEntityAttachedBridge) => attachedBridge.linkStatus.hasOwnProperty('CreatedOwner'));
  };
  return filteredBridges.map(bridge => bridge.id);    
};

export async function getConnectedBridgeIdsForEntityInBebb(bebbEntityId: string, bridgingDirection = "from", filters = {}): Promise<string[]> {
  if (!appStore) {
    throw new Error("Error in getConnectedBridgeIdsForEntityInBebb: store not initialized");
  };

  let bridgeIdsResponse;
  
  try {
    if (bridgingDirection === "from") {
      bridgeIdsResponse = await appStore.protocolActor.get_from_bridge_ids_by_entity_id(bebbEntityId);
    } else { // bridgingDirection === "to"
      bridgeIdsResponse = await appStore.protocolActor.get_to_bridge_ids_by_entity_id(bebbEntityId);
    };

    if (bridgeIdsResponse && bridgeIdsResponse.Ok && bridgeIdsResponse.Ok.length > 0) {
      return extractBridgeIds(bridgeIdsResponse.Ok, filters);
    };    
  } catch (error) {
    console.error("Error in getConnectedBridgeIdsForEntityInBebb ", error);
  };
  
  return [];
};

export async function getBebbBridges(bridgeIds: string[]): Promise<BebbBridge[]> {
  if (!appStore) {
    throw new Error("Error in getBridges: store not initialized");
  };

  let getBridgeRequestPromises = [];
  for (var i = 0; i < bridgeIds.length; i++) {
    if (bridgeIds[i]) { // TODO: filters like bridgesRetrieved[i].linkStatus.hasOwnProperty('CreatedOwner')
      getBridgeRequestPromises.push(appStore.protocolActor.get_bridge(bridgeIds[i])); // Send requests in parallel and then await all to speed up
    };
  };

  const getBridgeResponses = await Promise.all(getBridgeRequestPromises);
  let bridges : BebbBridge[] = [];
  for (var j = 0; j < getBridgeResponses.length; j++) {
    if (getBridgeResponses[j].Err) {
      console.error("Error retrieving Bridge", getBridgeResponses[j].Err);
    } else {
      const bridge : BebbBridge = getBridgeResponses[j].Ok;
      bridges.push(bridge);
    };
  };

  return bridges;
};

export async function getConnectedBridgesForEntityInBebb(bebbEntityId: string, bridgingDirection = "from", filters = {}): Promise<BebbBridge[]> {
  if (!appStore) {
    throw new Error("Error in getConnectedBridgesForEntityInBebb: store not initialized");
  };
  
  const bridgeIds = await getConnectedBridgeIdsForEntityInBebb(bebbEntityId, bridgingDirection, filters);
  return getBebbBridges(bridgeIds);
};

async function getBebbEntities(entityIds: string[]) : Promise<BebbEntity[]> {
  const getEntityPromises = entityIds.map(id => appStore.protocolActor.get_entity(id));
  const entityResponses = await Promise.all(getEntityPromises);

  let entities = [];
  for (let response of entityResponses) {
    if (response.Err) {
      console.error("Error retrieving connected Entity", response.Err);
    } else {
      const entity : BebbEntity = response.Ok;
      entities.push(entity);
    };
  };
  return entities;
};

export async function getConnectedEntitiesInBebb(bebbEntityId: string, bridgingDirection = "from", filters = {}) : Promise<BebbEntity[]> {
  if (!appStore) {
    throw new Error("Error in getConnectedEntitiesInBebb: store not initialized");
  };

  try {
    const getBridgesResponse = await getConnectedBridgesForEntityInBebb(bebbEntityId, bridgingDirection, filters);
    const entityIds = getBridgesResponse.map((bridge: BebbBridge) => bridgingDirection === "from" ? bridge.toEntityId : bridge.fromEntityId);
    const connectedEntities = await getBebbEntities(entityIds);
    return connectedEntities;
  } catch (error) {
    console.error("Error Getting Connected Entities in Bebb ", error);
    return null;                
  };
};

export async function getConnectedEntitiesAndBridgesInBebb(bebbEntityId: string, bridgingDirection = "from", filters = {}) : Promise<BebbEntityAndBridge[]> {
  if (!appStore) {
    throw new Error("Error in getConnectedEntitiesAndBridgesInBebb: store not initialized");
  };

  try {
    const getBridgesResponse = await getConnectedBridgesForEntityInBebb(bebbEntityId, bridgingDirection, filters);
    const entityIds = getBridgesResponse.map((bridge: BebbBridge) => bridgingDirection === "from" ? bridge.toEntityId : bridge.fromEntityId);
    const connectedEntities = await getBebbEntities(entityIds);

    const entitiesAndBridges: BebbEntityAndBridge[] = [];

    for (let bridge of getBridgesResponse) {
      const entityId = bridgingDirection === "from" ? bridge.toEntityId : bridge.fromEntityId;
      const entity = connectedEntities.find(e => e.id === entityId);
      if (entity) {
        entitiesAndBridges.push({
          entity: entity,
          bridge: bridge
        });
      }
    }

    return entitiesAndBridges;
  } catch (error) {
    console.error("Error Getting Connected Entities and Bridges in Bebb ", error);
    return null;                
  };
};

export async function getBebbEntityUrlPreview(url: string) : Promise<BebbEntityPreview> {
  var enc = new TextEncoder(); // always utf-8
  const urlSpacePreview : BebbEntityPreview = {
    'previewData': enc.encode(url),
    'previewType': { 'Other' : "URL" },
  };
  return urlSpacePreview;
};

// Convert the Blob to an ArrayBuffer
const blobToArrayBuffer = (blob) => {
  return blob.arrayBuffer();
};

// Convert the ArrayBuffer to a Uint8Array
const arrayBufferToUint8Array = (buffer) => {
  return new Uint8Array(buffer);
};

// Putting it all together
const getUint8ArrayFromCanvas = async (canvas) => {
  try {
    const blob = await canvasToBlob(canvas);
    const buffer = await blobToArrayBuffer(blob);
    const uint8Array = arrayBufferToUint8Array(buffer);
    return uint8Array; // This is the Uint8Array representation of your canvas
  } catch (error) {
    console.error(error);
    return null;
  }
};

function displayImageInPopup(screenshotArray) {
  // Create a Blob from the Uint8Array
  const blob = new Blob([screenshotArray], { type: 'image/jpeg' });

  // Create an Object URL for the blob
  const imageUrl = URL.createObjectURL(blob);
  console.log("Debug captureAFrameScene imageUrl ", imageUrl);

  // Open a new popup window
  const popup = window.open('', 'Image Preview', 'width=600,height=400');

  // Check if the popup was successfully opened
  if (popup) {
    console.log("Debug captureAFrameScene popup");
    // Write the HTML content for the new window
    popup.document.write(`<html><head><title>Image Preview</title></head><body><img src="${imageUrl}" onload="window.URL.revokeObjectURL('${imageUrl}')" style="max-width:100%;"></body></html>`);
    
    // Close the document to apply the content
    popup.document.close();
  } else {
    console.log('Popup blocked or failed to open.');
  };
};

async function captureAFrameScene(spaceHtml) {
  console.log("Debug captureAFrameScene");
  return new Promise(async (resolve, reject) => {
    // Store the original overflow value
const originalOverflow = document.body.style.overflow;

// Set overflow to auto
document.body.style.overflow = 'auto';
    // TODO: disturbing UI
    const container = document.createElement('div');
    //container.setAttribute("hidden", "hidden");
    //container.style.display = 'none'; // Hide the container
    container.style.visibility = "hidden";
    container.style.width = '10%';
    container.style.height = '10%';
    //container.style.position = 'fixed';
    //container.style.top = '-10000px'; // Offscreen
    container.innerHTML = spaceHtml;
    console.log("Debug captureAFrameScene container ", container);
    document.body.appendChild(container);

    const sceneEl = container.querySelector('a-scene');

    // Ensure A-Frame scene has loaded
    // @ts-ignore
    if (!sceneEl.hasLoaded) {
      await new Promise(resolve => sceneEl.addEventListener('loaded', resolve));
    };
    console.log("Debug captureAFrameScene sceneEl.hasLoaded ", sceneEl.hasLoaded);
    // Wait until assets have loaded
    let assetsEl = sceneEl.querySelector('a-assets');
    console.log("Debug captureAFrameScene assetsEl ", assetsEl);
    await new Promise(resolve =>
      setTimeout(() => {
        console.log("Debug captureAFrameScene setTimeout");
        resolve("");
      }, 3000)
    );
    // @ts-ignore
    const screenshotCanvas = sceneEl.components.screenshot.getCanvas('perspective');
    console.log("Debug captureAFrameScene screenshotCanvas ", screenshotCanvas);
    const screenshotArray = await getUint8ArrayFromCanvas(screenshotCanvas);
    console.log("Debug captureAFrameScene screenshotArray ", screenshotArray);
    displayImageInPopup(screenshotArray);

    document.body.removeChild(container);
    // Restore the original overflow value
document.body.style.overflow = originalOverflow;

    resolve(screenshotArray);
  });
};

export async function getBebbEntityImagePreviewFromAframeHtml(sceneHtml: string) : Promise<BebbEntityPreview> {
  console.log("Debug getBebbEntityImagePreviewFromAframeHtml");
  // @ts-ignore
  const imageData : Uint8Array = await captureAFrameScene(sceneHtml);
  console.log("Debug getBebbEntityImagePreviewFromAframeHtml imageData ", imageData);
  const imageSpacePreview : BebbEntityPreview = {
    'previewData': imageData,
    'previewType': { 'Jpg' : null },
  };
  console.log("Debug getBebbEntityImagePreviewFromAframeHtml imageSpacePreview ", imageSpacePreview);
  return imageSpacePreview;
};

async function captureImageOfAFrameSceneFromUrl(url: string) : Promise<Uint8Array> {
  return new Promise(async (resolve, reject) => {
    let iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    iframe.onload = async () => {
      try {
        // @ts-ignore
        let canvas = iframe.contentDocument.querySelector('a-scene').components.screenshot.getCanvas('perspective');
        // @ts-ignore
        let blob : Blob = await canvasToBlob(canvas);
        let arrayBuffer = await blob.arrayBuffer();
        document.body.removeChild(iframe);
        resolve(new Uint8Array(arrayBuffer));
      } catch (err) {
        console.error("Error capturing image from A-Frame scene: " + err);
        reject("Error capturing image from A-Frame scene: " + err);
      };
    };
  });
};

function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve);
  });
};

async function captureImageOfWebsiteFromUrl(url: string) : Promise<Uint8Array> {
  return new Promise(async (resolve, reject) => {
    let iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    iframe.onload = async () => {
      try {
        const canvas = await html2canvas(iframe.contentDocument.body);
        // @ts-ignore
        let blob : Blob = await canvasToBlob(canvas);
        let arrayBuffer = await blob.arrayBuffer();
        document.body.removeChild(iframe);
        resolve(new Uint8Array(arrayBuffer));
      } catch (err) {
        console.error("Error capturing image from website: " + err);
        reject("Error capturing image from website: " + err);
      };
    };
  });
};

export async function getBebbEntityImagePreviewFromUrl(url: string) : Promise<BebbEntityPreview> {
  if (url.includes("/#/space/")) {
    // OIM Space URL, i.e. A-Frame scene
    // @ts-ignore
    const imageData : Uint8Array  = await captureImageOfAFrameSceneFromUrl(url);
    const imageSpacePreview : BebbEntityPreview = {
      'previewData': imageData,
      'previewType': { 'Jpg' : null },
    };
    return imageSpacePreview;
  } else {
    // External URL
    // @ts-ignore
    const imageData : Uint8Array  = await captureImageOfWebsiteFromUrl(url);
    const imageSpacePreview : BebbEntityPreview = {
      'previewData': imageData,
      'previewType': { 'Jpg' : null },
    };
    return imageSpacePreview;
  };
};
