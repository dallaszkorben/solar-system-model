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
            // Mercury orbits in 88 days vs Earth's 365.25 days (ratio ~0.241)
            // So Mercury should take 0.241x the time to orbit compared to Earth
            return 60 * (Mercury.factData.orbitalPeriod / Planet.earthData.orbitalPeriod);
        },
        get maxOrbitalPeriod() {
            // Maintain the same ratio for max speed
            return 6 * (Mercury.factData.orbitalPeriod / Planet.earthData.orbitalPeriod);
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    constructor() {
        super(Mercury.factData, Mercury.nonScaleModelData, Mercury.scaleModelData, Mercury.scaleModelData);

        this.createSphere('textures/Mercury-texture.jpg');
        this.createAxis(0xff00ff); // Gray color for Mercury's axis
        this.createLatitudeCircles([
            { name: 'Equator', angle: 0, color: 0xff0000 }
        ]);
        this.applyTilt();
        this.createOrbit();
    }
}