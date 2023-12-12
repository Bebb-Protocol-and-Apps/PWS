import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type AccountIdentifier = string;
export type AccountIdentifier__1 = string;
export type ApiError = { 'ZeroAddress' : null } |
  { 'InvalidTokenId' : null } |
  { 'Unauthorized' : null } |
  { 'Other' : string };
export type AssocList = [] | [[[string, string], List]];
export type Balance = bigint;
export interface BalanceRequest { 'token' : TokenIdentifier, 'user' : User }
export type BalanceResponse = { 'ok' : Balance } |
  { 'err' : CommonError__1 };
export type Balance__1 = bigint;
export type CommonError = { 'InvalidToken' : TokenIdentifier } |
  { 'Other' : string };
export type CommonError__1 = { 'InvalidToken' : TokenIdentifier } |
  { 'Other' : string };
export interface Dip721NonFungibleToken {
  'maxLimit' : number,
  'logo' : LogoResult,
  'name' : string,
  'symbol' : string,
}
export interface EmailSubscriber {
  'subscribedAt' : bigint,
  'emailAddress' : string,
  'pageSubmittedFrom' : string,
}
export interface EntrepotTypesListing {
  'subaccount' : [] | [SubAccount],
  'locked' : [] | [Time],
  'seller' : Principal,
  'price' : bigint,
}
export type ExtMetadata = {
    'fungible' : {
      'decimals' : number,
      'metadata' : [] | [Uint8Array | number[]],
      'name' : string,
      'symbol' : string,
    }
  } |
  { 'nonfungible' : { 'metadata' : [] | [Uint8Array | number[]] } };
export interface ExtMintRequest {
  'to' : User,
  'metadata' : [] | [Uint8Array | number[]],
}
export type ExtendedMetadataResult = {
    'Ok' : { 'token_id' : TokenId, 'metadata_desc' : MetadataDesc }
  } |
  { 'Err' : ApiError };
export type Extension = string;
export type File = Uint8Array | number[];
export interface FileIdAndName { 'file_name' : string, 'file_id' : string }
export interface FileInfo {
  'file_name' : string,
  'file_content' : Uint8Array | number[],
  'owner_principal' : string,
}
export type FileResult = { 'Ok' : FileResultSuccessOptions } |
  { 'Err' : ApiError };
export type FileResultSuccessOptions = {
    'FileIdsAndNames' : Array<FileIdAndName>
  } |
  { 'File' : FileInfo } |
  { 'FileNames' : Array<string> } |
  { 'Success' : null } |
  { 'FileId' : string } |
  { 'Other' : string } |
  { 'FileIds' : Array<string> } |
  { 'UserRecord' : UserRecord };
export type HeaderField = [string, string];
export type InterfaceId = { 'Burn' : null } |
  { 'Mint' : null } |
  { 'Approval' : null } |
  { 'TransactionHistory' : null } |
  { 'TransferNotification' : null };
export type List = [] | [[[string, string], List]];
export interface LogoResult { 'data' : string, 'logo_type' : string }
export type Memo = Uint8Array | number[];
export type MetadataDesc = Array<MetadataPart>;
export interface MetadataKeyVal { 'key' : string, 'val' : MetadataVal }
export interface MetadataPart {
  'data' : Uint8Array | number[],
  'key_val_data' : Array<MetadataKeyVal>,
  'purpose' : MetadataPurpose,
}
export type MetadataPurpose = { 'Preview' : null } |
  { 'Rendered' : null };
export type MetadataResult = { 'Ok' : MetadataDesc } |
  { 'Err' : ApiError };
export type MetadataVal = { 'Nat64Content' : bigint } |
  { 'Nat32Content' : number } |
  { 'Nat8Content' : number } |
  { 'NatContent' : bigint } |
  { 'Nat16Content' : number } |
  { 'TextArrayContent' : Array<string> } |
  { 'BlobContent' : Uint8Array | number[] } |
  { 'PrincipalContent' : Principal } |
  { 'TextToTextAssocListContent' : AssocList } |
  { 'TextContent' : string };
export type MintReceipt = { 'Ok' : MintReceiptPart } |
  { 'Err' : ApiError };
export interface MintReceiptPart { 'id' : bigint, 'token_id' : TokenId }
export interface Nft {
  'id' : TokenId,
  'owner' : Principal,
  'metadata' : MetadataDesc,
}
export type NftResult = { 'Ok' : Nft } |
  { 'Err' : ApiError };
export type OwnerResult = { 'Ok' : Principal } |
  { 'Err' : ApiError };
export interface PersonalWebSpace {
  'balance' : ActorMethod<[BalanceRequest], BalanceResponse>,
  'balanceOfDip721' : ActorMethod<[Principal], bigint>,
  'bearer' : ActorMethod<[TokenIdentifier__1], Result_4>,
  'check_user_has_nft' : ActorMethod<[], boolean>,
  'createSpace' : ActorMethod<[string], NftResult>,
  'deleteEmailSubscriber' : ActorMethod<[string], boolean>,
  'deleteFile' : ActorMethod<[string], FileResult>,
  'extensions' : ActorMethod<[], Array<Extension>>,
  'getCallerSpaces' : ActorMethod<[], Array<Nft>>,
  'getEmailSubscribers' : ActorMethod<[], Array<[string, EmailSubscriber]>>,
  'getFile' : ActorMethod<[string], FileResult>,
  'getMaxLimitDip721' : ActorMethod<[], number>,
  'getMetadataDip721' : ActorMethod<[TokenId], MetadataResult>,
  'getMetadataForUserDip721' : ActorMethod<[Principal], ExtendedMetadataResult>,
  'getRandomSpace' : ActorMethod<[], NftResult>,
  'getSpace' : ActorMethod<[TokenId], NftResult>,
  'getTokenIdsForUserDip721' : ActorMethod<
    [Principal],
    BigUint64Array | bigint[]
  >,
  'getUserRecord' : ActorMethod<[], FileResult>,
  'greet' : ActorMethod<[string], string>,
  'hideUserSpace' : ActorMethod<[TokenId], NftResult>,
  'http_request' : ActorMethod<[Request], Response>,
  'listUserFileIds' : ActorMethod<[], FileResult>,
  'listUserFileIdsAndNames' : ActorMethod<[], FileResult>,
  'listUserFileNames' : ActorMethod<[], FileResult>,
  'logoDip721' : ActorMethod<[], LogoResult>,
  'metadata' : ActorMethod<[TokenIdentifier__1], Result_3>,
  'mintDip721' : ActorMethod<[Principal, MetadataDesc], MintReceipt>,
  'mintNFT' : ActorMethod<[ExtMintRequest], undefined>,
  'nameDip721' : ActorMethod<[], string>,
  'ownerOfDip721' : ActorMethod<[TokenId], OwnerResult>,
  'safeTransferFromDip721' : ActorMethod<
    [Principal, Principal, TokenId],
    TxReceipt
  >,
  'submitSignUpForm' : ActorMethod<[SignUpFormInput], string>,
  'supply' : ActorMethod<[TokenIdentifier__1], Result_2>,
  'supportedInterfacesDip721' : ActorMethod<[], Array<InterfaceId>>,
  'symbolDip721' : ActorMethod<[], string>,
  'tokens' : ActorMethod<[AccountIdentifier__1], Result_1>,
  'tokens_ext' : ActorMethod<[AccountIdentifier__1], Result>,
  'totalSupplyDip721' : ActorMethod<[], bigint>,
  'transfer' : ActorMethod<[TransferRequest], TransferResponse>,
  'transferFromDip721' : ActorMethod<
    [Principal, Principal, TokenId],
    TxReceipt
  >,
  'updateSpaceEntityId' : ActorMethod<[TokenId, string], NftResult>,
  'updateUserSpace' : ActorMethod<[UpdateMetadataValuesInput], NftResult>,
  'uploadUserFile' : ActorMethod<[string, File], FileResult>,
}
export interface Request {
  'url' : string,
  'method' : string,
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
}
export interface Response {
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
  'upgrade' : boolean,
  'streaming_strategy' : [] | [StreamingStrategy],
  'status_code' : number,
}
export type Result = {
    'ok' : Array<
      [TokenIndex, [] | [EntrepotTypesListing], [] | [Uint8Array | number[]]]
    >
  } |
  { 'err' : CommonError };
export type Result_1 = { 'ok' : Uint32Array | number[] } |
  { 'err' : CommonError };
export type Result_2 = { 'ok' : Balance__1 } |
  { 'err' : CommonError };
export type Result_3 = { 'ok' : ExtMetadata } |
  { 'err' : CommonError };
export type Result_4 = { 'ok' : AccountIdentifier__1 } |
  { 'err' : CommonError };
export interface SignUpFormInput {
  'emailAddress' : string,
  'pageSubmittedFrom' : string,
}
export type StreamingCallback = ActorMethod<
  [StreamingCallbackToken],
  StreamingCallbackResponse
>;
export interface StreamingCallbackResponse {
  'token' : [] | [StreamingCallbackToken],
  'body' : Uint8Array | number[],
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
export type SubAccount = Uint8Array | number[];
export type Time = bigint;
export type TokenId = bigint;
export type TokenIdentifier = string;
export type TokenIdentifier__1 = string;
export type TokenIndex = number;
export interface TransferRequest {
  'to' : User,
  'token' : TokenIdentifier,
  'notify' : boolean,
  'from' : User,
  'memo' : Memo,
  'subaccount' : [] | [SubAccount],
  'amount' : Balance,
}
export type TransferResponse = { 'ok' : Balance } |
  {
    'err' : { 'CannotNotify' : AccountIdentifier } |
      { 'InsufficientBalance' : null } |
      { 'InvalidToken' : TokenIdentifier } |
      { 'Rejected' : null } |
      { 'Unauthorized' : AccountIdentifier } |
      { 'Other' : string }
  };
export type TxReceipt = { 'Ok' : bigint } |
  { 'Err' : ApiError };
export interface UpdateMetadataValuesInput {
  'id' : TokenId,
  'updatedSpaceDescription' : string,
  'updatedOwnerName' : string,
  'updatedAboutDescription' : string,
  'updatedOwnerContactInfo' : string,
  'updatedSpaceData' : [] | [string],
  'updatedSpaceName' : string,
}
export type User = { 'principal' : Principal } |
  { 'address' : AccountIdentifier };
export interface UserRecord { 'totalSize' : bigint, 'file_ids' : Array<string> }
export interface _SERVICE extends PersonalWebSpace {}
