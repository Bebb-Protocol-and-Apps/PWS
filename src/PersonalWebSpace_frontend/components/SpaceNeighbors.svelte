<script lang="ts">
    import type { Principal } from "@dfinity/principal";
    import type { BridgeState } from "src/integrations/BebbProtocol/newwave.did";
    import { onMount } from "svelte";
    import ProtocolEntity from "./ProtocolEntity.svelte";

    import { store } from "../store";

    import { initiateCollapsibles } from "../helpers/space_helpers.js";

    import spinner from "../assets/loading.gif";

    export let spaceNft;

    let loadingInProgress = true;
    let neighborsLoadingError = false;
    let neighborsLoaded = false;
    let neighborEntities = [];

    let addNeighborButtonActive = true;
    let newNeighborFormActive = false;
    let newNeighborUrl : string = "";
    let neighborUrlIsInvalid = false;
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

  const inputHandler = function(url) {
    if (!isValidUrl(url)) {
        neighborUrlIsInvalid = true;
        return false;
    };
    neighborUrlIsInvalid = false;
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
        if (inputHandler(newNeighborUrl)) {
            // Create Neighbor connection as Bridge from Space in Bebb Protocol
            const externalId : [string] = [newNeighborUrl];
            const entityInitiationObject = {
                _internalId: [],
                _creator: [$store.principal] as [Principal],
                _owner: [$store.principal] as [Principal],
                _settings: [],
                _entityType: { 'Webasset' : null },
                _name: [],
                _description: ["Created as a Space Neighbor in the Open Internet Metaverse at https://vdfyi-uaaaa-aaaai-acptq-cai.ic0.app/"] as [string],
                _keywords: [["Space Neighbor", "Open Internet Metaverse", "Virtual Neighborhood"]] as [Array<string>],
                _externalId: externalId,
                _entitySpecificFields: [],
            };

            const bridgeEntityInitiationObject = {
                _internalId: [],
                _creator: [$store.principal] as [Principal],
                _owner: [$store.principal] as [Principal],
                _settings: [],
                _entityType: { 'BridgeEntity' : null },
                _name: [],
                _description: ["Created to connect two Spaces as Neighbors in the Open Internet Metaverse at https://vdfyi-uaaaa-aaaai-acptq-cai.ic0.app/"] as [string],
                _keywords: [["Space Neighbors", "Open Internet Metaverse", "Virtual Neighborhood"]] as [Array<string>],
                _externalId: [],
                _entitySpecificFields: [],
                _bridgeType: { 'OwnerCreated' : null },
                _fromEntityId: extractSpaceEntityId(),
                _toEntityId: "",
                _state: [{ 'Confirmed' : null }] as [BridgeState],
            };
            try {
                // @ts-ignore
                const createEntityAndBridgeResponse = await $store.protocolActor.create_entity_and_bridge(entityInitiationObject, bridgeEntityInitiationObject);
                successfullyAddedNeighbor = true;
            } catch(err) {
                console.log("Create Neighbor err", err);
                errorAddingNeighbor = true;
            };

            newNeighborFormActive = false;
            newNeighborUrl = "";
            neighborUrlIsInvalid = false;

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

// Extract Space's Entity Id in Bebb Protocol from Space NFT
    const extractSpaceEntityId = () => {
        for (var j = 0; j < spaceNft.metadata[0].key_val_data.length; j++) {
            let fieldKey = spaceNft.metadata[0].key_val_data[j].key;
            if (fieldKey === "protocolEntityId") {
                return spaceNft.metadata[0].key_val_data[j].val.TextContent;
            };
        };
    };

    const loadSpaceNeighbors = async () => {
        const spaceEntityId = extractSpaceEntityId();
        let spaceNeighborsResponse = [];
        try {
            spaceNeighborsResponse = await $store.protocolActor.get_bridged_entities_by_entity_id(spaceEntityId, true, false, false);
        } catch(err) {
            console.log("SpaceNeighbors err", err);
            neighborsLoadingError = true;
        };
        loadingInProgress = false;
        neighborEntities = spaceNeighborsResponse;
        neighborsLoaded = true;
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
                <form on:submit={() => submitAddNeighborForm()}>
                    <input
                        bind:value={newNeighborUrl}
                        placeholder="Input the URL of the new Neighbor here (e.g. https://vdfyi-uaaaa-aaaai-acptq-cai.ic0.app/#/space/0)"
                        class="newNeighborUrlInput text-black font-bold"
                    />
                    {#if newNeighborUrl !== ""}
                        {#if inputHandler(newNeighborUrl)}
                            <iframe src={newNeighborUrl} title="Preview of the new Neighbor" width="100%" height="auto" class="py-2"></iframe>
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
                {#if neighborUrlIsInvalid}
                    <h3 class="py-4 items-center leading-8 text-center text-xl font-bold">Please provide a valid URL for the new Neighbor.</h3>
                {/if}
            {/if}
            {#if successfullyAddedNeighbor}
                <h3 class="py-4 items-center leading-8 text-center text-xl font-bold">Success: You've got a new Virtual Neighbor in the Open Internet Metaverse!</h3>
            {:else if errorAddingNeighbor}
                <h3 class="py-4 items-center leading-8 text-center text-xl font-bold">Unlucky, this didn't work. Please give it another shot.</h3>
            {/if}
        </div>
    {/if}
    <div id='spaceNeighbors' class="space-y-4" use:initiateCollapsibles>
        {#each neighborEntities as neighborEntity}
            <ProtocolEntity entity={neighborEntity} />
        {/each}
    </div>
{/if}

<style>
    .newNeighborUrlInput {
        width: 100%;
    }
</style>
