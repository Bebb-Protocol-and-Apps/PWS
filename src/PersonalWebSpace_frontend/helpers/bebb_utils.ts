import { store } from "../store";

import type {
  EntityInitiationObject,
  BridgeInitiationObject,
  EntityAttachedBridgesResult,
  EntityAttachedBridges,
  EntityAttachedBridge,
  Bridge,
  Entity,
} from "src/integrations/BebbProtocol/bebb.did";

export type BebbEntity = Entity;
export type BebbEntityInitiationObject = EntityInitiationObject;
export type BebbBridgeInitiationObject = BridgeInitiationObject;
export type BebbEntityAttachedBridgesResult = EntityAttachedBridgesResult;
export type BebbEntityAttachedBridges = EntityAttachedBridges;
export type BebbEntityAttachedBridge = EntityAttachedBridge;
export type BebbBridge = Bridge;
export type BebbEntityAndBridge = { entity: BebbEntity, bridge: BebbBridge };

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

function extractBridgeIds(bridgesRetrieved: BebbEntityAttachedBridges): string[] {
  return bridgesRetrieved
    .filter(bridge => bridge && bridge.id)
    .map(bridge => bridge.id);
};

export async function getConnectedBridgeIdsForEntityInBebb(bebbEntityId: string, bridgingDirection = "from"): Promise<string[]> {
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
      return extractBridgeIds(bridgeIdsResponse.Ok);
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
    }
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

export async function getConnectedBridgesForEntityInBebb(bebbEntityId: string, bridgingDirection = "from"): Promise<BebbBridge[]> {
  if (!appStore) {
    throw new Error("Error in getConnectedBridgesForEntityInBebb: store not initialized");
  };
  
  const bridgeIds = await getConnectedBridgeIdsForEntityInBebb(bebbEntityId, bridgingDirection);
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

export async function getConnectedEntitiesInBebb(bebbEntityId: string, bridgingDirection = "from") : Promise<BebbEntity[]> {
  if (!appStore) {
    throw new Error("Error in getConnectedEntitiesInBebb: store not initialized");
  };

  try {
    const getBridgesResponse = await getConnectedBridgesForEntityInBebb(bebbEntityId, bridgingDirection);
    const entityIds = getBridgesResponse.map((bridge: BebbBridge) => bridgingDirection === "from" ? bridge.toEntityId : bridge.fromEntityId);
    const connectedEntities = await getBebbEntities(entityIds);
    return connectedEntities;
  } catch (error) {
    console.error("Error Getting Connected Entities in Bebb ", error);
    return null;                
  };
};

export async function getConnectedEntitiesAndBridgesInBebb(bebbEntityId: string, bridgingDirection = "from") : Promise<BebbEntityAndBridge[]> {
  if (!appStore) {
    throw new Error("Error in getConnectedEntitiesInBebb: store not initialized");
  };

  try {
    const getBridgesResponse = await getConnectedBridgesForEntityInBebb(bebbEntityId, bridgingDirection);
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
