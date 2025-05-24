/**
 * Sun model creator
 */
class Sun extends Planet {

    // Static data for Sun
    static factData = {
        diameter: 1391400, // km
        rotationPeriod: 28 * 24, // converted to hours (28 days)
        axialTilt: 7.25, // degrees
        orbitRadius: 0, // Sun doesn't orbit anything
        orbitalPeriod: 0, // Sun doesn't orbit anything
    };

    static scaleModelData = {
        diameter: Sun.factData.diameter,    // scaled diameter
        orbitRadius: 0,                     // Sun doesn't orbit anything
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Sun.factData.rotationPeriod, 1); // Use 1 as orbital period since Sun doesn't orbit
            return 10 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Sun.factData.rotationPeriod, 1);
            return 1 * relativePeriods.rotation;
        },
        orbitalPeriod: 0, // Sun doesn't orbit anything
        maxOrbitalPeriod: 0, // Sun doesn't orbit anything
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return 0; }, // Sun doesn't orbit
        maxOrbitSpeed: function() { return 0; }, // Sun doesn't orbit
    };

    static nonScaleModelData = {
        diameter: Sun.factData.diameter/50, // visually appealing diameter
        orbitRadius: 0,                     // Sun doesn't orbit anything
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

    constructor() {
//        super(Sun.nonScaleModelData.diameter, Sun.factData, Sun.nonScaleModelData, Sun.scaleModelData);
        super(Sun.factData, Sun.nonScaleModelData, Sun.scaleModelData);

        // Override orbit properties since Sun doesn't orbit
        this.orbitEnabled = false;
        this.orbitSpeed = 0;

        this.createSphere('images/Sun-texture.jpg');
        this.createAxis(0xff8800); // Orange color for Sun's axis
        this.applyTilt();
        this.createConsolePane();

        // Add a point light at the center of the sun
        this.addSunLight();
    }

    createSphere(texturePath) {
        const geometry = new THREE.SphereGeometry(this.radius, 64, 32);
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(texturePath);

        // Create material with the texture and emissive properties
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            emissive: 0xffaa00,
            emissiveIntensity: 0.3,
            shininess: 5
        });

        this.sphere = new THREE.Mesh(geometry, material);
        this.group.add(this.sphere);
    }

    addSunLight() {
        // Add a point light at the center of the sun with increased intensity and no distance falloff
        const sunLight = new THREE.PointLight(0xffffff, 2.0, 0, 1);
        sunLight.castShadow = true;
        this.group.add(sunLight);
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

        // Add title to header
        const title = document.createElement('h3');
        title.textContent = 'Sun Controls';
        title.style.margin = '0';
        header.appendChild(title);

        // Add the header to the console pane
        this.consolePane.appendChild(header);

        // Create content container with padding
        const content = document.createElement('div');
        content.style.padding = '15px';
        this.consolePane.appendChild(content);

        // Make the console pane draggable
        this.makeDraggable(this.consolePane, header);

        // Store content container for adding controls
        this.consoleContent = content;

        // Create rotation section
        this.createRotationSection();

        // Add to document
        document.body.appendChild(this.consolePane);
    }

    createRotationSection() {
        // Create section header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Rotation Controls';
        sectionHeader.style.margin = '0 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Add axis toggle
        this.addToggle('Show Axis: ', 'sun-axis-toggle', true, (e) => {
            if (this.axis) {
                this.axis.visible = e.target.checked;
            }
        });

        // Add rotation toggle
        this.addToggle('Enable Rotation: ', 'sun-rotation-toggle', this.rotationEnabled, (e) => {
            this.rotationEnabled = e.target.checked;
        });

        // Add rotation speed slider
        this.addSlider('Rotation Speed: ', 'sun-rotation-speed-slider', 50, (value) => {
            if (value === 0) {
                this.rotationSpeed = 0;
            } else if (value <= 50) {
                const normalizedValue = value / 50;
                const baseSpeed = (2 * Math.PI) / (this.rotationPeriod * 60);
                this.rotationSpeed = baseSpeed * normalizedValue;
            } else {
                const normalizedValue = (value - 50) / 50;
                const periodDiff = this.rotationPeriod - this.maxRotationPeriod;
                const adjustedPeriod = this.rotationPeriod - (periodDiff * normalizedValue);
                this.rotationSpeed = (2 * Math.PI) / (adjustedPeriod * 60);
            }

            if (value > 0 && !this.rotationEnabled) {
                this.rotationEnabled = true;
                document.getElementById('sun-rotation-toggle').checked = true;
            }
        });
    }

    getObject() {
        return this.group; // Sun doesn't orbit, so return the group directly
    }
}