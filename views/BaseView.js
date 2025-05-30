/**
 * Base class for all views in the solar system model
 * Provides common functionality and interface for different view types
 */
class BaseView {
    constructor() {
        // Reference to the scene, camera, and controls
        this.scene = null;
        this.camera = null;
        this.controls = null;
    }

    /**
     * Initialize the view with scene, camera, and controls
     * @param {THREE.Scene} scene - The scene
     * @param {THREE.Camera} camera - The camera
     * @param {THREE.OrbitControls} controls - The orbit controls
     */
    initialize(scene, camera, controls) {
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;
    }

    /**
     * Activate this view
     */
    activate() {
        // To be implemented by subclasses
    }

    /**
     * Deactivate this view
     */
    deactivate() {
        // To be implemented by subclasses
    }

    /**
     * Update the view (called on each animation frame)
     */
    update() {
        // To be implemented by subclasses
    }

    /**
     * Handle horizontal camera control slider
     * @param {number} value - The slider value
     */
    handleHorizontalControl(value) {
        // To be implemented by subclasses
    }

    /**
     * Handle vertical camera control slider
     * @param {number} value - The slider value
     */
    handleVerticalControl(value) {
        // To be implemented by subclasses
    }

    /**
     * Handle elevation camera control slider
     * @param {number} value - The slider value
     */
    handleElevationControl(value) {
        // To be implemented by subclasses
    }

    /**
     * Reset camera controls to default values
     * @param {string} control - The control to reset ('horizontal', 'vertical', 'elevation', or 'all')
     */
    resetCameraControl(control) {
        // To be implemented by subclasses
    }
    
    /**
     * Update UI controls to reflect current view settings
     * @param {Object} settings - The view settings
     * @param {Object} controls - The UI control elements
     */
    updateUIControls(settings, controls) {
        // To be implemented by subclasses
    }
    
    /**
     * Get current view settings
     * @param {Object} controls - The UI control elements
     * @returns {Object} The current view settings
     */
    getCurrentSettings(controls) {
        // To be implemented by subclasses
        return {};
    }
}