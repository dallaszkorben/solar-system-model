/**
 * Jupiter model creator
 */
class Jupiter extends Planet {
    // Static data for Jupiter
    static factData = {
        diameter: 139820.0, // km
        axialTilt: 3.13, // degrees
        orbitRadius: 778600000.0, // km (average distance from Sun)
        rotationPeriod: 9.93, // hours
        orbitalPeriod: 4332.59, // days
    };

    static scaleModelData = {
        diameter: Jupiter.factData.diameter/Planet.scaleDownDiameterFactor, // scaled diameter in the model
        orbitRadius: Jupiter.factData.orbitRadius/Planet.scaleDownOrbitFactor + Planet.shiftOrbit, // scaled orbit radius
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Jupiter.factData.rotationPeriod, Jupiter.factData.orbitalPeriod);
            return 10 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Jupiter.factData.rotationPeriod, Jupiter.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Jupiter.factData.rotationPeriod, Jupiter.factData.orbitalPeriod);
            return 600 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Jupiter.factData.rotationPeriod, Jupiter.factData.orbitalPeriod);
            return 60 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    static nonScaleModelData = {
        diameter: Jupiter.factData.diameter/3, // visually appealing diameter
        orbitRadius: 200000, // visually appealing orbit radius (about 2x Earth's)
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Jupiter.factData.rotationPeriod, Jupiter.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Jupiter.factData.rotationPeriod, Jupiter.factData.orbitalPeriod);
            return 0.1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Jupiter.factData.rotationPeriod, Jupiter.factData.orbitalPeriod);
            return 120 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Jupiter.factData.rotationPeriod, Jupiter.factData.orbitalPeriod);
            return 12 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    constructor() {
        super(Jupiter.factData, Jupiter.nonScaleModelData, Jupiter.scaleModelData);

        this.createSphere('images/Jupiter-texture.jpg');
        this.createAxis(0xffaa00); // Orange color for Jupiter's axis
        this.createLatitudeCircles([
            { name: 'Equator', angle: 0, color: 0xff0000 },
            { name: 'North Tropic', angle: 3.13, color: 0xff8800 },
            { name: 'South Tropic', angle: -3.13, color: 0xff8800 }
        ]);
        this.applyTilt();
        this.createOrbit();
        this.createConsolePane('Jupiter');
    }
}