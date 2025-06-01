/**
 * Sky class for the starry background in the solar system model
 * Inherits from Planet to allow rotation and tilt
 */
class Sky extends Planet {
    constructor() {
        try {
            console.log('Creating Sky object...');
            
            // Create minimal fact data for the sky
            const factData = {
                axialTilt: 0, // No tilt by default
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
}