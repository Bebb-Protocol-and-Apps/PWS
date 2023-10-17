export const idlFactory = ({ IDL }) => {
  const List = IDL.Rec();
  const LogoResult = IDL.Record({ 'data' : IDL.Text, 'logo_type' : IDL.Text });
  const Dip721NonFungibleToken = IDL.Record({
    'maxLimit' : IDL.Nat16,
    'logo' : LogoResult,
    'name' : IDL.Text,
    'symbol' : IDL.Text,
  });
  const TokenIdentifier = IDL.Text;
  const AccountIdentifier = IDL.Text;
  const User = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const BalanceRequest = IDL.Record({
    'token' : TokenIdentifier,
    'user' : User,
  });
  const Balance = IDL.Nat;
  const CommonError__1 = IDL.Variant({
    'InvalidToken' : TokenIdentifier,
    'Other' : IDL.Text,
  });
  const BalanceResponse = IDL.Variant({
    'ok' : Balance,
    'err' : CommonError__1,
  });
  const TokenIdentifier__1 = IDL.Text;
  const AccountIdentifier__1 = IDL.Text;
  const CommonError = IDL.Variant({
    'InvalidToken' : TokenIdentifier,
    'Other' : IDL.Text,
  });
  const Result_4 = IDL.Variant({
    'ok' : AccountIdentifier__1,
    'err' : CommonError,
  });
  const TokenId = IDL.Nat64;
  List.fill(IDL.Opt(IDL.Tuple(IDL.Tuple(IDL.Text, IDL.Text), List)));
  const AssocList = IDL.Opt(IDL.Tuple(IDL.Tuple(IDL.Text, IDL.Text), List));
  const MetadataVal = IDL.Variant({
    'Nat64Content' : IDL.Nat64,
    'Nat32Content' : IDL.Nat32,
    'Nat8Content' : IDL.Nat8,
    'NatContent' : IDL.Nat,
    'Nat16Content' : IDL.Nat16,
    'TextArrayContent' : IDL.Vec(IDL.Text),
    'BlobContent' : IDL.Vec(IDL.Nat8),
    'PrincipalContent' : IDL.Principal,
    'TextToTextAssocListContent' : AssocList,
    'TextContent' : IDL.Text,
  });
  const MetadataKeyVal = IDL.Record({ 'key' : IDL.Text, 'val' : MetadataVal });
  const MetadataPurpose = IDL.Variant({
    'Preview' : IDL.Null,
    'Rendered' : IDL.Null,
  });
  const MetadataPart = IDL.Record({
    'data' : IDL.Vec(IDL.Nat8),
    'key_val_data' : IDL.Vec(MetadataKeyVal),
    'purpose' : MetadataPurpose,
  });
  const MetadataDesc = IDL.Vec(MetadataPart);
  const Nft = IDL.Record({
    'id' : TokenId,
    'owner' : IDL.Principal,
    'metadata' : MetadataDesc,
  });
  const ApiError = IDL.Variant({
    'ZeroAddress' : IDL.Null,
    'InvalidTokenId' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'Other' : IDL.Text,
  });
  const NftResult = IDL.Variant({ 'Ok' : Nft, 'Err' : ApiError });
  const FileIdAndName = IDL.Record({
    'file_name' : IDL.Text,
    'file_id' : IDL.Text,
  });
  const FileInfo = IDL.Record({
    'file_name' : IDL.Text,
    'file_content' : IDL.Vec(IDL.Nat8),
    'owner_principal' : IDL.Text,
  });
  const UserRecord = IDL.Record({
    'totalSize' : IDL.Nat,
    'file_ids' : IDL.Vec(IDL.Text),
  });
  const FileResultSuccessOptions = IDL.Variant({
    'FileIdsAndNames' : IDL.Vec(FileIdAndName),
    'File' : FileInfo,
    'FileNames' : IDL.Vec(IDL.Text),
    'Success' : IDL.Null,
    'FileId' : IDL.Text,
    'Other' : IDL.Text,
    'FileIds' : IDL.Vec(IDL.Text),
    'UserRecord' : UserRecord,
  });
  const FileResult = IDL.Variant({
    'Ok' : FileResultSuccessOptions,
    'Err' : ApiError,
  });
  const Extension = IDL.Text;
  const EmailSubscriber = IDL.Record({
    'subscribedAt' : IDL.Nat64,
    'emailAddress' : IDL.Text,
    'pageSubmittedFrom' : IDL.Text,
  });
  const MetadataResult = IDL.Variant({ 'Ok' : MetadataDesc, 'Err' : ApiError });
  const ExtendedMetadataResult = IDL.Variant({
    'Ok' : IDL.Record({ 'token_id' : TokenId, 'metadata_desc' : MetadataDesc }),
    'Err' : ApiError,
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
  const ExtMetadata = IDL.Variant({
    'fungible' : IDL.Record({
      'decimals' : IDL.Nat8,
      'metadata' : IDL.Opt(IDL.Vec(IDL.Nat8)),
      'name' : IDL.Text,
      'symbol' : IDL.Text,
    }),
    'nonfungible' : IDL.Record({ 'metadata' : IDL.Opt(IDL.Vec(IDL.Nat8)) }),
  });
  const Result_3 = IDL.Variant({ 'ok' : ExtMetadata, 'err' : CommonError });
  const MintReceiptPart = IDL.Record({ 'id' : IDL.Nat, 'token_id' : TokenId });
  const MintReceipt = IDL.Variant({ 'Ok' : MintReceiptPart, 'Err' : ApiError });
  const ExtMintRequest = IDL.Record({
    'to' : User,
    'metadata' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const OwnerResult = IDL.Variant({ 'Ok' : IDL.Principal, 'Err' : ApiError });
  const TxReceipt = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : ApiError });
  const SignUpFormInput = IDL.Record({
    'emailAddress' : IDL.Text,
    'pageSubmittedFrom' : IDL.Text,
  });
  const Balance__1 = IDL.Nat;
  const Result_2 = IDL.Variant({ 'ok' : Balance__1, 'err' : CommonError });
  const InterfaceId = IDL.Variant({
    'Burn' : IDL.Null,
    'Mint' : IDL.Null,
    'Approval' : IDL.Null,
    'TransactionHistory' : IDL.Null,
    'TransferNotification' : IDL.Null,
  });
  const TokenIndex = IDL.Nat32;
  const Result_1 = IDL.Variant({
    'ok' : IDL.Vec(TokenIndex),
    'err' : CommonError,
  });
  const SubAccount = IDL.Vec(IDL.Nat8);
  const Time = IDL.Int;
  const EntrepotTypesListing = IDL.Record({
    'subaccount' : IDL.Opt(SubAccount),
    'locked' : IDL.Opt(Time),
    'seller' : IDL.Principal,
    'price' : IDL.Nat64,
  });
  const Result = IDL.Variant({
    'ok' : IDL.Vec(
      IDL.Tuple(
        TokenIndex,
        IDL.Opt(EntrepotTypesListing),
        IDL.Opt(IDL.Vec(IDL.Nat8)),
      )
    ),
    'err' : CommonError,
  });
  const Memo = IDL.Vec(IDL.Nat8);
  const TransferRequest = IDL.Record({
    'to' : User,
    'token' : TokenIdentifier,
    'notify' : IDL.Bool,
    'from' : User,
    'memo' : Memo,
    'subaccount' : IDL.Opt(SubAccount),
    'amount' : Balance,
  });
  const TransferResponse = IDL.Variant({
    'ok' : Balance,
    'err' : IDL.Variant({
      'CannotNotify' : AccountIdentifier,
      'InsufficientBalance' : IDL.Null,
      'InvalidToken' : TokenIdentifier,
      'Rejected' : IDL.Null,
      'Unauthorized' : AccountIdentifier,
      'Other' : IDL.Text,
    }),
  });
  const UpdateMetadataValuesInput = IDL.Record({
    'id' : TokenId,
    'updatedSpaceDescription' : IDL.Text,
    'updatedOwnerName' : IDL.Text,
    'updatedAboutDescription' : IDL.Text,
    'updatedOwnerContactInfo' : IDL.Text,
    'updatedSpaceData' : IDL.Opt(IDL.Text),
    'updatedSpaceName' : IDL.Text,
  });
  const File = IDL.Vec(IDL.Nat8);
  const PersonalWebSpace = IDL.Service({
    'balance' : IDL.Func([BalanceRequest], [BalanceResponse], ['query']),
    'balanceOfDip721' : IDL.Func([IDL.Principal], [IDL.Nat64], ['query']),
    'bearer' : IDL.Func([TokenIdentifier__1], [Result_4], ['query']),
    'check_user_has_nft' : IDL.Func([], [IDL.Bool], ['query']),
    'createSpace' : IDL.Func([IDL.Text], [NftResult], []),
    'deleteEmailSubscriber' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'deleteFile' : IDL.Func([IDL.Text], [FileResult], []),
    'extensions' : IDL.Func([], [IDL.Vec(Extension)], ['query']),
    'getCallerSpaces' : IDL.Func([], [IDL.Vec(Nft)], ['query']),
    'getEmailSubscribers' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, EmailSubscriber))],
        [],
      ),
    'getFile' : IDL.Func([IDL.Text], [FileResult], ['query']),
    'getMaxLimitDip721' : IDL.Func([], [IDL.Nat16], ['query']),
    'getMetadataDip721' : IDL.Func([TokenId], [MetadataResult], ['query']),
    'getMetadataForUserDip721' : IDL.Func(
        [IDL.Principal],
        [ExtendedMetadataResult],
        [],
      ),
    'getRandomSpace' : IDL.Func([], [NftResult], []),
    'getSpace' : IDL.Func([TokenId], [NftResult], ['query']),
    'getTokenIdsForUserDip721' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(TokenId)],
        ['query'],
      ),
    'getUserRecord' : IDL.Func([], [FileResult], []),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], []),
    'hideUserSpace' : IDL.Func([TokenId], [NftResult], []),
    'http_request' : IDL.Func([Request], [Response], ['query']),
    'listUserFileIds' : IDL.Func([], [FileResult], ['query']),
    'listUserFileIdsAndNames' : IDL.Func([], [FileResult], ['query']),
    'listUserFileNames' : IDL.Func([], [FileResult], ['query']),
    'logoDip721' : IDL.Func([], [LogoResult], ['query']),
    'metadata' : IDL.Func([TokenIdentifier__1], [Result_3], ['query']),
    'mintDip721' : IDL.Func([IDL.Principal, MetadataDesc], [MintReceipt], []),
    'mintNFT' : IDL.Func([ExtMintRequest], [], []),
    'nameDip721' : IDL.Func([], [IDL.Text], ['query']),
    'ownerOfDip721' : IDL.Func([TokenId], [OwnerResult], ['query']),
    'safeTransferFromDip721' : IDL.Func(
        [IDL.Principal, IDL.Principal, TokenId],
        [TxReceipt],
        [],
      ),
    'submitSignUpForm' : IDL.Func([SignUpFormInput], [IDL.Text], []),
    'supply' : IDL.Func([TokenIdentifier__1], [Result_2], ['query']),
    'supportedInterfacesDip721' : IDL.Func(
        [],
        [IDL.Vec(InterfaceId)],
        ['query'],
      ),
    'symbolDip721' : IDL.Func([], [IDL.Text], ['query']),
    'tokens' : IDL.Func([AccountIdentifier__1], [Result_1], ['query']),
    'tokens_ext' : IDL.Func([AccountIdentifier__1], [Result], ['query']),
    'totalSupplyDip721' : IDL.Func([], [IDL.Nat64], ['query']),
    'transfer' : IDL.Func([TransferRequest], [TransferResponse], []),
    'transferFromDip721' : IDL.Func(
        [IDL.Principal, IDL.Principal, TokenId],
        [TxReceipt],
        [],
      ),
    'updateSpaceEntityId' : IDL.Func([TokenId, IDL.Text], [NftResult], []),
    'updateUserSpace' : IDL.Func([UpdateMetadataValuesInput], [NftResult], []),
    'uploadUserFile' : IDL.Func([IDL.Text, File], [FileResult], []),
  });
  return PersonalWebSpace;
};
export const init = ({ IDL }) => {
  const LogoResult = IDL.Record({ 'data' : IDL.Text, 'logo_type' : IDL.Text });
  const Dip721NonFungibleToken = IDL.Record({
    'maxLimit' : IDL.Nat16,
    'logo' : LogoResult,
    'name' : IDL.Text,
    'symbol' : IDL.Text,
  });
  return [IDL.Principal, Dip721NonFungibleToken];
};
