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

import Types "./Types";
import HTTP "./Http";

import Stoic "./EXT/Stoic";

import Protocol "./Protocol";

shared actor class PersonalWebSpace(custodian: Principal, init : Types.Dip721NonFungibleToken) = Self {
  public func greet(name : Text) : async Text {
    return "Hello, " # name # "!";
  };

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
          purpose: #Preview (initially) | #Rendered (after gallery was updated for the first time);
          data: galleryAsHtmlTextBlob // Text.encodeUtf8(galleryAsHtmlText) to get Blob from Text 
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
              key = "galleryDescription";
              val = #TextContent galleryDescription;
            },
            {
              key = "galleryName";
              val = #TextContent galleryName;
            },
            {
              key = "mediaUrlToBridgeIdMap";
              val = #TextToTextAssocListContent mediaUrlToBridgeIdMap;
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

  stable var placeholderImageBlob : Blob = Text.encodeUtf8(""); // currently set to Infekted_Placeholder_NFT-min.png
  // (uncomment and) use this function to update the placeholder image that will be used as the only image for every new gallery (until the user edits the gallery)
  /* public shared ({ caller }) func updatePlaceholderImage(placeholderImage : Blob) : async Bool {
    placeholderImageBlob := placeholderImage;
    return true;
  }; */

  func getEmptyGalleryHtml() : Text {
    // TODO: remove last example image
    return "<!DOCTYPE html> <html> <head> <title>Personal NFT Gallery</title> <meta name='author' content='Personal NFT Gallery User'> <meta name='description' content='This is a user-owned and -controlled Personal NFT Gallery. Each Personal NFT Gallery is an NFT hosted on the Internet Computer blockchain platform, contains all data to be displayed as a regular webpage in any browser and can be viewed at a unique URL. Via the Personal NFT Gallery web app, Users can see which galleries they own and how they look when displayed as a webpage. They can then go ahead and edit their galleries (and thus the NFT and displayed webpage) by updating metadata on the gallery and the owner and which NFTs should be displayed as part of the gallery.'> <meta name='robots' content='index, follow'> <meta charset='UTF-8'> <meta name='viewport' content='width=device-width, initial-scale=1'> <link rel='stylesheet' href='https://www.w3schools.com/w3css/4/w3.css'> <link href='https://fonts.googleapis.com/css?family=Raleway' rel='stylesheet' type='text/css'> <style> div.gallery { border: 1px solid #ccc; } div.gallery:hover { border: 1px solid #777; } div.gallery img { width: 100%; height: auto; } div.desc { padding: 7px; text-align: center; } h3 { padding: 7px; text-align: center; } * { box-sizing: border-box; } .responsive { padding: 0 6px; float: left; width: 33.333333%; } @media only screen and (max-width: 700px) { .responsive { width: 49.99999%; margin: 6px 0; } } @media only screen and (max-width: 500px) { .responsive { width: 100%; } } .clearfix:after { content: ''; display: table; clear: both; } /* Style the top navigation bar */ .topnav { overflow: hidden; background-color: #333; } /* Style the topnav links */ .topnav a { float: left; display: block; color: #f2f2f2; text-align: center; padding: 14px 16px; text-decoration: none; } /* Change color on hover */ .topnav a:hover { background-color: #ddd; color: black; } .collapsible { padding: 7px; text-align: center; width: 100%; border: none; outline: none; cursor: pointer; } .active, .collapsible:hover { background-color: #555; } .content { /* padding: 0 18px; */ display: none; overflow: hidden; /* background-color: #f1f1f1; */ } ol { text-align: left; } </style> </head> <body> <div class='topnav'> <a target='_blank' href='https://kmj74-syaaa-aaaai-acnza-cai.ic0.app/'>Personal NFT Gallery</a> <a href='#gallery'>Gallery</a> <a href='#about'>About</a> </div> <h3 id='gallery'><b>Welcome to My Personal NFT Gallery</b></h3> <div class='responsive'> <div class='gallery'> <a target='_blank' href='https://kmj74-syaaa-aaaai-acnza-cai.ic0.app/'> <img src='https://kfkua-eqaaa-aaaai-acnyq-cai.raw.ic0.app/galleryplaceholderimage' alt='Edit the displayed images in the Personal NFT Gallery dApp' width='600' height='400'> </a> </div> </div> <div class='clearfix'></div> <footer class='w3-light-grey w3-padding-64 w3-center' id='about'> <h2>About</h2> <p>These are my favorite NFTs. Please enjoy!</p> <br> <h3><b>To edit your gallery and choose which images to display:</b><h3> <ol> <li>Click on 'Personal NFT Gallery' in the top-left corner to go to the Personal NFT Gallery dApp (https://kmj74-syaaa-aaaai-acnza-cai.ic0.app/)</li> <li>Log in with Stoic Wallet</li> <li>Find this gallery under 'My Personal NFT Galleries' and click on the 'Edit' button</li> <li>The edit mode will open. You can change some info about yourself as owner and about the gallery like name and description</li> <li>Find the URL of the image you want to display (e.g. an Internet Computer NFT: https://hbe6s-raaaa-aaaai-acloa-cai.raw.ic0.app/?tokenid=xke67-7ikor-uwiaa-aaaaa-caas3-qaqca-aaaaz-q) and paste the URL into the field below 'Links to NFTs to be Displayed'.</li> <li>If you want to display more images, click on 'Add NFT field' and paste in the URLs.</li> <li>Then click on 'Save Changes'</li> </ol> <br> <p>Powered by <a href='https://kmj74-syaaa-aaaai-acnza-cai.ic0.app/' target='_blank' class='w3-hover-text-green'>Personal NFT Gallery</a> and hosted on <a href='https://internetcomputer.org/' target='_blank' class='w3-hover-text-green'>Internet Computer</a></p> </footer> <script> var coll = document.getElementsByClassName('collapsible'); var i; for (i = 0; i < coll.length; i++) { coll[i].addEventListener('click', function() { this.classList.toggle('active'); var content = this.nextElementSibling; if (content.style.display === 'block') { content.style.display = 'none'; } else { content.style.display = 'block'; } }); } </script> </body> </html> ";
    //with image description: return "<!DOCTYPE html> <html> <head> <title>Personal NFT Gallery</title> <meta name='author' content='Personal NFT Gallery User'> <meta name='description' content='This is a user-owned and -controlled Personal NFT Gallery. Each Personal NFT Gallery is an NFT hosted on the Internet Computer blockchain platform, contains all data to be displayed as a regular webpage in any browser and can be viewed at a unique URL. Via the Personal NFT Gallery web app, Users can see which galleries they own and how they look when displayed as a webpage. They can then go ahead and edit their galleries (and thus the NFT and displayed webpage) by updating metadata on the gallery and the owner and which NFTs should be displayed as part of the gallery.'> <meta name='robots' content='index, follow'> <meta charset='UTF-8'> <meta name='viewport' content='width=device-width, initial-scale=1'> <link rel='stylesheet' href='https://www.w3schools.com/w3css/4/w3.css'> <link href='https://fonts.googleapis.com/css?family=Raleway' rel='stylesheet' type='text/css'> <style> div.gallery { border: 1px solid #ccc; } div.gallery:hover { border: 1px solid #777; } div.gallery img { width: 100%; height: auto; } div.desc { padding: 7px; text-align: center; } h3 { padding: 7px; text-align: center; } * { box-sizing: border-box; } .responsive { padding: 0 6px; float: left; width: 33.333333%; } @media only screen and (max-width: 700px) { .responsive { width: 49.99999%; margin: 6px 0; } } @media only screen and (max-width: 500px) { .responsive { width: 100%; } } .clearfix:after { content: ''; display: table; clear: both; } /* Style the top navigation bar */ .topnav { overflow: hidden; background-color: #333; } /* Style the topnav links */ .topnav a { float: left; display: block; color: #f2f2f2; text-align: center; padding: 14px 16px; text-decoration: none; } /* Change color on hover */ .topnav a:hover { background-color: #ddd; color: black; } .collapsible { padding: 7px; text-align: center; width: 100%; border: none; outline: none; cursor: pointer; } .active, .collapsible:hover { background-color: #555; } .content { /* padding: 0 18px; */ display: none; overflow: hidden; /* background-color: #f1f1f1; */ } </style> </head> <body> <div class='topnav'> <a target='_blank' href='https://kmj74-syaaa-aaaai-acnza-cai.ic0.app/'>Personal NFT Gallery</a> <a href='#gallery'>Gallery</a> <a href='#about'>About</a> </div> <h3 id='gallery'><b>Welcome to My Personal NFT Gallery</b></h3> <div class='responsive'> <div class='gallery'> <a target='_blank' href='https://www.w3schools.com/css/img_5terre.jpg'> <img src='https://www.w3schools.com/css/img_5terre.jpg' alt='Cool NFT' width='600' height='400'> </a> <button type='button' class='collapsible'>See Details</button> <div class='content'> <p>Lorem ipsum .</p> </div> </div> </div> <div class='clearfix'></div> <footer class='w3-light-grey w3-padding-64 w3-center' id='about'> <h2>About</h2> <p>These are my favorite NFTs. Please enjoy!</p> <br> <p>Powered by <a href='https://kmj74-syaaa-aaaai-acnza-cai.ic0.app/' target='_blank' class='w3-hover-text-green'>Personal NFT Gallery</a> and hosted on <a href='https://internetcomputer.org/' target='_blank' class='w3-hover-text-green'>Internet Computer</a></p> </footer> <script> var coll = document.getElementsByClassName('collapsible'); var i; for (i = 0; i < coll.length; i++) { coll[i].addEventListener('click', function() { this.classList.toggle('active'); var content = this.nextElementSibling; if (content.style.display === 'block') { content.style.display = 'none'; } else { content.style.display = 'block'; } }); } </script> </body> </html> ";
  };

  func getGalleryTemplateHtmlParts() : [Text] {
    // replace _user_name_ with owner name
    let templateHead = "<!DOCTYPE html> <html> <head> <title>Personal NFT Gallery</title> <meta name='author' content='Personal NFT Gallery User _user_name_'> <meta name='description' content='This is a user-owned and -controlled Personal NFT Gallery. Each Personal NFT Gallery is an NFT hosted on the Internet Computer blockchain platform, contains all data to be displayed as a regular webpage in any browser and can be viewed at a unique URL. Via the Personal NFT Gallery web app, Users can see which galleries they own and how they look when displayed as a webpage. They can then go ahead and edit their galleries (and thus the NFT and displayed webpage) by updating metadata on the gallery and the owner and which NFTs should be displayed as part of the gallery.'> <meta name='robots' content='index, follow'> <meta charset='UTF-8'> <meta name='viewport' content='width=device-width, initial-scale=1'> <link rel='stylesheet' href='https://www.w3schools.com/w3css/4/w3.css'> <link href='https://fonts.googleapis.com/css?family=Raleway' rel='stylesheet' type='text/css'> <style> div.gallery { border: 1px solid #ccc; } div.gallery:hover { border: 1px solid #777; } div.gallery img { width: 100%; height: auto; } div.desc { padding: 7px; text-align: center; } h3 { padding: 7px; text-align: center; } * { box-sizing: border-box; } .responsive { padding: 0 6px; float: left; width: 33.333333%; } @media only screen and (max-width: 700px) { .responsive { width: 49.99999%; margin: 6px 0; } } @media only screen and (max-width: 500px) { .responsive { width: 100%; } } .clearfix:after { content: ''; display: table; clear: both; } /* Style the top navigation bar */ .topnav { overflow: hidden; background-color: #333; } /* Style the topnav links */ .topnav a { float: left; display: block; color: #f2f2f2; text-align: center; padding: 14px 16px; text-decoration: none; } /* Change color on hover */ .topnav a:hover { background-color: #ddd; color: black; } .collapsible { padding: 7px; text-align: center; width: 100%; border: none; outline: none; cursor: pointer; } .active, .collapsible:hover { background-color: #555; } .content { /* padding: 0 18px; */ display: none; overflow: hidden; /* background-color: #f1f1f1; */ } </style> </head>";
    //object: let templateHead = "<!DOCTYPE html> <html> <head> <title>Personal NFT Gallery</title> <meta name='author' content='Personal NFT Gallery User _user_name_'> <meta name='description' content='This is a user-owned and -controlled Personal NFT Gallery. Each Personal NFT Gallery is an NFT hosted on the Internet Computer blockchain platform, contains all data to be displayed as a regular webpage in any browser and can be viewed at a unique URL. Via the Personal NFT Gallery web app, Users can see which galleries they own and how they look when displayed as a webpage. They can then go ahead and edit their galleries (and thus the NFT and displayed webpage) by updating metadata on the gallery and the owner and which NFTs should be displayed as part of the gallery.'> <meta name='robots' content='index, follow'> <meta charset='UTF-8'> <meta name='viewport' content='width=device-width, initial-scale=1'> <link rel='stylesheet' href='https://www.w3schools.com/w3css/4/w3.css'> <link href='https://fonts.googleapis.com/css?family=Raleway' rel='stylesheet' type='text/css'> <style> div.gallery { border: 1px solid #ccc; } div.gallery:hover { border: 1px solid #777; } div.gallery img { width: 100%; height: auto; } div.gallery object { width: 100%; height: auto; } div.gallery span { width: 100%; height: auto; } div.desc { padding: 7px; text-align: center; } h3 { padding: 7px; text-align: center; } * { box-sizing: border-box; } .responsive { padding: 0 6px; float: left; width: 33.333333%; } @media only screen and (max-width: 700px) { .responsive { width: 49.99999%; margin: 6px 0; } } @media only screen and (max-width: 500px) { .responsive { width: 100%; } } .clearfix:after { content: ''; display: table; clear: both; } /* Style the top navigation bar */ .topnav { overflow: hidden; background-color: #333; } /* Style the topnav links */ .topnav a { float: left; display: block; color: #f2f2f2; text-align: center; padding: 14px 16px; text-decoration: none; } /* Change color on hover */ .topnav a:hover { background-color: #ddd; color: black; } .collapsible { padding: 7px; text-align: center; width: 100%; border: none; outline: none; cursor: pointer; } .active, .collapsible:hover { background-color: #555; } .content { /* padding: 0 18px; */ display: none; overflow: hidden; /* background-color: #f1f1f1; */ } </style> </head>";
    //iframe: let templateHead = "<!DOCTYPE html> <html> <head> <title>Personal NFT Gallery</title> <meta name='author' content='Personal NFT Gallery User _user_name_'> <meta name='description' content='This is a user-owned and -controlled Personal NFT Gallery. Each Personal NFT Gallery is an NFT hosted on the Internet Computer blockchain platform, contains all data to be displayed as a regular webpage in any browser and can be viewed at a unique URL. Via the Personal NFT Gallery web app, Users can see which galleries they own and how they look when displayed as a webpage. They can then go ahead and edit their galleries (and thus the NFT and displayed webpage) by updating metadata on the gallery and the owner and which NFTs should be displayed as part of the gallery.'> <meta name='robots' content='index, follow'> <meta charset='UTF-8'> <meta name='viewport' content='width=device-width, initial-scale=1'> <link rel='stylesheet' href='https://www.w3schools.com/w3css/4/w3.css'> <link href='https://fonts.googleapis.com/css?family=Raleway' rel='stylesheet' type='text/css'> <style> div.gallery { border: 1px solid #ccc; } div.gallery:hover { border: 1px solid #777; } div.gallery img { width: 100%; height: auto; } div.gallery iframe { width: 100%; height: auto; } div.desc { padding: 7px; text-align: center; } h3 { padding: 7px; text-align: center; } * { box-sizing: border-box; } .responsive { padding: 0 6px; float: left; width: 33.333333%; } @media only screen and (max-width: 700px) { .responsive { width: 49.99999%; margin: 6px 0; } } @media only screen and (max-width: 500px) { .responsive { width: 100%; } } .clearfix:after { content: ''; display: table; clear: both; } /* Style the top navigation bar */ .topnav { overflow: hidden; background-color: #333; } /* Style the topnav links */ .topnav a { float: left; display: block; color: #f2f2f2; text-align: center; padding: 14px 16px; text-decoration: none; } /* Change color on hover */ .topnav a:hover { background-color: #ddd; color: black; } .collapsible { padding: 7px; text-align: center; width: 100%; border: none; outline: none; cursor: pointer; } .active, .collapsible:hover { background-color: #555; } .content { /* padding: 0 18px; */ display: none; overflow: hidden; /* background-color: #f1f1f1; */ } </style> </head>";
    let templateBodyNav = "<body> <div class='topnav'> <a target='_blank' href='https://kmj74-syaaa-aaaai-acnza-cai.ic0.app/'>Personal NFT Gallery</a> <a href='#gallery'>Gallery</a> <a href='#about'>About</a> </div>";
    // replace My Personal NFT Gallery with galleryName
    let templateBodyWelcome = "<h3 id='gallery'><b>Welcome to My Personal NFT Gallery</b></h3>";
    // add one entry per bridged image
    // TODO: potentially use iframe (or other element) instead of img as not all links might return an image (but e.g. svg element, redirect)
    let templateBodyGalleryImage = "<div class='responsive'> <div class='gallery'> <a target='_blank' href=''> <img src='' alt='Cool NFT' width='600' height='400'> </a> </div> </div>";
    // with img description: let templateBodyGalleryImage = "<div class='responsive'> <div class='gallery'> <a target='_blank' href=''> <img src='' alt='Cool NFT' width='600' height='400'> </a> <button type='button' class='collapsible'>See Details</button> <div class='content'> <p>Lorem ipsum .</p> </div> </div> </div>";
    //iframe: let templateBodyGalleryImage = "<div class='responsive'> <div class='gallery'> <a target='_blank' href=''> <iframe src='' title='Cool NFT' width='600' height='400' style='border:none;' scrolling='no'></iframe> </a> <button type='button' class='collapsible'>See Details</button> <div class='content'> <p>Lorem ipsum .</p> </div> </div> </div>";
    //object: let templateBodyGalleryImage = "<div class='responsive'> <div class='gallery'> <a target='_blank' style='display:inline-block;position:relative;z-index:1;' href=''> <span style='display:inline-block;'> <object data='' width='600' height='400' style='position:relative;z-index:-1'>Cool NFT</object> </span> </a> </div> </div>";
    // replace These are my favorite NFTs. Please enjoy! with description
    let templateBodyAbout = "<div class='clearfix'></div> <footer class='w3-light-grey w3-padding-64 w3-center' id='about'> <h2>About</h2> <p>These are my favorite NFTs. Please enjoy!</p>";
    let templateBodyFooterEnd = "<br> <p>Powered by <a href='https://kmj74-syaaa-aaaai-acnza-cai.ic0.app/' target='_blank' class='w3-hover-text-green'>Personal NFT Gallery</a> and hosted on <a href='https://internetcomputer.org/' target='_blank' class='w3-hover-text-green'>Internet Computer</a></p> </footer> <script> var coll = document.getElementsByClassName('collapsible'); var i; for (i = 0; i < coll.length; i++) { coll[i].addEventListener('click', function() { this.classList.toggle('active'); var content = this.nextElementSibling; if (content.style.display === 'block') { content.style.display = 'none'; } else { content.style.display = 'block'; } }); } </script> </body> </html>";
    return [templateHead, templateBodyNav, templateBodyWelcome, templateBodyGalleryImage, templateBodyAbout, templateBodyFooterEnd];
  };

  func updateGalleryHtml(updatedUserGalleryData: Types.UpdateMetadataValuesInput) : Text {
    let galleryTemplateHtmlParts = getGalleryTemplateHtmlParts();

    var updatedGalleryHtml : Text = Text.replace(galleryTemplateHtmlParts[0], #text "_user_name_", updatedUserGalleryData.ownerName);
    updatedGalleryHtml #= " ";
    updatedGalleryHtml #= galleryTemplateHtmlParts[1];
    updatedGalleryHtml #= " ";
    let updatedTemplateBodyWelcome = Text.replace(galleryTemplateHtmlParts[2], #text "My Personal NFT Gallery", updatedUserGalleryData.galleryName);
    updatedGalleryHtml #= updatedTemplateBodyWelcome;
    updatedGalleryHtml #= " ";
    // one templateBodyGalleryImage entry per bridged image
    for (url in updatedUserGalleryData.mediaUrlsToDisplay.vals()) {
      if (url != "") { // TODO: check that valid url/no potentially harmful input
        let galleryImageHref : Text = "href='" # url # "'";
        var updatedTemplateBodyGalleryImage = Text.replace(galleryTemplateHtmlParts[3], #text "href=''", galleryImageHref);
        let galleryImageSrc : Text = "src='" # url # "'";
        updatedTemplateBodyGalleryImage := Text.replace(updatedTemplateBodyGalleryImage, #text "src=''", galleryImageSrc);
        //let galleryObjectData : Text = "data='" # url # "'";
        //updatedTemplateBodyGalleryImage := Text.replace(updatedTemplateBodyGalleryImage, #text "data=''", galleryObjectData);
        updatedGalleryHtml #= updatedTemplateBodyGalleryImage;
        updatedGalleryHtml #= " ";
      };
    };
    let updatedTemplateBodyAbout = Text.replace(galleryTemplateHtmlParts[4], #text "These are my favorite NFTs. Please enjoy!", updatedUserGalleryData.galleryDescription);
    updatedGalleryHtml #= updatedTemplateBodyAbout;
    updatedGalleryHtml #= " ";
    updatedGalleryHtml #= galleryTemplateHtmlParts[5];

    return updatedGalleryHtml;
  };

  public shared({ caller }) func createGallery() : async Types.NftResult {
    // don't allow anonymous Principal
    if (Principal.isAnonymous(caller)) {
      return #Err(#Unauthorized);
		};

    let newId = Nat64.fromNat(List.size(nfts));

    // create gallery as Entity in Protocol
    let entityInitiationObject : Protocol.EntityInitiationObject = {
        _internalId : ?Text = null;
        _creator : ?Principal = ?caller;
        _owner : ?Principal = ?caller;
        _settings : ?Protocol.EntitySettings = null;
        _entityType : Protocol.EntityType = #Webasset;
        _name : ?Text = ?"Personal NFT Gallery";
        _description : ?Text = ?"Flaming Hot Personal NFT Gallery";
        _keywords : ?[Text] = ?["NFT", "Gallery", "heeyah"];
        _externalId : ?Text = ?("https://kfkua-eqaaa-aaaai-acnyq-cai.raw.ic0.app/?galleryId=" # Nat64.toText(newId));
        _entitySpecificFields : ?Text = null;
    };
    let galleryEntity : Protocol.Entity = await protocol.create_entity(entityInitiationObject);
    let protocolEntityId : Text = galleryEntity.internalId;
    // create empty gallery for caller
    let assocListContent : AssocList.AssocList<Text, Text> = List.nil<(Text, Text)>();
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
        val = #TextContent "This is my flaming hot Personal NFT Gallery. Enjoy!";
      },
      {
        key = "galleryDescription";
        val = #TextContent "My favorite NFTs - heeyah";
      },
      {
        key = "galleryName";
        val = #TextContent "My Flaming Hot Personal NFT Gallery";
      },
      {
        key = "mediaUrlToBridgeIdMap"; //could be replaced by retrieving this data from Protocol
        val = #TextToTextAssocListContent assocListContent;
      },
      {
        key = "mediaUrls";
        val = #TextArrayContent textArrayContent;
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
    let emptyGalleryHtml = getEmptyGalleryHtml();
    let nftData = Text.encodeUtf8(emptyGalleryHtml);
    
    let metadataPart : Types.MetadataPart = {
      purpose = #Preview;
      key_val_data = keyValData;
      data = nftData; //empty gallery HTML
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

  public shared query ({caller}) func getCallerGalleries() : async [Types.Nft] {
    let galleries = List.filter(nfts, func(token: Types.Nft) : Bool { token.owner == caller });
    return List.toArray(galleries); 
  };

  public shared({ caller }) func updateUserGallery(updatedUserGalleryData: Types.UpdateMetadataValuesInput) : async Types.NftResult {
    switch (List.get(nfts, Nat64.toNat(updatedUserGalleryData.id))) {
      case (null) {
        return #Err(#InvalidTokenId);
      };
      case (?token) {
        // only owner may update
        if (token.owner != caller) {
          return #Err(#Unauthorized);
        };
        // assemble updated gallery data, then update nfts list
          // create placeholder objects...
        var aboutDescriptionObject = {
          key = "aboutDescription";
          val: Types.MetadataVal = #TextContent "This is my flaming hot Personal NFT Gallery. Enjoy!";
        };
        let assocListContent : AssocList.AssocList<Text, Text> = List.nil<(Text, Text)>();
        var mediaUrlToBridgeIdMapObject = {
          key = "mediaUrlToBridgeIdMap";
          val: Types.MetadataVal = #TextToTextAssocListContent assocListContent;
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
          // ... and fill them with gallery's current data
        for (i in token.metadata[0].key_val_data.keys()) {
          if (token.metadata[0].key_val_data[i].key == "aboutDescription") {
            aboutDescriptionObject := token.metadata[0].key_val_data[i]; // currently not used, thus remains unchanged
          } else if (token.metadata[0].key_val_data[i].key == "mediaUrlToBridgeIdMap") {
            mediaUrlToBridgeIdMapObject := token.metadata[0].key_val_data[i];
          } else if (token.metadata[0].key_val_data[i].key == "creator") {
            creatorObject := token.metadata[0].key_val_data[i]; // should always remain unchanged
          } else if (token.metadata[0].key_val_data[i].key == "creationTime") {
            creationTimeObject := token.metadata[0].key_val_data[i]; // should always remain unchanged
          } else if (token.metadata[0].key_val_data[i].key == "protocolEntityId") {
            protocolEntityIdObject := token.metadata[0].key_val_data[i]; // should always remain unchanged
          }; 
        };
        // assemble mediaUrlToBridgeIdMap in correct format from urls in updatedUserGalleryData.mediaUrlsToDisplay
        // check if url is an existing one and thus already has Bridge -> use bridgeId
        // if new, create Bridge in Protocol and use returned bridgeId
        let currentMediaUrlToBridgeIdMap : AssocList.AssocList<Text, Text> = switch (mediaUrlToBridgeIdMapObject.val) {
          case (#TextToTextAssocListContent(assocListContent)) { assocListContent };
          case (_) { List.nil<(Text, Text)>(); };
        };
        var updatedMediaUrlToBridgeIdMap : AssocList.AssocList<Text, Text> = List.nil<(Text, Text)>(); // needed to store urls in order as specified by user
        func urlEqFunc(lhs: Text, rhs: Text): Bool {
          return lhs == rhs;
        };
        let newUrlsToAddToProtocol = Buffer.Buffer<Text>(updatedUserGalleryData.mediaUrlsToDisplay.size());
        let updatedMediaUrls = Buffer.Buffer<Text>(updatedUserGalleryData.mediaUrlsToDisplay.size());
        for (url in updatedUserGalleryData.mediaUrlsToDisplay.vals()) {
          if (url != "") { // TODO: check that valid url
            updatedMediaUrls.add(url);
            switch (AssocList.find<Text, Text>(currentMediaUrlToBridgeIdMap, url, urlEqFunc)) {
              case (null) {
                // new url; need to create media as Entity in Protocol and bridge from gallery
                // Protocol interactions will be done in batch for speed improvements
                newUrlsToAddToProtocol.add(url);
                // place url mapping to itself as a placeholder (to keep the user's provided order)
                let (newAssocList, _) = AssocList.replace<Text, Text>(updatedMediaUrlToBridgeIdMap, url, urlEqFunc, ?url);
                updatedMediaUrlToBridgeIdMap := newAssocList;
              };
              case (?bridgeId) {
                // url exists in map and thus a Bridge (between the gallery and the media) was created before
                let (newAssocList, _) = AssocList.replace<Text, Text>(updatedMediaUrlToBridgeIdMap, url, urlEqFunc, ?bridgeId);
                updatedMediaUrlToBridgeIdMap := newAssocList;
              };
            };
          };
        };
        // call Protocol in batch for all urls in newUrlsToAddToProtocol, collect results and add bridgeIds to updatedMediaUrlToBridgeIdMap
        let galleryProtocolEntityId : Text = switch (protocolEntityIdObject.val) {
          case (#TextContent(entityId)) { entityId };
          case (_) { "" }
        };
        // adapted from https://forum.dfinity.org/t/motoko-sharable-generics/9021/3
        let executingFunctionsBuffer = Buffer.Buffer<async (Protocol.Entity, ?Protocol.BridgeEntity)>(newUrlsToAddToProtocol.size());
        for (urlToAdd in newUrlsToAddToProtocol.vals()) {
          // create media as Entity
          let entityToCreate : Protocol.EntityInitiationObject = {
              _internalId : ?Text = null;
              _creator : ?Principal = ?caller;
              _owner : ?Principal = ?caller;
              _settings : ?Protocol.EntitySettings = null;
              _entityType : Protocol.EntityType = #Webasset;
              _name : ?Text = ?urlToAdd;
              _description : ?Text = ?"Created by bridging from Personal NFT Gallery";
              _keywords : ?[Text] = ?["URL", "Webasset", "image", "pure fire"];
              _externalId : ?Text = ?urlToAdd;
              _entitySpecificFields : ?Text = null;
          };
          // bridge from gallery to media
          let bridgeToCreate : Protocol.BridgeEntityInitiationObject = {
              _internalId : ?Text = null;
              _creator : ?Principal = ?caller;
              _owner : ?Principal = ?caller;
              _settings : ?Protocol.EntitySettings = null;
              _entityType : Protocol.EntityType = #BridgeEntity;
              _name : ?Text = null;
              _description : ?Text = ?"Created as Bridge from Personal NFT Gallery";
              _keywords : ?[Text] = ?["Bridge", "Gallery", "image", "next level hyperlink"];
              _externalId : ?Text = null;
              _entitySpecificFields : ?Text = null;
              _bridgeType : Protocol.BridgeType = #OwnerCreated;
              _fromEntityId : Text = galleryProtocolEntityId;
              _toEntityId : Text = "";
              _state : ?Protocol.BridgeState = ?#Confirmed;
          };
          executingFunctionsBuffer.add(protocol.create_entity_and_bridge(entityToCreate, bridgeToCreate)); // trigger all calls to Protocol canister (should be processed parallelly)
        };
        var i = 0;
        while (i < newUrlsToAddToProtocol.size()) {
          switch(await executingFunctionsBuffer.get(i)) { // collect results
            case ((newMediaUrlEntity, ?newBridgeEntity)) {
              let (newAssocList, _) = AssocList.replace<Text, Text>(updatedMediaUrlToBridgeIdMap, newUrlsToAddToProtocol.get(i), urlEqFunc, ?newBridgeEntity.internalId);
              updatedMediaUrlToBridgeIdMap := newAssocList;
            };
            case _ { return #Err(#Other); };
          };
          i += 1;
        };

        var updatedMediaUrlToBridgeIdMapObject = {
          key = "mediaUrlToBridgeIdMap";
          val: Types.MetadataVal = #TextToTextAssocListContent updatedMediaUrlToBridgeIdMap;
        };
        let updatedMediaUrlsArray : [Text] = updatedMediaUrls.toArray();

        let updatedKeyValData: [Types.MetadataKeyVal] = [
          {
            key = "ownerName";
            val = #TextContent (updatedUserGalleryData.ownerName);
          },
          {
            key = "ownerContactInfo";
            val = #TextContent (updatedUserGalleryData.ownerContactInfo);
          },
          aboutDescriptionObject,
          {
            key = "galleryDescription";
            val = #TextContent (updatedUserGalleryData.galleryDescription);
          },
          {
            key = "galleryName";
            val = #TextContent (updatedUserGalleryData.galleryName);
          },
          updatedMediaUrlToBridgeIdMapObject,
          {
            key = "mediaUrls";
            val = #TextArrayContent updatedMediaUrlsArray;
          },
          creatorObject,
          creationTimeObject,
          protocolEntityIdObject
        ];
        let updatedGalleryHtml = updateGalleryHtml(updatedUserGalleryData);
        let updatedMetadataPart : Types.MetadataPart = {
          purpose = #Rendered;
          key_val_data = updatedKeyValData;
          data = Text.encodeUtf8(updatedGalleryHtml);
        };
        let updatedMetadata : Types.MetadataDesc = [updatedMetadataPart];
        let updatedNft : Types.Nft = {
          owner = token.owner;
          id = token.id;
          metadata = updatedMetadata;
        };

        // add updated gallery to list of NFTs
        nfts := List.map(nfts, func (item : Types.Nft) : Types.Nft {
          if (item.id == token.id) {
            return updatedNft;
          } else {
            return item;
          };
        });
        transactionId += 1;
        switch (List.get(nfts, Nat64.toNat(updatedUserGalleryData.id))) {
          case (null) {
            return #Err(#InvalidTokenId);
          };
          case (?updatedGallery) {
            return #Ok(updatedGallery);
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
    } else if (Text.contains(request.url, #text("galleryId"))) {
      let galleryId = Iter.toArray(Text.tokens(request.url, #text("galleryId=")))[1];
      let item = List.get(nfts, textToNat(galleryId));
      switch (item) {
        case (null) {
          let response = {
            body = Text.encodeUtf8("Invalid galleryId");
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
    } else if (Text.contains(request.url, #text("galleryplaceholderimage"))) {
      let response = {
        body = placeholderImageBlob;
        headers = [("Content-Type", "image/png"), ("Content-Length", Nat.toText(placeholderImageBlob.size()))];
        status_code = 200 : Nat16;
        streaming_strategy = null;
        upgrade = false;
      };
      return(response);
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


};
