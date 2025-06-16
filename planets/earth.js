/**
 * Earth model creator
 */
class Earth extends Planet {

    static ID   = 'earth';
    static NAME = 'Earth';

    // Planet rotations in degree
    static axialTilt = {
        x: 0,
        y: 0,
        z: 23.93
    }

    static factData = {
        diameter: 12742.0,          // km
        axialTilt: Earth.axialTilt, // degrees
        orbitRadius: 149600000.0,   // km (average distance from Sun)
        rotationPeriod: 23.93,      // hours
        orbitalPeriod: 365.25,      // days
    };

    // Location data
    static locationData = [
        { name: 'Kiruna', latitude: 67.8558, longitude: 20.2253, color: 0x00ff00 },
        { name: 'Budapest', latitude: 47.4979, longitude: 19.0402, color: 0xff0000 }
    ];

    static noScaleModeData = {
        diameter: Earth.factData.diameter, // visually appealing diameter
        orbitRadius: 74800, // visually appealing orbit radius
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Earth.factData.rotationPeriod, Earth.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Earth.factData.rotationPeriod, Earth.factData.orbitalPeriod);
            return 0.1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Earth.factData.rotationPeriod, Earth.factData.orbitalPeriod);
            return 60 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Earth.factData.rotationPeriod, Earth.factData.orbitalPeriod);
            return 6 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    static sizeScaleModeData = {
        diameter: Earth.factData.diameter/Planet.scaleDownDiameterFactor,
        orbitRadius: Venus.sizeScaleModeData.orbitRadius + Planet.shiftOrbit,
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Earth.factData.rotationPeriod, Earth.factData.orbitalPeriod);
            return 10 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Earth.factData.rotationPeriod, Earth.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Earth.factData.rotationPeriod, Earth.factData.orbitalPeriod);
            return 600 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Earth.factData.rotationPeriod, Earth.factData.orbitalPeriod);
            return 60 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    static distanceScaleModeData = {
        diameter: Planet.referenceData.diameter, // size=1
        orbitRadius: Earth.factData.orbitRadius/Planet.scaleDownOrbitFactor,
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Earth.factData.rotationPeriod, Earth.factData.orbitalPeriod);
            return 10 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Earth.factData.rotationPeriod, Earth.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Earth.factData.rotationPeriod, Earth.factData.orbitalPeriod);
            return 600 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Earth.factData.rotationPeriod, Earth.factData.orbitalPeriod);
            return 60 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    static fullScaleModeData = {
        diameter: Earth.factData.diameter/Planet.scaleDownOrbitFactor,
        orbitRadius: Earth.factData.orbitRadius/Planet.scaleDownOrbitFactor,
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Earth.factData.rotationPeriod, Earth.factData.orbitalPeriod);
            return 10 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Earth.factData.rotationPeriod, Earth.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Earth.factData.rotationPeriod, Earth.factData.orbitalPeriod);
            return 600 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Earth.factData.rotationPeriod, Earth.factData.orbitalPeriod);
            return 60 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    constructor(solarSystem) {

        super(solarSystem, Earth.factData, Earth.noScaleModeData, Earth.sizeScaleModeData, Earth.distanceScaleModeData, Earth.fullScaleModeData);

        this.name = Earth.NAME;
        this.id   = Earth.ID;

        this.createSphere('textures/Earth-texture.jpg');
        this.createAxis();
        this.createNorthPoleAxis();
        this.createLatitudeCircles(this.getLatitudeCircleList());
        this.applyTilt();
        this.createOrbit();

        // Create season labels
        this.orbitPositionMarkerList = [
            { name: 'summer', description: '', angle: 0,           color: 0xffaa00 },           // Aphelion - summer in northern hemisphere
            { name: 'winter', description: '', angle: Math.PI,     color: 0x00aaff },     // Perihelion - winter in northern hemisphere
            { name: 'spring', description: '', angle: Math.PI/2,   color: 0x00ff00 },
            { name: 'autumn', description: '', angle: Math.PI*3/2, color: 0xff5500 }
        ];

        this.createOrbitPositionMarkers();

        // Create location markers
        this.locationMarkers = [];
        this.createLocationMarkers();

        // Create side view marker
        this.createSideViewMarker();
    }

    getOrbitPositionMarkerList() {
        return this.orbitPositionMarkerList;
    }

    getLatitudeCircleList() {
        return [
            { name: 'Equator', angle: 0, color: 0xff0000, widthScale: 1.0 },
            { name: 'Tropic of Cancer', angle: 23.4, color: 0xff8800, widthScale: 0.6 },
            { name: 'Tropic of Capricorn', angle: -23.4, color: 0xff8800, widthScale: 0.6 },
            { name: 'Arctic Circle', angle: 66.6, color: 0x00aaff, widthScale: 0.6 },
            { name: 'Antarctic Circle', angle: -66.6, color: 0x00aaff, widthScale: 0.6 }
        ];
    }

    createLocationMarkers() {
        Earth.locationData.forEach(location => {
            const marker = new LocationMarker(this, location.name, location.latitude, location.longitude, location.color);
            this.locationMarkers.push(marker);
        });
    }

    setLocationMarkersVisible(visible) {
        if (this.locationMarkers) {
            this.locationMarkers.forEach(marker => marker.setVisible(visible));
        }
    }

    // Create a north pole axis that extends to the sky
    createNorthPoleAxis() {
        const skyRadius = 20000000; // Large enough to reach the sky

        // Create a line geometry from Earth's north pole surface to the sky
        const points = [];
        points.push(new THREE.Vector3(0, this.radius, 0)); // Start at north pole on surface
        points.push(new THREE.Vector3(0, skyRadius, 0)); // Extend to sky

        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        // Use LineBasicMaterial for constant width regardless of distance
        const material = new THREE.LineBasicMaterial({
            color: 0xff0000, // Red color
            linewidth: 3, // Thicker line
            depthTest: false // Ensure it's always visible
        });

        this.northPoleAxis = new THREE.Line(geometry, material);
        this.northPoleAxis.renderOrder = 1000; // Ensure it renders on top
        this.northPoleAxis.visible = false; // Hidden by default
        this.group.add(this.northPoleAxis);
    }

    // Add Earth-specific location markers toggle
    addLocationMarkersToggle() {
        // Find the visibility section
        const sections = this.consoleContent.querySelectorAll('h4');
        let visibilitySection;

        for (const section of sections) {
            if (section.textContent === 'Visibility Controls') {
                visibilitySection = section;
                break;
            }
        }

        if (visibilitySection) {
            // Find the last toggle in the visibility section
            const lastToggle = visibilitySection.parentNode.querySelector('.switch:last-of-type');

            if (lastToggle) {
                const container = document.createElement('div');
                container.style.marginBottom = '10px';
                container.style.display = 'flex';
                container.style.justifyContent = 'space-between';
                container.style.alignItems = 'center';

                const labelElem = document.createElement('label');
                labelElem.textContent = 'Show Location Markers: ';

                // Create switch container
                const switchLabel = document.createElement('label');
                switchLabel.className = 'switch';

                const toggle = document.createElement('input');
                toggle.type = 'checkbox';
                toggle.checked = true;
                toggle.id = 'location-markers-toggle';
                toggle.addEventListener('change', (e) => {
                    // This will be handled by the SolarSystem class
                    const event = new CustomEvent('toggleLocationMarkers', {
                        detail: { visible: e.target.checked }
                    });
                    document.dispatchEvent(event);
                });

                // Create slider span
                const sliderSpan = document.createElement('span');
                sliderSpan.className = 'slider';

                // Assemble the switch
                switchLabel.appendChild(toggle);
                switchLabel.appendChild(sliderSpan);

                container.appendChild(labelElem);
                container.appendChild(switchLabel);

                // Insert after the last toggle in the visibility section
                lastToggle.parentNode.after(container);
            }
        }
    }
}