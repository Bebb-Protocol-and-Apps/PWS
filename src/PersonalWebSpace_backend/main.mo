import List "mo:base/List";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat16 "mo:base/Nat16";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Char "mo:base/Char";
import AssocList "mo:base/AssocList";
import Buffer "mo:base/Buffer";
import Random "mo:base/Random";
import RBTree "mo:base/RBTree";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import UUID "mo:uuid/UUID";
import Source "mo:uuid/async/SourceV4";


import Types "./Types";
import HTTP "./Http";

import Stoic "./EXT/Stoic";

import Protocol "./Protocol";
import Testable "mo:matchers/Testable";
import Blob "mo:base/Blob";

shared actor class PersonalWebSpace(custodian: Principal, init : Types.Dip721NonFungibleToken) = Self {
// TODO: instead add functions to manage cycles balance and gather stats
  public func greet(name : Text) : async Text {
    return "Hello, " # name # "!";
  };

  let personalWebSpace_frontend_canister_id_mainnet : Text = "vdfyi-uaaaa-aaaai-acptq-cai"; // deployed on mainnet
  let personalWebSpace_backend_canister_id_mainnet : Text = "vee64-zyaaa-aaaai-acpta-cai"; // deployed on mainnet

  // DIP721 standard: https://github.com/dfinity/examples/blob/master/motoko/dip-721-nft-container/src/Main.mo
  stable var transactionId: Types.TransactionId = 0;
  stable var nfts = List.nil<Types.Nft>();
  stable var custodians = List.make<Principal>(custodian);
  stable var logo : Types.LogoResult = init.logo;
  stable var name : Text = init.name;
  stable var symbol : Text = init.symbol;
  stable var maxLimit : Nat16 = init.maxLimit;

  // https://forum.dfinity.org/t/is-there-any-address-0-equivalent-at-dfinity-motoko/5445/3
  let null_address : Principal = Principal.fromText("aaaaa-aa");

  public query func balanceOfDip721(user: Principal) : async Nat64 {
    return Nat64.fromNat(
      List.size(
        List.filter(nfts, func(token: Types.Nft) : Bool { token.owner == user })
      )
    );
  };

  public query func ownerOfDip721(token_id: Types.TokenId) : async Types.OwnerResult {
    let item = List.get(nfts, Nat64.toNat(token_id));
    switch (item) {
      case (null) {
        return #Err(#InvalidTokenId);
      };
      case (?token) {
        return #Ok(token.owner);
      };
    };
  };

  public shared({ caller }) func safeTransferFromDip721(from: Principal, to: Principal, token_id: Types.TokenId) : async Types.TxReceipt {  
    if (to == null_address) {
      return #Err(#ZeroAddress);
    } else {
      return transferFrom(from, to, token_id, caller);
    };
  };

  public shared({ caller }) func transferFromDip721(from: Principal, to: Principal, token_id: Types.TokenId) : async Types.TxReceipt {
    return transferFrom(from, to, token_id, caller);
  };

  func transferFrom(from: Principal, to: Principal, token_id: Types.TokenId, caller: Principal) : Types.TxReceipt {
    let item = List.get(nfts, Nat64.toNat(token_id));
    switch (item) {
      case null {
        return #Err(#InvalidTokenId);
      };
      case (?token) {
        if (
          caller != token.owner and
          not List.some(custodians, func (custodian : Principal) : Bool { custodian == caller })
        ) {
          return #Err(#Unauthorized);
        } else if (Principal.notEqual(from, token.owner)) {
          return #Err(#Other);
        } else {
          nfts := List.map(nfts, func (item : Types.Nft) : Types.Nft {
            if (item.id == token.id) {
              let update : Types.Nft = {
                owner = to;
                id = item.id;
                metadata = token.metadata;
              };
              return update;
            } else {
              return item;
            };
          });
          transactionId += 1;
          return #Ok(transactionId);   
        };
      };
    };
  };

  public query func supportedInterfacesDip721() : async [Types.InterfaceId] {
    return [#TransferNotification, #Burn, #Mint];
  };

  public query func logoDip721() : async Types.LogoResult {
    return logo;
  };

  public query func nameDip721() : async Text {
    return name;
  };

  public query func symbolDip721() : async Text {
    return symbol;
  };

  public query func totalSupplyDip721() : async Nat64 {
    return Nat64.fromNat(
      List.size(nfts)
    );
  };

  public query func getMetadataDip721(token_id: Types.TokenId) : async Types.MetadataResult {
    let item = List.get(nfts, Nat64.toNat(token_id));
    switch (item) {
      case null {
        return #Err(#InvalidTokenId);
      };
      case (?token) {
        return #Ok(token.metadata);
      }
    };
  };

  public query func getMaxLimitDip721() : async Nat16 {
    return maxLimit;
  };

  public func getMetadataForUserDip721(user: Principal) : async Types.ExtendedMetadataResult {
    let item = List.find(nfts, func(token: Types.Nft) : Bool { token.owner == user });
    switch (item) {
      case null {
        return #Err(#Other);
      };
      case (?token) {
        return #Ok({
          metadata_desc = token.metadata;
          token_id = token.id;
        });
      }
    };
  };

  public query func getTokenIdsForUserDip721(user: Principal) : async [Types.TokenId] {
    let items = List.filter(nfts, func(token: Types.Nft) : Bool { token.owner == user });
    let tokenIds = List.map(items, func (item : Types.Nft) : Types.TokenId { item.id });
    return List.toArray(tokenIds);
  };

  public shared query ({caller}) func check_user_has_nft() : async Bool {
    let user = caller;
    let items = List.filter(nfts, func(token: Types.Nft) : Bool { token.owner == user });
    let tokenIds = List.map(items, func (item : Types.Nft) : Types.TokenId { item.id });
    let userTokenIds = List.toArray(tokenIds);
    if (userTokenIds.size() == 0) {
      return false;
    } else {
      return true;
    }
  };

  public shared({ caller }) func mintDip721(to: Principal, metadata: Types.MetadataDesc) : async Types.MintReceipt {
    if (not List.some(custodians, func (custodian : Principal) : Bool { custodian == caller })) {
      return #Err(#Unauthorized);
    };

    let newId = Nat64.fromNat(List.size(nfts));
    let nft : Types.Nft = {
      owner = to;
      id = newId;
      metadata = metadata;
    };

    var tempList = List.nil<Types.Nft>();
    tempList := List.push(nft, tempList);
    nfts := List.append(nfts, tempList);

    transactionId += 1;

    return #Ok({
      token_id = newId;
      id = transactionId;
    });
  };

  // Helper functions
  func textToNat(txt : Text) : Nat {
    assert(txt.size() > 0);
    let chars = txt.chars();

    var num : Nat = 0;
    for (v in chars){
      let charToNum = Nat32.toNat(Char.toNat32(v)-48);
      assert(charToNum >= 0 and charToNum <= 9);
      num := num * 10 +  charToNum;          
    };

    num;
  };

  func textToNat64(txt : Text) : Nat64 {
    assert(txt.size() > 0);
    let chars = txt.chars();

    var num : Nat = 0;
    for (v in chars){
      let charToNum = Nat32.toNat(Char.toNat32(v)-48);
      assert(charToNum >= 0 and charToNum <= 9);
      num := num * 10 +  charToNum;          
    };

    Nat64.fromNat(num);
  };

// Project-specific functions
  // ##################### NFT Details #################
  // defined according to NFT in Types 
  /* 
    Types.MetadataDesc for this project looks like:
      [
        {
          purpose: #Rendered ;
          data: spaceAsHtmlTextBlob // Text.encodeUtf8(spaceAsHtmlText) to get Blob from Text (probably change to spaceAsJsonFormattedTextBlob later)
          key_val_data: [
            {
              key = "ownerName";
              val = #TextContent ownerName;
            },
            {
              key = "ownerContactInfo";
              val = #TextContent ownerContactInfo;
            },
            {
              key = "aboutDescription";
              val = #TextContent aboutDescription;
            },
            {
              key = "spaceDescription";
              val = #TextContent spaceDescription;
            },
            {
              key = "spaceName";
              val = #TextContent spaceName;
            },
            {
              key = "creator";
              val: #PrincipalContent caller;
            },
            {
              key = "creationTime";
              val = #Nat64Content generatedTimestamp;
            },
            {
              key = "protocolEntityId";
              val = #TextContent protocolEntityId;
            },
          ];
        }
      ]
   */

  public shared({ caller }) func createSpace(spaceHtml : Text) : async Types.NftResult {
    // don't allow anonymous Principal
    if (Principal.isAnonymous(caller)) {
      return #Err(#Unauthorized);
		};

    let newId = Nat64.fromNat(List.size(nfts));

    // create space as Entity in Protocol
    let entityInitiationObject : Protocol.EntityInitiationObject = {
        _internalId : ?Text = null;
        _creator : ?Principal = ?caller;
        _owner : ?Principal = ?caller;
        _settings : ?Protocol.EntitySettings = null;
        _entityType : Protocol.EntityType = #Webasset;
        _name : ?Text = ?"Personal Web Space";
        _description : ?Text = ?"Flaming Hot Personal Web Space";
        _keywords : ?[Text] = ?["NFT", "Space", "heeyah"];
        _externalId : ?Text = ?("https://" # personalWebSpace_frontend_canister_id_mainnet # ".raw.ic0.app/#/space/" # Nat64.toText(newId));
        _entitySpecificFields : ?Text = null;
    };
    //__________Local vs Mainnet Development____________
    var protocolEntityId : Text = ""; // enough for local development
    if (Principal.fromActor(Self) == Principal.fromText(personalWebSpace_backend_canister_id_mainnet)) {
      // Live on Mainnet
      let spaceEntity : Protocol.Entity = await protocol.create_entity(entityInitiationObject); // Bebb Protocol call
      protocolEntityId := spaceEntity.internalId;
    } else {
      // Local
      let localProtocol  : Protocol.Interface  = actor(Protocol.LOCAL_CANISTER_ID);
      let spaceEntity : Protocol.Entity = await localProtocol.create_entity(entityInitiationObject);
      protocolEntityId := spaceEntity.internalId;
    };    

    // create space for caller
    let textArrayContent : [Text] = [];
    let keyValData : [Types.MetadataKeyVal] = [
      {
        key = "ownerName";
        val = #TextContent "";
      },
      {
        key = "ownerContactInfo";
        val = #TextContent "";
      },
      {
        key = "aboutDescription";
        val = #TextContent "This is my flaming hot Personal Web Space. Enjoy!";
      },
      {
        key = "spaceDescription";
        val = #TextContent "My virtual home - heeyah";
      },
      {
        key = "spaceName";
        val = #TextContent "My Flaming Hot Personal Web Space";
      },
      {
        key = "creator";
        val = #PrincipalContent caller;
      },
      {
        key = "creationTime";
        val = #Nat64Content (Nat64.fromNat(Int.abs(Time.now())));
      },
      {
        key = "protocolEntityId";
        val = #TextContent protocolEntityId;
      }
    ];
    let nftData = Text.encodeUtf8(spaceHtml);
    
    let metadataPart : Types.MetadataPart = {
      purpose = #Rendered;
      key_val_data = keyValData;
      data = nftData; //provided space HTML
    };
    let metadata : Types.MetadataDesc = [metadataPart];
    let nft : Types.Nft = {
      owner = caller;
      id = newId;
      metadata = metadata;
    };

    var tempList = List.nil<Types.Nft>();
    tempList := List.push(nft, tempList);
    nfts := List.append(nfts, tempList);

    transactionId += 1;

    return #Ok(nft);
  };

  public shared query ({caller}) func getCallerSpaces() : async [Types.Nft] {
    let spaces = List.filter(nfts, func(token: Types.Nft) : Bool { token.owner == caller });
    return List.toArray(spaces); 
  };

  public shared query ({caller}) func getSpace(spaceId : Types.TokenId) : async Types.NftResult {
    let item = List.get(nfts, Nat64.toNat(spaceId));
    switch (item) {
      case (null) {
        return #Err(#InvalidTokenId);
      };
      case (?token) {
        return #Ok(token);
      };
    };
  };

  public func getRandomSpace() : async Types.NftResult {
    let numberOfSpaces = List.size(nfts);
    if (numberOfSpaces > 0) {
      let random = Random.Finite(await Random.blob());
      var p : Nat8 = 16;
      
      if (numberOfSpaces < 256) {
        p := 8;
      } else if (numberOfSpaces < 2049) {
        p := 11;
      } else if (numberOfSpaces < 8193) {
        p := 13;
      };
      switch (random.range(p)) {
        case (null) {
          return #Err(#Other);
        };
        case (?randomNumber) {
          let spaceId = randomNumber % numberOfSpaces;
          let item = List.get(nfts, spaceId);
          switch (item) {
            case (null) {
              return #Err(#InvalidTokenId);
            };
            case (?token) {
              return #Ok(token);
            };
          };
        };
      };
    } else {
      return #Err(#Other);
    };
  };

  // Update a Space's metadata fields including the Space's data which is displayed (if updatedSpaceData is provided)
  public shared({ caller }) func updateUserSpace(updatedUserSpaceData: Types.UpdateMetadataValuesInput) : async Types.NftResult {
    switch (List.get(nfts, Nat64.toNat(updatedUserSpaceData.id))) {
      case (null) {
        return #Err(#InvalidTokenId);
      };
      case (?token) {
        // only owner may update
        if (token.owner != caller) {
          return #Err(#Unauthorized);
        };
        // assemble updated space data, then update nfts list
          // create placeholder objects...
        var aboutDescriptionObject = {
          key = "aboutDescription";
          val: Types.MetadataVal = #TextContent "This is my flaming hot Personal Web Space. Enjoy!";
        };
        var creatorObject = {
          key = "creator";
          val: Types.MetadataVal = #PrincipalContent caller;
        };
        var creationTimeObject = {
          key = "creationTime";
          val: Types.MetadataVal = #Nat64Content (Nat64.fromNat(0));
        };
        var protocolEntityIdObject = {
          key = "protocolEntityId";
          val: Types.MetadataVal = #TextContent "";
        };
          // ... and fill them with space's current data
        for (i in token.metadata[0].key_val_data.keys()) {
          if (token.metadata[0].key_val_data[i].key == "aboutDescription") {
            aboutDescriptionObject := token.metadata[0].key_val_data[i]; // currently not used, thus remains unchanged
          } else if (token.metadata[0].key_val_data[i].key == "creator") {
            creatorObject := token.metadata[0].key_val_data[i]; // should always remain unchanged
          } else if (token.metadata[0].key_val_data[i].key == "creationTime") {
            creationTimeObject := token.metadata[0].key_val_data[i]; // should always remain unchanged
          } else if (token.metadata[0].key_val_data[i].key == "protocolEntityId") {
            protocolEntityIdObject := token.metadata[0].key_val_data[i]; // should always remain unchanged
          }; 
        };

        let updatedKeyValData: [Types.MetadataKeyVal] = [
          {
            key = "ownerName";
            val = #TextContent (updatedUserSpaceData.updatedOwnerName);
          },
          {
            key = "ownerContactInfo";
            val = #TextContent (updatedUserSpaceData.updatedOwnerContactInfo);
          },
          aboutDescriptionObject,
          {
            key = "spaceDescription";
            val = #TextContent (updatedUserSpaceData.updatedSpaceDescription);
          },
          {
            key = "spaceName";
            val = #TextContent (updatedUserSpaceData.updatedSpaceName);
          },
          creatorObject,
          creationTimeObject,
          protocolEntityIdObject
        ];
        // updatedSpaceData is an optional attribute; only use it to update the Space if it was provided
        let spaceData = switch(updatedUserSpaceData.updatedSpaceData) {
          case (null) {token.metadata[0].data};
          case (?"") {token.metadata[0].data};
          case (?updatedSpaceData) {Text.encodeUtf8(updatedSpaceData)} //TODO: probably check provided HTML
        };
        let updatedMetadataPart : Types.MetadataPart = {
          purpose = #Rendered;
          key_val_data = updatedKeyValData;
          data = spaceData;
        };
        let updatedMetadata : Types.MetadataDesc = [updatedMetadataPart];
        let updatedNft : Types.Nft = {
          owner = token.owner;
          id = token.id;
          metadata = updatedMetadata;
        };

        // add updated space to list of NFTs
        nfts := List.map(nfts, func (item : Types.Nft) : Types.Nft {
          if (item.id == token.id) {
            return updatedNft;
          } else {
            return item;
          };
        });
        transactionId += 1;
        switch (List.get(nfts, Nat64.toNat(updatedUserSpaceData.id))) {
          case (null) {
            return #Err(#InvalidTokenId);
          };
          case (?updatedSpace) {
            return #Ok(updatedSpace);
          }
        };
      };
    };
  };

// Protocol integration
  private let protocol  : Protocol.Interface  = actor(Protocol.CANISTER_ID);


// HTTP interface
  public query func http_request(request : HTTP.Request) : async HTTP.Response {
    //Debug.print(debug_show("http_request test"));
    //Debug.print(debug_show(request));
    if (Text.contains(request.url, #text("tokenid"))) { // endpoint for Stoic Wallet/Entrepot
      let tokenId = Iter.toArray(Text.tokens(request.url, #text("tokenid=")))[1];
      let { index } = Stoic.decodeToken(tokenId);
      let item = List.get(nfts, Nat32.toNat(index));
      switch (item) {
        case (null) {
          let response = {
            body = Text.encodeUtf8("Invalid tokenid");
            headers = [];
            status_code = 404 : Nat16;
            streaming_strategy = null;
            upgrade = false;
          };
          return(response);
        };
        case (?token) {
          let body = token.metadata[0].data;
          let response = {
            body = body;
            headers = [("Content-Type", "text/html"), ("Content-Length", Nat.toText(body.size()))];
            status_code = 200 : Nat16;
            streaming_strategy = null;
            upgrade = false;
          };
          return(response);
        };
      };
    } else if (Text.contains(request.url, #text("spaceId"))) {
      let spaceId = Iter.toArray(Text.tokens(request.url, #text("spaceId=")))[1];
      let item = List.get(nfts, textToNat(spaceId));
      switch (item) {
        case (null) {
          let response = {
            body = Text.encodeUtf8("Invalid spaceId");
            headers = [];
            status_code = 404 : Nat16;
            streaming_strategy = null;
            upgrade = false;
          };
          return(response);
        };
        case (?token) {
          let body = token.metadata[0].data;
          let response = {
            body = body;
            headers = [("Content-Type", "text/html"), ("Content-Length", Nat.toText(body.size()))];
            status_code = 200 : Nat16;
            streaming_strategy = null;
            upgrade = false;
          };
          return(response);
        };
      };
    } else {
      return {
        upgrade = false; // ← If this is set to true, the request will be sent to http_request_update()
        status_code = 200;
        headers = [ ("content-type", "text/plain") ];
        body = "It does not work";
        streaming_strategy = null;
      };
    };
  };


// Code for uploading files
private let maxFileSize : Nat = 1024; // 1 KB as an example, adjust as needed
private let maxTotalSize : Nat = 10240; // 10 KB as an example, adjust as needed
private let maxFiles : Nat = 10; // limit to 10 files per user, adjust as needed

type UserId = Principal;
type File = Blob;

public type FileInfo = {
  owner_principal : Text;
  file_name : Text;
  file_content : Blob;
};

public type UserRecord = {
  totalSize : Nat;
  file_ids : [Text];
};

// Variable stores reference of a user to all their files
private var storage : HashMap.HashMap<Text, UserRecord> = HashMap.HashMap(0, Text.equal, Text.hash); 
// This is a quick file lookup by an anonomous file_id file. Allows public access of files without
//  needing to reveal who owns the file
private var file_search : HashMap.HashMap<Text, FileInfo> = HashMap.HashMap(0, Text.equal, Text.hash);


private func getUserTotalSize(user: UserId) : Nat {
  switch (storage.get(Principal.toText(user))) {
    case (null) { return 0; };
    case (?userRecord) { return userRecord.totalSize; };
  };
};

private func getUserFileIds(user: UserId) : [Text] {
  switch (storage.get(Principal.toText(user))) {
    case (null) { return []; };
    case (?userRecord) {
       return userRecord.file_ids; 
       };
  };
};

// Retrieves all the files of the specified user
private func getUserFiles(user: UserId) : [FileInfo] {
  switch (storage.get(Principal.toText(user))) {
    case (null) { return []; };
    case (?userRecord) { 
      var userFileInfo : [FileInfo] = [];
      for (file_id in userRecord.file_ids.vals())
      {
        let retrievedFileInfo : ?FileInfo = file_search.get(file_id);
        switch (retrievedFileInfo) {
            case(?checkedFileInfo) {
                userFileInfo := Array.append<FileInfo>(userFileInfo, [checkedFileInfo]);
            }
        };

      };      
      return userFileInfo;      
      };
  };
};

public shared(msg) func upload(fileName : Text, content : File) : async Text {
  let user = msg.caller;
  // if (Principal.isAnonymous(user))
  // {
  //       return "Error: user not logged in";
  // };

  // Make sure the new file isn't above the limit
  let fileSize = content.size();
  if (fileSize > maxFileSize) {
    return "Error: File size exceeds the limit.";
  };

  // Ensure that the user isn't uploading an empty file
  if (fileSize <= 0) {
    return "Error: File empty";
  };

  // Retrieve the total amount of data stored by the user
  let userTotalSize = getUserTotalSize(user);
  if (userTotalSize + fileSize > maxTotalSize) {
    return "Error: Total size limit reached.";
  };

  // Retrieve all the file ids used by the current user
  let userFilesIds = getUserFileIds(user);
  if (userFilesIds.size() >= maxFiles) {
    return "Error: File limit reached.";
  };

  var found_unique_file_id : Bool = true;
  var counter : Nat = 0;
  var file_id : Text = "";

  // Keep searching for a unique name until one is found, the chances of collisions are really low
  //  but in case it happens keep looping until a file id is not found
  while(found_unique_file_id)
  {
    // 100 is chosen arbitarily to ensure that in case of something weird happening
    //  there is a timeout
    if (counter > 100)
    {
      return "Error: Failed to upload file due to not finding a unique identifier, please contact support";
    };

    // Technically there could be a race condition here... lets see if we can make this an atomic 
    //  operation
    let g = Source.Source();
    file_id := UUID.toText(await g.new());

    if (file_search.get(file_id) == null)
    {
      // Claim the id by putting an empty record into it
      file_search.put(file_id, { file_name = "blank"; file_content = ""; owner_principal = "blank"});
      found_unique_file_id := false;
    };

    counter := counter + 1;
  };

  // Add the new file to the storage 
  let file_info = { file_name = fileName; file_content = content; owner_principal = Principal.toText(user) };
  file_search.put(file_id, file_info);

  // Add the new file id to the user record
  let newFilesId = Array.append(userFilesIds,[file_id]);
  let newUserRecord = {file_ids = newFilesId; totalSize = userTotalSize + fileSize };
  storage.put(Principal.toText(user), newUserRecord);

  return "File successfully uploaded";
};

public shared(msg) func listFiles() : async [Text] {
  let user = msg.caller;
  let userFiles = getUserFiles(user);
  return Array.map<FileInfo, Text>(userFiles, func fileInfo = fileInfo.file_name );
};

};
