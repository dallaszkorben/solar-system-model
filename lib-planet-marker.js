/**
 * Planet Marker class for creating local markers on planets
 */
class PlanetMarker {
    constructor(planet) {
        this.planet = planet;
        this.markerGroup = new THREE.Group();
        this.markerDistance = planet.sideMarkerDistanceFactor; // Use the planet's side marker distance factor
        this.marker = null;
        this.cameraView = false; // Whether this marker is being used for camera view

        // Create the marker
        this.createMarker();

        // Add the marker group to the planet's group
        this.planet.group.add(this.markerGroup);
    }

    /**
     * Create the marker in the planet's equatorial plane
     */
    createMarker() {
        // Create a small sphere as the marker
        const markerGeometry = new THREE.SphereGeometry(this.planet.radius * 0.05, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.marker = new THREE.Mesh(markerGeometry, markerMaterial);

        // Position the marker in the planet's equatorial plane
        this.updateMarkerPosition();

        // Add the marker to the marker group
        this.markerGroup.add(this.marker);
    }

    /**
     * Update the marker's position based on the marker distance
     */
    updateMarkerPosition(latitude = 0) {
        if (!this.marker) return;

        // Calculate position on the sphere at the given latitude
        // latitude = 0 is equator, PI/2 is north pole, -PI/2 is south pole
        const phi = latitude; // latitude angle in radians
        const radius = this.planet.radius * this.markerDistance;
        
        // Calculate position using spherical coordinates
        // x = r * cos(phi) * cos(theta)
        // y = r * sin(phi)
        // z = r * cos(phi) * sin(theta)
        // For equator (phi = 0), we place marker at (0, 0, r)
        const x = 0;
        const y = radius * Math.sin(phi);
        const z = radius * Math.cos(phi);
        
        // Position the marker on the sphere at the specified distance and latitude
        this.marker.position.set(x, y, z);
        
        // Update camera if in camera view mode
        if (this.cameraView) {
            this.updateCameraPosition();
        }
    }

    /**
     * Set the marker's distance from the planet center
     * @param {number} distanceFactor - Distance as a factor of the planet's radius
     */
    setMarkerDistance(distanceFactor, latitude = 0) {
        this.markerDistance = distanceFactor;
        this.updateMarkerPosition(latitude);
    }

    /**
     * Set the marker's visibility
     * @param {boolean} visible - Whether the marker should be visible
     */
    setVisible(visible) {
        if (this.markerGroup) {
            this.markerGroup.visible = visible;
        }
    }

    /**
     * Get the marker's world position
     * @returns {THREE.Vector3} The marker's position in world coordinates
     */
    getWorldPosition() {
        const position = new THREE.Vector3();
        if (this.marker) {
            this.marker.getWorldPosition(position);
        }
        return position;
    }

    /**
     * Set whether this marker is being used for camera view
     * @param {boolean} isView - Whether this marker is being used for camera view
     */
    setCameraView(isView) {
        this.cameraView = isView;
        if (isView) {
            this.updateCameraPosition();
        }
    }

    /**
     * Update the camera position to match the marker position
     */
    updateCameraPosition() {
        if (!camera) return;

        // Get marker position in world space
        const markerWorldPos = new THREE.Vector3();
        this.marker.getWorldPosition(markerWorldPos);
        
        // Get planet position in world space
        const planetWorldPos = new THREE.Vector3();
        this.planet.sphere.getWorldPosition(planetWorldPos);
        
        // Set camera position exactly at the marker position
        camera.position.copy(markerWorldPos);
        
        // Look at the planet from the marker position
        camera.lookAt(planetWorldPos);
        
        // Set the up vector to be perpendicular to the orbit plane
        camera.up.copy(new THREE.Vector3(0, 1, 0));
        
        if (controls) {
            controls.target.copy(planetWorldPos);
            controls.update();
        }
    }
}