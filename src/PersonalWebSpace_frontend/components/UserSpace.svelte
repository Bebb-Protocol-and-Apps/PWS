<script>
  import { canisterId as PersonalWebSpace_frontend_canister_id } from "canisters/PersonalWebSpace_frontend";
  import { onMount } from "svelte";

  export let space

  const spaceURL = `https://${PersonalWebSpace_frontend_canister_id}.raw.ic0.app/#/space/${space.id}`;

// Extract metadata fields from Space NFT
  let spaceName = "";
  let spaceDescription = "";
  let ownerName = "";
  let ownerContactInfo = "";
  let creationTime;

  const extractSpaceMetadata = () => {
    if (space.metadata) {
      for (var j = 0; j < space.metadata[0].key_val_data.length; j++) {
        let fieldKey = space.metadata[0].key_val_data[j].key;
        if (fieldKey === "spaceName") {
          spaceName = space.metadata[0].key_val_data[j].val.TextContent;
        } else if (fieldKey === "spaceDescription") {
          spaceDescription = space.metadata[0].key_val_data[j].val.TextContent;
        } else if (fieldKey === "ownerName") {
          ownerName = space.metadata[0].key_val_data[j].val.TextContent;      
        } else if (fieldKey === "ownerContactInfo") {
          ownerContactInfo = space.metadata[0].key_val_data[j].val.TextContent;      
        } else if (fieldKey === "creationTime") {
          creationTime = new Date(Number(space.metadata[0].key_val_data[j].val.Nat64Content) / 1000000); 
        }
      };
    };
  };

  onMount(extractSpaceMetadata);
</script>

<div class="responsive">
  <div class="space space-y-1"> 
    <a target="_blank" rel="noreferrer" href={spaceURL} >
      <iframe src={spaceURL} title="Your flaming hot Personal Web Space" width="100%" height="auto"></iframe>
    </a>
    <button on:click={() => window.open(spaceURL,"_blank")} class="active-app-button bg-slate-500 text-white py-2 px-4 rounded font-semibold">View</button>
    <button type="button" class="space-details-collapsible bg-slate-500 text-white py-2 px-4 rounded font-semibold">See Details</button>
    <div class="space-details-content">
      <p>Owner: {space.owner}</p>
      <p>Owner Name: {ownerName}</p>
      <p>Owner Contact Info: {ownerContactInfo}</p>
      <p>Space Name: {spaceName}</p>
      <p>Space Description: {spaceDescription}</p>
      <p>Creation Time: {creationTime}</p>
    </div>  
  </div>
</div>
