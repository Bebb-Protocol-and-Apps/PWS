<script lang="ts">
  import { onMount } from "svelte";

  let spaceString;
  
  const addAFrameSceneFromModel = async () => {
    console.log('in ObjAframe addAFrameSceneFromModel');
    //https://github.com/aframevr/aframe/blob/master/docs/components/obj-model.md
    //https://www.futurelearn.com/info/courses/a-beginners-guide-to-creating-a-webvr-experience-using-aframe/0/steps/328745
    //https://jgbarah.github.io/aframe-playground/figures-04/
    const resp = await fetch("aframeobj_html_fetch.html");
    //const resp = await fetch("chatgpt.html");
    //console.log('in index addAFrameSceneFromModel resp', resp);
    spaceString = await resp.text();
    //console.log('in index addAFrameSceneFromModel html', html);
    //document.write(html);
    console.log("################################");
    let response;
    response = await fetch("https://aframe.io/");
    console.log("response");
    console.log(response);
    console.log(response.body);
    console.log(response.bodyUsed);
    const responseText = await response.text();
    console.log(responseText);
    let iframeElement = document.getElementById("html-fetch-iframe");
    console.log("iframeElement");
    console.log(iframeElement);
    //iframeElement.innerHTML = responseText;
    iframeElement.srcdoc = responseText;
    let entityElement = document.getElementById("aentityhtml");
    console.log("entityElement");
    console.log(entityElement);
    entityElement.setAttribute("html", "cursor:#cursor;html:#my-interface");
    /* await setTimeout(() => {
      let iframeElement = document.getElementById("html-fetch-iframe");
      console.log("iframeElement");
      console.log(iframeElement);
      document.getElementById("html-fetch-iframe").innerHTML = responseText;
    }, 5000); */
  };

  onMount(addAFrameSceneFromModel);
</script>

{#if spaceString}
  <div style="position: absolute; height: 100%; width: 100%;">
    {@html spaceString}
  </div>
{/if}
