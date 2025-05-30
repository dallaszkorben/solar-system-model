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
     * Set top-down view of the solar system
     */
    setTopView() {
        if (!this.camera) return;

        // Find the largest orbit radius (similar to SolarSystem.setTopView)
        let maxOrbitRadius = 1500000; // Default value

        // Calculate camera distance based on field of view to ensure the entire orbit is visible
        const orbitDiameter = maxOrbitRadius * 2;
        const aspectRatio = window.innerWidth / window.innerHeight;
        const vFov = this.camera.fov * Math.PI / 180;

        // Calculate the required distance based on the smaller dimension (width or height)
        let distance;
        if (aspectRatio >= 1.0) {
            // Width is greater than or equal to height, so height is the limiting factor
            distance = orbitDiameter / (2 * Math.tan(vFov / 2));
        } else {
            // Height is greater than width, so width is the limiting factor
            distance = orbitDiameter / (2 * Math.tan((vFov * aspectRatio) / 2));
        }

        // Add 20% margin to ensure the orbit is fully visible with larger orbit radius
        distance *= 1.2;

        // Set far clipping plane to ensure the camera can see distant objects
        this.camera.far = distance * 10;
        this.camera.updateProjectionMatrix();

        this.camera.position.set(0, distance, 0);
        this.camera.lookAt(0, 0, 0);

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

        // Position camera to the side of the solar system
        const maxOrbitRadius = 150000; // Default value
        const distance = maxOrbitRadius * 1.5;

        // Set far clipping plane to ensure the camera can see distant objects
        this.camera.far = distance * 10;
        this.camera.updateProjectionMatrix();

        this.camera.position.set(0, 0, distance);
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
}