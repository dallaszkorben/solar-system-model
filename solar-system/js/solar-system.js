// Solar System with Three.js
let scene, camera, renderer, controls;
let sun, planets = {};
let earthOnlyMode = false;
let showRotationAxes = false;
let orbitingEnabled = true; // Flag to control orbital movement
let spinSpeedMultiplier = 1.0; // Multiplier for planet spin speed

// Planet data: size (relative to Earth=1), distance from sun (in AU), rotation period (days), axial tilt (degrees)
const planetData = {
//    sun: { size: 109, color: 0xffcc00, axialTilt: 7.25, hasTexture: true },
    sun: { size: 50, color: 0xffcc00, axialTilt: 7.25, hasTexture: true },
    // Rocky planets - increased size for better visibility
    mercury: { size: 1.9, distance: 1.2, color: 0xaaaaaa, rotationPeriod: 58.6, axialTilt: 0.03, hasTexture: true }, // Increased distance
    venus: { size: 4.75, distance: 1.8, color: 0xffd085, rotationPeriod: 243, axialTilt: 177.4, hasTexture: true }, // Increased distance
    earth: { size: 5.0, distance: 2.5, color: 0x2233ff, rotationPeriod: 1, axialTilt: 23.4, hasTexture: true }, // Increased distance
    mars: { size: 2.65, distance: 3.2, color: 0xff4400, rotationPeriod: 1.03, axialTilt: 25.2, hasTexture: true }, // Increased distance
    // Gas giants - slightly reduced
    jupiter: { size: 8.96, distance: 5.2, color: 0xffaa88, rotationPeriod: 0.41, axialTilt: 3.1, hasTexture: true }, // 20% smaller
    saturn: { size: 7.56, distance: 9.5, color: 0xffcc99, rotationPeriod: 0.45, axialTilt: 26.7, hasTexture: true }, // 20% smaller
    // Ice giants - more reduced
    uranus: { size: 2.8, distance: 19.2, color: 0x99ffff, rotationPeriod: 0.72, axialTilt: 97.8, hasTexture: true }, // Now has texture
    neptune: { size: 2.72, distance: 30.1, color: 0x3333ff, rotationPeriod: 0.67, axialTilt: 28.3, hasTexture: true } // Now has texture
};

// Scale factors to make the visualization fit nicely in the browser
let isRealisticMode = true;

// Orbit line width (in pixels)
const ORBIT_LINE_WIDTH = 10;

// Orbit control variables
let orbitVisibility = 1.0; // 0 = invisible, 1 = fully visible
let orbitSpeedMultiplier = 1.0; // Multiplier for orbit speed

// Camera view settings
let currentView = 'space'; // 'space', 'budapest', etc.

// Realistic scales
const REALISTIC_SIZE_SCALE = 0.07;  // Slightly larger planet sizes
const REALISTIC_DISTANCE_SCALE = 8; // Reduced to avoid planets being too far apart

// Balanced scales (more visible planets)
const BALANCED_SIZE_SCALE = 0.5;  // Larger planets
const BALANCED_SUN_SCALE = 0.1; // Even smaller sun for better visibility
const BALANCED_DISTANCE_SCALE = 2; // Not used in non-realistic mode (evenly spaced instead)

// Current scales (will be set based on mode)
let SIZE_SCALE = REALISTIC_SIZE_SCALE;
let DISTANCE_SCALE = REALISTIC_DISTANCE_SCALE;

// Store textures globally
let textures = {};

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Create camera with normal FOV for space view
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);

    // Load planet textures
    const textureLoader = new THREE.TextureLoader();

    // Load textures for planets that have them
    for (const [name, data] of Object.entries(planetData)) {
        if (data.hasTexture) {
            // Special case for Neptune which has a different filename
            textures[name] = textureLoader.load(`images/${name.charAt(0).toUpperCase() + name.slice(1)}-texture.jpg`);
        }
    }

    // Create sun with point light
    const sunSize = isRealisticMode ?
        planetData.sun.size * REALISTIC_SIZE_SCALE :
        planetData.sun.size * BALANCED_SUN_SCALE;
    const sunGeometry = new THREE.SphereGeometry(sunSize, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
        map: textures.sun || null,
        color: textures.sun ? 0xffffff : planetData.sun.color
    });
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    const sunLight = new THREE.PointLight(0xffffff, 1.5);
    sun.add(sunLight);

    // Create planets
    for (const [name, data] of Object.entries(planetData)) {
        if (name === 'sun') continue;

        const planetGeometry = new THREE.SphereGeometry(data.size * SIZE_SCALE, 32, 32);

        // Use textures for planets that have them, colors for others
        let planetMaterial;
        if (data.hasTexture && textures[name]) {
            planetMaterial = new THREE.MeshLambertMaterial({ map: textures[name] });
        } else {
            planetMaterial = new THREE.MeshLambertMaterial({ color: data.color });
        }

        const planet = new THREE.Mesh(planetGeometry, planetMaterial);

        // Create orbit using LineLoop for constant width
        const orbitRadius = data.distance * DISTANCE_SCALE;
        const orbitSegments = 64;
        const orbitGeometry = new THREE.BufferGeometry();
        const orbitVertices = [];

        for (let i = 0; i <= orbitSegments; i++) {
            const theta = (i / orbitSegments) * Math.PI * 2;
            orbitVertices.push(
                Math.cos(theta) * orbitRadius,
                0,
                Math.sin(theta) * orbitRadius
            );
        }

        orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitVertices, 3));

        const orbitMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: ORBIT_LINE_WIDTH, // Note: linewidth only works in WebGL2 with certain hardware
            linecap: 'round',
            linejoin: 'round',
            transparent: true,
            opacity: 1.0
        });

        const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
        scene.add(orbit);

        // Position planet
        planet.position.x = data.distance * DISTANCE_SCALE;

        // Add planet to scene and store reference
        scene.add(planet);
        planets[name] = {
            mesh: planet,
            orbit: orbit,  // Store reference to the orbit
            data: data,
            angle: Math.random() * Math.PI * 2 // Random starting position
        };
    }

    // Set up control panel buttons
    setupControlPanel();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Initialize planet visibility
    updatePlanetVisibility();

    // Start animation loop
    animate();
}

// Set up the control panel functionality
function setupControlPanel() {
    const fitViewBtn = document.getElementById('fit-view-btn');
    const toggleRealisticBtn = document.getElementById('toggle-realistic-btn');
    const toggleEarthOnlyBtn = document.getElementById('toggle-earth-only-btn');
    const toggleOrbitBtn = document.getElementById('toggle-orbit-btn');
    const spinSpeedSlider = document.getElementById('spin-speed');

    fitViewBtn.addEventListener('click', () => {
        fitCameraToSolarSystem();
    });

    toggleRealisticBtn.addEventListener('click', () => {
        toggleRealisticMode();
    });

    toggleEarthOnlyBtn.addEventListener('click', () => {
        toggleEarthOnlyMode();
    });

    toggleOrbitBtn.addEventListener('click', () => {
        toggleOrbiting();
    });

    // Set up spin speed slider
    spinSpeedSlider.addEventListener('input', (event) => {
        spinSpeedMultiplier = parseFloat(event.target.value);
    });

    // Set up orbit visibility slider
    const orbitVisibilitySlider = document.getElementById('orbit-visibility');
    orbitVisibilitySlider.addEventListener('input', (event) => {
        orbitVisibility = parseFloat(event.target.value);
        updateOrbitVisibility();
    });

    // Set up orbit speed slider
    const orbitSpeedSlider = document.getElementById('orbit-speed');
    orbitSpeedSlider.addEventListener('input', (event) => {
        orbitSpeedMultiplier = parseFloat(event.target.value);
    });

    // Set up view buttons
    const viewSpaceBtn = document.getElementById('view-space');
    const viewBudapestBtn = document.getElementById('view-budapest');

    viewSpaceBtn.addEventListener('click', () => {
        setView('space');
    });

    viewBudapestBtn.addEventListener('click', () => {
        setView('budapest');
    });

    // Set up camera control buttons
    const cameraUpBtn = document.getElementById('camera-up');
    const cameraDownBtn = document.getElementById('camera-down');
    const cameraLeftBtn = document.getElementById('camera-left');
    const cameraRightBtn = document.getElementById('camera-right');

    // Camera rotation step in radians (5 degrees = PI/36 radians)
    const cameraRotationStep = Math.PI / 36; // 5 degree steps

    cameraUpBtn.addEventListener('click', () => {
        if (currentView === 'budapest') {
            rotateBudapestViewVertical(-cameraRotationStep);
        } else {
            rotateCameraVertical(-cameraRotationStep);
        }
        console.log('Camera up clicked');
    });

    cameraDownBtn.addEventListener('click', () => {
        if (currentView === 'budapest') {
            rotateBudapestViewVertical(cameraRotationStep);
        } else {
            rotateCameraVertical(cameraRotationStep);
        }
        console.log('Camera down clicked');
    });

    cameraLeftBtn.addEventListener('click', () => {
        if (currentView === 'budapest') {
            // Left button: Decrease degrees (move camera right)
            rotateBudapestViewHorizontal(-cameraRotationStep);
        } else {
            rotateCameraHorizontal(-cameraRotationStep);
        }
        console.log('Camera left clicked');
    });

    cameraRightBtn.addEventListener('click', () => {
        if (currentView === 'budapest') {
            // Right button: Increase degrees (move camera left)
            rotateBudapestViewHorizontal(cameraRotationStep);
        } else {
            rotateCameraHorizontal(cameraRotationStep);
        }
        console.log('Camera right clicked');
    });

    // Set initial button states
    updateToggleButtonText();
    updateEarthOnlyButtonText();
    updateOrbitButtonText();
}

// Toggle orbiting on/off
function toggleOrbiting() {
    orbitingEnabled = !orbitingEnabled;
    updateOrbitButtonText();
}

// Update the orbit button text based on current state
function updateOrbitButtonText() {
    const toggleBtn = document.getElementById('toggle-orbit-btn');
    toggleBtn.textContent = orbitingEnabled ? 'Orbit: ON' : 'Orbit: OFF';
}

// Toggle Earth-only mode
function toggleEarthOnlyMode() {
    earthOnlyMode = !earthOnlyMode;
    updateEarthOnlyButtonText();
    updatePlanetVisibility();
    // Don't change camera view when toggling Earth-only mode
}

// Update the Earth-only button text based on current state
function updateEarthOnlyButtonText() {
    const toggleBtn = document.getElementById('toggle-earth-only-btn');
    toggleBtn.textContent = earthOnlyMode ? 'Earth Only: ON' : 'Earth Only: OFF';
}

// Update planet visibility based on Earth-only mode
function updatePlanetVisibility() {
    for (const [name, planet] of Object.entries(planets)) {
        if (name === 'earth' || name === 'sun') {
            // Earth and Sun are always visible
            planet.mesh.visible = true;
            if (planet.orbit) planet.orbit.visible = true; // Sun doesn't have an orbit
        } else {
            // Other planets are only visible when not in Earth-only mode
            planet.mesh.visible = !earthOnlyMode;
            planet.orbit.visible = !earthOnlyMode;
        }
    }

    // Apply orbit visibility based on slider
    updateOrbitVisibility();
}

// Update orbit line visibility based on slider value
function updateOrbitVisibility() {
    // Force update all orbits regardless of current visibility
    for (const [name, planet] of Object.entries(planets)) {
        if (planet.orbit) {
            // Skip planets that should be hidden due to Earth-only mode
            if (name !== 'earth' && name !== 'sun' && earthOnlyMode) {
                continue;
            }

            if (orbitVisibility <= 0) {
                planet.orbit.visible = false;
            } else {
                planet.orbit.visible = true;
                // Update orbit line color based on visibility value
                const color = Math.floor(255 * orbitVisibility);
                planet.orbit.material.color.setRGB(color/255, color/255, color/255);
                planet.orbit.material.opacity = orbitVisibility;
            }
        }
    }
}

// Toggle between realistic and balanced mode
function toggleRealisticMode() {
    isRealisticMode = !isRealisticMode;
    updateToggleButtonText();
    updateSolarSystemScale();
}

// Update the toggle button text based on current mode
function updateToggleButtonText() {
    const toggleBtn = document.getElementById('toggle-realistic-btn');
    toggleBtn.textContent = isRealisticMode ? 'Realistic: ON' : 'Realistic: OFF';
}

// Apply custom size scaling based on planet type
function getAdjustedPlanetSize(name, baseSize) {
    // Rocky planets (Mercury, Venus, Earth, Mars) get a size boost
    if (['mercury', 'venus', 'earth', 'mars'].includes(name)) {
        return baseSize * 3; // Make rocky planets 3x larger
    }
    // Gas giants (Jupiter, Saturn) stay the same
    else if (['jupiter', 'saturn'].includes(name)) {
        return baseSize * 0.8; // Slightly smaller
    }
    // Ice giants (Uranus, Neptune) slightly smaller
    else if (['uranus', 'neptune'].includes(name)) {
        return baseSize * 0.7; // Even smaller
    }
    // Default case
    return baseSize;
}

// Update the solar system scale based on the current mode
function updateSolarSystemScale() {
    if (isRealisticMode) {
        SIZE_SCALE = REALISTIC_SIZE_SCALE;
        DISTANCE_SCALE = REALISTIC_DISTANCE_SCALE;
    } else {
        SIZE_SCALE = BALANCED_SIZE_SCALE;
        DISTANCE_SCALE = BALANCED_DISTANCE_SCALE;
    }

    // Update sun size
    const sunSize = isRealisticMode ?
        planetData.sun.size * REALISTIC_SIZE_SCALE :
        planetData.sun.size * BALANCED_SUN_SCALE;

    sun.geometry = new THREE.SphereGeometry(sunSize, 32, 32);

    // Update sun texture
    if (textures.sun) {
        sun.material = new THREE.MeshBasicMaterial({
            map: textures.sun,
            color: 0xffffff
        });
    }

    // Get planet names in order of distance from sun
    const planetNames = Object.keys(planets).sort((a, b) =>
        planets[a].data.distance - planets[b].data.distance
    );

    // Update planet sizes, orbits and positions
    if (isRealisticMode) {
        // Realistic mode - use actual proportional distances
        for (const [name, planet] of Object.entries(planets)) {
            // Update planet size
            const planetSize = planet.data.size * SIZE_SCALE;

            // Create new geometry with updated size
            const newGeometry = new THREE.SphereGeometry(planetSize, 32, 32);

            // Keep texture when updating
            if (planet.data.hasTexture && textures[name]) {
                planet.mesh.material = new THREE.MeshLambertMaterial({ map: textures[name] });
            }

            // Update geometry
            planet.mesh.geometry.dispose(); // Clean up old geometry
            planet.mesh.geometry = newGeometry;

            // Update orbit
            const orbitRadius = planet.data.distance * DISTANCE_SCALE;
            planet.orbit.geometry.dispose(); // Clean up old geometry

            // Create new orbit geometry with constant width
            const orbitGeometry = new THREE.BufferGeometry();
            const orbitVertices = [];
            const orbitSegments = 64;

            for (let i = 0; i <= orbitSegments; i++) {
                const theta = (i / orbitSegments) * Math.PI * 2;
                orbitVertices.push(
                    Math.cos(theta) * orbitRadius,
                    0,
                    Math.sin(theta) * orbitRadius
                );
            }

            orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitVertices, 3));
            planet.orbit.geometry = orbitGeometry;

            // Update planet position
            planet.mesh.position.x = Math.cos(planet.angle) * orbitRadius;
            planet.mesh.position.z = Math.sin(planet.angle) * orbitRadius;
        }
    } else {
        // Non-realistic mode - use evenly spaced distances
        // Start at 8 units from sun, with 7 units between each planet
        const baseDistance = 8;
        const distanceIncrement = 7;

        planetNames.forEach((name, index) => {
            const planet = planets[name];

            // Update planet size
            const planetSize = planet.data.size * SIZE_SCALE;

            // Create new geometry with updated size
            const newGeometry = new THREE.SphereGeometry(planetSize, 32, 32);

            // Keep texture when updating
            if (planet.data.hasTexture && textures[name]) {
                planet.mesh.material = new THREE.MeshLambertMaterial({ map: textures[name] });
            }

            // Update geometry
            planet.mesh.geometry.dispose(); // Clean up old geometry
            planet.mesh.geometry = newGeometry;

            // Calculate evenly spaced orbit radius
            const orbitRadius = baseDistance + (index * distanceIncrement);

            // Update orbit
            planet.orbit.geometry.dispose(); // Clean up old geometry

            // Create new orbit geometry with constant width
            const orbitGeometry = new THREE.BufferGeometry();
            const orbitVertices = [];
            const orbitSegments = 64;

            for (let i = 0; i <= orbitSegments; i++) {
                const theta = (i / orbitSegments) * Math.PI * 2;
                orbitVertices.push(
                    Math.cos(theta) * orbitRadius,
                    0,
                    Math.sin(theta) * orbitRadius
                );
            }

            orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitVertices, 3));
            planet.orbit.geometry = orbitGeometry;

            // Update planet position
            planet.mesh.position.x = Math.cos(planet.angle) * orbitRadius;
            planet.mesh.position.z = Math.sin(planet.angle) * orbitRadius;

            // Store the current orbit radius for animation
            planet.currentOrbitRadius = orbitRadius;
        });
    }

    // Update planet visibility
    updatePlanetVisibility();

    // Fit the view to show the updated system
    fitCameraToSolarSystem();

    // Update Budapest sphere if it exists
    if (typeof updateBudapestPosition === 'function') {
        updateBudapestPosition();
    }
}

// Function to fit the camera view to show the entire solar system
function fitCameraToSolarSystem() {
    // Calculate view distance based on mode
    let viewDistance;

    if (earthOnlyMode) {
        // Earth-only mode - focus on Earth's orbit
        if (isRealisticMode) {
            // Realistic Earth-only mode
            viewDistance = planets.earth.data.distance * DISTANCE_SCALE * 3;
        } else {
            // Non-realistic Earth-only mode
            // Find Earth's position in the non-realistic spacing
            const planetNames = Object.keys(planets).sort((a, b) =>
                planets[a].data.distance - planets[b].data.distance
            );
            const earthIndex = planetNames.indexOf('earth');
            const baseDistance = 8;
            const distanceIncrement = 7;
            const earthDistance = baseDistance + (earthIndex * distanceIncrement);
            viewDistance = earthDistance * 3;
        }
    } else if (isRealisticMode) {
        // Realistic mode with all planets - use the farthest visible planet
        let maxDistance = 0;

        // Only consider visible planets
        for (const [name, planet] of Object.entries(planets)) {
            if (planet.mesh.visible && planet.data.distance > maxDistance) {
                maxDistance = planet.data.distance;
            }
        }

        // Calculate a good camera position to see the entire system
        // Adding 20% margin for better visibility
        viewDistance = maxDistance * DISTANCE_SCALE * 1.2;
    } else {
        // Non-realistic mode with all planets - use the known spacing
        // 8 planets with spacing of 7 units = 56 units + base distance of 8
        viewDistance = (8 * 7 + 8) * 1.2;
    }

    // Reset camera position to a good viewing angle
    camera.position.set(viewDistance, viewDistance * 0.5, viewDistance);
    camera.lookAt(0, 0, 0);

    // Update controls target to center of solar system
    controls.target.set(0, 0, 0);

    // Adjust far clipping plane to ensure all planets are visible
    camera.far = viewDistance * 3;
    camera.updateProjectionMatrix();

    controls.update();
}

// Set the camera view to a specific location
function setView(viewName) {
    if (viewName === 'space') {
        // Switch back to space view
        if (typeof deactivateBudapestView === 'function') {
            deactivateBudapestView();
        }

        // Reset camera to space view
        fitCameraToSolarSystem();

        // Re-enable orbit controls
        controls.enabled = true;
    } else if (viewName === 'budapest') {
        // Switch to Budapest view
        if (typeof activateBudapestView === 'function') {
            activateBudapestView();
        }

        // Disable orbit controls when in Budapest view
        controls.enabled = false;
    }

    // Update current view
    currentView = viewName;
    updateViewButtons();
}

// Update the active state of view buttons
function updateViewButtons() {
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    const activeBtn = document.getElementById(`view-${currentView}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}



function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Rotate sun (also affected by spin speed)
    sun.rotation.y += 0.001 * spinSpeedMultiplier;

    // Update planet positions
    for (const [name, planet] of Object.entries(planets)) {
        // Update orbital position only if orbiting is enabled
        if (orbitingEnabled) {
            const orbitSpeed = (0.005 * orbitSpeedMultiplier) / Math.sqrt(planet.data.distance); // Kepler's law approximation
            planet.angle += orbitSpeed;

            // Use appropriate radius based on mode
            let orbitRadius;
            if (isRealisticMode) {
                orbitRadius = planet.data.distance * DISTANCE_SCALE;
            } else {
                orbitRadius = planet.currentOrbitRadius || planet.data.distance * DISTANCE_SCALE;
            }

            planet.mesh.position.x = Math.cos(planet.angle) * orbitRadius;
            planet.mesh.position.z = Math.sin(planet.angle) * orbitRadius;
        }

        // Always rotate planet on its axis (regardless of orbital movement)
        // Apply spin speed multiplier (0 = stopped, 1 = normal, 100 = 100x faster)
        // Venus rotates in the opposite direction due to its retrograde rotation
        if (name === 'venus') {
            planet.mesh.rotation.y -= (0.01 * spinSpeedMultiplier) / planet.data.rotationPeriod;
        } else {
            planet.mesh.rotation.y += (0.01 * spinSpeedMultiplier) / planet.data.rotationPeriod;
        }
    }

    // Always update Budapest position to keep the sphere at Budapest's location
    if (typeof updateBudapestPosition === 'function') {
        updateBudapestPosition();
    }

    // Update Budapest view if active
    if (currentView === 'budapest' && typeof updateBudapestView === 'function') {
        updateBudapestView();
    }

    controls.update();
    renderer.render(scene, camera);
}

// Initialize when the page loads
window.addEventListener('load', () => {
    init();
    // Automatically fit the view when the page loads
    setTimeout(() => {
        fitCameraToSolarSystem();
        // Create Budapest sphere after initialization
        if (typeof createBudapestSphere === 'function') {
            createBudapestSphere();
        }
    }, 100);
});