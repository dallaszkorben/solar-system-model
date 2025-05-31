/**
 * CameraControls class for managing camera control sliders
 * Handles creation and coordination of multiple sliders
 */
class CameraControls {
    /**
     * Create a new camera controls manager
     * @param {Object} options - Configuration options
     * @param {Object} options.viewSettings - View settings for different views
     * @param {Function} options.onHorizontalChange - Callback for horizontal slider changes
     * @param {Function} options.onVerticalChange - Callback for vertical slider changes
     * @param {Function} options.onElevationChange - Callback for elevation slider changes
     */
    constructor(options) {
        this.viewSettings = options.viewSettings || {};
        this.onHorizontalChange = options.onHorizontalChange || (() => {});
        this.onVerticalChange = options.onVerticalChange || (() => {});
        this.onElevationChange = options.onElevationChange || (() => {});

        this.horizontalSlider = null;
        this.verticalSlider = null;
        this.elevationSlider = null;

        this.activeViewType = null;
    }

    /**
     * Initialize the camera controls with UI elements
     * @param {HTMLElement} horizontalInput - Horizontal slider element
     * @param {HTMLElement} horizontalResetIcon - Horizontal reset icon element
     * @param {HTMLElement} verticalInput - Vertical slider element
     * @param {HTMLElement} verticalResetIcon - Vertical reset icon element
     * @param {HTMLElement} elevationInput - Elevation slider element
     * @param {HTMLElement} elevationResetIcon - Elevation reset icon element
     */
    initialize(horizontalInput, horizontalResetIcon, verticalInput, verticalResetIcon, elevationInput, elevationResetIcon) {
        // Create horizontal slider
        this.horizontalSlider = new CameraControlSlider({
            type: 'horizontal',
            element: horizontalInput,
            resetIcon: horizontalResetIcon,
            defaultSettings: { horizontalAngle: 0 },
            onChange: (value) => this.onHorizontalChange(value),
            onReset: () => this.onHorizontalChange(0)
        });

        // Create vertical slider
        this.verticalSlider = new CameraControlSlider({
            type: 'vertical',
            element: verticalInput,
            resetIcon: verticalResetIcon,
            defaultSettings: { verticalAngle: 0 },
            onChange: (value) => this.onVerticalChange(value),
            onReset: () => this.onVerticalChange(0)
        });

        // Create elevation slider
        this.elevationSlider = new CameraControlSlider({
            type: 'elevation',
            element: elevationInput,
            resetIcon: elevationResetIcon,
            defaultSettings: { elevation: 0.01 },
            onChange: (value) => this.onElevationChange(value),
            onReset: () => this.onElevationChange(0.01)
        });
    }

    /**
     * Set the active view type and update sliders accordingly
     * @param {string} viewType - The active view type
     * @param {string} viewCategory - The view category ('global', 'planet', 'local')
     */
    setActiveView(viewType, viewCategory) {
        this.activeViewType = viewType;

        // Get settings for this view
        const settings = this.viewSettings[viewType] || {};

        // Update slider defaults
        this.updateSliderDefaults(settings);

        // Enable/disable sliders based on view category
        this.setEnabledSliders(viewCategory);

        // Update slider values
        this.updateSliderValues(settings, viewCategory);
    }

    /**
     * Update slider default values
     * @param {Object} settings - The view settings
     */
    updateSliderDefaults(settings) {
        if (this.horizontalSlider) {
            this.horizontalSlider.defaultSettings = settings;
        }

        if (this.verticalSlider) {
            this.verticalSlider.defaultSettings = settings;
        }

        if (this.elevationSlider) {
            this.elevationSlider.defaultSettings = settings;
        }
    }

    /**
     * Enable or disable sliders based on view category
     * @param {string} viewCategory - The view category ('global', 'planet', 'local')
     */
    setEnabledSliders(viewCategory) {
        const horizontalEnabled = viewCategory === 'local' || viewCategory === 'planet';
        const verticalEnabled = viewCategory === 'local' || viewCategory === 'planet';
        const elevationEnabled = viewCategory === 'local';

        if (this.horizontalSlider) {
            this.horizontalSlider.setEnabled(horizontalEnabled);
        }

        if (this.verticalSlider) {
            this.verticalSlider.setEnabled(verticalEnabled);
        }

        if (this.elevationSlider) {
            this.elevationSlider.setEnabled(elevationEnabled);
        }
    }

    /**
     * Update slider values based on view settings
     * @param {Object} settings - The view settings
     * @param {string} viewCategory - The view category ('global', 'planet', 'local')
     */
    updateSliderValues(settings, viewCategory) {
        if (this.horizontalSlider) {
            if (viewCategory === 'planet') {
                this.horizontalSlider.setValue(settings.longitude || 0);
            } else {
                this.horizontalSlider.setValue(-settings.horizontalAngle || 0);
            }
        }

        if (this.verticalSlider) {
            if (viewCategory === 'planet') {
                this.verticalSlider.setValue(settings.latitude || 0);
            } else {
                this.verticalSlider.setValue(settings.verticalAngle || 0);
            }
        }

        if (this.elevationSlider && viewCategory === 'local') {
            this.elevationSlider.setValue(settings.elevation || 0.01);
        }
    }

    /**
     * Get current slider values
     * @param {string} viewCategory - The view category ('global', 'planet', 'local')
     * @returns {Object} The current slider values
     */
    getCurrentValues(viewCategory) {
        const values = {};

        if (this.horizontalSlider) {
            if (viewCategory === 'planet') {
                values.longitude = this.horizontalSlider.getValue();
            } else {
                values.horizontalAngle = -this.horizontalSlider.getValue();
            }
        }

        if (this.verticalSlider) {
            if (viewCategory === 'planet') {
                values.latitude = this.verticalSlider.getValue();
            } else {
                values.verticalAngle = this.verticalSlider.getValue();
            }
        }

        if (this.elevationSlider && viewCategory === 'local') {
            values.elevation = this.elevationSlider.getValue();
        }

        return values;
    }

    /**
     * Reset all sliders to their default values
     */
    resetAll() {
        if (this.horizontalSlider) {
            this.horizontalSlider.reset();
        }

        if (this.verticalSlider) {
            this.verticalSlider.reset();
        }

        if (this.elevationSlider) {
            this.elevationSlider.reset();
        }
    }

    /**
     * Reset a specific slider
     * @param {string} type - The slider type ('horizontal', 'vertical', 'elevation')
     */
    reset(type) {
        switch (type) {
            case 'horizontal':
                if (this.horizontalSlider) {
                    this.horizontalSlider.reset();
                }
                break;
            case 'vertical':
                if (this.verticalSlider) {
                    this.verticalSlider.reset();
                }
                break;
            case 'elevation':
                if (this.elevationSlider) {
                    this.elevationSlider.reset();
                }
                break;
        }
    }
}