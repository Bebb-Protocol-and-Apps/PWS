# Web Space NFT format

Space NFT looks like:
```bash
  {
    owner: Principal;
    id: TokenId;
    metadata: MetadataDesc;
  }
```

Types.MetadataDesc for this project looks like:
```bash
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
```