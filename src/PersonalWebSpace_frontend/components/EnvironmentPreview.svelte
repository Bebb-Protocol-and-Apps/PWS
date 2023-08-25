<script>
  import { getStringForSpaceWithEnvironment } from "../helpers/space_helpers";

  export let envToPreview;
  envToPreview = envToPreview;

// Note: HTML as string in Svelte needs the ending script tag to be escaped (see https://github.com/sveltejs/svelte/issues/5810)
  let environmentPreviewString = getStringForSpaceWithEnvironment(envToPreview);
</script>
<div class="environment-space-preview space-y-1">
  <iframe srcdoc={environmentPreviewString} title="Preview of the Environment" width="100%" height="auto" class="py-2"></iframe>
</div>

<style>
  .environment-space-preview {
    border: 1px solid white;
    border-radius: 10px;
    margin-bottom: 2vmin;
    padding: 2vmin;
    width: 100%;
    height: auto;
  }
</style>





