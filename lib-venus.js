/**
 * Venus model creator
 */
class Venus extends Planet {
    // Static data for Venus
    static factData = {
        diameter: 12104.0, // km
        axialTilt: 10.4, // degrees (retrograde rotation)
        orbitRadius: 108200000.0, // km (average distance from Sun)
        rotationPeriod: 5832.5, // hours (243 days, retrograde)
        orbitalPeriod: 224.7, // days
        variable: 54100 * 1.2,
    };

    static scaleModelData = {
        diameter: Venus.factData.diameter/Planet.scaleDownDiameterFactor,                                      // scaled diameter in the model
        orbitRadius: Venus.factData.orbitRadius/Planet.scaleDownOrbitFactor + Planet.shiftOrbit,    // Venus.orbitRadius / 2000, // scaled orbit radius
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

        this.createSphere('images/Venus-texture.jpg');
        this.createAxis();
        this.createLatitudeCircles([
            { name: 'Equator', angle: 0, color: 0xff0000 },
            { name: 'North Tropic', angle: Venus.getTropic(), color: 0xff8800 },
            { name: 'North Polar', angle: Venus.getPolar(), color: 0x00aaff },
            { name: 'South Tropic', angle: -Venus.getTropic(), color: 0xff8800 },
            { name: 'South Polar', angle: -Venus.getPolar(), color: 0x00aaff }
        ]);
        this.applyTilt();
        this.createOrbit();

        // Create season labels
        const seasons = [
            { name: '', season: 'perihelion', angle: 0 },
            { name: '', season: 'aphelion', angle: Math.PI },
            { name: '', season: 'position 1', angle: Math.PI/2 },
            { name: '', season: 'position 2', angle: Math.PI*3/2 }
        ];
        this.createSeasonLabels(seasons);

        // Create console pane with Venus-specific customizations
        this.createConsolePane('Venus');

        // Listen for global day/night changes
        document.addEventListener('globalDayNightChange', (e) => {
            const toggle = document.getElementById('venus-day-night-toggle');
            if (toggle) {
                toggle.checked = e.detail.enabled;
                this.dayNightEnabled = e.detail.enabled;
                this.toggleDayNightEffect(e.detail.enabled);
            }
        });
    }

    static getTropic(){
        return Venus.factData.axialTilt;
    }

    static getPolar(){
        return 90 - Venus.factData.axialTilt;
    }


    // Override update method to handle Venus's retrograde rotation
    update(time) {
        // Rotate the sphere around its axis if rotation is enabled
        if (this.rotationEnabled && this.rotationSpeed > 0) {
            // Venus rotates in the opposite direction (retrograde rotation)
            // due to its axial tilt of ~177.3 degrees (nearly upside down)
            this.sphere.rotation.y += this.rotationSpeed;

            // Update camera position if marker view is active
            if (this.planetMarker && this.planetMarker.cameraView) {
                this.planetMarker.updateCameraPosition();
            }
        }

        // Orbit around the Sun if orbit is enabled
        if (this.orbitEnabled && this.orbitSpeed > 0) {
            const previousOrbitAngle = this.orbitGroup.rotation.y;
            this.orbitGroup.rotation.y += this.orbitSpeed;
            const deltaAngle = this.orbitGroup.rotation.y - previousOrbitAngle;
            this.group.rotation.y -= deltaAngle;

            // Update camera position if marker view is active
            if (this.planetMarker && this.planetMarker.cameraView) {
                this.planetMarker.updateCameraPosition();
            }
        }
    }
}