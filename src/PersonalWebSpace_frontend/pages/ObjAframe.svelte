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
    /* const iframeElement = document.createElement('iframe');
    iframeElement.src = 'https://aframe.io/';
    iframeElement.style.height = "200px";
    iframeElement.style.width = "200px"; */
    
    setTimeout(async () => {
      const iframeElement = document.getElementById("my-interface");
      console.log("iframeElement");
      console.log(iframeElement);
      let entityElement = document.getElementById("aentityhtml");
      console.log("entityElement");
      console.log(entityElement);
      let divIframe = document.getElementById("canvasContainer");
      console.log("divIframe");
      console.log(divIframe);
      /* const newDiv = document.createElement('div');
      newDiv.style.height = "200px";
      newDiv.style.width = "200px";
      newDiv.appendChild(iframeElement);
      divIframe.appendChild(iframeElement); */
      const imgIframe = await html2canvas(iframeElement);
      console.log("imgIframe");
      console.log(imgIframe);
      divIframe.innerHTML = "";
      divIframe.appendChild(imgIframe);
      /* const imgEntity = html2canvas(document.getElementById("my-interface"));
      console.log("imgEntity");
      console.log(imgEntity); */
      /* let divEntity = document.getElementById("divEntity");
      console.log("divEntity");
      console.log(divEntity);
      divEntity.appendChild(imgEntity); */
      entityElement.setAttribute("html", "cursor:#cursor;html:#my-interface");
    }, 5000);
  };

  onMount(addAFrameSceneFromModel);
</script>

{#if spaceString}
  <div style="position: absolute; height: 100%; width: 100%;">
    {@html spaceString}
  </div>
{/if}
