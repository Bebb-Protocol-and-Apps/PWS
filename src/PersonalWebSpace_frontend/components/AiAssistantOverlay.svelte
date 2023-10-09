<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  import { addElementToSpace } from '../helpers/ai_assistant_helpers.js';

  export let viewerIsSpaceOwner: Boolean = false;

  const aiAssistantUrl = "https://xfl6h-3qaaa-aaaai-acq3a-cai.icp0.io/#/embedagent"; // TODO
  
  const allowedOrigins = [
    "https://xfl6h-3qaaa-aaaai-acq3a-cai.icp0.io",
  ];
  
  const handleMessage = async (event) => {
    // Check if event.origin is in allowedOrigins
    if (!allowedOrigins.includes(event.origin)) return;

    const { action, data } = event.data;
    console.log("Debug handleMessage ", action, data);
    if (action === 'addElementToSpace') {
      console.log("Heeeyaa");
      addElementToSpace(data);
    };
  };

  onMount(() => {
    window.addEventListener('message', handleMessage);
  });

  onDestroy(() => {
    console.log("Debug in onDestroy");
    window.removeEventListener('message', handleMessage);
  });
</script>

<div class="ai-assistant-overlay">
  <iframe src={aiAssistantUrl} title="AI Assistant window" width="100%" height="100%"></iframe>
  {#if viewerIsSpaceOwner}
    <p>You can configure this assistant on the DeVinci app</p>
  {/if}
  <button on:click={() => window.open(aiAssistantUrl,'_blank')} class="active-app-button bg-slate-500 text-white py-2 px-4 rounded">Go to DeVinci</button>
</div>

<style>
  .ai-assistant-overlay {
    border: 1px solid white;
    border-radius: 10px;
    z-index: 10;
    position: relative;
    height: 20%; 
    width: 30%;
    margin-left: 4%;
    margin-top: 2%;
    text-align: center;
    padding-top: 0.5em;
    background: #1d1d2f;
    opacity: 70%;
    color: #eef;
  }
</style>
