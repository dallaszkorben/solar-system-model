/**
 * SolarSystem class to manage the 3D solar system model
 */
class SolarSystem {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.sky = null;

        // Control panels
        this.solarSystemControlPanel = null;
        this.viewControlPanel = null;

        // Scale mode state: 'no-scale', 'size-scale', or 'distance-scale'
        this.scaleModeState = none;

        this.init();
    }

    init() {

        // Set Scale mode
        this.setScaleMode(SolarSystemControlPanel.scaleModeValues.noScale);

        // Create the scene
        this.scene = new THREE.Scene();

        // Create the camera
        this.camera = new THREE.PerspectiveCamera(
            45, // Field of view
            window.innerWidth / window.innerHeight, // Aspect ratio
            1, // Near clipping plane
            100000000 // Far clipping plane
        );

        // Position the camera
        this.camera.position.z = 5000;

        // Create the renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('canvas'),
            antialias: true,
            logarithmicDepthBuffer: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Add orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Add minimal ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Create sky as a planet
        this.sky = new Sky();
        this.sky.rotationEnabled = true; // Enable rotation mechanism but speed is 0
        this.sky.applyTilt(); // Apply any tilt
        this.scene.add(this.sky.getObject());

        // Create control panels after sky is created
        this.createControlPanels();

        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // Start the animation loop
        this.animate();
    }

    createControlPanels() {
        // Create the control panels
        this.solarSystemControlPanel = new SolarSystemControlPanel(this);
        this.viewControlPanel = new ViewControlPanel();
        // PlanetControlPanel will be created later
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // Update sky rotation
        if (this.sky) {
            this.sky.update(Date.now());
        }

        // Update controls
        if (this.controls) {
            this.controls.update();
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Method to set the sky rotation speed
    setSkyRotationSpeed(speed) {
        if (this.sky) {
            this.sky.setRotationSpeed(speed);
        }
    }

    // Method to set the scale mode state
    setScaleMode(state) {
        this.scaleModeState = state;
        console.log(`Scale mode set to: ${state}`);

        // Apply the appropriate scale mode data to all planets
        if (this.planets) {
            this.planets.forEach(planet => {
                this.applyScaleModeToObject(planet);
            });
        }

        // Also apply to the sky if needed
        this.applyScaleModeToObject(this.sky);
    }

    // Helper method to apply scale mode to a planet or sky
    applyScaleModeToObject(object) {
        if (!object) return;

        let modeData;

        // Select the appropriate mode data based on the current state
        switch (this.scaleModeState) {
            case 'no-scale':
                modeData = object.noScaleModeData;
                break;
            case 'size-scale':
                modeData = object.sizeScaleModeData;
                break;
            case 'distance-scale':
                modeData = object.distanceScaleModeData;
                break;
            default:
                modeData = object.noScaleModeData;
        }

        // Apply the mode data to the object
        if (modeData) {
            // Update object properties
            object.diameter = modeData.diameter;
            object.radius = object.diameter / 2;
            object.orbitRadius = modeData.orbitRadius;
            object.rotationPeriod = modeData.rotationPeriod;
            object.maxRotationPeriod = modeData.maxRotationPeriod;
            object.orbitalPeriod = modeData.orbitalPeriod;
            object.maxOrbitalPeriod = modeData.maxOrbitalPeriod;

            // Update speeds
            object.rotationSpeed = modeData.rotationSpeed();
            object.maxRotationSpeed = modeData.maxRotationSpeed();
            object.orbitSpeed = modeData.orbitSpeed();
            object.maxOrbitSpeed = modeData.maxOrbitSpeed();

            // Update orbit position if applicable
            if (object.group && object.orbitLine) {
                // Update orbit line geometry
                const segments = 128;
                const vertices = [];

                for (let i = 0; i <= segments; i++) {
                    const theta = (i / segments) * Math.PI * 2;
                    const x = object.orbitRadius * Math.cos(theta);
                    const z = object.orbitRadius * Math.sin(theta);
                    vertices.push(x, 0, z);
                }

                // Update orbit line geometry
                object.orbitLine.geometry.setAttribute(
                    'position',
                    new THREE.Float32BufferAttribute(vertices, 3)
                );

                // Update object position
                object.group.position.x = object.orbitRadius;
            }

            // Update sphere size if applicable
            if (object.sphere) {
                const newGeometry = new THREE.SphereGeometry(object.radius, 64, 32);
                object.sphere.geometry.dispose();
                object.sphere.geometry = newGeometry;
            }
        }
    }
}