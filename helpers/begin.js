const createScene = (THREE) => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x262626);
    return scene;
}
const createPerspectiveCamera = (THREE) => {
    const config = {
        fov: 40,
        aspect : window.innerWidth / window.innerHeight,
        near : 1,
        far: 10000
    }
    const camera = new THREE.PerspectiveCamera(config.fov, config.aspect, config.near, config.far);
    camera.position.z = 15;
    return camera;
}
const createRenderer = (THREE, canvas) => {
    const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio: 1);
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);
    return renderer;
}
const createOrbitControls = (THREE, OrbitControls, camera, canvas) =>{
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05; 
    return controls;
}
const createLoadManager =(THREE, scene, camera, renderer) => {
    return new THREE.LoadingManager(()=>{
        renderer.render(scene, camera);
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('fade-out');
        loadingScreen.addEventListener('transitionend', e =>{
            e.target.remove();            
        });
    }, (url, loaded, total) => {
        //console.log( 'Loading file: ' + url + '.\nLoaded ' + loaded + ' of ' + total + ' files.' );
    });
}
const loadHDRI = (THREE, RGBELoader, loadManager, hdrURL, scene) => {
    const loader = new RGBELoader(loadManager);
    loader.load(hdrURL, function(texture){
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
        scene.environment = texture;
        scene.rotation.y = Math.PI;
    })
}
const lighting = (THREE, scene) => {
    const directionalLight = new THREE.DirectionalLight(0x9E3FE6, 0.5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const light = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0x352847);
    scene.add(ambient);
}
const cargarModelo = async (patch, GLTFLoader, loadManager) => {
    return new Promise((resolve, reject) =>{
        const loader = new GLTFLoader(loadManager);
        loader.load(patch, gltf =>{
            resolve(gltf)
        }, undefined, error =>{
            reject(error)
        });
    })
}

export{
    createScene,
    createPerspectiveCamera,
    createRenderer,
    createOrbitControls,
    createLoadManager,
    loadHDRI,
    lighting,
    cargarModelo,
}