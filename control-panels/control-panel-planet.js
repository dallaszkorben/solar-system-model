/**
 * PlanetControlPanel class for controlling individual planets
 */
class PlanetControlPanel extends ControlPanel {

    static elementIds = {
        planetVisibilitySwitch: '-panel-planet-visibility-toggle',
        obrbitVisibilitySwitch: '-panel-orbit-visibiliti-toggle',
        orbitOpacitySlider:     '-panel-orbit-opacity-slider',

        rotationSpeedSlider:    '-rotation-speed-slider',
        rotationSpeedSwitch:    '-rotation-toggle',
    }



    static defaultAxisVisibility = true;

    constructor(planet) {
        super(`${planet.name} Controls`, { top: '20px', right: '20px' });
        this.planet = planet;

        // Create visibility controls section
        this.createVisibilitySection();

        // Hide the panel by default
        this.hide();
    }

    getDefaultAxisVisibility(){
        return PlanetControlPanel.defaultAxisVisibility;
    }


//--- bidirectional switches ---


    setPlanetVisibility(enable){

        this.planet.setVisibility(enable);

        // Update the planet's visibility on the Planet Controls panel
        const panelToggle = document.getElementById(`${this.planet.id}${PlanetControlPanel.elementIds.planetVisibilitySwitch}`);
        if (panelToggle && panelToggle.checked !== enable) {
            panelToggle.checked = enable;
        }

        // Update the main visibility toggle in the Solar System Control panel
        const mainToggle = document.getElementById(`${this.planet.id}${SolarSystemControlPanel.elementIds.planetVisibilitySwitch}`);
        if (mainToggle && mainToggle.checked !== enable) {
            mainToggle.checked = enable;
        }
    }

//--- onedirectional switches ---

    setOrbitLineVisibility(enable) {
        if (this.planet.orbitLine) {
            this.planet.orbitLine.visible = enable;
        }

        // Update the orbit line toggle in the Planet Controls panel
        const panelToggle = document.getElementById(`${this.planet.id}${PlanetControlPanel.elementIds.obrbitVisibilitySwitch}`);
        if (panelToggle && panelToggle.checked !== enable) {
            panelToggle.checked = enable;
        }
    }

    setOrbitLineOpacity(opacity){
        if (this.planet.orbitLine && this.planet.orbitLine.material) {
            this.planet.orbitOpacity = opacity; // Update the planet's orbitOpacity property
            this.planet.orbitLine.material.opacity = opacity;
            this.planet.orbitLine.material.needsUpdate = true; // Important: Tell Three.js to update the material
        }

        // Update the orbit opacity slider in the Planet Controls panel
        const opacitySlider = document.getElementById(`${this.planet.id}${PlanetControlPanel.elementIds.orbitOpacitySlider}`);
        if (opacitySlider && opacitySlider.value !== opacity.toString()) {
            opacitySlider.value = opacity.toString();
        }

        // If opacity is 0, hide the orbit line; otherwise show it
        if (opacity === 0) {
            this.setOrbitLineVisibility(false);
        } else if (this.planet.orbitLine && !this.planet.orbitLine.visible) {
            this.setOrbitLineVisibility(true);
        }
    }

    // ---

    setRotationEnabled(enable) {
        this.planet.setRotationEnabled(enable);

        // Update the rotation toggle in the Planet Controls panel
        const rotationToggle = document.getElementById(`${this.planet.id}${PlanetControlPanel.elementIds.rotationSpeedSwitch}`);
        if (rotationToggle && rotationToggle.checked !== enable) {
            rotationToggle.checked = enable;
        }

    }

    setRotationSpeed(speedFactor) {
        this.planet.setGlobalRotationSpeedFactor(speedFactor);

        // Update the rotation speed slider in the Planet Controls panel
        const speedSlider = document.getElementById(`${this.planet.id}${PlanetControlPanel.elementIds.rotationSpeedSlider}`);
        if (speedSlider && speedSlider.value !== speedFactor.toString()) {
            speedSlider.value = speedFactor.toString();
        }

        // If opacity is 0, hide the orbit line; otherwise show it
        if (speedFactor === 0) {
            this.setRotationEnabled(false);
        } else { //if (!this.planet.orbitLine.visible)
            this.setRotationEnabled(true);
        }
    }

//---

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

        // Add rotation speed control
        this.addRotationSpeedControl();

        // Add orbit line toggle if planet has orbit
        if (this.planet.orbitRadius > 0) {
            this.addOrbitLineToggle();
        }

        // Add axis toggle
        this.addAxisToggle(this.getDefaultAxisVisibility());


// !!!! TODO: must be changed
        // Add North Pole Axis toggle for Earth only
        if (this.planet.id === 'earth') {
            this.addNorthPoleAxisToggle();
        }

        // Add latitude circles toggle if planet has them
        if (this.planet.latitudeCircles) {
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
        toggle.id = `${this.planet.id}${PlanetControlPanel.elementIds.planetVisibilitySwitch}`;


// !!! TODO: Must be investigated, DOES NOT WORK
        // Add event listener
        toggle.addEventListener('change', (e) => {
            this.setPlanetVisibility(e.target.checked)
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
     * Add rotation speed controls with slider, reset button and toggle
     */
    addRotationSpeedControl() {
        const container = document.createElement('div');
        container.style.marginBottom = '15px';

        // Add label
        const rotationLabel = document.createElement('label');
        rotationLabel.textContent = 'Rotation: ';
        rotationLabel.style.display = 'block';
        rotationLabel.style.marginBottom = '5px';
        container.appendChild(rotationLabel);

        // Create controls container for slider, reset button and toggle
        const controlsContainer = document.createElement('div');
        controlsContainer.style.display = 'flex';
        controlsContainer.style.alignItems = 'center';
        controlsContainer.style.gap = '10px';

        // Create slider
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = Planet.maxRotationFactor;
        slider.step = '0.01';
        slider.value = this.planet.globalRotationSpeedFactor.toString();
        slider.style.flexGrow = '1';
        slider.id = `${this.planet.id}${PlanetControlPanel.elementIds.rotationSpeedSlider}`;

        // Create reset button
        const resetButton = document.createElement('img');
        resetButton.src = 'icons/reset.png';
        resetButton.style.width = '24px';
        resetButton.style.height = '24px';
        resetButton.style.cursor = 'pointer';
        resetButton.title = "Reset to default speed";

        // Create switch container
        const switchLabel = document.createElement('label');
        switchLabel.className = 'switch';
        switchLabel.title = "Enable Rotation";

        // Create toggle input
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = this.planet.rotationEnabled;
        toggle.id = `${this.planet.id}${PlanetControlPanel.elementIds.rotationSpeedSwitch}`;

        // Create slider span
        const sliderSpan = document.createElement('span');
        sliderSpan.className = 'slider';

        // Assemble the switch
        switchLabel.appendChild(toggle);
        switchLabel.appendChild(sliderSpan);

        // Add event listener for slider
        slider.addEventListener('input', () => {
            const speedFactor = parseFloat(slider.value);

            this.planet.setGlobalRotationSpeedFactor(speedFactor);

            // If slider is moved from 0, enable the rotation toggle
            if (speedFactor > 0 && !toggle.checked) {
                toggle.checked = true;
                this.setRotationEnabled(true);
            }

            // If slider is set to 0, disable rotation but don't change the toggle
            if (speedFactor === 0) {
                toggle.checked = false;
                this.setRotationEnabled(false);
            }
        });

        // Add event listener for reset button
        resetButton.addEventListener('click', () => {
            slider.value = '1.0';
            this.setRotationSpeed(1.0);
            toggle.checked = false;
            this.setRotationEnabled(false);
        });

        // Add event listener for toggle
        toggle.addEventListener('change', (e) => {
            this.setRotationEnabled(e.target.checked);
        });

        // Add components to controls container
        controlsContainer.appendChild(slider);
        controlsContainer.appendChild(resetButton);
        controlsContainer.appendChild(switchLabel);

        // Add controls container to main container
        container.appendChild(controlsContainer);

        // Add to control panel
        this.consoleContent.appendChild(container);
    }

    /**
     * Add orbit visibility controls with slider, reset button and toggle
     */
    addOrbitLineToggle() {
        const container = document.createElement('div');
        container.style.marginBottom = '15px';

        // Add label
        const orbitLabel = document.createElement('label');
        orbitLabel.textContent = 'Orbit Line: ';
        orbitLabel.style.display = 'block';
        orbitLabel.style.marginBottom = '5px';
        container.appendChild(orbitLabel);

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
        slider.value = this.planet.orbitOpacity.toString();
        slider.style.flexGrow = '1';
        slider.id = `${this.planet.id}${PlanetControlPanel.elementIds.orbitOpacitySlider}`;

        // Create reset button
        const resetButton = document.createElement('img');
        resetButton.src = 'icons/reset.png';
        resetButton.style.width = '24px';
        resetButton.style.height = '24px';
        resetButton.style.cursor = 'pointer';
        resetButton.title = "Reset to default opacity";

        // Create switch container
        const switchLabel = document.createElement('label');
        switchLabel.className = 'switch';
        switchLabel.title = "Show/Hide Orbit Line";

        // Create toggle input
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = true; // Initially visible
        toggle.id = `${this.planet.id}${PlanetControlPanel.elementIds.obrbitVisibilitySwitch}`;

        // Create slider span
        const sliderSpan = document.createElement('span');
        sliderSpan.className = 'slider';

        // Assemble the switch
        switchLabel.appendChild(toggle);
        switchLabel.appendChild(sliderSpan);

        // Add event listener for slider
        slider.addEventListener('input', () => {
            const opacity = parseFloat(slider.value);

            if (this.planet.orbitLine && this.planet.orbitLine.material) {
                this.planet.orbitLine.material.opacity = opacity;
                this.planet.orbitLine.material.needsUpdate = true;
                this.planet.orbitOpacity = opacity;
            }

            // If slider is moved from 0, enable the visibility toggle
            if (opacity > 0 && !toggle.checked) {
                toggle.checked = true;
                this.setOrbitLineVisibility(true);
            }

            // If slider is set to 0, make orbit invisible but don't change the toggle
            if (opacity === 0) {
                this.setOrbitLineVisibility(false);
            }
        });

        // Add event listener for reset button
        resetButton.addEventListener('click', () => {
            slider.value = Planet.orbitOpacity.toString();

            if (this.planet.orbitLine && this.planet.orbitLine.material) {
                this.planet.orbitLine.material.opacity = Planet.orbitOpacity;
                this.planet.orbitLine.material.needsUpdate = true;
                this.planet.orbitOpacity = Planet.orbitOpacity;
            }

            toggle.checked = true;
            this.setOrbitLineVisibility(true);
        });

        // Add event listener for toggle
        toggle.addEventListener('change', (e) => {
            this.setOrbitLineVisibility(e.target.checked);
        });

        // Add components to controls container
        controlsContainer.appendChild(slider);
        controlsContainer.appendChild(resetButton);
        controlsContainer.appendChild(switchLabel);

        // Add controls container to main container
        container.appendChild(controlsContainer);

        // Add to control panel
        this.consoleContent.appendChild(container);
    }


    /**
     * Add axis toggle
     */
    addAxisToggle(visibility) {
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

        // Add event listener
        toggle.checked = visibility; //this.defaultAxisVisibility;
        toggle.addEventListener('change', (e) => {
            if (this.planet.axis) {
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
            if (this.planet.northPoleAxis) {
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
        toggle.id = `${this.planet.ID}-panel-latitude-toggle`;

        // Add event listener
        toggle.addEventListener('change', (e) => {
            if (this.planet.latitudeCircles) {
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


}