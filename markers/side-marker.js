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

    /**
     * Update the marker position based on the distance factor
     * This positions the marker at a fixed global direction from the planet
     */
    updateMarkerPosition() {
        if (!this.marker) return;
        
        // Calculate marker distance based on planet diameter and distance factor
        const markerDistance = this.planet.diameter * this.markerDistanceFactor;
        
        // Position the marker at a fixed global direction (along Z-axis)
        // This ensures the marker maintains a consistent position relative to the planet
        this.marker.position.set(0, 0, markerDistance);
    }
    
    /**
     * Set the marker position in world space
     * @param {THREE.Vector3} worldPosition - The world position to place the marker
     */
    setWorldPosition(worldPosition) {
        if (!this.marker) return;
        
        // Convert world position to local space of the marker's parent
        const localPos = new THREE.Vector3();
        this.planet.sideMarkerGroup.worldToLocal(worldPosition, localPos);
        this.marker.position.copy(localPos);
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

    /**
     * Set whether this marker should control the camera view
     * @param {boolean} enabled - Whether camera view should be enabled
     */
    setCameraView(enabled) {
        this.cameraView = enabled;
    }
    
    /**
     * Get the target position for the camera to look at (usually the planet center)
     * @returns {THREE.Vector3} The target position
     */
    getCameraTarget() {
        const planetWorldPos = new THREE.Vector3();
        if (this.planet && this.planet.sphere) {
            this.planet.sphere.getWorldPosition(planetWorldPos);
        }
        return planetWorldPos;
    }
}