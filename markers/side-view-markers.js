/**
 * Side view markers - shows yellow spheres at camera positions
 */
class SideViewMarkers {

    static markerSphereScale = 1/20;
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
        const markerPos = PlanetSideView.getRecentViewCameraPosition(
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

    setVisible(visible) {
        this.visible = visible;
        if (this.marker) {
            this.marker.visible = visible;
        }
    }
}