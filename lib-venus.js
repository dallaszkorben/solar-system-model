/**
 * Venus model creator
 */
class Venus extends Planet {
    // Static data for Venus
    static factData = {
        diameter: 12104, // km
        axialTilt: 177.3, // degrees (retrograde rotation)
        orbitRadius: 108200000, // km (average distance from Sun)
        rotationPeriod: 5832.5, // hours (243 days, retrograde)
        orbitalPeriod: 224.7, // days
    };

    static scaleModelData = {
        diameter: Venus.factData.diameter, // scaled diameter in the model
        orbitRadius: this.factData.orbitRadius / Planet.scaleDownOrbitFactor, // scaled orbit radius
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Venus.factData.rotationPeriod, Venus.factData.orbitalPeriod);
            return 10 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Venus.factData.rotationPeriod, Venus.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Venus.factData.rotationPeriod, Venus.factData.orbitalPeriod);
            return 600 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Venus.factData.rotationPeriod, Venus.factData.orbitalPeriod);
            return 60 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    static nonScaleModelData = {
        diameter: Venus.factData.diameter,  // visually appealing diameter
        orbitRadius: 54100,                 // visually appealing orbit radius
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Venus.factData.rotationPeriod, Venus.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Venus.factData.rotationPeriod, Venus.factData.orbitalPeriod);
            return 0.1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Venus.factData.rotationPeriod, Venus.factData.orbitalPeriod);
            return 50 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Venus.factData.rotationPeriod, Venus.factData.orbitalPeriod);
            return 5 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    constructor() {
        super(Venus.factData, Venus.nonScaleModelData, Venus.scaleModelData);

        // Season labels properties
        this.seasonLabels = new THREE.Group();
        this.seasonLabelsVisible = false;

        this.createSphere('images/Venus-texture.jpg');
        this.createAxis();
        this.createLatitudeCircles([
            { name: 'Equator', angle: 0, color: 0xff0000 },
            { name: 'North Tropic', angle: 23.4, color: 0xff8800 },
            { name: 'South Tropic', angle: -23.4, color: 0xff8800 },
            { name: 'North Polar', angle: 66.6, color: 0x00aaff },
            { name: 'South Polar', angle: -66.6, color: 0x00aaff }
        ]);
        this.applyTilt();
        this.createOrbit();
        this.createSeasonLabels();
        this.createConsolePane();
    }

    createSeasonLabels() {
        const seasons = [
            { name: '', season: 'perihelion', angle: 0 },
            { name: '', season: 'aphelion', angle: Math.PI },
            { name: '', season: 'position 1', angle: Math.PI/2 },
            { name: '', season: 'position 2', angle: Math.PI*3/2 }
        ];

        seasons.forEach(season => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 256;

            if (season.name) {
                ctx.font = 'Bold 120px Arial';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.fillText(season.name, 128, 120);
            }

            ctx.font = '40px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText(`(${season.season})`, 128, season.name ? 180 : 128);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);

            const x = this.orbitRadius * Math.cos(season.angle);
            const z = this.orbitRadius * Math.sin(season.angle);
            sprite.position.set(x, this.radius * 3, z);
            sprite.scale.set(this.radius * 5, this.radius * 5, 1);

            this.seasonLabels.add(sprite);
        });

        scene.add(this.seasonLabels);
        this.seasonLabels.visible = false; // Hide season labels by default
    }

    createConsolePane() {
        // Basic console setup
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

        // Create header
        const header = document.createElement('div');
        header.style.backgroundColor = 'rgba(100, 100, 100, 0.9)';
        header.style.padding = '10px 15px';
        header.style.borderTopLeftRadius = '5px';
        header.style.borderTopRightRadius = '5px';
        header.style.cursor = 'move';
        header.style.borderBottom = '1px solid #666';

        const title = document.createElement('h3');
        title.textContent = 'Venus Controls';
        title.style.margin = '0';
        header.appendChild(title);
        this.consolePane.appendChild(header);

        // Create content container
        const content = document.createElement('div');
        content.style.padding = '15px';
        this.consolePane.appendChild(content);
        this.consoleContent = content;

        // Make draggable
        this.makeDraggable(this.consolePane, header);

        // Add sections
        this.createVisibilitySection();
        this.createRotationSection();
        this.createOrbitSection();

        document.body.appendChild(this.consolePane);
    }

    createVisibilitySection() {
        // Basic visibility controls
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Visibility Controls';
        sectionHeader.style.margin = '0 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Day/Night toggle
        this.addToggle('Day/Night Effect: ', 'day-night-toggle', this.dayNightEnabled, (e) => {
            this.dayNightEnabled = e.target.checked;
            this.toggleDayNightEffect(this.dayNightEnabled);
        });

        // Close view toggle
        this.addToggle('Close View: ', 'side-view-toggle', this.sideViewEnabled, (e) => {
            if (e.target.checked) {
                this.toggleCloseUpView(true, true);
                if (this.orbitEnabled) {
                    this.orbitEnabled = false;
                    document.getElementById('orbit-toggle').checked = false;
                }
            } else {
                this.toggleCloseUpView(false, false);
            }
        });

        // Axis toggle
        this.addToggle('Show Axis: ', null, true, (e) => {
            if (this.axis) this.axis.visible = e.target.checked;
        });

        // Latitude circles toggle
        this.addToggle('Show Latitude Circles: ', null, false, (e) => {
            this.latitudeCircles.visible = e.target.checked;
        });

        // Season labels toggle
        this.addToggle('Show Season Labels: ', null, this.seasonLabelsVisible, (e) => {
            this.seasonLabelsVisible = e.target.checked;
            this.seasonLabels.visible = e.target.checked;
        });
    }

    createRotationSection() {
        // Rotation controls header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Rotation Controls';
        sectionHeader.style.margin = '15px 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Global rotation slider listener
        document.addEventListener('globalRotationSliderChange', (e) => {
            const slider = document.getElementById('rotation-speed-slider');
            if (slider) {
                slider.value = e.detail.value;
                const event = new Event('input', { bubbles: true });
                slider.dispatchEvent(event);
            }
        });

        // Rotation toggle
        this.addToggle('Enable Rotation: ', 'rotation-toggle', this.rotationEnabled, (e) => {
            this.rotationEnabled = e.target.checked;
        });

        // Rotation speed slider
        this.addSlider('Rotation Speed: ', 'rotation-speed-slider', 50, (value) => {
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
                document.getElementById('rotation-toggle').checked = true;
            }

            // Update global slider
            const globalSlider = document.getElementById('global-rotation-speed-slider');
            if (globalSlider) globalSlider.value = value;
        });
    }

    createOrbitSection() {
        // Orbit controls header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Orbit Controls';
        sectionHeader.style.margin = '15px 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Global orbit slider listeners
        document.addEventListener('globalOrbitSliderChange', (e) => {
            const slider = document.getElementById('orbit-speed-slider');
            if (slider) {
                slider.value = e.detail.value;
                const event = new Event('input', { bubbles: true });
                slider.dispatchEvent(event);
            }
        });

        document.addEventListener('globalOrbitVisibilityChange', (e) => {
            const slider = document.getElementById('orbit-visibility-slider');
            if (slider) {
                slider.value = e.detail.value;
                const event = new Event('input', { bubbles: true });
                slider.dispatchEvent(event);
            }
        });

        // Orbit toggle
        this.addToggle('Enable Orbit: ', 'orbit-toggle', this.orbitEnabled, (e) => {
            this.orbitEnabled = e.target.checked;
            if (e.target.checked && this.sideViewEnabled) {
                this.sideViewEnabled = false;
                document.getElementById('side-view-toggle').checked = false;
                this.toggleCloseUpView(false, false);
            }
        });

        // Orbit speed slider
        this.addSlider('Orbit Speed: ', 'orbit-speed-slider', 50, (value) => {
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
                document.getElementById('orbit-toggle').checked = true;

                if (this.sideViewEnabled) {
                    this.sideViewEnabled = false;
                    document.getElementById('side-view-toggle').checked = false;
                    this.toggleCloseUpView(false, false);
                }
            }

            // Update global slider
            const globalSlider = document.getElementById('global-orbit-speed-slider');
            if (globalSlider) globalSlider.value = value;
        });

        // Orbit visibility slider
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
        visSlider.id = 'orbit-visibility-slider';

        visSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.orbitVisibility = value / 100;

            if (this.orbitLine) {
                this.orbitLine.material.opacity = this.orbitVisibility;

                if (this.orbitVisibility > 0.5) {
                    const intensity = 0.5 + this.orbitVisibility * 0.5;
                    this.orbitLine.material.color.setRGB(intensity, intensity, intensity);
                } else {
                    this.orbitLine.material.color.setRGB(0.5, 0.5, 0.5);
                }
            }

            const globalSlider = document.getElementById('global-orbit-visibility-slider');
            if (globalSlider) globalSlider.value = value;
        });

        visContainer.appendChild(visLabel);
        visContainer.appendChild(visSlider);
        this.consoleContent.appendChild(visContainer);
    }

    update(time) {
        // Rotate the sphere around its axis if rotation is enabled
        if (this.rotationEnabled && this.rotationSpeed > 0) {
            // Venus rotates in the opposite direction (retrograde rotation)
            // due to its axial tilt of ~177.3 degrees (nearly upside down)
            this.sphere.rotation.y += this.rotationSpeed;
        }

        // Orbit around the Sun if orbit is enabled
        if (this.orbitEnabled && this.orbitSpeed > 0) {
            const previousOrbitAngle = this.orbitGroup.rotation.y;
            this.orbitGroup.rotation.y += this.orbitSpeed;
            const deltaAngle = this.orbitGroup.rotation.y - previousOrbitAngle;
            this.group.rotation.y -= deltaAngle;
        }
    }
}