import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Bridge {
  'id' : string,
  'toEntityId' : string,
  'creator' : Principal,
  'fromEntityId' : string,
  'owner' : Principal,
  'creationTimestamp' : bigint,
  'name' : string,
  'description' : string,
  'keywords' : Array<string>,
  'settings' : BridgeSettings,
  'listOfEntitySpecificFieldKeys' : Array<string>,
  'bridgeType' : BridgeType,
  'entitySpecificFields' : string,
}
export type BridgeErrors = { 'Error' : null } |
  { 'Unauthorized' : string } |
  { 'BridgeNotFound' : null };
export type BridgeIdErrors = { 'Error' : null } |
  { 'Unauthorized' : null } |
  { 'BridgeNotFound' : null };
export type BridgeIdResult = { 'Ok' : string } |
  { 'Err' : BridgeIdErrors };
export interface BridgeInitiationObject {
  'toEntityId' : string,
  'fromEntityId' : string,
  'name' : [] | [string],
  'description' : [] | [string],
  'keywords' : [] | [Array<string>],
  'settings' : [] | [BridgeSettings],
  'bridgeType' : BridgeType,
  'entitySpecificFields' : [] | [string],
}
export type BridgeLinkStatus = { 'CreatedOther' : null } |
  { 'CreatedOwner' : null };
export type BridgeResult = { 'Ok' : Bridge } |
  { 'Err' : BridgeErrors };
export type BridgeSettings = {};
export type BridgeType = { 'IsPartOf' : null } |
  { 'IsAttachedto' : null } |
  { 'IsRelatedto' : null };
export interface BridgeUpdateObject {
  'id' : string,
  'name' : [] | [string],
  'description' : [] | [string],
  'keywords' : [] | [Array<string>],
  'settings' : [] | [BridgeSettings],
}
export interface Entity {
  'id' : string,
  'creator' : Principal,
  'toIds' : EntityAttachedBridges,
  'previews' : Array<EntityPreview>,
  'owner' : Principal,
  'creationTimestamp' : bigint,
  'name' : string,
  'fromIds' : EntityAttachedBridges,
  'description' : string,
  'keywords' : Array<string>,
  'settings' : EntitySettings,
  'listOfEntitySpecificFieldKeys' : Array<string>,
  'entityType' : EntityType,
  'entitySpecificFields' : string,
}
export interface EntityAttachedBridge {
  'id' : string,
  'creationTime' : Time,
  'bridgeType' : BridgeType,
  'linkStatus' : BridgeLinkStatus,
}
export type EntityAttachedBridges = Array<EntityAttachedBridge>;
export type EntityAttachedBridgesErrors = { 'Error' : null } |
  { 'EntityNotFound' : null };
export type EntityAttachedBridgesResult = { 'Ok' : EntityAttachedBridges } |
  { 'Err' : EntityAttachedBridgesErrors };
export type EntityErrors = { 'Error' : null } |
  { 'EntityNotFound' : null } |
  { 'Unauthorized' : string };
export type EntityIdErrors = { 'Error' : null } |
  { 'PreviewTooLarge' : bigint } |
  { 'EntityNotFound' : null } |
  { 'TooManyPreviews' : null } |
  { 'Unauthorized' : null };
export type EntityIdResult = { 'Ok' : string } |
  { 'Err' : EntityIdErrors };
export interface EntityInitiationObject {
  'name' : [] | [string],
  'description' : [] | [string],
  'keywords' : [] | [Array<string>],
  'settings' : [] | [EntitySettings],
  'entityType' : EntityType,
  'entitySpecificFields' : [] | [string],
}
export interface EntityPreview {
  'previewData' : Uint8Array | number[],
  'previewType' : EntityPreviewSupportedTypes,
}
export type EntityPreviewSupportedTypes = { 'Glb' : null } |
  { 'Jpg' : null } |
  { 'Png' : null } |
  { 'Gltf' : null } |
  { 'Other' : string };
export type EntityResult = { 'Ok' : Entity } |
  { 'Err' : EntityErrors };
export type EntitySettings = {};
export type EntityType = { 'Other' : string } |
  { 'Resource' : EntityTypeResourceTypes };
export type EntityTypeResourceTypes = { 'Web' : null } |
  { 'DigitalAsset' : null } |
  { 'Content' : null };
export interface EntityUpdateObject {
  'id' : string,
  'previews' : [] | [Array<EntityPreview>],
  'name' : [] | [string],
  'description' : [] | [string],
  'keywords' : [] | [Array<string>],
  'settings' : [] | [EntitySettings],
}
export type Time = bigint;
export interface _SERVICE {
  'create_bridge' : ActorMethod<[BridgeInitiationObject], BridgeIdResult>,
  'create_entity' : ActorMethod<[EntityInitiationObject], EntityIdResult>,
  'delete_bridge' : ActorMethod<[string], BridgeIdResult>,
  'delete_entity' : ActorMethod<[string], EntityIdResult>,
  'get_bridge' : ActorMethod<[string], BridgeResult>,
  'get_entity' : ActorMethod<[string], EntityResult>,
  'get_from_bridge_ids_by_entity_id' : ActorMethod<
    [string],
    EntityAttachedBridgesResult
  >,
  'get_to_bridge_ids_by_entity_id' : ActorMethod<
    [string],
    EntityAttachedBridgesResult
  >,
  'update_bridge' : ActorMethod<[BridgeUpdateObject], BridgeIdResult>,
  'update_entity' : ActorMethod<[EntityUpdateObject], EntityIdResult>,
}
