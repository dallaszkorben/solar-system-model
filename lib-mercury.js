/**
 * Mercury model creator
 */
class Mercury extends Planet {
    // Static data for Mercury
    static factData = {
        diameter: 4879.4, // km
        axialTilt: 0.034, // degrees (almost no tilt)
        orbitRadius: 57909050.0, // km (average distance from Sun)
        rotationPeriod: 1407.6, // hours (58.6 days)
        orbitalPeriod: 88.0, // days
    };

    static scaleModelData = {
        diameter: Mercury.factData.diameter/Planet.scaleDownDiameterFactor, // scaled diameter in the model
        orbitRadius: Mercury.factData.orbitRadius/Planet.scaleDownOrbitFactor + Planet.shiftOrbit, // scaled orbit radius
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mercury.factData.rotationPeriod, Mercury.factData.orbitalPeriod);
            return 10 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mercury.factData.rotationPeriod, Mercury.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mercury.factData.rotationPeriod, Mercury.factData.orbitalPeriod);
            return 600 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mercury.factData.rotationPeriod, Mercury.factData.orbitalPeriod);
            return 60 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    static nonScaleModelData = {
        diameter: Mercury.factData.diameter, // visually appealing diameter
        orbitRadius: 37400, // visually appealing orbit radius (half of Earth's)
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mercury.factData.rotationPeriod, Mercury.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mercury.factData.rotationPeriod, Mercury.factData.orbitalPeriod);
            return 0.1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mercury.factData.rotationPeriod, Mercury.factData.orbitalPeriod);
            return 30 * relativePeriods.orbit; // Faster than Earth
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mercury.factData.rotationPeriod, Mercury.factData.orbitalPeriod);
            return 3 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    constructor() {
        super(Mercury.factData, Mercury.nonScaleModelData, Mercury.scaleModelData);

        this.createSphere('images/Mercury-texture.jpg');
        this.createAxis(0xaaaaaa); // Gray color for Mercury's axis
        this.createLatitudeCircles([
            { name: 'Equator', angle: 0, color: 0xff0000 }
        ]);
        this.applyTilt();
        this.createOrbit();
        this.createConsolePane();
    }

    createConsolePane() {
        // Create console pane
        this.consolePane = document.createElement('div');
        this.consolePane.className = 'console-pane';
        this.consolePane.style.position = 'absolute';
        this.consolePane.style.bottom = '20px';
        this.consolePane.style.right = '20px';
        this.consolePane.style.backgroundColor = 'rgba(80, 80, 80, 0.8)';
        this.consolePane.style.color = 'white';
        this.consolePane.style.padding = '0';
        this.consolePane.style.borderRadius = '5px';
        this.consolePane.style.fontFamily = 'Arial, sans-serif';
        this.consolePane.style.display = 'none';
        this.consolePane.style.width = '250px';
        this.consolePane.style.boxShadow = '0 4px 8px rgba(0,0,0,0.5)';

        // Create header for dragging
        const header = document.createElement('div');
        header.style.backgroundColor = 'rgba(100, 100, 100, 0.9)';
        header.style.padding = '10px 15px';
        header.style.borderTopLeftRadius = '5px';
        header.style.borderTopRightRadius = '5px';
        header.style.cursor = 'move';
        header.style.borderBottom = '1px solid #666';

        // Add title to header
        const title = document.createElement('h3');
        title.textContent = 'Mercury Controls';
        title.style.margin = '0';
        header.appendChild(title);

        // Add the header to the console pane
        this.consolePane.appendChild(header);

        // Create content container with padding
        const content = document.createElement('div');
        content.style.padding = '15px';
        this.consolePane.appendChild(content);

        // Make the console pane draggable
        this.makeDraggable(this.consolePane, header);

        // Store content container for adding controls
        this.consoleContent = content;

        // Create sections for better organization
        this.createVisibilitySection();
        this.createRotationSection();
        this.createOrbitSection();

        // Add to document
        document.body.appendChild(this.consolePane);
    }

    createVisibilitySection() {
        // Create section header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Visibility Controls';
        sectionHeader.style.margin = '0 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Add day/night effect toggle
        this.addToggle('Day/Night Effect: ', 'mercury-day-night-toggle', this.dayNightEnabled, (e) => {
            this.dayNightEnabled = e.target.checked;
            this.toggleDayNightEffect(this.dayNightEnabled);
        });

        // Add side view toggle
        this.addToggle('Close View: ', 'mercury-side-view-toggle', this.sideViewEnabled, (e) => {
            if (e.target.checked) {
                this.toggleCloseUpView(true, true);
                if (this.orbitEnabled) {
                    this.orbitEnabled = false;
                    document.getElementById('mercury-orbit-toggle').checked = false;
                }
            } else {
                this.toggleCloseUpView(false, false);
            }
        });

        // Add axis toggle
        this.addToggle('Show Axis: ', null, true, (e) => {
            if (this.axis) this.axis.visible = e.target.checked;
        });

        // Add latitude circles toggle
        this.addToggle('Show Latitude Circles: ', null, false, (e) => {
            this.latitudeCircles.visible = e.target.checked;
        });
    }

    createRotationSection() {
        // Create section header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Rotation Controls';
        sectionHeader.style.margin = '15px 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Listen for global rotation slider changes
        document.addEventListener('globalRotationSliderChange', (e) => {
            const slider = document.getElementById('mercury-rotation-speed-slider');
            if (slider) {
                slider.value = e.detail.value;
                const event = new Event('input', { bubbles: true });
                slider.dispatchEvent(event);
            }
        });

        // Add rotation toggle
        this.addToggle('Enable Rotation: ', 'mercury-rotation-toggle', this.rotationEnabled, (e) => {
            this.rotationEnabled = e.target.checked;
        });

        // Add rotation speed slider
        this.addSlider('Rotation Speed: ', 'mercury-rotation-speed-slider', 50, (value) => {
            if (value === 0) {
                this.rotationSpeed = 0;
            } else if (value <= 50) {
                const normalizedValue = value / 50;
                const baseSpeed = (2 * Math.PI) / (this.rotationPeriod * 60);
                this.rotationSpeed = baseSpeed * normalizedValue;
            } else {
                const normalizedValue = (value - 50) / 50;
                const periodDiff = this.rotationPeriod - this.maxRotationPeriod;
                const adjustedPeriod = this.rotationPeriod - (periodDiff * normalizedValue);
                this.rotationSpeed = (2 * Math.PI) / (adjustedPeriod * 60);
            }

            if (value > 0 && !this.rotationEnabled) {
                this.rotationEnabled = true;
                document.getElementById('mercury-rotation-toggle').checked = true;
            }
        });
    }

    createOrbitSection() {
        // Create section header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Orbit Controls';
        sectionHeader.style.margin = '15px 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Listen for global orbit slider changes
        document.addEventListener('globalOrbitSliderChange', (e) => {
            const slider = document.getElementById('mercury-orbit-speed-slider');
            if (slider) {
                slider.value = e.detail.value;
                const event = new Event('input', { bubbles: true });
                slider.dispatchEvent(event);
            }
        });

        // Listen for global orbit visibility slider changes
        document.addEventListener('globalOrbitVisibilityChange', (e) => {
            const slider = document.getElementById('mercury-orbit-visibility-slider');
            if (slider) {
                slider.value = e.detail.value;
                const event = new Event('input', { bubbles: true });
                slider.dispatchEvent(event);
            }
        });

        // Add orbit toggle
        this.addToggle('Enable Orbit: ', 'mercury-orbit-toggle', this.orbitEnabled, (e) => {
            this.orbitEnabled = e.target.checked;

            if (e.target.checked && this.sideViewEnabled) {
                this.sideViewEnabled = false;
                document.getElementById('mercury-side-view-toggle').checked = false;
                this.toggleCloseUpView(false, false);
            }
        });

        // Add orbit speed slider
        this.addSlider('Orbit Speed: ', 'mercury-orbit-speed-slider', 50, (value) => {
            if (value === 0) {
                this.orbitSpeed = 0;
            } else if (value <= 50) {
                const normalizedValue = value / 50;
                const baseSpeed = (2 * Math.PI) / (this.orbitalPeriod * 60);
                this.orbitSpeed = baseSpeed * normalizedValue;
            } else {
                const normalizedValue = (value - 50) / 50;
                const periodDiff = this.orbitalPeriod - this.maxOrbitalPeriod;
                const adjustedPeriod = this.orbitalPeriod - (periodDiff * normalizedValue);
                this.orbitSpeed = (2 * Math.PI) / (adjustedPeriod * 60);
            }

            if (value > 0 && !this.orbitEnabled) {
                this.orbitEnabled = true;
                document.getElementById('mercury-orbit-toggle').checked = true;

                if (this.sideViewEnabled) {
                    this.sideViewEnabled = false;
                    document.getElementById('mercury-side-view-toggle').checked = false;
                    this.toggleCloseUpView(false, false);
                }
            }
        });

        // Add orbit visibility slider
        const visContainer = document.createElement('div');
        visContainer.style.marginBottom = '15px';

        const visLabel = document.createElement('label');
        visLabel.textContent = 'Orbit Visibility: ';
        visLabel.style.display = 'block';
        visLabel.style.marginBottom = '5px';

        const visSlider = document.createElement('input');
        visSlider.type = 'range';
        visSlider.min = '0';
        visSlider.max = '100';
        visSlider.value = Math.round(this.orbitVisibility * 100);
        visSlider.style.width = '100%';
        visSlider.id = 'mercury-orbit-visibility-slider';
        visSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.orbitVisibility = value / 100;

            if (this.orbitLine) {
                this.orbitLine.material.opacity = this.orbitVisibility;

                    const intensity = 0.5 + this.orbitVisibility * 0.5;
                    this.orbitLine.material.color.setRGB(intensity, intensity, intensity);
            }
        });

        visContainer.appendChild(visLabel);
        visContainer.appendChild(visSlider);
        this.consoleContent.appendChild(visContainer);
    }
}