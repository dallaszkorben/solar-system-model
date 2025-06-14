/**
 * Side view markers - shows yellow spheres at camera positions
 */
class SideViewMarkers {

    static markerSphereScale = 1/50;
    static markerSphereColor = 0xff0000; //0xffff00;

    constructor(solarSystem) {
        this.solarSystem = solarSystem;
        this.markers = {};
        this.visible = false;

        // Create markers for each planet
        this.createMarkers();

        // Listen for side markers visibility toggle
        document.addEventListener('toggleSideMarkers', (event) => {
            this.setVisible(event.detail.visible);
        });
    }

    createMarkers() {
        // Create a marker for each planet
        Object.entries(this.solarSystem.planetObjs).forEach(([planetName, planet]) => {
            // Skip sky and sun (planets without orbits)
            if (planetName === 'sky' || planetName === 'sun') return;

            // Create a yellow sphere
            const geometry = new THREE.SphereGeometry(1, 16, 16);
            const material = new THREE.MeshBasicMaterial({
                color: SideViewMarkers.markerSphereColor,
                transparent: false,
                depthTest: true
            });

            const marker = new THREE.Mesh(geometry, material);
            marker.renderOrder = 1000; // Render on top
            marker.visible = this.visible;

            // Add to scene
            this.solarSystem.scene.add(marker);

            // Store in markers collection
            this.markers[planetName] = marker;
        });
    }

    update() {
        if (!this.visible) return;

        // Update each marker position and size
        Object.entries(this.markers).forEach(([planetName, marker]) => {
            const planet = this.solarSystem.planetObjs[planetName];
            if (!planet) return;

            // Get planet position
            const planetWorldPos = new THREE.Vector3();
            planet.sphere.getWorldPosition(planetWorldPos);

            // Get default distance factor from PlanetSideView
            let distanceFactor = 2.0; // Default
            if (PlanetSideView.viewCameras &&
                PlanetSideView.viewCameras[planetName + 'SideView'] &&
                PlanetSideView.viewCameras[planetName + 'SideView'].traverseDepthDefaultValue) {
                distanceFactor = PlanetSideView.viewCameras[planetName + 'SideView'].traverseDepthDefaultValue;
            }

            // Calculate camera distance based on planet size
            const cameraDistance = planet.diameter * distanceFactor;

            // Calculate camera position using the same method as PlanetSideView
            // Add PI/2 to make 0 the default position
            const adjustedVerticalAngle = Math.PI/2;

            // Create position using spherical coordinates
            const basePosition = new THREE.Vector3(
                Math.cos(adjustedVerticalAngle),
                0,
                Math.sin(adjustedVerticalAngle)
            );

            // Apply the planet's axial tilt
            const tiltRadians = THREE.MathUtils.degToRad(planet.axialTilt.z);
            const tiltMatrix = new THREE.Matrix4().makeRotationZ(tiltRadians);
            basePosition.applyMatrix4(tiltMatrix);

            // Scale to the desired distance
            basePosition.multiplyScalar(cameraDistance);

            // Add to planet position
            const markerPos = new THREE.Vector3().addVectors(planetWorldPos, basePosition);

            // Set marker position
            marker.position.copy(markerPos);

            // Set marker size to 1/100th of planet diameter
            const size = planet.diameter * SideViewMarkers.markerSphereScale;
            marker.scale.set(size, size, size);
        });
    }

    setVisible(visible) {
        this.visible = visible;

        // Update all markers visibility
        Object.values(this.markers).forEach(marker => {
            marker.visible = visible;
        });
    }
}