import Text "mo:base/Text";
import Time "mo:base/Time";

import Types "./Types";
// from https://github.com/Bebb-Protocol-and-Apps/BebbProtocol
module {
    public let CANISTER_ID : Text = "pzrof-pyaaa-aaaai-acnha-cai";
    public let LOCAL_CANISTER_ID : Text = "br5f7-7uaaa-aaaaa-qaaca-cai";
    public let DEVELOPMENT_CANISTER_ID : Text = "tsmol-tqaaa-aaaag-abt2a-cai";
    public let TESTING_CANISTER_ID : Text = "t6nyb-faaaa-aaaal-qcbaa-cai";

    /**
    * Defines the base entity that is shared accross multiple entity types such as Entities themselvse and bridges
    */
    public type BaseEntity = {
        /*
        * The ID of the Entity that is used to store it in
        * in the entity database
        */
        id : Text;
        /**
        * The timestamp in UTC (maybe) that the entity was created
        */
        creationTimestamp : Nat64;
        /**
        * The original creator of the entity.
        */
        creator : Principal;
        /**
        * The current owner of the entity
        */
        owner : Principal;
        /**
        * A human readable name for the entity
        */
        name : Text;
        /**
        * An owner defined description for what the entity is
        */
        description : Text;
        /**
        * Keywords that are used to descripe the entity to
        * enable more efficient lookup of the entity
        */
        keywords : [Text];
        /**
        * Unknown
        */
        entitySpecificFields : Text;
        /**
        * Unknown
        */
        listOfEntitySpecificFieldKeys : [Text];
    };
    
    /**
    * Stores entity specific settings
    */
    public class EntitySettings() {
        var mainSetting : Text = "default";
    };

    /**
    * Stores the types of resources entity types that are supported
    */
    public type EntityTypeResourceTypes = {
        #Web;
        #DigitalAsset;
        #Content;
    };

    /**
    * The available entity types that can be used to describe an entity
    */
    public type EntityType = {
        #Resource : EntityTypeResourceTypes;
        #Other : Text;
    };

    /**
    * Stores the supported preview types
    * Standard types are enumerated to create a standarized preview format.
    * Unique formats can be stored via the other tag and labelled as such
    */
    public type EntityPreviewSupportedTypes = {
        #Jpg;
        #Png;
        #Glb;
        #Gltf;
        #Other : Text;
    };

    /**
    * Defines the type for the various previews of an entity
    */
    public type EntityPreview = {
        /**
        * Stores the type of the preview. This is used to determine how to
        * render the stored preview data
        */
        previewType : EntityPreviewSupportedTypes;

        /**
        * The actual preview data associated with the preview
        */
        previewData : Blob;
    };

    /**
    * Type that defines the attributes for an Entity
    */
    public type Entity = BaseEntity and {
        /**
        * Settings for the entity
        */
        settings : EntitySettings;
        /**
        * The type that defines the entity
        */
        entityType : EntityType;
        /**
        * Contains all the bridge ids that originate from this
        * Entity
        */
        fromIds : EntityAttachedBridges;

        /**
        * Contains all the bridge ids that point to this entity
        */
        toIds : EntityAttachedBridges;

        /**
        * Stores all the previews that are available for the current entity
        */
        previews : [EntityPreview];
    };

    /**
    * The initialization object is the fields provided by a user
    * in order to create an entity. The rest of the fields are automatically
    * created by Bebb
    */
    public type EntityInitiationObject = {
        settings : ?EntitySettings;
        entityType : EntityType;
        name : ?Text;
        description : ?Text;
        keywords : ?[Text];
        entitySpecificFields : ?Text;
    };

    /**
    This type defines the fields that the current owner is allowed
    to modify and use to update the entity
    */
    public type EntityUpdateObject = {
        /**
        * The ID of the entity to update
        * Note: This value cannot be updated and only used to identify the Entity to update
        */
        id : Text;
        /**
        * The new settings to add to the entity
        */
        settings : ?EntitySettings;
        /**
        * The updated name for the entity
        */
        name : ?Text;
        /**
        * The updated descrition for the entity
        */
        description : ?Text;
        /**
        * The Updated keywords for the entity
        */
        keywords : ?[Text];
        /**
        * Used to update the available previews for the entity
        */
        previews : ?[EntityPreview];
    };

    /**
    * Stores bridge specific settings
    */
    public class BridgeSettings() {
        var mainSetting : Text = "default";
    };

    /**
    * The available bridge types that can be used to describe a bridge
    * This defines the Bridges relationship to the Entity as defined by the Bridge owner
    */
    public type BridgeType = {
        #IsPartOf;
        #IsRelatedto;
        #IsAttachedto;
    };

    /**
    * The type that defines the attributes for a Bridge
    */
    public type Bridge = BaseEntity and {
        /**
        * Settings for the bridge
        */
        settings : BridgeSettings;
        /**
        * The type of the bridge
        */
        bridgeType : BridgeType;
        /**
        * The entity ID that specifies the starting entity for the bridge
        */
        fromEntityId : Text;
        /**
        * The entity ID that specifies the ending entity for the bridge
        */
        toEntityId : Text;
    };

    /**
    * The initialization object is the fields provided by a user
    * in order to create a bridge. The rest of the fields are automatically
    * created by Bebb
    */
    public type BridgeInitiationObject = {
        settings : ?BridgeSettings;
        name : ?Text;
        description : ?Text;
        keywords : ?[Text];
        bridgeType : BridgeType;
        fromEntityId : Text;
        toEntityId : Text;
        entitySpecificFields : ?Text;
    };

    /**
    This type defines the fields that the current owner is allowed
    to modify and use to update the bridge
    */
    public type BridgeUpdateObject = {
        /**
        * The id of the bridge to update
        * Note: This value cannot be updated and only used to identify the Bridge to update
        */
        id : Text;
        /**
        * The new settings to add to the bridge
        */
        settings : ?BridgeSettings;
        /**
        * The updated name for the bridge
        */
        name : ?Text;
        /**
        * The updated descrition for the bridge
        */
        description : ?Text;
        /**
        * The Updated keywords for the bridge
        */
        keywords : ?[Text];
    };

    /**
    * Defines the errors for the public API when trying to retrieve an Entity ID
    */
    public type EntityIdErrors = {
        #Unauthorized;
        #EntityNotFound;
        #TooManyPreviews;
        // Returns the index of the preview that is too large
        #PreviewTooLarge : Int;
        #Error;
    };

    /**
    * Defines the result type for trying to retieve the ID of an entity from
    * the public API
    */
    public type EntityIdResult = Types.Result<Text, EntityIdErrors>;

    /**
    * Defines the entity errors that can occur when trying to retrieve an entity
    */
    public type EntityErrors = {
        #Unauthorized : Text;
        #EntityNotFound;
        #Error;
    };

    /**
    * Defines the result type for trying to retrieve an Entity from
    * the public API
    */
    public type EntityResult = Types.Result<Entity, EntityErrors>;

    /**
    * Defines the errors for the public API when trying to retrieve a Bridge ID
    */
    public type BridgeIdErrors = {
        #Unauthorized;
        #BridgeNotFound;
        #Error;
    };

    /**
    * Defines the result type for trying to retieve the ID of a bridge from
    * the public API
    */
    public type BridgeIdResult = Types.Result<Text, BridgeIdErrors>;

    /**
    * Defines the bridge errors that can occur when trying to retrieve a bridge
    */
    public type BridgeErrors = {
        #Unauthorized : Text;
        #BridgeNotFound;
        #Error;
    };

    /**
    * Defines the result type for trying to retrieve an Entity from
    * the public API
    */
    public type BridgeResult = Types.Result<Bridge, BridgeErrors>;

    /**
    * Types of errors for finding the attached bridges
    */
    public type EntityAttachedBridgesErrors = {
        #EntityNotFound;
        #Error;
    };

    /**
    * Stores the possible link status which describe how the Entity is linked to the Bridge
    * This status is owned by the Entity to allow the Entity control over how it views the Bridge and
    * provide info to others looking at the connection
    */
    public type BridgeLinkStatus = {
        #CreatedOwner;
        #CreatedOther;
    };

    /**
    * Defines the specific data to cache from a specific bridge connection. Provides Entity controlled data to describe
    * the connection to the Bridge
    */
    public type EntityAttachedBridge = {
        /**
        * Stores the link status defining the relationship of the bridge as defined by
        * the Entity. I.e Did the Entity Owner created the bridge, did the Entity endorse the link etc
        */
        linkStatus : BridgeLinkStatus;
        /**
        * The id of the bridge that is associated with this link
        */
        id : Text;
        /**
        * The time that the bridge was added to the Entity
        */
        creationTime : Time.Time;
        /**
        * Stores the type of the bridge and how the bridge is related to the entity
        */
        bridgeType : BridgeType;
    };

    /**
    * Defines the bridge attachment types that Entities store when caching references to the Bridges either linked
    * to them or from them.
    */
    public type EntityAttachedBridges = [EntityAttachedBridge];

    /**
    * Return type for when finding the ids of attached bridges
    */
    public type EntityAttachedBridgesResult = Types.Result<EntityAttachedBridges, EntityAttachedBridgesErrors>;

    public type Interface = actor {
        create_entity                       : EntityInitiationObject        -> async EntityIdResult;
        get_entity                          : Text                          -> async EntityResult;
        update_entity                       : EntityUpdateObject            -> async EntityIdResult;
        delete_entity                       : Text                          -> async EntityIdResult;
        create_bridge                       : BridgeInitiationObject        -> async BridgeIdResult;
        get_bridge                          : Text                          -> async BridgeResult;
        update_bridge                       : BridgeUpdateObject            -> async BridgeIdResult;
        delete_bridge                       : Text                          -> async BridgeIdResult;
        get_to_bridge_ids_by_entity_id      : Text                          -> async EntityAttachedBridgesResult;
        get_from_bridge_ids_by_entity_id    : Text                          -> async EntityAttachedBridgesResult;
    };
};