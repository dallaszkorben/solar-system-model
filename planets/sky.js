/**
 * Sky class for the starry background in the solar system model
 * Inherits from Planet to allow rotation and tilt
 */
class Sky extends Planet {

    static NAME = 'Sky';
    static ID   = 'sky';

    // Planet rotations in degree
    static axialTilt = {
        x: 0,
        y: 0,
        z: 23.93,   // Same as Earth
    }

    // Create minimal fact data for the sky with Earth's axial tilt
    static factData = {
        axialTilt: Sky.axialTilt,   //23.4, // Same tilt as Earth
        orbitRadius: 0              // No orbit
    };

    constructor(solarSystem) {
            console.log('Creating Sky object...');

            // No-scale mode data
            const noScaleModeData = {
                //diameter: 2 * 2 * 600000, // Large diameter to encompass the solar system
                diameter: 2 * 2 * Neptune.factData.orbitRadius/Planet.scaleDownOrbitFactor,
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
            const sizeScaleModeData = {
                //diameter: 2 * 2 * Uranus.sizeScaleModeData.orbitRadius + Planet.shiftOrbit,
                diameter: 2 * 2 * Neptune.factData.orbitRadius/Planet.scaleDownOrbitFactor,
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

            // Distance scale mode data (same as no-scale for sky)
            const distanceScaleModeData = {
                diameter: 2 * 2 * Neptune.factData.orbitRadius/Planet.scaleDownOrbitFactor,
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

            // Distance scale mode data (same as no-scale for sky)
            const fullScaleModeData = {
                diameter: 2 * 2 * Neptune.factData.orbitRadius/Planet.scaleDownOrbitFactor,
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


            // Call parent constructor
            super(solarSystem, Sky.factData, noScaleModeData, sizeScaleModeData, distanceScaleModeData, fullScaleModeData);

            this.name = Sky.NAME;
            this.id   = Sky.ID;

            //
            // Global variables
            //

            // Brightness control properties
            this.maxStarBrightness = 2.0;
            this.defaultStarBrightness = 0.5;
            this.defaultConstellationBrightness = 0.5;


            // Create the sky sphere with our custom method
            console.log('Loading sky textures...');
            this.createSkySphere();

            this.applyTilt();

            // Create rotation axis (but don't show it by default)
            this.createAxis(0xff0000);

            // Create latitude circles (just equator for sky)
            this.createLatitudeCircles(this.getLatitudeCircleList());

            console.log('Sky object created successfully');

        // Add a custom rotation speed variable that can be set later
        this.customRotationSpeed = 0;
    }

    getLatitudeCircleList() {
        return [
            { name: 'Celestial Equator', angle: 0, color: 0x00ffff, widthScale: 1.0 }
        ];
    }

    /**
     * Create a sky sphere with proper textures
     * This is a Sky-specific implementation that avoids the issues with null textures
     */
    createSkySphere() {
        // Create geometry for sky sphere
        const geometry = new THREE.SphereGeometry(this.radius, 256, 256);

        // Create a simple material for the sphere initially
        const material = new THREE.MeshBasicMaterial({
            color: 0x000000, // Black color to prevent white flash during loading
            side: THREE.BackSide,
            depthWrite: false,
            transparent: true,
            opacity: 1.0
        });

        // Create the sphere with initial material
        this.sphere = new THREE.Mesh(geometry, material);
        this.sphere.renderOrder = -1000; // Ensure it's drawn first
        this.group.add(this.sphere);

        // Store materials for later use
        this.standardMaterial = material;
        this.basicMaterial = material;

        // Load both textures explicitly
        const textureLoader = new THREE.TextureLoader();

        // Load the star texture first
        textureLoader.load('textures/starry-sky-star-texture-0_0_23.4.jpg',
            // onLoad callback
            (starTexture) => {
                console.log('Star texture loaded successfully');

                // Apply transformations
                starTexture.flipY = true;
                starTexture.wrapS = THREE.RepeatWrapping;
                starTexture.repeat.x = -1;
                starTexture.needsUpdate = true;

                // Apply the star texture with doubled brightness
                this.sphere.material.map = starTexture;

                // Apply stored brightness if available, otherwise use default
                if (this.currentStarBrightness !== undefined) {
                    this.setStarsBrightness(this.currentStarBrightness);
                } else {
                    // Set brightness by using the maxStarBrightness property
                    this.sphere.material.color.setRGB(this.maxStarBrightness, this.maxStarBrightness, this.maxStarBrightness);
                    this.sphere.material.needsUpdate = true;
                }

                // Now load the constellation texture
                textureLoader.load('textures/starry-sky-constellation-texture-16k-0_0_23.4.png',
                    // onLoad callback
                    (constellationTexture) => {
                        console.log('Constellation texture loaded successfully');

                        // Create a second sphere for the constellation overlay
                        //const constellationGeometry = new THREE.SphereGeometry(this.radius * 0.99, 64, 32);
                        const constellationGeometry = new THREE.SphereGeometry(this.radius, 64, 32);
                        const constellationMaterial = new THREE.MeshBasicMaterial({
                            map: constellationTexture,
                            transparent: true,
                            opacity: this.currentConstellationBrightness,
                            side: THREE.BackSide,
                            depthWrite: false
                        });

                        // Apply transformations
                        constellationTexture.flipY = true;
                        constellationTexture.wrapS = THREE.RepeatWrapping;
                        constellationTexture.repeat.x = -1;
                        constellationTexture.needsUpdate = true;

                        // Create and add the constellation sphere
                        this.constellationSphere = new THREE.Mesh(constellationGeometry, constellationMaterial);
                        // Use the stored visibility state if available, otherwise default to false
                        this.constellationSphere.visible = this.constellationVisible !== undefined ? this.constellationVisible : false;
                        this.constellationSphere.renderOrder = -999; // Ensure it's drawn before other objects but after the star sphere
                        this.group.add(this.constellationSphere);

                        // Apply stored brightness if available
                        if (this.currentConstellationBrightness !== undefined) {
                            this.setConstellationsBrightness(this.currentConstellationBrightness);
                        }

                        console.log('Both textures applied successfully');
                    },
                    // onProgress callback
                    undefined,
                    // onError callback
                    (error) => {
                        console.error('Error loading constellation texture:', error);
                    }
                );
            },
            // onProgress callback
            undefined,
            // onError callback
            (error) => {
                console.error('Error loading star texture:', error);
            }
        );
    }

    // Store current brightness values for later use
    storeCurrentBrightness() {
        // Store star brightness
        if (this.sphere && this.sphere.material) {
            const colorValue = this.sphere.material.color.r;
            this.currentStarBrightness = colorValue / (this.maxStarBrightness * 2.0);
        }

        // Store constellation brightness
        if (this.constellationSphere && this.constellationSphere.material) {
            this.currentConstellationBrightness = this.constellationSphere.material.opacity;
        }
    }

    // Override updateSphere to handle both sky sphere and constellation sphere
    updateSphere() {
        // Store current visibility states as class properties
        this.sphereVisible = this.sphere ? this.sphere.visible : true;
        this.constellationVisible = this.constellationSphere ? this.constellationSphere.visible : false;

        // Store current brightness values
        this.storeCurrentBrightness();

        // Remove existing spheres
        if (this.sphere) {
            this.group.remove(this.sphere);
        }
        if (this.constellationSphere) {
            this.group.remove(this.constellationSphere);
        }

        // Recreate sky sphere with new radius
        this.createSkySphere();
    }

    // Override the update method to use customRotationSpeed
    update(time) {
        // Use customRotationSpeed if set, otherwise use the parent's update logic
        if (this.customRotationSpeed !== 0) {
            this.sphere.rotation.y += this.customRotationSpeed;
            // Also rotate the constellation sphere if it exists
            if (this.constellationSphere) {
                this.constellationSphere.rotation.y += this.customRotationSpeed;
            }
        } else {
            // Call the parent update method
            super.update(time);
        }
    }

    // Method to set custom rotation speed
    setRotationSpeed(speed) {
        this.customRotationSpeed = speed;
    }

    // Methods to set rotation around specific axes
    setPitchRotation(angle) {
        if (this.group) {
            this.group.rotation.x = angle;
        }
    }

    setYawRotation(angle) {
        if (this.group) {
            this.group.rotation.y = angle;
        }
    }

    setRollRotation(angle) {
        if (this.group) {
            this.group.rotation.z = angle;
        }
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
            depthTest: true
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

    // Set stars brightness
    setStarsBrightness(brightness) {
        // Store the brightness value for future use
        this.currentStarBrightness = brightness;

        if (this.sphere && this.sphere.material) {
            this.sphere.material.opacity = brightness;
            this.sphere.material.transparent = brightness < 1.0;

            // Scale brightness using maxStarBrightness
            // When slider is at 100%, we get maxStarBrightness * 2 intensity
            const colorIntensity = brightness * this.maxStarBrightness * 2.0;
            this.sphere.material.color.setRGB(colorIntensity, colorIntensity, colorIntensity);

            this.sphere.material.needsUpdate = true;
        }
    }

    // Set constellations brightness
    setConstellationsBrightness(brightness) {
        // Store the brightness value for future use
        this.currentConstellationBrightness = brightness;

        if (this.constellationSphere && this.constellationSphere.material) {
            this.constellationSphere.material.opacity = brightness;
            this.constellationSphere.material.needsUpdate = true;
        }
    }
}