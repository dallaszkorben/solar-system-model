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
            console.log('Loading sky texture from: textures/starry-sky-texture.jpg');
            this.createSphere('textures/starry-sky-texture.jpg');

            // Apply Earth's axial tilt
            this.applyTilt();

            // Add rotation axis visualization
            this.showRotationAxis();

            // Create equator
            this.createEquator();

            console.log('Sky object created successfully');
        } catch (error) {
            console.error('Error creating Sky object:', error);
        }

        // Set material to basic material with BackSide rendering
        if (this.sphere && this.sphere.material && this.sphere.material.map) {
            console.log('Sky texture loaded successfully, applying to material');
            this.sphere.material = new THREE.MeshBasicMaterial({
                map: this.sphere.material.map,
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

    // Method to show the rotation axis
    showRotationAxis() {
        // Remove any existing axis
        if (this.rotationAxis) {
            this.group.remove(this.rotationAxis);
        }

        // Create a red line for the rotation axis
        const material = new THREE.LineBasicMaterial({
            color: 0xff0000,
            linewidth: 3
        });

        // Make the axis extend through the entire sky sphere
        const axisLength = this.radius * 2;
        const points = [];
        points.push(new THREE.Vector3(0, -axisLength, 0));
        points.push(new THREE.Vector3(0, axisLength, 0));

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        this.rotationAxis = new THREE.Line(geometry, material);

        // Add to the group
        this.group.add(this.rotationAxis);

        console.log("Added rotation axis visualization to sky");
    }

    // Method to hide the rotation axis
    hideRotationAxis() {
        if (this.rotationAxis) {
            this.group.remove(this.rotationAxis);
            this.rotationAxis = null;
        }
    }

    // Method to create the celestial equator
    createEquator() {
        // Create a circle geometry for the equator
        const equatorRadius = this.radius;
        const segments = 128;
        const equatorGeometry = new THREE.BufferGeometry();

        // Create points for a circle in the XZ plane
        const vertices = [];
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const x = equatorRadius * Math.cos(theta);
            const z = equatorRadius * Math.sin(theta);
            vertices.push(x, 0, z);
        }

        equatorGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        // Create a blue material for the equator
        const equatorMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            linewidth: 2
        });

        // Create the line
        this.equator = new THREE.Line(equatorGeometry, equatorMaterial);

        // Add to the group
        this.group.add(this.equator);

        // Initially hidden
        this.equator.visible = false;

        console.log("Added celestial equator to sky");
    }

    // Method to show the equator
    showEquator() {
        if (this.equator) {
            this.equator.visible = true;
        }
    }

    // Method to hide the equator
    hideEquator() {
        if (this.equator) {
            this.equator.visible = false;
        }
    }

    // Method to toggle equator visibility
    toggleEquator() {
        if (this.equator) {
            this.equator.visible = !this.equator.visible;
            return this.equator.visible;
        }
        return false;
    }
}