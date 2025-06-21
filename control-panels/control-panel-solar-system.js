/**
 * SolarSystemControlPanel class for controlling the solar system
 */
class SolarSystemControlPanel extends ControlPanel {

    static elementIds = {
        planetVisibilitySwitch:         '-planet-visibility-toggle',

        rotationSpeedSlider:            'global-rotation-speed-slider',
        rotationSpeedSwitch:            'global-rotation-speed-toggle',

        orbitSpeedSlider:               'global-orbit-speed-slider',
        orbitSpeedSwitch:               'global-orbit-speed-toggle',

        orbitOpacitySlider:             'global-orbit-opacity-slider',
        obrbitVisibilitySwitch:         'global-orbit-visibility-toggle',

        rotationAxistSwitch:            'global-rotation-axis-toggle',
        dayNigthEffectSwitch:           'global-day-night-effect-toggle',
        localMarkersVisibilitySwitch:   'global-local-markers-visibility-toggle',
        sideMarkersVisibilitySwitch:    'global-side-markers-visibility-toggle',

    }

    static scaleModeValues = {
        noScale: 'no-scale',
        sizeScale: 'size-scale',
        distanceScale: 'distance-scale',
        fullScale: 'full-scale'
    }

    constructor(solarSystem) {
        super('Solar System Controls', { top: '20px', left: '20px' });

        this.consolePane.style.width = '350px';
        this.solarSystem = solarSystem;

        // Make solarSystem globally accessible for cross-panel communication
        window.solarSystem = solarSystem;

        this.controlPanels = {};

        // Create sections from the old version
        this.createScaleModeSection();
        this.addCelestialBodiesVisibilityControl();
        this.addRotationSpeedControl();
        this.addOrbitSpeedControl();
        this.addOrbitVisibilityControl();
        this.addEnableDayNightEffect();
        this.addAllRotationAxisToggle();
        this.addLocalMarkersToggle();
        this.addSideMarkersToggle();
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
            { id: 'scale-distance', label: 'Distance', value: SolarSystemControlPanel.scaleModeValues.distanceScale },
            { id: 'scale-full', label: 'Full', value: SolarSystemControlPanel.scaleModeValues.fullScale }
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

    addCelestialBodiesVisibilityControl() {
        // Create section header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Visibility Control';
        sectionHeader.style.margin = '15px 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Add toggles for each celestial body
        Object.entries(SolarSystem.celestialBodies).forEach(([key, body]) => {
            this.createToggleComponent({
                label: body.name,
                icon: {
                    src: `icons/${body.id}.png`
                },
                toggles: [
                    {
                        tooltip: `Show/Hide ${body.name}`,
                        checked: true,
                        id: `${body.id}${SolarSystemControlPanel.elementIds.planetVisibilitySwitch}`,
                        onChange: (checked) => {
                            if (this.solarSystem && this.solarSystem.planetObjs && this.solarSystem.planetObjs[body.id]) {
                                this.controlPanels[body.id].setPlanetVisibility(checked);
                            }
                        },
                        marginRight: 10
                    },
                    {
                        tooltip: `Show/Hide ${body.name} Controls`,
                        checked: false,
                        id: `${body.id}-controls-toggle`,
                        onChange: (checked) => {
                            if (checked) {
                                this.controlPanels[body.id].show();
                            } else {
                                this.controlPanels[body.id].hide();
                            }
                        }
                    }
                ],
                parent: this.consoleContent
            });
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
                tooltip: "Reset to default speed",
                resetValue: 1.0
            },
            toggle: {
                tooltip: "Enable All Rotation",
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
                tooltip: "Reset to default speed",
                resetValue: 1.0
            },
            toggle: {
                tooltip: "Enable All Orbits",
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
                tooltip: "Reset to default opacity",
                resetValue: Planet.orbitOpacity
            },
            toggle: {
                tooltip: "Show/Hide Orbit Line",
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

    /**
     * Add day/night effect toggle control
     */
    addEnableDayNightEffect() {
        // Create section header
        const generalHeader = document.createElement('h4');
        generalHeader.textContent = 'General Control';
        generalHeader.style.margin = '15px 0 10px 0';
        generalHeader.style.borderBottom = '1px solid #555';
        generalHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(generalHeader);

        return this.createToggleComponent({
            label: 'Enable All Day/Night: ',
            tooltip: 'Enable/Disable day/night effect on all planets',
            checked: PlanetControlPanel.defaultDayNightEffectEnabled,
            id: SolarSystemControlPanel.elementIds.dayNigthEffectSwitch,
            onChange: (checked) => {
                if (this.solarSystem) {
                    this.solarSystem.setAllDayNightEffectEnabled(checked);
                }
            },
            parent: this.consoleContent
        });
    }

    /**
     * Add rotation axis visibility toggle for all planets
     */
    addAllRotationAxisToggle() {
        return this.createToggleComponent({
            label: 'All Rotation Axes: ',
            tooltip: 'Show/Hide rotation axes on all planets',
            checked: PlanetControlPanel.defaultAxisVisibility,
            id: SolarSystemControlPanel.elementIds.rotationAxistSwitch,
            onChange: (checked) => {
                if (this.solarSystem) {
                    this.setAllRotationAxisVisible(checked);
                }
            },
            parent: this.consoleContent
        });
    }

    /**
     * Add local markers visibility toggle
     */
    addLocalMarkersToggle() {
        return this.createToggleComponent({
            label: 'Local Markers: ',
            tooltip: 'Show/Hide local markers on all planets',
            checked: PlanetControlPanel.defaultLocalMarkersVisibility,
            id: SolarSystemControlPanel.elementIds.localMarkersVisibilitySwitch,
            onChange: (checked) => {
                if (this.solarSystem) {
                    this.setAllLocalMarkersVisible(checked);
                }
            },
            parent: this.consoleContent
        });
    }

    /**
     * Add side markers visibility toggle
     */
    addSideMarkersToggle() {
        return this.createToggleComponent({
            label: 'Side Markers: ',
            tooltip: 'Show/Hide side markers on all planets',
            checked: PlanetControlPanel.defaultSideMarkersVisibility,
            id: SolarSystemControlPanel.elementIds.sideMarkersVisibilitySwitch,
            onChange: (checked) => {
                if (this.solarSystem) {
                    this.setAllSideMarkersVisible(checked);
                }
            },
            parent: this.consoleContent
        });
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

    setAllRotationAxisVisible(visible) {
        Object.entries(this.controlPanels).forEach(([key, controlPanel]) => {
            controlPanel.setRotationAxisVisibility(visible);
        });
    }

    // ---

    setAllLocalMarkersVisible(visible) {
        // Update all planet local markers
        Object.entries(this.controlPanels).forEach(([key, controlPanel]) => {
            controlPanel.setLocalMarkersVisibility(visible);
        });

        // Dispatch event for camera position marker and other listeners
        const event = new CustomEvent('toggleLocationMarkers', {
            detail: { visible: visible }
        });
        document.dispatchEvent(event);
    }

    setAllSideMarkersVisible(visible) {
        Object.entries(this.controlPanels).forEach(([key, controlPanel]) => {
            controlPanel.setSideViewMarkerVisibility(visible);
        });

        // Dispatch event for side view markers
        const event = new CustomEvent('toggleSideMarkers', {
            detail: { visible: visible }
        });
        document.dispatchEvent(event);
    }


// ---

}