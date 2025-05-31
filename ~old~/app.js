// Initialize the scene, camera, and renderer
let scene, camera, renderer;
let controls;
let solarSystem;
let viewManager;

function init() {
    // Create the scene
    scene = new THREE.Scene();

    // Create the camera
    camera = new THREE.PerspectiveCamera(
        45, // Field of view
        window.innerWidth / window.innerHeight, // Aspect ratio
        1, // Near clipping plane
        1000000 // Far clipping plane - increased to see the orbit
    );

    // Create the renderer
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('canvas'),
        antialias: true,
        logarithmicDepthBuffer: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Add minimal ambient light (just enough to see the dark side a bit)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    // Create skybox
    const skybox = new Skybox();
    scene.add(skybox.getObject());

    // Create solar system
    solarSystem = new SolarSystem();
    scene.add(solarSystem.getObject());

    // Create view manager
    viewManager = new ViewManager();

    // Make viewManager globally available
    window.viewManager = viewManager;

    // Initialize view manager with scene, camera, controls, and location camera
    viewManager.initialize(scene, camera, controls, solarSystem.locationCamera);

    // Show solar system controls
    solarSystem.show();

    // Ensure the Top View radio button is checked by default
    const topViewRadio = document.getElementById('radio-topView');
    if (topViewRadio) {
        topViewRadio.checked = true;
    }

    // Disable camera controls initially since we start with a global view
    const viewType = viewManager.getCurrentViewType();
    solarSystem.setCameraControlsEnabled(true, viewType);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start the animation loop
    animate();
}

function animate() {
    requestAnimationFrame(animate);

    // Update solar system
    solarSystem.update(Date.now());

    // Update view manager
    if (viewManager) {
        viewManager.update();
    }

    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize the scene when the page loads
window.addEventListener('load', init);