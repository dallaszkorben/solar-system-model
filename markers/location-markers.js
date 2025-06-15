/**
 * LocationMarker class for creating specific location markers on planets
 */
class LocationMarker {

    static markerSphereScale = 1/100;
    static markerSphereColor = 0xffff00;

    constructor(planet, name, latitude, longitude, color = LocationMarker.markerSphereColor) {
        this.planet = planet;
        this.name = name;
        this.latitude = latitude;    // in degrees
        this.longitude = longitude;  // in degrees
        this.color = color;
        this.marker = null;
        this.wasVisible = true;      // Track visibility state

        this.updateMarker()
    }

    updateMarker() {
        // Remove existing marker if it exists
        if (this.marker) {
            this.planet.sphere.remove(this.marker);
            this.marker = null;
        }

        // Create the marker with size as 1% of the planet's diameter
        this.markerSize = this.planet.diameter * LocationMarker.markerSphereScale;

        // Create new marker with updated size
        this.createMarker();
        this.positionMarker();
    }

    updateMarkerSize() {
        this.markerSize = this.planet.diameter * 0.01;
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