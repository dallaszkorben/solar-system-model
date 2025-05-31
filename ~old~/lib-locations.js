/**
 * Location markers for celestial bodies
 */
class LocationMarker {
    constructor(options) {
        // Default options
        this.options = {
            name: 'Unnamed',
            color: 0xff0000,
            sizeRatio: 0.05, // 1/20th of the planet's diameter by default
            latitude: 0,
            longitude: 0,
            altitude: 0,
            visible: true,
            ...options
        };

        this.mesh = null;
        this.planet = null;
    }

    // Create the marker and attach it to a planet
    attachToPlanet(planet) {
        if (!planet) return;

        this.planet = planet;

        // Calculate marker size based on planet diameter
        const markerSize = (planet.diameter * this.options.sizeRatio) / 2;

        // Create marker geometry and material
        const geometry = new THREE.SphereGeometry(markerSize, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: this.options.color });

        // Create mesh
        this.mesh = new THREE.Mesh(geometry, material);

        // Position the marker on the planet's surface
        this.updatePosition();

        // Add marker to the planet's sphere (not the group)
        // This way it will rotate with the planet
        planet.sphere.add(this.mesh);

        return this;
    }

    // Update marker position based on latitude and longitude
    updatePosition() {
        if (!this.mesh || !this.planet) return;

        // Convert latitude and longitude to radians
        const latRad = THREE.MathUtils.degToRad(this.options.latitude);

        // Adjust longitude to match the texture mapping
        // For Budapest at 19.0402°E to appear correctly
        const adjustedLon = -this.options.longitude;
        const lonRad = THREE.MathUtils.degToRad(adjustedLon);

        // Calculate position on sphere
        const radius = this.planet.radius + this.options.altitude;

        // Standard spherical coordinates conversion
        const x = radius * Math.cos(latRad) * Math.cos(lonRad);
        const y = radius * Math.sin(latRad);
        const z = radius * Math.cos(latRad) * Math.sin(lonRad);

        // Set position
        this.mesh.position.set(x, y, z);
    }

    // Set visibility
    setVisible(visible) {
        if (this.mesh) {
            this.mesh.visible = visible;
            this.options.visible = visible;
        }
    }

    // Change color
    setColor(color) {
        if (this.mesh && this.mesh.material) {
            this.mesh.material.color.set(color);
            this.options.color = color;
        }
    }
}

// Predefined locations
const LOCATIONS = {
    // Earth locations
    BUDAPEST: {
        name: 'Budapest',
        latitude: 47.4979,
        longitude: 19.0402,
        color: 0xff0000,
        sizeRatio: 0.01,
        altitude: 0 // Reduced altitude
    },
    KIRUNA: {
        name: 'Kiruna',
        latitude: 67.8558,
        longitude: 20.2253,
        color: 0x00ff00, // Green color to distinguish from Budapest
        sizeRatio: 0.01,
        altitude: 0
    }
};