import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface BridgeEntity {
  'internalId' : string,
  'toEntityId' : string,
  'creator' : Principal,
  'fromEntityId' : string,
  'owner' : Principal,
  'externalId' : [] | [string],
  'creationTimestamp' : bigint,
  'name' : [] | [string],
  'description' : [] | [string],
  'keywords' : [] | [Array<string>],
  'state' : BridgeState,
  'settings' : EntitySettings,
  'listOfEntitySpecificFieldKeys' : Array<string>,
  'entityType' : EntityType,
  'bridgeType' : BridgeType,
  'entitySpecificFields' : [] | [string],
}
export interface BridgeEntityInitiationObject {
  '_externalId' : [] | [string],
  '_fromEntityId' : string,
  '_owner' : [] | [Principal],
  '_creator' : [] | [Principal],
  '_entitySpecificFields' : [] | [string],
  '_state' : [] | [BridgeState],
  '_entityType' : EntityType,
  '_bridgeType' : BridgeType,
  '_description' : [] | [string],
  '_keywords' : [] | [Array<string>],
  '_settings' : [] | [EntitySettings],
  '_internalId' : [] | [string],
  '_toEntityId' : string,
  '_name' : [] | [string],
}
export interface BridgeEntityUpdateObject {
  'internalId' : string,
  'name' : [] | [string],
  'description' : [] | [string],
  'keywords' : [] | [Array<string>],
  'state' : [] | [BridgeState],
  'settings' : [] | [EntitySettings],
  'bridgeType' : [] | [BridgeType],
}
export type BridgeResult = { 'Ok' : [] | [BridgeEntity] } |
  { 'Err' : NewWaveError };
export type BridgeState = { 'Confirmed' : null } |
  { 'Rejected' : null } |
  { 'Pending' : null };
export type BridgeType = { 'OwnerCreated' : null };
export interface Entity {
  'internalId' : string,
  'creator' : Principal,
  'owner' : Principal,
  'externalId' : [] | [string],
  'creationTimestamp' : bigint,
  'name' : [] | [string],
  'description' : [] | [string],
  'keywords' : [] | [Array<string>],
  'settings' : EntitySettings,
  'listOfEntitySpecificFieldKeys' : Array<string>,
  'entityType' : EntityType,
  'entitySpecificFields' : [] | [string],
}
export interface EntityInitiationObject {
  '_externalId' : [] | [string],
  '_owner' : [] | [Principal],
  '_creator' : [] | [Principal],
  '_entitySpecificFields' : [] | [string],
  '_entityType' : EntityType,
  '_description' : [] | [string],
  '_keywords' : [] | [Array<string>],
  '_settings' : [] | [EntitySettings],
  '_internalId' : [] | [string],
  '_name' : [] | [string],
}
export type EntityResult = { 'Ok' : [] | [Entity] } |
  { 'Err' : NewWaveError };
export type EntitySettings = {};
export type EntityType = { 'Webasset' : null } |
  { 'BridgeEntity' : null } |
  { 'Person' : null } |
  { 'Location' : null };
export interface EntityUpdateObject {
  'internalId' : string,
  'name' : [] | [string],
  'description' : [] | [string],
  'keywords' : [] | [Array<string>],
  'settings' : [] | [EntitySettings],
}
export type HeaderField = [string, string];
export type NewWaveError = { 'SelfTransfer' : null } |
  { 'TokenNotFound' : null } |
  { 'EntityNotFound' : null } |
  { 'TxNotFound' : null } |
  { 'SelfApprove' : null } |
  { 'OperatorNotFound' : null } |
  { 'Unauthorized' : string } |
  { 'BridgeNotFound' : null } |
  { 'ExistedNFT' : null } |
  { 'OwnerNotFound' : null } |
  { 'Other' : string };
export interface Request {
  'url' : string,
  'method' : string,
  'body' : Uint8Array,
  'headers' : Array<HeaderField>,
}
export interface Response {
  'body' : Uint8Array,
  'headers' : Array<HeaderField>,
  'upgrade' : boolean,
  'streaming_strategy' : [] | [StreamingStrategy],
  'status_code' : number,
}
export type StreamingCallback = ActorMethod<
  [StreamingCallbackToken],
  StreamingCallbackResponse
>;
export interface StreamingCallbackResponse {
  'token' : [] | [StreamingCallbackToken],
  'body' : Uint8Array,
}
export interface StreamingCallbackToken {
  'key' : string,
  'index' : bigint,
  'content_encoding' : string,
}
export type StreamingStrategy = {
    'Callback' : {
      'token' : StreamingCallbackToken,
      'callback' : StreamingCallback,
    }
  };
export interface _SERVICE {
  'create_bridge' : ActorMethod<
    [BridgeEntityInitiationObject],
    [] | [BridgeEntity]
  >,
  'create_entity' : ActorMethod<[EntityInitiationObject], Entity>,
  'create_entity_and_bridge' : ActorMethod<
    [EntityInitiationObject, BridgeEntityInitiationObject],
    [Entity, [] | [BridgeEntity]]
  >,
  'delete_bridge' : ActorMethod<[string], BridgeResult>,
  'get_bridge' : ActorMethod<[string], [] | [BridgeEntity]>,
  'get_bridge_ids_by_entity_id' : ActorMethod<
    [string, boolean, boolean, boolean],
    Array<string>
  >,
  'get_bridged_entities_by_entity_id' : ActorMethod<
    [string, boolean, boolean, boolean],
    Array<Entity>
  >,
  'get_bridges_by_entity_id' : ActorMethod<
    [string, boolean, boolean, boolean],
    Array<BridgeEntity>
  >,
  'get_entity' : ActorMethod<[string], [] | [Entity]>,
  'get_entity_and_bridge_ids' : ActorMethod<
    [string, boolean, boolean, boolean],
    [[] | [Entity], Array<string>]
  >,
  'http_request' : ActorMethod<[Request], Response>,
  'http_request_update' : ActorMethod<[Request], Response>,
  'update_bridge' : ActorMethod<[BridgeEntityUpdateObject], BridgeResult>,
  'update_entity' : ActorMethod<[EntityUpdateObject], EntityResult>,
}
