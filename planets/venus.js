/**
 * Venus model creator
 */
class Venus extends Planet {

    static NAME = 'Venus';
    static ID   = 'venus';

    // Planet rotations in degree
    static axialTilt = {
        x: 0,
        y: 0,
        z: 177.36,
    }

    static factData = {
        diameter: 12104.0,          // km
        axialTilt: Venus.axialTilt, // degrees (retrograde rotation)
        orbitRadius: 108200000.0,   // km (average distance from Sun)
        rotationPeriod: 5832.5,     // hours (243 days, retrograde)
        orbitalPeriod: 224.7,       // days
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
            // Venus orbits in 224.7 days vs Earth's 365.25 days (ratio ~0.615)
            // So Venus should take 0.615x the time to orbit compared to Earth
            return 60 * (Venus.factData.orbitalPeriod / Planet.referenceData.orbitalPeriod);
        },
        get maxOrbitalPeriod() {
            // Maintain the same ratio for max speed
            return 6 * (Venus.factData.orbitalPeriod / Planet.referenceData.orbitalPeriod);
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    constructor() {
        super(Venus.factData, Venus.nonScaleModelData, Venus.scaleModelData, Venus.scaleModelData);

        this.name = Venus.NAME;
        this.id   = Venus.ID;

        this.createSphere('textures/Venus-texture.jpg');
        this.createAxis();
        this.createLatitudeCircles([
            { name: 'Equator', angle: 0, color: 0x00ffff, widthScale: 1.0 },  // Cyan for equator (more visible on yellowish planet)
            { name: 'North Tropic', angle: Venus.getTropic(), color: 0xff8800, widthScale: 0.6 },
            { name: 'North Polar', angle: Venus.getPolar(), color: 0x00aaff, widthScale: 0.6 },
            { name: 'South Tropic', angle: -Venus.getTropic(), color: 0xff8800, widthScale: 0.6 },
            { name: 'South Polar', angle: -Venus.getPolar(), color: 0x00aaff, widthScale: 0.6 }
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

        // Removed console pane creation for now

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
        return Venus.factData.axialTilt.z;
    }

    static getPolar(){
        return 90 - Venus.factData.axialTilt.z;
    }


    // No need for a custom update method - Venus's retrograde rotation is handled by its axial tilt
    // The parent Planet class's update method will be used instead
}