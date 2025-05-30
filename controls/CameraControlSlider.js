/**
 * CameraControlSlider class for handling camera control sliders
 */
class CameraControlSlider {
    /**
     * Create a new camera control slider
     * @param {Object} options - Configuration options
     * @param {string} options.type - Type of slider ('horizontal', 'vertical', 'elevation')
     * @param {HTMLElement} options.element - The slider HTML element
     * @param {HTMLElement} options.resetIcon - The reset icon element
     * @param {Object} options.defaultSettings - Default settings for the view
     * @param {Function} options.onChange - Callback function when slider value changes
     * @param {Function} options.onReset - Callback function when slider is reset
     */
    constructor(options) {
        this.type = options.type;
        this.element = options.element;
        this.resetIcon = options.resetIcon;
        this.defaultSettings = options.defaultSettings || {};
        this.onChange = options.onChange || (() => {});
        this.onReset = options.onReset || (() => {});
        
        // Calculate slider ranges and mapping
        this.calculateRanges();
        
        // Remove any existing event listeners to prevent duplicates
        this.removeExistingEventListeners();
        
        // Add event listeners
        this.setupEventListeners();
        
        // Initialize with default value
        this.setValue(this.defaultCameraValue);
    }
    
    /**
     * Calculate slider ranges and mapping values
     */
    calculateRanges() {
        switch (this.type) {
            case 'horizontal':
                // Get settings
                const hRange = this.defaultSettings.horizontalSliderRange || Math.PI;
                const hDefault = this.defaultSettings.horizontalSliderDefault || 0.5;
                this.defaultCameraValue = this.defaultSettings.horizontalAngle || 0;
                
                // Set slider min/max
                this.sliderMin = 0;
                this.sliderMax = hRange;
                
                // Calculate low and high values
                this.low = hRange * hDefault;
                this.high = hRange - this.low;
                
                // Default slider position
                this.defaultSliderPosition = this.low;
                
                // Min and max camera values
                this.minCameraValue = this.defaultCameraValue - this.low;
                this.maxCameraValue = this.defaultCameraValue + this.high;
                
                // Set element properties
                this.element.min = this.sliderMin.toString();
                this.element.max = this.sliderMax.toString();
                this.element.step = '0.01';
                break;
                
            case 'vertical':
                // Get settings
                const vRange = this.defaultSettings.verticalSliderRange || Math.PI;
                const vDefault = this.defaultSettings.verticalSliderDefault || 0.5;
                this.defaultCameraValue = this.defaultSettings.verticalAngle || 0;
                
                // Set slider min/max
                this.sliderMin = 0;
                this.sliderMax = vRange;
                
                // Calculate low and high values
                this.low = vRange * vDefault;
                this.high = vRange - this.low;
                
                // Default slider position
                this.defaultSliderPosition = this.low;
                
                // Min and max camera values
                this.minCameraValue = this.defaultCameraValue - this.low;
                this.maxCameraValue = this.defaultCameraValue + this.high;
                
                // Set element properties
                this.element.min = this.sliderMin.toString();
                this.element.max = this.sliderMax.toString();
                this.element.step = '0.01';
                break;
                
            case 'elevation':
                // Keep existing elevation code for now
                this.defaultCameraValue = this.defaultSettings.elevation || 0.01;
                this.element.min = '0.001';
                this.element.max = '0.05';
                this.element.step = '0.001';
                break;
        }
    }
    
    /**
     * Remove existing event listeners to prevent duplicates
     */
    removeExistingEventListeners() {
        // Store original event listeners
        const originalInputHandler = this.element._inputHandler;
        const originalResetHandler = this.resetIcon?._resetHandler;
        
        // Remove existing event listeners if they exist
        if (originalInputHandler) {
            this.element.removeEventListener('input', originalInputHandler);
        }
        
        if (this.resetIcon && originalResetHandler) {
            this.resetIcon.removeEventListener('click', originalResetHandler);
        }
    }
    
    /**
     * Set up event listeners for slider and reset icon
     */
    setupEventListeners() {
        // Slider change event
        const inputHandler = (e) => {
            const sliderPosition = parseFloat(e.target.value);
            const cameraValue = this.sliderPositionToCameraValue(sliderPosition);
            this.onChange(cameraValue);
        };
        
        // Store the handler for future removal
        this.element._inputHandler = inputHandler;
        this.element.addEventListener('input', inputHandler);
        
        // Reset icon click event
        if (this.resetIcon) {
            const resetHandler = () => {
                this.reset();
            };
            
            // Store the handler for future removal
            this.resetIcon._resetHandler = resetHandler;
            this.resetIcon.addEventListener('click', resetHandler);
        }
    }
    
    /**
     * Reset the slider to its default value
     */
    reset() {
        this.setValue(this.defaultCameraValue);
        this.onReset();
    }
    
    /**
     * Set the slider value using camera value
     * @param {number} cameraValue - The camera value to set
     */
    setValue(cameraValue) {
        // Convert camera value to slider position
        const sliderPosition = this.cameraValueToSliderPosition(cameraValue);
        
        // Use requestAnimationFrame to ensure DOM updates happen in sync with rendering
        requestAnimationFrame(() => {
            this.element.value = sliderPosition.toString();
            
            // Dispatch an input event to ensure any native event listeners are triggered
            const event = new Event('input', { bubbles: true });
            this.element.dispatchEvent(event);
        });
    }
    
    /**
     * Get the current camera value
     * @returns {number} The current camera value
     */
    getValue() {
        const sliderPosition = parseFloat(this.element.value);
        return this.sliderPositionToCameraValue(sliderPosition);
    }
    
    /**
     * Convert camera value to slider position
     * @param {number} cameraValue - The camera value
     * @returns {number} The corresponding slider position
     */
    cameraValueToSliderPosition(cameraValue) {
        if (this.type === 'elevation') {
            // Keep existing elevation code for now
            return cameraValue;
        }
        
        // Map camera value to slider position
        return cameraValue - this.minCameraValue;
    }
    
    /**
     * Convert slider position to camera value
     * @param {number} sliderPosition - The slider position
     * @returns {number} The corresponding camera value
     */
    sliderPositionToCameraValue(sliderPosition) {
        if (this.type === 'elevation') {
            // Keep existing elevation code for now
            return sliderPosition;
        }
        
        // Map slider position to camera value
        return sliderPosition + this.minCameraValue;
    }
    
    /**
     * Enable or disable the slider
     * @param {boolean} enabled - Whether the slider should be enabled
     */
    setEnabled(enabled) {
        requestAnimationFrame(() => {
            this.element.disabled = !enabled;
            this.element.style.opacity = enabled ? '1' : '0.5';
            
            if (this.resetIcon) {
                this.resetIcon.style.opacity = enabled ? '1' : '0.5';
                this.resetIcon.style.cursor = enabled ? 'pointer' : 'default';
            }
        });
    }
}