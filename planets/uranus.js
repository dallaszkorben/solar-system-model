/**
 * Uranus model creator
 *
 * originaPixels = 1024
 *
 * planeRadius = diameter / 2 = 116460 / 2 = 58230
 * ringWidth = ringOuterRadius - ringInnerRadius = 98000 - 38000 = 60000
 * extra begin pixels = originalPixels * ringInnerRadius / ringWidth = 1024 * 38000 / 60000 = 1024 * 0.633 = 648
 * newPixels = 1024 + 648 = 1672
 *
 *
 */
class Uranus extends Planet {

    static NAME = 'Uranus';
    static ID   = 'uranus';

    // Planet rotations in degree
    static axialTilt = {
        x: 0,
        y: 0,
        z: 97.77,
    }

    static factData = {
        diameter: 50724.0,              // km
        axialTilt: Uranus.axialTilt,    // degrees - Uranus has an extreme axial tilt
        orbitRadius: 2876679082.0,      // km (average distance from Sun)
        rotationPeriod: 17.24,          // hours
        orbitalPeriod: 30688.5,         // days
        ringInnerRadius: 38000,         // km
        ringOuterRadius: 98000,         // km
    };

    // Ring thickness configuration (not part of factual data)
    static ringThickness = 0.05; // Thickness as a fraction of planet radius

    static nonScaleModelData = {
        diameter: Uranus.factData.diameter/3, // visually appealing diameter
        orbitRadius: 500000, // visually appealing orbit radius
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Uranus.factData.rotationPeriod, Uranus.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Uranus.factData.rotationPeriod, Uranus.factData.orbitalPeriod);
            return 0.1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            // Uranus orbits in 30688.5 days vs Earth's 365.25 days (ratio ~84.02)
            // So Uranus should take 84.02x longer to orbit than Earth
            return 60 * (Uranus.factData.orbitalPeriod / Planet.referenceData.orbitalPeriod);
        },
        get maxOrbitalPeriod() {
            // Maintain the same ratio for max speed
            return 6 * (Uranus.factData.orbitalPeriod / Planet.referenceData.orbitalPeriod);
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    static sizeScaleModeData = {
        diameter: Planet.referenceData.diameter/Planet.scaleDownDiameterFactor, // size=1
        orbitRadius: Uranus.factData.orbitRadius/Planet.scaleDownOrbitFactor + Planet.shiftOrbit, //Earth.orbitRadius / 2000, // scaled orbit radius
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Uranus.factData.rotationPeriod, Uranus.factData.orbitalPeriod);
            return 10 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Uranus.factData.rotationPeriod, Uranus.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Uranus.factData.rotationPeriod, Uranus.factData.orbitalPeriod);
            return 600 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Uranus.factData.rotationPeriod, Uranus.factData.orbitalPeriod);
            return 60 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    static distanceScaleModeData = {
        diameter: Planet.referenceData.diameter/Planet.scaleDownDiameterFactor, // size=1
        orbitRadius: Uranus.factData.orbitRadius/Planet.scaleDownOrbitFactor,
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Uranus.factData.rotationPeriod, Uranus.factData.orbitalPeriod);
            return 10 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Uranus.factData.rotationPeriod, Uranus.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Uranus.factData.rotationPeriod, Uranus.factData.orbitalPeriod);
            return 600 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Uranus.factData.rotationPeriod, Uranus.factData.orbitalPeriod);
            return 60 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    constructor() {
        super(Uranus.factData, Uranus.nonScaleModelData, Uranus.sizeScaleModeData, Uranus.distanceScaleModeData);

        this.name = Uranus.NAME;
        this.id   = Uranus.ID;

        // Ring visibility property
        this.ringsVisible = true;
        this.rings = null;

        this.createSphere('textures/Uranus-texture.jpg');
        this.createAxis(0x00ffcc); // Cyan-green color for Uranus's axis
        this.createLatitudeCircles([
            { name: 'Equator', angle: 0, color: 0xff0000, widthScale: 1.0 },
            { name: 'North Pole Region', angle: 60, color: 0x00aaff, widthScale: 0.6 },
            { name: 'South Pole Region', angle: -60, color: 0x00aaff, widthScale: 0.6 }
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