/**
 * Neptune model creator
 */
class Neptune extends Planet {

    static NAME = 'Neptune';
    static ID   = 'neptune';

    // Planet rotations in degree
    static axialTilt = {
        x: 0,
        y: 0,
        z: 28.32,
    }

    static factData = {
        diameter: 49528.0,              // km
        axialTilt: Neptune.axialTilt,   // degrees
        orbitRadius: 4503443661.0,      // km (average distance from Sun)
        rotationPeriod: 16.11,          // hours
        orbitalPeriod: 60195.0,         // days
    };

    static nonScaleModelData = {
        diameter: Neptune.factData.diameter/3, // visually appealing diameter
        orbitRadius: 600000, // visually appealing orbit radius
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Neptune.factData.rotationPeriod, Neptune.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Neptune.factData.rotationPeriod, Neptune.factData.orbitalPeriod);
            return 0.1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            // Neptune orbits in 60195 days vs Earth's 365.25 days (ratio ~164.8)
            // So Neptune should take 164.8x longer to orbit than Earth
            return 60 * (Neptune.factData.orbitalPeriod / Planet.referenceData.orbitalPeriod);
        },
        get maxOrbitalPeriod() {
            // Maintain the same ratio for max speed
            return 6 * (Neptune.factData.orbitalPeriod / Planet.referenceData.orbitalPeriod);
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    static sizeScaleModeData = {
        diameter: Neptune.factData.diameter/Planet.scaleDownDiameterFactor,
        orbitRadius: Uranus.sizeScaleModeData.orbitRadius + Planet.shiftOrbit,
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Neptune.factData.rotationPeriod, Neptune.factData.orbitalPeriod);
            return 10 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Neptune.factData.rotationPeriod, Neptune.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Neptune.factData.rotationPeriod, Neptune.factData.orbitalPeriod);
            return 600 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Neptune.factData.rotationPeriod, Neptune.factData.orbitalPeriod);
            return 60 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    static distanceScaleModeData = {
        diameter: Planet.referenceData.diameter, // size=1
        orbitRadius: Neptune.factData.orbitRadius/Planet.scaleDownOrbitFactor,
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Neptune.factData.rotationPeriod, Neptune.factData.orbitalPeriod);
            return 10 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Neptune.factData.rotationPeriod, Neptune.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Neptune.factData.rotationPeriod, Neptune.factData.orbitalPeriod);
            return 600 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Neptune.factData.rotationPeriod, Neptune.factData.orbitalPeriod);
            return 60 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    constructor() {
        super(Neptune.factData, Neptune.nonScaleModelData, Neptune.sizeScaleModeData, Neptune.distanceScaleModeData);

        this.name = Neptune.NAME;
        this.id   = Neptune.ID;

        this.createSphere('textures/Neptune-texture.jpg');
        this.createAxis(0xff0000); // Blue color for Neptune's axis
        this.createLatitudeCircles(this.getLatitudeCircleList());
        this.applyTilt();
        this.createOrbit();
    }

    getLatitudeCircleList() {
        return [
            { name: 'Equator', angle: 0, color: 0xff0000, widthScale: 1.0 },
            { name: 'North Tropic', angle: 28.32, color: 0xff8800, widthScale: 0.6 },
            { name: 'South Tropic', angle: -28.32, color: 0xff8800, widthScale: 0.6 }
        ];
    }
}