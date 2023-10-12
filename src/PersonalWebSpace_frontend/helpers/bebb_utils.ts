import { store } from "../store";

import type {
  EntityInitiationObject,
  BridgeInitiationObject,
  EntityAttachedBridgesResult,
  EntityAttachedBridges,
  Bridge,
  Entity,
} from "src/integrations/BebbProtocol/bebb.did";

export type BebbEntity = Entity;
export type BebbEntityInitiationObject = EntityInitiationObject;
export type BebbBridgeInitiationObject = BridgeInitiationObject;
export type BebbEntityAttachedBridgesResult = EntityAttachedBridgesResult;
export type BebbEntityAttachedBridges = EntityAttachedBridges;
export type BebbBridge = Bridge;

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

export async function createBebbEntityAndBridge(entityInitiationObject: BebbEntityInitiationObject, bridgeEntityInitiationObject: BebbBridgeInitiationObject) {
  if (!appStore) {
    throw new Error("Error in createBebbEntityAndBridge: store not initialized");
  };
  const createEntityResponse = await createBebbEntity(entityInitiationObject);
  // @ts-ignore
  if (createEntityResponse) {
    // @ts-ignore
    const newNeighborEntityId = createEntityResponse;
    if (!bridgeEntityInitiationObject.toEntityId || bridgeEntityInitiationObject.toEntityId === "") {
      bridgeEntityInitiationObject.toEntityId = newNeighborEntityId;
    } else {
      bridgeEntityInitiationObject.fromEntityId = newNeighborEntityId;
    };
    const createBridgeResponse = await createBebbBridge(bridgeEntityInitiationObject);
    // @ts-ignore
    if (createBridgeResponse) {
      return true;
    } else {
      throw new Error("Error creating new Bridge");
    };
  } else {
    throw new Error("Error creating new Entity");   
  };
};

// Helper function to find Bridge(s) between Space and a Neighbor
export const getBebbBridgesBetweenEntities = async (bebbEntityId: string, connectedBebbEntityId: string, bridgingDirection = "from") : Promise<BebbBridge[]> => {
  if (!appStore) {
    throw new Error("Error in getBebbBridgesBetweenEntities: store not initialized");
  };
  if (connectedBebbEntityId && bebbEntityId) {
    let getBridgesResponse : BebbEntityAttachedBridgesResult;
    try {
      if (bridgingDirection === "from") {
        getBridgesResponse = await appStore.protocolActor.get_from_bridge_ids_by_entity_id(bebbEntityId);
      } else {
        getBridgesResponse = await appStore.protocolActor.get_to_bridge_ids_by_entity_id(bebbEntityId);
      };
    } catch (error) {
      throw new Error("Error getting Bridge ids from Bebb for Entity");    
    };
    // @ts-ignore
    if (getBridgesResponse && getBridgesResponse.Ok && getBridgesResponse.Ok.length > 0) {
      // Filter for Bridges to Connected
      // @ts-ignore
      const bridgesRetrieved : BebbEntityAttachedBridges = getBridgesResponse.Ok;
      let getBridgeRequestPromises = [];
      for (var i = 0; i < bridgesRetrieved.length; i++) {
        if (bridgesRetrieved[i] && bridgesRetrieved[i].id) {
          getBridgeRequestPromises.push(appStore.protocolActor.get_bridge(bridgesRetrieved[i].id)); // Send requests in parallel and then await all to speed up
        };
      };
      const getBridgeResponses = await Promise.all(getBridgeRequestPromises);
      const bridgesBetweenEntities : BebbBridge[] = [];
      for (var j = 0; j < getBridgeResponses.length; j++) {
        if (getBridgeResponses[j].Err) {
          console.error("Error retrieving Bridge", getBridgeResponses[j].Err);
        } else {
          const bridge : BebbBridge = getBridgeResponses[j].Ok;
          if (bridge && bridge.id && bridge.toEntityId === connectedBebbEntityId) {
            bridgesBetweenEntities.push(bridge);
          };
        };
      };
      return bridgesBetweenEntities;
    };
  };
  return null;
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

export async function getConnectedBridgeIdsForEntityInBebb(bebbEntityId: string, bridgingDirection = "from") : Promise<string[]> {
  if (!appStore) {
    throw new Error("Error in getConnectedBridgeIdsForEntityInBebb: store not initialized");
  };
  const bridgeIds : string[] = [];
  try {
    if (bridgingDirection === "from") {
      const bridgeIdsResponse = await appStore.protocolActor.get_from_bridge_ids_by_entity_id(bebbEntityId);
      if (bridgeIdsResponse && bridgeIdsResponse.Ok && bridgeIdsResponse.Ok.length > 0) {
        const bridgesRetrieved : BebbEntityAttachedBridges = bridgeIdsResponse.Ok;
        for (var i = 0; i < bridgesRetrieved.length; i++) {
          if (bridgesRetrieved[i] && bridgesRetrieved[i].id) {
            bridgeIds.push(bridgesRetrieved[i].id);
          };
        };
      };
    } else { // bridgingDirection === "to"
      const bridgeIdsResponse = await appStore.protocolActor.get_to_bridge_ids_by_entity_id(bebbEntityId);
      if (bridgeIdsResponse && bridgeIdsResponse.Ok && bridgeIdsResponse.Ok.length > 0) {
        const bridgesRetrieved : BebbEntityAttachedBridges = bridgeIdsResponse.Ok;
        for (var i = 0; i < bridgesRetrieved.length; i++) {
          if (bridgesRetrieved[i] && bridgesRetrieved[i].id) {
            bridgeIds.push(bridgesRetrieved[i].id);
          };
        };
      };
    };    
  } catch (error) {
    console.error("Error in getConnectedBridgeIdsForEntityInBebb ", error);    
  };
  return bridgeIds;
};

export async function getConnectedBridgesForEntityInBebb(bebbEntityId: string, bridgingDirection = "from") : Promise<BebbBridge[]> {
  if (!appStore) {
    throw new Error("Error in getConnectedBridgesForEntityInBebb: store not initialized");
  };
  const bridgeIds = await getConnectedBridgeIdsForEntityInBebb(bebbEntityId, bridgingDirection);
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

export async function getConnectedEntitiesInBebb(bebbEntityId: string, bridgingDirection = "from") : Promise<BebbEntity[]> {
  if (!appStore) {
    throw new Error("Error in getConnectedEntitiesInBebb: store not initialized");
  };
  try {
    const getBridgesResponse = await getConnectedBridgesForEntityInBebb(bebbEntityId, bridgingDirection);
    let getConnectedEntityRequestPromises = [];
    for (var j = 0; j < getBridgesResponse.length; j++) {
      const bridge : BebbBridge = getBridgesResponse[j];
      getConnectedEntityRequestPromises.push(appStore.protocolActor.get_entity(bridge.toEntityId)); // Send requests in parallel and then await all to speed up
    };
    const getConnectedEntityResponses = await Promise.all(getConnectedEntityRequestPromises);
    let connectedEntities = [];
    for (var j = 0; j < getConnectedEntityResponses.length; j++) {
      if (getConnectedEntityResponses[j].Err) {
        console.error("Error retrieving connected Entity", getConnectedEntityResponses[j].Err);
      } else {
        const connectedEntity : BebbEntity = getConnectedEntityResponses[j].Ok;
        connectedEntities.push(connectedEntity);
      };
    };
    return connectedEntities;
  } catch (error) {
    console.error("Error Getting Connected Entities in Bebb ", error);
    return null;                
  };
};
