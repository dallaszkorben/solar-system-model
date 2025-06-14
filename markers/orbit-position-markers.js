/**
 * OrbitMarker class for creating specific position markers on planet orbits
 */
class OrbitPositionMarker {
    // Scale factor for the marker sphere relative to planet diameter
    static markerSphereScale = 0.1;

    constructor(planet, name, description, angle, color = 0xffffff) {
        this.planet = planet;
        this.name = name;
        this.description = description;
        this.angle = angle;      // in radians
        this.color = color;
        this.marker = null;
        this.sphere = null;
        this.wasVisible = false; // Track visibility state

        this.updateMarker();
    }

    updateMarker() {
        // Remove existing marker if it exists
        if (this.marker) {
            this.planet.scene.remove(this.marker);
            this.marker = null;
        }

        // Remove existing sphere if it exists
        if (this.sphere) {
            this.planet.scene.remove(this.sphere);
            this.sphere = null;
        }

        // Create new marker
        this.createMarker();
        this.positionMarker();
    }

    createMarker() {
        // Create the sphere marker
        const sphereRadius = this.planet.radius * OrbitPositionMarker.markerSphereScale;
        const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 16, 16);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: this.color });
        this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.planet.scene.add(this.sphere);

        // Only create a sprite if there's something to display
        if ((this.name && this.name !== "") ||
            (this.description && this.description !== "")) {

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 256;

            // Only add name text if it exists and is not empty
            if (this.name && this.name !== "") {
                ctx.font = 'Bold 40px Arial';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.fillText(this.name, 128, 120);
            }

            // Only add description text if it exists and is not empty
            if (this.description && this.description !== "") {
                ctx.font = '30px Arial';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.fillText(`(${this.description})`, 128, this.name ? 180 : 128);
            }

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({
                map: texture,
                color: this.color,
                depthTest: true,
                depthWrite: false
            });

            this.marker = new THREE.Sprite(material);
            this.planet.scene.add(this.marker);
        }
    }

    positionMarker() {
        // Calculate position based on orbit radius and angle
        const x = this.planet.orbitRadius * Math.cos(this.angle);
        const z = this.planet.orbitRadius * Math.sin(this.angle);

        // Position the sphere on the orbital plane
        if (this.sphere) {
            this.sphere.position.set(x, 0, z);
        }

        // Position the text marker slightly above the orbital plane
        if (this.marker) {
            this.marker.position.set(x, this.planet.radius * 3, z);
            this.marker.scale.set(this.planet.radius * 5, this.planet.radius * 5, 1);
        }
    }

    setVisible(visible) {
        if (this.marker) {
            this.marker.visible = visible;
        }
        if (this.sphere) {
            this.sphere.visible = visible;
        }
    }
}
