/**
 * Base Planet class for all planets in the solar system
 */
class Planet {

    static ID   = 'planet';
    static NAME = 'Planet';

    // Correct orbit scale
    static scaleDownDiameterFactor = 20;
    static scaleDownOrbitFactor = 2000;
    static shiftOrbit = 10000;

    // Default empty location data
    static locationData = [];

    static maxOrbitFactor = 10.0;
    static maxRotationFactor = 10.0;

    static orbitOpacity = 0.3;

    // Earth reference data for relative calculations
    static referenceData = {
        rotationPeriod: 23.93,      // hours
        orbitalPeriod: 365.25,      // days
        diameter: 12742.0,          // km
        axialTilt: 23.93,           // degrees
        orbitRadius: 149600000.0,   // km (average distance from Sun)
    };

    // Calculate relative periods based on Earth as reference
    static calculateRelativePeriods(rotationPeriod, orbitalPeriod) {
        // Calculate planet-to-Earth ratios
        const rotationRatio = rotationPeriod / Planet.referenceData.rotationPeriod;
        const orbitalRatio = orbitalPeriod / Planet.referenceData.orbitalPeriod;

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

        this.name = Planet.NAME;
        this.id   = Planet.ID;

        // Location markers
        this.locationMarkers = [];

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
        this.defaultRotationSpeed = noScaleModeData.rotationSpeed(); // Store default rotation speed
        this.globalRotationSpeedFactor = 1.0; // Default factor (50% on slider)

        // Orbit properties
        this.actualOrbitRadius = factData.orbitRadius; // Real distance in km
        this.orbitRadius = noScaleModeData.orbitRadius; // Non-scaled for visual appeal
        this.orbitalPeriod = noScaleModeData.orbitalPeriod; // Time to complete one orbit in seconds
        this.maxOrbitalPeriod = noScaleModeData.maxOrbitalPeriod; // Time at maximum speed
        this.orbitEnabled = false; // Disabled by default
        this.orbitSpeed = noScaleModeData.orbitSpeed(); // Initial orbit speed
        this.maxOrbitSpeed = noScaleModeData.maxOrbitSpeed(); // Maximum orbit speed
        this.defaultOrbitSpeed = noScaleModeData.orbitSpeed(); // Store default orbit speed
        this.globalOrbitSpeedFactor = 1.0; // Default factor (50% on slider)
        this.orbitGroup = new THREE.Group(); // Parent group for orbital motion
        this.sideMarkerGroup = new THREE.Group(); // Separate group for side marker that doesn't counter-rotate

        // Visibility property
        this.visible = true; // Visible by default
        this.orbitOpacity = Planet.orbitOpacity; // Default orbit line opacity
        this.dayNightEffectEnabled = true; // Default to enabled

        // Side marker properties
        this.sideMarker = null;
        this.sideMarkerVisible = false;
        this.sideMarkerDistanceFactor = 3; // Default: 2x the planet diameter
        this.sideMarkerSizeFactor = 0.1;     // Default: 1/10 of the planet diameter

        // Add the group to the orbit group
        this.orbitGroup.add(this.group);

        // Add the side marker group to the orbit group
        this.orbitGroup.add(this.sideMarkerGroup);
    }

    createSphere(texturePath) {
            console.log(`Creating sphere with texture: ${texturePath}`);
            const geometry = new THREE.SphereGeometry(this.radius, 256, 256);
            const textureLoader = new THREE.TextureLoader();

            // Add error handling for texture loading
            const texture = textureLoader.load(
                texturePath,
                // onLoad callback
                function(loadedTexture) {
                    console.log(`Texture loaded successfully: ${texturePath}`);
                },
                // onProgress callback (not supported by most browsers)
                undefined,
                // onError callback
                function(err) {
                    console.error(`Error loading texture: ${texturePath}`, err);
                    // Create a fallback colored material
                    if (this.sphere && this.sphere.material) {
                        const fallbackColor = 0xffffff; // White fallback color
                        this.sphere.material.map = null;
                        this.sphere.material.color.set(fallbackColor);
                        this.sphere.material.needsUpdate = true;
                    }
                }.bind(this) // Bind this to access sphere in the callback
            );

            // Create material day/night effect - Without Light
            const standardMaterial = new THREE.MeshStandardMaterial({
                map: texture,
                metalness: 0.1,
                roughness: 0.9

            });

            // With light
            const basicMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                metalness: 0.0,
                roughness: 0.9,
                emissiveIntensity: 0.9,
                emissive: 0x999999,
                color: 0xbbbbbb

            });

            // Use the appropriate material based on day/night effect setting
            const material = this.dayNightEffectEnabled ? standardMaterial : basicMaterial;
            this.setRingMaterial(this.getRingBasicMaterial());

            this.sphere = new THREE.Mesh(geometry, material);

            this.group.add(this.sphere);

            // Store both materials for later switching
            this.standardMaterial = standardMaterial;
            this.basicMaterial = basicMaterial;

            console.log(`Sphere created for texture: ${texturePath}`);

    }

    updateSphere(){
        if (this.sphere) {
            const newGeometry = new THREE.SphereGeometry(this.radius, 64, 32);
            this.sphere.geometry.dispose();
            this.sphere.geometry = newGeometry;
        }
    }

    createAxis(color = 0xff0000) {
        const axisLength = this.diameter * 1.2;
        const cylinderRadius = this.diameter / 100;
        const cylinderGeometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, axisLength, 16);
        const cylinderMaterial = new THREE.MeshBasicMaterial({
            color: color,
            depthTest: true,
        });
        this.axis = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        this.axis.renderOrder = 1;
        this.group.add(this.axis);
    }

    updateAxis() {

        // Store current visibility state
        const wasVisible = this.axis ? this.axis.visible : false;

        // Remove existing axis
        if (this.axis) {
            this.group.remove(this.axis);
        }

        // Create new axis with current diameter
        this.createAxis();

        // Restore visibility state
        if (this.axis) {
            this.axis.visible = wasVisible;
        }
    }






















    createLatitudeCircles(latitudes) {
        const segments = 64;
        this.latitudeCircles = new THREE.Group(); // Group for latitude circles

        // Base tube radius for equator (widthScale = 1.0) - doubled for more visibility
        const baseRadius = 0.004 * this.radius;

        latitudes.forEach(latitude => {
            const phi = THREE.MathUtils.degToRad(latitude.angle);
            const latRadius = this.radius * Math.cos(phi);
            const y = this.radius * Math.sin(phi);

            // Default width scale to 1.0 if not specified
            const widthScale = latitude.widthScale || 1.0;

            // Create a tube geometry for thicker lines
            const tubeRadius = baseRadius * widthScale;
            const tubeSegments = 8;

            // Create a circle curve
            const curve = new THREE.EllipseCurve(
                0, 0,             // center
                latRadius, latRadius, // xRadius, yRadius
                0, 2 * Math.PI,   // startAngle, endAngle
                false,            // clockwise
                0                 // rotation
            );

            // Get points from the curve
            const points = curve.getPoints(segments);

            // Convert 2D points to 3D
            const path = new THREE.CatmullRomCurve3(
                points.map(point => new THREE.Vector3(point.x, y, point.y))
            );

            // Create tube geometry
            const geometry = new THREE.TubeGeometry(
                path,
                segments,
                tubeRadius,
                tubeSegments,
                true
            );

            // Create material
            const material = new THREE.MeshBasicMaterial({
                color: latitude.color,
                transparent: true,
                opacity: 0.8
            });

            // Create mesh
            const circle = new THREE.Mesh(geometry, material);
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
            opacity: this.orbitOpacity, // Use the orbit opacity property
            depthTest: true,
            depthWrite: false
        });

        this.orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
        this.orbitLine.renderOrder = 1;

        this.group.position.x = this.orbitRadius;
        this.orbitGroup.add(this.orbitLine);
    }

    applyTilt() {
        this.group.rotation.x = THREE.MathUtils.degToRad(this.axialTilt.x);
        this.group.rotation.y = THREE.MathUtils.degToRad(this.axialTilt.y);
        this.group.rotation.z = THREE.MathUtils.degToRad(this.axialTilt.z);

    }

    /**
     * Updates the planet's rotation based on time
     * @param {number} now - Current timestamp
     */
    update(now) {
        // Handle rotation if enabled
        if (this.rotationEnabled && this.rotationSpeed > 0) {
            // Apply rotation based on current rotation speed
            this.sphere.rotation.y += this.rotationSpeed;
        }

        // Handle orbit if enabled
        if (this.orbitEnabled && this.orbitSpeed > 0) {
            // Apply orbit based on current orbit speed
            this.orbitGroup.rotation.y += this.orbitSpeed;
        }
    }

    /**
     * Sets the rotation enabled state
     * @param {boolean} enabled - Whether rotation should be enabled
     */
    setRotationEnabled(enabled) {
        this.rotationEnabled = enabled;
    }

    /**
     * Sets the global rotation speed factor (0-10)
     * @param {number} factor - Factor to multiply the default rotation speed by
     */
    setGlobalRotationSpeedFactor(factor) {
        this.globalRotationSpeedFactor = factor;

        // Update the rotation speed based on the current scale mode and factor
        if (factor === 0) {
            // If factor is 0, stop rotation
            this.rotationSpeed = 0;
        } else {
            // Otherwise, calculate new rotation speed based on default and factor
            this.rotationSpeed = this.defaultRotationSpeed * factor;
        }
    }

    /**
     * Sets the global orbit speed factor (0-10)
     * @param {number} factor - Factor to multiply the default orbit speed by
     */
    setGlobalOrbitSpeedFactor(factor) {
        this.globalOrbitSpeedFactor = factor;

        // Update the orbit speed based on the current scale mode and factor
        if (factor === 0) {
            // If factor is 0, stop orbit
            this.orbitSpeed = 0;
        } else {
            // Otherwise, calculate new orbit speed based on default and factor
            this.orbitSpeed = this.defaultOrbitSpeed * factor;
        }
    }

    /**
     * Sets the orbit enabled state
     * @param {boolean} enabled - Whether orbit should be enabled
     */
    setOrbitEnabled(enabled) {
        this.orbitEnabled = enabled;
    }

    /**
     * Sets the visibility of the planet
     * @param {boolean} visible - Whether the planet should be visible
     */

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

        // Update side marker camera position if active
        if (this.sideMarker && this.sideMarker.cameraView) {
            this.sideMarker.updateCameraPosition();
        }
    }

    /**
     * Show the planet by making all its components visible
     */
    show() {
        this.visible = true;
        if (this.sphere) {
            this.sphere.visible = true;
        }
        if (this.axis) {
            this.axis.visible = this.axis.wasVisible || false;
        }
        if (this.latitudeCircles) {
            this.latitudeCircles.visible = this.latitudeCircles.wasVisible || false;
        }
        if (this.orbitLine) {
            this.orbitLine.visible = this.orbitLine.wasVisible || false;
        }
        if (this.seasonLabels) {
            this.seasonLabels.visible = this.seasonLabels.wasVisible || false;
        }
        // Show rings if this planet has them
        if (this.rings) {
            this.rings.visible = true;
            this.ringsVisible = true;
        }
    }

    /**
     * Hide the planet by making all its components invisible
     */
    hide() {
        this.visible = false;
        if (this.sphere) {
            this.sphere.visible = false;
        }
        if (this.axis) {
            this.axis.wasVisible = this.axis.visible;
            this.axis.visible = false;
        }
        if (this.latitudeCircles) {
            // Store current visibility state before hiding
            this.latitudeCircles.wasVisible = this.latitudeCircles.visible;
            this.latitudeCircles.visible = false;
        }
        if (this.orbitLine) {
            this.orbitLine.wasVisible = this.orbitLine.visible;
            this.orbitLine.visible = false;
        }
        if (this.seasonLabels) {
            // Store current visibility state before hiding
            this.seasonLabels.wasVisible = this.seasonLabels.visible;
            this.seasonLabels.visible = false;
        }
        // Hide rings if this planet has them
        if (this.rings) {
            this.rings.visible = false;
            this.ringsVisible = false;
        }
    }

    /**
     * Set the visibility of the planet
     * @param {boolean} isVisible - Whether the planet should be visible
     */
    setVisibility(isVisible) {
        if (isVisible) {
            this.show();
        } else {
            this.hide();
        }
    }

    /**
     * Sets whether the day/night effect is enabled for this planet
     * @param {boolean} enabled - Whether day/night effect should be enabled
     */
    setDayNightEffectEnabled(enabled) {
        this.dayNightEffectEnabled = enabled;

        // If the planet has a material that supports day/night effect
        if (this.sphere && this.sphere.material) {
            if (enabled) {
                // Switch to standard material with lighting
                if (this.standardMaterial) {
                    this.sphere.material = this.standardMaterial;

                    if (this.hasRing()){
                        this.setRingMaterial(this.getRingStandardMaterial());
                    }

                }
            } else {
                // Switch to basic material without lighting
                if (this.basicMaterial) {
                    this.sphere.material = this.basicMaterial;

                    if (this.hasRing()){
                        this.setRingMaterial(this.getRingBasicMaterial());
                    }

                }
            }
            this.sphere.material.needsUpdate = true;
        }
    }

    /**
     * Toggle day/night effect (for backward compatibility)
     * @param {boolean} enabled - Whether day/night effect should be enabled
     */
    toggleDayNightEffect(enabled) {
        this.setDayNightEffectEnabled(enabled);
    }

    getObject() {
        return this.orbitGroup;
    }

    /**
     * Create a side marker for the planet
     */
    createSideMarker() {
        this.sideMarker = new SideMarker(this);
        this.setSideMarkerVisible(this.sideMarkerVisible);
        this.setSideMarkerDistance(this.sideMarkerDistanceFactor);
        this.setSideMarkerSize(this.sideMarkerSizeFactor);
    }

    /**
     * Set the side marker's visibility
     * @param {boolean} visible - Whether the side marker should be visible
     */
    setSideMarkerVisible(visible) {
        this.sideMarkerVisible = visible;

        if (!this.sideMarker && visible) {
            this.createSideMarker();
            return;
        }

        if (this.sideMarker) {
            this.sideMarker.setVisible(visible);
        }
    }

    /**
     * Set the side marker's distance from the planet
     * @param {number} distanceFactor - Distance as a factor of the planet's diameter
     */
    setSideMarkerDistance(distanceFactor) {
        this.sideMarkerDistanceFactor = distanceFactor;

        if (this.sideMarker) {
            this.sideMarker.setMarkerDistance(distanceFactor);
        }
    }

    /**
     * Set the side marker's size
     * @param {number} sizeFactor - Size as a factor of the planet's diameter
     */
    setSideMarkerSize(sizeFactor) {
        this.sideMarkerSizeFactor = sizeFactor;

        if (this.sideMarker) {
            this.sideMarker.setMarkerSize(sizeFactor);
        }
    }

    /**
     * Set whether the camera should view from the side marker
     * @param {boolean} enabled - Whether to enable camera view from the side marker
     */
    setSideMarkerCameraView(enabled) {
        if (!this.sideMarker && enabled) {
            this.createSideMarker();
        }

        if (this.sideMarker) {
            this.sideMarker.setCameraView(enabled);

            // Force immediate camera update
            if (enabled && this.solarSystem && this.solarSystem.camera) {
                this.sideMarker.updateCameraPosition();
            }
        }
    }

    /**
     * Get the world position of the side marker
     * @returns {THREE.Vector3} The side marker's position in world coordinates
     */
    getSideMarkerWorldPosition() {
        if (this.sideMarker) {
            return this.sideMarker.getWorldPosition();
        }
        return new THREE.Vector3();
    }

    // Helper method to make elements draggable - moved from individual planet classes
    makeDraggableElement(element, handle) {
        if (!element || !handle) return;

        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        handle.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // Get the mouse cursor position at startup
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // Call a function whenever the cursor moves
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // Calculate the new cursor position
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // Set the element's new position
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            // Stop moving when mouse button is released
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    createRings() {
        if (!this.factData.ringInnerRadius || !this.factData.ringOuterRadius) {
            return; // Skip if planet doesn't have ring data
        }

        // Calculate ring dimensions based on factData
        const planetRadius = this.factData.diameter / 2;
        const innerRadiusFactor = this.factData.ringInnerRadius / planetRadius;
        const outerRadiusFactor = this.factData.ringOuterRadius / planetRadius;

        const innerRadius = this.radius * innerRadiusFactor;
        const outerRadius = this.radius * outerRadiusFactor;
        const thickness = this.radius * 0.05; // Default thickness factor

        // Create a group to hold all ring components
        this.rings = new THREE.Group();

        // Load ring texture
        const textureLoader = new THREE.TextureLoader();
        const ringTexture = textureLoader.load(`textures/${this.constructor.name.toLowerCase()}-ring-texture.png`);

        // Create ring materials - with NO OWN LIGHT
        const ringStandardMaterial = new THREE.MeshStandardMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1.0

        });
        // Create ring materials - with LIGHT
        const ringBasicMaterial = new THREE.MeshBasicMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });

        // Store materials for later use
        this.ringStandardMaterial = ringStandardMaterial;
        this.ringBasicMaterial = ringBasicMaterial;

        // Create a cylinder for the ring
        const ringGeometry = new THREE.CylinderGeometry(
            outerRadius,    // radiusTop
            outerRadius,    // radiusBottom
            thickness,      // height
            64,             // radialSegments
            1,              // heightSegments
            false           // openEnded
        );

        // Modify UVs to map texture from inner to outer radius
        const uvs = ringGeometry.attributes.uv;
        const positionAttr = ringGeometry.attributes.position;

        for (let i = 0; i < positionAttr.count; i++) {
            const x = positionAttr.getX(i);
            const z = positionAttr.getZ(i);

            // Calculate actual radius of this vertex
            const vertexRadius = Math.sqrt(x * x + z * z);

            // Map U from innerRadius to outerRadius
            const radius = (vertexRadius - innerRadius) / (outerRadius - innerRadius);
            const angle = Math.atan2(z, x) / (Math.PI * 2);

            // Set U based on normalized radius from inner to outer edge
            // Set V based on angle around the cylinder
            uvs.setXY(i, Math.max(0, Math.min(1, radius)), angle < 0 ? angle + 1 : angle);
        }

        // Create the ring mesh
        const ring = new THREE.Mesh(ringGeometry, ringStandardMaterial);

        // Align with the orbital plane
        ring.rotation.y = Math.PI / 2;

        this.rings.add(ring);

        // Add rings to the planet group
        this.group.add(this.rings);

        // Set ring visibility property
        this.ringsVisible = true;
    }

    updateRings() {

        // Only proceed if the planet has rings
        if (!this.hasRing()) {
            return;
        }

        // Store current visibility state
        const wasVisible = this.rings ? this.rings.visible : false;

        // Remove existing rings
        if (this.rings) {
            this.group.remove(this.rings);
        }

        // Create new rings with current planet size
        this.createRings();

        // Restore visibility state
        if (this.rings) {
            this.rings.visible = wasVisible;
        }
    }

    // Add this method to the Planet class
    hasRing() {
        return !!this.factData.ringInnerRadius && !!this.factData.ringOuterRadius;
    }

    // Add this method to the Planet class
    toggleRings(visible) {
        if (this.rings) {
            this.rings.visible = visible;
            this.ringsVisible = visible;
        }
    }

    hasRing(){
        return false;
    }

    getRingBasicMaterial(){
        return null;
    }

    getRingStandardMaterial(){
        return null;
    }

    setRingMaterial(material){
        return null;
    }

    // Default methods for location markers
    createLocationMarkers() {
        // To be implemented by subclasses if they have location data
    }

    setLocationMarkersVisible(visible) {
        if (this.locationMarkers) {
            this.locationMarkers.forEach(marker => marker.setVisible(visible));
        }
    }

    /**
     * Updates location markers to match the current planet size
     */
    updateLocationMarkers() {
        // Only proceed if the planet has location markers
        if (!this.locationMarkers || this.locationMarkers.length === 0) {
            return;
        }

        // Update each marker
        this.locationMarkers.forEach(marker => {
            marker.updateMarker();
        });
    }

}