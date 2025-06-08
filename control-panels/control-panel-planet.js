/**
 * PlanetControlPanel class for controlling individual planets
 */
class PlanetControlPanel extends ControlPanel {

    static elementIds = {
        planetVisibilitySwitch: '-panel-planet-visibility-toggle',
        obrbitVisibilitySwitch: '-panel-orbit-visibiliti-toggle'
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


//---


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

    setOrbitLineVisibility(enable) {
        if (this.planet.orbitLine) {
            this.planet.orbitLine.visible = enable;
        }

        // Update the orbit line toggle in the Planet Controls panel
        const panelToggle = document.getElementById(`${this.planet.id}${PlanetControlPanel.elementIds.obrbitVisibilitySwitch}`);
        if (panelToggle && panelToggle.checked !== enable) {
            panelToggle.checked = enable;
        }

        // Update the orbit line toggle in the Solar System Control panel if it exists
        const mainToggle = document.getElementById(SolarSystemControlPanel.elementIds.obrbitVisibilitySwitch);
        if (mainToggle && mainToggle.checked !== enable) {
            mainToggle.checked = enable;
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
        toggle.id = `${this.planet.id}${PlanetControlPanel.elementIds.obrbitVisibilitySwitch}`;

        // Add event listener
        toggle.addEventListener('change', (e) => {
            this.setOrbitLineVisibility(e.target.checked);
//            if (this.planet.orbitLine) {
//                this.planet.orbitLine.visible = e.target.checked;
//            }
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