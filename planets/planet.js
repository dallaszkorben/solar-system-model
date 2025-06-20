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
    static orbitSegments = 128; // Default segment count for orbit lines

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

    constructor(solarSystem, factData, noScaleModeData, sizeScaleModeData, distanceScaleModeData, fullScaleModeData) {

        // Store reference data
        this.solarSystem = solarSystem;
        this.scene = solarSystem.scene;
        this.factData = factData;
        this.noScaleModeData = noScaleModeData;
        this.sizeScaleModeData = sizeScaleModeData;
        this.distanceScaleModeData = distanceScaleModeData;
        this.fullScaleModeData = fullScaleModeData;

        this.name = Planet.NAME;
        this.id   = Planet.ID;

        this.axis = null;
        this.sideViewMarker = null;

        // Solar radial line properties
        this.solarRadialLine = null;
        this.solarRadialLineVisible = false;
        this.solarRadialLineWidth = 3;

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

        // Visibility property
        this.visible = true; // Visible by default
        this.orbitOpacity = Planet.orbitOpacity; // Default orbit line opacity
        this.dayNightEffectEnabled = true; // Default to enabled

        // Add the group to the orbit group
        this.orbitGroup.add(this.group);

        // Create orbit position markers
        this.orbitPositionMarkerList = [
            { name: 'aphelion',   description: 'farthest', angle: 0,           color: 0xffffff},    //Farthest from the Sun
            { name: 'perihelion', description: 'closest',  angle: Math.PI,     color: 0xffffff},    //Closest to the Sun
            { name: '',           description: '',         angle: Math.PI/2,   color: 0xffffff},
            { name: '',           description: '',         angle: Math.PI*3/2, color: 0xffffff}
        ];

//        this.createOrbitPositionMarkers(this.orbitPositionMarkerList);
//        // Set initial visibility based on PlanetControlPanel default
//        this.setOrbitPositionMarkersVisibility(PlanetControlPanel.defaultOrbitPositionMarkersVisibility);
    }

    // --------------
    // --- Sphere ---
    // --------------

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

    // ------------
    // --- Axis ---
    // ------------

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

    setRotationEnabled(enabled) {
        this.rotationEnabled = enabled;
    }

    applyTilt() {
        this.group.rotation.x = THREE.MathUtils.degToRad(this.axialTilt.x);
        this.group.rotation.y = THREE.MathUtils.degToRad(this.axialTilt.y);
        this.group.rotation.z = THREE.MathUtils.degToRad(this.axialTilt.z);
    }

    // ------------------------
    // --- Latitude Circles ---
    // ------------------------

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

    updateLatitudeCircles() {
        // Only proceed if the planet has latitude circles
        if (!this.latitudeCircles) {
            return;
        }

        // Store current visibility state
        const wasVisible = this.latitudeCircles.visible;

        // Remove existing latitude circles
        this.group.remove(this.latitudeCircles);

        // Create new latitude circles with current radius
        this.createLatitudeCircles(this.getLatitudeCircleList());

        // Restore visibility state
        if (this.latitudeCircles) {
            this.latitudeCircles.visible = wasVisible;
        }
    }

    // ---------------------
    // --- Local Markers ---
    // ---------------------

    setLocalMarkersVisible(visible) {
        if (this.locationMarkers) {
            this.locationMarkers.forEach(marker => marker.setVisible(visible));
        }
    }

    // Default methods for location markers
    createLocationMarkers() {
        // To be implemented by subclasses if they have location data
    }

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

    // ------------------------
    // --- Side View Marker ---
    // ------------------------

    createSideViewMarker() {
        this.sideViewMarker = new SideViewMarkers(this);
    }

    setSideViewMarkerVisible(visible){
        if(this.sideViewMarker){
            this.sideViewMarker.setVisible(visible);
        }
    }

    // -------------
    // --- Orbit ---
    // -------------

    createOrbit() {
        // Use the static segment count for orbit lines
        const segments = Planet.orbitSegments;

        // Create a line segments geometry (more robust for large distances)
        const orbitGeometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];

        // Create vertices for the orbit circle
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const x = this.orbitRadius * Math.cos(theta);
            const z = this.orbitRadius * Math.sin(theta);
            vertices.push(x, 0, z);

            // Create line segments (connect each point to the next)
            if (i < segments) {
                indices.push(i, i + 1);
            }
        }

        // Connect the last point to the first to close the circle
        indices.push(segments, 0);

        // Set attributes
        orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        orbitGeometry.setIndex(indices);

        // Create material with special properties for visibility at large distances
        const orbitMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: this.orbitOpacity,
            depthTest: true,
            depthWrite: false
        });

        // Use LineSegments for better performance with large numbers of segments
        this.orbitLine = new THREE.LineSegments(orbitGeometry, orbitMaterial);
        this.orbitLine.frustumCulled = false; // Disable frustum culling
        this.orbitLine.renderOrder = -10; // Render before other objects

        this.group.position.x = this.orbitRadius;
        this.orbitGroup.add(this.orbitLine);
    }

    updateOrbit() {
        // Only proceed if the planet has an orbit line
        if (!this.orbitLine) {
            return;
        }

        // Use the static segment count for orbit lines
        const segments = Planet.orbitSegments;
        const vertices = [];
        const indices = [];

        // Create vertices for the orbit circle
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const x = this.orbitRadius * Math.cos(theta);
            const z = this.orbitRadius * Math.sin(theta);
            vertices.push(x, 0, z);

            // Create line segments (connect each point to the next)
            if (i < segments) {
                indices.push(i, i + 1);
            }
        }

        // Connect the last point to the first to close the circle
        indices.push(segments, 0);

        // Update orbit line geometry
        this.orbitLine.geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(vertices, 3)
        );

        // Update indices
        this.orbitLine.geometry.setIndex(indices);

        // Update object position
        this.group.position.x = this.orbitRadius;
    }

    setOrbitEnabled(enabled) {
        this.orbitEnabled = enabled;
    }

    // ---------------------
    // --- Orbit Markers ---
    // ---------------------

    createOrbitPositionMarkers() {
        const positions = this.getOrbitPositionMarkerList();

        if (!positions || !positions.length) return;

        // Clear existing markers array if it exists
        this.orbitMarkers = [];

        // Create markers using the OrbitMarker class
        positions.forEach(position => {
            const marker = new OrbitPositionMarker(
                this,
                position.name,
                position.description,
                position.angle,
                position.color || 0xffffff
            );
            this.orbitMarkers.push(marker);
        });

        // Set the default value
        this.setOrbitPositionMarkersVisibility(PlanetControlPanel.defaultOrbitPositionMarkersVisibility);
    }

    getOrbitPositionMarkerList() {
        return this.orbitPositionMarkerList;
    }

    updateOrbitPositionMarkers() {
        // Only proceed if the planet has orbit markers
        if (!this.orbitMarkers || this.orbitMarkers.length === 0) {
            return;
        }

        // Store current visibility state
        const wasVisible = this.orbitMarkers.some(marker =>
            marker.marker && marker.marker.visible
        );

        // Remove existing markers from the scene
        this.orbitMarkers.forEach(marker => {
            if (marker.marker) {
                this.scene.remove(marker.marker);
            }
        });

        // Create new markers
        this.createOrbitPositionMarkers();

        // Restore visibility state
        if (this.orbitMarkers) {
            this.setOrbitPositionMarkersVisibility(wasVisible);
        }
    }

    setOrbitPositionMarkersVisibility(visible) {
        if (this.orbitMarkers) {
            this.orbitMarkers.forEach(marker => marker.setVisible(visible));
        }
    }

    // ------------
    // --- Ring ---
    // ------------

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

    // -----------------------
    // --- Solar Radial Line ---
    // -----------------------

    /**
     * Create a solar radial line from sun to planet
     */
    createSolarRadialLine() {
        // Create a line geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(6); // 2 points × 3 coordinates
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Create a red line material
        const material = new THREE.LineBasicMaterial({
            color: 0xff0000,
            linewidth: this.solarRadialLineWidth,
            depthTest: true
        });

        // Create the line
        this.solarRadialLine = new THREE.Line(geometry, material);
        this.solarRadialLine.renderOrder = 1000;
        this.solarRadialLine.visible = this.solarRadialLineVisible;

        // Add to scene
        if (this.solarSystem && this.solarSystem.scene) {
            this.solarSystem.scene.add(this.solarRadialLine);
        }
    }

    /**
     * Update the solar radial line position
     */
    updateSolarRadialLine() {
        if (!this.solarRadialLine) {
            this.createSolarRadialLine();
        }

        // Get planet position in world space
        const planetPos = new THREE.Vector3();
        this.sphere.getWorldPosition(planetPos);

        // Sun is at origin (0,0,0)
        const sunPos = new THREE.Vector3(0, 0, 0);

        // Update line positions
        const positions = this.solarRadialLine.geometry.attributes.position.array;

        // Sun position
        positions[0] = sunPos.x;
        positions[1] = sunPos.y;
        positions[2] = sunPos.z;

        // Planet position
        positions[3] = planetPos.x;
        positions[4] = planetPos.y;
        positions[5] = planetPos.z;

        // Mark the attribute as needing an update
        this.solarRadialLine.geometry.attributes.position.needsUpdate = true;
    }

    /**
     * Toggle solar radial line visibility
     */
    toggleSolarRadialLine(visible) {
        this.solarRadialLineVisible = visible;

        if (!this.solarRadialLine) {
            this.createSolarRadialLine();
        }

        if (this.solarRadialLine) {
            this.solarRadialLine.visible = visible;
        }
    }


    // ---


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
        if (this.orbitMarkers) {
            this.orbitMarkers.forEach(marker => {
                marker.setVisible(marker.wasVisible || false);
            });
        }
        // Show rings if this planet has them
        if (this.rings) {
            this.rings.visible = true;
            this.ringsVisible = true;
        }
        // Show solar radial line if it was visible
        if (this.solarRadialLine) {
            this.solarRadialLine.visible = this.solarRadialLineVisible;
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
        if (this.orbitMarkers) {
            // Store current visibility state before hiding
            this.orbitMarkers.forEach(marker => {
                marker.wasVisible = marker.marker ? marker.marker.visible : false;
                marker.setVisible(false);
            });
        }
        // Hide rings if this planet has them
        if (this.rings) {
            this.rings.visible = false;
            this.ringsVisible = false;
        }
        // Hide solar radial line
        if (this.solarRadialLine) {
            this.solarRadialLine.visible = false;
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

    update(now) {

        // Handle rotation if enabled
        if (this.rotationEnabled && this.rotationSpeed > 0) {

            // Apply rotation based on current rotation speed
            // The orientation (-) means counterclockwise
            this.sphere.rotation.y += this.rotationSpeed;
        }

        // Handle orbit if enabled
        if (this.orbitEnabled && this.orbitSpeed > 0) {
            // Store the previous orbit angle before updating
            const previousOrbitAngle = this.orbitGroup.rotation.y;

            // Apply orbit based on current orbit speed
            this.orbitGroup.rotation.y += this.orbitSpeed;

            // Calculate the delta angle (how much the orbit changed)
            const deltaAngle = this.orbitGroup.rotation.y - previousOrbitAngle;

            // Counter-rotate the planet group to maintain tilt direction in space
            // This keeps the axial tilt fixed in the Y-X plane
            this.group.rotation.y -= deltaAngle;
        }

        // Update side view marker if present
        if (this.sideViewMarker) {
            this.sideViewMarker.update();
        }

        // Update solar radial line if visible
        if (this.solarRadialLineVisible) {
            this.updateSolarRadialLine();
        }
    }
}