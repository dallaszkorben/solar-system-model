/**
 * Mars model creator
 */
class Mars extends Planet {
    // Static data for Mars
    static factData = {
        diameter: 6779, // km
        axialTilt: 25.19, // degrees
        orbitRadius: 227900000, // km (average distance from Sun)
        rotationPeriod: 24.6, // hours
        orbitalPeriod: 687, // days
    };

    static scaleModelData = {
        diameter: Mars.factData.diameter, // scaled diameter in the model
        orbitRadius: this.factData.orbitRadius / Planet.scaleDownOrbitFactor, // scaled orbit radius
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mars.factData.rotationPeriod, Mars.factData.orbitalPeriod);
            return 10 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mars.factData.rotationPeriod, Mars.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mars.factData.rotationPeriod, Mars.factData.orbitalPeriod);
            return 600 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mars.factData.rotationPeriod, Mars.factData.orbitalPeriod);
            return 60 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    static nonScaleModelData = {
        diameter: Mars.factData.diameter,   // visually appealing diameter
        orbitRadius: 114000,                // visually appealing orbit radius (1.5x Earth's orbit)
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mars.factData.rotationPeriod, Mars.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mars.factData.rotationPeriod, Mars.factData.orbitalPeriod);
            return 0.1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mars.factData.rotationPeriod, Mars.factData.orbitalPeriod);
            return 120 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mars.factData.rotationPeriod, Mars.factData.orbitalPeriod);
            return 12 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    constructor() {
        super(Mars.factData, Mars.nonScaleModelData, Mars.scaleModelData);

        this.createSphere('images/Mars-texture.jpg');
        this.createAxis(0xff4500); // Orange-red color for Mars
        this.createLatitudeCircles([
            { name: 'Equator', angle: 0, color: 0x00ff00 },     // Bright green for equator
            { name: 'Northern Tropic', angle: 25.19, color: 0xff00ff },  // Magenta for northern tropic
            { name: 'Southern Tropic', angle: -25.19, color: 0xffaa00 }, // Orange for southern tropic
            { name: 'North Polar Circle', angle: 65, color: 0xffff00 },  // Yellow for north pole
            { name: 'South Polar Circle', angle: -65, color: 0x00ffff }  // Cyan for south pole
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
        this.consolePane.style.backgroundColor = 'rgba(80, 80, 80, 0.8)'; // Lighter gray
        this.consolePane.style.color = 'white';
        this.consolePane.style.padding = '0'; // No padding for the container
        this.consolePane.style.borderRadius = '5px';
        this.consolePane.style.fontFamily = 'Arial, sans-serif';
        this.consolePane.style.display = 'none'; // Hidden by default
        this.consolePane.style.width = '250px';
        this.consolePane.style.boxShadow = '0 4px 8px rgba(0,0,0,0.5)'; // Add shadow for better visibility

        // Create header for dragging
        const header = document.createElement('div');
        header.style.backgroundColor = 'rgba(100, 100, 100, 0.9)'; // Darker than the body
        header.style.padding = '10px 15px';
        header.style.borderTopLeftRadius = '5px';
        header.style.borderTopRightRadius = '5px';
        header.style.cursor = 'move'; // Change cursor to indicate draggable
        header.style.borderBottom = '1px solid #666';

        // Add title to header
        const title = document.createElement('h3');
        title.textContent = 'Mars Controls';
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
        this.addToggle('Day/Night Effect: ', 'mars-day-night-toggle', this.dayNightEnabled, (e) => {
            this.dayNightEnabled = e.target.checked;
            this.toggleDayNightEffect(this.dayNightEnabled);
        });

        // Add side view toggle
        this.addToggle('Close View: ', 'mars-side-view-toggle', this.sideViewEnabled, (e) => {
            if (e.target.checked) {
                this.toggleCloseUpView(true, true);

                // If orbit is enabled, disable it when close view is enabled
                if (this.orbitEnabled) {
                    this.orbitEnabled = false;
                    document.getElementById('mars-orbit-toggle').checked = false;
                }
            } else {
                this.toggleCloseUpView(false, false);
            }
        });

        // Add axis toggle
        this.addToggle('Show Axis: ', 'mars-axis-toggle', true, (e) => {
            if (this.axis) {
                this.axis.visible = e.target.checked;
            }
        });

        // Add latitude circles toggle
        this.addToggle('Show Latitude Circles: ', 'mars-latitude-toggle', false, (e) => {
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
            const slider = document.getElementById('mars-rotation-speed-slider');
            if (slider) {
                slider.value = e.detail.value;
                // Trigger the input event to update the rotation speed
                const event = new Event('input', { bubbles: true });
                slider.dispatchEvent(event);
            }
        });

        // Add rotation toggle
        this.addToggle('Enable Rotation: ', 'mars-rotation-toggle', this.rotationEnabled, (e) => {
            this.rotationEnabled = e.target.checked;
        });

        // Add rotation speed slider
        this.addSlider('Rotation Speed: ', 'mars-rotation-speed-slider', 50, (value) => {
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
                document.getElementById('mars-rotation-toggle').checked = true;
            }

            // Update global rotation speed slider if it exists
            const globalRotationSlider = document.getElementById('global-rotation-speed-slider');
            if (globalRotationSlider) {
                globalRotationSlider.value = value;
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
            const slider = document.getElementById('mars-orbit-speed-slider');
            if (slider) {
                slider.value = e.detail.value;
                // Trigger the input event to update the orbit speed
                const event = new Event('input', { bubbles: true });
                slider.dispatchEvent(event);
            }
        });

        // Listen for global orbit visibility slider changes
        document.addEventListener('globalOrbitVisibilityChange', (e) => {
            const slider = document.getElementById('mars-orbit-visibility-slider');
            if (slider) {
                slider.value = e.detail.value;
                // Trigger the input event to update the visibility
                const event = new Event('input', { bubbles: true });
                slider.dispatchEvent(event);
            }
        });

        // Add orbit toggle
        this.addToggle('Enable Orbit: ', 'mars-orbit-toggle', this.orbitEnabled, (e) => {
            this.orbitEnabled = e.target.checked;

            // If orbit is enabled, disable any close-up views
            if (e.target.checked) {
                if (this.sideViewEnabled) {
                    this.sideViewEnabled = false;
                    document.getElementById('mars-side-view-toggle').checked = false;
                    this.toggleCloseUpView(false, false);
                }
            }
        });

        // Add orbit speed slider
        this.addSlider('Orbit Speed: ', 'mars-orbit-speed-slider', 50, (value) => {
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
                document.getElementById('mars-orbit-toggle').checked = true;

                // If any close-up view is enabled, disable it
                if (this.sideViewEnabled) {
                    this.sideViewEnabled = false;
                    document.getElementById('mars-side-view-toggle').checked = false;
                    this.toggleCloseUpView(false, false);
                }
            }

            // Update global orbit speed slider if it exists
            const globalOrbitSlider = document.getElementById('global-orbit-speed-slider');
            if (globalOrbitSlider) {
                globalOrbitSlider.value = value;
            }
        });

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
        orbitVisibilitySlider.value = Math.round(this.orbitVisibility * 100);
        orbitVisibilitySlider.style.width = '100%';
        orbitVisibilitySlider.id = 'mars-orbit-visibility-slider';
        orbitVisibilitySlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.orbitVisibility = value / 100;

            // Update orbit line opacity
            if (this.orbitLine) {
                this.orbitLine.material.opacity = this.orbitVisibility;

                // Update color based on visibility (white to gray to invisible)
                if (this.orbitVisibility > 0.5) {
                    // Blend from white to gray as visibility goes from 1.0 to 0.5
                    const intensity = 0.5 + this.orbitVisibility * 0.5;
                    this.orbitLine.material.color.setRGB(intensity, intensity, intensity);
                } else {
                    // Keep gray but reduce opacity as visibility goes from 0.5 to 0
                    this.orbitLine.material.color.setRGB(0.5, 0.5, 0.5);
                }
            }

            // Update global orbit visibility slider if it exists
            const globalVisibilitySlider = document.getElementById('global-orbit-visibility-slider');
            if (globalVisibilitySlider) {
                globalVisibilitySlider.value = value;
            }
        });

        orbitVisibilityContainer.appendChild(orbitVisibilityLabel);
        orbitVisibilityContainer.appendChild(orbitVisibilitySlider);
        this.consoleContent.appendChild(orbitVisibilityContainer);
    }
}