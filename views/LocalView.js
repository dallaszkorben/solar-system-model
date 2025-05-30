/**
 * LocalView class for viewing from Earth locations
 * Handles camera positioning for location-based views
 */
class LocalView extends BaseView {
    constructor() {
        super();
        this.activeLocation = null;
        this.locationCamera = null;
        
        // Camera orientation and elevation control variables
        this.horizontalAngle = 0;
        this.verticalAngle = 0;
        this.elevation = 0.01; // Default: 1% of Earth's radius
    }

    /**
     * Initialize with location camera
     * @param {LocationCamera} locationCamera - The location camera instance
     */
    setLocationCamera(locationCamera) {
        this.locationCamera = locationCamera;
    }

    /**
     * Activate this view for a specific location
     * @param {LocationMarker} location - The location marker
     */
    activate(location) {
        if (!this.locationCamera || !location) return;
        
        this.activeLocation = location;
        
        // Store original camera settings
        this.horizontalAngle = this.locationCamera.cameraHorizontalAngle;
        this.verticalAngle = this.locationCamera.cameraVerticalAngle;
        this.elevation = this.locationCamera.cameraElevation;
        
        // Activate the location camera view
        this.locationCamera.activateView(location);
    }

    /**
     * Deactivate this view
     */
    deactivate() {
        if (this.locationCamera && this.locationCamera.isActive) {
            this.locationCamera.deactivateView();
        }
        this.activeLocation = null;
    }

    /**
     * Update the view (called on each animation frame)
     */
    update() {
        if (this.locationCamera && this.locationCamera.isActive) {
            this.locationCamera.update();
        }
    }

    /**
     * Handle horizontal camera control slider
     * @param {number} value - The slider value
     */
    handleHorizontalControl(value) {
        if (!this.locationCamera || !this.locationCamera.isActive) return;
        
        this.horizontalAngle = -value; // Negate value to match expected direction
        this.locationCamera.cameraHorizontalAngle = this.horizontalAngle;
        this.locationCamera.updateView();
        
        // Request a render
        if (window.requestRender) {
            window.requestRender();
        }
    }

    /**
     * Handle vertical camera control slider
     * @param {number} value - The slider value
     */
    handleVerticalControl(value) {
        if (!this.locationCamera || !this.locationCamera.isActive) return;
        
        this.verticalAngle = value;
        this.locationCamera.cameraVerticalAngle = this.verticalAngle;
        this.locationCamera.updateView();
        
        // Request a render
        if (window.requestRender) {
            window.requestRender();
        }
    }

    /**
     * Handle elevation camera control slider
     * @param {number} value - The slider value
     */
    handleElevationControl(value) {
        if (!this.locationCamera || !this.locationCamera.isActive) return;
        
        this.elevation = value;
        this.locationCamera.cameraElevation = this.elevation;
        this.locationCamera.updateView();
        
        // Request a render
        if (window.requestRender) {
            window.requestRender();
        }
    }

    /**
     * Reset camera controls to default values
     * @param {string} control - The control to reset ('horizontal', 'vertical', 'elevation', or 'all')
     */
    resetCameraControl(control) {
        if (!this.locationCamera || !this.locationCamera.isActive) return;
        
        if (control === 'horizontal' || control === 'all') {
            this.horizontalAngle = 0;
            this.locationCamera.cameraHorizontalAngle = this.horizontalAngle;
        }
        
        if (control === 'vertical' || control === 'all') {
            this.verticalAngle = 0;
            this.locationCamera.cameraVerticalAngle = this.verticalAngle;
        }
        
        if (control === 'elevation' || control === 'all') {
            this.elevation = 0.01; // Default value
            this.locationCamera.cameraElevation = this.elevation;
        }
        
        if (control === 'horizontal' || control === 'vertical' || 
            control === 'elevation' || control === 'all') {
            this.locationCamera.updateView();
        }
    }
    
    /**
     * Update UI controls to reflect current view settings
     * @param {Object} settings - The view settings
     * @param {Object} controls - The UI control elements
     */
    updateUIControls(settings, controls) {
        if (!controls) return;
        
        // Update horizontal slider
        if (controls.horizontalInput) {
            controls.horizontalInput.value = -settings.horizontalAngle || 0;
        }
        
        // Update vertical slider
        if (controls.verticalInput) {
            controls.verticalInput.value = settings.verticalAngle || 0;
        }
        
        // Update elevation slider
        if (controls.elevationInput) {
            controls.elevationInput.value = settings.elevation || 0.01;
        }
    }
    
    /**
     * Get current view settings
     * @param {Object} controls - The UI control elements
     * @returns {Object} The current view settings
     */
    getCurrentSettings(controls) {
        if (!this.locationCamera || !this.locationCamera.isActive) {
            return { horizontalAngle: 0, verticalAngle: 0, elevation: 0.01 };
        }
        
        if (!controls || !controls.horizontalInput || !controls.verticalInput || !controls.elevationInput) {
            return {
                horizontalAngle: this.locationCamera.cameraHorizontalAngle,
                verticalAngle: this.locationCamera.cameraVerticalAngle,
                elevation: this.locationCamera.cameraElevation
            };
        }
        
        return {
            horizontalAngle: -parseFloat(controls.horizontalInput.value),
            verticalAngle: parseFloat(controls.verticalInput.value),
            elevation: parseFloat(controls.elevationInput.value)
        };
    }
}