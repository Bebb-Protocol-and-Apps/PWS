<script lang="ts">
    import { store } from "../store";

    import spinner from "../assets/loading.gif";

    export let spaceMetadata;

// Check whether the current space viewer is its owner
    const isViewerSpaceOwner = () => {
        return $store.principal.toText() === spaceMetadata.spaceOwnerPrincipal.toText();    
    };

// Editable Space Info fields
    let updatedOwnerName : string = spaceMetadata.ownerName;
    let updatedOwnerContactInfo : string = spaceMetadata.ownerContactInfo;
    let updatedSpaceDescription : string = spaceMetadata.spaceDescription;
    let updatedSpaceName : string = spaceMetadata.spaceName;

// User submitted form to update Space Info
    let spaceInfoUpdateInProgress = false;

    const submitUpdateSpaceInfoForm = async () => {
        console.log("in submitUpdateSpaceInfoForm spaceMetadata", spaceMetadata);
        spaceInfoUpdateInProgress = true;
        // Write space's updated metadata to backend canister (HTML stays the same)
        let updateInput = {
            id: spaceMetadata.id,
            updatedSpaceData: [], // Don't update the space data for display
            updatedOwnerName,
            updatedOwnerContactInfo,
            updatedSpaceDescription,
            updatedSpaceName,
        };
        console.log("in submitUpdateSpaceInfoForm updateInput", updateInput);
        try {
            // @ts-ignore
            await $store.backendActor.updateUserSpace(updateInput); // Authenticated call; only space owner may update it
        } catch (error) {
            console.log("Error in updateUserSpace", error);                        
        }
        spaceInfoUpdateInProgress = false;
        console.log("in submitUpdateSpaceInfoForm after");
    };
</script>

<div class="spaceInfoView max-h-screen overflow-y-auto">
    {#if isViewerSpaceOwner()}
      <form on:submit|preventDefault={() => submitUpdateSpaceInfoForm()}>
        <p>Space Name:</p>
        <input
            bind:value={updatedSpaceName}
            placeholder={updatedSpaceName}
            class="spaceInfoInput text-black font-bold"
        />
        <p>Space Description:</p>
        <input
            bind:value={updatedSpaceDescription}
            placeholder={updatedSpaceDescription}
            class="spaceInfoInput text-black font-bold"
        />
        <p>Owner Name:</p>
        <input
            bind:value={updatedOwnerName}
            placeholder={updatedOwnerName}
            class="spaceInfoInput text-black font-bold"
        />
        <p>Owner Contact Info:</p>
        <input
            bind:value={updatedOwnerContactInfo}
            placeholder={updatedOwnerContactInfo}
            class="spaceInfoInput text-black font-bold"
        />
        <!-- Non-editable fields -->
        <p>Space Creation Time: {spaceMetadata.creationTime}</p>
        <p>Owner Principal: {spaceMetadata.spaceOwnerPrincipal}</p>

        {#if spaceInfoUpdateInProgress}
          <button disabled class="bg-slate-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">Update!</button>
          <img class="h-12 mx-auto" src={spinner} alt="loading animation" />
        {:else}
          <button type="submit" class="active-app-button bg-slate-500 text-white py-2 px-4 rounded font-semibold">Update!</button>
        {/if}
      </form>
    {:else}
      <p>Space Name: {updatedSpaceName}</p>
      <p>Space Description: {updatedSpaceDescription}</p>
      <p>Space Creation Time: {spaceMetadata.creationTime}</p>
      <p>Owner Principal: {spaceMetadata.spaceOwnerPrincipal}</p>
      <p>Owner Name: {updatedOwnerName}</p>
      <p>Owner Contact Info: {updatedOwnerContactInfo}</p>
      <!-- <p>About Owner: {spaceMetadata.aboutDescription}</p> -->
    {/if}
</div>

<style>
    div.spaceInfoView {
      z-index: 20;
      position: relative;
      height: 60%; 
      width: 50%;
      margin: auto;
      text-align: center;
      font-size: 1.5em;
      letter-spacing: 0.15em;
      padding: 1em;
      padding-top: 0;
      background: #1d1d2f;
      opacity: 80%;
      color: #eef;
    }
    .spaceInfoInput {
        width: 100%;
    }
</style>
