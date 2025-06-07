/**
 * Local view for viewing from a specific location marker on a planet
 */
class LocalView extends BaseView {

    static defaultViewCamera = {
        rotateVerticalDefaultValue: Math.PI,
        rotateVerticalMinValue: 0,
        rotateVerticalMaxValue: 2*Math.PI,
        rotateVerticalStep: 0.01,

        rotateHorizontalDefaultValue: -0.2,
        rotateHorizontalMinValue: -Math.PI/2 + 0.001, //-0.2,
        rotateHorizontalMaxValue: 0, //-0.2, //Math.PI/2,
        rotateHorizontalStep: 0.01,

        traverseVerticalDefaultValue: 0.001,
        traverseVerticalMinValue: 0.001,
        traverseVerticalMaxValue: 0.1,
        traverseVerticalStep: 0.001,
    }

    static viewCameras = {
        'earth_kiruna': LocalView.defaultViewCamera,
        'earth_budapest': LocalView.defaultViewCamera,
        'mars_perseverance': LocalView.defaultViewCamera
    }

    constructor(solarSystem) {
        super(solarSystem);
        this.viewType = 'localView';
        this.targetPlanet = null;
        this.targetMarker = null;
        this.markerName = null;
        this.allowNavigation = false; // Navigation disabled for local views

        // Store settings for each location
        this.locationSettings = {};

        // Default camera orientation angles (will be overridden by viewCameras)
        this.verticalAngle = Math.PI;
        this.horizontalAngle = -0.2;
        this.cameraElevation = 0.01;
        this.verticalTranslate = 0.01;
    }

    /**
     * Set the specific planet and marker for this view
     * @param {string} planetName - Name of the planet (e.g., 'earth', 'mars')
     * @param {string} markerName - Name of the location marker (e.g., 'Kiruna', 'Budapest')
     */
    setTarget(planetName, markerName) {
        // Get the target planet from the solar system
        if (this.solarSystem && this.solarSystem.planetObjs) {
            this.targetPlanet = this.solarSystem.planetObjs[planetName];
            this.markerName = markerName;
            this.viewType = `${planetName}_${markerName.toLowerCase()}`;

            // Find the target marker
            if (this.targetPlanet && this.targetPlanet.locationMarkers) {
                this.targetMarker = this.targetPlanet.locationMarkers.find(
                    marker => marker.name === markerName
                );
            }

            // Load camera settings for this location
            this.loadCameraSettings();
        }
    }

    /**
     * Load camera settings for the current location
     */
    loadCameraSettings() {
        // Check if we have stored settings for this location
        if (this.locationSettings[this.viewType]) {
            // Use stored settings
            this.verticalAngle = this.locationSettings[this.viewType].verticalAngle;
            this.horizontalAngle = this.locationSettings[this.viewType].horizontalAngle;
            this.cameraElevation = this.locationSettings[this.viewType].cameraElevation;
            this.verticalTranslate = this.locationSettings[this.viewType].verticalTranslate || 0.01;
        } else {
            // Get default settings from viewCameras
            const cameraSettings = LocalView.viewCameras[this.viewType] || LocalView.defaultViewCamera;

            this.verticalAngle = cameraSettings.rotateVerticalDefaultValue;
            this.horizontalAngle = cameraSettings.rotateHorizontalDefaultValue;
            this.cameraElevation = cameraSettings.traverseVerticalDefaultValue;
            this.verticalTranslate = cameraSettings.traverseVerticalDefaultValue;

            // Store initial settings
            this.locationSettings[this.viewType] = {
                verticalAngle: this.verticalAngle,
                horizontalAngle: this.horizontalAngle,
                cameraElevation: this.cameraElevation,
                verticalTranslate: this.verticalTranslate
            };
        }
    }

    /**
     * Save current camera settings for the current location
     */
    saveCameraSettings() {
        if (this.viewType) {
            this.locationSettings[this.viewType] = {
                verticalAngle: this.verticalAngle,
                horizontalAngle: this.horizontalAngle,
                cameraElevation: this.cameraElevation,
                verticalTranslate: this.verticalTranslate
            };
        }
    }

    activate() {
        super.activate();

        if (this.targetPlanet && this.targetMarker) {
            // Store reference to the solarSystem in the planet for camera access
            this.targetPlanet.solarSystem = this.solarSystem;

            // Disable navigation
            if (this.solarSystem && this.solarSystem.controls) {
                this.solarSystem.controls.enabled = false;
            }

            console.log(`Activated local view at ${this.markerName} on ${this.targetPlanet.constructor.name}`);

            // Initial camera setup
            this.setupCamera();
        }
    }

    deactivate() {
        // Save current camera settings before deactivating
        this.saveCameraSettings();

        // Re-enable orbit controls when deactivating the view
        if (this.solarSystem && this.solarSystem.controls) {
            this.solarSystem.controls.enabled = true;
        }

        super.deactivate();
    }

    /**
     * Set up the initial camera position and orientation
     */
    setupCamera() {
        if (!this.targetPlanet || !this.targetMarker || !this.solarSystem || !this.solarSystem.camera) return;

        // Position camera at the marker's position
        this.updateCameraPosition();
    }

    /**
     * Update the camera position to follow the marker
     */
    updateCameraPosition() {
        if (!this.active || !this.targetPlanet || !this.targetMarker || !this.solarSystem.camera) return;

        // Get marker's world position
        const locationPos = new THREE.Vector3();
        this.targetMarker.marker.getWorldPosition(locationPos);

        // Get planet center position
        const planetPos = new THREE.Vector3();
        this.targetPlanet.sphere.getWorldPosition(planetPos);

        // Calculate the "up" direction (away from planet's center)
        const up = new THREE.Vector3(
            locationPos.x - planetPos.x,
            locationPos.y - planetPos.y,
            locationPos.z - planetPos.z
        ).normalize();

        // Position camera above the surface based on cameraElevation and verticalTranslate
        const elevationDistance = this.targetPlanet.radius * this.cameraElevation;
        const verticalDistance = this.targetPlanet.radius * this.verticalTranslate;

        // Calculate the total position with both elevation and vertical translate
        this.solarSystem.camera.position.set(
            locationPos.x + up.x * (elevationDistance + verticalDistance),
            locationPos.y + up.y * (elevationDistance + verticalDistance),
            locationPos.z + up.z * (elevationDistance + verticalDistance)
        );

        // Calculate the local coordinate system at the location
        // Get the planet's orbit group quaternion to account for orbit position
        const orbitQuaternion = this.targetPlanet.orbitGroup.quaternion.clone();

        // Get the planet's group quaternion to account for axial tilt
        const planetQuaternion = this.targetPlanet.group.quaternion.clone();

        // Combine the rotations
        const combinedQuaternion = planetQuaternion.premultiply(orbitQuaternion);

        // Apply the combined rotation to get the correct north pole direction
        const northPole = new THREE.Vector3(0, 1, 0).applyQuaternion(combinedQuaternion);

        // East is perpendicular to both up and north vectors
        const east = new THREE.Vector3().crossVectors(up, northPole).normalize();

        // South is perpendicular to both up and east vectors
        const south = new THREE.Vector3().crossVectors(east, up).normalize();

        // Create a rotation matrix for vertical rotation (around up vector)
        const verticalRotation = new THREE.Matrix4().makeRotationAxis(up, this.verticalAngle);

        // Apply vertical rotation to south vector to get initial view direction
        const viewDirection = south.clone().applyMatrix4(verticalRotation);

        // Create a rotation axis for horizontal rotation
        const rotatedEast = new THREE.Vector3().crossVectors(up, viewDirection).normalize();

        // Apply horizontal rotation to view direction
        const horizontalRotation = new THREE.Matrix4().makeRotationAxis(rotatedEast, this.horizontalAngle);
        viewDirection.applyMatrix4(horizontalRotation);

        // Set target point - make it far enough to ensure proper orientation
        const target = new THREE.Vector3(
            this.solarSystem.camera.position.x + viewDirection.x * 1000,
            this.solarSystem.camera.position.y + viewDirection.y * 1000,
            this.solarSystem.camera.position.z + viewDirection.z * 1000
        );

        // Look at target
        this.solarSystem.camera.lookAt(target);
        this.solarSystem.camera.up.copy(up);
    }

    /**
     * Set the vertical angle (compass direction)
     * @param {number} angle - Angle in radians
     */
    setVerticalAngle(angle) {
        this.verticalAngle = angle;
        this.saveCameraSettings();
    }

    /**
     * Set the horizontal angle (pitch)
     * @param {number} angle - Angle in radians
     */
    setHorizontalAngle(angle) {
        this.horizontalAngle = angle;
        this.saveCameraSettings();
    }

    /**
     * Set the camera elevation
     * @param {number} elevation - Elevation as a factor of planet radius
     */
    setCameraElevation(elevation) {
        this.cameraElevation = elevation;
        this.saveCameraSettings();
    }

    /**
     * Set the vertical translate value
     * @param {number} value - Vertical translate value
     */
    setVerticalTranslate(value) {
        this.verticalTranslate = value;
        this.saveCameraSettings();
    }

    /**
     * Update the camera position and orientation to follow the marker
     */
    update() {
        // Only update if view is active and we have a target marker
        if (!this.active || !this.targetPlanet || !this.targetMarker) return;

        // Update camera position to follow the marker as the planet rotates and orbits
        this.updateCameraPosition();
    }
}