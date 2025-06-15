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

    static sizeScaleModeData = {
        diameter: Venus.factData.diameter/Planet.scaleDownDiameterFactor,
        orbitRadius: Mercury.sizeScaleModeData.orbitRadius + Planet.shiftOrbit,
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

    static distanceScaleModeData = {
        diameter: Planet.referenceData.diameter, // size=1
        orbitRadius: Venus.factData.orbitRadius/Planet.scaleDownOrbitFactor,
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

    static fullScaleModeData = {
        diameter: Venus.factData.diameter/1000,
        orbitRadius: Venus.factData.orbitRadius/1000,
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

    constructor(solarSystem) {
        super(solarSystem, Venus.factData, Venus.nonScaleModelData, Venus.sizeScaleModeData, Venus.distanceScaleModeData, Venus.fullScaleModeData);

        this.name = Venus.NAME;
        this.id   = Venus.ID;

        this.createSphere('textures/Venus-texture.jpg');
        this.createAxis();
        this.createLatitudeCircles(this.getLatitudeCircleList());
        this.applyTilt();
        this.createOrbit();
        this.createOrbitPositionMarkers();
    }

    getLatitudeCircleList() {
        return [
            { name: 'Equator', angle: 0, color: 0x00ffff, widthScale: 1.0 },
            { name: 'North Tropic', angle: Venus.getTropic(), color: 0xff8800, widthScale: 0.6 },
            { name: 'North Polar', angle: Venus.getPolar(), color: 0x00aaff, widthScale: 0.6 },
            { name: 'South Tropic', angle: -Venus.getTropic(), color: 0xff8800, widthScale: 0.6 },
            { name: 'South Polar', angle: -Venus.getPolar(), color: 0x00aaff, widthScale: 0.6 }
        ];
    }

    static getTropic(){
        return Venus.factData.axialTilt.z;
    }

    static getPolar(){
        return 90 - Venus.factData.axialTilt.z;
    }

}