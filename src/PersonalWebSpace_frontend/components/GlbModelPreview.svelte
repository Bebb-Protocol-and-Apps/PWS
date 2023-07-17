<script>
  import { getStringForSpaceFromModel, getStringForSpaceFromUserUploadedModel } from "../helpers/space_helpers";

  export let modelUrl;
  export let modelType;
  modelUrl = modelUrl;

// Note: HTML as string in Svelte needs the ending script tag to be escaped (see https://github.com/sveltejs/svelte/issues/5810)
  let glbModelPreviewString = modelType === "WebHosted" 
    ? getStringForSpaceFromModel(modelUrl)
    : getStringForSpaceFromUserUploadedModel();
</script>
<div class="glb-model-space-preview space-y-1">
  <iframe srcdoc={glbModelPreviewString} title="Preview of the Glb Model" width="100%" height="auto" class="py-2"></iframe>
</div>

<style>
  .glb-model-space-preview {
    border: 1px solid white;
    border-radius: 10px;
    margin-bottom: 2vmin;
    padding: 2vmin;
    width: 100%;
    height: auto;
  }
</style>





