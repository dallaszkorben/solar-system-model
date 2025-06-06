/**
 * LocationMarker class for creating specific location markers on planets
 */
class LocationMarker {
    constructor(planet, name, latitude, longitude, color = 0xffff00) {
        this.planet = planet;
        this.name = name;
        this.latitude = latitude;    // in degrees
        this.longitude = longitude;  // in degrees
        this.color = color;
        this.marker = null;

        // Create the marker with size as 1% of the planet's diameter
        this.markerSize = this.planet.diameter * 0.01;

        this.createMarker();
        this.positionMarker();
    }

    createMarker() {
        // Create a sphere for the marker
        const geometry = new THREE.SphereGeometry(this.markerSize, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: this.color });

        this.marker = new THREE.Mesh(geometry, material);

        // Add marker to the planet's sphere to follow rotation
        this.planet.sphere.add(this.marker);
    }

    positionMarker() {
        if (!this.marker) return;

        // Convert latitude and longitude to radians
        const latRad = THREE.MathUtils.degToRad(this.latitude);

        // Adjust longitude to match the texture mapping (negate it)
        const adjustedLon = -this.longitude;
        const lonRad = THREE.MathUtils.degToRad(adjustedLon);

        // Calculate position on the planet's surface
        const x = this.planet.radius * Math.cos(latRad) * Math.cos(lonRad);
        const y = this.planet.radius * Math.sin(latRad);
        const z = this.planet.radius * Math.cos(latRad) * Math.sin(lonRad);

        this.marker.position.set(x, y, z);
    }

    setVisible(visible) {
        if (this.marker) {
            this.marker.visible = visible;
        }
    }
}