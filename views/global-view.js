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
}