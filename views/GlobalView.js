/**
 * GlobalView class for top-down and side views of the solar system
 * Handles camera positioning for global perspectives
 */
class GlobalView extends BaseView {
    constructor() {
        super();
        this.viewType = 'global'; // 'topView' or 'sideView'
    }

    /**
     * Set the view type
     * @param {string} type - The view type ('topView' or 'sideView')
     */
    setViewType(type) {
        this.viewType = type;
    }

    /**
     * Activate this view with the specified type
     * @param {string} type - The view type ('topView' or 'sideView')
     */
    activate(type) {
        if (!this.camera || !this.controls) return;

        this.setViewType(type);

        if (type === 'topView') {
            this.setTopView();
        } else if (type === 'sideView') {
            this.setSideView();
        }
    }

    /**
     * Get the current camera angles
     * @returns {Object} Object containing horizontalAngle and verticalAngle
     */
    getCurrentCameraAngles() {
        if (!this.camera) return { horizontalAngle: 0, verticalAngle: 0 };

        const target = new THREE.Vector3(0, 0, 0);
        const position = this.camera.position.clone();

        // Calculate horizontal angle (around y-axis)
        const horizontalAngle = Math.atan2(position.x, position.z);

        // Calculate vertical angle (elevation from xz-plane)
        const horizontalDistance = Math.sqrt(position.x * position.x + position.z * position.z);
        const verticalAngle = Math.atan2(position.y, horizontalDistance);

        return { horizontalAngle, verticalAngle };
    }

    /**
     * Set top-down view of the solar system
     */
    setTopView() {
        if (!this.camera) return;

        // Calculate optimal distance based on field of view and orbit radius
        const outerMostPlanet = window.solarSystem['neptune'];
        const modelData = window.solarSystem.useScaleModel ? outerMostPlanet.scaleModelData : outerMostPlanet.nonScaleModelData;
        const maxOrbitRadius = modelData.orbitRadius;
        // Calculate distance based on camera field of view
        const fov = this.camera.fov * (Math.PI / 180); // Convert to radians
        const distance = 0.75 * maxOrbitRadius / Math.tan(fov / 2);

        // Set far clipping plane to ensure the camera can see distant objects and the skybox
        this.camera.far = 50000000;
        this.camera.updateProjectionMatrix();

        // Position camera on the positive Z axis
        this.camera.position.set(0, 0, distance);

        // Set the up vector to positive Y
        this.camera.up.set(0, 0, 1);

        // Flip the entire solar system group
        if (window.solarSystem && window.solarSystem.group) {
            // Rotate 180 degrees around Y axis to flip horizontally
            window.solarSystem.group.rotation.y = Math.PI;
            // Reset X rotation that might have been set in top view
            window.solarSystem.group.rotation.x = 0;
        }

//        this.camera.lookAt(0, 0, 0);

        if (this.controls) {
            this.controls.target.set(0, 0, 0);
            this.controls.update();
        }
    }

    /**
     * Set side view of the solar system
     */
    setSideView() {
        if (!this.camera) return;

        // Calculate optimal distance based on field of view and orbit radius
        const outerMostPlanet = window.solarSystem['neptune'];
        const modelData = window.solarSystem.useScaleModel ? outerMostPlanet.scaleModelData : outerMostPlanet.nonScaleModelData;
        const maxOrbitRadius = modelData.orbitRadius;
        // Calculate distance based on camera field of view
        const fov = this.camera.fov * (Math.PI / 180); // Convert to radians
        const distance = 0.7 * maxOrbitRadius / Math.tan(fov / 2);

        // Set far clipping plane to ensure the camera can see distant objects and the skybox
        this.camera.far = 50000000;
        this.camera.updateProjectionMatrix();

        // Position camera on the positive Z axis
        this.camera.position.set(0, 0, distance);

        // Set the up vector to positive Y
        this.camera.up.set(0, 1, 0);

        //        // Flip the entire solar system group
//        if (window.solarSystem && window.solarSystem.group) {
//            // Rotate 180 degrees around Y axis to flip horizontally
//            window.solarSystem.group.rotation.z = Math.PI;
//            // Reset X rotation that might have been set in top view
//            window.solarSystem.group.rotation.x = 0;
//        }

        this.camera.lookAt(0, 0, 0);

        if (this.controls) {
            this.controls.target.set(0, 0, 0);
            this.controls.update();
        }
    }

    /**
     * Handle horizontal camera control slider
     * @param {number} value - The slider value
     */
    handleHorizontalControl(value) {
        if (!this.camera) return;

        // For global views, rotate camera around y-axis
        const target = new THREE.Vector3(0, 0, 0);
        const distance = this.camera.position.distanceTo(target);
        const angle = -value; // Negate value to match expected direction

        // Keep current vertical angle (y position)
        const y = this.camera.position.y;

        // Calculate new x and z positions
        this.camera.position.x = distance * Math.sin(angle);
        this.camera.position.z = distance * Math.cos(angle);
        this.camera.position.y = y; // Maintain vertical position

        this.camera.lookAt(target);
        if (this.controls) this.controls.update();
    }

    /**
     * Handle vertical camera control slider
     * @param {number} value - The slider value
     */
    handleVerticalControl(value) {
        if (!this.camera) return;

        // For global views, adjust camera height
        const target = new THREE.Vector3(0, 0, 0);
        const horizontalDistance = Math.sqrt(
            this.camera.position.x * this.camera.position.x +
            this.camera.position.z * this.camera.position.z
        );
        const distance = this.camera.position.distanceTo(target);

        // Calculate new y position based on vertical angle
        // Constrain vertical angle to avoid flipping
        const constrainedAngle = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, value));
        this.camera.position.y = distance * Math.sin(constrainedAngle);

        // Adjust horizontal distance to maintain overall distance
        const newHorizontalDistance = distance * Math.cos(constrainedAngle);
        const ratio = newHorizontalDistance / horizontalDistance;

        this.camera.position.x *= ratio;
        this.camera.position.z *= ratio;

        this.camera.lookAt(target);
        if (this.controls) this.controls.update();
    }

    /**
     * Handle elevation camera control slider
     * @param {number} value - The slider value
     */
    handleElevationControl(value) {
        // Global views don't use elevation control
    }

    /**
     * Reset camera controls to default values
     * @param {string} control - The control to reset ('horizontal', 'vertical', 'elevation', or 'all')
     */
    resetCameraControl(control) {
        if (control === 'horizontal' || control === 'all') {
            this.handleHorizontalControl(0);
        }

        if (control === 'vertical' || control === 'all') {
            this.handleVerticalControl(0);
        }

        // Re-activate the current view type to reset completely
        if (control === 'all') {
            this.activate(this.viewType);
        }
    }

    /**
     * Update UI controls to reflect current view settings
     * @param {Object} settings - The view settings
     * @param {Object} controls - The UI control elements
     */
    updateUIControls(settings, controls) {
        if (!controls || !controls.horizontalInput || !controls.verticalInput) return;

        // Update horizontal slider
        controls.horizontalInput.value = -settings.horizontalAngle || 0;

        // Update vertical slider
        controls.verticalInput.value = settings.verticalAngle || 0;
    }

    /**
     * Get current view settings
     * @param {Object} controls - The UI control elements
     * @returns {Object} The current view settings
     */
    getCurrentSettings(controls) {
        if (!controls || !controls.horizontalInput || !controls.verticalInput) {
            return { horizontalAngle: 0, verticalAngle: 0, elevation: 0.01 };
        }

        return {
            horizontalAngle: -parseFloat(controls.horizontalInput.value),
            verticalAngle: parseFloat(controls.verticalInput.value),
            elevation: 0.01
        };
    }
}