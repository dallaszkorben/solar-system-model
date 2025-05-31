/**
 * Global view for viewing the entire solar system
 */
class GlobalView extends BaseView {
    constructor(solarSystem) {
        super(solarSystem);
        this.viewType = 'topView'; // Default to top view
    }
    
    /**
     * Set the specific global view type (top or side)
     * @param {string} viewType - 'topView' or 'sideView'
     */
    setViewType(viewType) {
        this.viewType = viewType;
        if (this.active) {
            this.applyViewSettings();
        }
    }
    
    /**
     * Activate the global view
     */
    activate() {
        super.activate();
        this.applyViewSettings();
    }
    
    /**
     * Apply the view settings based on the current view type
     */
    applyViewSettings() {
        const camera = this.solarSystem.camera;
        const controls = this.solarSystem.controls;
        
        // Get camera settings for this view type
        const cameraSettings = this.getCameraSettings(this.viewType);
        
        // Position camera using camera settings
        camera.position.set(
            cameraSettings.traverseHorizontalDefaultValue,
            cameraSettings.traverseVerticalDefaultValue,
            cameraSettings.traverseDepthDefaultValue
        );
        
        // Set camera rotation using Euler angles
        camera.rotation.set(
            cameraSettings.rotateVerticalDefaultValue,
            cameraSettings.rotateHorizontalDefaultValue,
            cameraSettings.rotateDepthDefaultValue
        );
        
        // Reset controls target to center
        if (controls) {
            controls.target.set(0, 0, 0);
            controls.update();
        }
        
        console.log(`Applied ${this.viewType} camera settings:`, cameraSettings);
    }
}