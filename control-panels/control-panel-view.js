/**
 * ViewControlPanel class for controlling the view
 */
class ViewControlPanel extends ControlPanel {
    constructor(solarSystem) {
        super('View Controls', { top: '20px', left: '380px' });

        // Make the panel the same width as the Solar System Controls panel
        this.consolePane.style.width = '350px';
        this.solarSystem = solarSystem;

        // Store references to radio buttons
        this.viewRadios = {};

        // Store previous slider values for each planet
        this.planetSliderValues = {};

        // Create view objects
        this.globalView = new GlobalView(solarSystem);
        this.planetSideView = new PlanetSideView(solarSystem);
        this.localView = new LocalView(solarSystem);

        // Set view type for planet side view
        this.planetSideView.setViewType('sunSideView');

        // Track current active view
        this.activeView = null;

        // Create view sections
        this.createGlobalViewsSection();
        this.createPlanetSideViewsSection();
        this.createLocalViewsSection();
        this.createNavigationSection();
        this.createCameraSection();
        this.createStereographicSection();
    }

    createGlobalViewsSection() {
        // Create Global Views section header
        const globalSectionHeader = document.createElement('h4');
        globalSectionHeader.textContent = 'Global Views';
        globalSectionHeader.style.margin = '0 0 10px 0';
        globalSectionHeader.style.borderBottom = '1px solid #555';
        globalSectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(globalSectionHeader);

        // Create radio button group for views
        const viewRadioGroup = document.createElement('div');
        viewRadioGroup.className = 'view-radio-group';
        viewRadioGroup.style.marginBottom = '15px';
        this.consoleContent.appendChild(viewRadioGroup);

        // Add radio buttons for global views with reset buttons
        this.addViewRadioButtonWithReset('Top View', 'view', 'topView', viewRadioGroup);
        this.addViewRadioButtonWithReset('Side View', 'view', 'sideView', viewRadioGroup);
        this.addViewRadioButtonWithReset('General View', 'view', 'generalView', viewRadioGroup);
    }

    /**
     * Add a radio button with a reset button for global views
     */
    addViewRadioButtonWithReset(label, name, value, container) {
        const radioContainer = document.createElement('div');
        radioContainer.style.marginBottom = '10px';
        radioContainer.style.display = 'flex';
        radioContainer.style.alignItems = 'center';

        // Create radio button
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = name;
        radio.value = value;
        radio.id = `radio-${value}`;
        radio.style.marginRight = '10px';

        // Add event listener to handle view changes
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.handleViewChange(value);
            }
        });

        // Create label
        const radioLabel = document.createElement('label');
        radioLabel.htmlFor = `radio-${value}`;
        radioLabel.textContent = label;
        radioLabel.style.flexGrow = '1';
        radioLabel.style.cursor = 'pointer';

        // Create reset button cell
        const resetButtonCell = document.createElement('div');
        resetButtonCell.style.width = '24px';
        resetButtonCell.style.height = '24px';

        // Create reset button as image (same as navigation controls)
        const resetButton = document.createElement('img');
        resetButton.src = 'icons/reset.png';
        resetButton.style.width = '24px';
        resetButton.style.height = '24px';
        resetButton.style.cursor = 'pointer';

        // Add event listener for reset button
        resetButton.addEventListener('click', () => {
            if (this.activeView instanceof GlobalView && this.activeView.viewType === value) {
                // Reset the current view
                this.activeView.resetView();
            } else if (this.globalView) {
                // If this view is not active, clear its saved state
                GlobalView.lastCameraStates[value] = null;
            }
        });

        // Add elements to container
        resetButtonCell.appendChild(resetButton);
        radioContainer.appendChild(radio);
        radioContainer.appendChild(radioLabel);
        radioContainer.appendChild(resetButtonCell);
        container.appendChild(radioContainer);

        // Store reference to the radio button
        this.viewRadios[value] = radio;

        return radio;
    }

    createPlanetSideViewsSection() {
        // Create Planet Side Views section header with extra margin
        const planetSectionHeader = document.createElement('h4');
        planetSectionHeader.textContent = 'Planet Side Views';
        planetSectionHeader.style.margin = '20px 0 10px 0';
        planetSectionHeader.style.borderBottom = '1px solid #555';
        planetSectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(planetSectionHeader);

        // Create radio button group for planet side views
        const planetViewRadioGroup = document.createElement('div');
        planetViewRadioGroup.className = 'view-radio-group';
        planetViewRadioGroup.style.marginBottom = '15px';
        this.consoleContent.appendChild(planetViewRadioGroup);

        // Add radio buttons for planet side views
        this.addViewRadioButton('Sun Side View', 'view', 'sunSideView', planetViewRadioGroup);
        this.addViewRadioButton('Mercury Side View', 'view', 'mercurySideView', planetViewRadioGroup);
        this.addViewRadioButton('Venus Side View', 'view', 'venusSideView', planetViewRadioGroup);
        this.addViewRadioButton('Earth Side View', 'view', 'earthSideView', planetViewRadioGroup);
        this.addViewRadioButton('Mars Side View', 'view', 'marsSideView', planetViewRadioGroup);
        this.addViewRadioButton('Jupiter Side View', 'view', 'jupiterSideView', planetViewRadioGroup);
        this.addViewRadioButton('Saturn Side View', 'view', 'saturnSideView', planetViewRadioGroup);
        this.addViewRadioButton('Uranus Side View', 'view', 'uranusSideView', planetViewRadioGroup);
        this.addViewRadioButton('Neptune Side View', 'view', 'neptuneSideView', planetViewRadioGroup);
    }

    createLocalViewsSection() {
        // Create section header
        const locationHeader = document.createElement('h4');
        locationHeader.textContent = 'Local Views';
        locationHeader.style.margin = '15px 0 10px 0';
        locationHeader.style.borderBottom = '1px solid #555';
        locationHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(locationHeader);

        // Create radio button group for location views
        const locationViewRadioGroup = document.createElement('div');
        locationViewRadioGroup.className = 'view-radio-group';
        locationViewRadioGroup.style.marginBottom = '15px';
        this.consoleContent.appendChild(locationViewRadioGroup);

        // Add radio buttons for Earth location views
        this.addViewRadioButton('Earth: Budapest', 'view', 'budapest', locationViewRadioGroup);
        this.addViewRadioButton('Earth: Kiruna', 'view', 'kiruna', locationViewRadioGroup);

        // Add radio button for Mars location view
        this.addViewRadioButton('Mars: Perseverance', 'view', 'perseverance', locationViewRadioGroup);
    }

    addViewRadioButton(label, name, value, container) {
        const radioContainer = document.createElement('div');
        radioContainer.style.marginBottom = '10px';
        radioContainer.style.display = 'flex';
        radioContainer.style.alignItems = 'center';

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = name;
        radio.value = value;
        radio.id = `radio-${value}`;
        radio.style.marginRight = '10px';

        // Add event listener to handle view changes
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.handleViewChange(value);
            }
        });

        const radioLabel = document.createElement('label');
        radioLabel.htmlFor = `radio-${value}`;
        radioLabel.textContent = label;
        radioLabel.style.flexGrow = '1';
        radioLabel.style.cursor = 'pointer';

        radioContainer.appendChild(radio);
        radioContainer.appendChild(radioLabel);
        container.appendChild(radioContainer);

        // Store reference to the radio button
        this.viewRadios[value] = radio;

        return radio;
    }

    // Method to set the active view
    setView(viewName) {
        if (this.viewRadios[viewName]) {
            this.viewRadios[viewName].checked = true;
            this.handleViewChange(viewName);
        } else {
            console.warn(`View "${viewName}" not found`);
        }
    }

    handleViewChange(viewName) {
        console.log(`Changing view to: ${viewName}`);

        // Store previous view information before deactivating
        const previousView = this.activeView;
        const wasPlanetSideView = previousView instanceof PlanetSideView;
        const previousPlanetSideViewType = wasPlanetSideView ? previousView.viewType : null;

        // Save camera state if we're coming from a Planet Side View
        let planetSideViewCameraState = null;
        if (wasPlanetSideView && viewName === 'generalView') {
            planetSideViewCameraState = {
                position: this.solarSystem.camera.position.clone(),
                up: this.solarSystem.camera.up.clone(),
                target: this.solarSystem.controls.target.clone()
            };
        }

        // Deactivate current view if any
        if (this.activeView) {
            this.activeView.deactivate();
        }

        // Determine which view object to use based on the view name
        if (viewName === 'topView' || viewName === 'sideView' || viewName === 'generalView') {
            // Global views
            this.globalView.setViewType(viewName);
            this.activeView = this.globalView;

            // If switching to General View from a Planet Side View, apply the Planet Side View's camera state
            if (viewName === 'generalView' && wasPlanetSideView && planetSideViewCameraState) {
                // Set the saved state for General View to match the Planet Side View's camera state
                GlobalView.lastCameraStates['generalView'] = planetSideViewCameraState;
            }
        } else if (viewName.includes('SideView')) {
            // Planet side views
            this.planetSideView.setViewType(viewName);
            this.activeView = this.planetSideView;
        } else if (viewName === 'budapest') {
            // Local view for Budapest
            this.localView.setTarget('earth', 'Budapest');
            this.activeView = this.localView;
        } else if (viewName === 'kiruna') {
            // Local view for Kiruna
            this.localView.setTarget('earth', 'Kiruna');
            this.activeView = this.localView;
        } else if (viewName === 'perseverance') {
            // Local view for Perseverance on Mars
            this.localView.setTarget('mars', 'Perseverance');
            this.activeView = this.localView;
        } else {
            // Default to top view if unknown
            this.globalView.setViewType('topView');
            this.activeView = this.globalView;
        }

        // Activate the new view
        this.activeView.activate();

        // Update navigation controls based on the active view
        this.updateNavigationControls();
    }

    createNavigationSection() {
        // Create Navigation section header
        const navigationHeader = document.createElement('h4');
        navigationHeader.textContent = 'Navigation';
        navigationHeader.style.margin = '20px 0 10px 0';
        navigationHeader.style.borderBottom = '1px solid #555';
        navigationHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(navigationHeader);

        // Create a custom slider component with icon for horizontal rotation
        const horizontalSliderComponent = this.createSliderControllerComponent({
            label: '',
            icon: {
                src: 'icons/rotate-horizontal.png'
            },
            slider: {
                min: '0',
                max: '0',
                step: '0.01',
                value: '0',
                id: 'navigation-horizontal-rotation-slider',
            },
            resetButton: {
                tooltip: 'Reset to default',
                resetValue: 0
            },
            toggle: {
                required: false // No toggle for horizontal slider
            },

            onSliderChange: (slider) => {
                if (this.activeView instanceof PlanetSideView) {
                    const viewType = this.activeView.viewType;
                    const planetName = viewType.replace('SideView', '');
                    const value = parseFloat(slider.value);

                    // Store the current value for this planet
                    if (!this.planetSliderValues[planetName]) {
                        this.planetSliderValues[planetName] = {};
                    }
                    this.planetSliderValues[planetName].horizontal = value;

                    // Update the camera position
                    if (this.activeView.positionSideViewCamera) {
                        const verticalValue = this.planetSliderValues[planetName].vertical || 0;
                        this.activeView.positionSideViewCamera(verticalValue, value);
                    }
                } else if (this.activeView instanceof LocalView) {
                    const viewType = this.activeView.viewType;
                    const value = parseFloat(slider.value);

                    // Store the current value for this location
                    if (!this.planetSliderValues[viewType]) {
                        this.planetSliderValues[viewType] = {};
                    }
                    this.planetSliderValues[viewType].horizontal = value;

                    // Update the camera position
                    this.activeView.setHorizontalAngle(value);
                }
            },
            onReset: (slider) => {
                if (this.activeView instanceof PlanetSideView) {
                    const viewType = this.activeView.viewType;
                    const locationName = viewType.replace('SideView', '');

                    // Get default value
                    let defaultValue = 0;
                    if (PlanetSideView.viewCameras &&
                        PlanetSideView.viewCameras[viewType] &&
                        PlanetSideView.viewCameras[viewType].rotateHorizontalDefaultValue !== undefined) {
                        defaultValue = PlanetSideView.viewCameras[viewType].rotateHorizontalDefaultValue;
                    }

                    // Update slider and camera
                    slider.value = defaultValue;
                    if (!this.planetSliderValues[locationName]) {
                        this.planetSliderValues[locationName] = {};
                    }
                    this.planetSliderValues[locationName].horizontal = defaultValue;

                    if (this.activeView.positionSideViewCamera) {
                        const verticalValue = this.planetSliderValues[locationName].vertical || 0;
                        this.activeView.positionSideViewCamera(verticalValue, defaultValue);
                    }
                } else if (this.activeView instanceof LocalView) {
                    const viewType = this.activeView.viewType;

                    // Get default value
                    let defaultValue = 0;
                    if (LocalView.viewCameras &&
                        LocalView.viewCameras[viewType] &&
                        LocalView.viewCameras[viewType].rotateHorizontalDefaultValue !== undefined) {
                        defaultValue = LocalView.viewCameras[viewType].rotateHorizontalDefaultValue;
                    }

                    // Update slider and camera
                    slider.value = defaultValue;
                    if (!this.planetSliderValues[viewType]) {
                        this.planetSliderValues[viewType] = {};
                    }
                    this.planetSliderValues[viewType].horizontal = defaultValue;

                    // Update the camera position
                    this.activeView.setHorizontalAngle(defaultValue);
                }
            },
            parent: this.consoleContent
        });

        // Create a custom slider component with icon for vertical rotation
        const verticalRotComp = this.createSliderControllerComponent({
            label: '',
            icon: {
                src: 'icons/rotate-vertical.png'
            },
            slider: {
                min: '0',
                max: '0',
                step: '0.01',
                value: '0',
                id: 'navigation-vertical-rotation-slider'
            },
            resetButton: {
                tooltip: 'Reset to default',
                resetValue: 0
            },
            toggle: {
                tooltip: 'Toggle between Equator and Orbit plane',
                checked: PlanetSideView.recentCameraType === PlanetSideView.cameraTypes.EQUATOR_PLANE,
                id: 'plane-switch'
            },
            onSliderChange: (slider) => {
                if (this.activeView instanceof PlanetSideView) {
                    const viewType = this.activeView.viewType;
                    const planetName = viewType.replace('SideView', '');
                    const value = parseFloat(slider.value);

                    // Store the current value for this planet
                    if (!this.planetSliderValues[planetName]) {
                        this.planetSliderValues[planetName] = {};
                    }
                    this.planetSliderValues[planetName].vertical = value;

                    // Update the camera position
                    if (this.activeView.positionSideViewCamera) {
                        const horizontalValue = this.planetSliderValues[planetName].horizontal || 0;
                        this.activeView.positionSideViewCamera(value, horizontalValue);
                    }
                } else if (this.activeView instanceof LocalView) {
                    const viewType = this.activeView.viewType;
                    const value = parseFloat(slider.value);

                    // Store the current value for this location
                    if (!this.planetSliderValues[viewType]) {
                        this.planetSliderValues[viewType] = {};
                    }
                    this.planetSliderValues[viewType].vertical = value;

                    // Update the camera position
                    this.activeView.setVerticalAngle(value);
                }
            },
            onToggleChange: (checked) => {
                if (checked) {
                    PlanetSideView.recentCameraType = PlanetSideView.cameraTypes.EQUATOR_PLANE;
                } else {
                    PlanetSideView.recentCameraType = PlanetSideView.cameraTypes.ORBIT_PLANE;
                }

                // Update camera position if in planet side view
                if (this.activeView instanceof PlanetSideView) {
                    const viewType = this.activeView.viewType;
                    const planetName = viewType.replace('SideView', '');

                    if (this.planetSliderValues[planetName]) {
                        const verticalValue = this.planetSliderValues[planetName].vertical || 0;
                        const horizontalValue = this.planetSliderValues[planetName].horizontal || 0;
                        const depthValue = this.planetSliderValues[planetName].depth || 2;

                        this.activeView.positionSideViewCamera(verticalValue, horizontalValue, depthValue);
                    }
                }
            },
            parent: this.consoleContent
        });

        // Create a custom slider component with icon for depth translate
        const depthTranslateComp = this.createSliderControllerComponent({
            label: '',
            icon: {
                src: 'icons/translate-depth.png'
            },
            slider: {
                min: '0',
                max: '0',
                step: '0.01',
                value: '0',
                id: 'navigation-depth-translate-slider'
            },
            resetButton: {
                tooltip: 'Reset to default',
                resetValue: 0
            },
            toggle: {
                required: false
            },
            onSliderChange: (slider) => {
                if (this.activeView instanceof PlanetSideView) {
                    const viewType = this.activeView.viewType;
                    const planetName = viewType.replace('SideView', '');
                    const value = parseFloat(slider.value);

                    // Store the current value for this planet
                    if (!this.planetSliderValues[planetName]) {
                        this.planetSliderValues[planetName] = {};
                    }
                    this.planetSliderValues[planetName].depth = value;

                    // Update the camera position
                    if (this.activeView.positionSideViewCamera) {
                        const verticalValue = this.planetSliderValues[planetName].vertical || 0;
                        const horizontalValue = this.planetSliderValues[planetName].horizontal || 0;
                        this.activeView.positionSideViewCamera(verticalValue, horizontalValue, value);
                    }
                } else if (this.activeView instanceof LocalView) {
                    const viewType = this.activeView.viewType;
                    const value = parseFloat(slider.value);

                    // Store the current value for this location
                    if (!this.planetSliderValues[viewType]) {
                        this.planetSliderValues[viewType] = {};
                    }
                    this.planetSliderValues[viewType].depth = value;

                    // Update the camera position
                    this.activeView.setCameraElevation(value);
                }
            },
            onReset: (slider) => {
                if (this.activeView instanceof PlanetSideView) {
                    const viewType = this.activeView.viewType;
                    const locationName = viewType.replace('SideView', '');

                    // Get default value
                    let defaultValue = 0;
                    if (PlanetSideView.viewCameras &&
                        PlanetSideView.viewCameras[viewType] &&
                        PlanetSideView.viewCameras[viewType].traverseDepthDefaultValue !== undefined) {
                        defaultValue = PlanetSideView.viewCameras[viewType].traverseDepthDefaultValue;
                    }

                    // Update slider and camera
                    slider.value = defaultValue;
                    if (!this.planetSliderValues[locationName]) {
                        this.planetSliderValues[locationName] = {};
                    }
                    this.planetSliderValues[locationName].depth = defaultValue;

                    if (this.activeView.positionSideViewCamera) {
                        const verticalValue = this.planetSliderValues[locationName].vertical || 0;
                        const horizontalValue = this.planetSliderValues[locationName].horizontal || 0;
                        this.activeView.positionSideViewCamera(verticalValue, horizontalValue, defaultValue);
                    }
                } else if (this.activeView instanceof LocalView) {
                    const viewType = this.activeView.viewType;

                    // Get default value
                    let defaultValue = 0.01;
                    if (LocalView.viewCameras &&
                        LocalView.viewCameras[viewType] &&
                        LocalView.viewCameras[viewType].traverseVerticalDefaultValue !== undefined) {
                        defaultValue = LocalView.viewCameras[viewType].traverseVerticalDefaultValue;
                    }

                    // Update slider and camera
                    slider.value = defaultValue;
                    if (!this.planetSliderValues[viewType]) {
                        this.planetSliderValues[viewType] = {};
                    }
                    this.planetSliderValues[viewType].depth = defaultValue;

                    // Update the camera position
                    this.activeView.setCameraElevation(defaultValue);
                }
            },
            parent: this.consoleContent
        });

        // Create a custom slider component with icon for vertical translate
        const verticalTranslateComp = this.createSliderControllerComponent({
            label: '',
            icon: {
                src: 'icons/translate-vertical.png'
            },
            slider: {
                min: '0',
                max: '0',
                step: '0.01',
                value: '0',
                id: 'navigation-vertical-translate-slider'
            },
            resetButton: {
                tooltip: 'Reset to default',
                resetValue: 0
            },
            toggle: {
                required: false
            },
            onSliderChange: (slider) => {
                if (this.activeView instanceof LocalView) {
                    const viewType = this.activeView.viewType;
                    const value = parseFloat(slider.value);

                    // Store the current value for this location
                    if (!this.planetSliderValues[viewType]) {
                        this.planetSliderValues[viewType] = {};
                    }
                    this.planetSliderValues[viewType].verticalTranslate = value;

                    // Update the camera position
                    this.activeView.setVerticalTranslate(value);
                }
            },
            onReset: (slider) => {
                if (this.activeView instanceof LocalView) {
                    const viewType = this.activeView.viewType;

                    // Get default value
                    let defaultValue = 0.01;
                    if (LocalView.viewCameras &&
                        LocalView.viewCameras[viewType] &&
                        LocalView.viewCameras[viewType].traverseVerticalDefaultValue !== undefined) {
                        defaultValue = LocalView.viewCameras[viewType].traverseVerticalDefaultValue;
                    }

                    // Update slider and camera
                    slider.value = defaultValue;
                    if (!this.planetSliderValues[viewType]) {
                        this.planetSliderValues[viewType] = {};
                    }
                    this.planetSliderValues[viewType].verticalTranslate = defaultValue;

                    // Update the camera position
                    this.activeView.setVerticalTranslate(defaultValue);
                }
            },
            parent: this.consoleContent
        });

        // Store reference to the sliders and reset buttons
        const horizontalRotationSlider = horizontalSliderComponent.slider;
        const horizontalRotationResetButton = horizontalSliderComponent.resetButton;
        const verticalRotationSlider = verticalRotComp.slider;
        const verticalRotationResetButton = verticalRotComp.resetButton;
        const depthTranslateSlider = depthTranslateComp.slider;
        const depthTranslateResetButton = depthTranslateComp.resetButton;
        const verticalTranslateSlider = verticalTranslateComp.slider;
        const verticalTranslateResetButton = verticalTranslateComp.resetButton;

        // Store references to navigation elements
        this.navigationControls = {
            horizontalRotationSlider: horizontalRotationSlider,
            horizontalRotationResetButton: horizontalRotationResetButton,
            planeSwitch: verticalRotComp.toggle,
            verticalRotationSlider: verticalRotationSlider,
            verticalRotationResetButton: verticalRotationResetButton,
            depthTranslateSlider: depthTranslateSlider,
            depthTranslateResetButton: depthTranslateResetButton,
            verticalTranslateSlider: verticalTranslateSlider,
            verticalTranslateResetButton: verticalTranslateResetButton
        };

        // Initially set navigation controls based on active view
        this.updateNavigationControls();
    }

    createCameraSection() {
        // Create Camera section header
        const cameraHeader = document.createElement('h4');
        cameraHeader.textContent = 'Camera';
        cameraHeader.style.margin = '20px 0 10px 0';
        cameraHeader.style.borderBottom = '1px solid #555';
        cameraHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(cameraHeader);

        // Create FOV slider with value display
        const fovControls = this.createSliderControllerComponent({
            label: 'Field of View',
            slider: {
                min: '20',
                max: '100',
                step: '1',
                value: this.solarSystem.camera ? this.solarSystem.camera.fov.toString() : '40',
                id: 'camera-fov-slider',
                unit: {
                    value: '°', // Show value with degree symbol
                    width: 35   // Adjust width as needed
                }
            },
            resetButton: {
                tooltip: 'Reset to default',
                resetValue: 40
            },
            onSliderChange: (slider) => {
                this.solarSystem.camera.fov = parseFloat(slider.value);
                this.solarSystem.camera.updateProjectionMatrix();
            },
            onReset: (slider) => {
                this.solarSystem.camera.fov = parseFloat(slider.value);
                this.solarSystem.camera.updateProjectionMatrix();
            },
            parent: this.consoleContent
        });

        // Create Zoom slider with value display
        const zoomControls = this.createSliderControllerComponent({
            label: 'Zoom',
            slider: {
                min: '0.1',
                max: '5',
                step: '0.1',
                value: this.solarSystem.camera ? this.solarSystem.camera.zoom.toString() : '1.0',
                id: 'camera-zoom-slider',
                unit: {
                    value: 'X', // Show value with X suffix
                    width: 35   // Adjust width as needed
                }
            },
            resetButton: {
                tooltip: 'Reset to default',
                resetValue: 1.0
            },
            onSliderChange: (slider) => {
                this.solarSystem.camera.zoom = parseFloat(slider.value);
                this.solarSystem.camera.updateProjectionMatrix();
            },
            onReset: (slider) => {
                this.solarSystem.camera.zoom = parseFloat(slider.value);
                this.solarSystem.camera.updateProjectionMatrix();
            },
            parent: this.consoleContent
        });

        // Store references to camera controls
        this.cameraControls = {
            fovSlider: fovControls.slider,
            zoomSlider: zoomControls.slider,
            fovValueDisplay: fovControls.valueDisplay,
            zoomValueDisplay: zoomControls.valueDisplay
        };
    }

    createStereographicSection() {
        // Create Stereographic section header
        const stereoHeader = document.createElement('h4');
        stereoHeader.textContent = 'Stereographic Image';
        stereoHeader.style.margin = '20px 0 10px 0';
        stereoHeader.style.borderBottom = '1px solid #555';
        stereoHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(stereoHeader);

        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.marginBottom = '15px';

        // Create button
        const stereoButton = document.createElement('button');
        stereoButton.textContent = 'Take Stereographic Image';
        stereoButton.style.padding = '8px 12px';
        stereoButton.style.cursor = 'pointer';
        stereoButton.style.backgroundColor = '#2196F3';
        stereoButton.style.color = 'white';
        stereoButton.style.border = 'none';
        stereoButton.style.borderRadius = '4px';

        // Add event listener
        stereoButton.addEventListener('click', () => {
            if (this.solarSystem) {
                stereoButton.disabled = true;
                stereoButton.textContent = 'Processing...';

                // Use setTimeout to allow the UI to update before processing
                setTimeout(() => {
                    this.solarSystem.takeStereographicScreenshot();
                    stereoButton.disabled = false;
                    stereoButton.textContent = 'Take Stereographic Image';
                }, 100);
            }
        });

        buttonContainer.appendChild(stereoButton);
        this.consoleContent.appendChild(buttonContainer);
    }

    updateNavigationControls() {
        if (!this.navigationControls) return;

        // Enable controls for both Planet Side Views and Local Views
        const enabled = this.activeView instanceof PlanetSideView || this.activeView instanceof LocalView;

        // Set visibility based on enabled state and view type
        const isLocalView = this.activeView instanceof LocalView;
        const isPlanetSideView = this.activeView instanceof PlanetSideView;

        // Use the setActive method for each slider component
        const horizontalSliderComponent = {
            slider: this.navigationControls.horizontalRotationSlider,
            resetButton: this.navigationControls.horizontalRotationResetButton,
            setActive: (active) => {
                this.navigationControls.horizontalRotationSlider.disabled = !active;
                this.navigationControls.horizontalRotationSlider.style.opacity = active ? '1' : '0.5';
                this.navigationControls.horizontalRotationSlider.style.pointerEvents = active ? 'auto' : 'none';
                this.navigationControls.horizontalRotationResetButton.style.opacity = active ? '1' : '0.5';
                this.navigationControls.horizontalRotationResetButton.style.pointerEvents = active ? 'auto' : 'none';
            }
        };

        const verticalSliderComponent = {
            slider: this.navigationControls.verticalRotationSlider,
            resetButton: this.navigationControls.verticalRotationResetButton,
            toggle: this.navigationControls.planeSwitch,
            setActive: (active) => {
                this.navigationControls.verticalRotationSlider.disabled = !active;
                this.navigationControls.verticalRotationSlider.style.opacity = active ? '1' : '0.5';
                this.navigationControls.verticalRotationSlider.style.pointerEvents = active ? 'auto' : 'none';
                this.navigationControls.verticalRotationResetButton.style.opacity = active ? '1' : '0.5';
                this.navigationControls.verticalRotationResetButton.style.pointerEvents = active ? 'auto' : 'none';

                // Also handle the plane switch toggle
                if (this.navigationControls.planeSwitch) {
                    this.navigationControls.planeSwitch.disabled = !active;
                    const toggleParent = this.navigationControls.planeSwitch.parentElement;
                    if (toggleParent) {
                        toggleParent.style.opacity = (active && isPlanetSideView) ? '1' : '0.5';
                        toggleParent.style.pointerEvents = (active && isPlanetSideView) ? 'auto' : 'none';
                    }
                }
            }
        };

        const depthSliderComponent = {
            slider: this.navigationControls.depthTranslateSlider,
            resetButton: this.navigationControls.depthTranslateResetButton,
            setActive: (active) => {
                const isActiveForDepth = active && !isLocalView;
                this.navigationControls.depthTranslateSlider.disabled = !isActiveForDepth;
                this.navigationControls.depthTranslateSlider.style.opacity = isActiveForDepth ? '1' : '0.5';
                this.navigationControls.depthTranslateSlider.style.pointerEvents = isActiveForDepth ? 'auto' : 'none';
                this.navigationControls.depthTranslateResetButton.style.opacity = isActiveForDepth ? '1' : '0.5';
                this.navigationControls.depthTranslateResetButton.style.pointerEvents = isActiveForDepth ? 'auto' : 'none';
            }
        };

        const verticalTranslateComponent = {
            slider: this.navigationControls.verticalTranslateSlider,
            resetButton: this.navigationControls.verticalTranslateResetButton,
            setActive: (active) => {
                const isActiveForVertical = active && isLocalView;
                this.navigationControls.verticalTranslateSlider.disabled = !isActiveForVertical;
                this.navigationControls.verticalTranslateSlider.style.opacity = isActiveForVertical ? '1' : '0.5';
                this.navigationControls.verticalTranslateSlider.style.pointerEvents = isActiveForVertical ? 'auto' : 'none';
                this.navigationControls.verticalTranslateResetButton.style.opacity = isActiveForVertical ? '1' : '0.5';
                this.navigationControls.verticalTranslateResetButton.style.pointerEvents = isActiveForVertical ? 'auto' : 'none';
            }
        };

        // Set active state for all components
        horizontalSliderComponent.setActive(enabled);
        verticalSliderComponent.setActive(enabled);
        depthSliderComponent.setActive(enabled);
        verticalTranslateComponent.setActive(enabled);

        // Configure slider appearance
        if (enabled) {
            // Get the current view type and location/planet name
            const viewType = this.activeView.viewType;
            let locationName;

            if (this.activeView instanceof PlanetSideView) {
                locationName = viewType.replace('SideView', '');
            } else if (this.activeView instanceof LocalView) {
                locationName = viewType; // For LocalView, viewType is already the location ID
            } else {
                locationName = viewType;
            }

            // Initialize slider values if needed
            if (!this.planetSliderValues[locationName]) {
                this.planetSliderValues[locationName] = {};
            }

            // Get camera settings for horizontal rotation slider
            let horizontalRotationConfig = {
                min: -Math.PI/2,
                max: Math.PI/2,
                value: 0,
                step: 0.01
            };

            // Get camera settings for vertical rotation slider
            let verticalRotationConfig = {
                min: -Math.PI/2,
                max: Math.PI/2,
                value: 0,
                step: 0.01
            };

            // Get camera settings for depth translate slider
            let depthTranslateConfig = {
                min: 0.6,
                max: 3,
                value: 2,
                step: 0.01
            };

            // Get camera settings for vertical translate slider
            let verticalTranslateConfig = {
                min: 0.01,
                max: 0.1,
                value: 0.01,
                step: 0.001
            };

            // Check if there are specific camera settings for this view
            let camera;

            if (this.activeView instanceof PlanetSideView &&
                PlanetSideView.viewCameras &&
                PlanetSideView.viewCameras[viewType]) {
                camera = PlanetSideView.viewCameras[viewType];
            } else if (this.activeView instanceof LocalView &&
                       LocalView.viewCameras &&
                       LocalView.viewCameras[viewType]) {
                camera = LocalView.viewCameras[viewType];
            }

            if (camera) {
                // Configure horizontal rotation slider
                if (camera.rotateHorizontalMinValue !== undefined) {
                    horizontalRotationConfig.min = camera.rotateHorizontalMinValue;
                }
                if (camera.rotateHorizontalMaxValue !== undefined) {
                    horizontalRotationConfig.max = camera.rotateHorizontalMaxValue;
                }
                if (camera.rotateHorizontalStep !== undefined) {
                    horizontalRotationConfig.step = camera.rotateHorizontalStep;
                }

                // Use stored value or default for horizontal rotation
                if (this.planetSliderValues[locationName].horizontal !== undefined) {
                    horizontalRotationConfig.value = this.planetSliderValues[locationName].horizontal;
                } else if (camera.rotateHorizontalDefaultValue !== undefined) {
                    horizontalRotationConfig.value = camera.rotateHorizontalDefaultValue;
                    this.planetSliderValues[locationName].horizontal = horizontalRotationConfig.value;
                }

                // Configure vertical rotation slider
                if (camera.rotateVerticalMinValue !== undefined) {
                    verticalRotationConfig.min = camera.rotateVerticalMinValue;
                }
                if (camera.rotateVerticalMaxValue !== undefined) {
                    verticalRotationConfig.max = camera.rotateVerticalMaxValue;
                }
                if (camera.rotateVerticalStep !== undefined) {
                    verticalRotationConfig.step = camera.rotateVerticalStep;
                }

                // Use stored value or default for vertical rotation
                if (this.planetSliderValues[locationName].vertical !== undefined) {
                    verticalRotationConfig.value = this.planetSliderValues[locationName].vertical;
                } else if (camera.rotateVerticalDefaultValue !== undefined) {
                    verticalRotationConfig.value = camera.rotateVerticalDefaultValue;
                    this.planetSliderValues[locationName].vertical = verticalRotationConfig.value;
                }

                // Configure depth translate slider
                if (camera.traverseDepthMinValue !== undefined) {
                    depthTranslateConfig.min = camera.traverseDepthMinValue;
                }
                if (camera.traverseDepthMaxValue !== undefined) {
                    depthTranslateConfig.max = camera.traverseDepthMaxValue;
                }
                if (camera.traverseDepthStep !== undefined) {
                    depthTranslateConfig.step = camera.traverseDepthStep;
                }

                // Use stored value or default for depth translate
                if (this.planetSliderValues[locationName].depth !== undefined) {
                    depthTranslateConfig.value = this.planetSliderValues[locationName].depth;
                } else if (camera.traverseDepthDefaultValue !== undefined) {
                    depthTranslateConfig.value = camera.traverseDepthDefaultValue;
                    this.planetSliderValues[locationName].depth = depthTranslateConfig.value;
                }

                // Configure vertical translate slider (for LocalView only)
                if (camera.traverseVerticalMinValue !== undefined) {
                    verticalTranslateConfig.min = camera.traverseVerticalMinValue;
                }
                if (camera.traverseVerticalMaxValue !== undefined) {
                    verticalTranslateConfig.max = camera.traverseVerticalMaxValue;
                }
                if (camera.traverseVerticalStep !== undefined) {
                    verticalTranslateConfig.step = camera.traverseVerticalStep;
                }

                // Use stored value or default for vertical translate
                if (this.planetSliderValues[locationName].verticalTranslate !== undefined) {
                    verticalTranslateConfig.value = this.planetSliderValues[locationName].verticalTranslate;
                } else if (camera.traverseVerticalDefaultValue !== undefined) {
                    verticalTranslateConfig.value = camera.traverseVerticalDefaultValue;
                    this.planetSliderValues[locationName].verticalTranslate = verticalTranslateConfig.value;
                }
            } else {
                // Use previously stored values if available
                if (this.planetSliderValues[locationName].horizontal !== undefined) {
                    horizontalRotationConfig.value = this.planetSliderValues[locationName].horizontal;
                }
                if (this.planetSliderValues[locationName].vertical !== undefined) {
                    verticalRotationConfig.value = this.planetSliderValues[locationName].vertical;
                }
                if (this.planetSliderValues[locationName].depth !== undefined) {
                    depthTranslateConfig.value = this.planetSliderValues[locationName].depth;
                }
                if (this.planetSliderValues[locationName].verticalTranslate !== undefined) {
                    verticalTranslateConfig.value = this.planetSliderValues[locationName].verticalTranslate;
                }
            }

            // Update horizontal rotation slider properties
            this.navigationControls.horizontalRotationSlider.min = horizontalRotationConfig.min;
            this.navigationControls.horizontalRotationSlider.max = horizontalRotationConfig.max;
            this.navigationControls.horizontalRotationSlider.step = horizontalRotationConfig.step;
            this.navigationControls.horizontalRotationSlider.value = horizontalRotationConfig.value;

            // Update vertical rotation slider properties
            this.navigationControls.verticalRotationSlider.min = verticalRotationConfig.min;
            this.navigationControls.verticalRotationSlider.max = verticalRotationConfig.max;
            this.navigationControls.verticalRotationSlider.step = verticalRotationConfig.step;
            this.navigationControls.verticalRotationSlider.value = verticalRotationConfig.value;

            // Update depth translate slider properties
            this.navigationControls.depthTranslateSlider.min = depthTranslateConfig.min;
            this.navigationControls.depthTranslateSlider.max = depthTranslateConfig.max;
            this.navigationControls.depthTranslateSlider.step = depthTranslateConfig.step;
            this.navigationControls.depthTranslateSlider.value = depthTranslateConfig.value;

            // Update vertical translate slider properties
            this.navigationControls.verticalTranslateSlider.min = verticalTranslateConfig.min;
            this.navigationControls.verticalTranslateSlider.max = verticalTranslateConfig.max;
            this.navigationControls.verticalTranslateSlider.step = verticalTranslateConfig.step;
            this.navigationControls.verticalTranslateSlider.value = verticalTranslateConfig.value;

            // Show reset buttons based on view type
            this.navigationControls.horizontalRotationResetButton.style.opacity = '1';
            this.navigationControls.verticalRotationResetButton.style.opacity = '1';
            this.navigationControls.depthTranslateResetButton.style.opacity = isLocalView ? '0.5' : '1';
            this.navigationControls.verticalTranslateResetButton.style.opacity = isLocalView ? '1' : '0.5';

            // Show/hide plane switch based on view type
            if (this.navigationControls.planeSwitch) {
                // Get the parent element that contains the toggle
                const toggleParent = this.navigationControls.planeSwitch.parentElement;
                if (toggleParent) {
                    const isPlanetSideView = this.activeView instanceof PlanetSideView;
                    toggleParent.style.opacity = isPlanetSideView ? '1' : '0.5';
                    toggleParent.style.pointerEvents = isPlanetSideView ? 'auto' : 'none';
                }

                // Update switch state based on current camera type
                if (this.activeView instanceof PlanetSideView) {
                    this.navigationControls.planeSwitch.checked =
                        PlanetSideView.recentCameraType === PlanetSideView.cameraTypes.EQUATOR_PLANE;
                }
            }
        } else {
            // Reset and hide slider thumbs when inactive
            this.navigationControls.horizontalRotationSlider.min = 0;
            this.navigationControls.horizontalRotationSlider.max = 0;
            this.navigationControls.horizontalRotationSlider.value = 0;
            this.navigationControls.horizontalRotationSlider.style.opacity = '0.5';

            this.navigationControls.verticalRotationSlider.min = 0;
            this.navigationControls.verticalRotationSlider.max = 0;
            this.navigationControls.verticalRotationSlider.value = 0;
            this.navigationControls.verticalRotationSlider.style.opacity = '0.5';

            this.navigationControls.depthTranslateSlider.min = 0;
            this.navigationControls.depthTranslateSlider.max = 0;
            this.navigationControls.depthTranslateSlider.value = 0;
            this.navigationControls.depthTranslateSlider.style.opacity = '0.5';

            this.navigationControls.verticalTranslateSlider.min = 0;
            this.navigationControls.verticalTranslateSlider.max = 0;
            this.navigationControls.verticalTranslateSlider.value = 0;
            this.navigationControls.verticalTranslateSlider.style.opacity = '0.5';

            // Dim reset buttons
            this.navigationControls.horizontalRotationResetButton.style.opacity = '0.5';
            this.navigationControls.verticalRotationResetButton.style.opacity = '0.5';
            this.navigationControls.depthTranslateResetButton.style.opacity = '0.5';
            this.navigationControls.verticalTranslateResetButton.style.opacity = '0.5';
        }
    }
}