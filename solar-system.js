/**
 * SolarSystem class to manage the 3D solar system model
 */
class SolarSystem {

    static celestialBodies = {
        sky:     {id: Sky.ID,     name: Sky.NAME,     bodyClass: Sky,     planetControlPanelClass: SkyControlPanel    },
        sun:     {id: Sun.ID,     name: Sun.NAME,     bodyClass: Sun,     planetControlPanelClass: SunControlPanel    },
        mercury: {id: Mercury.ID, name: Mercury.NAME, bodyClass: Mercury, planetControlPanelClass: PlanetControlPanel },
        venus:   {id: Venus.ID,   name: Venus.NAME,   bodyClass: Venus,   planetControlPanelClass: PlanetControlPanel },
        earth:   {id: Earth.ID,   name: Earth.NAME,   bodyClass: Earth,   planetControlPanelClass: PlanetControlPanel },
        mars:    {id: Mars.ID,    name: Mars.NAME,    bodyClass: Mars,    planetControlPanelClass: PlanetControlPanel },
        jupiter: {id: Jupiter.ID, name: Jupiter.NAME, bodyClass: Jupiter, planetControlPanelClass: PlanetControlPanel },
        saturn:  {id: Saturn.ID,  name: Saturn.NAME,  bodyClass: Saturn,  planetControlPanelClass: PlanetControlPanel },
        uranus:  {id: Uranus.ID,  name: Uranus.NAME,  bodyClass: Uranus,  planetControlPanelClass: PlanetControlPanel },
        neptune: {id: Neptune.ID, name: Neptune.NAME, bodyClass: Neptune, planetControlPanelClass: PlanetControlPanel },
    }

    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.sky = null;
        this.sideViewMarkers = null;

        // Control panels
        this.solarSystemControlPanel = null;
        this.viewControlPanel = null;

        // Scale mode state: 'no-scale', 'size-scale', 'distance-scale', 'full-scale'
        this.scaleModeState = 'no-scale';

        // Initialize planets collection - used in SolarSystem
        this.planetObjs = {};

        this.init();
    }

    init() {

            console.log('Initializing solar system...');

            // Create the scene
            this.scene = new THREE.Scene();

            // Create the camera
            this.camera = new THREE.PerspectiveCamera(
                40, // Field of view (default 40 degrees)
                window.innerWidth / window.innerHeight, // Aspect ratio
                0.01, // Near clipping plane
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

            // Add directional light (sun-like)
            this.sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
            this.sunLight.position.set(0, 0, 0); // Light from the sun's position

            this.scene.add(this.sunLight);

            this.initializePlanets();

            // Create control panels after sky is created
            this.createControlPanels();

            // Set default view
            this.setDefaultView();

            // Handle window resize
            window.addEventListener('resize', this.onWindowResize.bind(this));

            // Start the animation loop
            this.animate();

            console.log('Solar system initialization complete');
    }

    initializePlanets() {
            console.log('Initializing planets with textures...');

            // Add all planets to the scene (excluding sky which is handled separately)
            Object.entries(SolarSystem.celestialBodies).forEach(([key, body]) => {
                const planetClass = body.bodyClass;
                const planetObj = new planetClass(this);
                this.planetObjs[key] = planetObj;
                this.scene.add(planetObj.getObject());
            });

            console.log('All planets initialized and added to scene');
    }

    createControlPanels() {

        // Create the control panels
        this.solarSystemControlPanel = new SolarSystemControlPanel(this);
        this.viewControlPanel = new ViewControlPanel(this);
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

        // Update all planets
        if (this.planetObjs) {
            Object.values(this.planetObjs).forEach(planet => {
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
            
            // Save camera state periodically for global views
            if (this.viewControlPanel.activeView instanceof GlobalView && 
                this.controls.enabled && 
                (this.controls.isDragging || this.controls.isZooming)) {
                this.viewControlPanel.activeView.saveCameraState();
            }
        }

        // Side view markers are now updated by the Earth planet

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Update camera position for global views when window is resized
        if (this.viewControlPanel && this.viewControlPanel.activeView instanceof GlobalView) {
            this.viewControlPanel.activeView.updateCameraForNeptuneOrbit();
        }
    }

    // Method to set global rotation speed factor (0-10)
    setGlobalRotationSpeed(factor) {
        // Apply to all planets
        if (this.planetObjs) {
            Object.values(this.planetObjs).forEach(planet => {
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
        if (this.planetObjs) {
            // Store the day/night state regardless of sun visibility
            this.dayNightEffectEnabled = enabled;

            const sunVisible = this.planetObjs.sun && this.planetObjs.sun.visible;

            Object.values(this.planetObjs).forEach(planet => {

                // Skip the sun itself
                if (planet !== this.planetObjs.sun && typeof planet.setDayNightEffectEnabled === 'function') {
                    planet.setDayNightEffectEnabled(enabled);
                }
            });
        }
    }

    // Method to set the scale mode state
    setScaleMode(state) {
        this.scaleModeState = state;
        console.log(`Scale mode set to: ${state}`);

        // Apply the appropriate scale mode data to all planets
        if (this.planetObjs) {
            Object.values(this.planetObjs).forEach(planet => {
                this.applyScaleModeToObject(planet);
            });
        }

        // Also apply to the sky if needed
        this.applyScaleModeToObject(this.sky);
        
        // Notify active view to update camera position based on new scale
        if (this.viewControlPanel && this.viewControlPanel.activeView) {
            if (this.viewControlPanel.activeView instanceof GlobalView) {
                // Check if we're using a default view (no saved state or at default position)
                const activeView = this.viewControlPanel.activeView;
                const viewType = activeView.viewType;
                
                // Reset all saved camera states to force recalculation
                GlobalView.lastCameraStates = {
                    'topView': null,
                    'generalView': null,
                    'sideView': null
                };
                
                // Update camera position for Neptune orbit
                activeView.updateCameraForNeptuneOrbit();
            }
        }
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
            case 'full-scale':
                modeData = object.fullScaleModeData;
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

            // Align Axis Size
            object.updateAxis();

            // Align Latitude Circles
            object.updateLatitudeCircles();

            // Align Ring
            object.updateRings();

            // Align Planet size
            object.updateSphere();

            // Align Planet local markers
            object.updateLocationMarkers();

            // Align Planet Orbit line
            object.updateOrbit();

            // Align Orbit Position Markers
            object.updateOrbitPositionMarkers();

        }
    }
}