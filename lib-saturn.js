/**
 * Saturn model creator
 */
class Saturn extends Planet {
    // Static data for Saturn
    static factData = {
        diameter: 116460.0, // km
        axialTilt: 26.73, // degrees
        orbitRadius: 1433500000.0, // km (average distance from Sun)
        rotationPeriod: 10.7, // hours
        orbitalPeriod: 10759.22, // days
        ringInnerRadius: 74500, // km
        ringOuterRadius: 140000, // km
    };
    
    // Ring thickness configuration (not part of factual data)
    static ringThickness = 0.05; // Thickness as a fraction of planet radius

    static scaleModelData = {
        diameter: Saturn.factData.diameter/Planet.scaleDownDiameterFactor, // scaled diameter in the model
        orbitRadius: Saturn.factData.orbitRadius/Planet.scaleDownOrbitFactor + Planet.shiftOrbit, // scaled orbit radius
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Saturn.factData.rotationPeriod, Saturn.factData.orbitalPeriod);
            return 10 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Saturn.factData.rotationPeriod, Saturn.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Saturn.factData.rotationPeriod, Saturn.factData.orbitalPeriod);
            return 600 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Saturn.factData.rotationPeriod, Saturn.factData.orbitalPeriod);
            return 60 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    static nonScaleModelData = {
        diameter: Saturn.factData.diameter/3, // visually appealing diameter
        orbitRadius: 350000, // visually appealing orbit radius
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Saturn.factData.rotationPeriod, Saturn.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Saturn.factData.rotationPeriod, Saturn.factData.orbitalPeriod);
            return 0.1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Saturn.factData.rotationPeriod, Saturn.factData.orbitalPeriod);
            return 180 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Saturn.factData.rotationPeriod, Saturn.factData.orbitalPeriod);
            return 18 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    constructor() {
        super(Saturn.factData, Saturn.nonScaleModelData, Saturn.scaleModelData);

        // Ring visibility property
        this.ringsVisible = true;
        this.rings = null;

        this.createSphere('images/Saturn-texture.jpg');
        this.createAxis(0xffcc00); // Yellow-orange color for Saturn's axis
        this.createLatitudeCircles([
            { name: 'Equator', angle: 0, color: 0xff0000 },
            { name: 'North Tropic', angle: 26.73, color: 0xff8800 },
            { name: 'South Tropic', angle: -26.73, color: 0xff8800 }
        ]);
        this.createRings();
        this.applyTilt();
        this.createOrbit();
        this.createConsolePane('Saturn');
    }

    createRings() {
        // Calculate ring dimensions relative to planet size
        const innerRadius = this.radius * 1.2;
        const outerRadius = this.radius * 2.3;
        const thickness = this.radius * Saturn.ringThickness; // Calculate thickness based on planet radius

        // Create a group to hold all ring components
        this.rings = new THREE.Group();

        // Load ring texture
        const textureLoader = new THREE.TextureLoader();
        const ringTexture = textureLoader.load('images/saturn-ring-texture.png');

        // Create ring material with transparency
        const ringMaterial = new THREE.MeshBasicMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });

        // Create top ring (flat disc)
        const topRingGeometry = this.createRingGeometry(innerRadius, outerRadius, 64, 64);
        const topRing = new THREE.Mesh(topRingGeometry, ringMaterial);
        topRing.position.y = thickness / 2;
        this.rings.add(topRing);

        // Create bottom ring (flat disc)
        const bottomRingGeometry = this.createRingGeometry(innerRadius, outerRadius, 64, 64);
        const bottomRing = new THREE.Mesh(bottomRingGeometry, ringMaterial);
        bottomRing.position.y = -thickness / 2;
        this.rings.add(bottomRing);

        // Create outer edge of ring
        const outerEdgeGeometry = new THREE.CylinderGeometry(
            outerRadius, outerRadius, thickness, 64, 1, true
        );
        const outerEdge = new THREE.Mesh(outerEdgeGeometry, ringMaterial);
        // Align with the orbital plane - perpendicular to the radius from sun
        outerEdge.rotation.y = Math.PI / 2;
        this.rings.add(outerEdge);

        // Create inner edge of ring
        const innerEdgeGeometry = new THREE.CylinderGeometry(
            innerRadius, innerRadius, thickness, 64, 1, true
        );
        const innerEdge = new THREE.Mesh(innerEdgeGeometry, ringMaterial);
        // Align with the orbital plane - perpendicular to the radius from sun
        innerEdge.rotation.y = Math.PI / 2;
        this.rings.add(innerEdge);

        // Add rings to the planet group
        this.group.add(this.rings);
    }

    // Helper method to create a flat ring geometry
    createRingGeometry(innerRadius, outerRadius, thetaSegments, phiSegments) {
        // Create vertices for a custom ring
        const vertices = [];
        const indices = [];
        const uvs = [];
        const thetaStart = 0;
        const thetaLength = Math.PI * 2;

        // Generate vertices and UVs
        for (let i = 0; i <= phiSegments; i++) {
            const radius = innerRadius + ((outerRadius - innerRadius) * i / phiSegments);

            for (let j = 0; j <= thetaSegments; j++) {
                const segment = thetaStart + j / thetaSegments * thetaLength;

                // Vertex
                const x = radius * Math.cos(segment);
                const y = 0;
                const z = radius * Math.sin(segment);
                vertices.push(x, y, z);

                // UV - map texture radially
                // U goes from 0 to 1 along the radius (width of texture)
                // V goes from 0 to 1 around the ring (height of texture)
                const u = i / phiSegments;
                const v = j / thetaSegments;
                uvs.push(u, v);
            }
        }

        // Generate indices
        for (let i = 0; i < phiSegments; i++) {
            const thetaSegmentLevel = i * (thetaSegments + 1);

            for (let j = 0; j < thetaSegments; j++) {
                const segment = j + thetaSegmentLevel;

                const a = segment;
                const b = segment + thetaSegments + 1;
                const c = segment + thetaSegments + 2;
                const d = segment + 1;

                // Add two triangles
                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }

        // Create buffer geometry
        const ringGeometry = new THREE.BufferGeometry();
        ringGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        ringGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        ringGeometry.setIndex(indices);

        return ringGeometry;
    }

    // Override applyTilt to ensure rings tilt with the planet
    applyTilt() {
        super.applyTilt();
        // No additional rotation needed for rings as they're already in the equatorial plane
        // and will tilt with the planet group
    }

    // Add a method to toggle ring visibility
    toggleRings(visible) {
        if (this.rings) {
            this.rings.visible = visible;
            this.ringsVisible = visible;
        }
    }

    // Override createConsolePane to add ring toggle
    createConsolePane(planetName) {
        super.createConsolePane(planetName);
        this.addRingToggle();
    }

    // Add ring toggle to visibility section
    addRingToggle() {
        // Find the visibility section
        const sections = this.consoleContent.querySelectorAll('h4');
        let visibilitySection;

        for (const section of sections) {
            if (section.textContent === 'Visibility Controls') {
                visibilitySection = section;
                break;
            }
        }

        if (visibilitySection) {
            // Find the last toggle in the visibility section
            const lastToggle = visibilitySection.parentNode.querySelector('.switch:last-of-type');

            if (lastToggle) {
                const container = document.createElement('div');
                container.style.marginBottom = '10px';
                container.style.display = 'flex';
                container.style.justifyContent = 'space-between';
                container.style.alignItems = 'center';

                const labelElem = document.createElement('label');
                labelElem.textContent = 'Show Rings: ';

                // Create switch container
                const switchLabel = document.createElement('label');
                switchLabel.className = 'switch';

                const toggle = document.createElement('input');
                toggle.type = 'checkbox';
                toggle.checked = this.ringsVisible;
                toggle.id = 'saturn-rings-toggle';
                toggle.addEventListener('change', (e) => {
                    this.toggleRings(e.target.checked);
                });

                // Create slider span
                const sliderSpan = document.createElement('span');
                sliderSpan.className = 'slider';

                // Assemble the switch
                switchLabel.appendChild(toggle);
                switchLabel.appendChild(sliderSpan);

                container.appendChild(labelElem);
                container.appendChild(switchLabel);

                // Insert after the last toggle in the visibility section
                lastToggle.parentNode.after(container);
            }
        }
    }
}