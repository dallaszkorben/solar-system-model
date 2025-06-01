/**
 * SolarSystemControlPanel class for controlling the solar system
 */
class SolarSystemControlPanel extends ControlPanel {
    static scaleModeValues = {
        noScale: 'no-scale',
        sizeScale: 'size-scale',
        distanceScale: 'distance-scale'
    }

    constructor(solarSystem) {
        super('Solar System Controls', { top: '20px', left: '20px' });
        this.solarSystem = solarSystem;

        // Create sections from the old version
        this.createScaleModeSection();
        this.createVisibilityControlSection();
        this.createRotationControlsSection();
        this.createOrbitControlsSection();
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

    createVisibilityControlSection() {
        // Create section header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Visibility Control';
        sectionHeader.style.margin = '15px 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Add toggles for planets
        const planets = ['Sun', 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];

        planets.forEach(planet => {
            this.addToggle(planet);
        });
    }

    addToggle(label) {
        const toggleContainer = document.createElement('div');
        toggleContainer.style.marginBottom = '10px';
        toggleContainer.style.display = 'flex';
        toggleContainer.style.justifyContent = 'space-between';
        toggleContainer.style.alignItems = 'center';

        const toggleLabel = document.createElement('label');
        toggleLabel.textContent = label;
        toggleLabel.style.flexGrow = '1';
        toggleLabel.style.display = 'flex';
        toggleLabel.style.alignItems = 'center';

        // Create first switch container (visibility switch)
        const switchLabel1 = document.createElement('label');
        switchLabel1.className = 'switch';
        switchLabel1.style.marginRight = '10px';
        switchLabel1.title = "Show/Hide " + label;

        // Create first toggle input (visibility switch)
        const toggle1 = document.createElement('input');
        toggle1.type = 'checkbox';
        toggle1.checked = true; // Default ON
        toggle1.id = `${label.toLowerCase()}-visibility-toggle`;

        // Add event listener for visibility toggle
        toggle1.addEventListener('change', () => {
            const planetName = label.toLowerCase();
            if (this.solarSystem && this.solarSystem.planets && this.solarSystem.planets[planetName]) {
                this.solarSystem.planets[planetName].setVisibility(toggle1.checked);
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
        switchLabel2.title = "Show/Hide " + label + " Controls";

        // Create second toggle input (controls switch)
        const toggle2 = document.createElement('input');
        toggle2.type = 'checkbox';
        toggle2.checked = false;
        toggle2.id = `${label.toLowerCase()}-controls-toggle`;

        // Create slider span for second switch
        const sliderSpan2 = document.createElement('span');
        sliderSpan2.className = 'slider';

        // Assemble the second switch
        switchLabel2.appendChild(toggle2);
        switchLabel2.appendChild(sliderSpan2);

        toggleContainer.appendChild(toggleLabel);
        toggleContainer.appendChild(switchLabel1);
        toggleContainer.appendChild(switchLabel2);
        this.consoleContent.appendChild(toggleContainer);
    }

    createRotationControlsSection() {
        // Create section header
        const rotationHeader = document.createElement('h4');
        rotationHeader.textContent = 'Rotation Controls';
        rotationHeader.style.margin = '15px 0 10px 0';
        rotationHeader.style.borderBottom = '1px solid #555';
        rotationHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(rotationHeader);

        // Add rotation toggle for all planets
        const rotationToggleContainer = document.createElement('div');
        rotationToggleContainer.style.marginBottom = '10px';
        rotationToggleContainer.style.display = 'flex';
        rotationToggleContainer.style.justifyContent = 'space-between';
        rotationToggleContainer.style.alignItems = 'center';

        const rotationToggleLabel = document.createElement('label');
        rotationToggleLabel.textContent = 'Enable All Rotation: ';

        // Create switch container
        const rotationSwitchLabel = document.createElement('label');
        rotationSwitchLabel.className = 'switch';

        const rotationToggle = document.createElement('input');
        rotationToggle.type = 'checkbox';
        rotationToggle.checked = false;
        rotationToggle.id = 'global-rotation-toggle';

        // Add event listener for rotation toggle
        rotationToggle.addEventListener('change', () => {
            if (this.solarSystem) {
                this.solarSystem.setAllRotationEnabled(rotationToggle.checked);
            }
        });

        // Create slider span
        const rotationSliderSpan = document.createElement('span');
        rotationSliderSpan.className = 'slider';

        // Assemble the switch
        rotationSwitchLabel.appendChild(rotationToggle);
        rotationSwitchLabel.appendChild(rotationSliderSpan);

        rotationToggleContainer.appendChild(rotationToggleLabel);
        rotationToggleContainer.appendChild(rotationSwitchLabel);
        this.consoleContent.appendChild(rotationToggleContainer);

        // Add rotation speed slider
        const rotationSliderContainer = document.createElement('div');
        rotationSliderContainer.style.marginBottom = '15px';

        // Add label for the slider
        const rotationSliderLabel = document.createElement('label');
        rotationSliderLabel.textContent = 'Global Rotation Speed: ';
        rotationSliderLabel.style.display = 'block';
        rotationSliderLabel.style.marginBottom = '5px';
        rotationSliderContainer.appendChild(rotationSliderLabel);

        const rotationSlider = document.createElement('input');
        rotationSlider.type = 'range';
        rotationSlider.min = '0';
        rotationSlider.max = Planet.maxRotationFactor;
        rotationSlider.step = '0.1';
        rotationSlider.value = '1.0'; //default
        rotationSlider.style.width = '100%';
        rotationSlider.id = 'global-rotation-speed-slider';

        // Add event listener for rotation speed slider
        rotationSlider.addEventListener('input', () => {
            if (this.solarSystem) {

                console.log(rotationSlider.value);

                // Use slider value directly as the speed factor
                const speedFactor = parseFloat(rotationSlider.value);

                // Update rotation speed for all planets
                this.solarSystem.setGlobalRotationSpeed(speedFactor);

                // If slider is moved from 0, enable the rotation toggle
                if (speedFactor > 0 && !rotationToggle.checked) {
                    rotationToggle.checked = true;
                }

                // If slider is set to 0, disable rotation but don't change the toggle
                if (speedFactor === 0) {
                    this.solarSystem.setAllRotationEnabled(false);
                }
            }
        });

        rotationSliderContainer.appendChild(rotationSlider);
        this.consoleContent.appendChild(rotationSliderContainer);
    }

    createOrbitControlsSection() {
        // Create section header
        const orbitHeader = document.createElement('h4');
        orbitHeader.textContent = 'Orbit Controls';
        orbitHeader.style.margin = '15px 0 10px 0';
        orbitHeader.style.borderBottom = '1px solid #555';
        orbitHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(orbitHeader);

        // Add orbit toggle for all planets
        const orbitToggleContainer = document.createElement('div');
        orbitToggleContainer.style.marginBottom = '10px';
        orbitToggleContainer.style.display = 'flex';
        orbitToggleContainer.style.justifyContent = 'space-between';
        orbitToggleContainer.style.alignItems = 'center';

        const orbitToggleLabel = document.createElement('label');
        orbitToggleLabel.textContent = 'Enable All Orbits: ';

        // Create switch container
        const orbitSwitchLabel = document.createElement('label');
        orbitSwitchLabel.className = 'switch';

        const orbitToggle = document.createElement('input');
        orbitToggle.type = 'checkbox';
        orbitToggle.checked = false;
        orbitToggle.id = 'global-orbit-toggle';

        // Add event listener for orbit toggle
        orbitToggle.addEventListener('change', () => {
            if (this.solarSystem) {
                this.solarSystem.setAllOrbitEnabled(orbitToggle.checked);
            }
        });

        // Create slider span
        const orbitSliderSpan = document.createElement('span');
        orbitSliderSpan.className = 'slider';

        // Assemble the switch
        orbitSwitchLabel.appendChild(orbitToggle);
        orbitSwitchLabel.appendChild(orbitSliderSpan);

        orbitToggleContainer.appendChild(orbitToggleLabel);
        orbitToggleContainer.appendChild(orbitSwitchLabel);
        this.consoleContent.appendChild(orbitToggleContainer);

        // Add orbit speed slider
        const orbitSliderContainer = document.createElement('div');
        orbitSliderContainer.style.marginBottom = '15px';

        // Add label for the slider
        const orbitSliderLabel = document.createElement('label');
        orbitSliderLabel.textContent = 'Global Orbit Speed: ';
        orbitSliderLabel.style.display = 'block';
        orbitSliderLabel.style.marginBottom = '5px';
        orbitSliderContainer.appendChild(orbitSliderLabel);

        const orbitSlider = document.createElement('input');
        orbitSlider.type = 'range';
        orbitSlider.min = '0';
        orbitSlider.max = Planet.maxOrbitFactor;
        orbitSlider.value = '1.0';
        orbitSlider.step = '0.1';
        orbitSlider.style.width = '100%';
        orbitSlider.id = 'global-orbit-speed-slider';

        // Add event listener for orbit speed slider
        orbitSlider.addEventListener('input', () => {
            if (this.solarSystem) {
                // Use slider value directly as the speed factor
                const speedFactor = parseFloat(orbitSlider.value);

                // Update orbit speed for all planets
                this.solarSystem.setGlobalOrbitSpeed(speedFactor);

                // If slider is moved from 0, enable the orbit toggle
                if (speedFactor > 0 && !orbitToggle.checked) {
                    orbitToggle.checked = true;
                }

                // If slider is set to 0, disable orbit but don't change the toggle
                if (speedFactor === 0) {
                    this.solarSystem.setAllOrbitEnabled(false);
                }
            }
        });

        orbitSliderContainer.appendChild(orbitSlider);
        this.consoleContent.appendChild(orbitSliderContainer);
    }

    createGeneralControlSection() {
        // Create a separate section for Orbit Visibility
        const orbitVisibilityHeader = document.createElement('h4');
        orbitVisibilityHeader.textContent = 'Orbit Visibility';
        orbitVisibilityHeader.style.margin = '15px 0 10px 0';
        orbitVisibilityHeader.style.borderBottom = '1px solid #555';
        orbitVisibilityHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(orbitVisibilityHeader);

        // Add orbit visibility toggle
        const orbitVisibilityToggleContainer = document.createElement('div');
        orbitVisibilityToggleContainer.style.marginBottom = '10px';
        orbitVisibilityToggleContainer.style.display = 'flex';
        orbitVisibilityToggleContainer.style.justifyContent = 'space-between';
        orbitVisibilityToggleContainer.style.alignItems = 'center';

        const orbitVisibilityToggleLabel = document.createElement('label');
        orbitVisibilityToggleLabel.textContent = 'Show Orbit Lines: ';

        // Create switch container
        const orbitVisibilitySwitchLabel = document.createElement('label');
        orbitVisibilitySwitchLabel.className = 'switch';

        const orbitVisibilityToggle = document.createElement('input');
        orbitVisibilityToggle.type = 'checkbox';
        orbitVisibilityToggle.checked = true; // Default ON
        orbitVisibilityToggle.id = 'global-orbit-visibility-toggle';

        // Add event listener for orbit visibility toggle
        orbitVisibilityToggle.addEventListener('change', () => {
            if (this.solarSystem) {
                this.solarSystem.setAllOrbitLinesVisible(orbitVisibilityToggle.checked);
            }
        });

        // Create slider span
        const orbitVisibilitySliderSpan = document.createElement('span');
        orbitVisibilitySliderSpan.className = 'slider';

        // Assemble the switch
        orbitVisibilitySwitchLabel.appendChild(orbitVisibilityToggle);
        orbitVisibilitySwitchLabel.appendChild(orbitVisibilitySliderSpan);

        orbitVisibilityToggleContainer.appendChild(orbitVisibilityToggleLabel);
        orbitVisibilityToggleContainer.appendChild(orbitVisibilitySwitchLabel);
        this.consoleContent.appendChild(orbitVisibilityToggleContainer);

        // Add orbit opacity slider
        const orbitOpacityContainer = document.createElement('div');
        orbitOpacityContainer.style.marginBottom = '15px';

        const orbitOpacityLabel = document.createElement('label');
        orbitOpacityLabel.textContent = 'Orbit Line Opacity: ';
        orbitOpacityLabel.style.display = 'block';
        orbitOpacityLabel.style.marginBottom = '5px';
        orbitOpacityContainer.appendChild(orbitOpacityLabel);

        const orbitOpacitySlider = document.createElement('input');
        orbitOpacitySlider.type = 'range';
        orbitOpacitySlider.min = '0';
        orbitOpacitySlider.max = '1';
        orbitOpacitySlider.step = '0.01';
        orbitOpacitySlider.value = Planet.orbitOpacity; // Default to 50% opacity
        orbitOpacitySlider.style.width = '100%';
        orbitOpacitySlider.id = 'orbit-opacity-slider';

        // Add event listener for orbit opacity slider
        orbitOpacitySlider.addEventListener('input', () => {
            if (this.solarSystem) {
                const opacity = parseFloat(orbitOpacitySlider.value);
                this.solarSystem.setOrbitLinesOpacity(opacity);

                // If slider is moved from 0, enable the visibility toggle
                if (opacity > 0 && !orbitVisibilityToggle.checked) {
                    orbitVisibilityToggle.checked = true;
                    this.solarSystem.setAllOrbitLinesVisible(true);
                }

                // If slider is set to 0, make orbits invisible but don't change the toggle
                if (opacity === 0) {
                    this.solarSystem.setAllOrbitLinesVisible(false);
                }
            }
        });

        orbitOpacityContainer.appendChild(orbitOpacitySlider);
        this.consoleContent.appendChild(orbitOpacityContainer);

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
}