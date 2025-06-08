/**
 * SkyControlPanel class for controlling the sky
 * Extends PlanetControlPanel with sky-specific functionality
 */
class SkyControlPanel extends PlanetControlPanel {

    static defaultAxisVisibility = false;

    constructor(sky) {
        super(sky); // Call parent constructor


//        this.createSkyRotationSection();
    }

    getDefaultAxisVisibility(){
        return SkyControlPanel.defaultAxisVisibility;
    }

    /**
     *
     * Override setPlanetVisibility to customize for Sky
     *
     */
    setPlanetVisibility(enable){
        super.setPlanetVisibility(enable);

        // Update the Starry Sky toggle in the Solar System Controls panel
        const starryToggle = document.getElementById(`sky${SolarSystemControlPanel.elementsId.planetVisibilitySwitch}`);
        if (starryToggle) {
            starryToggle.checked = enable;
        }

        // Tell the Sky object to update the scene background
        if (this.planet) {

            // Update the toggle in Solar System Controls panel
            const starryToggle = document.getElementById(`sky${SolarSystemControlPanel.elementsId.planetVisibilitySwitch}`);
            if (starryToggle && starryToggle.checked !== enable) {
                starryToggle.checked = enable;
            }
        }

        // Update Stars and Constellations brightness sliders
        const starsContainer = document.getElementById('sky-stars-container');
        const constellationsContainer = document.getElementById('sky-constellations-container');

        if (starsContainer) {

            // Grey out the entire container when disabled
            starsContainer.style.opacity = enable ? '1' : '0.5';

            // Disable all interactive elements in the container
            const interactiveElements = starsContainer.querySelectorAll('input, img');
            interactiveElements.forEach(element => {
                element.disabled = !enable;

                // Set cursor style based on element state
                if (element.tagName === 'IMG') {
                    element.style.cursor = enable ? 'pointer' : 'default';
                    if (!enable) {
                        element.style.pointerEvents = 'none';
                    } else {
                        element.style.pointerEvents = 'auto';
                    }
                } else if (element.tagName === 'INPUT') {
                    if (element.type === 'range' || element.type === 'checkbox') {
                        element.style.cursor = enable ? 'pointer' : 'default';
                    }
                }
            });
        }

        if (constellationsContainer) {

            // Grey out the entire container when disabled
            constellationsContainer.style.opacity = enable ? '1' : '0.5';

            // Disable all interactive elements in the container
            const interactiveElements = constellationsContainer.querySelectorAll('input, img');
            interactiveElements.forEach(element => {
                element.disabled = !enable;

                // Set cursor style based on element state
                if (element.tagName === 'IMG') {
                    element.style.cursor = enable ? 'pointer' : 'default';

                    if (!enable) {
                        element.style.pointerEvents = 'none';
                    } else {
                        element.style.pointerEvents = 'auto';
                    }
                } else if (element.tagName === 'INPUT') {
                    if (element.type === 'range' || element.type === 'checkbox') {
                        element.style.cursor = enable ? 'pointer' : 'default';
                    }
                }
            });
        }
    }

    /**
     *
     * Override createVisibilitySection to customize for Sky
     *
     */
    createVisibilitySection() {
        // Create section header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Visibility Controls';
        sectionHeader.style.margin = '0 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Add visibility toggle
        this.addVisibilityToggle();

        // Add brightness sliders directly in the visibility section
        this.addBrightnessSlider('Stars', 'stars');
        this.addBrightnessSlider('Constellations', 'constellations');

        // Add axis toggle
        this.addAxisToggle(this.getDefaultAxisVisibility());

        // Add latitude circles toggle if planet has them
        if (this.planet && this.planet.latitudeCircles) {
            this.addLatitudeCirclesToggle();
        }
    }

    /**
     *
     * Override addVisibilityToggle to handle brightness sliders
     *
     */
    addVisibilityToggle() {
        const container = document.createElement('div');
        container.style.marginBottom = '10px';
        container.style.display = 'flex';
        container.style.justifyContent = 'space-between';
        container.style.alignItems = 'center';

        // Use "Sky" label specifically for Sky
        const labelElem = document.createElement('label');
        labelElem.textContent = 'Sky: ';

        // Create switch container
        const switchLabel = document.createElement('label');
        switchLabel.className = 'switch';

        // Create toggle input
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = true; // Initially visible
        toggle.id = `sky${PlanetControlPanel.elementIds.planetVisibilitySwitch}`;

        // Add event listener
        toggle.addEventListener('change', (e) => {
            if (this.planet) {

                // Set visibility of the Sky and toggle the switch on Solar System Controls panel also
                this.setPlanetVisibility(e.target.checked)
            }
        });

        // Create slider span
        const sliderSpan = document.createElement('span');
        sliderSpan.className = 'slider';

        // Assemble the switch
        switchLabel.appendChild(toggle);
        switchLabel.appendChild(sliderSpan);

        // Add elements to container
        container.appendChild(labelElem);
        container.appendChild(switchLabel);

        // Add to control panel
        this.consoleContent.appendChild(container);
    }

    /**
     * Override parent method to create Sky rotation controls section
     */
    createSkyRotationSection() {
        // Create section header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Rotation Controls';
        sectionHeader.style.margin = '15px 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        const defaultPitch = this.planet.factData.axialTilt.x;
        const defaultYaw = this.planet.factData.axialTilt.y;
        const defaultRoll = this.planet.factData.axialTilt.z;

        // Add rotation sliders with defaults from Sky object
        this.addRotationSlider('Pitch (x)', 'pitch', defaultPitch);
        this.addRotationSlider('Yaw (y)', 'yaw', defaultYaw);
        this.addRotationSlider('Roll (z)', 'roll', defaultRoll);
    }

    /**
     * Add brightness slider with toggle
     */
    addBrightnessSlider(label, id) {
        const container = document.createElement('div');
        container.style.marginBottom = '15px';
        container.style.paddingLeft = '20px'; // Indent to show hierarchy
        container.id = `sky-${id}-container`;

        // Add label
        const sliderLabel = document.createElement('label');
        sliderLabel.textContent = `${label}: `;
        sliderLabel.style.display = 'block';
        sliderLabel.style.marginBottom = '5px';
        container.appendChild(sliderLabel);

        // Create controls container for slider, reset button and toggle
        const controlsContainer = document.createElement('div');
        controlsContainer.style.display = 'flex';
        controlsContainer.style.alignItems = 'center';
        controlsContainer.style.gap = '10px';

        // Create slider
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '1';
        slider.step = '0.01';
        // Use default brightness values from the Sky object
        const defaultValue = id === 'stars' ? this.planet.defaultStarBrightness : this.planet.defaultConstellationBrightness;
        slider.value = defaultValue.toString();
        slider.style.flexGrow = '1';
        slider.id = `sky-${id}-brightness-slider`;

        // Create reset button
        const resetButton = document.createElement('img');
        resetButton.src = 'icons/reset.png';
        resetButton.style.width = '24px';
        resetButton.style.height = '24px';
        resetButton.title = "Reset to default brightness";
        // Set cursor style based on disabled state
        resetButton.style.cursor = 'pointer';
        resetButton.setAttribute('data-disabled', 'false');

        // Add event listener for reset button
        resetButton.addEventListener('click', () => {
            slider.value = defaultValue.toString();

            if (id === 'stars') {
                this.planet.setStarsBrightness(defaultValue);
                toggle.checked = true;
                if (this.planet.sphere) {
                    this.planet.sphere.visible = true;
                }
            } else if (id === 'constellations') {
                this.planet.setConstellationsBrightness(defaultValue);
                toggle.checked = id === 'stars'; // Only turn on constellations if it's stars
                if (this.planet.constellationSphere) {
                    this.planet.constellationSphere.visible = id === 'stars';
                }
            }
        });

        // Create switch container
        const switchLabel = document.createElement('label');
        switchLabel.className = 'switch';
        switchLabel.title = `Show/Hide ${label}`;

        // Create toggle input
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = id === 'stars' ? true : false; // Stars on by default, constellations off
        toggle.id = `sky-${id}-toggle`;

        // Create slider span
        const sliderSpan = document.createElement('span');
        sliderSpan.className = 'slider';

        // Assemble the switch
        switchLabel.appendChild(toggle);
        switchLabel.appendChild(sliderSpan);

        // Add event listener for slider
        slider.addEventListener('input', () => {
            const brightness = parseFloat(slider.value);

            // If slider is moved and toggle is off, turn it on
            if (!toggle.checked && brightness > 0) {
                toggle.checked = true;

                // Update visibility based on toggle
                if (id === 'stars' && this.planet.sphere) {
                    this.planet.sphere.visible = true;
                } else if (id === 'constellations' && this.planet.constellationSphere) {
                    this.planet.constellationSphere.visible = true;
                }
            }

            // Update brightness
            if (id === 'stars') {
                this.planet.setStarsBrightness(brightness);
            } else if (id === 'constellations') {
                this.planet.setConstellationsBrightness(brightness);
            }
        });

        // Add event listener for toggle
        toggle.addEventListener('change', (e) => {
            if (id === 'stars' && this.planet.sphere) {
                this.planet.sphere.visible = e.target.checked;

                // If turning on, apply current brightness
                if (e.target.checked) {
                    this.planet.setStarsBrightness(parseFloat(slider.value));
                }
            } else if (id === 'constellations' && this.planet.constellationSphere) {
                this.planet.constellationSphere.visible = e.target.checked;

                // If turning on, apply current brightness
                if (e.target.checked) {
                    this.planet.setConstellationsBrightness(parseFloat(slider.value));
                }
            }
        });

        // Add components to controls container
        controlsContainer.appendChild(slider);
        controlsContainer.appendChild(resetButton);
        controlsContainer.appendChild(switchLabel);

        // Add controls container to main container
        container.appendChild(controlsContainer);

        // Add to control panel
        this.consoleContent.appendChild(container);

        // Apply initial brightness
        if (id === 'stars') {
            this.planet.setStarsBrightness(parseFloat(slider.value));
        } else if (id === 'constellations') {
            this.planet.setConstellationsBrightness(parseFloat(slider.value));
        }
    }



    /**
     * Add rotation slider with value display and reset button
     * @param {string} label - The label for the slider
     * @param {string} id - The ID for the slider
     * @param {number} defaultDegrees - The default value in degrees
     */
    addRotationSlider(label, id, defaultDegrees = 0) {
        // Create container
        const container = document.createElement('div');
        container.style.marginBottom = '15px';

        // Add label
        const sliderLabel = document.createElement('label');
        sliderLabel.textContent = `${label} rotate: `;
        sliderLabel.style.display = 'block';
        sliderLabel.style.marginBottom = '5px';
        container.appendChild(sliderLabel);

        // Create controls container for slider, value field and reset button
        const controlsContainer = document.createElement('div');
        controlsContainer.style.display = 'flex';
        controlsContainer.style.alignItems = 'center';
        controlsContainer.style.gap = '10px';

        // Create slider using degrees
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '-180';
        slider.max = '180';
        slider.step = '1.0'; // 1 degree per step
        slider.value = defaultDegrees.toString(); // Set to the provided default value
        slider.style.flexGrow = '1';
        slider.id = `sky-${id}-rotation-slider`;

        // Create value field
        const valueField = document.createElement('input');
        valueField.type = 'text';
        valueField.value = `${defaultDegrees}°`;
        valueField.readOnly = true;
        valueField.style.width = '40px';
        valueField.style.textAlign = 'right';
        valueField.id = `sky-${id}-rotation-value`;

        // Create reset button
        const resetButton = document.createElement('img');
        resetButton.src = 'icons/reset.png';
        resetButton.style.width = '24px';
        resetButton.style.height = '24px';
        resetButton.style.cursor = 'pointer';
        resetButton.title = "Reset to default position";
        resetButton.id = `sky-${id}-rotation-reset`;

        // Add event listener for slider
        slider.addEventListener('input', () => {
            // Get degrees from slider
            const degrees = parseFloat(slider.value);

            // Convert to radians
            const radians = (degrees * Math.PI) / 180;

            // Display value in degrees
            valueField.value = `${degrees}°`;

            // Apply rotation to the sky
            switch(id) {
                case 'pitch':
                    this.planet.setPitchRotation(radians);
                    break;
                case 'yaw':
                    this.planet.setYawRotation(radians);
                    break;
                case 'roll':
                    this.planet.setRollRotation(radians);
                    break;
            }
        });

        // Add event listener for reset button
        resetButton.addEventListener('click', () => {
            slider.value = defaultDegrees.toString(); // Reset to default value
            valueField.value = `${defaultDegrees}°`;

            // Reset rotation to default
            const radians = (defaultDegrees * Math.PI) / 180;
            switch(id) {
                case 'pitch':
                    this.planet.setPitchRotation(radians);
                    break;
                case 'yaw':
                    this.planet.setYawRotation(radians);
                    break;
                case 'roll':
                    this.planet.setRollRotation(radians);
                    break;
            }
        });

        // Add components to controls container
        controlsContainer.appendChild(slider);
        controlsContainer.appendChild(valueField);
        controlsContainer.appendChild(resetButton);

        // Add controls container to main container
        container.appendChild(controlsContainer);

        // Add to control panel
        this.consoleContent.appendChild(container);

        // Apply initial rotation based on default value
        const radians = (defaultDegrees * Math.PI) / 180;
        switch(id) {
            case 'pitch':
                this.planet.setPitchRotation(radians);
                break;
            case 'yaw':
                this.planet.setYawRotation(radians);
                break;
            case 'roll':
                this.planet.setRollRotation(radians);
                break;
        }
    }
}