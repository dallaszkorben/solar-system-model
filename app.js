// Initialize the scene, camera, and renderer
let scene, camera, renderer;
let controls;
let solarSystem;

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
    
    // Create solar system
    solarSystem = new SolarSystem();
    scene.add(solarSystem.getObject());
    
    // Set initial top view to see the entire orbit
    const maxOrbitRadius = solarSystem.earth ? solarSystem.earth.orbitRadius : 150000;
    
    // Calculate camera distance based on field of view to ensure the entire orbit is visible
    // We need to position the camera so that the diameter of the orbit (2 * radius) fits in the view
    const orbitDiameter = maxOrbitRadius * 2;
    const aspectRatio = window.innerWidth / window.innerHeight;
    const vFov = camera.fov * Math.PI / 180;
    
    // Calculate the required distance based on the smaller dimension (width or height)
    let distance;
    if (aspectRatio >= 1.0) {
        // Width is greater than or equal to height, so height is the limiting factor
        distance = orbitDiameter / (2 * Math.tan(vFov / 2));
    } else {
        // Height is greater than width, so width is the limiting factor
        distance = orbitDiameter / (2 * Math.tan((vFov * aspectRatio) / 2));
    }
    
    // Add 10% margin to ensure the orbit is fully visible
    distance *= 1.1;
    
    camera.position.set(0, distance, 0);
    camera.lookAt(0, 0, 0);
    
    // Show solar system controls
    solarSystem.show();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Start the animation loop
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update solar system
    solarSystem.update(Date.now());
    
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