<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from 'three';
  import { OBJLoader  } from 'three/examples/jsm/loaders/OBJLoader.js';
  import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
  
  const addSceneFromModel = async () => {
  //https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_obj_mtl.html

    console.log('in ObjTest addSceneFromModel');
    const scene = new THREE.Scene();  
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 3
    const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
    scene.add( ambientLight );
    const pointLight = new THREE.PointLight( 0xffffff, 0.8 );
    pointLight.position.set(2.5, 7.5, 15)
    scene.add( pointLight );
    camera.add( pointLight );
    scene.add( camera );

    function loadModel() {

      object.traverse( function ( child ) {

        if ( child.isMesh ) child.material.map = texture;

      } );

      object.position.y = - 95;
      scene.add( object );
    }

    const manager = new THREE.LoadingManager( loadModel );
    //const textureLoader = new THREE.TextureLoader( manager );
    //const texture = textureLoader.load( 'textures/uv_grid_opengl.jpg' );
    //const modelLoader = new OBJLoader(manager);
    const modelLoader = new OBJLoader();
    modelLoader.load('workshopSet.obj', function ( workshopObject ) {
      console.log('workshopObject', workshopObject);
      //workshopObject.position.y = - 95;

      scene.add(workshopObject);

    }, undefined, function ( error ) {

      console.error( error );

    } );

    const onProgress = function ( xhr ) {

      if ( xhr.lengthComputable ) {

        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

      }

    };

    new MTLLoader()
            //.setPath( './' )
            .load( 'workshopSet.mtl', function ( materials ) {

              materials.preload();

              new OBJLoader()
                .setMaterials( materials )
                //.setPath( 'models/obj/male02/' )
                .load( 'workshopSet.obj', function ( object ) {

                  object.position.y = - 95;
                  scene.add( object );

                }, onProgress, function ( error ) {

                  console.error( error );
              
                } );

            } );

    const renderer = new THREE.WebGLRenderer();
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    //document.body.appendChild( renderer.domElement );
    //document.body = renderer.domElement;
    //document.write(renderer.domElement);
    var code_container = document.createElement("div");
    code_container.appendChild( renderer.domElement );
    document.body.replaceChildren( renderer.domElement )
    //document.getElementsByTagName('body')[0].replaceChildren = code_container;
    camera.lookAt( scene.position );
    renderer.render(scene, camera);

    function animate() {
      requestAnimationFrame( animate );
      renderer.render(scene, camera);
    }
    animate();
  };

  onMount(addSceneFromModel);
</script>
