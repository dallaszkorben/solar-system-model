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
        this.viewSettings = {
            'topView': { horizontalAngle: 0, verticalAngle: 0, elevation: 0.01 },
            'sideView': { horizontalAngle: 0, verticalAngle: 0, elevation: 0.01 },
            'sunSideView': { horizontalAngle: 0, verticalAngle: 0, elevation: 0.025, longitude: 0, latitude: 0 },
            'mercurySideView': { horizontalAngle: 0, verticalAngle: 0, elevation: 0.025, longitude: 0, latitude: 0 },
            'venusSideView': { horizontalAngle: 0, verticalAngle: 0, elevation: 0.025, longitude: 0, latitude: 0 },
            'earthSideView': { horizontalAngle: 0, verticalAngle: 0, elevation: 0.025, longitude: 0, latitude: 0 },
            'marsSideView': { horizontalAngle: 0, verticalAngle: 0, elevation: 0.025, longitude: 0, latitude: 0 },
            'jupiterSideView': { horizontalAngle: 0, verticalAngle: 0, elevation: 0.025, longitude: 0, latitude: 0 },
            'saturnSideView': { horizontalAngle: 0, verticalAngle: 0, elevation: 0.025, longitude: 0, latitude: 0 },
            'uranusSideView': { horizontalAngle: 0, verticalAngle: 0, elevation: 0.025, longitude: 0, latitude: 0 },
            'neptuneSideView': { horizontalAngle: 0, verticalAngle: 0, elevation: 0.025, longitude: 0, latitude: 0 },
            'budapest': { horizontalAngle: Math.PI, verticalAngle: 0.0, elevation: 0.01 },
            'kiruna': { horizontalAngle: 0, verticalAngle: 0.0, elevation: 0.01 }
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
     * Update UI controls based on current view settings
     */
    updateUIControls() {
        if (!this.activeViewType || !this.viewSettings[this.activeViewType]) return;
        
        const settings = this.viewSettings[this.activeViewType];
        
        // Get references to the sliders from SolarSystem
        const solarSystem = window.solarSystem;
        if (!solarSystem) return;
        
        const horizontalInput = solarSystem.horizontalInput;
        const verticalInput = solarSystem.verticalInput;
        const elevationInput = solarSystem.elevationInput;
        
        if (horizontalInput) {
            if (this.activeView === this.planetSideView) {
                horizontalInput.value = settings.longitude || 0;
            } else {
                horizontalInput.value = -settings.horizontalAngle || 0;
            }
        }
        
        if (verticalInput) {
            if (this.activeView === this.planetSideView) {
                verticalInput.value = settings.latitude || 0;
            } else {
                verticalInput.value = settings.verticalAngle || 0;
            }
        }
        
        if (elevationInput && this.activeView === this.localView) {
            elevationInput.value = settings.elevation || 0.01;
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
        
        // Get references to the sliders from SolarSystem
        const solarSystem = window.solarSystem;
        if (!solarSystem) return;
        
        const horizontalInput = solarSystem.horizontalInput;
        const verticalInput = solarSystem.verticalInput;
        const elevationInput = solarSystem.elevationInput;
        
        if (this.activeView === this.globalView) {
            if (horizontalInput) {
                this.viewSettings[this.activeViewType].horizontalAngle = -parseFloat(horizontalInput.value);
            }
            if (verticalInput) {
                this.viewSettings[this.activeViewType].verticalAngle = parseFloat(verticalInput.value);
            }
        }
        else if (this.activeView === this.planetSideView) {
            if (horizontalInput) {
                this.viewSettings[this.activeViewType].longitude = parseFloat(horizontalInput.value);
            }
            if (verticalInput) {
                this.viewSettings[this.activeViewType].latitude = parseFloat(verticalInput.value);
            }
        }
        else if (this.activeView === this.localView) {
            if (horizontalInput) {
                this.viewSettings[this.activeViewType].horizontalAngle = -parseFloat(horizontalInput.value);
            }
            if (verticalInput) {
                this.viewSettings[this.activeViewType].verticalAngle = parseFloat(verticalInput.value);
            }
            if (elevationInput) {
                this.viewSettings[this.activeViewType].elevation = parseFloat(elevationInput.value);
            }
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