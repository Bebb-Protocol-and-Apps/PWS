<script>
  import {
    getStringForSpaceFrom360ImageFile,
    getStringForSpaceFrom360VideoFile,
    getStringForSpaceFromImageFile,
    getStringForSpaceFromVideoFile
  } from "../helpers/space_helpers";

  import { supportedImageExtensions, supportedVideoExtensions } from "../helpers/utils";

  export let contentUrl;
  export let contentFiles;
  export let is360Degree = false;
  contentFiles = contentFiles;

// Note: HTML as string in Svelte needs the ending script tag to be escaped (see https://github.com/sveltejs/svelte/issues/5810)
  const imageExtensions = supportedImageExtensions;
  const videoExtensions = supportedVideoExtensions;

  const fileName = contentFiles[0].name;
  const isImage = imageExtensions.some(ext => fileName.endsWith(ext));
  const isVideo = videoExtensions.some(ext => fileName.endsWith(ext));
  
  let mediaContentPreviewString;
  if (isImage && is360Degree) {
    mediaContentPreviewString = getStringForSpaceFrom360ImageFile(contentUrl);
  } else if (isImage) {
    mediaContentPreviewString = getStringForSpaceFromImageFile(contentUrl);
  } else if (isVideo && is360Degree) {
    mediaContentPreviewString = getStringForSpaceFrom360VideoFile(contentUrl);
  } else if (isVideo) {
    mediaContentPreviewString = getStringForSpaceFromVideoFile(contentUrl);
  } else {
    mediaContentPreviewString = getStringForSpaceFromImageFile(contentUrl);
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





