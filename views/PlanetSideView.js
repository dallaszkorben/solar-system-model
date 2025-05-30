/**
 * PlanetSideView class for viewing planets from a side perspective
 * Handles camera positioning and marker-based views for planets
 */
class PlanetSideView extends BaseView {
    constructor() {
        super();
        this.activePlanet = null;
        this.longitude = 0;
        this.latitude = 0;
    }

    /**
     * Activate this view for a specific planet
     * @param {Object} planet - The planet object to view
     */
    activate(planet) {
        if (!this.camera || !planet) return;
        
        this.activePlanet = planet;
        
        // Create marker if it doesn't exist
        if (!this.activePlanet.marker) {
            this.activePlanet.createMarker();
        }

        // Make marker visible
        this.activePlanet.setMarkerVisible(true);

        // Set up the marker view
        this.activePlanet.setPlanetMarkerView();
        
        // Initialize position
        this.latitude = 0;
        this.longitude = 0;
        this.updateMarkerPosition();
    }

    /**
     * Deactivate this view
     */
    deactivate() {
        if (this.activePlanet) {
            // Hide the marker
            this.activePlanet.setMarkerVisible(false);
            
            // Disable camera view
            if (this.activePlanet.planetMarker && this.activePlanet.planetMarker.cameraView) {
                this.activePlanet.planetMarker.setCameraView(false);
            }
            
            this.activePlanet = null;
        }
    }

    /**
     * Update marker position based on latitude and longitude
     */
    updateMarkerPosition() {
        if (!this.activePlanet || !this.activePlanet.planetMarker) return;
        
        this.activePlanet.planetMarker.updateMarkerPosition(this.latitude, this.longitude);
    }

    /**
     * Handle horizontal camera control slider (longitude)
     * @param {number} value - The slider value
     */
    handleHorizontalControl(value) {
        if (!this.activePlanet) return;
        
        this.longitude = value;
        this.updateMarkerPosition();
    }

    /**
     * Handle vertical camera control slider (latitude)
     * @param {number} value - The slider value
     */
    handleVerticalControl(value) {
        if (!this.activePlanet) return;
        
        // Constrain latitude to avoid issues at poles
        this.latitude = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, value));
        this.updateMarkerPosition();
    }

    /**
     * Handle elevation camera control slider
     * @param {number} value - The slider value
     */
    handleElevationControl(value) {
        // Planet side views don't use elevation control
    }

    /**
     * Reset camera controls to default values
     * @param {string} control - The control to reset ('horizontal', 'vertical', 'elevation', or 'all')
     */
    resetCameraControl(control) {
        if (control === 'horizontal' || control === 'all') {
            this.longitude = 0;
        }
        
        if (control === 'vertical' || control === 'all') {
            this.latitude = 0;
        }
        
        if (control === 'horizontal' || control === 'vertical' || control === 'all') {
            this.updateMarkerPosition();
        }
    }
}