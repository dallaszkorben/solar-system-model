/**
 * ViewManager class to manage different views in the solar system model
 * Handles switching between views and camera control
 */
class ViewManager {
    constructor() {
        // References to scene, camera, and controls
        this.scene = null;
        this.camera = null;
        this.controls = null;

        // View instances
        this.globalView = new GlobalView();
        this.planetSideView = new PlanetSideView();
        this.localView = new LocalView();

        // Current active view
        this.activeView = null;
        this.activeViewType = null;

        // Camera settings for different views - will be initialized from SolarSystem
        this.viewSettings = {};
    }

    /**
     * Initialize the view manager with scene, camera, and controls
     * @param {THREE.Scene} scene - The scene
     * @param {THREE.Camera} camera - The camera
     * @param {THREE.OrbitControls} controls - The orbit controls
     * @param {LocationCamera} locationCamera - The location camera
     */
    initialize(scene, camera, controls, locationCamera) {
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;
        
        // Use SolarSystem's camera settings if available
        if (window.solarSystem && window.solarSystem.cameraSettings) {
            this.viewSettings = window.solarSystem.cameraSettings;
        }

        // Initialize all views
        this.globalView.initialize(scene, camera, controls);
        this.planetSideView.initialize(scene, camera, controls);
        this.localView.initialize(scene, camera, controls);

        // Set location camera for local view
        this.localView.setLocationCamera(locationCamera);

        // Initialize camera controls
        this.initializeCameraControls();

        // Set top view as default //it is needed-first time
        this.setTopView();
    }

    /**
     * Initialize camera controls with UI elements
     */
    initializeCameraControls() {
        // Get UI control elements
        const controls = this.getUIControls();
        if (!controls) return;

        // Create camera controls instance
        this.cameraControls = new CameraControls({
            viewSettings: this.viewSettings,
            onHorizontalChange: (value) => this.handleHorizontalControl(value),
            onVerticalChange: (value) => this.handleVerticalControl(value),
            onElevationChange: (value) => this.handleElevationControl(value)
        });

        // Initialize with UI elements
        this.cameraControls.initialize(
            controls.horizontalInput,
            controls.horizontalInput.nextElementSibling, // Reset icon
            controls.verticalInput,
            controls.verticalInput.nextElementSibling, // Reset icon
            controls.elevationInput,
            controls.elevationInput.nextElementSibling // Reset icon
        );
    }

    /**
     * Get UI control elements
     * @returns {Object} Object containing UI control elements
     */
    getUIControls() {
        const solarSystem = window.solarSystem;
        if (!solarSystem) return null;

        return {
            horizontalInput: solarSystem.horizontalInput,
            verticalInput: solarSystem.verticalInput,
            elevationInput: solarSystem.elevationInput
        };
    }

    /**
     * Update UI controls based on current view settings
     */
    updateUIControls() {
        if (!this.activeView || !this.activeViewType || !this.viewSettings[this.activeViewType]) return;

        const controls = this.getUIControls();
        if (!controls) return;

        // Let the active view update its own controls
        this.activeView.updateUIControls(this.viewSettings[this.activeViewType], controls);

        // Update camera controls if available
        if (this.cameraControls) {
            // Set active view type and category
            const viewCategory = this.getCurrentViewType();
            this.cameraControls.setActiveView(this.activeViewType, viewCategory);
        }
    }

    /**
     * Set top view
     */
    setTopView() {
        // Save current view settings if switching from another view
        this.saveCurrentViewSettings();

        // Deactivate current view if any
        this.deactivateCurrentView();

        // Activate global view with top view type
        this.globalView.activate('topView');

        // Update active view reference
        this.activeView = this.globalView;
        this.activeViewType = 'topView';

        // Apply stored settings
        this.applyViewSettings();

        // Update UI controls
        this.updateUIControls();
    }

    /**
     * Set side view
     */
    setSideView() {
        // Save current view settings if switching from another view
        this.saveCurrentViewSettings();

        // Deactivate current view if any
        this.deactivateCurrentView();

        // Activate global view with side view type
        this.globalView.activate('sideView');

        // Update active view reference
        this.activeView = this.globalView;
        this.activeViewType = 'sideView';

        // Apply stored settings
        this.applyViewSettings();

        // Update UI controls
        this.updateUIControls();
    }

    /**
     * Set planet side view
     * @param {string} planetName - The name of the planet ('sun', 'mercury', etc.)
     * @param {Object} planet - The planet object
     */
    setPlanetSideView(planetName, planet) {
        // Save current view settings if switching from another view
        this.saveCurrentViewSettings();

        // Deactivate current view if any
        this.deactivateCurrentView();

        // Activate planet side view
        this.planetSideView.activate(planet);

        // Update active view reference
        this.activeView = this.planetSideView;
        this.activeViewType = planetName + 'SideView';

        // Apply stored settings
        this.applyViewSettings();

        // Update UI controls
        this.updateUIControls();
    }

    /**
     * Set local view from Earth location
     * @param {LocationMarker} location - The location marker
     */
    setLocalView(location) {
        // Save current view settings if switching from another view
        this.saveCurrentViewSettings();

        // Deactivate current view if any
        this.deactivateCurrentView();

        // Activate local view
        this.localView.activate(location);

        // Update active view reference
        this.activeView = this.localView;
        this.activeViewType = location.options.name.toLowerCase();

        // Apply stored settings
        this.applyViewSettings();

        // Update UI controls
        this.updateUIControls();
    }

    /**
     * Save current view settings before switching views
     */
    saveCurrentViewSettings() {
        if (!this.activeView || !this.activeViewType) return;

        const controls = this.getUIControls();
        if (!controls) return;

        // Get settings from CameraControls if available
        if (this.cameraControls) {
            const viewCategory = this.getCurrentViewType();
            const cameraSettings = this.cameraControls.getCurrentValues(viewCategory);

            // Save the settings
            if (cameraSettings) {
                this.viewSettings[this.activeViewType] = {
                    ...this.viewSettings[this.activeViewType],
                    ...cameraSettings
                };
                return;
            }
        }

        // Fallback: Let the active view get its own settings
        const settings = this.activeView.getCurrentSettings(controls);

        // Save the settings
        if (settings) {
            this.viewSettings[this.activeViewType] = {
                ...this.viewSettings[this.activeViewType],
                ...settings
            };
        }
    }

    /**
     * Apply stored settings to the current view
     */
    applyViewSettings() {
        if (!this.activeViewType || !this.viewSettings[this.activeViewType]) return;

        const settings = this.viewSettings[this.activeViewType];

        if (this.activeView === this.globalView) {
            // Apply horizontal and vertical angles for global view
            this.handleHorizontalControl(-settings.horizontalAngle);
            this.handleVerticalControl(settings.verticalAngle);
        }
        else if (this.activeView === this.planetSideView) {
            // Apply longitude and latitude for planet side view
            this.handleHorizontalControl(settings.longitude || 0);
            this.handleVerticalControl(settings.latitude || 0);
        }
        else if (this.activeView === this.localView) {
            // Apply all settings for local view
            this.handleHorizontalControl(-settings.horizontalAngle);
            this.handleVerticalControl(settings.verticalAngle);
            this.handleElevationControl(settings.elevation);
        }
    }

    /**
     * Deactivate the current active view
     */
    deactivateCurrentView() {
        if (this.activeView) {
            this.activeView.deactivate();
        }
    }

    /**
     * Update the active view (called on each animation frame)
     */
    update() {
        if (this.activeView) {
            this.activeView.update();
        }
    }

    /**
     * Handle horizontal camera control slider
     * @param {number} value - The slider value
     */
    handleHorizontalControl(value) {
        if (this.activeView) {
            this.activeView.handleHorizontalControl(value);

            // Save the current setting for the active view
            if (this.activeViewType && this.viewSettings[this.activeViewType]) {
                if (this.activeView === this.planetSideView) {
                    this.viewSettings[this.activeViewType].longitude = value;
                } else {
                    this.viewSettings[this.activeViewType].horizontalAngle = -value;
                }
            }
        }
    }

    /**
     * Handle vertical camera control slider
     * @param {number} value - The slider value
     */
    handleVerticalControl(value) {
        if (this.activeView) {
            this.activeView.handleVerticalControl(value);

            // Save the current setting for the active view
            if (this.activeViewType && this.viewSettings[this.activeViewType]) {
                if (this.activeView === this.planetSideView) {
                    this.viewSettings[this.activeViewType].latitude = value;
                } else {
                    this.viewSettings[this.activeViewType].verticalAngle = value;
                }
            }
        }
    }

    /**
     * Handle elevation camera control slider
     * @param {number} value - The slider value
     */
    handleElevationControl(value) {
        if (this.activeView) {
            this.activeView.handleElevationControl(value);

            // Save the current setting for the active view
            if (this.activeViewType && this.viewSettings[this.activeViewType]) {
                this.viewSettings[this.activeViewType].elevation = value;
            }
        }
    }

    /**
     * Reset camera controls to default values
     * @param {string} control - The control to reset ('horizontal', 'vertical', 'elevation', or 'all')
     */
    resetCameraControl(control) {
        if (this.activeView) {
            this.activeView.resetCameraControl(control);

            // Reset saved settings
            if (this.activeViewType && this.viewSettings[this.activeViewType]) {
                if (control === 'horizontal' || control === 'all') {
                    if (this.activeView === this.planetSideView) {
                        this.viewSettings[this.activeViewType].longitude = 0;
                    } else {
                        this.viewSettings[this.activeViewType].horizontalAngle = 0;
                    }
                }

                if (control === 'vertical' || control === 'all') {
                    if (this.activeView === this.planetSideView) {
                        this.viewSettings[this.activeViewType].latitude = 0;
                    } else {
                        this.viewSettings[this.activeViewType].verticalAngle = 0;
                    }
                }

                if (control === 'elevation' || control === 'all') {
                    if (this.activeView === this.localView) {
                        this.viewSettings[this.activeViewType].elevation = 0.01;
                    }
                }
            }

            // Use CameraControls to reset if available
            if (this.cameraControls) {
                this.cameraControls.reset(control);
            }

            // Update UI controls to reflect reset settings
            this.updateUIControls();
        }
    }

    /**
     * Get the current view type
     * @returns {string} The current view type ('global', 'planet', or 'local')
     */
    getCurrentViewType() {
        if (this.activeView === this.globalView) {
            return 'global';
        } else if (this.activeView === this.planetSideView) {
            return 'planet';
        } else if (this.activeView === this.localView) {
            return 'local';
        }
        return 'global'; // Default
    }
}