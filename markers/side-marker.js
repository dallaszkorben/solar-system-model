/**
 * SideMarker class for creating and managing a side marker for a planet
 */
class SideMarker {
    constructor(planet) {
        this.planet = planet;
        this.markerDistanceFactor = 1.2; // Default: 2x the planet diameter
        this.markerSizeFactor = 0.5;     // Default: 1/10 of the planet diameter
        this.cameraView = false;         // Whether the camera should follow this marker

        this.createMarker();
        this.updateMarkerPosition();
    }

    createMarker() {
        // Calculate marker size based on planet diameter and size factor
        const markerSize = this.planet.radius * this.markerSizeFactor * 2;

        // Create a yellow sphere for the marker
        const geometry = new THREE.SphereGeometry(markerSize, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Yellow

        this.marker = new THREE.Mesh(geometry, material);
        this.marker.visible = false; // Hidden by default

        // Add marker to the sideMarkerGroup instead of the planet's group
        // This prevents the marker from counter-rotating with the planet
        this.planet.sideMarkerGroup.add(this.marker);
    }

    updateMarkerPosition() {
        if (!this.marker) return;

        // Calculate marker distance based on planet diameter and distance factor
        const markerDistance = this.planet.diameter * this.markerDistanceFactor;

        // Get the planet's position in its parent group
        const planetPos = new THREE.Vector3();
        this.planet.group.getWorldPosition(planetPos);

        // Calculate the tangent direction to the orbit
        // For a circular orbit, the tangent is perpendicular to the radius vector
        const orbitAngle = this.planet.orbitGroup.rotation.y;

        // Position the marker at the same orbital radius as the planet
        // but offset along the tangent direction
        this.marker.position.set(
            this.planet.orbitRadius, // Same X position as planet (orbital radius)
            0,                       // Same Y position (in orbit plane)
            markerDistance           // Offset in Z direction (tangent to orbit)
        );
    }

    setMarkerDistance(distanceFactor) {
        this.markerDistanceFactor = distanceFactor;
        this.updateMarkerPosition();
    }

    setMarkerSize(sizeFactor) {
        this.markerSizeFactor = sizeFactor;

        // Update marker geometry
        if (this.marker) {
            const markerSize = this.planet.radius * this.markerSizeFactor * 2;
            this.marker.geometry.dispose();
            this.marker.geometry = new THREE.SphereGeometry(markerSize, 16, 16);
        }
    }

    setVisible(visible) {
        if (this.marker) {
            this.marker.visible = visible;
        }
    }

    getWorldPosition() {
        const position = new THREE.Vector3();
        if (this.marker) {
            this.marker.getWorldPosition(position);
        }
        return position;
    }

    setCameraView(enabled) {
        this.cameraView = enabled;
        if (enabled) {
            this.updateCameraPosition();
        }
    }

    updateCameraPosition() {
        if (!this.cameraView || !this.marker) return;

        // Get the world position of the marker and planet
        const markerWorldPos = this.getWorldPosition();
        const planetWorldPos = new THREE.Vector3();
        this.planet.sphere.getWorldPosition(planetWorldPos);

        // Position the camera at the marker looking at the planet
        if (this.planet.solarSystem && this.planet.solarSystem.camera) {
            const camera = this.planet.solarSystem.camera;
            const controls = this.planet.solarSystem.controls;

            camera.position.copy(markerWorldPos);
            camera.lookAt(planetWorldPos);

            // Update orbit controls target if available
            if (controls) {
                controls.target.copy(planetWorldPos);
                // Don't call controls.update() here as it can cause flickering
            }
        }
    }
}