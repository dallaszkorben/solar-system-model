/**
 * PlanetControlPanel class for controlling individual planets
 */
class PlanetControlPanel extends ControlPanel {
    constructor(planet) {
        super(`${planet ? planet.constructor.name : 'Planet'} Controls`, { top: '20px', right: '20px' });
        this.planet = planet;

        this.defaultAxisVisibility = true;

        // Create visibility controls section
        this.createVisibilitySection();

        // Create rotation controls section for Sky
        if (planet && planet.constructor.name === 'Sky') {
            this.createSkyRotationSection();
        }

        // Hide the panel by default
        this.hide();
    }

    /**
     * Create visibility controls section
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

        // Add orbit line toggle if planet has orbit
        if (this.planet && this.planet.orbitRadius > 0) {
            this.addOrbitLineToggle();
        }

        // Add axis toggle
        this.addAxisToggle();

        // Add North Pole Axis toggle for Earth only
        if (this.planet && this.planet.constructor.name === 'Earth') {
            this.addNorthPoleAxisToggle();
        }

        // Add latitude circles toggle if planet has them
        if (this.planet && this.planet.latitudeCircles) {
            this.addLatitudeCirclesToggle();
        }
    }

    /**
     * Add visibility toggle
     */
    addVisibilityToggle() {
        const container = document.createElement('div');
        container.style.marginBottom = '10px';
        container.style.display = 'flex';
        container.style.justifyContent = 'space-between';
        container.style.alignItems = 'center';

        // Use "Planet" label for all planets
        const labelElem = document.createElement('label');
        labelElem.textContent = 'Planet: ';

        // Create switch container
        const switchLabel = document.createElement('label');
        switchLabel.className = 'switch';

        // Create toggle input
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = true; // Initially visible
        toggle.id = `${this.planet.constructor.name.toLowerCase()}-panel-visibility-toggle`;

        // Add event listener
        toggle.addEventListener('change', (e) => {
            if (this.planet) {
                this.planet.setVisibility(e.target.checked);

                // Also update the main visibility toggle in the solar system panel
                const mainToggle = document.getElementById(`${this.planet.constructor.name.toLowerCase()}-visibility-toggle`);
                if (mainToggle) {
                    mainToggle.checked = e.target.checked;
                }
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
     * Add orbit line toggle
     */
    addOrbitLineToggle() {
        const container = document.createElement('div');
        container.style.marginBottom = '10px';
        container.style.display = 'flex';
        container.style.justifyContent = 'space-between';
        container.style.alignItems = 'center';

        const labelElem = document.createElement('label');
        labelElem.textContent = 'Orbit Line: ';

        // Create switch container
        const switchLabel = document.createElement('label');
        switchLabel.className = 'switch';

        // Create toggle input
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = true; // Initially visible
        toggle.id = `${this.planet.constructor.name.toLowerCase()}-panel-orbit-toggle`;

        // Add event listener
        toggle.addEventListener('change', (e) => {
            if (this.planet && this.planet.orbitLine) {
                this.planet.orbitLine.visible = e.target.checked;
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
     * Add axis toggle
     */
    addAxisToggle() {
        const container = document.createElement('div');
        container.style.marginBottom = '10px';
        container.style.display = 'flex';
        container.style.justifyContent = 'space-between';
        container.style.alignItems = 'center';

        const labelElem = document.createElement('label');
        labelElem.textContent = 'Rotation Axis: ';

        // Create switch container
        const switchLabel = document.createElement('label');
        switchLabel.className = 'switch';

        // Create toggle input
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';

//        // Set initial state - OFF for Sky, ON for other planets
//        toggle.checked = this.planet.constructor.name !== 'Sky';
//        toggle.id = `${this.planet.constructor.name.toLowerCase()}-panel-axis-toggle`;

        // Add event listener
        toggle.checked = this.defaultAxisVisibility;
        toggle.addEventListener('change', (e) => {
            if (this.planet && this.planet.axis) {
                this.planet.axis.visible = e.target.checked;
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
     * Add North Pole Axis toggle (Earth only)
     */
    addNorthPoleAxisToggle() {
        const container = document.createElement('div');
        container.style.marginBottom = '10px';
        container.style.display = 'flex';
        container.style.justifyContent = 'space-between';
        container.style.alignItems = 'center';

        const labelElem = document.createElement('label');
        labelElem.textContent = 'North Pole Axis: ';

        // Create switch container
        const switchLabel = document.createElement('label');
        switchLabel.className = 'switch';

        // Create toggle input
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = false; // Initially hidden
        toggle.id = 'earth-panel-north-pole-axis-toggle';

        // Add event listener
        toggle.addEventListener('change', (e) => {
            if (this.planet && this.planet.northPoleAxis) {
                this.planet.northPoleAxis.visible = e.target.checked;
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
     * Add latitude circles toggle
     */
    addLatitudeCirclesToggle() {
        const container = document.createElement('div');
        container.style.marginBottom = '10px';
        container.style.display = 'flex';
        container.style.justifyContent = 'space-between';
        container.style.alignItems = 'center';

        const labelElem = document.createElement('label');
        labelElem.textContent = 'Latitude Circles: ';

        // Create switch container
        const switchLabel = document.createElement('label');
        switchLabel.className = 'switch';

        // Create toggle input
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = false; // Initially hidden
        toggle.id = `${this.planet.constructor.name.toLowerCase()}-panel-latitude-toggle`;

        // Add event listener
        toggle.addEventListener('change', (e) => {
            if (this.planet && this.planet.latitudeCircles) {
                this.planet.latitudeCircles.visible = e.target.checked;
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
     * Create Sky rotation controls section
     */
    createSkyRotationSection() {
        // Create section header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Rotation Controls';
        sectionHeader.style.margin = '15px 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Get default values from the Sky object if available
        const defaultPitch = this.planet.defaultPitchDegrees !== undefined ? this.planet.defaultPitchDegrees : 0;
        const defaultYaw = this.planet.defaultYawDegrees !== undefined ? this.planet.defaultYawDegrees : 0;
        const defaultRoll = this.planet.defaultRollDegrees !== undefined ? this.planet.defaultRollDegrees : 23.4;

        // Add rotation sliders with defaults from Sky object
        this.addRotationSlider('Pitch', 'pitch', defaultPitch);
        this.addRotationSlider('Yaw', 'yaw', defaultYaw);
        this.addRotationSlider('Roll', 'roll', defaultRoll);
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
            if (this.planet) {
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
        });

        // Add event listener for reset button
        resetButton.addEventListener('click', () => {
            slider.value = defaultDegrees.toString(); // Reset to default value
            valueField.value = `${defaultDegrees}°`;

            // Reset rotation to default
            if (this.planet) {
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
        if (this.planet) {
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
}