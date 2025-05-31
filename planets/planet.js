/**
 * Base Planet class for all planets in the solar system
 */
class Planet {
    constructor(factData, nonScaleModelData, scaleModelData) {
        // Store reference data
        this.factData = factData;
        this.nonScaleModelData = nonScaleModelData;
        this.scaleModelData = scaleModelData;

        // Use non-scale model data by default
        this.diameter = nonScaleModelData.diameter;
        this.radius = this.diameter / 2;
        this.axialTilt = factData.axialTilt; // degrees
        this.group = new THREE.Group();
        
        // Rotation properties
        this.rotationEnabled = false; // Disabled by default
        this.rotationPeriod = nonScaleModelData.rotationPeriod; // Time to complete one rotation in seconds
        this.maxRotationPeriod = nonScaleModelData.maxRotationPeriod; // Time at maximum speed
        this.rotationSpeed = nonScaleModelData.rotationSpeed(); // Initial rotation speed
        this.maxRotationSpeed = nonScaleModelData.maxRotationSpeed(); // Maximum rotation speed

        // Orbit properties
        this.actualOrbitRadius = factData.orbitRadius; // Real distance in km
        this.orbitRadius = nonScaleModelData.orbitRadius; // Non-scaled for visual appeal
        this.orbitalPeriod = nonScaleModelData.orbitalPeriod; // Time to complete one orbit in seconds
        this.maxOrbitalPeriod = nonScaleModelData.maxOrbitalPeriod; // Time at maximum speed
        this.orbitEnabled = false; // Disabled by default
        this.orbitSpeed = nonScaleModelData.orbitSpeed(); // Initial orbit speed
        this.maxOrbitSpeed = nonScaleModelData.maxOrbitSpeed(); // Maximum orbit speed
        this.orbitGroup = new THREE.Group(); // Parent group for orbital motion
        
        // Add the group to the orbit group
        this.orbitGroup.add(this.group);
    }

    createSphere(texturePath) {
        const geometry = new THREE.SphereGeometry(this.radius, 64, 32);
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(texturePath);

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 1.0,
            metalness: 0.0
        });

        this.sphere = new THREE.Mesh(geometry, material);
        this.group.add(this.sphere);

        this.standardMaterial = material;
        this.basicMaterial = new THREE.MeshBasicMaterial({
            map: texture
        });
    }

    applyTilt() {
        this.group.rotation.z = THREE.MathUtils.degToRad(this.axialTilt);
    }

    update(time) {
        // Rotate the sphere around its axis if rotation is enabled
        if (this.rotationEnabled && this.rotationSpeed > 0) {
            this.sphere.rotation.y += this.rotationSpeed;
        }

        // Orbit around the Sun if orbit is enabled
        if (this.orbitEnabled && this.orbitSpeed > 0) {
            const previousOrbitAngle = this.orbitGroup.rotation.y;
            this.orbitGroup.rotation.y += this.orbitSpeed;
            const deltaAngle = this.orbitGroup.rotation.y - previousOrbitAngle;
            this.group.rotation.y -= deltaAngle;
        }
    }

    getObject() {
        return this.orbitGroup;
    }
}