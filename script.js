import * as THREE from './modulos/three.module.js';
import { OrbitControls } from './modulos/OrbitControls.js';
import {GLTFLoader} from './modulos/GLTFLoader.js'
import {RGBELoader} from './modulos/RGBELoader.js'
import * as BEGIN from './helpers/begin.js';
import {Sound} from './helpers/audio.js';


let scene, camera, renderer, controls, loadManager, model;
let mixer, clips = [], clock = new THREE.Clock();
const hdrURL = new URL('./hdri/china.hdr', import.meta.url);
const canvas = document.querySelector('.webgl');
let buttonAudio = new Sound('./audio/button.mp3');
let songAudio = new Sound('./audio/song.mp3');

let pointer, raycaster;

const init = async () => {
    scene = BEGIN.createScene(THREE);
    camera = BEGIN.createPerspectiveCamera(THREE);
    scene.add(camera);
    renderer = BEGIN.createRenderer(THREE, canvas);
    controls = BEGIN.createOrbitControls(THREE, OrbitControls, camera, canvas);
    loadManager = BEGIN.createLoadManager(THREE, scene, camera, renderer);
    BEGIN.loadHDRI(THREE, RGBELoader, loadManager, hdrURL, scene);
    //BEGIN.lighting(THREE, scene);

    model = await BEGIN.cargarModelo('./3dmodel/player.glb', GLTFLoader, loadManager);
    scene.add(model.scene)

    mixer = new THREE.AnimationMixer(model.scene);  
    for ( let clip of model.animations){
        const action = mixer.clipAction(clip);
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce;
        clips.push(action)
    }
    
    pointer = new THREE.Vector2();
    raycaster = new THREE.Raycaster();

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    mixer.update(delta);
    controls.update();
    renderer.render( scene, camera );
};
init();


let play = false;
let stop = false;
window.addEventListener('pointerdown', event => {
    pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children)
    //console.log(intersects[0]?.object.name)

    if(intersects[0]?.object.name == "Play"){
        //con estas 2 instrucciones solucionamos un poco el movimiento de la camara
        //cuando clickeamos un boton
        controls.enabled = false;
        setTimeout(() => controls.enabled = true, 300)
        buttonAudio.play();  
        if(!play){
            animationPlay(clips[1], 1);
            setTimeout(() => songAudio.play(), 300)
        }else{
            animationPlay(clips[1], -1);
            setTimeout(() => songAudio.pause(), 100)
        }
        if(stop){
            animationPlay(clips[0], -1)
            stop = !stop
        }
        play = !play      
    }
    if(intersects[0]?.object.name == "Stop"){
        //con estas 2 instrucciones solucionamos un poco el movimiento de la camara
        //cuando clickeamos un boton
        controls.enabled = false;
        setTimeout(() => controls.enabled = true, 300)

        buttonAudio.play();
        if(!stop){
            animationPlay(clips[0], 1)
            setTimeout(() => songAudio.stop(), 300)
        }else{
            animationPlay(clips[0], -1)
        }
        if(play){
            animationPlay(clips[1], -1)
            play = !play  
        }
        stop = !stop        
    }
})
function animationReset(action){
    if(action.time === 0 || action.time === action.getClip().duration){
        action.paused = false
    }
}
function animationPlay(action, timeScale){
    animationReset(action)
    action.timeScale = timeScale;
    action.play();
}
window.addEventListener("resize", () => {
    //Update Camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    //Update Renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
