/**
 * Planet side view for viewing a specific planet
 */
class PlanetSideView extends BaseView {
    constructor(solarSystem) {
        super(solarSystem);
        this.planet = null;
        this.planetName = '';
        this.viewType = 'planetSideView';
    }
    
    /**
     * Set the planet to view
     * @param {string} planetName - Name of the planet (e.g., 'earth', 'mars')
     * @param {Object} planet - The planet object
     */
    setPlanet(planetName, planet) {
        this.planetName = planetName;
        this.planet = planet;
        
        // Set view type based on planet name
        this.viewType = `${planetName}SideView`;
        
        if (this.active) {
            this.applyViewSettings();
        }
    }
    
    /**
     * Activate the planet side view
     */
    activate() {
        super.activate();
        if (this.planet) {
            this.applyViewSettings();
        } else {
            console.warn('No planet set for PlanetSideView');
        }
    }
    
    /**
     * Apply the view settings for the current planet
     */
    applyViewSettings() {
        if (!this.planet) return;
        
        const camera = this.solarSystem.camera;
        const controls = this.solarSystem.controls;
        
        // Get camera settings for this planet's view
        // Use specific planet settings if available, otherwise use default planetSideView
        const cameraSettings = this.getCameraSettings(this.viewType) || 
                              this.getCameraSettings('planetSideView');
        
        // Get planet position
        const planetPosition = new THREE.Vector3();
        this.planet.group.getWorldPosition(planetPosition);
        
        // Calculate camera position based on settings
        const distance = this.planet.radius * 5; // Base distance is 5x radius
        
        // Apply camera settings for position
        camera.position.set(
            planetPosition.x + distance * Math.cos(cameraSettings.rotateHorizontalDefaultValue),
            planetPosition.y + distance * Math.sin(cameraSettings.rotateVerticalDefaultValue),
            planetPosition.z + distance * Math.cos(cameraSettings.rotateDepthDefaultValue)
        );
        
        // Set camera rotation using Euler angles
        camera.rotation.set(
            cameraSettings.rotateVerticalDefaultValue,
            cameraSettings.rotateHorizontalDefaultValue,
            cameraSettings.rotateDepthDefaultValue
        );
        
        // Also look at planet to ensure proper orientation
        camera.lookAt(planetPosition);
        
        // Update controls target
        if (controls) {
            controls.target.copy(planetPosition);
            controls.update();
        }
        
        console.log(`Applied ${this.viewType} camera settings:`, cameraSettings);
    }
    
    /**
     * Update the view (called in animation loop)
     */
    update() {
        if (this.active && this.planet) {
            // Update camera position if planet is moving
            this.applyViewSettings();
        }
    }
}