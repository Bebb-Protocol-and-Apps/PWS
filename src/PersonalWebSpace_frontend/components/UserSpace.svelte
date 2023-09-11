<script lang="ts">
  import type { BridgeInitiationObject } from "src/integrations/BebbProtocol/bebb.did";
  import { canisterId as PersonalWebSpace_frontend_canister_id } from "canisters/PersonalWebSpace_frontend";
  import { onMount } from "svelte";

  import { store, appDomain } from "../store";

  export let space;
  export let entityIdToLinkTo: string = ""; // If Entity Id is provided, Space should include a Link button to that Entity
  export let spaceIframeHeight: string = "auto";

  const spaceURL =
    process.env.NODE_ENV !== "development"
      ? `https://${PersonalWebSpace_frontend_canister_id}${appDomain}/#/space/${space.id}`
      : `#/space/${space.id}`;
      //: `http://localhost:4943/?canisterId=${PersonalWebSpace_frontend_canister_id}#/space/${space.id}`;

// Check whether the current space viewer is its owner
  const isViewerSpaceOwner = () => {
    if ($store.principal && space.owner) {
      return $store.principal.toText() === space.owner.toText();
    };
    return false;   
  };

// Extract Space's Entity Id in Bebb Protocol from Space NFT
  const extractSpaceEntityId = () => {
    if (space && space.metadata && space.metadata.length > 0) {
      for (var j = 0; j < space.metadata[0].key_val_data.length; j++) {
        let fieldKey = space.metadata[0].key_val_data[j].key;
        if (fieldKey === "protocolEntityId") {
          return space.metadata[0].key_val_data[j].val.TextContent;
        };
      };
    };
  };

// Owner submitted form to create a new space neighbor
  let linkCreationInProgress = false;
  let successfullyCreatedLink = false;
  let errorCreatingLink = false;

  const linkUserSpace = async () => {
    linkCreationInProgress = true;
    const spaceEntityId = extractSpaceEntityId();
    if (entityIdToLinkTo !== "" && spaceEntityId) {
      // Create link as Bridge from Space in Bebb Protocol
      const bridgeEntityInitiationObject : BridgeInitiationObject = {
        settings: [],
        name: [],
        description: [`Created to connect two Spaces as Neighbors in the Open Internet Metaverse at https://${PersonalWebSpace_frontend_canister_id}${appDomain}/`] as [string],
        keywords: [["Space Neighbors", "Open Internet Metaverse", "Virtual Neighborhood"]] as [Array<string>],
        entitySpecificFields: [],
        bridgeType: { 'IsRelatedto' : null },
        fromEntityId: spaceEntityId,
        toEntityId: entityIdToLinkTo,
      };
      try {
          const createBridgeResponse = await $store.protocolActor.create_bridge(bridgeEntityInitiationObject);
          // @ts-ignore
          if (createBridgeResponse && createBridgeResponse.Ok) {
            successfullyCreatedLink = true;
          } else {
            errorCreatingLink = true;
          };
      } catch(err) {
        console.error("Link Space err", err);
        errorCreatingLink = true;
      };
    };
    linkCreationInProgress = false;
  };

// Delete user space (owner only with confirmation as non-reversible)
  let spaceWasDeleted = false;
  const deleteUserSpace = async () => {
    if (!isViewerSpaceOwner()) {
      alert("You are not the owner of this Space!");
      return;
    } else {
      if (confirm("Are you sure you want to delete this Space? This is not reversible!")) {
        try {
          const deleteSpaceResponse = await $store.backendActor.hideUserSpace(space.id);
          // @ts-ignore
          if (deleteSpaceResponse && deleteSpaceResponse.Ok) {
            spaceWasDeleted = true;
            alert("Space deleted successfully!");
          } else {
            // @ts-ignore
            console.error("Delete Space deleteSpaceResponse.Err", deleteSpaceResponse.Err);
            alert("Space deletion failed! Please try again.");
          };
        } catch(err) {
          console.error("Delete Space err", err);
          alert("Space deletion failed!");
        };
      };
    };
  };

// Extract metadata fields from Space NFT
  let spaceName = "";
  let spaceDescription = "";
  let ownerName = "";
  let ownerContactInfo = "";
  let creationTime;

  const extractSpaceMetadata = () => {
    if (space && space.metadata && space.metadata.length > 0) {
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
    <iframe src={spaceURL} title="Your flaming hot Personal Web Space" width="100%" height={spaceIframeHeight} referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin"></iframe>
    {#if isViewerSpaceOwner() && entityIdToLinkTo !== ""}
      {#if linkCreationInProgress}
        <button disabled class="bg-slate-500 text-white py-2 px-4 rounded font-bold opacity-50 cursor-not-allowed">Linking...</button>
      {:else}
        {#if successfullyCreatedLink}
          <button disabled class="bg-slate-500 text-white py-2 px-4 rounded font-bold opacity-50 cursor-not-allowed">Linked</button>
        {:else}
          <button on:click={() => linkUserSpace()} class="active-app-button bg-slate-500 text-white py-2 px-4 rounded font-semibold">Link</button>
          {#if errorCreatingLink}
            <h3 class="py-4 items-center leading-8 text-center text-xl font-bold">Unlucky, the linking didn't work. Please give it another try.</h3>
          {/if}
        {/if}
      {/if}
    {/if}
    <button on:click={() => window.open(spaceURL,"_blank")} class="active-app-button bg-slate-500 text-white py-2 px-4 rounded font-semibold">View</button>
    {#if isViewerSpaceOwner()}
      {#if spaceWasDeleted}
        <button disabled class="bg-slate-500 text-white py-2 px-4 rounded font-semibold opacity-50 cursor-not-allowed">Deleted</button>
      {:else}
        <button on:click={() => deleteUserSpace()} class="active-app-button bg-slate-500 text-white py-2 px-4 rounded font-semibold">Delete</button>
      {/if}
    {/if}
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
