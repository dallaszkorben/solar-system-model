/**
 * Base Planet class for all planets in the solar system
 */
class Planet {
    // Correct orbit scale
    static scaleDownDiameterFactor = 1;
    static scaleDownOrbitFactor = 1000;
    static shiftOrbit = 0;

    // Earth reference data for relative calculations
    static earthData = {
        rotationPeriod: 23.93, // hours
        orbitalPeriod: 365.25, // days
    };

    // Calculate relative periods based on Earth as reference
    static calculateRelativePeriods(rotationPeriod, orbitalPeriod) {
        // Calculate planet-to-Earth ratios
        const rotationRatio = rotationPeriod / this.earthData.rotationPeriod;
        const orbitalRatio = orbitalPeriod / this.earthData.orbitalPeriod;

        return {
            rotation: rotationRatio,
            orbit: orbitalRatio
        };
    }

    constructor(factData, noScaleModeData, sizeScaleModeData, distanceScaleModeData) {

        // Store reference data
        this.factData = factData;
        this.noScaleModeData = noScaleModeData;
        this.sizeScaleModeData = sizeScaleModeData;
        this.distanceScaleModeData = distanceScaleModeData;

        // Use no-scale mode data by default
        this.diameter = noScaleModeData.diameter;
        this.radius = this.diameter / 2;
        this.axialTilt = factData.axialTilt; // degrees
        this.group = new THREE.Group();

        // Rotation properties
        this.rotationEnabled = false; // Disabled by default
        this.rotationPeriod = noScaleModeData.rotationPeriod; // Time to complete one rotation in seconds
        this.maxRotationPeriod = noScaleModeData.maxRotationPeriod; // Time at maximum speed
        this.rotationSpeed = noScaleModeData.rotationSpeed(); // Initial rotation speed
        this.maxRotationSpeed = noScaleModeData.maxRotationSpeed(); // Maximum rotation speed

        // Orbit properties
        this.actualOrbitRadius = factData.orbitRadius; // Real distance in km
        this.orbitRadius = noScaleModeData.orbitRadius; // Non-scaled for visual appeal
        this.orbitalPeriod = noScaleModeData.orbitalPeriod; // Time to complete one orbit in seconds
        this.maxOrbitalPeriod = noScaleModeData.maxOrbitalPeriod; // Time at maximum speed
        this.orbitEnabled = false; // Disabled by default
        this.orbitSpeed = noScaleModeData.orbitSpeed(); // Initial orbit speed
        this.maxOrbitSpeed = noScaleModeData.maxOrbitSpeed(); // Maximum orbit speed
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

    createAxis(color = 0xff0000) {
        const axisLength = this.diameter * 1.1;
        const cylinderRadius = 100;
        const cylinderGeometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, axisLength, 16);
        const cylinderMaterial = new THREE.MeshBasicMaterial({
            color: color,
            depthTest: true,
            depthWrite: false
        });
        this.axis = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        this.axis.renderOrder = 1;
        this.group.add(this.axis);
    }

    createLatitudeCircles(latitudes) {
        const segments = 64;
        this.latitudeCircles = new THREE.Group(); // Group for latitude circles

        latitudes.forEach(latitude => {
            const phi = THREE.MathUtils.degToRad(latitude.angle);
            const latRadius = this.radius * Math.cos(phi);
            const y = this.radius * Math.sin(phi);
            const vertices = [];

            for (let i = 0; i <= segments; i++) {
                const theta = (i / segments) * Math.PI * 2;
                const x = latRadius * Math.cos(theta);
                const z = latRadius * Math.sin(theta);
                vertices.push(x, y, z);
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            const material = new THREE.LineBasicMaterial({ color: latitude.color, linewidth: 2 });
            const circle = new THREE.Line(geometry, material);
            this.latitudeCircles.add(circle);
        });

        this.group.add(this.latitudeCircles);
        this.latitudeCircles.visible = false; // Hide by default
    }

    createOrbit() {
        const segments = 128;
        const orbitGeometry = new THREE.BufferGeometry();
        const vertices = [];

        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const x = this.orbitRadius * Math.cos(theta);
            const z = this.orbitRadius * Math.sin(theta);
            vertices.push(x, 0, z);
        }

        orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        const orbitMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1.0,
            depthTest: true,
            depthWrite: false
        });

        this.orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
        this.orbitLine.renderOrder = 1;

        this.group.position.x = this.orbitRadius;
        this.orbitGroup.add(this.orbitLine);
    }

    applyTilt() {
        this.group.rotation.z = THREE.MathUtils.degToRad(this.axialTilt);
    }

    createSeasonLabels(seasons) {
        if (!seasons || !seasons.length) return;

        this.seasonLabels = new THREE.Group();

        seasons.forEach(season => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 256;

            if (season.name) {
                ctx.font = 'Bold 120px Arial';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.fillText(season.name, 128, 120);
            }

            ctx.font = '40px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText(`(${season.season})`, 128, season.name ? 180 : 128);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);

            const x = this.orbitRadius * Math.cos(season.angle);
            const z = this.orbitRadius * Math.sin(season.angle);
            sprite.position.set(x, this.radius * 3, z);
            sprite.scale.set(this.radius * 5, this.radius * 5, 1);

            this.seasonLabels.add(sprite);
        });

        this.orbitGroup.add(this.seasonLabels);
        this.seasonLabels.visible = false; // Hide season labels by default
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