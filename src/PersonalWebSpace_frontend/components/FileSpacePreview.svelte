<script>
  import MediaContentPreview from "./MediaContentPreview.svelte";
  import GlbModelPreview from "./GlbModelPreview.svelte";

  import { appDomain } from "../store";
  import { supportedImageExtensions, supportedVideoExtensions, supported3dModelExtensions } from "../helpers/utils";

  import { canisterId as backendCanisterId } from "canisters/PersonalWebSpace_backend";

  export let fileToPreview;
  export let is360Degree;

  is360Degree = is360Degree;

  let isImage = false;
  let isVideo = false;
  let isModel = false;

  let fileToPreviewURL;
  let files = [];

  if (fileToPreview && fileToPreview.file_name) {
    fileToPreviewURL = process.env.DFX_NETWORK === "local"
      ? `http://127.0.0.1:4943/file/fileId=${fileToPreview.file_id}?canisterId=${backendCanisterId}` // e.g. http://127.0.0.1:4943/file/fileId=888?canisterId=bkyz2-fmaaa-aaaaa-qaaaq-cai
      : `https://${backendCanisterId}.raw${appDomain}/file/fileId=${fileToPreview.file_id}`; // e.g. https://vee64-zyaaa-aaaai-acpta-cai.raw.ic0.app/file/fileId=777

    const fileToPreviewObject = {
      id: fileToPreview.file_id,
      name: fileToPreview.file_name,
      url: fileToPreviewURL,
    };
    files = [fileToPreviewObject];

  // Note: HTML as string in Svelte needs the ending script tag to be escaped (see https://github.com/sveltejs/svelte/issues/5810)
    const imageExtensions = supportedImageExtensions;
    const videoExtensions = supportedVideoExtensions;
    const modelExtensions = supported3dModelExtensions;

    const fileName = fileToPreview.file_name;
    isImage = imageExtensions.some(ext => fileName.endsWith(ext));
    isVideo = videoExtensions.some(ext => fileName.endsWith(ext));
    isModel = modelExtensions.some(ext => fileName.endsWith(ext));
  };
</script>
<div class="my-file-space-preview space-y-1">
  {#key fileToPreview}
    {#if isImage}
      <!-- 360-degree toggle -->
      <div class="py-2">
        <input type="checkbox" bind:checked={is360Degree} id="360Toggle">
        <label for="360Toggle" class="ml-2">Set as 360-degree item</label>
      </div>
      {#key is360Degree} 
        <MediaContentPreview contentUrl={fileToPreviewURL} contentFiles={files} is360Degree={is360Degree}/>
      {/key}
    {:else if isVideo}
      <!-- 360-degree toggle -->
      <div class="py-2">
        <input type="checkbox" bind:checked={is360Degree} id="360Toggle">
        <label for="360Toggle" class="ml-2">Set as 360-degree item</label>
      </div>
      {#key is360Degree} 
        <MediaContentPreview contentUrl={fileToPreviewURL} contentFiles={files} is360Degree={is360Degree}/>
      {/key}    
    {:else if isModel}
      <GlbModelPreview modelUrl={fileToPreviewURL} modelType={"WebHosted"}/>
    {:else}
      <p>Not a supported file extension. Please choose another file.</p>
    {/if}
  {/key}
</div>

<style>
  .media-content-space-preview {
    border: 1px solid white;
    border-radius: 10px;
    margin-bottom: 2vmin;
    padding: 2vmin;
    width: 100%;
    height: auto;
  }
</style>





