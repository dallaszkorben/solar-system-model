// Initialize the scene, camera, and renderer
let scene, camera, renderer;
let controls;
let earth;

function init() {
    // Create the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Create the camera
    camera = new THREE.PerspectiveCamera(
        45, // Field of view
        window.innerWidth / window.innerHeight, // Aspect ratio
        1, // Near clipping plane
        1000000 // Far clipping plane - increased to see the orbit
    );
    camera.position.set(0, 100000, 200000); // Positioned to see the orbit
    
    // Create the renderer
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('canvas'),
        antialias: true,
        logarithmicDepthBuffer: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Add orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Create Earth using the Earth class
    earth = new Earth(12000); // 12000m diameter
    scene.add(earth.getObject());
    
    // Show Earth's console pane
    earth.show();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Start the animation loop
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update Earth if needed
    earth.update(Date.now());
    
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