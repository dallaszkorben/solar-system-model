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
        // Update camera position for the new view type
        this.updateCameraForNeptuneOrbit();
    }

    /**
     * Activate the global view
     */
    activate() {
        super.activate();

        console.log(`GlobalView: ${this.viewType} activated`);
        
        // Update camera position to ensure Neptune's orbit is visible
        this.updateCameraForNeptuneOrbit();
        
        this.solarSystem.controls.enabled = true;
    }
    
    /**
     * Update camera position to ensure Neptune's orbit is visible at 90% of screen width
     */
    updateCameraForNeptuneOrbit() {
        const camera = this.solarSystem.camera;
        const controls = this.solarSystem.controls;
        
        if (!camera || !controls || !this.solarSystem.planetObjs.neptune) return;
        
        // Get camera settings for this view type
        const cameraSettings = this.getCameraSettings(this.viewType);
        
        // Access the rotation angles
        const verticalAngle = cameraSettings.rotateVerticalDefaultValue;
        const horizontalAngle = cameraSettings.rotateHorizontalDefaultValue;
        
        // Get Neptune's orbit radius
        const neptuneOrbitRadius = this.solarSystem.planetObjs.neptune.orbitRadius;
        
        // Calculate camera distance to make Neptune's orbit 90% of screen width
        const fov = camera.fov * (Math.PI / 180);
        const aspectRatio = camera.aspect;
        
        // Calculate the distance needed to fit Neptune's orbit at 90% of screen width
        // We need to consider the horizontal FOV for all views to ensure consistent sizing
        let cameraDistance;
        
        // Calculate horizontal FOV based on aspect ratio
        const horizontalFov = 2 * Math.atan(Math.tan(fov / 2) * aspectRatio);
        
        // For all views, we want Neptune's orbit to take up 90% of screen width
        cameraDistance = neptuneOrbitRadius / (Math.sin(horizontalFov / 2) * 0.9);
        
        // Set the camera view with the calculated distance
        this.setCameraView(camera, controls, horizontalAngle, verticalAngle, cameraDistance);
    }

    /**
     * Calculates camera position and orientation based on spherical coordinates
     * With 2 rotation and 1 distance you can look any side of the object in any angle
     *
     *              +Y
     *              |
     *              ↺  horizontalAngle
     *            __|__
     *          /   |  /|
     *         /__ __ / |
     *         |     | _/____↺____ +X
     *         |  /  | /    verticalAngle
     *         |_/___|/
     *          /
     *         ↙  distance
     *        /
     *       +Z
     *
     *
     *
     * @param {number} horizontalAngle - Rotation around Y axis in radians (0 = looking from +Z)
     * @param {number} verticalAngle - Rotation around X axis in radians (0 = horizontal, π/2 = top view)
     * @param {number} distance - Distance from origin
     * @param {number} rollAngle - Optional roll angle in radians (0 = no roll)
     */
    calculateSpericalCoordinatesToCameraSet(horizontalAngle, verticalAngle, distance, rollAngle = 0) {

        // Calculate camera position using spherical coordinates
        const x = distance * Math.sin(horizontalAngle) * Math.cos(verticalAngle);
        const y = distance * Math.sin(verticalAngle);
        const z = distance * Math.cos(horizontalAngle) * Math.cos(verticalAngle);

        // Calculate up vector with roll
        // Start with standard up vector (0,1,0)
        const upX = Math.sin(rollAngle);
        const upY = Math.cos(rollAngle);
        const upZ = 0;

        // Rotate up vector based on camera position
        const quat = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(x, y, z).normalize()
        );

        const up = new THREE.Vector3(upX, upY, upZ);
        up.applyQuaternion(quat);

        return {
            position: new THREE.Vector3(x, y, z),
            up: up
        };
    }

        /**
     * Sets camera position and orientation based on spherical coordinates
     *
     *              +Y
     *              |
     *              ↺  horizontalAngle
     *            __|__
     *          /   |  /|
     *         /__ __ / |
     *         |     | _/____↺____ +X
     *         |  /  | /    verticalAngle
     *         |_/___|/
     *          /
     *         ↙  distance
     *        /
     *       +Z
     *
     *
     *
     * @param {THREE.Camera} camera - The camera to position
     * @param {THREE.OrbitControls} controls - The controls to update
     * @param {number} horizontalAngle - Rotation around Y axis in radians (0 = looking from +Z)
     * @param {number} verticalAngle - Rotation around X axis in radians (0 = horizontal, π/2 = top view)
     * @param {number} distance - Distance from origin
     * @param {number} rollAngle - Optional roll angle in radians (0 = no roll)
     */
    setCameraView(camera, controls, horizontalAngle, verticalAngle, distance, rollAngle = 0) {

        const {position, up} = this.calculateSpericalCoordinatesToCameraSet(horizontalAngle, verticalAngle, distance, rollAngle);

        // Set camera position
        //camera.position.set(x, y, z);
        camera.position.copy(position)

        // Set up vector for top view
        //camera.up.set(upX, upY, upZ);
        camera.up.copy(up);

        // Look at the center of the scene
        camera.lookAt(0, 0, 0);

        if (controls) {
            controls.target.set(0, 0, 0);
            controls.rotateSpeed = 0.5;
            controls.zoomSpeed = 1.0;
            controls.panSpeed = 0.8;
            controls.update();
        }
    }

}