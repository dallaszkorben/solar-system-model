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
        
        // Camera settings for different views
        this.cameraSettings = {
            'topView': { horizontalAngle: Math.PI, verticalAngle: 0, elevation: 0.01, longitude: 0 },
            'sideView': { horizontalAngle: Math.PI, verticalAngle: 0, elevation: 0.01, longitude: 0 },
            'sunSideView': { horizontalAngle: Math.PI, verticalAngle: 0, elevation: 0.025, longitude: 0 },
            'mercurySideView': { horizontalAngle: Math.PI, verticalAngle: 0, elevation: 0.025, longitude: 0 },
            'venusSideView': { horizontalAngle: Math.PI, verticalAngle: 0, elevation: 0.025, longitude: 0 },
            'earthSideView': { horizontalAngle: Math.PI, verticalAngle: 0, elevation: 0.025, longitude: 0 },
            'marsSideView': { horizontalAngle: Math.PI, verticalAngle: 0, elevation: 0.025, longitude: 0 },
            'jupiterSideView': { horizontalAngle: Math.PI, verticalAngle: 0, elevation: 0.025, longitude: 0 },
            'saturnSideView': { horizontalAngle: Math.PI, verticalAngle: 0, elevation: 0.025, longitude: 0 },
            'uranusSideView': { horizontalAngle: Math.PI, verticalAngle: 0, elevation: 0.025, longitude: 0 },
            'neptuneSideView': { horizontalAngle: Math.PI, verticalAngle: 0, elevation: 0.025, longitude: 0 },
            'budapest': { horizontalAngle: Math.PI, verticalAngle: 0.0, elevation: 0.01, longitude: 0 },
            'kiruna': { horizontalAngle: 0, verticalAngle: 0.0, elevation: 0.01, longitude: 0 }
        };
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
        
        // Initialize all views
        this.globalView.initialize(scene, camera, controls);
        this.planetSideView.initialize(scene, camera, controls);
        this.localView.initialize(scene, camera, controls);
        
        // Set location camera for local view
        this.localView.setLocationCamera(locationCamera);
        
        // Set top view as default
        this.setTopView();
    }

    /**
     * Set top view
     */
    setTopView() {
        // Deactivate current view if any
        this.deactivateCurrentView();
        
        // Activate global view with top view type
        this.globalView.activate('topView');
        
        // Update active view reference
        this.activeView = this.globalView;
        this.activeViewType = 'topView';
    }

    /**
     * Set side view
     */
    setSideView() {
        // Deactivate current view if any
        this.deactivateCurrentView();
        
        // Activate global view with side view type
        this.globalView.activate('sideView');
        
        // Update active view reference
        this.activeView = this.globalView;
        this.activeViewType = 'sideView';
    }

    /**
     * Set planet side view
     * @param {string} planetName - The name of the planet ('sun', 'mercury', etc.)
     * @param {Object} planet - The planet object
     */
    setPlanetSideView(planetName, planet) {
        // Deactivate current view if any
        this.deactivateCurrentView();
        
        // Activate planet side view
        this.planetSideView.activate(planet);
        
        // Update active view reference
        this.activeView = this.planetSideView;
        this.activeViewType = planetName + 'SideView';
    }

    /**
     * Set local view from Earth location
     * @param {LocationMarker} location - The location marker
     */
    setLocalView(location) {
        // Deactivate current view if any
        this.deactivateCurrentView();
        
        // Activate local view
        this.localView.activate(location);
        
        // Update active view reference
        this.activeView = this.localView;
        this.activeViewType = location.options.name.toLowerCase();
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
            if (this.activeViewType && this.cameraSettings[this.activeViewType]) {
                if (this.activeView === this.planetSideView) {
                    this.cameraSettings[this.activeViewType].longitude = value;
                } else {
                    this.cameraSettings[this.activeViewType].horizontalAngle = -value;
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
            if (this.activeViewType && this.cameraSettings[this.activeViewType]) {
                this.cameraSettings[this.activeViewType].verticalAngle = value;
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
            if (this.activeViewType && this.cameraSettings[this.activeViewType]) {
                this.cameraSettings[this.activeViewType].elevation = value;
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
            if (this.activeViewType && this.cameraSettings[this.activeViewType]) {
                if (control === 'horizontal' || control === 'all') {
                    this.cameraSettings[this.activeViewType].horizontalAngle = 0;
                    this.cameraSettings[this.activeViewType].longitude = 0;
                }
                
                if (control === 'vertical' || control === 'all') {
                    this.cameraSettings[this.activeViewType].verticalAngle = 0;
                }
                
                if (control === 'elevation' || control === 'all') {
                    this.cameraSettings[this.activeViewType].elevation = 0.01;
                }
            }
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