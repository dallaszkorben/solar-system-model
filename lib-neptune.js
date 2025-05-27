/**
 * Neptune model creator
 */
class Neptune extends Planet {
    // Static data for Neptune
    static factData = {
        diameter: 49528.0, // km
        axialTilt: 28.32, // degrees
        orbitRadius: 4503443661.0, // km (average distance from Sun)
        rotationPeriod: 16.11, // hours
        orbitalPeriod: 60195.0, // days
    };

    static scaleModelData = {
        diameter: Neptune.factData.diameter/Planet.scaleDownDiameterFactor, // scaled diameter in the model
        orbitRadius: Neptune.factData.orbitRadius/Planet.scaleDownOrbitFactor + Planet.shiftOrbit, // scaled orbit radius
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
            const relativePeriods = Planet.calculateRelativePeriods(Neptune.factData.rotationPeriod, Neptune.factData.orbitalPeriod);
            return 300 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Neptune.factData.rotationPeriod, Neptune.factData.orbitalPeriod);
            return 30 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    constructor() {
        super(Neptune.factData, Neptune.nonScaleModelData, Neptune.scaleModelData);

        this.createSphere('images/Neptune-texture.jpg');
        this.createAxis(0x0066ff); // Blue color for Neptune's axis
        this.createLatitudeCircles([
            { name: 'Equator', angle: 0, color: 0xff0000 },
            { name: 'North Tropic', angle: 28.32, color: 0xff8800 },
            { name: 'South Tropic', angle: -28.32, color: 0xff8800 }
        ]);
        this.applyTilt();
        this.createOrbit();
        this.createConsolePane('Neptune');
    }
}