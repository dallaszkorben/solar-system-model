/**
 * Mars model creator
 */
class Mars extends Planet {
    // Static data for Mars
    static factData = {
        diameter: 6779.0, // km
        axialTilt: 25.19, // degrees
        orbitRadius: 227900000.0, // km (average distance from Sun)
        rotationPeriod: 24.6, // hours
        orbitalPeriod: 687 // days
    };
    
    // Location data
    static locationData = [
        { name: 'Perseverance', latitude: 18.4447, longitude: 77.4508, color: 0x00ffff }
    ];

    static scaleModelData = {
        diameter: Mars.factData.diameter/Planet.scaleDownDiameterFactor,                                   // scaled diameter in the model
        orbitRadius: Mars.factData.orbitRadius/Planet.scaleDownOrbitFactor + Planet.shiftOrbit,   //Mars.orbitRadius / 2000, // scaled orbit radius
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
            return 60 * (Mars.factData.orbitalPeriod / Planet.earthData.orbitalPeriod);
        },
        get maxOrbitalPeriod() {
            // Maintain the same ratio for max speed
            return 6 * (Mars.factData.orbitalPeriod / Planet.earthData.orbitalPeriod);
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    constructor() {
        super(Mars.factData, Mars.nonScaleModelData, Mars.scaleModelData, Mars.scaleModelData);

        this.createSphere('textures/Mars-texture.jpg');
        this.createAxis(0xff4500); // Orange-red color for Mars
        this.createLatitudeCircles([
            { name: 'Equator', angle: 0, color: 0x00ff00 },     // Bright green for equator
            { name: 'Northern Tropic', angle: 25.19, color: 0xff00ff },  // Magenta for northern tropic
            { name: 'Southern Tropic', angle: -25.19, color: 0xffaa00 }, // Orange for southern tropic
            { name: 'North Polar Circle', angle: 65, color: 0xffff00 },  // Yellow for north pole
            { name: 'South Polar Circle', angle: -65, color: 0x00ffff }  // Cyan for south pole
        ]);
        this.applyTilt();
        this.createOrbit();
        
        // Create location markers
        this.locationMarkers = [];
        this.createLocationMarkers();
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