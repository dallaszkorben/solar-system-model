/**
 * Planet side view for viewing a specific planet
 */
class PlanetSideView extends BaseView {
    constructor(solarSystem) {
        super(solarSystem);
        this.viewType = 'sunSideView';
        this.targetPlanet = null;
        this.initialCameraSetup = false;
        this.allowNavigation = false; // Whether to allow user navigation
        this.viewDirection = new THREE.Vector3(0, 0, 1); // Default view direction (along Z-axis)
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

    /**
     * Set whether user navigation is allowed
     * @param {boolean} allow - Whether to allow navigation
     */
    setAllowNavigation(allow) {
        this.allowNavigation = allow;

        // Enable/disable orbit controls based on navigation setting
        if (this.solarSystem && this.solarSystem.controls) {
            this.solarSystem.controls.enabled = allow;
        }
    }

    activate() {
        super.activate();
        this.initialCameraSetup = false;

        if (this.targetPlanet) {
            // Store reference to the solarSystem in the planet for camera access
            this.targetPlanet.solarSystem = this.solarSystem;

            // Configure navigation based on current setting
            this.setAllowNavigation(this.allowNavigation);

            // Show the side marker for the target planet
            this.targetPlanet.setSideMarkerVisible(true);

            console.log(`Activated ${this.viewType} for planet: ${this.targetPlanet.constructor.name}`);

            // Initial camera setup
            this.setupCamera();
        }
    }

    deactivate() {
        if (this.targetPlanet) {
            // Hide the side marker when deactivating the view
            this.targetPlanet.setSideMarkerVisible(false);
        }

        // Always re-enable orbit controls when deactivating the view
        if (this.solarSystem && this.solarSystem.controls) {
            this.solarSystem.controls.enabled = true;
        }

        super.deactivate();
    }

    /**
     * Set up the initial camera position and orientation
     */
    setupCamera() {
        if (!this.targetPlanet || !this.solarSystem || !this.solarSystem.camera) return;

        // Get current planet position
        const planetWorldPos = new THREE.Vector3();
        this.targetPlanet.sphere.getWorldPosition(planetWorldPos);

        // Calculate camera distance based on planet size and marker distance factor
        const cameraDistance = this.targetPlanet.diameter * this.targetPlanet.sideMarkerDistanceFactor;

        // Calculate camera position in global space
        const cameraPos = new THREE.Vector3();
        cameraPos.copy(planetWorldPos).add(
            this.viewDirection.clone().multiplyScalar(cameraDistance)
        );

        // Position the camera
        this.solarSystem.camera.position.copy(cameraPos);
        this.solarSystem.camera.lookAt(planetWorldPos);
        this.solarSystem.camera.up.set(0, 1, 0); // Ensure consistent up vector

        // Update orbit controls target if navigation is allowed
        if (this.allowNavigation && this.solarSystem.controls) {
            this.solarSystem.controls.target.copy(planetWorldPos);
            this.solarSystem.controls.update();
        }

        // Update side marker position
        this.updateMarkerPosition(cameraPos);

        this.initialCameraSetup = true;
    }

    /**
     * Update the side marker position
     * @param {THREE.Vector3} cameraPos - The camera position
     */
    updateMarkerPosition(cameraPos) {
        if (!this.targetPlanet || !this.targetPlanet.sideMarker || !this.targetPlanet.sideMarker.marker) return;

        // Position marker at a visible location between camera and planet
        const planetWorldPos = new THREE.Vector3();
        this.targetPlanet.sphere.getWorldPosition(planetWorldPos);

        // Calculate marker position (halfway between planet and camera)
        const markerWorldPos = new THREE.Vector3().addVectors(
            planetWorldPos,
            cameraPos
        ).multiplyScalar(0.5);

        // Convert to local space of the marker group
        const localPos = new THREE.Vector3();
        this.targetPlanet.sideMarkerGroup.worldToLocal(markerWorldPos, localPos);
        this.targetPlanet.sideMarker.marker.position.copy(localPos);
    }

    /**
     * Update the camera position and orientation based on the target planet
     */
    update() {
        // Only update if view is active and we have a target planet
        if (!this.active || !this.targetPlanet) return;

        // If navigation is not allowed, maintain fixed camera position
        if (!this.allowNavigation) {
            // Position camera at a specific angle around the planet's equator
            // You can change this angle to move the camera around the planet
            const horizontalAngleDiff = 0; // 0 = default position, Math.PI = opposite side
            this.positionCameraAtEquatorAngle(horizontalAngleDiff);
        }
        // If navigation is allowed, just update the marker position
        else if (this.solarSystem.camera) {
            // Update marker to be visible from current camera position
            this.updateMarkerPosition(this.solarSystem.camera.position);

            // Update orbit controls target to keep looking at the planet
            if (this.solarSystem.controls) {
                const planetWorldPos = new THREE.Vector3();
                this.targetPlanet.sphere.getWorldPosition(planetWorldPos);
                this.solarSystem.controls.target.copy(planetWorldPos);
            }
        }
    }


    /**
     * Position the camera at a specific angle around the planet's equator
     * @param {number} horizontalAngleDiff - Angle in radians to move around the equator (0 = current position, PI = opposite side)
     */
    positionCameraAtEquatorAngle(horizontalAngleDiff) {
        if (!this.targetPlanet || !this.solarSystem || !this.solarSystem.camera) return;

        // Get current planet position
        const planetWorldPos = new THREE.Vector3();
        this.targetPlanet.sphere.getWorldPosition(planetWorldPos);

        // Calculate camera distance based on planet size and marker distance factor
        const cameraDistance = this.targetPlanet.diameter * this.targetPlanet.sideMarkerDistanceFactor;

        // Add PI/2 to the angle to make 0 the default position
        const adjustedAngle = horizontalAngleDiff + Math.PI/2;

        // Start with a position in the equatorial plane
        const basePosition = new THREE.Vector3(
            Math.cos(adjustedAngle),
            0,
            Math.sin(adjustedAngle)
        );

        // Apply the planet's axial tilt (rotation around Z-axis)
        const tiltRadians = THREE.MathUtils.degToRad(this.targetPlanet.axialTilt);
        const tiltMatrix = new THREE.Matrix4().makeRotationZ(tiltRadians);
        basePosition.applyMatrix4(tiltMatrix);

        // Scale to the desired distance
        basePosition.multiplyScalar(cameraDistance);
        const cameraPos = new THREE.Vector3().addVectors(planetWorldPos, basePosition);

        // Position the camera
        this.solarSystem.camera.position.copy(cameraPos);
        this.solarSystem.camera.lookAt(planetWorldPos);

        // Keep the camera's up vector fixed at (0, 1, 0) regardless of planet tilt
        this.solarSystem.camera.up.set(0, 1, 0);

        // Update marker position
        this.updateMarkerPosition(cameraPos);

        // Update orbit controls if needed
        if (this.solarSystem.controls) {
            this.solarSystem.controls.target.copy(planetWorldPos);
        }
    }




    /**
     * Position the camera at a specific angle around the planet's equator
     * @param {number} horizontalAngleDiff - Angle in radians to move around the equator (0 = current position, PI = opposite side)
     */
    positionCameraAtOrbitPlane(horizontalAngleDiff) {
        if (!this.targetPlanet || !this.solarSystem || !this.solarSystem.camera) return;

        // Get current planet position
        const planetWorldPos = new THREE.Vector3();
        this.targetPlanet.sphere.getWorldPosition(planetWorldPos);

        // Calculate camera distance based on planet size and marker distance factor
        const cameraDistance = this.targetPlanet.diameter * this.targetPlanet.sideMarkerDistanceFactor;

        // Add PI/2 to the angle to make 0 the default position (what was previously at PI/2)
        const adjustedAngle = horizontalAngleDiff + Math.PI/2;

        // For planets, we want to view them in the orbit plane
        // Start with a position in the orbit plane (X-Z plane)
        const basePosition = new THREE.Vector3(
            Math.cos(adjustedAngle),
            0,
            Math.sin(adjustedAngle)
        );

        // Scale to the desired distance
        basePosition.multiplyScalar(cameraDistance);
        const cameraPos = new THREE.Vector3().addVectors(planetWorldPos, basePosition);

        // Position the camera
        this.solarSystem.camera.position.copy(cameraPos);
        this.solarSystem.camera.lookAt(planetWorldPos);

        // Set up vector to be perpendicular to the orbit plane
        this.solarSystem.camera.up.set(0, 1, 0);

        // Update marker position
        this.updateMarkerPosition(cameraPos);

        // Update orbit controls if needed
        if (this.solarSystem.controls) {
            this.solarSystem.controls.target.copy(planetWorldPos);
        }
    }

}