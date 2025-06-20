/**
 * PlanetControlPanel class for controlling individual planets
 */
class PlanetControlPanel extends ControlPanel {

    static elementIds = {
        planetVisibilitySwitch:     '-panel-planet-visibility-toggle',

        rotationSpeedSlider:        '-panel-rotation-speed-slider',
        rotationSpeedSwitch:        '-panel-rotation-toggle',

        orbitSpeedSlider:           '-panel-orbit-speed-slider',
        orbitSpeedSwitch:           '-panel-orbit-toggle',

        obrbitVisibilitySwitch:     '-panel-orbit-visibiliti-toggle',
        orbitOpacitySlider:         '-panel-orbit-opacity-slider',

        ownLightSlider:             '-panel-own-light-slider',

        axisVisibilitySwitch:       '-panel-axis-visibility-toggle',
        nortPoleAxisSwitch:         'earth-panel-north-pole-axis-toggle',
        latitudeVisibilitySwitch:   '-panel-latitude-toggle',
        localMarkerVisibilitySwitch:'-panel-local-marker-toggle',
        sideMarkerVisibilitySwitch: '-panel-side-marker-toggle',
        orbitPositionMarkersSwitch: '-panel-orbit-position-markers-toggle',
        solarRadialLineSwitch:      '-panel-solar-radial-line-toggle',
    };

    static defaultAxisVisibility = true;
    static defaultLocalMarkersVisibility = true;
    static defaultSideMarkersVisibility = false;
    static defaultOrbitPositionMarkersVisibility = false;
    static defaultSolarRadialLineVisibility = false;
    static defaultDayNightEffectEnabled = true;
    static defaultOwnLight = 0.5;

    constructor(planet) {
        super(`${planet.name} Controls`, { top: '20px', right: '20px' });
        this.planet = planet;
        this.solarSystem = planet.solarSystem;

        // Add planet icon to the header
        this.addPlanetIconToHeader();

        // Create visibility controls section
        this.createVisibilitySection();

        // Hide the panel by default
        this.hide();
    }

    addPlanetIconToHeader() {
        // Find the header title element
        const header = this.consolePane.querySelector('h3');
        if (header) {
            // Create icon element
            const icon = document.createElement('img');
            icon.src = `icons/${this.planet.id}.png`;
            icon.style.width = '24px';
            icon.style.height = '24px';
            icon.style.marginRight = '8px';

            // Insert icon before the text
            header.insertBefore(icon, header.firstChild);

            // Make the header display as flex to align icon and text
            header.style.display = 'flex';
            header.style.alignItems = 'center';
        }
    }

// TODO: check all default values
    getDefaultAxisVisibility(){
        return PlanetControlPanel.defaultAxisVisibility;
    }

    getDefaultLocalMarkersVisibility(){
        return PlanetControlPanel.defaultLocalMarkersVisibility;
    }

    getDefaultSideMarkersVisibility(){
        return PlanetControlPanel.defaultSideMarkersVisibility;
    }

    getDefaultOrbitPositionMarkersVisibility(){
        return PlanetControlPanel.defaultOrbitPositionMarkersVisibility;
    }

    getDefaultSolarRadialLineVisibility(){
        return PlanetControlPanel.defaultSolarRadialLineVisibility;
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

    // ---

    setOrbitEnabled(enable) {

        // Store previous non-zero speed value if disabling
        if (!enable && this.planet.globalOrbitSpeedFactor > 0) {
            this.previousOrbitSpeed = this.planet.globalOrbitSpeedFactor;
        }

        // Update the planet's orbit state
        this.planet.setOrbitEnabled(enable);

        // Update the orbit toggle in the Planet Controls panel
        const orbitToggle = document.getElementById(`${this.planet.id}${PlanetControlPanel.elementIds.orbitSpeedSwitch}`);
        if (orbitToggle && orbitToggle.checked !== enable) {
            orbitToggle.checked = enable;
        }

        // Update the orbit speed based on enable state
        if (enable) {
            // When enabling, restore previous speed (if available) or use default
            const speedToSet = this.previousOrbitSpeed || 1.0;
            this.setOrbitSpeed(speedToSet);
        } else {
            // When disabling, set actual speed to 0 but DON'T update slider value
            this.planet.setGlobalOrbitSpeedFactor(0);
        }
    }

    /**
     * Sets the orbit speed and synchronizes sliders
     * @param {number} speedFactor - Factor to multiply the default orbit speed by
     */
    setOrbitSpeed(speedFactor) {

        // Store non-zero values for later use
        if (speedFactor > 0) {
            this.previousOrbitSpeed = speedFactor;
        }

        // Update the planet's orbit speed
        this.planet.setGlobalOrbitSpeedFactor(speedFactor);

        // Update the orbit speed slider in the Planet Controls panel
        const speedSlider = document.getElementById(`${this.planet.id}${PlanetControlPanel.elementIds.orbitSpeedSlider}`);
        if (speedSlider && speedSlider.value !== speedFactor.toString()) {
            speedSlider.value = speedFactor.toString();
        }

        // Update the orbit toggle based on speed factor
        const orbitToggle = document.getElementById(`${this.planet.id}${PlanetControlPanel.elementIds.orbitSpeedSwitch}`);
        if (orbitToggle) {
            if (speedFactor > 0 && !orbitToggle.checked) {
                orbitToggle.checked = true;
                this.planet.setOrbitEnabled(true);
            } else if (speedFactor === 0 && orbitToggle.checked) {
                orbitToggle.checked = false;
                this.planet.setOrbitEnabled(false);
            }
        }
    }

    setRotationAxisVisibility(visible){
        if (this.planet && this.planet.axis) {
            this.planet.axis.visible = visible;
        }

        // Update the rotation toggle in the Planet Controls panel
        const axisVisibilityToggle = document.getElementById(`${this.planet.id}${PlanetControlPanel.elementIds.axisVisibilitySwitch}`);
        if (axisVisibilityToggle && axisVisibilityToggle.checked !== visible) {
            axisVisibilityToggle.checked = visible;
        }
    }

    setOrbitPositionMarkerVisibility(visible){
        this.planet.setOrbitPositionMarkersVisibility(visible);
    }

    setLocalMarkersVisibility(visible){
        this.planet.setLocalMarkersVisible(visible);

        // Update the rotation toggle in the Planet Controls panel
        const localMarkersVisibilityToggle = document.getElementById(`${this.planet.id}${PlanetControlPanel.elementIds.localMarkerVisibilitySwitch}`);
        if (localMarkersVisibilityToggle && localMarkersVisibilityToggle.checked !== visible) {
            localMarkersVisibilityToggle.checked = visible;
        }

        // Dispatch event for camera position marker and other listeners
        const event = new CustomEvent('toggleLocationMarkers', {
            detail: { visible: visible }
        });
        document.dispatchEvent(event);
    }

    setSideViewMarkerVisibility(visible){
        this.planet.setSideViewMarkerVisible(visible);

        // Update the side markers toggle in the Planet Controls panel
        const sideMarkersVisibilityToggle = document.getElementById(`${this.planet.id}${PlanetControlPanel.elementIds.sideMarkerVisibilitySwitch}`);
        if (sideMarkersVisibilityToggle && sideMarkersVisibilityToggle.checked !== visible) {
            sideMarkersVisibilityToggle.checked = visible;
        }
    }

    setSolarRadialLineVisibility(visible){
        this.planet.toggleSolarRadialLine(visible);

        // Update the solar radial line toggle in the Planet Controls panel
        const solarRadialLineToggle = document.getElementById(`${this.planet.id}${PlanetControlPanel.elementIds.solarRadialLineSwitch}`);
        if (solarRadialLineToggle && solarRadialLineToggle.checked !== visible) {
            solarRadialLineToggle.checked = visible;
        }
    }

    /**
     * Update the Own Light control based on day/night effect state
     * @param {boolean} dayNightEnabled - Whether day/night effect is enabled
     */
    updateOwnLightControlState(dayNightEnabled) {
        if (this.ownLightControl) {
            if (dayNightEnabled) {
                // Disable the control when day/night effect is ON
                this.ownLightControl.container.style.opacity = '0.5';
                this.ownLightControl.container.style.pointerEvents = 'none';
            } else {
                // Enable the control when day/night effect is OFF
                this.ownLightControl.container.style.opacity = '1';
                this.ownLightControl.container.style.pointerEvents = 'auto';
            }
        }
    }

    /**
     * Create fact data section with planet's physical and orbital characteristics
     */
    createFactDataSection() {
        // Create section header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Planet Facts';
        sectionHeader.style.margin = '0 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Create container for fact data
        const factContainer = document.createElement('div');
        factContainer.style.marginBottom = '15px';
        factContainer.style.fontSize = '0.9em';

        // Add fact data from the planet
        if (this.planet.factData) {
            // Diameter
            if (this.planet.factData.diameter) {
                const diameterRow = document.createElement('div');
                diameterRow.innerHTML = `<span style="font-weight:bold">Diameter:</span> ${this.planet.factData.diameter.toLocaleString()} km`;
                factContainer.appendChild(diameterRow);
            }

            // Orbit radius (distance from Sun)
            if (this.planet.factData.orbitRadius) {
                const orbitRow = document.createElement('div');
                orbitRow.innerHTML = `<span style="font-weight:bold">Distance from Sun:</span> ${(this.planet.factData.orbitRadius / 1000000).toLocaleString()} million km`;
                factContainer.appendChild(orbitRow);
            }

            // Rotation period
            if (this.planet.factData.rotationPeriod) {
                const rotationRow = document.createElement('div');
                rotationRow.innerHTML = `<span style="font-weight:bold">Rotation period:</span> ${this.planet.factData.rotationPeriod} hours`;
                factContainer.appendChild(rotationRow);
            }

            // Orbital period
            if (this.planet.factData.orbitalPeriod) {
                const orbitalRow = document.createElement('div');
                orbitalRow.innerHTML = `<span style="font-weight:bold">Orbital period:</span> ${this.planet.factData.orbitalPeriod} Earth days`;
                factContainer.appendChild(orbitalRow);
            }

            // Axial tilt
            if (this.planet.factData.axialTilt && this.planet.factData.axialTilt.z) {
                const tiltRow = document.createElement('div');
                tiltRow.innerHTML = `<span style="font-weight:bold">Axial tilt:</span> ${this.planet.factData.axialTilt.z}°`;
                factContainer.appendChild(tiltRow);
            }
        }

        this.consoleContent.appendChild(factContainer);
    }

//---

    /**
     * Create visibility controls section
     */
    createVisibilitySection() {
        // Create fact data section first
        this.createFactDataSection();

        // Create visibility section header
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

        // Orbit line visibility control
        this.addOrbitSpeedControl();

        // Add orbit line toggle if planet has orbit
        if (this.planet.orbitRadius > 0) {
            this.addOrbitLineControl();
        }

        // Add own light control - only active when day/night effect is OFF
        const ownLightControl = this.addOwnLightControl();

        // Set initial state based on day/night effect
        // By default, the day/night effect is enabled in the solar system
        const dayNightEnabled = PlanetControlPanel.defaultDayNightEffectEnabled;

        if (dayNightEnabled) {
            ownLightControl.container.style.opacity = '0.5';
            ownLightControl.container.style.pointerEvents = 'none';
        }

        // Store reference to update when day/night effect changes
        this.ownLightControl = ownLightControl;

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

        // Add local marker toggle
        this.addLocalMarkersToggle();

        // Add side marker toggle
        this.addSideViewMarkerToggle();

        // Add orbit position markers toggle
        this.addOrbitPositionMarkersToggle();

        // Add solar radial line toggle
        this.addSolarRadialLineToggle();

    }

    /**
     * Add visibility toggle
     */
    addVisibilityToggle() {
        return this.createToggleComponent({
            label: 'Planet: ',
            tooltip: `Show/Hide ${this.planet.name}`,
            checked: true,
            id: `${this.planet.id}${PlanetControlPanel.elementIds.planetVisibilitySwitch}`,
            onChange: (checked) => {
                this.setPlanetVisibility(checked);
            },
            parent: this.consoleContent
        });
    }

    /**
     * Add rotation speed controls with slider, reset button and toggle
     */
    addRotationSpeedControl() {
        const container = this.createSliderControllerComponent({
            label: 'Rotation: ',
            slider: {
                min: '0',
                max: Planet.maxRotationFactor,
                step: '0.01',
                value: this.planet.globalRotationSpeedFactor.toString(),
                id: `${this.planet.id}${PlanetControlPanel.elementIds.rotationSpeedSlider}`
            },
            resetButton: {
                tooltip: "Reset to default speed",
                resetValue: 1.0
            },
            toggle: {
                tooltip: "Enable Rotation",
                checked: this.planet.rotationEnabled,
                id: `${this.planet.id}${PlanetControlPanel.elementIds.rotationSpeedSwitch}`
            },
            onSliderChange: (slider, toggle) => {
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
            },
            onReset: (slider, toggle, resetValue) => {
                slider.value = resetValue.toString();
                this.setRotationSpeed(resetValue);
                toggle.checked = false;
                this.setRotationEnabled(false);
            },
            onToggleChange: (checked) => {
                this.setRotationEnabled(checked);
            },
            parent: this.consoleContent
        });

        return container;
    }

    /**
     * Add orbit speed controls with slider, reset button and toggle
     */
    addOrbitSpeedControl() {
        const container = this.createSliderControllerComponent({
            label: 'Orbit: ',
            slider: {
                min: '0',
                max: Planet.maxOrbitFactor,
                step: '0.01',
                value: this.planet.globalOrbitSpeedFactor.toString(),
                id: `${this.planet.id}${PlanetControlPanel.elementIds.orbitSpeedSlider}`
            },
            resetButton: {
                tooltip: "Reset to default speed",
                resetValue: 1.0
            },
            toggle: {
                tooltip: "Enable Orbit",
                checked: this.planet.orbitEnabled,
                id: `${this.planet.id}${PlanetControlPanel.elementIds.orbitSpeedSwitch}`
            },
            onSliderChange: (slider, toggle) => {
                const speedFactor = parseFloat(slider.value);

                this.planet.setGlobalOrbitSpeedFactor(speedFactor);

                // If slider is moved from 0, enable the orbit toggle
                if (speedFactor > 0 && !toggle.checked) {
                    toggle.checked = true;
                    this.setOrbitEnabled(true);
                }

                // If slider is set to 0, disable orbit but don't change the toggle
                if (speedFactor === 0) {
                    toggle.checked = false;
                    this.setOrbitEnabled(false);
                }
            },
            onReset: (slider, toggle, resetValue) => {
                slider.value = resetValue.toString();
                this.setOrbitSpeed(resetValue);
                toggle.checked = false;
                this.setOrbitEnabled(false);
            },
            onToggleChange: (checked) => {
                this.setOrbitEnabled(checked);
            },
            parent: this.consoleContent
        });

        return container;
    }

    /**
     * Add orbit line controls with slider, reset button and toggle
     */
    addOrbitLineControl() {
        const container = this.createSliderControllerComponent({
            label: 'Orbit Line: ',
            slider: {
                min: '0',
                max: '1',
                step: '0.01',
                value: this.planet.orbitOpacity.toString(),
                id: `${this.planet.id}${PlanetControlPanel.elementIds.orbitOpacitySlider}`
            },
            resetButton: {
                tooltip: "Reset to default opacity",
                resetValue: Planet.orbitOpacity
            },
            toggle: {
                tooltip: "Show/Hide Orbit Line",
                checked: true,
                id: `${this.planet.id}${PlanetControlPanel.elementIds.obrbitVisibilitySwitch}`
            },
            onSliderChange: (slider, toggle) => {
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
            },
            onReset: (slider, toggle, resetValue) => {
                slider.value = resetValue.toString();

                if (this.planet.orbitLine && this.planet.orbitLine.material) {
                    this.planet.orbitLine.material.opacity = resetValue;
                    this.planet.orbitLine.material.needsUpdate = true;
                    this.planet.orbitOpacity = resetValue;
                }

                toggle.checked = true;
                this.setOrbitLineVisibility(true);
            },
            onToggleChange: (checked) => {
                this.setOrbitLineVisibility(checked);
            },
            parent: this.consoleContent
        });

        return container;
    }

    /**
     * Add own light controls with slider and reset button
     */
    addOwnLightControl() {
        const container = this.createSliderControllerComponent({
            label: 'Own light: ',
            slider: {
                min: '0',
                max: '1',
                step: '0.01',
                value: PlanetControlPanel.defaultOwnLight.toString(),
                id: `${this.planet.id}${PlanetControlPanel.elementIds.ownLightSlider}`
            },
            resetButton: {
                tooltip: "Reset to default light value",
                resetValue: PlanetControlPanel.defaultOwnLight
            },
            toggle: {
                tooltip: "",
                checked: false,
                required: false // Don't show the toggle
            },
            onSliderChange: (slider) => {
                const lightValue = parseFloat(slider.value);
                // The actual implementation will be handled by the caller
                if (this.planet.setOwnLight && typeof this.planet.setOwnLight === 'function') {
                    this.planet.setOwnLight(lightValue);
                }
            },
            onReset: (slider, toggle, resetValue) => {
                slider.value = resetValue.toString();
                if (this.planet.setOwnLight && typeof this.planet.setOwnLight === 'function') {
                    this.planet.setOwnLight(resetValue);
                }
            },
            parent: this.consoleContent
        });

        return container;
    }

    /**
     * Add axis toggle
     */
    addAxisToggle(visibility) {
        return this.createToggleComponent({
            label: 'Rotation Axis: ',
            tooltip: 'Show/Hide Rotation Axis',
            checked: visibility,
            id: `${this.planet.id}${PlanetControlPanel.elementIds.axisVisibilitySwitch}`,
            onChange: (checked) => {
                this.setRotationAxisVisibility(checked);
            },
            parent: this.consoleContent
        });
    }

    /**
     * Add North Pole Axis toggle (Earth only)
     */
    addNorthPoleAxisToggle() {
        return this.createToggleComponent({
            label: 'North Pole Axis: ',
            tooltip: 'Show/Hide North Pole Axis',
            checked: false,
            id: PlanetControlPanel.elementIds.nortPoleAxisSwitch,
            onChange: (checked) => {
                if (this.planet.northPoleAxis) {
                    this.planet.northPoleAxis.visible = checked;
                }
            },
            parent: this.consoleContent
        });
    }

    /**
     * Add latitude circles toggle
     */
    addLatitudeCirclesToggle() {
        return this.createToggleComponent({
            label: 'Latitude Circles: ',
            tooltip: 'Show/Hide Latitude Circles',
            checked: false,
            id: `${this.planet.id}${PlanetControlPanel.elementIds.latitudeVisibilitySwitch}`,
            onChange: (checked) => {
                if (this.planet.latitudeCircles) {
                    this.planet.latitudeCircles.visible = checked;
                }
            },
            parent: this.consoleContent
        });
    }

    /**
     * Add local marker visibility toggle
     */
    addLocalMarkersToggle() {
        return this.createToggleComponent({
            label: 'Local Marker: ',
            tooltip: `Show/Hide local marker for ${this.planet.name}`,
            checked: true,  // Default ON
            id: `${this.planet.id}${PlanetControlPanel.elementIds.localMarkerVisibilitySwitch}`,
            onChange: (checked) => {
                this.planet.setLocalMarkersVisible(checked)
            },
            parent: this.consoleContent
        });
    }

    /**
     * Add side marker visibility toggle
     */
    addSideViewMarkerToggle() {
        return this.createToggleComponent({
            label: 'Side Marker: ',
            tooltip: `Show/Hide side marker for ${this.planet.name}`,
            checked: this.getDefaultSideMarkersVisibility(),
            id: `${this.planet.id}${PlanetControlPanel.elementIds.sideMarkerVisibilitySwitch}`,
            onChange: (checked) => {
                this.setSideViewMarkerVisibility(checked);
            },
            parent: this.consoleContent
        });
    }

    /**
     * Add orbit position markers toggle
     */
    addOrbitPositionMarkersToggle() {
        return this.createToggleComponent({
            label: 'Orbit Markers: ',
            tooltip: `Show/Hide orbit position markers for ${this.planet.name}`,
            checked: this.getDefaultOrbitPositionMarkersVisibility(),
            id: `${this.planet.id}${PlanetControlPanel.elementIds.orbitPositionMarkersSwitch}`,
            onChange: (checked) => {
//                this.planet.setOrbitPositionMarkersVisibility(checked);
                this.setOrbitPositionMarkerVisibility(checked);
            },
            parent: this.consoleContent
        });
    }

    /**
     * Add solar radial line toggle
     */
    addSolarRadialLineToggle() {
        return this.createToggleComponent({
            label: 'Solar Radial Line: ',
            tooltip: `Show/Hide line between Sun and ${this.planet.name}`,
            checked: this.getDefaultSolarRadialLineVisibility(),
            id: `${this.planet.id}${PlanetControlPanel.elementIds.solarRadialLineSwitch}`,
            onChange: (checked) => {
                this.setSolarRadialLineVisibility(checked);
            },
            parent: this.consoleContent
        });
    }

}