/**
 * Sun model creator
 */
class Sun extends Planet {

    static NAME = 'Sun';
    static ID   = 'sun';

    // Planet rotations in degree
    static axialTilt = {
        x: 0,
        y: 0,
        z: 7.25
    }

    // Static data for Sun
    static factData = {
        diameter: 1391400.0,        // km
        rotationPeriod: 28 * 24,    // converted to hours (28 days)
        axialTilt: Sun.axialTilt,   // degrees
        orbitRadius: 0,             // Sun doesn't orbit anything
        orbitalPeriod: 0,           // Sun doesn't orbit anything
    };


    static nonScaleModelData = {
        diameter: Sun.factData.diameter/30.0, // visually appealing diameter
        orbitRadius: 0,                       // Sun doesn't orbit anything
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Sun.factData.rotationPeriod, 1);
            return 28 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Sun.factData.rotationPeriod, 1);
            return 2.8 * relativePeriods.rotation;
        },
        orbitalPeriod: 0, // Sun doesn't orbit anything
        maxOrbitalPeriod: 0, // Sun doesn't orbit anything
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return 0; }, // Sun doesn't orbit
        maxOrbitSpeed: function() { return 0; }, // Sun doesn't orbit
    };

    static sizeScaleModeData = {
        diameter: Sun.factData.diameter/Planet.scaleDownDiameterFactor,
        orbitRadius: 0,
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Sun.factData.rotationPeriod, Sun.factData.orbitalPeriod);
            return 10 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Sun.factData.rotationPeriod, Sun.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Sun.factData.rotationPeriod, Sun.factData.orbitalPeriod);
            return 600 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Sun.factData.rotationPeriod, Sun.factData.orbitalPeriod);
            return 60 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return 0; },
        maxOrbitSpeed: function() { return 0; },
    };

    static distanceScaleModeData = {
        diameter: Planet.referenceData.diameter, // size=Earth=1
        orbitRadius: 0,
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Sun.factData.rotationPeriod, Sun.factData.orbitalPeriod);
            return 10 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Sun.factData.rotationPeriod, Sun.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Sun.factData.rotationPeriod, Sun.factData.orbitalPeriod);
            return 600 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Sun.factData.rotationPeriod, Sun.factData.orbitalPeriod);
            return 60 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return 0; },
        maxOrbitSpeed: function() { return 0; },
    };

    constructor(solarSystem) {
        super(solarSystem, Sun.factData, Sun.nonScaleModelData, Sun.sizeScaleModeData, Sun.distanceScaleModeData);

        this.name = Sun.NAME;
        this.id   = Sun.ID;

        // Override orbit properties since Sun doesn't orbit
        this.orbitEnabled = false;
        this.orbitSpeed = 0;

        this.createSphere('textures/Sun-texture.jpg');
        this.createAxis(0xff0000); // Orange color for Sun's axis
        this.createLatitudeCircles(this.getLatitudeCircleList());
        this.applyTilt();

        // Add a point light at the center of the sun
        this.addSunLight();
    }

    getLatitudeCircleList() {
        return [
            { name: 'Solar Equator', angle: 0, color: 0x00ffff, widthScale: 1.0 }
        ];
    }

    // This method has been moved to the Planet base class
    // makeDraggableElement is now inherited from Planet

    createSphere(texturePath) {
        try {
            console.log(`Creating sun sphere with texture: ${texturePath}`);
            const geometry = new THREE.SphereGeometry(this.radius, 64, 32);
            const textureLoader = new THREE.TextureLoader();

            // Add error handling for texture loading
            const texture = textureLoader.load(
                texturePath,
                // onLoad callback
                function(loadedTexture) {
                    console.log(`Sun texture loaded successfully: ${texturePath}`);
                },
                // onProgress callback (not supported by most browsers)
                undefined,
                // onError callback
                function(err) {
                    console.error(`Error loading sun texture: ${texturePath}`, err);
                    // Create a fallback colored material
                    if (this.sphere && this.sphere.material) {
                        const fallbackColor = 0xffcc00; // Yellow fallback color for sun
                        this.sphere.material.map = null;
                        this.sphere.material.color.set(fallbackColor);
                        this.sphere.material.needsUpdate = true;
                    }
                }.bind(this) // Bind this to access sphere in the callback
            );

            // Create material with the texture and emissive properties
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                emissive: 0xffaa00,
                emissiveIntensity: 0.3,
                shininess: 5
            });

            this.sphere = new THREE.Mesh(geometry, material);
            this.group.add(this.sphere);

            console.log('Sun sphere created successfully');
        } catch (error) {
            console.error(`Error creating sun sphere with texture ${texturePath}:`, error);

            // Create a fallback sphere with a solid color if texture loading fails
            try {
                const geometry = new THREE.SphereGeometry(this.radius, 64, 32);
                const material = new THREE.MeshBasicMaterial({
                    color: 0xffcc00,  // Yellow fallback color for sun
                    emissive: 0xffaa00,
                    emissiveIntensity: 0.3
                });
                this.sphere = new THREE.Mesh(geometry, material);
                this.group.add(this.sphere);
                console.log('Created fallback sun sphere');
            } catch (fallbackError) {
                console.error('Failed to create fallback sun sphere:', fallbackError);
            }
        }
    }

    addSunLight() {
        // Add a point light at the center of the sun with increased intensity and no distance falloff
        this.pointLight = new THREE.PointLight(0xffffff, 2.0, 0, 1);
        this.pointLight.castShadow = true;
        this.group.add(this.pointLight);
    }

    createConsolePane() {
        // Create console pane
        this.consolePane = document.createElement('div');
        this.consolePane.className = 'console-pane';
        this.consolePane.style.position = 'absolute';
        this.consolePane.style.bottom = '20px';
        this.consolePane.style.right = '20px';
        this.consolePane.style.backgroundColor = 'rgba(80, 80, 80, 0.8)';
        this.consolePane.style.color = 'white';
        this.consolePane.style.padding = '0';
        this.consolePane.style.borderRadius = '5px';
        this.consolePane.style.fontFamily = 'Arial, sans-serif';
        this.consolePane.style.display = 'none';
        this.consolePane.style.width = '250px';
        this.consolePane.style.boxShadow = '0 4px 8px rgba(0,0,0,0.5)';

        // Create header for dragging
        const header = document.createElement('div');
        header.style.backgroundColor = 'rgba(100, 100, 100, 0.9)';
        header.style.padding = '10px 15px';
        header.style.borderTopLeftRadius = '5px';
        header.style.borderTopRightRadius = '5px';
        header.style.cursor = 'move';
        header.style.borderBottom = '1px solid #666';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';

        // Add title to header
        const title = document.createElement('h3');
        title.textContent = 'Sun Controls';
        title.style.margin = '0';
        header.appendChild(title);

        // Create icons container for collapse and close
        const iconsContainer = document.createElement('div');
        iconsContainer.style.display = 'flex';
        iconsContainer.style.alignItems = 'center';

        // Add collapse/expand icon
        const collapseIcon = document.createElement('div');
        collapseIcon.innerHTML = '&#9650;'; // Up arrow (collapse)
        collapseIcon.style.cursor = 'pointer';
        collapseIcon.style.fontSize = '16px';
        collapseIcon.style.width = '20px';
        collapseIcon.style.height = '20px';
        collapseIcon.style.display = 'flex';
        collapseIcon.style.justifyContent = 'center';
        collapseIcon.style.alignItems = 'center';
        collapseIcon.style.userSelect = 'none';
        collapseIcon.title = 'Collapse/Expand';
        iconsContainer.appendChild(collapseIcon);

        // Add close icon
        const closeIcon = document.createElement('div');
        closeIcon.innerHTML = '&#10006;'; // X symbol
        closeIcon.style.cursor = 'pointer';
        closeIcon.style.fontSize = '16px';
        closeIcon.style.width = '20px';
        closeIcon.style.height = '20px';
        closeIcon.style.display = 'flex';
        closeIcon.style.justifyContent = 'center';
        closeIcon.style.alignItems = 'center';
        closeIcon.style.userSelect = 'none';
        closeIcon.style.marginLeft = '8px';
        closeIcon.title = 'Close';

        // Add click handler to hide the panel
        closeIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent dragging
            this.hide();

            // Find the toggle for sun in the Solar System Controls
            const toggle = document.getElementById('sun-controls-toggle');
            if (toggle) {
                toggle.checked = false;
            }
        });

        iconsContainer.appendChild(closeIcon);

        // Add icons container to header
        header.appendChild(iconsContainer);

        // Add the header to the console pane
        this.consolePane.appendChild(header);

        // Create content container with padding
        const content = document.createElement('div');
        content.style.padding = '15px';
        this.consolePane.appendChild(content);

        // Make the console pane draggable using the method from Planet base class
        this.makeDraggableElement(this.consolePane, header);

        // Store content container for adding controls
        this.consoleContent = content;

        // Add collapse/expand functionality
        collapseIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent dragging when clicking the icon

            // Get current position before changing display
            const currentTop = this.consolePane.offsetTop;
            const currentLeft = this.consolePane.offsetLeft;

            // Get animation duration from SolarSystem if available, or use default
            const animationDuration = window.solarSystem?.uiConfig?.panelAnimationDuration || 1.0;

            if (content.style.display === 'none') {
                // Expand
                content.style.display = 'block';
                content.style.height = '0';
                content.style.overflow = 'hidden';
                content.style.transition = `height ${animationDuration}s ease`;
                this.consolePane.style.transition = `height ${animationDuration}s ease`;

                // Trigger reflow to ensure transition works
                content.offsetHeight;

                // Get the natural height
                const contentHeight = content.scrollHeight;

                // Animate expansion
                content.style.height = contentHeight + 'px';
                this.consolePane.style.height = (header.offsetHeight + contentHeight) + 'px';
                collapseIcon.innerHTML = '&#9650;'; // Up arrow (collapse)
                this.consolePane.style.borderBottomLeftRadius = '5px';
                this.consolePane.style.borderBottomRightRadius = '5px';

                // Reset height to auto after animation
                setTimeout(() => {
                    content.style.height = 'auto';
                    content.style.overflow = 'visible';
                    content.style.transition = '';
                    this.consolePane.style.height = 'auto';
                    this.consolePane.style.transition = '';
                }, animationDuration * 1000);
            } else {
                // Get current content height before collapsing
                const contentHeight = content.offsetHeight;
                const headerHeight = header.offsetHeight;

                content.style.height = contentHeight + 'px';
                content.style.overflow = 'hidden';
                content.style.transition = `height ${animationDuration}s ease`;
                this.consolePane.style.height = (headerHeight + contentHeight) + 'px';
                this.consolePane.style.transition = `height ${animationDuration}s ease`;

                // Trigger reflow to ensure transition works
                content.offsetHeight;

                // Animate collapse
                content.style.height = '0';
                this.consolePane.style.height = `${headerHeight}px`;
                collapseIcon.innerHTML = '&#9660;'; // Down arrow (expand)
                this.consolePane.style.borderBottomLeftRadius = '0';
                this.consolePane.style.borderBottomRightRadius = '0';

                // Hide content after animation completes
                setTimeout(() => {
                    content.style.display = 'none';
                    content.style.transition = '';
                    this.consolePane.style.transition = '';
                }, animationDuration * 1000);
            }

            // Restore position after changing display
            this.consolePane.style.top = `${currentTop}px`;
            this.consolePane.style.left = `${currentLeft}px`;
        });

        // Create rotation section
        this.createRotationSection();

        // Add to document
        document.body.appendChild(this.consolePane);
    }

    getObject() {
        return this.group; // Sun doesn't orbit, so return the group directly
    }

    /**
     * Override the setVisibility method to handle day/night effect when sun is hidden
     * @param {boolean} isVisible - Whether the sun should be visible
     */
    setVisibility(isVisible) {
        // Call the parent method to handle basic visibility
        if (isVisible) {
            this.show();
        } else {
            this.hide();
        }

        // Store visibility state
        this.visible = isVisible;

        // Control the sun's point light visibility directly
        if (this.pointLight) {
            this.pointLight.visible = isVisible;
        }

        // Find the solar system instance
        const solarSystem = window.solarSystem;

        if (solarSystem) {
            // Control the directional light visibility directly
            if (solarSystem.sunLight) {
                solarSystem.sunLight.visible = isVisible;
            }
        }
    }
}