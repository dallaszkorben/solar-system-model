/**
 * Earth model creator
 */
class Earth extends Planet {

    // Static data for Earth
    static factData = {
        diameter: 12742.0, // km
        axialTilt: 23.4, // degrees
        orbitRadius: 149600000.0, // km (average distance from Sun)
        rotationPeriod: 23.93, // hours
        orbitalPeriod: 365.25, // days
    };
    
    // Location data
    static locationData = [
        { name: 'Kiruna', latitude: 67.8558, longitude: 20.2253, color: 0x00ff00 },
        { name: 'Budapest', latitude: 47.4979, longitude: 19.0402, color: 0xff0000 }
    ];

    static sizeScaleModeData = {
        diameter: Earth.factData.diameter/Planet.scaleDownDiameterFactor, // scaled diameter in the model
        orbitRadius: Earth.factData.orbitRadius/Planet.scaleDownOrbitFactor + Planet.shiftOrbit, //Earth.orbitRadius / 2000, // scaled orbit radius
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
        diameter: Earth.factData.diameter/Planet.scaleDownDiameterFactor, // scaled diameter in the model
        orbitRadius: Earth.factData.orbitRadius/Planet.scaleDownOrbitFactor + Planet.shiftOrbit, //Earth.orbitRadius / 2000, // scaled orbit radius
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

    constructor() {
        super(Earth.factData, Earth.noScaleModeData, Earth.sizeScaleModeData, Earth.distanceScaleModeData);

        this.createSphere('textures/Earth-texture.jpg');
        this.createAxis();
        this.createLatitudeCircles([
            { name: 'Equator', angle: 0, color: 0xff0000 },
            { name: 'Tropic of Cancer', angle: 23.4, color: 0xff8800 },
            { name: 'Tropic of Capricorn', angle: -23.4, color: 0xff8800 },
            { name: 'Arctic Circle', angle: 66.6, color: 0x00aaff },
            { name: 'Antarctic Circle', angle: -66.6, color: 0x00aaff }
        ]);
        this.applyTilt();
        this.createOrbit();

        // Create season labels
        const seasons = [
            { name: '', season: 'summer', angle: 0 },       // Aphelion - summer in northern hemisphere
            { name: '', season: 'winter', angle: Math.PI }, // Perihelion - winter in northern hemisphere
            { name: '', season: 'spring', angle: Math.PI/2 },
            { name: '', season: 'autumn', angle: Math.PI*3/2 }
        ];
        this.createSeasonLabels(seasons);
        
        // Create location markers
        this.locationMarkers = [];
        this.createLocationMarkers();
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
    
    // This method has been moved to the Planet base class
    // makeDraggableElement is now inherited from Planet

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