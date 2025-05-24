/**
 * Location Camera for viewing from Earth locations
 */
class LocationCamera {
    constructor() {
        this.activeLocation = null;
        this.originalCamera = null;
        this.locationCamera = null;
        this.viewDirection = 0; // 0 = south, PI/2 = west, PI = north, 3*PI/2 = east
        this.viewElevation = 0; // 0 = horizontal, positive = looking up, negative = looking down
        this.cameraHeight = 0.01; // Legacy: Camera height as a percentage of Earth's radius
        this.earth = null;
        this.isActive = false;

        // Camera orientation and elevation control variables
        // These will be overridden by SolarSystem settings
        this.defaultHorizontalAngle = 0;
        this.defaultVerticalAngle = 0;
        this.defaultElevation = 0.01;             // Default: 1% of Earth's radius

        // Set initial values to defaults
        this.cameraHorizontalAngle = this.defaultHorizontalAngle;
        this.cameraVerticalAngle = this.defaultVerticalAngle;
        this.cameraElevation = this.defaultElevation;

        // Store camera settings for each location
        this.locationSettings = {};
    }

    /**
     * Set the Earth reference
     * @param {Earth} earth - The Earth object
     */
    setEarth(earth) {
        this.earth = earth;
    }



    /**
     * Activate camera view from a specific location
     * @param {LocationMarker} location - The location marker
     */
    activateView(location) {
        if (!this.earth || !location || !location.mesh) return;
        
        // If already in a location view, properly deactivate it first
        if (this.isActive) {
            this.deactivateView();
        }

        // Store original camera
        this.originalCamera = camera;

        // Create a new camera for location view with narrower FOV to reduce fisheye effect
        this.locationCamera = new THREE.PerspectiveCamera(
            45, // Reduced from 75 to 45 degrees for less fisheye distortion
            window.innerWidth / window.innerHeight,
            0.1,
            1000000
        );

        this.activeLocation = location;
        this.isActive = true;

        // Get location ID for settings storage
        const locationId = location.options.name.toLowerCase();

        // Check if we have stored settings for this location
        if (this.locationSettings[locationId]) {
            // Use stored settings
            this.cameraHorizontalAngle = this.locationSettings[locationId].horizontalAngle;
            this.cameraVerticalAngle = this.locationSettings[locationId].verticalAngle;
            this.cameraElevation = this.locationSettings[locationId].elevation;
        } else {
            // Get settings from SolarSystem if available
            if (window.solarSystem && window.solarSystem.cameraSettings && window.solarSystem.cameraSettings[locationId]) {
                this.cameraHorizontalAngle = window.solarSystem.cameraSettings[locationId].horizontalAngle;
                this.cameraVerticalAngle = window.solarSystem.cameraSettings[locationId].verticalAngle;
                this.cameraElevation = window.solarSystem.cameraSettings[locationId].elevation;
            } else {
                // Fall back to default values
                this.cameraHorizontalAngle = this.defaultHorizontalAngle;
                this.cameraVerticalAngle = this.defaultVerticalAngle;
                this.cameraElevation = this.defaultElevation;
            }

            // Store initial settings
            this.locationSettings[locationId] = {
                horizontalAngle: this.cameraHorizontalAngle,
                verticalAngle: this.cameraVerticalAngle,
                elevation: this.cameraElevation
            };
        }

        console.log("Camera activated with horizontal angle:", this.cameraHorizontalAngle,
                    "vertical angle:", this.cameraVerticalAngle);

        // Reset legacy view direction variable
        this.viewDirection = this.cameraHorizontalAngle;

        // Use location camera for rendering
        camera = this.locationCamera;

        // Update the camera position
        this.updateView();

        // Store original controls state and disable orbit controls
        if (controls) {
            this.originalControlsEnabled = controls.enabled;
            controls.enabled = false;
        }
    }

    /**
     * Update the camera position and orientation
     */
    updateView() {
        if (!this.isActive || !this.locationCamera || !this.activeLocation || !this.earth) return;

        // Save current settings for this location
        if (this.activeLocation && this.activeLocation.options) {
            const locationId = this.activeLocation.options.name.toLowerCase();
            this.locationSettings[locationId] = {
                horizontalAngle: this.cameraHorizontalAngle,
                verticalAngle: this.cameraVerticalAngle,
                elevation: this.cameraElevation
            };
        }

        // Get location position in world space
        const locationPos = new THREE.Vector3();
        this.activeLocation.mesh.getWorldPosition(locationPos);

        // Calculate the "up" direction (away from Earth's center)
        const earthPos = new THREE.Vector3();
        this.earth.sphere.getWorldPosition(earthPos);

        const up = new THREE.Vector3(
            locationPos.x - earthPos.x,
            locationPos.y - earthPos.y,
            locationPos.z - earthPos.z
        ).normalize();

        // Position camera above the surface based on cameraElevation setting
        const elevationDistance = this.earth.radius * this.cameraElevation;

        this.locationCamera.position.set(
            locationPos.x + up.x * elevationDistance,
            locationPos.y + up.y * elevationDistance,
            locationPos.z + up.z * elevationDistance
        );

        // Calculate the local coordinate system at the location
        // First get the north direction from the Earth's rotation axis
        // We need to account for both the Earth's tilt and its orbit position

        // Get the Earth's orbit group quaternion to account for orbit position
        const orbitQuaternion = this.earth.orbitGroup.quaternion.clone();

        // Get the Earth's group quaternion to account for axial tilt
        const earthQuaternion = this.earth.group.quaternion.clone();

        // Combine the rotations: first apply orbit rotation, then Earth's own rotation
        // This ensures the north pole direction is correctly calculated regardless of orbit position
        const combinedQuaternion = earthQuaternion.premultiply(orbitQuaternion);

        // Apply the combined rotation to get the correct north pole direction
        const northPole = new THREE.Vector3(0, 1, 0).applyQuaternion(combinedQuaternion);

        // East is perpendicular to both up and north vectors
        const east = new THREE.Vector3().crossVectors(up, northPole).normalize();

        // South is perpendicular to both up and east vectors
        const south = new THREE.Vector3().crossVectors(east, up).normalize();

        // Create a rotation matrix for horizontal rotation (around up vector)
        const horizontalRotation = new THREE.Matrix4().makeRotationAxis(up, this.cameraHorizontalAngle);

        // Apply horizontal rotation to south vector to get initial view direction
        // This gives us a vector that points in the desired compass direction
        const viewDirection = south.clone().applyMatrix4(horizontalRotation);

        // Create a rotation axis for vertical rotation
        // We need an east vector that's perpendicular to both up and the current view direction
        const rotatedEast = new THREE.Vector3().crossVectors(up, viewDirection).normalize();

        // The vertical angle needs to be perpendicular to the view direction
        // For camera orientation: positive angles look up, negative angles look down
        const verticalRotation = new THREE.Matrix4().makeRotationAxis(rotatedEast, this.cameraVerticalAngle);

        // Apply vertical rotation to view direction
        viewDirection.applyMatrix4(verticalRotation);

        // Set target point - make it far enough to ensure proper orientation
        const target = new THREE.Vector3(
            locationPos.x + viewDirection.x * 1000,
            locationPos.y + viewDirection.y * 1000,
            locationPos.z + viewDirection.z * 1000
        );

        // Look at target
        this.locationCamera.lookAt(target);
        this.locationCamera.up.copy(up);

        // Update camera aspect ratio if window was resized
        this.locationCamera.aspect = window.innerWidth / window.innerHeight;
        this.locationCamera.updateProjectionMatrix();

        // Limit the vertical angle to prevent flipping
        // Allow range from -80 to +80 degrees
        this.cameraVerticalAngle = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, this.cameraVerticalAngle));

        // Update legacy view direction variable for compatibility
        this.viewDirection = this.cameraHorizontalAngle;

        // Don't update orbit controls target when in location view
        // This prevents conflicts with the camera controls
    }

    /**
     * Deactivate the location camera view
     */
    deactivateView() {
        if (!this.isActive) return;

        this.isActive = false;
        this.activeLocation = null;

        // Restore original camera
        if (this.originalCamera) {
            camera = this.originalCamera;

            // Reset controls target and restore original controls state
            if (controls) {
                controls.target.set(0, 0, 0);
                controls.enabled = this.originalControlsEnabled !== undefined ? this.originalControlsEnabled : true;
                controls.update();
            }
        }
        
        // Force reset the controls to ensure they're properly re-enabled
        if (controls) {
            setTimeout(() => {
                controls.enabled = true;
                controls.update();
            }, 0);
        }
    }

    /**
     * Update the camera position if a location view is active
     */
    update() {
        if (this.isActive) {
            this.updateView();
        }
    }
}