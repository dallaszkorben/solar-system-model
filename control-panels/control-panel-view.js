/**
 * ViewControlPanel class for controlling the view
 */
class ViewControlPanel extends ControlPanel {
    constructor(solarSystem) {
        super('View Controls', { top: '20px', left: '340px' });
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

        // Add radio buttons for global views
        this.addViewRadioButton('Top View', 'view', 'topView', viewRadioGroup);
        this.addViewRadioButton('Side View', 'view', 'sideView', viewRadioGroup);
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

        // Deactivate current view if any
        if (this.activeView) {
            this.activeView.deactivate();
        }

        // Determine which view object to use based on the view name
        if (viewName === 'topView' || viewName === 'sideView') {
            // Global views
            this.globalView.setViewType(viewName);
            this.activeView = this.globalView;
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

        // Create table for navigation controls
        const navigationTable = document.createElement('table');
        navigationTable.style.width = '100%';
        navigationTable.style.borderCollapse = 'collapse';

        // Create table row for horizontal rotation angle control
        const horizontalRotationRow = document.createElement('tr');

        // First column - Horizontal rotation icon
        const horizontalRotationIconCell = document.createElement('td');
        horizontalRotationIconCell.style.width = '24px';
        horizontalRotationIconCell.style.height = '24px';

        const horizontalRotationIcon = document.createElement('img');
        horizontalRotationIcon.src = 'icons/rotate-horizontal.png';
        horizontalRotationIcon.style.width = '24px';
        horizontalRotationIcon.style.height = '24px';
        horizontalRotationIconCell.appendChild(horizontalRotationIcon);

        // Second column - Slider
        const horizontalRotationSliderCell = document.createElement('td');
        horizontalRotationSliderCell.style.padding = '0 10px';

        const horizontalRotationSlider = document.createElement('input');
        horizontalRotationSlider.type = 'range';
        horizontalRotationSlider.min = '0';
        horizontalRotationSlider.max = '0';
        horizontalRotationSlider.value = '0';
        horizontalRotationSlider.style.width = '100%';
        horizontalRotationSlider.id = 'navigation-horizontal-rotation-slider';

        // Add event listener to update the camera position when slider changes
        horizontalRotationSlider.addEventListener('input', (e) => {
            if (this.activeView instanceof PlanetSideView) {
                const viewType = this.activeView.viewType;
                const planetName = viewType.replace('SideView', '');
                const value = parseFloat(e.target.value);

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
                const value = parseFloat(e.target.value);

                // Store the current value for this location
                if (!this.planetSliderValues[viewType]) {
                    this.planetSliderValues[viewType] = {};
                }
                this.planetSliderValues[viewType].horizontal = value;

                // Update the camera position
                this.activeView.setHorizontalAngle(value);
            }
        });

        horizontalRotationSliderCell.appendChild(horizontalRotationSlider);

        // Third column - Reset button
        const horizontalRotationResetCell = document.createElement('td');
        horizontalRotationResetCell.style.width = '24px';
        horizontalRotationResetCell.style.height = '24px';

        const horizontalRotationResetButton = document.createElement('img');
        horizontalRotationResetButton.src = 'icons/reset.png';
        horizontalRotationResetButton.style.width = '24px';
        horizontalRotationResetButton.style.height = '24px';
        horizontalRotationResetButton.style.cursor = 'pointer';

        // Add event listener to reset the slider to default value
        horizontalRotationResetButton.addEventListener('click', () => {
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
                horizontalRotationSlider.value = defaultValue;
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
                horizontalRotationSlider.value = defaultValue;
                if (!this.planetSliderValues[viewType]) {
                    this.planetSliderValues[viewType] = {};
                }
                this.planetSliderValues[viewType].horizontal = defaultValue;

                // Update the camera position
                this.activeView.setHorizontalAngle(defaultValue);
            }
        });

        horizontalRotationResetCell.appendChild(horizontalRotationResetButton);

        // Add cells to row
        horizontalRotationRow.appendChild(horizontalRotationIconCell);
        horizontalRotationRow.appendChild(horizontalRotationSliderCell);
        horizontalRotationRow.appendChild(horizontalRotationResetCell);

        // Add row to table
        navigationTable.appendChild(horizontalRotationRow);

        // Create table row for vertical rotation angle control
        const verticalRotationRow = document.createElement('tr');

        // First column - Vertical rotation icon
        const verticalRotationIconCell = document.createElement('td');
        verticalRotationIconCell.style.width = '24px';
        verticalRotationIconCell.style.height = '24px';

        const verticalRotationIcon = document.createElement('img');
        verticalRotationIcon.src = 'icons/rotate-vertical.png';
        verticalRotationIcon.style.width = '24px';
        verticalRotationIcon.style.height = '24px';
        verticalRotationIconCell.appendChild(verticalRotationIcon);

        // Second column - Slider
        const verticalRotationSliderCell = document.createElement('td');
        verticalRotationSliderCell.style.padding = '0 10px';

        const verticalRotationSlider = document.createElement('input');
        verticalRotationSlider.type = 'range';
        verticalRotationSlider.min = '0';
        verticalRotationSlider.max = '0';
        verticalRotationSlider.value = '0';
        verticalRotationSlider.style.width = '100%';
        verticalRotationSlider.id = 'navigation-vertical-rotation-slider';

        // Add event listener to update the camera position when slider changes
        verticalRotationSlider.addEventListener('input', (e) => {
            if (this.activeView instanceof PlanetSideView) {
                const viewType = this.activeView.viewType;
                const planetName = viewType.replace('SideView', '');
                const value = parseFloat(e.target.value);

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
                const value = parseFloat(e.target.value);

                // Store the current value for this location
                if (!this.planetSliderValues[viewType]) {
                    this.planetSliderValues[viewType] = {};
                }
                this.planetSliderValues[viewType].vertical = value;

                // Update the camera position
                this.activeView.setVerticalAngle(value);
            }
        });

        verticalRotationSliderCell.appendChild(verticalRotationSlider);

        // Third column - Reset button
        const verticalRotationResetCell = document.createElement('td');
        verticalRotationResetCell.style.width = '24px';
        verticalRotationResetCell.style.height = '24px';

        const verticalRotationResetButton = document.createElement('img');
        verticalRotationResetButton.src = 'icons/reset.png';
        verticalRotationResetButton.style.width = '24px';
        verticalRotationResetButton.style.height = '24px';
        verticalRotationResetButton.style.cursor = 'pointer';

        // Add event listener to reset the slider to default value
        verticalRotationResetButton.addEventListener('click', () => {
            if (this.activeView instanceof PlanetSideView) {
                const viewType = this.activeView.viewType;
                const locationName = viewType.replace('SideView', '');

                // Get default value
                let defaultValue = 0;
                if (PlanetSideView.viewCameras &&
                    PlanetSideView.viewCameras[viewType] &&
                    PlanetSideView.viewCameras[viewType].rotateVerticalDefaultValue !== undefined) {
                    defaultValue = PlanetSideView.viewCameras[viewType].rotateVerticalDefaultValue;
                }

                // Update slider and camera
                verticalRotationSlider.value = defaultValue;
                if (!this.planetSliderValues[locationName]) {
                    this.planetSliderValues[locationName] = {};
                }
                this.planetSliderValues[locationName].vertical = defaultValue;

                if (this.activeView.positionSideViewCamera) {
                    const horizontalValue = this.planetSliderValues[locationName].horizontal || 0;
                    this.activeView.positionSideViewCamera(defaultValue, horizontalValue);
                }
            } else if (this.activeView instanceof LocalView) {
                const viewType = this.activeView.viewType;

                // Get default value
                let defaultValue = 0;
                if (LocalView.viewCameras &&
                    LocalView.viewCameras[viewType] &&
                    LocalView.viewCameras[viewType].rotateVerticalDefaultValue !== undefined) {
                    defaultValue = LocalView.viewCameras[viewType].rotateVerticalDefaultValue;
                }

                // Update slider and camera
                verticalRotationSlider.value = defaultValue;
                if (!this.planetSliderValues[viewType]) {
                    this.planetSliderValues[viewType] = {};
                }
                this.planetSliderValues[viewType].vertical = defaultValue;

                // Update the camera position
                this.activeView.setVerticalAngle(defaultValue);
            }
        });

        verticalRotationResetCell.appendChild(verticalRotationResetButton);

        // Add cells to row
        verticalRotationRow.appendChild(verticalRotationIconCell);
        verticalRotationRow.appendChild(verticalRotationSliderCell);
        verticalRotationRow.appendChild(verticalRotationResetCell);

        // Add row to table
        navigationTable.appendChild(verticalRotationRow);

        // Create table row for depth translate control
        const depthTranslateRow = document.createElement('tr');

        // First column - Depth translate icon
        const depthTranslateIconCell = document.createElement('td');
        depthTranslateIconCell.style.width = '24px';
        depthTranslateIconCell.style.height = '24px';

        const depthTranslateIcon = document.createElement('img');
        depthTranslateIcon.src = 'icons/translate-depth.png';
        depthTranslateIcon.style.width = '24px';
        depthTranslateIcon.style.height = '24px';
        depthTranslateIconCell.appendChild(depthTranslateIcon);

        // Second column - Slider
        const depthTranslateSliderCell = document.createElement('td');
        depthTranslateSliderCell.style.padding = '0 10px';

        const depthTranslateSlider = document.createElement('input');
        depthTranslateSlider.type = 'range';
        depthTranslateSlider.min = '0';
        depthTranslateSlider.max = '0';
        depthTranslateSlider.value = '0';
        depthTranslateSlider.style.width = '100%';
        depthTranslateSlider.id = 'navigation-depth-translate-slider';

        // Add event listener to update the camera position when slider changes
        depthTranslateSlider.addEventListener('input', (e) => {
            if (this.activeView instanceof PlanetSideView) {
                const viewType = this.activeView.viewType;
                const planetName = viewType.replace('SideView', '');
                const value = parseFloat(e.target.value);

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
                const value = parseFloat(e.target.value);

                // Store the current value for this location
                if (!this.planetSliderValues[viewType]) {
                    this.planetSliderValues[viewType] = {};
                }
                this.planetSliderValues[viewType].depth = value;

                // Update the camera position
                this.activeView.setCameraElevation(value);
            }
        });

        depthTranslateSliderCell.appendChild(depthTranslateSlider);

        // Third column - Reset button
        const depthTranslateResetCell = document.createElement('td');
        depthTranslateResetCell.style.width = '24px';
        depthTranslateResetCell.style.height = '24px';

        const depthTranslateResetButton = document.createElement('img');
        depthTranslateResetButton.src = 'icons/reset.png';
        depthTranslateResetButton.style.width = '24px';
        depthTranslateResetButton.style.height = '24px';
        depthTranslateResetButton.style.cursor = 'pointer';

        // Add event listener to reset the slider to default value
        depthTranslateResetButton.addEventListener('click', () => {
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
                depthTranslateSlider.value = defaultValue;
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
                depthTranslateSlider.value = defaultValue;
                if (!this.planetSliderValues[viewType]) {
                    this.planetSliderValues[viewType] = {};
                }
                this.planetSliderValues[viewType].depth = defaultValue;

                // Update the camera position
                this.activeView.setCameraElevation(defaultValue);
            }
        });

        depthTranslateResetCell.appendChild(depthTranslateResetButton);

        // Add cells to row
        depthTranslateRow.appendChild(depthTranslateIconCell);
        depthTranslateRow.appendChild(depthTranslateSliderCell);
        depthTranslateRow.appendChild(depthTranslateResetCell);

        // Add row to table
        navigationTable.appendChild(depthTranslateRow);

        // Create table row for vertical translate control
        const verticalTranslateRow = document.createElement('tr');

        // First column - Vertical translate icon
        const verticalTranslateIconCell = document.createElement('td');
        verticalTranslateIconCell.style.width = '24px';
        verticalTranslateIconCell.style.height = '24px';

        const verticalTranslateIcon = document.createElement('img');
        verticalTranslateIcon.src = 'icons/translate-vertical.png';
        verticalTranslateIcon.style.width = '24px';
        verticalTranslateIcon.style.height = '24px';
        verticalTranslateIconCell.appendChild(verticalTranslateIcon);

        // Second column - Slider
        const verticalTranslateSliderCell = document.createElement('td');
        verticalTranslateSliderCell.style.padding = '0 10px';

        const verticalTranslateSlider = document.createElement('input');
        verticalTranslateSlider.type = 'range';
        verticalTranslateSlider.min = '0';
        verticalTranslateSlider.max = '0';
        verticalTranslateSlider.value = '0';
        verticalTranslateSlider.style.width = '100%';
        verticalTranslateSlider.id = 'navigation-vertical-translate-slider';

        // Add event listener to update the camera position when slider changes
        verticalTranslateSlider.addEventListener('input', (e) => {
            if (this.activeView instanceof LocalView) {
                const viewType = this.activeView.viewType;
                const value = parseFloat(e.target.value);

                // Store the current value for this location
                if (!this.planetSliderValues[viewType]) {
                    this.planetSliderValues[viewType] = {};
                }
                this.planetSliderValues[viewType].verticalTranslate = value;

                // Update the camera position
                this.activeView.setVerticalTranslate(value);
            }
        });

        verticalTranslateSliderCell.appendChild(verticalTranslateSlider);

        // Third column - Reset button
        const verticalTranslateResetCell = document.createElement('td');
        verticalTranslateResetCell.style.width = '24px';
        verticalTranslateResetCell.style.height = '24px';

        const verticalTranslateResetButton = document.createElement('img');
        verticalTranslateResetButton.src = 'icons/reset.png';
        verticalTranslateResetButton.style.width = '24px';
        verticalTranslateResetButton.style.height = '24px';
        verticalTranslateResetButton.style.cursor = 'pointer';

        // Add event listener to reset the slider to default value
        verticalTranslateResetButton.addEventListener('click', () => {
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
                verticalTranslateSlider.value = defaultValue;
                if (!this.planetSliderValues[viewType]) {
                    this.planetSliderValues[viewType] = {};
                }
                this.planetSliderValues[viewType].verticalTranslate = defaultValue;

                // Update the camera position
                this.activeView.setVerticalTranslate(defaultValue);
            }
        });

        verticalTranslateResetCell.appendChild(verticalTranslateResetButton);

        // Add cells to row
        verticalTranslateRow.appendChild(verticalTranslateIconCell);
        verticalTranslateRow.appendChild(verticalTranslateSliderCell);
        verticalTranslateRow.appendChild(verticalTranslateResetCell);

        // Add row to table
        navigationTable.appendChild(verticalTranslateRow);

        // Add table to content
        this.consoleContent.appendChild(navigationTable);

        // Store references to navigation elements
        this.navigationControls = {
            table: navigationTable,
            horizontalRotationRow: horizontalRotationRow,
            horizontalRotationSlider: horizontalRotationSlider,
            horizontalRotationResetButton: horizontalRotationResetButton,
            verticalRotationRow: verticalRotationRow,
            verticalRotationSlider: verticalRotationSlider,
            verticalRotationResetButton: verticalRotationResetButton,
            depthTranslateRow: depthTranslateRow,
            depthTranslateSlider: depthTranslateSlider,
            depthTranslateResetButton: depthTranslateResetButton,
            verticalTranslateRow: verticalTranslateRow,
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
                unit: '°' // Show value with degree symbol
            },
            resetButton: {
                tooltip: 'Reset to default',
                resetValue: 40
            },
            toggle: {
                required: false // Don't show toggle switch
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
                unit: 'X' // Show value with X suffix
            },
            resetButton: {
                tooltip: 'Reset to default',
                resetValue: 1.0
            },
            toggle: {
                required: false // Don't show toggle switch
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

    updateNavigationControls() {
        if (!this.navigationControls) return;

        // Enable controls for both Planet Side Views and Local Views
        const enabled = this.activeView instanceof PlanetSideView || this.activeView instanceof LocalView;

        // Set visibility based on enabled state and view type
        const isLocalView = this.activeView instanceof LocalView;

        // Rotation controls enabled for all view types
        this.navigationControls.horizontalRotationRow.style.opacity = enabled ? '1' : '0.5';
        this.navigationControls.horizontalRotationRow.style.pointerEvents = enabled ? 'auto' : 'none';
        this.navigationControls.verticalRotationRow.style.opacity = enabled ? '1' : '0.5';
        this.navigationControls.verticalRotationRow.style.pointerEvents = enabled ? 'auto' : 'none';

        // Depth translate enabled only for non-local views
        this.navigationControls.depthTranslateRow.style.opacity = (enabled && !isLocalView) ? '1' : '0.5';
        this.navigationControls.depthTranslateRow.style.pointerEvents = (enabled && !isLocalView) ? 'auto' : 'none';

        // Vertical translate enabled only for local views
        this.navigationControls.verticalTranslateRow.style.opacity = (enabled && isLocalView) ? '1' : '0.5';
        this.navigationControls.verticalTranslateRow.style.pointerEvents = (enabled && isLocalView) ? 'auto' : 'none';

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

            // Show the slider thumbs based on view type
            const isLocalView = this.activeView instanceof LocalView;

            this.navigationControls.horizontalRotationSlider.style.opacity = '1';
            this.navigationControls.verticalRotationSlider.style.opacity = '1';
            this.navigationControls.depthTranslateSlider.style.opacity = isLocalView ? '0.5' : '1';
            this.navigationControls.verticalTranslateSlider.style.opacity = isLocalView ? '1' : '0.5';

            // Show reset buttons based on view type
            this.navigationControls.horizontalRotationResetButton.style.opacity = '1';
            this.navigationControls.verticalRotationResetButton.style.opacity = '1';
            this.navigationControls.depthTranslateResetButton.style.opacity = isLocalView ? '0.5' : '1';
            this.navigationControls.verticalTranslateResetButton.style.opacity = isLocalView ? '1' : '0.5';
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