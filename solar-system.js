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
        this.scaleModeState = 'no-scale';

        // Initialize planets collection
        this.planets = {};

        this.init();
    }

    init() {
        try {
            console.log('Initializing solar system...');

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

//this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//this.renderer.shadowMap.enabled = true;

            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);

            // Add orbit controls
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;

            // Add directional light (sun-like)
            this.sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
            this.sunLight.position.set(0, 0, 0); // Light from the sun's position
//this.sunLight.castShadow = true;
//this.sunLight.shadow.mapSize.width = 2048;
//this.sunLight.shadow.mapSize.height = 2048;
//this.sunLight.shadow.camera.near = 0.5;
//this.sunLight.shadow.camera.far = 5000000;
//this.sunLight.shadow.camera.left = -500000;
//this.sunLight.shadow.camera.right = 500000;
//this.sunLight.shadow.camera.top = 500000;
//this.sunLight.shadow.camera.bottom = -500000;


            this.scene.add(this.sunLight);

//this.ambientLight = new THREE.AmbientLight(0x404040); // soft white light
//this.scene.add(this.ambientLight);

            // Initialize planets collection
            this.planets = {};

            console.log('Creating sky...');
            // Create sky as a planet
            this.sky = new Sky();
            this.sky.rotationEnabled = true; // Enable rotation mechanism but speed is 0
            this.sky.applyTilt(); // Apply any tilt
            this.scene.add(this.sky.getObject());
            console.log('Sky created and added to scene');

            // Create control panels after sky is created
            this.createControlPanels();

            // Set default view
            this.setDefaultView();

            // Handle window resize
            window.addEventListener('resize', this.onWindowResize.bind(this));

            // Start the animation loop
            this.animate();

            console.log('Solar system initialization complete');
        } catch (error) {
            console.error('Error initializing solar system:', error);
        }
    }

    createControlPanels() {
        // Create the control panels
        this.solarSystemControlPanel = new SolarSystemControlPanel(this);
        this.viewControlPanel = new ViewControlPanel(this);
        // PlanetControlPanel will be created later

        // Initialize planets
        this.initializePlanets();
    }

    // Initialize planets for the solar system
    initializePlanets() {
        try {
            console.log('Initializing planets with textures...');

            // Create planets using the proper planet classes
            this.planets = {
                sun: new Sun(),
                mercury: new Mercury(),
                venus: new Venus(),
                earth: new Earth(),
                mars: new Mars(),
                jupiter: new Jupiter(),
                saturn: new Saturn(),
                uranus: new Uranus(),
                neptune: new Neptune()
            };

            // Add all planets to the scene
            Object.values(this.planets).forEach(planet => {
                this.scene.add(planet.getObject());
            });

            console.log('All planets initialized and added to scene');
        } catch (error) {
            console.error('Error initializing planets:', error);
        }
    }

    // Set the default view
    setDefaultView() {
        if (this.viewControlPanel) {
            this.viewControlPanel.setView('topView');
        }
    }

    // Set a planet side view
    setPlanetSideView(planetName) {
        if (this.viewControlPanel) {
            this.viewControlPanel.setView(`${planetName}SideView`);
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const now = Date.now();

        // Update sky rotation
        if (this.sky) {
            this.sky.update(now);
        }

        // Update all planets
        if (this.planets) {
            Object.values(this.planets).forEach(planet => {
                planet.update(now);
            });
        }

        // Update controls
        if (this.controls) {
            this.controls.update();
        }

        // Update active view if any
        if (this.viewControlPanel && this.viewControlPanel.activeView) {
            this.viewControlPanel.activeView.update();
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

    // Method to get a planet by name
    getPlanetByName(name) {
        if (this.planets && this.planets[name]) {
            return this.planets[name];
        }
        return null;
    }

    // Method to enable/disable rotation for all planets
    setAllRotationEnabled(enabled) {
        if (this.planets) {
            Object.values(this.planets).forEach(planet => {
                planet.setRotationEnabled(enabled);
            });
        }
    }

    // Method to set global rotation speed factor (0-10)
    setGlobalRotationSpeed(factor) {
        // Apply to all planets
        if (this.planets) {
            Object.values(this.planets).forEach(planet => {
                planet.setGlobalRotationSpeedFactor(factor);
            });
        }

        // If factor is greater than 0, ensure rotation is enabled
        if (factor > 0) {
            this.setAllRotationEnabled(true);
        }
    }

    // Method to enable/disable day/night effect for all planets
    setAllDayNightEffectEnabled(enabled) {
        if (this.planets) {
            // Store the day/night state regardless of sun visibility
            this.dayNightEffectEnabled = enabled;

            const sunVisible = this.planets.sun && this.planets.sun.visible;

            Object.values(this.planets).forEach(planet => {

                // Skip the sun itself
                if (planet !== this.planets.sun && typeof planet.setDayNightEffectEnabled === 'function') {
                    planet.setDayNightEffectEnabled(enabled);
                }
            });
        }
    }



    // Method to enable/disable orbit for all planets
    setAllOrbitEnabled(enabled) {
        if (this.planets) {
            Object.values(this.planets).forEach(planet => {
                planet.setOrbitEnabled(enabled);
            });
        }
    }

    // Method to set global orbit speed factor (0-10)
    setGlobalOrbitSpeed(factor) {
        // Apply to all planets
        if (this.planets) {
            Object.values(this.planets).forEach(planet => {
                planet.setGlobalOrbitSpeedFactor(factor);
            });
        }

        // If factor is greater than 0, ensure orbit is enabled
        if (factor > 0) {
            this.setAllOrbitEnabled(true);
        }
    }

    // Method to set visibility of all orbit lines
    setAllOrbitLinesVisible(visible) {
        if (this.planets) {
            Object.values(this.planets).forEach(planet => {
                if (planet.orbitLine) {
                    planet.orbitLine.visible = visible;
                }
            });
        }
    }

    // Method to set opacity of all orbit lines
    setOrbitLinesOpacity(opacity) {
        if (this.planets) {
            Object.values(this.planets).forEach(planet => {
                if (planet.orbitLine && planet.orbitLine.material) {
                    planet.orbitOpacity = opacity; // Update the planet's orbitOpacity property
                    planet.orbitLine.material.opacity = opacity;
                    planet.orbitLine.material.needsUpdate = true; // Important: Tell Three.js to update the material
                }
            });
        }
    }

    // Method to set the scale mode state
    setScaleMode(state) {
        this.scaleModeState = state;
        console.log(`Scale mode set to: ${state}`);

        // Apply the appropriate scale mode data to all planets
        if (this.planets) {
            Object.values(this.planets).forEach(planet => {
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
            object.defaultRotationSpeed = modeData.rotationSpeed(); // Store default rotation speed
            object.defaultOrbitSpeed = modeData.orbitSpeed(); // Store default orbit speed

            // Recalculate speeds based on current factors
            object.setGlobalRotationSpeedFactor(object.globalRotationSpeedFactor);
            object.setGlobalOrbitSpeedFactor(object.globalOrbitSpeedFactor);

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