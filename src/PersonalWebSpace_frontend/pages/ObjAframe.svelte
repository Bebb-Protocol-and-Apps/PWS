<script lang="ts">
  import { onMount } from "svelte";

  let spaceString;
  
  const addAFrameSceneFromModel = async () => {
    console.log('in ObjAframe addAFrameSceneFromModel');
    //https://github.com/aframevr/aframe/blob/master/docs/components/obj-model.md
    //https://www.futurelearn.com/info/courses/a-beginners-guide-to-creating-a-webvr-experience-using-aframe/0/steps/328745
    //https://jgbarah.github.io/aframe-playground/figures-04/
    const resp = await fetch("aframeobj.html");
    //const resp = await fetch("chatgpt.html");
    //console.log('in index addAFrameSceneFromModel resp', resp);
    spaceString = await resp.text();
    //console.log('in index addAFrameSceneFromModel html', html);
    //document.write(html);
  };

  onMount(addAFrameSceneFromModel);
</script>

{#if spaceString}
  <div style="position: absolute; height: 100%; width: 100%;">
    {@html spaceString}
  </div>
{/if}
