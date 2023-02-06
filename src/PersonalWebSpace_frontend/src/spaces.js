import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

async function addSceneFromModel() {
  const resp = await fetch("spaces.html");
  const html = await resp.text();
  document.documentElement.innerHTML = html;

  const canvas = document.querySelector(".webgl");
  //const canvas = document.querySelector("webgl");
  const scene = new THREE.Scene();
  const aspect = window.innerWidth / window.innerHeight;
  const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100);
  camera.position.z = 2;
  camera.position.set(2, 2, 2);
  camera.lookAt(0,0,0);
  scene.add(camera);

  /* const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x781CE5 });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh); */

  const ambient = new THREE.AmbientLight(0x404040, 5);
  const point = new THREE.PointLight(0xE4FF00, 1, 10);
  point.position.set(3, 3, 2);
  scene.add(ambient);
  scene.add(point);

  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderConfig({ type: 'js' });
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
  loader.setDRACOLoader( dracoLoader );

  loader.load( 'roomModel.glb', function ( gltf ) {

    scene.add( gltf.scene );

  }, undefined, function ( error ) {

    console.error( error );

  } );
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setClearColor(0x222222);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.render(scene, camera);

  function animate() {
    /* mesh.rotation.x += 0.003
    mesh.rotation.y += 0.004
    mesh.rotation.z += 0.005 */
    
    renderer.render(scene, camera)
    
    window.requestAnimationFrame(animate)
  }
    
  animate();
}

const addScene = async () => {
  const resp = await fetch("spaces.html");
  const html = await resp.text();
  //console.log('in spaces.js html');
  //console.log(html);
  document.write(html);
}

const addSceneFromSpace = async (spaceId) => {
  console.log('in spaces addSceneFromSpace');
  const spaceNFTResponse = await PersonalWebSpace_backend.getSpace(Number(spaceId));
  console.log('in spaces spaceNFTResponse');
  console.log(spaceNFTResponse);
  const spaceHtml = spaceNFTResponse.Ok.metadata[0].data;
  var string = new TextDecoder().decode(spaceHtml);
  console.log('in spaces string');
  console.log(string);
  document.write(string);
}

/* if (window.location.href.endsWith('/spaces')) {
  addScene();
} else if (window.location.href.includes('?spaceId=')) {
  const urlParams = new URLSearchParams(window.location.search);
  const spaceId = urlParams.get('spaceId');
  addSceneFromSpace(spaceId);
} */