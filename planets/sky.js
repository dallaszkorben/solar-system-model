/**
 * Sky class for the starry background in the solar system model
 * Inherits from Planet to allow rotation and tilt
 */
class Sky extends Planet {
    constructor() {
        try {
            console.log('Creating Sky object...');

            // Create minimal fact data for the sky with Earth's axial tilt
            const factData = {
                axialTilt: 0, //23.4, // Same tilt as Earth
                orbitRadius: 0 // No orbit
            };

            // No-scale mode data
            const noScaleModeData = {
                diameter: 40000000, // Large diameter to encompass the solar system
                rotationPeriod: 240, // Slow rotation (4 hours per rotation)
                maxRotationPeriod: 60, // Maximum speed (1 hour per rotation)
                rotationSpeed: function() { return 0; }, // Initial rotation speed set to zero
                maxRotationSpeed: function() { return 0.0004; }, // Maximum rotation speed
                orbitRadius: 0, // No orbit
                orbitalPeriod: 0, // No orbit
                maxOrbitalPeriod: 0, // No orbit
                orbitSpeed: function() { return 0; }, // No orbit
                maxOrbitSpeed: function() { return 0; } // No orbit
            };

            // Size scale mode data (same as no-scale for sky)
            const sizeScaleModeData = { ...noScaleModeData };

            // Distance scale mode data (same as no-scale for sky)
            const distanceScaleModeData = { ...noScaleModeData };

            // Call parent constructor
            super(factData, noScaleModeData, sizeScaleModeData, distanceScaleModeData);

            // Create the sky sphere with updated texture path
            console.log('Loading sky texture from: textures/starry-sky-texture.png');
            this.createSphere('textures/starry-sky-constellation-texture.png');

//
//
            // Rotate the sky sphere itself by PI/2 counterclockwise
            this.sphere.rotation.y = 0; //-Math.PI/2;

//            // Rotate the sky's orientation before applying tilt
//            this.group.rotation.y = -Math.PI/4; // Rotate the horizontal axis 90 degrees around vertical axis

            // Apply Earth's axial tilt
            this.applyTilt();

            // Create rotation axis (but don't show it by default)
            this.createAxis(0xff0000);

            // Create latitude circles (just equator for sky)
            this.createLatitudeCircles([
                { name: 'Celestial Equator', angle: 0, color: 0x00ffff, widthScale: 1.0 }
            ]);

            console.log('Sky object created successfully');
        } catch (error) {
            console.error('Error creating Sky object:', error);
        }

        // Set material to basic material with BackSide rendering
        if (this.sphere && this.sphere.material && this.sphere.material.map) {
            console.log('Sky texture loaded successfully, applying to material');

            // Get the texture and flip it horizontally to fix mirroring
            const texture = this.sphere.material.map;
            texture.flipY = true; // This flips the texture vertically
            texture.wrapS = THREE.RepeatWrapping;
            texture.repeat.x = -1; // This flips the texture horizontally
            texture.needsUpdate = true;

            this.sphere.material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.BackSide, // Render on the inside of the sphere
                depthWrite: false
            });
        } else {
            console.error('Failed to apply sky texture: sphere, material, or texture map is undefined');
            // Create a fallback material with a color
            this.sphere.material = new THREE.MeshBasicMaterial({
                color: 0x000020, // Dark blue color as fallback
                side: THREE.BackSide,
                depthWrite: false
            });
        }

        // Set render order to ensure it's drawn first
        this.sphere.renderOrder = -1000;

        // Add a custom rotation speed variable that can be set later
        this.customRotationSpeed = 0;
    }

    // Override the update method to use customRotationSpeed
    update(time) {
        // Use customRotationSpeed if set, otherwise use the parent's update logic
        if (this.customRotationSpeed !== 0) {
            this.sphere.rotation.y += this.customRotationSpeed;
        } else {
            // Call the parent update method
            super.update(time);
        }
    }

    // Method to set custom rotation speed
    setRotationSpeed(speed) {
        this.customRotationSpeed = speed;
    }

    // Override the createAxis method from Planet class
    createAxis(color = 0xff0000) {
        // Remove any existing axis
        if (this.axis) {
            this.group.remove(this.axis);
        }

        // Create a red line for the rotation axis
        const material = new THREE.LineBasicMaterial({
            color: color,
            linewidth: 3,
            depthTest: false
        });

        // Make the axis extend through the entire sky sphere
        const axisLength = this.radius * 2;
        const points = [];
        points.push(new THREE.Vector3(0, -axisLength, 0));
        points.push(new THREE.Vector3(0, axisLength, 0));

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        this.axis = new THREE.Line(geometry, material);
        this.axis.renderOrder = 1000; // Ensure it renders on top

        // Initially hidden
        this.axis.visible = false;

        // Add to the group
        this.group.add(this.axis);

        console.log("Created rotation axis for sky (initially hidden)");
    }

    // Method to show the rotation axis
    showRotationAxis() {
        if (this.axis) {
            this.axis.visible = true;
            console.log("Sky axis visibility set to true");
        }
    }

    // Method to hide the rotation axis
    hideRotationAxis() {
        if (this.axis) {
            this.axis.visible = false;
        }
    }

    // Method to toggle rotation axis visibility
    toggleRotationAxis() {
        if (this.axis) {
            this.axis.visible = !this.axis.visible;
            return this.axis.visible;
        }
        return false;
    }

    // Method to show the equator (latitude circles)
    showEquator() {
        if (this.latitudeCircles) {
            this.latitudeCircles.visible = true;
        }
    }

    // Method to hide the equator (latitude circles)
    hideEquator() {
        if (this.latitudeCircles) {
            this.latitudeCircles.visible = false;
        }
    }

    // Method to toggle equator visibility
    toggleEquator() {
        if (this.latitudeCircles) {
            this.latitudeCircles.visible = !this.latitudeCircles.visible;
            return this.latitudeCircles.visible;
        }
        return false;
    }
}