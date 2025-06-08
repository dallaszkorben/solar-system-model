/**
 * Saturn model creator
 *
 * originalPixels = 8192
 *
 * planeRadius = diameter/2 = 116460 / 2 = 58230
 * ringWidth = ringOuterRadius - ringInnerRadius = 140000 - 74500 = 65500
 * extra begin pixels = originalPixels * ringInnerRadius / ringWidth = 8192 * 74500 / 65500 = 8192 * 1.137 = 9314
 * newPixels = 8192 + 9314 = 17506
 *
 */
class Saturn extends Planet {

    static NAME = 'Saturn';
    static ID   = 'saturn';

    static factData = {
        diameter: 116460.0, // km
        axialTilt: 26.73, // degrees
        orbitRadius: 1433500000.0, // km (average distance from Sun)
        rotationPeriod: 10.7, // hours
        orbitalPeriod: 10759.22, // days
        ringInnerRadius: 74500, // km
        ringOuterRadius: 140000, // km
    };

    // Ring thickness configuration (not part of factual data)
    static ringThickness = 0.05; // Thickness as a fraction of planet radius

    static scaleModelData = {
        diameter: Saturn.factData.diameter/Planet.scaleDownDiameterFactor, // scaled diameter in the model
        orbitRadius: Saturn.factData.orbitRadius/Planet.scaleDownOrbitFactor + Planet.shiftOrbit, // scaled orbit radius
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Saturn.factData.rotationPeriod, Saturn.factData.orbitalPeriod);
            return 10 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Saturn.factData.rotationPeriod, Saturn.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Saturn.factData.rotationPeriod, Saturn.factData.orbitalPeriod);
            return 600 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Saturn.factData.rotationPeriod, Saturn.factData.orbitalPeriod);
            return 60 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    static nonScaleModelData = {
        diameter: Saturn.factData.diameter/3, // visually appealing diameter
        orbitRadius: 350000, // visually appealing orbit radius
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Saturn.factData.rotationPeriod, Saturn.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Saturn.factData.rotationPeriod, Saturn.factData.orbitalPeriod);
            return 0.1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            // Saturn orbits in 10759.22 days vs Earth's 365.25 days (ratio ~29.46)
            // So Saturn should take 29.46x longer to orbit than Earth
            return 60 * (Saturn.factData.orbitalPeriod / Planet.referenceData.orbitalPeriod);
        },
        get maxOrbitalPeriod() {
            // Maintain the same ratio for max speed
            return 6 * (Saturn.factData.orbitalPeriod / Planet.referenceData.orbitalPeriod);
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    constructor() {
        super(Saturn.factData, Saturn.nonScaleModelData, Saturn.scaleModelData, Saturn.scaleModelData);

        this.name = Saturn.NAME;
        this.id   = Saturn.ID;

        // Ring visibility property
        this.ringsVisible = true;
        this.rings = null;

        this.createSphere('textures/Saturn-texture.jpg');
        this.createAxis(0xffcc00); // Yellow-orange color for Saturn's axis
        this.createLatitudeCircles([
            { name: 'Equator', angle: 0, color: 0xff0000, widthScale: 1.0 },
            { name: 'North Tropic', angle: 26.73, color: 0xff8800, widthScale: 0.6 },
            { name: 'South Tropic', angle: -26.73, color: 0xff8800, widthScale: 0.6 }
        ]);
        this.createRings();
        this.applyTilt();
        this.createOrbit();
    }

    // Override applyTilt to ensure rings tilt with the planet
    applyTilt() {
        super.applyTilt();
        // No additional rotation needed for rings as they're already in the equatorial plane
        // and will tilt with the planet group
    }

    setRingMaterial(material) {
        this.ringMaterial = material;

        // Apply the material to all ring components
        if (this.rings) {
            this.rings.children.forEach(ringPart => {
                ringPart.material = material;
            });
        }
    }

    hasRing(){
        return true;
    }

    getRingBasicMaterial(){
        return this.ringBasicMaterial;
    }

    getRingStandardMaterial(){
        return this.ringStandardMaterial;
    }











}