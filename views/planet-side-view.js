/**
 * Planet side view for viewing a specific planet
 */
class PlanetSideView extends BaseView {
    constructor(solarSystem) {
        super(solarSystem);
        this.viewType = 'sunSideView';
        this.targetPlanet = null;
    }

    /**
     * Set the specific planet view type
     * @param {string} viewType - e.g., 'sunSideView', 'mercurySideView', etc.
     */
    setViewType(viewType) {
        this.viewType = viewType;

        // Extract planet name from viewType (remove 'SideView' suffix)
        const planetName = viewType.replace('SideView', '');

        // Get the target planet from the solar system
        if (this.solarSystem && this.solarSystem.planets) {
            this.targetPlanet = this.solarSystem.planets[planetName];
        }
    }

    activate() {
        super.activate();

this.initialCameraSetup = false;

        if (this.targetPlanet) {
            // Store reference to the solarSystem in the planet for camera access
            this.targetPlanet.solarSystem = this.solarSystem;

            // Disable orbit controls to prevent camera conflicts
            //if (this.solarSystem && this.solarSystem.controls) {
            //    this.solarSystem.controls.enabled = false;
            //}

            // Show the side marker for the target planet
            this.targetPlanet.setSideMarkerVisible(true);

            // Store initial camera direction (fixed global direction)
            this.initialCameraDirection = new THREE.Vector3(0, 0, 1); // Default to looking along Z-axis

            // Store initial planet position for reference
            this.initialPlanetPosition = new THREE.Vector3();
            if (this.targetPlanet.sphere) {
                this.targetPlanet.sphere.getWorldPosition(this.initialPlanetPosition);
            }

            console.log(`Activated ${this.viewType} for planet: ${this.targetPlanet.constructor.name}`);
        }
    }

    deactivate() {
        if (this.targetPlanet) {
            // Hide the side marker when deactivating the view
            this.targetPlanet.setSideMarkerVisible(false);
        }

        // Re-enable orbit controls when deactivating the view
        if (this.solarSystem && this.solarSystem.controls) {
            this.solarSystem.controls.enabled = true;
        }

        super.deactivate();
    }

    /**
     * Update the camera position and orientation based on the target planet IN EVERY FRAME
     *
     * @returns
     */
    update() {
        // Only update if view is active and we have a target planet
        if (!this.active || !this.targetPlanet) return;

        // Make sure orbit controls remain disabled
        if (this.solarSystem && this.solarSystem.controls) {
            this.solarSystem.controls.enabled = false;
        }

        // Get current planet position
        const planetWorldPos = new THREE.Vector3();
        this.targetPlanet.sphere.getWorldPosition(planetWorldPos);

        // Calculate camera position in fixed global direction relative to planet
        // Use a fixed distance from the planet
        const cameraDistance = this.targetPlanet.diameter * this.targetPlanet.sideMarkerDistanceFactor;

        // Calculate camera position in global space
        const cameraPos = new THREE.Vector3();
        cameraPos.copy(planetWorldPos); // Start at planet position
        cameraPos.z += cameraDistance;  // Move in fixed global Z direction

        // Position the camera
        if (this.solarSystem.camera) {
            // Set camera position
            this.solarSystem.camera.position.copy(cameraPos);

            // Look at the planet
            this.solarSystem.camera.lookAt(planetWorldPos);

            // Ensure consistent up vector
            this.solarSystem.camera.up.set(0, 1, 0);
        }

        // Update side marker position to match camera position
        if (this.targetPlanet.sideMarker && this.targetPlanet.sideMarker.marker) {
            // Position marker at camera position
            const localPos = new THREE.Vector3();
            this.targetPlanet.sideMarkerGroup.worldToLocal(cameraPos, localPos);
            this.targetPlanet.sideMarker.marker.position.copy(localPos);
        }
    }

}