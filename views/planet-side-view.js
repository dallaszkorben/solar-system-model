/**
 * Planet side view for viewing a specific planet
 */
class PlanetSideView extends BaseView {

    static defaultViewCamera = {
        rotateVerticalDefaultValue: 0,
        rotateVerticalMinValue: -Math.PI/2,
        rotateVerticalMaxValue: Math.PI/2,
        rotateVerticalStep: 0.01,

        rotateHorizontalDefaultValue: 0,
        rotateHorizontalMinValue: -Math.PI/2 + 0.0001,
        rotateHorizontalMaxValue: Math.PI/2,
        rotateHorizontalStep: 0.01,

        traverseDepthDefaultValue: 2,
        traverseDepthMinValue: 0.6,
        traverseDepthMaxValue: 5,
        traverseDepthStep: 0.01
    }

    static viewCameras = {
        'sunSideView': PlanetSideView.defaultViewCamera,
        'mercurySideView': PlanetSideView.defaultViewCamera,
        'venusSideView': PlanetSideView.defaultViewCamera,
        'earthSideView': PlanetSideView.defaultViewCamera,
        'marsSideView': PlanetSideView.defaultViewCamera,
        'jupiterSideView': PlanetSideView.defaultViewCamera,
        'saturnSideView': PlanetSideView.defaultViewCamera,
        'uranusSideView': PlanetSideView.defaultViewCamera,
        'neptuneSideView': PlanetSideView.defaultViewCamera
    }

    constructor(solarSystem) {
        super(solarSystem);
        this.viewType = 'sunSideView';
        this.targetPlanet = null;
        this.initialCameraSetup = false;
        this.allowNavigation = false; // Whether to allow user navigation
        this.viewDirection = new THREE.Vector3(0, 0, 1); // Default view direction (along Z-axis)

        // Create yellow sphere marker
        this.createYellowSphereMarker();
    }

    // Create a yellow sphere marker
    createYellowSphereMarker() {
        const geometry = new THREE.SphereGeometry(1, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.yellowSphere = new THREE.Mesh(geometry, material);
        this.yellowSphere.visible = false;

        // Add to scene
        if (this.solarSystem && this.solarSystem.scene) {
            this.solarSystem.scene.add(this.yellowSphere);
        }
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
        if (this.solarSystem && this.solarSystem.planetObjs) {
            this.targetPlanet = this.solarSystem.planetObjs[planetName];
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

            console.log(`Activated ${this.viewType} for planet: ${this.targetPlanet.constructor.name}`);

            // Initial camera setup
            this.setupCamera();

            // Make yellow sphere visible
            if (this.yellowSphere) {
                this.yellowSphere.visible = true;
            }
        }
    }

    deactivate() {
        // Always re-enable orbit controls when deactivating the view
        if (this.solarSystem && this.solarSystem.controls) {
            this.solarSystem.controls.enabled = true;
        }

        // Hide yellow sphere
        if (this.yellowSphere) {
            this.yellowSphere.visible = false;
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

        // Get absolute distance factor from viewCameras if available, otherwise use default (1.5)
        let distanceFactor = 1.5; // Default is 1.5 (surface + radius)

        // Check if we have camera settings for this planet
        if (PlanetSideView.viewCameras && PlanetSideView.viewCameras[this.viewType] &&
            PlanetSideView.viewCameras[this.viewType].traverseDepthDefaultValue !== undefined) {
            distanceFactor = PlanetSideView.viewCameras[this.viewType].traverseDepthDefaultValue;
        }

        // Calculate camera distance based on planet size and absolute distance factor
        const cameraDistance = this.targetPlanet.diameter * distanceFactor;

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

        this.initialCameraSetup = true;
    }

    /**
     * Update the camera position and orientation based on the target planet
     */
    update() {
        // Only update if view is active and we have a target planet
        if (!this.active || !this.targetPlanet) return;

        // If navigation is not allowed, maintain fixed camera position
        if (!this.allowNavigation) {
            // Get the current planet name
            const planetName = this.viewType.replace('SideView', '');

            // Get angles from control panel if available
            let verticalAngleDiff = 0;
            let horizontalAngleDiff = 0;
            let depthTranslate = 1.5; // Default absolute distance

            // Check if there's a control panel with slider values
            if (this.solarSystem.viewControlPanel &&
                this.solarSystem.viewControlPanel.planetSliderValues &&
                this.solarSystem.viewControlPanel.planetSliderValues[planetName]) {

                const planetValues = this.solarSystem.viewControlPanel.planetSliderValues[planetName];

                if (planetValues.vertical !== undefined) {
                    verticalAngleDiff = planetValues.vertical;
                }

                if (planetValues.horizontal !== undefined) {
                    horizontalAngleDiff = planetValues.horizontal;
                }

                if (planetValues.depth !== undefined) {
                    depthTranslate = planetValues.depth;
                }
            }

            // Position camera using the angles and absolute depth
            this.positionCameraAtEquatorAngle(-verticalAngleDiff, horizontalAngleDiff, depthTranslate);
            //this.positionCameraAtOrbitPlane(-verticalAngleDiff, horizontalAngleDiff, depthTranslate);
        }
        // If navigation is allowed, just update the orbit controls
        else if (this.solarSystem.camera && this.solarSystem.controls) {
            // Update orbit controls target to keep looking at the planet
            const planetWorldPos = new THREE.Vector3();
            this.targetPlanet.sphere.getWorldPosition(planetWorldPos);
            this.solarSystem.controls.target.copy(planetWorldPos);
        }

        // Update yellow sphere position and size
        this.updateYellowSphere();
    }

    // Update the yellow sphere position and size
    updateYellowSphere() {
        if (!this.yellowSphere || !this.targetPlanet || !this.solarSystem || !this.solarSystem.camera) return;

        // Get planet position
        const planetWorldPos = new THREE.Vector3();
        this.targetPlanet.sphere.getWorldPosition(planetWorldPos);

        // Calculate position in front of camera
        const cameraDir = new THREE.Vector3();
        this.solarSystem.camera.getWorldDirection(cameraDir);

        // Position sphere in front of camera
        const spherePos = new THREE.Vector3();
        spherePos.copy(this.solarSystem.camera.position).add(
            cameraDir.multiplyScalar(-this.targetPlanet.diameter * 0.5)
        );

        // Set sphere position
        this.yellowSphere.position.copy(spherePos);

        // Set sphere size to 1/10th of planet diameter
        const size = this.targetPlanet.diameter / 10;
        this.yellowSphere.scale.set(size, size, size);
    }

    /**
     * Position the camera at a specific angle around the planet's equator and meridian
     * @param {number} verticalAngleDiff - Angle in radians to move around the equator (0 = current position, PI = opposite side)
     * @param {number} horizontalAngleDiff - Angle in radians to move up/down along meridian (PI/2 = north pole, -PI/2 = south pole, 0 = equator)
     * @param {number} depthTranslate - Factor of planet diameter for absolute camera distance (0.5 = surface, 1 = radius beyond surface, etc.)
     */
    positionCameraAtEquatorAngle(verticalAngleDiff = 0, horizontalAngleDiff = 0, depthTranslate = 1.5) {
        if (!this.targetPlanet || !this.solarSystem || !this.solarSystem.camera) return;

        // Get planet position
        const planetWorldPos = new THREE.Vector3();
        this.targetPlanet.sphere.getWorldPosition(planetWorldPos);

        // Use the common method to calculate camera position
        const cameraPos = this.solarSystem.calculateEquatorialPosition(
            this.targetPlanet,
            verticalAngleDiff,
            horizontalAngleDiff,
            depthTranslate
        );

        if (!cameraPos) return;

        // Position the camera
        this.solarSystem.camera.position.copy(cameraPos);
        this.solarSystem.camera.lookAt(planetWorldPos);

        // Keep the camera's up vector fixed at (0, 1, 0) regardless of planet tilt
        this.solarSystem.camera.up.set(0, 1, 0);

        // Update orbit controls if needed
        if (this.solarSystem.controls) {
            this.solarSystem.controls.target.copy(planetWorldPos);
        }
    }

    /**
     * Position the camera at a specific angle around the planet in the orbit plane
     * @param {number} verticalAngleDiff - Angle in radians to move around the orbit plane (0 = current position, PI = opposite side)
     * @param {number} horizontalAngleDiff - Angle in radians to move up/down from orbit plane (PI/2 = above, -PI/2 = below, 0 = in plane)
     * @param {number} depthTranslate - Factor of planet diameter for absolute camera distance (0.5 = surface, 1 = radius beyond surface, etc.)
     */
    positionCameraAtOrbitPlane(verticalAngleDiff = 0, horizontalAngleDiff = 0, depthTranslate = 1.5) {
        if (!this.targetPlanet || !this.solarSystem || !this.solarSystem.camera) return;

        // Get planet position
        const planetWorldPos = new THREE.Vector3();
        this.targetPlanet.sphere.getWorldPosition(planetWorldPos);

        // Use the common method to calculate camera position
        const cameraPos = this.solarSystem.calculateOrbitalPosition(
            this.targetPlanet,
            verticalAngleDiff,
            horizontalAngleDiff,
            depthTranslate
        );

        if (!cameraPos) return;

        // Position the camera
        this.solarSystem.camera.position.copy(cameraPos);
        this.solarSystem.camera.lookAt(planetWorldPos);

        // Set up vector to be perpendicular to the orbit plane
        this.solarSystem.camera.up.set(0, 1, 0);

        // Update orbit controls if needed
        if (this.solarSystem.controls) {
            this.solarSystem.controls.target.copy(planetWorldPos);
        }
    }
}