import { store } from "../store";

import type { EntityInitiationObject, BridgeInitiationObject, EntityAttachedBridgesResult, EntityAttachedBridges, Bridge, Entity } from "src/integrations/BebbProtocol/bebb.did";

export type BebbEntity = Entity;
export type BebbEntityInitiationObject = EntityInitiationObject;
export type BebbBridgeInitiationObject = BridgeInitiationObject;
export type BebbEntityAttachedBridgesResult = EntityAttachedBridgesResult;
export type BebbEntityAttachedBridges = EntityAttachedBridges;
export type BebbBridge = Bridge;

let appStore;
store.subscribe((value) => appStore = value);

export async function createBebbEntityAndBridge(entityInitiationObject: BebbEntityInitiationObject, bridgeEntityInitiationObject: BebbBridgeInitiationObject) {
  if (!appStore) {
    throw new Error("Error in createBebbEntityAndBridge: store not initialized");
  };
  const createEntityResponse = await appStore.protocolActor.create_entity(entityInitiationObject);
  // @ts-ignore
  if (createEntityResponse && createEntityResponse.Ok) {
    // @ts-ignore
    const newNeighborEntityId = createEntityResponse.Ok;
    bridgeEntityInitiationObject.toEntityId = newNeighborEntityId;
    const createBridgeResponse = await appStore.protocolActor.create_bridge(bridgeEntityInitiationObject);
    // @ts-ignore
    if (createBridgeResponse && createBridgeResponse.Ok) {
      return true;
    } else {
      throw new Error("Error creating new Bridge");
    };
  } else {
    throw new Error("Error creating new Entity");   
  };
};

// Helper function to find Bridge(s) between Space and a Neighbor
export const getBebbBridgesBetweenEntities = async (bebbEntityId: string, connectedBebbEntityId: string, bothBridgingDirections = false, includePendingBridges = false) : Promise<BebbBridge[]> => {
  if (!appStore) {
    throw new Error("Error in createBebbEntityAndBridge: store not initialized");
  };
  if (connectedBebbEntityId && bebbEntityId) {
    let getBridgesResponse : BebbEntityAttachedBridgesResult;
    try {
        getBridgesResponse = await appStore.protocolActor.get_from_bridge_ids_by_entity_id(bebbEntityId);
    } catch (error) {
        throw new Error("Error getting from Bridge ids from Bebb for Entity");    
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
    throw new Error("Error in createBebbEntityAndBridge: store not initialized");
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

export async function getConnectedBridgesFromEntityInBebb(bebbEntityId: string, bridgingDirection = "from") : Promise<BebbBridge[]> {

};

export async function getConnectedEntitiesInBebb(bebbEntityId: string, bridgingDirection = "from") : Promise<BebbEntity[]> {
  try {
    const getBridgesResponse = await getConnectedBridgesFromEntityInBebb(bebbEntityId, bridgingDirection);
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



    spaceNeighborsResponse = await $store.protocolActor.get_from_bridge_ids_by_entity_id(spaceEntityId);
  } catch (error) {
      console.error("Error Getting Connected Entities in Bebb ", error);
      return null;                
  };
  // @ts-ignore
  if (spaceNeighborsResponse && spaceNeighborsResponse.Ok && spaceNeighborsResponse.Ok.length > 0) {
      // @ts-ignore
      const bridgesRetrieved : EntityAttachedBridges = spaceNeighborsResponse.Ok;
      const bridgeIds = [];
      let getBridgeRequestPromises = [];
      for (var i = 0; i < bridgesRetrieved.length; i++) {
          if (bridgesRetrieved[i] && bridgesRetrieved[i].id && bridgesRetrieved[i].linkStatus.hasOwnProperty('CreatedOwner')) {
              bridgeIds.push(bridgesRetrieved[i].id);
              getBridgeRequestPromises.push($store.protocolActor.get_bridge(bridgesRetrieved[i].id)); // Send requests in parallel and then await all to speed up
          };
      };
      const getBridgeResponses = await Promise.all(getBridgeRequestPromises);
      let getConnectedEntityRequestPromises = [];
      for (var j = 0; j < getBridgeResponses.length; j++) {
          if (getBridgeResponses[j].Err) {
              console.error("Error retrieving Bridge", getBridgeResponses[j].Err);
          } else {
              const bridge : BebbBridge = getBridgeResponses[j].Ok;
              getConnectedEntityRequestPromises.push($store.protocolActor.get_entity(bridge.toEntityId)); // Send requests in parallel and then await all to speed up
          };
      };
      const getConnectedEntityResponses = await Promise.all(getConnectedEntityRequestPromises);
      for (var j = 0; j < getConnectedEntityResponses.length; j++) {
          if (getConnectedEntityResponses[j].Err) {
              console.error("Error retrieving connected Entity", getConnectedEntityResponses[j].Err);
          } else {
              const connectedEntity : BebbEntity = getConnectedEntityResponses[j].Ok;
              retrievedNeighborEntities.push(connectedEntity);
          };
      };
  };
};
