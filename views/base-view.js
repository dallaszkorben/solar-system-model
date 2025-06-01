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
        'earthSideView': {
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

}