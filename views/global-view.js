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
    }

    /**
     * Activate the global view
     */
    activate() {
        super.activate();

        console.log(`GlobalView: ${this.viewType} activated`);

        const camera = this.solarSystem.camera;
        const controls = this.solarSystem.controls;

        // Get camera settings for this view type
        const cameraSettings = this.getCameraSettings(this.viewType);

        // Access the rotateVerticalDefaultValue
        const verticalAngle = cameraSettings.rotateVerticalDefaultValue;
        const horizontalAngle = cameraSettings.rotateHorizontalDefaultValue;

        const outerMostOrbitRadius = this.solarSystem.planets.neptune.orbitRadius;
        const fov = camera.fov * (Math.PI / 180);
        const cameraDistance = 0.9 * outerMostOrbitRadius / Math.sin(fov / 2);

        this.setCameraView(camera, controls, horizontalAngle, verticalAngle, cameraDistance);

        controls.enabled = true;
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