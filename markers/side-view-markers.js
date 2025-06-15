/**
 * Side view markers - shows yellow spheres at camera positions
 */
class SideViewMarkers {

    static markerSphereScale = 1/50;
    static markerSphereColor = 0xff0000; //0xffff00;

    constructor(planet) {
        this.planet = planet;
        this.marker = null;
        this.visible = false;

        // Create marker for the planet
        this.createMarker();
    }

    createMarker() {
        // Create a yellow sphere
        const geometry = new THREE.SphereGeometry(1, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: SideViewMarkers.markerSphereColor,
            transparent: false,
            depthTest: true
        });

        this.marker = new THREE.Mesh(geometry, material);
        this.marker.renderOrder = 1000; // Render on top
        this.marker.visible = this.visible;

        // Add to scene
        this.planet.scene.add(this.marker);
    }

    update() {
        if (!this.visible || !this.marker || !this.planet || !this.planet.solarSystem) return;

        const planetName = this.planet.id;

        // Get angles from control panel if available
        let verticalAngleDiff = 0;
        let horizontalAngleDiff = 0;
        let depthTranslate = 2.0; // Default absolute distance

        // Check if there's a control panel with slider values
        if (this.planet.solarSystem.viewControlPanel &&
            this.planet.solarSystem.viewControlPanel.planetSliderValues &&
            this.planet.solarSystem.viewControlPanel.planetSliderValues[planetName]) {

            const planetValues = this.planet.solarSystem.viewControlPanel.planetSliderValues[planetName];

            if (planetValues.vertical !== undefined) {
                verticalAngleDiff = planetValues.vertical;
            }

            if (planetValues.horizontal !== undefined) {
                horizontalAngleDiff = planetValues.horizontal;
            }

            if (planetValues.depth !== undefined) {
                depthTranslate = planetValues.depth;
            }
        } else if (PlanetSideView.viewCameras &&
                  PlanetSideView.viewCameras[planetName + 'SideView'] &&
                  PlanetSideView.viewCameras[planetName + 'SideView'].traverseDepthDefaultValue) {
            depthTranslate = PlanetSideView.viewCameras[planetName + 'SideView'].traverseDepthDefaultValue;
        }

        // Use the common method to calculate marker position
        // Note: we use -verticalAngleDiff to match the behavior in PlanetSideView
        const markerPos = this.planet.solarSystem.calculateEquatorialPosition(
        //const markerPos = this.planet.solarSystem.calculateOrbitalPosition(
            this.planet,
            -verticalAngleDiff,
            horizontalAngleDiff,
            depthTranslate
        );

        if (markerPos) {
            // Set marker position
            this.marker.position.copy(markerPos);

            // Set marker size
            const size = this.planet.diameter * SideViewMarkers.markerSphereScale;
            this.marker.scale.set(size, size, size);
        }
    }

/*

        if (!this.visible || !this.marker || !this.planet) return;

        // Get planet position
        const planetWorldPos = new THREE.Vector3();
        this.planet.sphere.getWorldPosition(planetWorldPos);

        // Get default distance factor from PlanetSideView
        let distanceFactor = 2.0; // Default
        const planetName = this.planet.id;
        if (PlanetSideView.viewCameras &&
            PlanetSideView.viewCameras[planetName + 'SideView'] &&
            PlanetSideView.viewCameras[planetName + 'SideView'].traverseDepthDefaultValue) {
            distanceFactor = PlanetSideView.viewCameras[planetName + 'SideView'].traverseDepthDefaultValue;
        }
        console.log("distanceFactor", distanceFactor);

        // Calculate camera distance based on planet size
        const cameraDistance = this.planet.diameter * distanceFactor;

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
        const tiltRadians = THREE.MathUtils.degToRad(this.planet.axialTilt.z);
        const tiltMatrix = new THREE.Matrix4().makeRotationZ(tiltRadians);
        basePosition.applyMatrix4(tiltMatrix);

        // Scale to the desired distance
        basePosition.multiplyScalar(cameraDistance);

        // Add to planet position
        const markerPos = new THREE.Vector3().addVectors(planetWorldPos, basePosition);

        // Set marker position
        this.marker.position.copy(markerPos);

        // Set marker size to 1/100th of planet diameter
        const size = this.planet.diameter * SideViewMarkers.markerSphereScale;
        this.marker.scale.set(size, size, size);
    }
*/
    setVisible(visible) {
        this.visible = visible;
        if (this.marker) {
            this.marker.visible = visible;
        }
    }
}