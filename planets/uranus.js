/**
 * Uranus model creator
 */
class Uranus extends Planet {
    // Static data for Uranus
    static factData = {
        diameter: 50724.0, // km
        axialTilt: 97.77, // degrees - Uranus has an extreme axial tilt
        orbitRadius: 2876679082.0, // km (average distance from Sun)
        rotationPeriod: 17.24, // hours
        orbitalPeriod: 30688.5, // days
        ringInnerRadius: 38000, // km
        ringOuterRadius: 98000, // km
    };

    // Ring thickness configuration (not part of factual data)
    static ringThickness = 0.05; // Thickness as a fraction of planet radius

    static scaleModelData = {
        diameter: Uranus.factData.diameter/Planet.scaleDownDiameterFactor/3, // scaled diameter in the model
        orbitRadius: Uranus.factData.orbitRadius/Planet.scaleDownOrbitFactor + Planet.shiftOrbit, // scaled orbit radius
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Uranus.factData.rotationPeriod, Uranus.factData.orbitalPeriod);
            return 10 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Uranus.factData.rotationPeriod, Uranus.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Uranus.factData.rotationPeriod, Uranus.factData.orbitalPeriod);
            return 600 * relativePeriods.orbit;
        },
        get maxOrbitalPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Uranus.factData.rotationPeriod, Uranus.factData.orbitalPeriod);
            return 60 * relativePeriods.orbit;
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    static nonScaleModelData = {
        diameter: Uranus.factData.diameter/3, // visually appealing diameter
        orbitRadius: 500000, // visually appealing orbit radius
        get rotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Uranus.factData.rotationPeriod, Uranus.factData.orbitalPeriod);
            return 1 * relativePeriods.rotation;
        },
        get maxRotationPeriod() {
            const relativePeriods = Planet.calculateRelativePeriods(Uranus.factData.rotationPeriod, Uranus.factData.orbitalPeriod);
            return 0.1 * relativePeriods.rotation;
        },
        get orbitalPeriod() {
            // Uranus orbits in 30688.5 days vs Earth's 365.25 days (ratio ~84.02)
            // So Uranus should take 84.02x longer to orbit than Earth
            return 60 * (Uranus.factData.orbitalPeriod / Planet.earthData.orbitalPeriod);
        },
        get maxOrbitalPeriod() {
            // Maintain the same ratio for max speed
            return 6 * (Uranus.factData.orbitalPeriod / Planet.earthData.orbitalPeriod);
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    constructor() {
        super(Uranus.factData, Uranus.nonScaleModelData, Uranus.scaleModelData, Uranus.scaleModelData);

        // Ring visibility property
        this.ringsVisible = true;
        this.rings = null;

        this.createSphere('textures/Uranus-texture.jpg');
        this.createAxis(0x00ffcc); // Cyan-green color for Uranus's axis
        this.createLatitudeCircles([
            { name: 'Equator', angle: 0, color: 0xff0000 },
            { name: 'North Pole Region', angle: 60, color: 0x00aaff },
            { name: 'South Pole Region', angle: -60, color: 0x00aaff }
        ]);
        this.createRings();
        this.applyTilt();
        this.createOrbit();
    }

//    createRings() {
//        // Calculate ring dimensions relative to planet size
//        const innerRadius = this.radius * 1.2;
//        const outerRadius = this.radius * 1.8;
//        const thickness = this.radius * Uranus.ringThickness; // Calculate thickness based on planet radius
//
//        // Create a group to hold all ring components
//        this.rings = new THREE.Group();
//
//        // Load ring texture
//        const textureLoader = new THREE.TextureLoader();
//        const ringTexture = textureLoader.load('textures/uranus-ring-texture.png');
//
//        // Create ring material with transparency - always use basic material for rings
//        const ringMaterial = new THREE.MeshBasicMaterial({
//            map: ringTexture,
//            side: THREE.DoubleSide,
//            transparent: true,
//            opacity: 0.6
//        });
//
//        // Create top ring (flat disc)
//        const topRingGeometry = this.createRingGeometry(innerRadius, outerRadius, 64, 64);
//        const topRing = new THREE.Mesh(topRingGeometry, ringMaterial);
//        topRing.position.y = thickness / 2;
//        this.rings.add(topRing);
//
//        // Create bottom ring (flat disc)
//        const bottomRingGeometry = this.createRingGeometry(innerRadius, outerRadius, 64, 64);
//        const bottomRing = new THREE.Mesh(bottomRingGeometry, ringMaterial);
//        bottomRing.position.y = -thickness / 2;
//        this.rings.add(bottomRing);
//
//        // Create outer edge of ring
//        const outerEdgeGeometry = new THREE.CylinderGeometry(
//            outerRadius, outerRadius, thickness, 64, 1, true
//        );
//        const outerEdge = new THREE.Mesh(outerEdgeGeometry, ringMaterial);
//        // Align with the orbital plane - perpendicular to the radius from sun
//        outerEdge.rotation.y = Math.PI / 2;
//        this.rings.add(outerEdge);
//
//        // Create inner edge of ring
//        const innerEdgeGeometry = new THREE.CylinderGeometry(
//            innerRadius, innerRadius, thickness, 64, 1, true
//        );
//        const innerEdge = new THREE.Mesh(innerEdgeGeometry, ringMaterial);
//        // Align with the orbital plane - perpendicular to the radius from sun
//        innerEdge.rotation.y = Math.PI / 2;
//        this.rings.add(innerEdge);
//
//        // Add rings to the planet group
//        this.group.add(this.rings);
//    }
//
//    // Helper method to create a flat ring geometry
//    createRingGeometry(innerRadius, outerRadius, thetaSegments, phiSegments) {
//        // Create vertices for a custom ring
//        const vertices = [];
//        const indices = [];
//        const uvs = [];
//        const thetaStart = 0;
//        const thetaLength = Math.PI * 2;
//
//        // Generate vertices and UVs
//        for (let i = 0; i <= phiSegments; i++) {
//            const radius = innerRadius + ((outerRadius - innerRadius) * i / phiSegments);
//
//            for (let j = 0; j <= thetaSegments; j++) {
//                const segment = thetaStart + j / thetaSegments * thetaLength;
//
//                // Vertex
//                const x = radius * Math.cos(segment);
//                const y = 0;
//                const z = radius * Math.sin(segment);
//                vertices.push(x, y, z);
//
//                // UV - map texture radially
//                // U goes from 0 to 1 along the radius (width of texture)
//                // Right side (u=1) is closest to planet, left side (u=0) is farthest
//                const u = 1.0 - (i / phiSegments); // Reversed to match description
//                const v = j / thetaSegments;
//                uvs.push(u, v);
//            }
//        }
//
//        // Generate indices
//        for (let i = 0; i < phiSegments; i++) {
//            const thetaSegmentLevel = i * (thetaSegments + 1);
//
//            for (let j = 0; j < thetaSegments; j++) {
//                const segment = j + thetaSegmentLevel;
//
//                const a = segment;
//                const b = segment + thetaSegments + 1;
//                const c = segment + thetaSegments + 2;
//                const d = segment + 1;
//
//                // Add two triangles
//                indices.push(a, b, d);
//                indices.push(b, c, d);
//            }
//        }
//
//        // Create buffer geometry
//        const ringGeometry = new THREE.BufferGeometry();
//        ringGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
//        ringGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
//        ringGeometry.setIndex(indices);
//
//        return ringGeometry;
//    }

    // Override applyTilt to ensure rings tilt with the planet
    applyTilt() {
        super.applyTilt();
        // No additional rotation needed for rings as they're already in the equatorial plane
        // and will tilt with the planet group
    }

//    // Add a method to toggle ring visibility
//    toggleRings(visible) {
//        if (this.rings) {
//            this.rings.visible = visible;
//            this.ringsVisible = visible;
//        }
//    }
}