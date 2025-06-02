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

        // Add radio buttons for location views (placeholder for now)
        this.addViewRadioButton('View from Budapest', 'view', 'budapest', locationViewRadioGroup);
        this.addViewRadioButton('View from Kiruna', 'view', 'kiruna', locationViewRadioGroup);
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
        } else {
            // Local views
            this.localView.setViewType(viewName);
            this.activeView = this.localView;
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

        // Create table row for horizontal angle control
        const horizontalRow = document.createElement('tr');

        // First column - Horizontal rotation icon
        const horizontalIconCell = document.createElement('td');
        horizontalIconCell.style.width = '24px';
        horizontalIconCell.style.height = '24px';

        const horizontalIcon = document.createElement('img');
        horizontalIcon.src = 'icons/rotate-horizontal.png';
        horizontalIcon.style.width = '24px';
        horizontalIcon.style.height = '24px';
        horizontalIconCell.appendChild(horizontalIcon);

        // Second column - Slider
        const horizontalSliderCell = document.createElement('td');
        horizontalSliderCell.style.padding = '0 10px';

        const horizontalSlider = document.createElement('input');
        horizontalSlider.type = 'range';
        horizontalSlider.min = '0';
        horizontalSlider.max = '0';
        horizontalSlider.value = '0';
        horizontalSlider.style.width = '100%';
        horizontalSlider.id = 'navigation-horizontal-slider';

        // Add event listener to update the camera position when slider changes
        horizontalSlider.addEventListener('input', (e) => {
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
                if (this.activeView.positionCameraAtEquatorAngle) {
                    const verticalValue = this.planetSliderValues[planetName].vertical || 0;
                    this.activeView.positionCameraAtEquatorAngle(verticalValue, value);
                }
            }
        });

        horizontalSliderCell.appendChild(horizontalSlider);

        // Third column - Reset button
        const horizontalResetCell = document.createElement('td');
        horizontalResetCell.style.width = '24px';
        horizontalResetCell.style.height = '24px';

        const horizontalResetButton = document.createElement('img');
        horizontalResetButton.src = 'icons/reset.png';
        horizontalResetButton.style.width = '24px';
        horizontalResetButton.style.height = '24px';
        horizontalResetButton.style.cursor = 'pointer';

        // Add event listener to reset the slider to default value
        horizontalResetButton.addEventListener('click', () => {
            if (this.activeView instanceof PlanetSideView) {
                const viewType = this.activeView.viewType;
                const planetName = viewType.replace('SideView', '');

                // Get default value
                let defaultValue = 0;
                if (PlanetSideView.viewCameras &&
                    PlanetSideView.viewCameras[viewType] &&
                    PlanetSideView.viewCameras[viewType].rotateHorizontalDefaultValue !== undefined) {
                    defaultValue = PlanetSideView.viewCameras[viewType].rotateHorizontalDefaultValue;
                }

                // Update slider and camera
                horizontalSlider.value = defaultValue;
                if (!this.planetSliderValues[planetName]) {
                    this.planetSliderValues[planetName] = {};
                }
                this.planetSliderValues[planetName].horizontal = defaultValue;

                if (this.activeView.positionCameraAtEquatorAngle) {
                    const verticalValue = this.planetSliderValues[planetName].vertical || 0;
                    this.activeView.positionCameraAtEquatorAngle(verticalValue, defaultValue);
                }
            }
        });

        horizontalResetCell.appendChild(horizontalResetButton);

        // Add cells to row
        horizontalRow.appendChild(horizontalIconCell);
        horizontalRow.appendChild(horizontalSliderCell);
        horizontalRow.appendChild(horizontalResetCell);

        // Add row to table
        navigationTable.appendChild(horizontalRow);

        // Create table row for vertical angle control
        const verticalRow = document.createElement('tr');

        // First column - Vertical rotation icon
        const verticalIconCell = document.createElement('td');
        verticalIconCell.style.width = '24px';
        verticalIconCell.style.height = '24px';

        const verticalIcon = document.createElement('img');
        verticalIcon.src = 'icons/rotate-vertical.png';
        verticalIcon.style.width = '24px';
        verticalIcon.style.height = '24px';
        verticalIconCell.appendChild(verticalIcon);

        // Second column - Slider
        const verticalSliderCell = document.createElement('td');
        verticalSliderCell.style.padding = '0 10px';

        const verticalSlider = document.createElement('input');
        verticalSlider.type = 'range';
        verticalSlider.min = '0';
        verticalSlider.max = '0';
        verticalSlider.value = '0';
        verticalSlider.style.width = '100%';
        verticalSlider.id = 'navigation-vertical-slider';

        // Add event listener to update the camera position when slider changes
        verticalSlider.addEventListener('input', (e) => {
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
                if (this.activeView.positionCameraAtEquatorAngle) {
                    const horizontalValue = this.planetSliderValues[planetName].horizontal || 0;
                    this.activeView.positionCameraAtEquatorAngle(value, horizontalValue);
                }
            }
        });

        verticalSliderCell.appendChild(verticalSlider);

        // Third column - Reset button
        const verticalResetCell = document.createElement('td');
        verticalResetCell.style.width = '24px';
        verticalResetCell.style.height = '24px';

        const verticalResetButton = document.createElement('img');
        verticalResetButton.src = 'icons/reset.png';
        verticalResetButton.style.width = '24px';
        verticalResetButton.style.height = '24px';
        verticalResetButton.style.cursor = 'pointer';

        // Add event listener to reset the slider to default value
        verticalResetButton.addEventListener('click', () => {
            if (this.activeView instanceof PlanetSideView) {
                const viewType = this.activeView.viewType;
                const planetName = viewType.replace('SideView', '');

                // Get default value
                let defaultValue = 0;
                if (PlanetSideView.viewCameras &&
                    PlanetSideView.viewCameras[viewType] &&
                    PlanetSideView.viewCameras[viewType].rotateVerticalDefaultValue !== undefined) {
                    defaultValue = PlanetSideView.viewCameras[viewType].rotateVerticalDefaultValue;
                }

                // Update slider and camera
                verticalSlider.value = defaultValue;
                if (!this.planetSliderValues[planetName]) {
                    this.planetSliderValues[planetName] = {};
                }
                this.planetSliderValues[planetName].vertical = defaultValue;

                if (this.activeView.positionCameraAtEquatorAngle) {
                    const horizontalValue = this.planetSliderValues[planetName].horizontal || 0;
                    this.activeView.positionCameraAtEquatorAngle(defaultValue, horizontalValue);
                }
            }
        });

        verticalResetCell.appendChild(verticalResetButton);

        // Add cells to row
        verticalRow.appendChild(verticalIconCell);
        verticalRow.appendChild(verticalSliderCell);
        verticalRow.appendChild(verticalResetCell);

        // Add row to table
        navigationTable.appendChild(verticalRow);

        // Create table row for depth control
        const depthRow = document.createElement('tr');

        // First column - Depth icon
        const depthIconCell = document.createElement('td');
        depthIconCell.style.width = '24px';
        depthIconCell.style.height = '24px';

        const depthIcon = document.createElement('img');
        depthIcon.src = 'icons/translate-depth.png';
        depthIcon.style.width = '24px';
        depthIcon.style.height = '24px';
        depthIconCell.appendChild(depthIcon);

        // Second column - Slider
        const depthSliderCell = document.createElement('td');
        depthSliderCell.style.padding = '0 10px';

        const depthSlider = document.createElement('input');
        depthSlider.type = 'range';
        depthSlider.min = '0';
        depthSlider.max = '0';
        depthSlider.value = '0';
        depthSlider.style.width = '100%';
        depthSlider.id = 'navigation-depth-slider';

        // Add event listener to update the camera position when slider changes
        depthSlider.addEventListener('input', (e) => {
            if (this.activeView instanceof PlanetSideView) {
                const viewType = this.activeView.viewType;
                const planetName = viewType.replace('SideView', '');
                const value = parseFloat(e.target.value);

                // Store the current value for this planet
                if (!this.planetSliderValues[planetName]) {
                    this.planetSliderValues[planetName] = {};
                }
                this.planetSliderValues[planetName].depth = value;

                console.log(value);

                // Update the camera position
                if (this.activeView.positionCameraAtEquatorAngle) {
                    const verticalValue = this.planetSliderValues[planetName].vertical || 0;
                    const horizontalValue = this.planetSliderValues[planetName].horizontal || 0;
                    this.activeView.positionCameraAtEquatorAngle(verticalValue, horizontalValue, value);
                }
            }
        });

        depthSliderCell.appendChild(depthSlider);

        // Third column - Reset button
        const depthResetCell = document.createElement('td');
        depthResetCell.style.width = '24px';
        depthResetCell.style.height = '24px';

        const depthResetButton = document.createElement('img');
        depthResetButton.src = 'icons/reset.png';
        depthResetButton.style.width = '24px';
        depthResetButton.style.height = '24px';
        depthResetButton.style.cursor = 'pointer';

        // Add event listener to reset the slider to default value
        depthResetButton.addEventListener('click', () => {
            if (this.activeView instanceof PlanetSideView) {
                const viewType = this.activeView.viewType;
                const planetName = viewType.replace('SideView', '');

                // Get default value
                let defaultValue = 0;
                if (PlanetSideView.viewCameras &&
                    PlanetSideView.viewCameras[viewType] &&
                    PlanetSideView.viewCameras[viewType].traverseDepthDefaultValue !== undefined) {
                    defaultValue = PlanetSideView.viewCameras[viewType].traverseDepthDefaultValue;
                }

                // Update slider and camera
                depthSlider.value = defaultValue;
                if (!this.planetSliderValues[planetName]) {
                    this.planetSliderValues[planetName] = {};
                }
                this.planetSliderValues[planetName].depth = defaultValue;

                if (this.activeView.positionCameraAtEquatorAngle) {
                    const verticalValue = this.planetSliderValues[planetName].vertical || 0;
                    const horizontalValue = this.planetSliderValues[planetName].horizontal || 0;
                    this.activeView.positionCameraAtEquatorAngle(verticalValue, horizontalValue, defaultValue);
                }
            }
        });

        depthResetCell.appendChild(depthResetButton);

        // Add cells to row
        depthRow.appendChild(depthIconCell);
        depthRow.appendChild(depthSliderCell);
        depthRow.appendChild(depthResetCell);

        // Add row to table
        navigationTable.appendChild(depthRow);

        // Add table to content
        this.consoleContent.appendChild(navigationTable);

        // Store references to navigation elements
        this.navigationControls = {
            table: navigationTable,
            horizontalRow: horizontalRow,
            horizontalSlider: horizontalSlider,
            horizontalResetButton: horizontalResetButton,
            verticalRow: verticalRow,
            verticalSlider: verticalSlider,
            verticalResetButton: verticalResetButton,
            depthRow: depthRow,
            depthSlider: depthSlider,
            depthResetButton: depthResetButton
        };

        // Initially set navigation controls based on active view
        this.updateNavigationControls();
    }

    updateNavigationControls() {
        if (!this.navigationControls) return;

        // Enable controls only for Planet Side Views
        const enabled = this.activeView instanceof PlanetSideView;

        // Set visibility based on enabled state
        this.navigationControls.horizontalRow.style.opacity = enabled ? '1' : '0.5';
        this.navigationControls.horizontalRow.style.pointerEvents = enabled ? 'auto' : 'none';
        this.navigationControls.verticalRow.style.opacity = enabled ? '1' : '0.5';
        this.navigationControls.verticalRow.style.pointerEvents = enabled ? 'auto' : 'none';
        this.navigationControls.depthRow.style.opacity = enabled ? '1' : '0.5';
        this.navigationControls.depthRow.style.pointerEvents = enabled ? 'auto' : 'none';

        // Configure slider appearance
        if (enabled) {
            // Get the current planet name from the view type
            const viewType = this.activeView.viewType;
            const planetName = viewType.replace('SideView', '');

            // Initialize planet slider values if needed
            if (!this.planetSliderValues[planetName]) {
                this.planetSliderValues[planetName] = {};
            }

            // Get camera settings for horizontal slider
            let horizontalConfig = {
                min: -Math.PI/2,
                max: Math.PI/2,
                value: 0,
                step: 0.01
            };

            // Get camera settings for vertical slider
            let verticalConfig = {
                min: -Math.PI/2,
                max: Math.PI/2,
                value: 0,
                step: 0.01
            };

            // Get camera settings for depth slider
            let depthConfig = {
                min: 0.6,
                max: 3,
                value: 2,
                step: 0.01
            };

            // Check if there are specific camera settings for this planet
            if (PlanetSideView.viewCameras &&
                PlanetSideView.viewCameras[viewType]) {

                const camera = PlanetSideView.viewCameras[viewType];

                // Configure horizontal slider
                if (camera.rotateHorizontalMinValue !== undefined) {
                    horizontalConfig.min = camera.rotateHorizontalMinValue;
                }
                if (camera.rotateHorizontalMaxValue !== undefined) {
                    horizontalConfig.max = camera.rotateHorizontalMaxValue;
                }
                if (camera.rotateHorizontalStep !== undefined) {
                    horizontalConfig.step = camera.rotateHorizontalStep;
                }

                // Use stored value or default for horizontal
                if (this.planetSliderValues[planetName].horizontal !== undefined) {
                    horizontalConfig.value = this.planetSliderValues[planetName].horizontal;
                } else if (camera.rotateHorizontalDefaultValue !== undefined) {
                    horizontalConfig.value = camera.rotateHorizontalDefaultValue;
                    this.planetSliderValues[planetName].horizontal = horizontalConfig.value;
                }

                // Configure vertical slider
                if (camera.rotateVerticalMinValue !== undefined) {
                    verticalConfig.min = camera.rotateVerticalMinValue;
                }
                if (camera.rotateVerticalMaxValue !== undefined) {
                    verticalConfig.max = camera.rotateVerticalMaxValue;
                }
                if (camera.rotateVerticalStep !== undefined) {
                    verticalConfig.step = camera.rotateVerticalStep;
                }

                // Use stored value or default for vertical
                if (this.planetSliderValues[planetName].vertical !== undefined) {
                    verticalConfig.value = this.planetSliderValues[planetName].vertical;
                } else if (camera.rotateVerticalDefaultValue !== undefined) {
                    verticalConfig.value = camera.rotateVerticalDefaultValue;
                    this.planetSliderValues[planetName].vertical = verticalConfig.value;
                }

                // Configure depth slider
                if (camera.traverseDepthMinValue !== undefined) {
                    depthConfig.min = camera.traverseDepthMinValue;
                }
                if (camera.traverseDepthMaxValue !== undefined) {
                    depthConfig.max = camera.traverseDepthMaxValue;
                }
                if (camera.traverseDepthStep !== undefined) {
                    depthConfig.step = camera.traverseDepthStep;
                }

                // Use stored value or default for depth
                if (this.planetSliderValues[planetName].depth !== undefined) {
                    depthConfig.value = this.planetSliderValues[planetName].depth;
                } else if (camera.traverseDepthDefaultValue !== undefined) {
                    depthConfig.value = camera.traverseDepthDefaultValue;
                    this.planetSliderValues[planetName].depth = depthConfig.value;
                }
            } else {
                // Use previously stored values if available
                if (this.planetSliderValues[planetName].horizontal !== undefined) {
                    horizontalConfig.value = this.planetSliderValues[planetName].horizontal;
                }
                if (this.planetSliderValues[planetName].vertical !== undefined) {
                    verticalConfig.value = this.planetSliderValues[planetName].vertical;
                }
                if (this.planetSliderValues[planetName].depth !== undefined) {
                    depthConfig.value = this.planetSliderValues[planetName].depth;
                }
            }

            // Update horizontal slider properties
            this.navigationControls.horizontalSlider.min = horizontalConfig.min;
            this.navigationControls.horizontalSlider.max = horizontalConfig.max;
            this.navigationControls.horizontalSlider.step = horizontalConfig.step;
            this.navigationControls.horizontalSlider.value = horizontalConfig.value;

            // Update vertical slider properties
            this.navigationControls.verticalSlider.min = verticalConfig.min;
            this.navigationControls.verticalSlider.max = verticalConfig.max;
            this.navigationControls.verticalSlider.step = verticalConfig.step;
            this.navigationControls.verticalSlider.value = verticalConfig.value;

            // Update depth slider properties
            this.navigationControls.depthSlider.min = depthConfig.min;
            this.navigationControls.depthSlider.max = depthConfig.max;
            this.navigationControls.depthSlider.step = depthConfig.step;
            this.navigationControls.depthSlider.value = depthConfig.value;

            // Show the slider thumbs
            this.navigationControls.horizontalSlider.style.opacity = '1';
            this.navigationControls.verticalSlider.style.opacity = '1';
            this.navigationControls.depthSlider.style.opacity = '1';

            // Show reset buttons
            this.navigationControls.horizontalResetButton.style.opacity = '1';
            this.navigationControls.verticalResetButton.style.opacity = '1';
            this.navigationControls.depthResetButton.style.opacity = '1';
        } else {
            // Reset and hide slider thumbs when inactive
            this.navigationControls.horizontalSlider.min = 0;
            this.navigationControls.horizontalSlider.max = 0;
            this.navigationControls.horizontalSlider.value = 0;
            this.navigationControls.horizontalSlider.style.opacity = '0.5';

            this.navigationControls.verticalSlider.min = 0;
            this.navigationControls.verticalSlider.max = 0;
            this.navigationControls.verticalSlider.value = 0;
            this.navigationControls.verticalSlider.style.opacity = '0.5';

            this.navigationControls.depthSlider.min = 0;
            this.navigationControls.depthSlider.max = 0;
            this.navigationControls.depthSlider.value = 0;
            this.navigationControls.depthSlider.style.opacity = '0.5';

            // Dim reset buttons
            this.navigationControls.horizontalResetButton.style.opacity = '0.5';
            this.navigationControls.verticalResetButton.style.opacity = '0.5';
            this.navigationControls.depthResetButton.style.opacity = '0.5';
        }
    }
}