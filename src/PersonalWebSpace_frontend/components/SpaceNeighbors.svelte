<script lang="ts">
    import type { Principal } from "@dfinity/principal";
    import type { EntityInitiationObject, BridgeInitiationObject, EntityAttachedBridgesResult, EntityAttachedBridges, Bridge, Entity } from "src/integrations/BebbProtocol/bebb.did";
    import { onMount } from "svelte";
    import ProtocolEntity from "./ProtocolEntity.svelte";
    import UserSpaces from "./UserSpaces.svelte";

    import { store, appDomain } from "../store";

    import { initiateCollapsibles } from "../helpers/space_helpers.js";

    import { canisterId as PersonalWebSpace_frontend_canister_id } from "canisters/PersonalWebSpace_frontend";

    import spinner from "../assets/loading.gif";

    export let spaceNft;

    let loadingInProgress = true;
    let neighborsLoadingError = false;
    let neighborsLoaded = false;
    let neighborEntities = [];

    let addNeighborButtonActive = true;
    let newNeighborFormActive = false;
    let newNeighborUrl : string = "";
    let neighborUrlIsValid = false;
    let neighborCreationInProgress = false;
    let successfullyAddedNeighbor = false;
    let errorAddingNeighbor = false;

// Helper function to check whether the Space already has got any Neighbor connections
    const spaceHasNeighbors = () => {
        return neighborEntities.length > 0;
    };

// Helper functions to check whether a valid URL was provided in the new neighbor form
    const isValidUrl = (url) => {
    try {
      new URL(url);
    } catch (e) {
      console.error(e);
      return false;
    }
    return true;
  };

  const neighborUrlInputHandler = function(url) {
    if (!isValidUrl(url)) {
        neighborUrlIsValid = false;
        return false;
    };
    neighborUrlIsValid = true;
    return true;
  };

// Check whether the current space viewer is its owner
    const isViewerSpaceOwner = () => {
        return $store.principal.toText() === spaceNft.owner.toText();    
    };

// Owner clicked to add a new space neighbor
    const addNeighborButtonOnClick = () => {
        addNeighborButtonActive = false;
        newNeighborFormActive = true;
    };

// Owner submitted form to create a new space neighbor
    const submitAddNeighborForm = async () => {
        neighborCreationInProgress = true;
        const spaceEntityId = extractSpaceEntityId();
        if (neighborUrlInputHandler(newNeighborUrl) && spaceEntityId) {
            // Create Neighbor connection as Bridge from Space in Bebb Protocol
            const externalId : [string] = [newNeighborUrl];
            const entityInitiationObject : EntityInitiationObject= {
                settings: [],
                entityType: { 'Resource' : { 'Web' : null } },
                name: [],
                description: [`Created as a Space Neighbor in the Open Internet Metaverse at https://${PersonalWebSpace_frontend_canister_id}${appDomain}/`] as [string],
                keywords: [["Space Neighbor", "Open Internet Metaverse", "Virtual Neighborhood"]] as [Array<string>],
                entitySpecificFields: externalId,
            };

            const bridgeEntityInitiationObject : BridgeInitiationObject = {
                settings: [],
                name: [],
                description: [`Created to connect two Spaces as Neighbors in the Open Internet Metaverse at https://${PersonalWebSpace_frontend_canister_id}${appDomain}/`] as [string],
                keywords: [["Space Neighbors", "Open Internet Metaverse", "Virtual Neighborhood"]] as [Array<string>],
                entitySpecificFields: [],
                bridgeType: { 'IsRelatedto' : null },
                fromEntityId: spaceEntityId,
                toEntityId: "",
            };
            try {
                const createEntityResponse = await $store.protocolActor.create_entity(entityInitiationObject);
                // @ts-ignore
                if (createEntityResponse && createEntityResponse.Ok) {
                    // @ts-ignore
                    const newNeighborEntityId = createEntityResponse.Ok;
                    bridgeEntityInitiationObject.toEntityId = newNeighborEntityId;
                    const createBridgeResponse = await $store.protocolActor.create_bridge(bridgeEntityInitiationObject);
                    // @ts-ignore
                    if (createBridgeResponse && createBridgeResponse.Ok) {
                        successfullyAddedNeighbor = true;
                    } else {
                        errorAddingNeighbor = true;
                    };
                } else {
                    errorAddingNeighbor = true;
                };
            } catch(err) {
                console.error("Create Neighbor err", err);
                errorAddingNeighbor = true;
            };

            newNeighborFormActive = false;
            newNeighborUrl = "";
            neighborUrlIsValid = false;

            setTimeout(() => {
                addNeighborButtonActive = true;
                successfullyAddedNeighbor = false;
                errorAddingNeighbor = false;
                // Reload Neighbors
                loadSpaceNeighbors();
            }, 3000);
        };
        neighborCreationInProgress = false;
    };

// Helper function to find Bridge(s) between Space and a Neighbor
    const getBridgesBetweenEntities = async (spaceEntityId, neighborProtocolEntityId, bothBridgingDirections = false, includePendingBridges = false) : Promise<Bridge[]> => {
        if (neighborProtocolEntityId && spaceEntityId) {
            let getBridgesResponse : EntityAttachedBridgesResult;
            try {
                getBridgesResponse = await $store.protocolActor.get_from_bridge_ids_by_entity_id(spaceEntityId);
            } catch (error) {
                console.error("Error Getting Bridges", error);
                return null;                
            };
            // @ts-ignore
            if (getBridgesResponse && getBridgesResponse.Ok && getBridgesResponse.Ok.length > 0) {
                // Filter for Bridges to Neighbor
                // @ts-ignore
                const bridgesRetrieved : EntityAttachedBridges = getBridgesResponse.Ok;
                let getBridgeRequestPromises = [];
                for (var i = 0; i < bridgesRetrieved.length; i++) {
                    if (bridgesRetrieved[i] && bridgesRetrieved[i].id) {
                        getBridgeRequestPromises.push($store.protocolActor.get_bridge(bridgesRetrieved[i].id)); // Send requests in parallel and then await all to speed up
                    };
                };
                const getBridgeResponses = await Promise.all(getBridgeRequestPromises);
                const bridgesBetweenEntities : Bridge[] = [];
                for (var j = 0; j < getBridgeResponses.length; j++) {
                    if (getBridgeResponses[j].Err) {
                        console.error("Error retrieving Bridge", getBridgeResponses[j].Err);
                    } else {
                        const bridge : Bridge = getBridgeResponses[j].Ok;
                        if (bridge && bridge.id && bridge.toEntityId === neighborProtocolEntityId) {
                            bridgesBetweenEntities.push(bridge);
                        };
                    };
                };
                return bridgesBetweenEntities;
            };
        };
        return null;
    };

// Owner clicked to delete a Neighbor
    // neighborProtocolEntityId: internal id in Bebb Protocol of the Neighbor to be deleted
    const deleteSpaceNeighbor = async (neighborProtocolEntityId) => {
        const spaceEntityId = extractSpaceEntityId();
        if (neighborProtocolEntityId && spaceEntityId && isViewerSpaceOwner()) {
            // Find id of Bridge between Space's and Neighbor's Entities in Bebb Protocol (note: there might be multiple)
            const findBridgesResponse : Bridge[] = await getBridgesBetweenEntities(spaceEntityId, neighborProtocolEntityId);
            if (findBridgesResponse && findBridgesResponse.length > 0) {
                // Delete Bridge(s) in Bebb Protocol owned by Space owner
                let requestPromises = [];
                for (var i = 0; i < findBridgesResponse.length; i++) {
                    const bridgeId = findBridgesResponse[i].id;
                    if (bridgeId && findBridgesResponse[i].owner?.toText() === spaceNft.owner?.toText()) {
                        requestPromises.push($store.protocolActor.delete_bridge(bridgeId)); // Send requests in parallel and then await all to speed up
                    };
                };
                const deletionResponses = await Promise.all(requestPromises);
                for (var j = 0; j < deletionResponses.length; j++) {
                    if (deletionResponses[j].Err) {
                        console.error("Error deleting Space Neighbor", deletionResponses[j].Err);
                        return null;
                    };
                };
                return true;
            };
        };
        return null;
    };

// A visiting user (not the owner) wants to link one of their spaces to this space
    let showVisitorSpaces = false;
    let loadingVisitorSpaces = false;
    let numberOfSpacesVisitorOwns = 0;
    let loadedVisitorSpaces = [];

    const loadVisitorSpaces = async () => {
        const visitorSpaces = await $store.backendActor.getCallerSpaces();
        numberOfSpacesVisitorOwns = visitorSpaces.length;
        loadedVisitorSpaces = visitorSpaces;
        loadingVisitorSpaces = false;
    };

    const makeNeighborButtonOnClick = () => {
        showVisitorSpaces = true;
        loadingVisitorSpaces = true;
        loadVisitorSpaces();
    };

// Extract Space's Entity Id in Bebb Protocol from Space NFT
    const extractSpaceEntityId = () => {
        if (spaceNft && spaceNft.metadata && spaceNft.metadata.length > 0) {
            for (var j = 0; j < spaceNft.metadata[0].key_val_data.length; j++) {
                let fieldKey = spaceNft.metadata[0].key_val_data[j].key;
                if (fieldKey === "protocolEntityId") {
                    return spaceNft.metadata[0].key_val_data[j].val.TextContent;
                };
            };
        };
    };

    const loadSpaceNeighbors = async () => {
        const spaceEntityId = extractSpaceEntityId();
        let spaceNeighborsResponse : EntityAttachedBridgesResult;
        let retrievedNeighborEntities : Entity[] = [];
        try {
            try {
                spaceNeighborsResponse = await $store.protocolActor.get_from_bridge_ids_by_entity_id(spaceEntityId);
            } catch (error) {
                console.error("Error Getting Bridges", error);
                return null;                
            };
            // @ts-ignore
            if (spaceNeighborsResponse && spaceNeighborsResponse.Ok && spaceNeighborsResponse.Ok.length > 0) {
                // @ts-ignore
                const bridgesRetrieved : EntityAttachedBridges = spaceNeighborsResponse.Ok;
                const bridgeIds = [];
                let getBridgeRequestPromises = [];
                for (var i = 0; i < bridgesRetrieved.length; i++) {
                    if (bridgesRetrieved[i] && bridgesRetrieved[i].id && bridgesRetrieved[i].linkStatus.hasOwnProperty('CreatedOwner')) {
                        bridgeIds.push(bridgesRetrieved[i].id);
                        getBridgeRequestPromises.push($store.protocolActor.get_bridge(bridgesRetrieved[i].id)); // Send requests in parallel and then await all to speed up
                    };
                };
                const getBridgeResponses = await Promise.all(getBridgeRequestPromises);
                let getConnectedEntityRequestPromises = [];
                for (var j = 0; j < getBridgeResponses.length; j++) {
                    if (getBridgeResponses[j].Err) {
                        console.error("Error retrieving Bridge", getBridgeResponses[j].Err);
                    } else {
                        const bridge : Bridge = getBridgeResponses[j].Ok;
                        getConnectedEntityRequestPromises.push($store.protocolActor.get_entity(bridge.toEntityId)); // Send requests in parallel and then await all to speed up
                    };
                };
                const getConnectedEntityResponses = await Promise.all(getConnectedEntityRequestPromises);
                for (var j = 0; j < getConnectedEntityResponses.length; j++) {
                    if (getConnectedEntityResponses[j].Err) {
                        console.error("Error retrieving connected Entity", getConnectedEntityResponses[j].Err);
                    } else {
                        const connectedEntity : Entity = getConnectedEntityResponses[j].Ok;
                        retrievedNeighborEntities.push(connectedEntity);
                    };
                };
            };
        } catch(err) {
            console.error("Error getting SpaceNeighbors", err);
            neighborsLoadingError = true;
        };
        loadingInProgress = false;
        neighborEntities = retrievedNeighborEntities;
        neighborsLoaded = !neighborsLoadingError;
    };

    onMount(loadSpaceNeighbors);
</script>

<h3 class="pt-5 items-center leading-5 text-center text-lg font-semibold">Get to Know the Virtual Neighborhood!</h3>
{#if loadingInProgress}
    <h3 class="py-6 items-center leading-8 text-center text-2xl font-bold">Looking for the Neighbors...</h3>
{:else if neighborsLoadingError}
    <h3 class="py-6 items-center leading-8 text-center text-2xl font-bold">There was an error loading the Neighbors. Please try again.</h3>
{:else if neighborsLoaded}
    {#if spaceHasNeighbors()}
        <h3 class="py-6 items-center leading-8 text-center text-2xl font-bold">These are the Space's Neighbors:</h3>
    {:else}
        <h3 class="py-6 items-center leading-8 text-center text-2xl font-bold">This Space doesn't have any Neighbors yet. If you are the owner, why not set up your Virtual Neighborhood now?</h3>
    {/if}
    {#if isViewerSpaceOwner()}
        <div id='addNeighborContainer' class="space-y-3 py-4">
            {#if addNeighborButtonActive}
                <button class="active-app-button bg-slate-500 text-white py-2 px-4 rounded font-semibold" on:click={() => addNeighborButtonOnClick()}>
                    Add Neighbor
                </button>
            {:else}
                <button disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Add Neighbor</button>
            {/if}
            {#if newNeighborFormActive}
                <form on:submit|preventDefault={() => submitAddNeighborForm()}>
                    <input
                        bind:value={newNeighborUrl}
                        placeholder="Input the URL of the new Neighbor here (e.g. https://vdfyi-uaaaa-aaaai-acptq-cai.ic0.app/#/space/0)"
                        class="newNeighborUrlInput text-black font-bold"
                    />
                    {#if newNeighborUrl !== ""}
                        {#if neighborUrlInputHandler(newNeighborUrl)}
                            <a target="_blank" rel="noreferrer" href={newNeighborUrl} >
                                <iframe src={newNeighborUrl} title="Preview of the new Neighbor" width="100%" height="auto" class="py-2" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin"></iframe>
                            </a>
                            {#if neighborCreationInProgress}
                                <img class="h-12 mx-auto" src={spinner} alt="loading animation" />
                            {:else}
                                <button type=submit class="active-app-button bg-slate-500 text-white py-2 px-4 rounded font-semibold">Create!</button>
                            {/if}
                        {:else}
                            <button disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Create!</button>
                        {/if}
                    {/if}
                </form>
                {#if !neighborUrlIsValid}
                    <h3 class="py-4 items-center leading-8 text-center text-xl font-bold">Please provide a valid URL for the new Neighbor.</h3>
                {/if}
            {/if}
            {#if successfullyAddedNeighbor}
                <h3 class="py-4 items-center leading-8 text-center text-xl font-bold">Success: You've got a new Virtual Neighbor in the Open Internet Metaverse!</h3>
            {:else if errorAddingNeighbor}
                <h3 class="py-4 items-center leading-8 text-center text-xl font-bold">Unlucky, this didn't work. Please give it another shot.</h3>
            {/if}
        </div>
    {:else if $store.isAuthed}
        <div id='linkToThisSpaceContainer' class="space-y-3 py-4">
            <button class="active-app-button bg-slate-500 text-white py-2 px-4 rounded font-semibold" on:click={() => makeNeighborButtonOnClick()}>
                Make This Space My Neighbor
            </button>
            {#if showVisitorSpaces}
                {#if loadingVisitorSpaces}
                    <h3 class="py-4 items-center leading-8 text-center text-xl font-bold">Loading Your Spaces...</h3>
                {:else}
                    {#if numberOfSpacesVisitorOwns > 0}
                        <h3 class="py-4 items-center leading-8 text-center text-xl font-bold">These are Your Spaces. Please select which one to link to this Space:</h3>
                        <UserSpaces spaces={loadedVisitorSpaces} entityIdToLinkTo={extractSpaceEntityId()} />
                    {:else}
                        <h3 class="py-4 items-center leading-8 text-center text-xl font-bold">You currently don't own any Spaces. Please create Your first Open Internet Metaverse Space:</h3>
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <p class="linkToOim">
                            <a href="#create" target="_blank">Create My First Space</a>
                        </p>
                    {/if}
                {/if}
            {/if}
        </div>
    {/if}
    <div id='spaceNeighbors' class="space-y-4" use:initiateCollapsibles>
        {#each neighborEntities as neighborEntity}
            <ProtocolEntity entity={neighborEntity} viewerIsSpaceOwner={isViewerSpaceOwner()} deleteSpaceNeighborFunction={deleteSpaceNeighbor}/>
        {/each}
    </div>
{/if}

<style>
    .newNeighborUrlInput {
        width: 100%;
    }
    p.linkToOim {
      cursor: pointer;
      width: max-content;
      margin: 1rem auto;
    }
</style>
    