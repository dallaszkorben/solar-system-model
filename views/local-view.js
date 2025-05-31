/**
 * Local view for viewing from a specific location on a planet
 */
class LocalView extends BaseView {
    constructor(solarSystem) {
        super(solarSystem);
        this.location = null;
        this.locationName = '';
        this.viewType = 'localView';
    }
    
    /**
     * Set the location to view from
     * @param {string} locationName - Name of the location (e.g., 'budapest', 'kiruna')
     * @param {Object} location - The location marker object
     */
    setLocation(locationName, location) {
        this.locationName = locationName;
        this.location = location;
        
        // Set view type based on location name
        this.viewType = locationName;
        
        if (this.active) {
            this.applyViewSettings();
        }
    }
    
    /**
     * Activate the local view
     */
    activate() {
        super.activate();
        if (this.location) {
            this.applyViewSettings();
        } else {
            console.warn('No location set for LocalView');
        }
    }
    
    /**
     * Apply the view settings for the current location
     */
    applyViewSettings() {
        if (!this.location) return;
        
        const camera = this.solarSystem.camera;
        const controls = this.solarSystem.controls;
        
        // Get camera settings for this location's view
        // Use specific location settings if available, otherwise use default localView
        const cameraSettings = this.getCameraSettings(this.viewType) || 
                              this.getCameraSettings('localView');
        
        // Get location position and orientation
        // This is a placeholder - actual implementation would depend on how locations are defined
        const locationPosition = new THREE.Vector3();
        if (this.location.getWorldPosition) {
            this.location.getWorldPosition(locationPosition);
        }
        
        // Position camera at location with offsets from camera settings
        camera.position.copy(locationPosition);
        camera.position.add(new THREE.Vector3(
            cameraSettings.traverseHorizontalDefaultValue,
            cameraSettings.traverseVerticalDefaultValue,
            cameraSettings.traverseDepthDefaultValue
        ));
        
        // Set camera rotation using Euler angles
        camera.rotation.set(
            cameraSettings.rotateVerticalDefaultValue,
            cameraSettings.rotateHorizontalDefaultValue,
            cameraSettings.rotateDepthDefaultValue
        );
        
        // Calculate look direction based on camera settings
        const lookDirection = new THREE.Vector3(
            Math.cos(cameraSettings.rotateHorizontalDefaultValue) * Math.cos(cameraSettings.rotateVerticalDefaultValue),
            Math.sin(cameraSettings.rotateVerticalDefaultValue),
            Math.sin(cameraSettings.rotateHorizontalDefaultValue) * Math.cos(cameraSettings.rotateVerticalDefaultValue)
        );
        
        const lookTarget = new THREE.Vector3().copy(camera.position).add(lookDirection);
        camera.lookAt(lookTarget);
        
        // Update controls target
        if (controls) {
            controls.target.copy(lookTarget);
            controls.update();
        }
        
        console.log(`Applied ${this.viewType} camera settings:`, cameraSettings);
    }
    
    /**
     * Update the view (called in animation loop)
     */
    update() {
        if (this.active && this.location) {
            // Update camera position if location is moving (e.g., on a rotating planet)
            this.applyViewSettings();
        }
    }
}