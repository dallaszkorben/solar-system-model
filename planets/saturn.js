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
            // Saturn orbits in 10759.22 days vs Earth's 365.25 days (ratio ~29.46)
            // So Saturn should take 29.46x longer to orbit than Earth
            return 60 * (Saturn.factData.orbitalPeriod / Planet.earthData.orbitalPeriod);
        },
        get maxOrbitalPeriod() {
            // Maintain the same ratio for max speed
            return 6 * (Saturn.factData.orbitalPeriod / Planet.earthData.orbitalPeriod);
        },
        rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
        maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
        orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
        maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
    };

    constructor() {
        super(Saturn.factData, Saturn.nonScaleModelData, Saturn.scaleModelData, Saturn.scaleModelData);

        // Ring visibility property
        this.ringsVisible = true;
        this.rings = null;

        this.createSphere('textures/Saturn-texture.jpg');
        this.createAxis(0xffcc00); // Yellow-orange color for Saturn's axis
        this.createLatitudeCircles([
            { name: 'Equator', angle: 0, color: 0xff0000 },
            { name: 'North Tropic', angle: 26.73, color: 0xff8800 },
            { name: 'South Tropic', angle: -26.73, color: 0xff8800 }
        ]);
        this.createRings();
        this.applyTilt();
        this.createOrbit();
    }


//    createRings() {
//        // Calculate ring dimensions relative to planet size
//        const outerRadius = this.radius * 2.3;
//        const innerRadius = this.radius * 1.5;
//        const thickness = this.radius * Saturn.ringThickness;
//
//        // Create a group to hold all ring components
//        this.rings = new THREE.Group();
//
//        // Load ring texture
//        const textureLoader = new THREE.TextureLoader();
//        const ringTexture = textureLoader.load('textures/saturn-ring-texture.png');
//
//        // Create ring material with NO OWN LIGHT
//        const ringStandardMaterial = new THREE.MeshStandardMaterial({
//            map: ringTexture,
//            side: THREE.DoubleSide,
//            transparent: true,
//            opacity: 0.9
//        });
//
//        // Create ring material with LIGHT
//        const ringBasicMaterial = new THREE.MeshBasicMaterial({
//            map: ringTexture,
//            side: THREE.DoubleSide,
//            transparent: true,
//            opacity: 0.9
//        });
//
//        // Store materials for later use
//        this.ringStandardMaterial = ringStandardMaterial;
//        this.ringBasicMaterial = ringBasicMaterial;
//
//        // Create a single cylinder for the ring using CylinderGeometry
//        const ringGeometry = new THREE.CylinderGeometry(
//            outerRadius,    // radiusTop
//            outerRadius,    // radiusBottom
//            thickness,      // height
//            64,             // radialSegments
//            1,              // heightSegments
//            false           // openEnded
//        );
//
//        // Modify UVs to match the original radial mapping for all faces
//        const uvs = ringGeometry.attributes.uv;
//        const positionAttr = ringGeometry.attributes.position;
//
//        for (let i = 0; i < positionAttr.count; i++) {
//            const x = positionAttr.getX(i);
//            const z = positionAttr.getZ(i);
//            const y = positionAttr.getY(i);
//
//            // Calculate actual radius of this vertex
//            const vertexRadius = Math.sqrt(x * x + z * z);
//
//            // Map U from innerRadius to outerRadius (instead of 0 to outerRadius)
//            // This makes the texture start at innerRadius instead of center
//            const radius = (vertexRadius - innerRadius) / (outerRadius - innerRadius);
//            const angle = Math.atan2(z, x) / (Math.PI * 2);
//
//            // Set U based on normalized radius from inner to outer edge
//            // Set V based on angle around the cylinder (0 to 1)
//            uvs.setXY(i, Math.max(0, Math.min(1, radius)), angle < 0 ? angle + 1 : angle);
//        }
//
//        // Create the ring mesh
//        const ring = new THREE.Mesh(ringGeometry, ringStandardMaterial);
//
//        // Align with the orbital plane - perpendicular to the radius from sun
//        ring.rotation.y = Math.PI / 2;
//
//        this.rings.add(ring);
//
//        // Add rings to the planet group
//        this.group.add(this.rings);
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

    setRingMaterial(material) {
        this.ringMaterial = material;

        // Apply the material to all ring components
        if (this.rings) {
            this.rings.children.forEach(ringPart => {
                ringPart.material = material;
            });
        }
    }

    hasRing(){
        return true;
    }

    getRingBasicMaterial(){
        return this.ringBasicMaterial;
    }

    getRingStandardMaterial(){
        return this.ringStandardMaterial;
    }











}