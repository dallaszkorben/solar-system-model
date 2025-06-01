/**
 * Base class for all views in the solar system model
 */
class BaseView {
    // Static dictionary of camera settings for different view types
    static viewCameras = {
        // Global views
        'topView': {
            rotateVerticalDefaultValue: Math.PI/2,
            rotateVerticalMinValue: 0,
            rotateVerticalMaxValue: Math.PI,

            rotateHorizontalDefaultValue: 0,
            rotateHorizontalMinValue: -Math.PI,
            rotateHorizontalMaxValue: Math.PI,

            rotateDepthDefaultValue: 0,
            rotateDepthMinValue: -Math.PI/2,
            rotateDepthMaxValue: Math.PI/2,

            traverseVerticalDefaultValue: 5000,
            traverseVerticalMinValue: 1000,
            traverseVerticalMaxValue: 20000,

            traverseHorizontalDefaultValue: 0,
            traverseHorizontalMinValue: -10000,
            traverseHorizontalMaxValue: 10000,

            traverseDepthDefaultValue: 0,
            traverseDepthMinValue: -10000,
            traverseDepthMaxValue: 10000
        },

        'sideView': {
            rotateVerticalDefaultValue: 0,
            rotateVerticalMinValue: -Math.PI/2,
            rotateVerticalMaxValue: Math.PI/2,

            rotateHorizontalDefaultValue: 0,
            rotateHorizontalMinValue: -Math.PI,
            rotateHorizontalMaxValue: Math.PI,

            rotateDepthDefaultValue: 0,
            rotateDepthMinValue: -Math.PI/2,
            rotateDepthMaxValue: Math.PI/2,

            traverseVerticalDefaultValue: 0,
            traverseVerticalMinValue: -10000,
            traverseVerticalMaxValue: 10000,

            traverseHorizontalDefaultValue: 0,
            traverseHorizontalMinValue: -10000,
            traverseHorizontalMaxValue: 10000,

            traverseDepthDefaultValue: 5000,
            traverseDepthMinValue: 1000,
            traverseDepthMaxValue: 20000
        },

        // Default planet side view (can be overridden by specific planets)
        'planetSideView': {
            rotateVerticalDefaultValue: 0,
            rotateVerticalMinValue: -Math.PI/2,
            rotateVerticalMaxValue: Math.PI/2,

            rotateHorizontalDefaultValue: 0,
            rotateHorizontalMinValue: -Math.PI,
            rotateHorizontalMaxValue: Math.PI,

            rotateDepthDefaultValue: 0,
            rotateDepthMinValue: -Math.PI/2,
            rotateDepthMaxValue: Math.PI/2,

            traverseVerticalDefaultValue: 0,
            traverseVerticalMinValue: 0.01,
            traverseVerticalMaxValue: 2,

            traverseHorizontalDefaultValue: 0,
            traverseHorizontalMinValue: 0.01,
            traverseHorizontalMaxValue: 2,

            traverseDepthDefaultValue: 0,
            traverseDepthMinValue: 0.01,
            traverseDepthMaxValue: 2
        },

        // Default local view (can be overridden by specific locations)
        'localView': {
            rotateVerticalDefaultValue: 0,
            rotateVerticalMinValue: -Math.PI/2,
            rotateVerticalMaxValue: Math.PI/2,

            rotateHorizontalDefaultValue: 0,
            rotateHorizontalMinValue: -Math.PI,
            rotateHorizontalMaxValue: Math.PI,

            rotateDepthDefaultValue: 0,
            rotateDepthMinValue: -Math.PI/2,
            rotateDepthMaxValue: Math.PI/2,

            traverseVerticalDefaultValue: 0,
            traverseVerticalMinValue: 0.01,
            traverseVerticalMaxValue: 0.1,

            traverseHorizontalDefaultValue: 0,
            traverseHorizontalMinValue: 0.01,
            traverseHorizontalMaxValue: 0.1,

            traverseDepthDefaultValue: 0,
            traverseDepthMinValue: 0.01,
            traverseDepthMaxValue: 0.1
        }
    };

    constructor(solarSystem) {
        this.solarSystem = solarSystem;
        this.active = false;
    }

    /**
     * Get camera settings for a specific view type
     * @param {string} viewType - The view type to get camera settings for
     * @returns {Object} Camera settings for the view type
     */
    getCameraSettings(viewType) {
        return BaseView.viewCameras[viewType] || BaseView.viewCameras['topView'];
    }

    /**
     * Activate this view
     */
    activate() {
        this.active = true;
        console.log(`${this.constructor.name} activated`);

    }

    /**
     * Deactivate this view
     */
    deactivate() {
        this.active = false;
        console.log(`${this.constructor.name} deactivated`);
    }

    /**
     * Update the view (called in animation loop)
     */
    update() {
        // Base implementation does nothing
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

    // DO NOT REMOVE THIS - might be needed
    // /**
    // * Sets camera position and orientation based on spherical coordinates
    // * @param {THREE.Camera} camera - The camera to position
    // * @param {THREE.OrbitControls} controls - The controls to update
    // * @param {number} horizontalAngle - Rotation around Y axis in radians (0 = looking from +Z)
    // * @param {number} verticalAngle - Rotation from XZ plane in radians (0 = horizontal, π/2 = top view)
    // * @param {number} distance - Distance from origin
    // * @param {number} rollAngle - Optional roll angle in radians (0 = no roll)
    // */
    //function setCameraView(camera, controls, horizontalAngle, verticalAngle, distance, rollAngle = 0) {
    //    // Calculate camera position using spherical coordinates
    //    const x = distance * Math.sin(horizontalAngle) * Math.cos(verticalAngle);
    //    const y = distance * Math.sin(verticalAngle);
    //    const z = distance * Math.cos(horizontalAngle) * Math.cos(verticalAngle);
    //
    //    // Set camera position
    //    camera.position.set(x, y, z);
    //
    //    // Look at origin
    //    camera.lookAt(0, 0, 0);
    //
    //    // Calculate up vector with roll
    //    // Start with standard up vector (0,1,0)
    //    const upX = Math.sin(rollAngle);
    //    const upY = Math.cos(rollAngle);
    //    const upZ = 0;
    //
    //    // Rotate up vector based on camera position
    //    const quat = new THREE.Quaternion().setFromUnitVectors(
    //        new THREE.Vector3(0, 0, 1),
    //        new THREE.Vector3(x, y, z).normalize()
    //    );
    //
    //    const up = new THREE.Vector3(upX, upY, upZ);
    //    up.applyQuaternion(quat);
    //
    //    // Set camera up vector
    //    camera.up.copy(up);
    //
    //    // Update controls
    //    if (controls) {
    //        controls.target.set(0, 0, 0);
    //        controls.update();
    //    }
    //}

}