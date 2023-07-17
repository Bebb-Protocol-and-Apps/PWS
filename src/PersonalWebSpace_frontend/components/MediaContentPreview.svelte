<script>
  import { getStringForSpaceFromImageFile, getStringForSpaceFromVideoFile } from "../helpers/space_helpers";

  export let contentUrl;
  export let contentFiles;
  contentFiles = contentFiles;

// Note: HTML as string in Svelte needs the ending script tag to be escaped (see https://github.com/sveltejs/svelte/issues/5810)
  let mediaContentPreviewString
  if (contentFiles[0].name.endsWith('.jpg')) {
    mediaContentPreviewString = getStringForSpaceFromImageFile(contentUrl);
  } else if (contentFiles[0].name.endsWith('.jpeg')) {
    mediaContentPreviewString = getStringForSpaceFromImageFile(contentUrl);
  } else if (contentFiles[0].name.endsWith('.png')) {
    mediaContentPreviewString = getStringForSpaceFromImageFile(contentUrl);
  } else if (contentFiles[0].name.endsWith('.gif')) {
    mediaContentPreviewString = getStringForSpaceFromImageFile(contentUrl);
  } else if (contentFiles[0].name.endsWith('.svg')) {
    mediaContentPreviewString = getStringForSpaceFromImageFile(contentUrl);
  } // Video file
  else if (contentFiles[0].name.endsWith('.mp4')) {
    mediaContentPreviewString = getStringForSpaceFromVideoFile(contentUrl);
  } else if (contentFiles[0].name.endsWith('.mov')) {
    mediaContentPreviewString = getStringForSpaceFromVideoFile(contentUrl);
  } else {
    mediaContentPreviewString = getStringForSpaceFromVideoFile(contentUrl);
  };
</script>
<div class="media-content-space-preview space-y-1">
  <iframe srcdoc={mediaContentPreviewString} title="Preview of the File's Content" width="100%" height="auto" class="py-2"></iframe>
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





