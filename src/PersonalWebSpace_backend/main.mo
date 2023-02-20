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

import Types "./Types";
import HTTP "./Http";

import Stoic "./EXT/Stoic";

import Protocol "./Protocol";
import Testable "mo:matchers/Testable";

shared actor class PersonalWebSpace(custodian: Principal, init : Types.Dip721NonFungibleToken) = Self {
// TODO: instead add functions to manage cycles balance and gather stats
  public func greet(name : Text) : async Text {
    return "Hello, " # name # "!";
  };

//TODO: remove (just added for initial Svelte testing)
  stable var currentValue: Nat = 0;

  public func increment(): async () {
      currentValue += 1;
  };

  public query func getValue(): async Nat {
      currentValue;
  };

  let personalWebSpace_frontend_canister_id : Text = "vdfyi-uaaaa-aaaai-acptq-cai"; // deployed on mainnet

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
        _externalId : ?Text = ?("https://" # personalWebSpace_frontend_canister_id # ".raw.ic0.app/#/space/" # Nat64.toText(newId));
        _entitySpecificFields : ?Text = null;
    };
    //__________Local vs Mainnet Development____________
    // for local development, comment out the following two lines...
    let spaceEntity : Protocol.Entity = await protocol.create_entity(entityInitiationObject); // Bebb Protocol call (live on Mainnet)
    let protocolEntityId : Text = spaceEntity.internalId;
    // and use this instead:
    //let protocolEntityId : Text = "";

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
        let updatedMetadataPart : Types.MetadataPart = {
          purpose = #Rendered;
          key_val_data = updatedKeyValData;
          data = Text.encodeUtf8(updatedUserSpaceData.updatedSpaceData); //TODO: probably check provided HTML
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
    //let initialHtml = "<!DOCTYPE html> <html> <head> <title>Personal NFT Gallery</title> <meta charset='UTF-8'> <meta name='viewport' content='width=device-width, initial-scale=1'> <link rel='stylesheet' href='https://www.w3schools.com/w3css/4/w3.css'> <link href='https://fonts.googleapis.com/css?family=Raleway' rel='stylesheet' type='text/css'> <style> div.gallery { border: 1px solid #ccc; } div.gallery:hover { border: 1px solid #777; } div.gallery img { width: 100%; height: auto; } div.desc { padding: 7px; text-align: center; } h3 { padding: 7px; text-align: center; } * { box-sizing: border-box; } .responsive { padding: 0 6px; float: left; width: 33.333333%; } @media only screen and (max-width: 700px) { .responsive { width: 49.99999%; margin: 6px 0; } } @media only screen and (max-width: 500px) { .responsive { width: 100%; } } .clearfix:after { content: ''; display: table; clear: both; } /* Style the top navigation bar */ .topnav { overflow: hidden; background-color: #333; } /* Style the topnav links */ .topnav a { float: left; display: block; color: #f2f2f2; text-align: center; padding: 14px 16px; text-decoration: none; } /* Change color on hover */ .topnav a:hover { background-color: #ddd; color: black; } .collapsible { padding: 7px; text-align: center; width: 100%; border: none; outline: none; cursor: pointer; } .active, .collapsible:hover { background-color: #555; } .content { /* padding: 0 18px; */ display: none; overflow: hidden; /* background-color: #f1f1f1; */ } </style> </head> <body> <div class='topnav'> <a href='#'>Personal NFT Gallery</a> <a href='#gallery'>Gallery</a> <a href='#about'>About</a> </div> <h3 id='gallery'><b>Welcome to My Personal NFT Gallery</b></h3> <div class='responsive'> <div class='gallery'> <a target='_blank' href='https://www.w3schools.com/css/img_5terre.jpg'> <img src='https://www.w3schools.com/css/img_5terre.jpg' alt='Cool NFT' width='600' height='400'> </a> <button type='button' class='collapsible'>See Details</button> <div class='content'> <p>Lorem ipsum .</p> </div> </div> </div> <div class='responsive'> <div class='gallery'> <a target='_blank' href='https://www.w3schools.com/css/img_forest.jpg'> <img src='https://www.w3schools.com/css/img_forest.jpg' alt='Cool NFT' width='600' height='400'> </a> <button type='button' class='collapsible'>See Details</button> <div class='content'> <p>Lorem ipsum .</p> </div> </div> </div> <div class='responsive'> <div class='gallery'> <a target='_blank' href='https://www.w3schools.com/css/img_lights.jpg'> <img src='https://www.w3schools.com/css/img_lights.jpg' alt='Cool NFT' width='600' height='400'> </a> <button type='button' class='collapsible'>See Details</button> <div class='content'> <p>Lorem ipsum .</p> </div> </div> </div> <div class='responsive'> <div class='gallery'> <a target='_blank' href='https://www.w3schools.com/css/img_mountains.jpg'> <img src='https://www.w3schools.com/css/img_mountains.jpg' alt='Mountains' width='600' height='400'> </a> <button type='button' class='collapsible'>See Details</button> <div class='content'> <p>Lorem ipsum .</p> </div> </div> </div> <div class='clearfix'></div> <footer class='w3-light-grey w3-padding-64 w3-center' id='about'> <h2>About</h2> <p>These are my favorite NFTs. Please enjoy!</p> <br> <p>Powered by <a href='https://kmj74-syaaa-aaaai-acnza-cai.ic0.app/' target='_blank' class='w3-hover-text-green'>Personal NFT Gallery</a> and hosted on <a href='https://internetcomputer.org/' target='_blank' class='w3-hover-text-green'>Internet Computer</a></p> </footer> <script> var coll = document.getElementsByClassName('collapsible'); var i; for (i = 0; i < coll.length; i++) { coll[i].addEventListener('click', function() { this.classList.toggle('active'); var content = this.nextElementSibling; if (content.style.display === 'block') { content.style.display = 'none'; } else { content.style.display = 'block'; } }); } </script> </body> </html> ";
    //let body = Text.encodeUtf8("<!DOCTYPE html> <html> <body> <h1>My First Heading</h1> <p>My first paragraph.</p> </body> </html>");
    /* let body = Text.encodeUtf8(initialHtml);
    let response = {
      body = body;
      headers = [("Content-Type", "text/html"), ("Content-Length", Nat.toText(body.size()))];
      status_code = 200 : Nat16;
      streaming_strategy = null;
      upgrade = false;
    };
    return(response); */
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
    } /* else if (Text.contains(request.url, #text("galleryplaceholderimage"))) {
      let response = {
        body = placeholderImageBlob;
        headers = [("Content-Type", "image/png"), ("Content-Length", Nat.toText(placeholderImageBlob.size()))];
        status_code = 200 : Nat16;
        streaming_strategy = null;
        upgrade = false;
      };
      return(response);
    } */ else {
      return {
        upgrade = false; // ← If this is set to true, the request will be sent to http_request_update()
        status_code = 200;
        headers = [ ("content-type", "text/plain") ];
        body = "It does not work";
        streaming_strategy = null;
      };
    };
  };


};
