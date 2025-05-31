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
        rotationSlider.max = '100';
        rotationSlider.value = '50'; // Default to middle position
        rotationSlider.style.width = '100%';
        rotationSlider.id = 'global-rotation-speed-slider';

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
        orbitSlider.max = '100';
        orbitSlider.value = '50'; // Default to middle position
        orbitSlider.style.width = '100%';
        orbitSlider.id = 'global-orbit-speed-slider';

        orbitSliderContainer.appendChild(orbitSlider);
        this.consoleContent.appendChild(orbitSliderContainer);
    }

    createGeneralControlSection() {
        // Create a separate section for General Control
        const generalHeader = document.createElement('h4');
        generalHeader.textContent = 'General Control';
        generalHeader.style.margin = '15px 0 10px 0';
        generalHeader.style.borderBottom = '1px solid #555';
        generalHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(generalHeader);

        // Add orbit visibility slider
        const orbitVisibilityContainer = document.createElement('div');
        orbitVisibilityContainer.style.marginBottom = '15px';

        const orbitVisibilityLabel = document.createElement('label');
        orbitVisibilityLabel.textContent = 'Orbit Visibility: ';
        orbitVisibilityLabel.style.display = 'block';
        orbitVisibilityLabel.style.marginBottom = '5px';

        const orbitVisibilitySlider = document.createElement('input');
        orbitVisibilitySlider.type = 'range';
        orbitVisibilitySlider.min = '0';
        orbitVisibilitySlider.max = '100';
        orbitVisibilitySlider.value = '50'; // Default to 50% visibility
        orbitVisibilitySlider.style.width = '100%';

        orbitVisibilityContainer.appendChild(orbitVisibilityLabel);
        orbitVisibilityContainer.appendChild(orbitVisibilitySlider);
        this.consoleContent.appendChild(orbitVisibilityContainer);

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