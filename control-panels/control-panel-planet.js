/**
 * PlanetControlPanel class for controlling individual planets
 */
class PlanetControlPanel extends ControlPanel {
    constructor(planet) {
        super(`${planet ? planet.constructor.name : 'Planet'} Controls`, { top: '20px', right: '20px' });
        this.planet = planet;
        
        // Create visibility controls section
        this.createVisibilitySection();
        
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
        
        // Set initial state - OFF for Sky, ON for other planets
        toggle.checked = this.planet.constructor.name !== 'Sky';
        toggle.id = `${this.planet.constructor.name.toLowerCase()}-panel-axis-toggle`;
        
        // Add event listener
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
}