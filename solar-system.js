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

        // Raycaster for planet click detection
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

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

            // Configure controls to work better with our click handling
            this.controls.enablePan = true;
            this.controls.enableRotate = true;
            this.controls.enableZoom = true;
            this.controls.mouseButtons = {
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN
            };

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

            // Add click event listeners for planet selection after everything is initialized
            // This ensures the canvas is fully set up
            setTimeout(() => {
                this.setupClickListeners();
            }, 1000);

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

    /**
     * Setup click event listeners for planet selection
     */
    setupClickListeners() {
        // Add a simple debug message to confirm method is called
        console.log("Setting up click listeners");

        // Get the canvas element directly
        const canvas = document.getElementById('canvas');
        if (!canvas) {
            console.error("Canvas element not found");
            return;
        }

        // Store reference to this
        const self = this;

        // Add click event listener directly to the canvas
        canvas.onclick = function(event) {
            console.log("Canvas clicked");
            self.handleClick(event);
        };

        console.log("Click listener attached to canvas");
    }

    /**
     * Handle click events for planet selection
     */
    handleClick(event) {
        console.log("Handling click event");

        // Calculate mouse position in normalized device coordinates (-1 to +1)
        const canvas = this.renderer.domElement;
        const rect = canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Check intersections with all objects in the scene
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        // Find the first intersection that has planet data
        for (let i = 0; i < intersects.length; i++) {
            const object = intersects[i].object;

            // Check if this is a planet sphere or part of one
            let currentObj = object;
            while (currentObj) {
                if (currentObj.userData && currentObj.userData.planetId) {
                    const planetId = currentObj.userData.planetId;
                    console.log(`Found planet with ID: ${planetId}`);

                    // Get the planet object
                    const planet = this.planetObjs[planetId];
                    if (planet) {
                        // Get the control panel for this planet
                        const controlPanel = this.solarSystemControlPanel.controlPanels[planetId];
                        if (controlPanel) {
                            // Position the control panel near the click position
                            controlPanel.consolePane.style.top = `${event.clientY}px`;
                            controlPanel.consolePane.style.left = `${event.clientX}px`;

                            // Show the control panel
                            controlPanel.show();

                            // Update the toggle in the Solar System Control panel
                            const toggle = document.getElementById(`${planetId}-controls-toggle`);
                            if (toggle) {
                                toggle.checked = true;
                            }

                            return; // Exit after showing control panel
                        }
                    }
                }

                // Move up the parent chain
                currentObj = currentObj.parent;
            }
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

            // Update Own Light controls in all planet panels
            if (this.solarSystemControlPanel && this.solarSystemControlPanel.controlPanels) {
                Object.values(this.solarSystemControlPanel.controlPanels).forEach(panel => {
                    if (panel && typeof panel.updateOwnLightControlState === 'function') {
                        panel.updateOwnLightControlState(enabled);
                    }
                });
            }
        }
    }

    // Take a stereographic screenshot
    takeStereographicScreenshot(eyeSeparation = 0.05) {
        // Create directory if it doesn't exist
        try {
            // Store original camera position
            const originalPosition = this.camera.position.clone();
            
            // Create a new renderer for offscreen rendering
            const width = window.innerWidth;
            const height = window.innerHeight;
            const renderTarget = new THREE.WebGLRenderTarget(width, height);
            
            // Left eye view (shift camera left)
            this.camera.position.x = originalPosition.x - eyeSeparation;
            this.renderer.setRenderTarget(renderTarget);
            this.renderer.render(this.scene, this.camera);
            const leftImageData = new Uint8Array(width * height * 4);
            this.renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, leftImageData);
            
            // Right eye view (shift camera right)
            this.camera.position.x = originalPosition.x + eyeSeparation;
            this.renderer.render(this.scene, this.camera);
            const rightImageData = new Uint8Array(width * height * 4);
            this.renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, rightImageData);
            
            // Reset camera position and render target
            this.camera.position.copy(originalPosition);
            this.renderer.setRenderTarget(null);
            
            // Create a canvas to combine the images
            const canvas = document.createElement('canvas');
            canvas.width = width * 2;  // Side by side format
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // Create ImageData objects for left and right images
            const leftImg = new ImageData(new Uint8ClampedArray(leftImageData), width, height);
            const rightImg = new ImageData(new Uint8ClampedArray(rightImageData), width, height);
            
            // Create temporary canvases to draw the images
            const tempCanvas1 = document.createElement('canvas');
            tempCanvas1.width = width;
            tempCanvas1.height = height;
            const tempCtx1 = tempCanvas1.getContext('2d');
            tempCtx1.putImageData(leftImg, 0, 0);
            
            const tempCanvas2 = document.createElement('canvas');
            tempCanvas2.width = width;
            tempCanvas2.height = height;
            const tempCtx2 = tempCanvas2.getContext('2d');
            tempCtx2.putImageData(rightImg, 0, 0);
            
            // Draw the images side by side
            ctx.drawImage(tempCanvas1, 0, 0);
            ctx.drawImage(tempCanvas2, width, 0);
            
            // Convert to data URL and trigger download
            const dataURL = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            link.download = `stereograph-${timestamp}.png`;
            link.href = dataURL;
            link.click();
            
            // Clean up
            renderTarget.dispose();
            
            return dataURL;
        } catch (error) {
            console.error('Error creating stereographic image:', error);
            return null;
        }
    }
    
    // Method to set the scale mode state
    setScaleMode(state) {
        this.scaleModeState = state;
        console.log(`Scale mode set to: ${state}`);

        // Update camera clipping planes based on scale mode
        if (state === 'full-scale') {
            this.camera.near = 0.1;
            this.camera.far = 10000000000; // 10 billion - much larger for full scale
            Planet.orbitSegments = 1024; // More segments for full scale
        } else if (state === 'distance-scale') {
            this.camera.near = 0.01;
            this.camera.far = 1000000000; // 1 billion
            Planet.orbitSegments = 512; // Medium segments for distance scale
        } else {
            this.camera.near = 0.01;
            this.camera.far = 100000000; // Original value
            Planet.orbitSegments = 128; // Fewer segments for no/size scale
        }
        this.camera.updateProjectionMatrix();

        // Apply the appropriate scale mode data to all planets and sky
        if (this.planetObjs) {
            Object.values(this.planetObjs).forEach(planet => {
                this.applyScaleModeToObject(planet);
            });
        }

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

            // Update North Pole Axis for Earth
            if (object.id === 'earth' && typeof object.updateNorthPoleAxis === 'function') {
                object.updateNorthPoleAxis();
            }
        }
    }
}