/**
 * SolarSystemControlPanel class for controlling the solar system
 */
class SolarSystemControlPanel extends ControlPanel {

    static elementIds = {
        planetVisibilitySwitch: '-planet-visibility-toggle',

        rotationSpeedSlider:    'global-rotation-speed-slider',
        rotationSpeedSwitch:    'global-rotation-speed-toggle',

        orbitSpeedSlider:       'global-orbit-speed-slider',
        orbitSpeedSwitch:       'global-orbit-speed-toggle',

        orbitOpacitySlider:     'global-orbit-opacity-slider',
        obrbitVisibilitySwitch: 'global-orbit-visibility-toggle',
    }




    static scaleModeValues = {
        noScale: 'no-scale',
        sizeScale: 'size-scale',
        distanceScale: 'distance-scale'
    }

    constructor(solarSystem) {
        super('Solar System Controls', { top: '20px', left: '20px' });
        this.solarSystem = solarSystem;

        // Make solarSystem globally accessible for cross-panel communication
        window.solarSystem = solarSystem;

        this.controlPanels = {};

        // Create sections from the old version
        this.createScaleModeSection();
        this.addCelectialBodiesVisibilityControl();
        this.addRotationSpeedControl();
        this.addOrbitSpeedControl();
        this.addOrbitVisibilityControl();
        this.createGeneralControlSection();
    }

    createScaleModeSection() {
        // Create scale mode container
        const scaleModeContainer = document.createElement('div');
        scaleModeContainer.className = 'scale-mode-container';
        scaleModeContainer.style.padding = '10px 0';
        scaleModeContainer.style.borderBottom = '1px solid #666';

        // Add scale mode header
        const scaleModeHeader = document.createElement('div');
        scaleModeHeader.textContent = 'Scale Mode:';
        scaleModeHeader.style.fontWeight = 'bold';
        scaleModeHeader.style.marginBottom = '8px';
        scaleModeContainer.appendChild(scaleModeHeader);

        // Create radio button group
        const radioGroup = document.createElement('div');
        radioGroup.style.display = 'flex';
        radioGroup.style.justifyContent = 'space-between';

        // Create the three options
        const options = [
            { id: 'scale-no', label: 'No', value: SolarSystemControlPanel.scaleModeValues.noScale },
            { id: 'scale-size', label: 'Size', value: SolarSystemControlPanel.scaleModeValues.sizeScale },
            { id: 'scale-distance', label: 'Distance', value: SolarSystemControlPanel.scaleModeValues.distanceScale }
        ];

        options.forEach(option => {
            const optionContainer = document.createElement('div');
            optionContainer.style.display = 'flex';
            optionContainer.style.alignItems = 'center';

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.id = option.id;
            radio.name = 'scale-mode';
            radio.value = option.value;
            radio.checked = option.value === 'no-scale'; // Default to 'no-scale'
            radio.style.marginRight = '5px';

            const label = document.createElement('label');
            label.htmlFor = option.id;
            label.textContent = option.label;

            optionContainer.appendChild(radio);
            optionContainer.appendChild(label);
            radioGroup.appendChild(optionContainer);

            // Add event listener
            radio.addEventListener('change', () => {
                if (radio.checked && this.solarSystem) {
                    this.solarSystem.setScaleMode(option.value);
                }
            });
        });

        scaleModeContainer.appendChild(radioGroup);

        // Add scale mode container to content
        this.consoleContent.appendChild(scaleModeContainer);
    }

    addCelectialBodiesVisibilityControl() {
        // Create section header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Visibility Control';
        sectionHeader.style.margin = '15px 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Add toggles for each celestial body
        Object.entries(SolarSystem.celestialBodies).forEach(([key, body]) => {
            this.createCelestialBodyControl(body);
        });

        // Instantiate all celestial body control panels - But not shown yet
        Object.entries(SolarSystem.celestialBodies).forEach(([key, body]) => {
            if (!this.controlPanels[key]) {
                const controlPanelClass = body.planetControlPanelClass;
                const celestialObj = this.solarSystem.planetObjs[key];
                this.controlPanels[key] = new controlPanelClass(celestialObj);
            }
        });
    }

    createCelestialBodyControl(body) {
        const toggleContainer = document.createElement('div');
        toggleContainer.style.marginBottom = '10px';
        toggleContainer.style.display = 'flex';
        toggleContainer.style.justifyContent = 'space-between';
        toggleContainer.style.alignItems = 'center';

        // Create icon container
        const iconContainer = document.createElement('div');
        iconContainer.style.width = '24px';
        iconContainer.style.height = '24px';
        iconContainer.style.marginRight = '8px';

        // Create and add planet icon
        const planetIcon = document.createElement('img');
        planetIcon.src = `icons/${body.id}.png`;
        planetIcon.style.width = '100%';
        planetIcon.style.height = '100%';
        iconContainer.appendChild(planetIcon);

        const toggleLabel = document.createElement('label');
        toggleLabel.textContent = body.name;
        toggleLabel.style.flexGrow = '1';
        toggleLabel.style.display = 'flex';
        toggleLabel.style.alignItems = 'center';

        // Create first switch container (visibility switch)
        const switchLabel1 = document.createElement('label');
        switchLabel1.className = 'switch';
        switchLabel1.style.marginRight = '10px';
        switchLabel1.title = "Show/Hide " + body.name;

        // Create first toggle input (visibility switch)
        const toggle1 = document.createElement('input');
        toggle1.type = 'checkbox';
        toggle1.checked = true; // Default ON
        toggle1.id = `${body.id}${SolarSystemControlPanel.elementIds.planetVisibilitySwitch}`;

        // Add event listener for visibility toggle
        toggle1.addEventListener('change', () => {
            if (this.solarSystem && this.solarSystem.planetObjs && this.solarSystem.planetObjs[body.id]) {
                this.controlPanels[body.id].setPlanetVisibility(toggle1.checked);
            }
        });

        // Create slider span for first switch
        const sliderSpan1 = document.createElement('span');
        sliderSpan1.className = 'slider';

        // Assemble the first switch
        switchLabel1.appendChild(toggle1);
        switchLabel1.appendChild(sliderSpan1);

        // Create second switch container (controls switch)
        const switchLabel2 = document.createElement('label');
        switchLabel2.className = 'switch';
        switchLabel2.title = "Show/Hide " + body.name + " Controls";

        // Create second toggle input (controls switch)
        const toggle2 = document.createElement('input');
        toggle2.type = 'checkbox';
        toggle2.checked = false;
        toggle2.id = `${body.id}-controls-toggle`;

        // Add event listener for Control Panel toggle
        toggle2.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.controlPanels[body.id].show();
            } else {
                this.controlPanels[body.id].hide();
            }
        });

        // Create slider span for second switch
        const sliderSpan2 = document.createElement('span');
        sliderSpan2.className = 'slider';

        // Assemble the second switch
        switchLabel2.appendChild(toggle2);
        switchLabel2.appendChild(sliderSpan2);

        toggleContainer.appendChild(iconContainer);
        toggleContainer.appendChild(toggleLabel);
        toggleContainer.appendChild(switchLabel1);
        toggleContainer.appendChild(switchLabel2);
        this.consoleContent.appendChild(toggleContainer);
    }

    /**
     * Add rotation speed controls with slider, reset button and toggle
     */
    addRotationSpeedControl() {
        // Create section header
        const rotationHeader = document.createElement('h4');
        rotationHeader.textContent = 'Rotation Controls';
        rotationHeader.style.margin = '15px 0 10px 0';
        rotationHeader.style.borderBottom = '1px solid #555';
        rotationHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(rotationHeader);

        const container = this.createSliderControllerComponent({
            label: 'Global Rotation Speed: ',
            slider: {
                min: '0',
                max: Planet.maxRotationFactor,
                step: '0.01',
                value: '1.0',
                id: SolarSystemControlPanel.elementIds.rotationSpeedSlider
            },
            resetButton: {
                title: "Reset to default speed",
                resetValue: 1.0
            },
            toggle: {
                title: "Enable All Rotation",
                checked: false,
                id: SolarSystemControlPanel.elementIds.rotationSpeedSwitch
            },
            onSliderChange: (slider, toggle) => {
                if (this.solarSystem) {
                    const speedFactor = parseFloat(slider.value);

                    // Update rotation speed for all planets
                    this.setAllRotationSpeed(speedFactor);

                    // If slider is moved from 0, enable the rotation toggle
                    if (speedFactor > 0 && !toggle.checked) {
                        toggle.checked = true;
                    }

                    // If slider is set to 0, disable rotation but don't change the toggle
                    if (speedFactor === 0) {
                        this.setAllRotationEnabled(false);
                    }
                }
            },
            onReset: (slider, toggle, resetValue) => {
                slider.value = resetValue.toString();
                if (this.solarSystem) {
                    this.setAllRotationSpeed(resetValue);
                    toggle.checked = false;
                    this.setAllRotationEnabled(false);
                }
            },
            onToggleChange: (checked) => {
                if (this.solarSystem) {
                    this.setAllRotationEnabled(checked);
                }
            },
            parent: this.consoleContent
        });

        return container;
    }


//    createRotationControlsSection() {
//        // Create section header
//        const rotationHeader = document.createElement('h4');
//        rotationHeader.textContent = 'Rotation Controls';
//        rotationHeader.style.margin = '15px 0 10px 0';
//        rotationHeader.style.borderBottom = '1px solid #555';
//        rotationHeader.style.paddingBottom = '5px';
//        this.consoleContent.appendChild(rotationHeader);
//
//        // Add rotation speed slider with reset button and toggle
//        const rotationSliderContainer = document.createElement('div');
//        rotationSliderContainer.style.marginBottom = '15px';
//
//        // Add label for the slider
//        const rotationSliderLabel = document.createElement('label');
//        rotationSliderLabel.textContent = 'Global Rotation Speed: ';
//        rotationSliderLabel.style.display = 'block';
//        rotationSliderLabel.style.marginBottom = '5px';
//        rotationSliderContainer.appendChild(rotationSliderLabel);
//
//        // Create controls container for slider, reset button and toggle
//        const rotationControlsContainer = document.createElement('div');
//        rotationControlsContainer.style.display = 'flex';
//        rotationControlsContainer.style.alignItems = 'center';
//        rotationControlsContainer.style.gap = '10px';
//
//        // Create slider
//        const rotationSlider = document.createElement('input');
//        rotationSlider.type = 'range';
//        rotationSlider.min = '0';
//        rotationSlider.max = Planet.maxRotationFactor;
//        rotationSlider.step = '0.01';
//        rotationSlider.value = '1.0'; //default
//        rotationSlider.style.flexGrow = '1';
//        rotationSlider.id =  SolarSystemControlPanel.elementIds.rotationSpeedSlider;
//
//        // Create reset button
//        const rotationResetButton = document.createElement('img');
//        rotationResetButton.src = 'icons/reset.png';
//        rotationResetButton.style.width = '24px';
//        rotationResetButton.style.height = '24px';
//        rotationResetButton.style.cursor = 'pointer';
//        rotationResetButton.title = "Reset to default speed";
//
//        // Add event listener for reset button
//        rotationResetButton.addEventListener('click', () => {
//            rotationSlider.value = '1.0';
//            if (this.solarSystem) {
//                this.setAllRotationSpeed(1.0);
//                rotationToggle.checked = false;
//                this.setAllRotationEnabled(false);
//            }
//        });
//
//        // Create switch container
//        const rotationSwitchLabel = document.createElement('label');
//        rotationSwitchLabel.className = 'switch';
//        rotationSwitchLabel.title = "Enable All Rotation";
//
//        const rotationToggle = document.createElement('input');
//        rotationToggle.type = 'checkbox';
//        rotationToggle.checked = false; // Default OFF
//        rotationToggle.id = SolarSystemControlPanel.elementIds.rotationSpeedSwitch;
//
//        // Add event listener for rotation toggle
//        rotationToggle.addEventListener('change', () => {
//            if (this.solarSystem) {
//                this.setAllRotationEnabled(rotationToggle.checked);
//            }
//        });
//
//        // Create slider span
//        const rotationSliderSpan = document.createElement('span');
//        rotationSliderSpan.className = 'slider';
//
//        // Assemble the switch
//        rotationSwitchLabel.appendChild(rotationToggle);
//        rotationSwitchLabel.appendChild(rotationSliderSpan);
//
//        // Add components to controls container
//        rotationControlsContainer.appendChild(rotationSlider);
//        rotationControlsContainer.appendChild(rotationResetButton);
//        rotationControlsContainer.appendChild(rotationSwitchLabel);
//
//        // Add controls container to slider container
//        rotationSliderContainer.appendChild(rotationControlsContainer);
//
//        // Add event listener for rotation speed slider
//        rotationSlider.addEventListener('input', () => {
//            if (this.solarSystem) {
//                // Use slider value directly as the speed factor
//                const speedFactor = parseFloat(rotationSlider.value);
//
//                // Update rotation speed for all planets
//                this.setAllRotationSpeed(speedFactor);
//
//                // If slider is moved from 0, enable the rotation toggle
//                if (speedFactor > 0 && !rotationToggle.checked) {
//                    rotationToggle.checked = true;
//                }
//
//                // If slider is set to 0, disable rotation but don't change the toggle
//                if (speedFactor === 0) {
//                    this.setAllRotationEnabled(false);
//                }
//            }
//        });
//
//        this.consoleContent.appendChild(rotationSliderContainer);
//    }

    /**
     * Add orbit speed controls with slider, reset button and toggle
     */
    addOrbitSpeedControl() {
        // Create section header
        const orbitHeader = document.createElement('h4');
        orbitHeader.textContent = 'Orbit Controls';
        orbitHeader.style.margin = '15px 0 10px 0';
        orbitHeader.style.borderBottom = '1px solid #555';
        orbitHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(orbitHeader);

        const container = this.createSliderControllerComponent({
            label: 'Global Orbit Speed: ',
            slider: {
                min: '0',
                max: Planet.maxOrbitFactor,
                step: '0.1',
                value: '1.0',
                id: SolarSystemControlPanel.elementIds.orbitSpeedSlider
            },
            resetButton: {
                title: "Reset to default speed",
                resetValue: 1.0
            },
            toggle: {
                title: "Enable All Orbits",
                checked: false,
                id: SolarSystemControlPanel.elementIds.orbitSpeedSwitch
            },
            onSliderChange: (slider, toggle) => {
                if (this.solarSystem) {
                    const speedFactor = parseFloat(slider.value);

                    this.setAllOrbitSpeed(speedFactor);

                    // If slider is moved from 0, enable the orbit toggle
                    if (speedFactor > 0 && !toggle.checked) {
                        toggle.checked = true;
                    }

                    // If slider is set to 0, disable orbit but don't change the toggle
                    if (speedFactor === 0) {
                        this.setAllOrbitEnabled(false);
                    }
                }
            },
            onReset: (slider, toggle, resetValue) => {
                slider.value = resetValue.toString();
                if (this.solarSystem) {
                    this.setAllOrbitSpeed(resetValue);
                    toggle.checked = false;
                    this.setAllOrbitEnabled(false);
                }
            },
            onToggleChange: (checked) => {
                this.setAllOrbitEnabled(checked);
            },
            parent: this.consoleContent
        });

        return container;
    }

    /**
     * Add orbit visibility controls with slider, reset button and toggle
     */
    addOrbitVisibilityControl() {
        const container = this.createSliderControllerComponent({
            label: 'Orbit Line: ',
            slider: {
                min: '0',
                max: '1',
                step: '0.01',
                value: Planet.orbitOpacity,
                id: SolarSystemControlPanel.elementIds.orbitOpacitySlider
            },
            resetButton: {
                title: "Reset to default opacity",
                resetValue: Planet.orbitOpacity
            },
            toggle: {
                title: "Show/Hide Orbit Line",
                checked: true,
                id: SolarSystemControlPanel.elementIds.obrbitVisibilitySwitch
            },
            onSliderChange: (slider, toggle) => {
                const opacity = parseFloat(slider.value);

                // Use the solar system method to set all orbit lines opacity
                this.setAllOrbitLinesOpacity(opacity);

                // If slider is moved from 0, enable the visibility toggle
                if (opacity > 0 && !toggle.checked) {
                    toggle.checked = true;
                    this.setAllOrbitLinesVisible(true);
                }

                // If slider is set to 0, make orbit invisible
                if (opacity === 0) {
                    this.setAllOrbitLinesVisible(false);
                }
            },
            onReset: (slider, toggle, resetValue) => {
                slider.value = resetValue.toString();
                this.setAllOrbitLinesOpacity(resetValue);
                toggle.checked = true;
                this.setAllOrbitLinesVisible(true);
            },
            onToggleChange: (checked) => {
                this.setAllOrbitLinesVisible(checked);
            },
            parent: this.consoleContent
        });

        return container;
    }



    createGeneralControlSection(){

        // Create a separate section for General Control
        const generalHeader = document.createElement('h4');
        generalHeader.textContent = 'General Control';
        generalHeader.style.margin = '15px 0 10px 0';
        generalHeader.style.borderBottom = '1px solid #555';
        generalHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(generalHeader);

        // Add Day/Night Effect toggle
        const dayNightContainer = document.createElement('div');
        dayNightContainer.style.marginBottom = '15px';
        dayNightContainer.style.display = 'flex';
        dayNightContainer.style.justifyContent = 'space-between';
        dayNightContainer.style.alignItems = 'center';

        const dayNightLabel = document.createElement('label');
        dayNightLabel.textContent = 'Enable All Day/Night: ';

        // Create switch container
        const dayNightSwitchLabel = document.createElement('label');
        dayNightSwitchLabel.className = 'switch';

        // Create toggle input
        const dayNightToggle = document.createElement('input');
        dayNightToggle.type = 'checkbox';
        dayNightToggle.checked = true; // Default ON
        dayNightToggle.id = 'global-day-night-toggle';

        // Add event listener for day/night toggle
        dayNightToggle.addEventListener('change', () => {
            if (this.solarSystem) {
                this.solarSystem.setAllDayNightEffectEnabled(dayNightToggle.checked);
            }
        });

        // Create slider span
        const dayNightSliderSpan = document.createElement('span');
        dayNightSliderSpan.className = 'slider';

        // Assemble the switch
        dayNightSwitchLabel.appendChild(dayNightToggle);
        dayNightSwitchLabel.appendChild(dayNightSliderSpan);

        dayNightContainer.appendChild(dayNightLabel);
        dayNightContainer.appendChild(dayNightSwitchLabel);
        this.consoleContent.appendChild(dayNightContainer);
    }

// --- Effects on all planets ---

    setAllRotationEnabled(enable) {
        Object.entries(this.controlPanels).forEach(([key, controlPanel]) => {
            controlPanel.setRotationEnabled(enable);
        });
    }

    setAllRotationSpeed(speedFactor) {
        Object.entries(this.controlPanels).forEach(([key, controlPanel]) => {
            controlPanel.setRotationSpeed(speedFactor);
        });
    }

    // ---

    setAllOrbitEnabled(enable) {
        Object.entries(this.controlPanels).forEach(([key, controlPanel]) => {
            controlPanel.setOrbitEnabled(enable);
        });
    }

    setAllOrbitSpeed(speedFactor) {
        Object.entries(this.controlPanels).forEach(([key, controlPanel]) => {
            controlPanel.setOrbitSpeed(speedFactor);
        });
    }

    // ---

    setAllOrbitLinesVisible(visible){
        Object.entries(this.controlPanels).forEach(([key, controlPanel]) => {
            controlPanel.setOrbitLineVisibility(visible);
        });
    }

    setAllOrbitLinesOpacity(opacity) {
        Object.entries(this.controlPanels).forEach(([key, controlPanel]) => {
            controlPanel.setOrbitLineOpacity(opacity);
        });
    }

// ---

}