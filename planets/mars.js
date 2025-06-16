/**
 * Mars model creator
 */
class Mars extends Planet {

    static NAME = 'Mars';
    static ID   = 'mars';

    // Planet rotations in degree
    static axialTilt = {
        x: 0,
        y: 0,
        z: 25.19,
    }

    static factData = {
        diameter: 6779.0,           // km
        axialTilt: Mars.axialTilt,  // degrees
        orbitRadius: 227900000.0,   // km (average distance from Sun)
        rotationPeriod: 24.6,       // hours
        orbitalPeriod: 687          // days
    };

    // Location data
    static locationData = [
        { name: 'Perseverance', latitude: 18.4447, longitude: 77.4508, color: 0x00ffff }
    ];

    static nonScaleModelData = {
        diameter: Mars.factData.diameter,   // visually appealing diameter
        orbitRadius: 114000,                // visually appealing orbit radius (1.5x Earth's orbit)
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mars.factData.rotationPeriod, Mars.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mars.factData.rotationPeriod, Mars.factData.orbitalPeriod);
            return 0.1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            // Mars orbits in 687 days vs Earth's 365.25 days (ratio ~1.88)
            // So Mars should take 1.88x longer to orbit than Earth
            return 60 * (Mars.factData.orbitalPeriod / Planet.referenceData.orbitalPeriod);
        },
        get maxOrbitalPeriod() {
            // Maintain the same ratio for max speed
            return 6 * (Mars.factData.orbitalPeriod / Planet.referenceData.orbitalPeriod);
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    static sizeScaleModeData = {
        diameter: Mars.factData.diameter/Planet.scaleDownDiameterFactor,
        orbitRadius: Earth.sizeScaleModeData.orbitRadius + Planet.shiftOrbit,
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mars.factData.rotationPeriod, Mars.factData.orbitalPeriod);
            return 10 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mars.factData.rotationPeriod, Mars.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mars.factData.rotationPeriod, Mars.factData.orbitalPeriod);
            return 600 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mars.factData.rotationPeriod, Mars.factData.orbitalPeriod);
            return 60 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    static distanceScaleModeData = {
        diameter: Planet.referenceData.diameter, // size=1
        orbitRadius: Mars.factData.orbitRadius/Planet.scaleDownOrbitFactor,
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mars.factData.rotationPeriod, Mars.factData.orbitalPeriod);
            return 10 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mars.factData.rotationPeriod, Mars.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mars.factData.rotationPeriod, Mars.factData.orbitalPeriod);
            return 600 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mars.factData.rotationPeriod, Mars.factData.orbitalPeriod);
            return 60 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    static fullScaleModeData = {
        diameter: Mars.factData.diameter/Planet.scaleDownOrbitFactor,
        orbitRadius: Mars.factData.orbitRadius/Planet.scaleDownOrbitFactor,
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mars.factData.rotationPeriod, Mars.factData.orbitalPeriod);
            return 10 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mars.factData.rotationPeriod, Mars.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mars.factData.rotationPeriod, Mars.factData.orbitalPeriod);
            return 600 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Mars.factData.rotationPeriod, Mars.factData.orbitalPeriod);
            return 60 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    constructor(solarSystem) {
        super(solarSystem, Mars.factData, Mars.nonScaleModelData, Mars.sizeScaleModeData, Mars.distanceScaleModeData, Mars.fullScaleModeData);

        this.name = Mars.NAME;
        this.id   = Mars.ID;

        this.createSphere('textures/Mars-texture.jpg');
        this.createAxis(0xff4500); // Orange-red color for Mars
        this.createLatitudeCircles(this.getLatitudeCircleList());
        this.applyTilt();
        this.createOrbit();
        this.createOrbitPositionMarkers();

        // Create location markers
        this.locationMarkers = [];
        this.createLocationMarkers();

        // Create side view marker
        this.createSideViewMarker();
    }

    getLatitudeCircleList() {
        return [
            { name: 'Equator', angle: 0, color: 0x00ffff, widthScale: 1.0 },     // Cyan for equator (more visible on red planet)
            { name: 'Northern Tropic', angle: 25.19, color: 0xff00ff, widthScale: 0.6 },  // Magenta for northern tropic
            { name: 'Southern Tropic', angle: -25.19, color: 0xff00ff, widthScale: 0.6 }, // Magenta for southern tropic (same as northern)
            { name: 'North Polar Circle', angle: 65, color: 0xffff00, widthScale: 0.6 },  // Yellow for north pole
            { name: 'South Polar Circle', angle: -65, color: 0xffff00, widthScale: 0.6 }  // Yellow for south pole (same as north)
        ];
    }

    createLocationMarkers() {
        Mars.locationData.forEach(location => {
            const marker = new LocationMarker(this, location.name, location.latitude, location.longitude, location.color);
            this.locationMarkers.push(marker);
        });
    }

    setLocationMarkersVisible(visible) {
        if (this.locationMarkers) {
            this.locationMarkers.forEach(marker => marker.setVisible(visible));
        }
    }
}