export const idlFactory = ({ IDL }) => {
  const BridgeState = IDL.Variant({
    'Confirmed' : IDL.Null,
    'Rejected' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const EntityType = IDL.Variant({
    'Webasset' : IDL.Null,
    'BridgeEntity' : IDL.Null,
    'Person' : IDL.Null,
    'Location' : IDL.Null,
  });
  const BridgeType = IDL.Variant({ 'OwnerCreated' : IDL.Null });
  const EntitySettings = IDL.Record({});
  const BridgeEntityInitiationObject = IDL.Record({
    '_externalId' : IDL.Opt(IDL.Text),
    '_fromEntityId' : IDL.Text,
    '_owner' : IDL.Opt(IDL.Principal),
    '_creator' : IDL.Opt(IDL.Principal),
    '_entitySpecificFields' : IDL.Opt(IDL.Text),
    '_state' : IDL.Opt(BridgeState),
    '_entityType' : EntityType,
    '_bridgeType' : BridgeType,
    '_description' : IDL.Opt(IDL.Text),
    '_keywords' : IDL.Opt(IDL.Vec(IDL.Text)),
    '_settings' : IDL.Opt(EntitySettings),
    '_internalId' : IDL.Opt(IDL.Text),
    '_toEntityId' : IDL.Text,
    '_name' : IDL.Opt(IDL.Text),
  });
  const BridgeEntity = IDL.Record({
    'internalId' : IDL.Text,
    'toEntityId' : IDL.Text,
    'creator' : IDL.Principal,
    'fromEntityId' : IDL.Text,
    'owner' : IDL.Principal,
    'externalId' : IDL.Opt(IDL.Text),
    'creationTimestamp' : IDL.Nat64,
    'name' : IDL.Opt(IDL.Text),
    'description' : IDL.Opt(IDL.Text),
    'keywords' : IDL.Opt(IDL.Vec(IDL.Text)),
    'state' : BridgeState,
    'settings' : EntitySettings,
    'listOfEntitySpecificFieldKeys' : IDL.Vec(IDL.Text),
    'entityType' : EntityType,
    'bridgeType' : BridgeType,
    'entitySpecificFields' : IDL.Opt(IDL.Text),
  });
  const EntityInitiationObject = IDL.Record({
    '_externalId' : IDL.Opt(IDL.Text),
    '_owner' : IDL.Opt(IDL.Principal),
    '_creator' : IDL.Opt(IDL.Principal),
    '_entitySpecificFields' : IDL.Opt(IDL.Text),
    '_entityType' : EntityType,
    '_description' : IDL.Opt(IDL.Text),
    '_keywords' : IDL.Opt(IDL.Vec(IDL.Text)),
    '_settings' : IDL.Opt(EntitySettings),
    '_internalId' : IDL.Opt(IDL.Text),
    '_name' : IDL.Opt(IDL.Text),
  });
  const Entity = IDL.Record({
    'internalId' : IDL.Text,
    'creator' : IDL.Principal,
    'owner' : IDL.Principal,
    'externalId' : IDL.Opt(IDL.Text),
    'creationTimestamp' : IDL.Nat64,
    'name' : IDL.Opt(IDL.Text),
    'description' : IDL.Opt(IDL.Text),
    'keywords' : IDL.Opt(IDL.Vec(IDL.Text)),
    'settings' : EntitySettings,
    'listOfEntitySpecificFieldKeys' : IDL.Vec(IDL.Text),
    'entityType' : EntityType,
    'entitySpecificFields' : IDL.Opt(IDL.Text),
  });
  const NewWaveError = IDL.Variant({
    'SelfTransfer' : IDL.Null,
    'TokenNotFound' : IDL.Null,
    'EntityNotFound' : IDL.Null,
    'TxNotFound' : IDL.Null,
    'SelfApprove' : IDL.Null,
    'OperatorNotFound' : IDL.Null,
    'Unauthorized' : IDL.Text,
    'BridgeNotFound' : IDL.Null,
    'ExistedNFT' : IDL.Null,
    'OwnerNotFound' : IDL.Null,
    'Other' : IDL.Text,
  });
  const BridgeResult = IDL.Variant({
    'Ok' : IDL.Opt(BridgeEntity),
    'Err' : NewWaveError,
  });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const Request = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
  });
  const StreamingCallbackToken = IDL.Record({
    'key' : IDL.Text,
    'index' : IDL.Nat,
    'content_encoding' : IDL.Text,
  });
  const StreamingCallbackResponse = IDL.Record({
    'token' : IDL.Opt(StreamingCallbackToken),
    'body' : IDL.Vec(IDL.Nat8),
  });
  const StreamingCallback = IDL.Func(
      [StreamingCallbackToken],
      [StreamingCallbackResponse],
      ['query'],
    );
  const StreamingStrategy = IDL.Variant({
    'Callback' : IDL.Record({
      'token' : StreamingCallbackToken,
      'callback' : StreamingCallback,
    }),
  });
  const Response = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'upgrade' : IDL.Bool,
    'streaming_strategy' : IDL.Opt(StreamingStrategy),
    'status_code' : IDL.Nat16,
  });
  const BridgeEntityUpdateObject = IDL.Record({
    'internalId' : IDL.Text,
    'name' : IDL.Opt(IDL.Text),
    'description' : IDL.Opt(IDL.Text),
    'keywords' : IDL.Opt(IDL.Vec(IDL.Text)),
    'state' : IDL.Opt(BridgeState),
    'settings' : IDL.Opt(EntitySettings),
    'bridgeType' : IDL.Opt(BridgeType),
  });
  const EntityUpdateObject = IDL.Record({
    'internalId' : IDL.Text,
    'name' : IDL.Opt(IDL.Text),
    'description' : IDL.Opt(IDL.Text),
    'keywords' : IDL.Opt(IDL.Vec(IDL.Text)),
    'settings' : IDL.Opt(EntitySettings),
  });
  const EntityResult = IDL.Variant({
    'Ok' : IDL.Opt(Entity),
    'Err' : NewWaveError,
  });
  return IDL.Service({
    'create_bridge' : IDL.Func(
        [BridgeEntityInitiationObject],
        [IDL.Opt(BridgeEntity)],
        [],
      ),
    'create_entity' : IDL.Func([EntityInitiationObject], [Entity], []),
    'create_entity_and_bridge' : IDL.Func(
        [EntityInitiationObject, BridgeEntityInitiationObject],
        [Entity, IDL.Opt(BridgeEntity)],
        [],
      ),
    'delete_bridge' : IDL.Func([IDL.Text], [BridgeResult], []),
    'get_bridge' : IDL.Func([IDL.Text], [IDL.Opt(BridgeEntity)], ['query']),
    'get_bridge_ids_by_entity_id' : IDL.Func(
        [IDL.Text, IDL.Bool, IDL.Bool, IDL.Bool],
        [IDL.Vec(IDL.Text)],
        ['query'],
      ),
    'get_bridged_entities_by_entity_id' : IDL.Func(
        [IDL.Text, IDL.Bool, IDL.Bool, IDL.Bool],
        [IDL.Vec(Entity)],
        ['query'],
      ),
    'get_bridges_by_entity_id' : IDL.Func(
        [IDL.Text, IDL.Bool, IDL.Bool, IDL.Bool],
        [IDL.Vec(BridgeEntity)],
        ['query'],
      ),
    'get_entity' : IDL.Func([IDL.Text], [IDL.Opt(Entity)], ['query']),
    'get_entity_and_bridge_ids' : IDL.Func(
        [IDL.Text, IDL.Bool, IDL.Bool, IDL.Bool],
        [IDL.Opt(Entity), IDL.Vec(IDL.Text)],
        ['query'],
      ),
    'http_request' : IDL.Func([Request], [Response], ['query']),
    'http_request_update' : IDL.Func([Request], [Response], []),
    'update_bridge' : IDL.Func([BridgeEntityUpdateObject], [BridgeResult], []),
    'update_entity' : IDL.Func([EntityUpdateObject], [EntityResult], []),
  });
};
export const init = ({ IDL }) => { return []; };
