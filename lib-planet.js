/**
 * Base Planet class for all planets in the solar system
 */
class Planet {

//  Correct size scale - Orbit scaled down
//    static scaleDownDiameterFactor = 1;
//    static scaleDownOrbitFactor = 1000;
//    static shiftOrbit = 700000;

    // Correct orbit scale -
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

//    constructor(diameter, factData, nonScaleModelData, scaleModelData) {
    constructor(factData, nonScaleModelData, scaleModelData) {
            // Store reference data
        this.factData = factData;
        this.nonScaleModelData = nonScaleModelData;
        this.scaleModelData = scaleModelData;

        // Use non-scale model data by default
//        this.diameter = diameter;
        this.diameter = nonScaleModelData.diameter

        this.radius = this.diameter / 2;
        this.axialTilt = factData.axialTilt; // degrees
        this.group = new THREE.Group();
        this.latitudeCircles = new THREE.Group(); // Group for latitude circles
        this.consolePane = null;
        this.consoleVisible = false;

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
        this.orbitVisibility = 1.0; // Full visibility by default
        this.orbitLine = null;
        this.orbitGroup = new THREE.Group(); // Parent group for orbital motion

        // Day/Night effect properties
        this.dayNightEnabled = true; // Enabled by default

        // Close-up view properties
        this.closeUpViewEnabled = false;
        this.sideViewEnabled = false;
        this.originalCameraPosition = null;

        // Season labels properties (used by some planets)
        this.seasonLabels = null;
        this.seasonLabelsVisible = false;

        // Planet marker properties
        this.marker = null;
        this.markerVisible = false;
        this.sideMarkerDistanceFactor = 4; // Default: 4 times the planet radius
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
            opacity: this.orbitVisibility,
            depthTest: true,
            depthWrite: false
        });

        this.orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
        this.orbitLine.renderOrder = 1;

        this.group.position.x = this.orbitRadius;
        this.orbitGroup.add(this.group);
        this.orbitGroup.add(this.orbitLine);
    }

    applyTilt() {
        this.group.rotation.z = THREE.MathUtils.degToRad(this.axialTilt);
    }

    makeDraggable(element, dragHandle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        dragHandle.onmousedown = function(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeHandler;
            document.onmousemove = dragHandler;
        };

        function dragHandler(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
            element.style.bottom = 'auto';
            element.style.right = 'auto';
        }

        function closeHandler() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    addToggle(label, id, initialState, onChange) {
        const container = document.createElement('div');
        container.style.marginBottom = '10px';
        container.style.display = 'flex';
        container.style.justifyContent = 'space-between';
        container.style.alignItems = 'center';

        const labelElem = document.createElement('label');
        labelElem.textContent = label;

        // Create switch container
        const switchLabel = document.createElement('label');
        switchLabel.className = 'switch';

        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = initialState;
        if (id) toggle.id = id;
        toggle.addEventListener('change', onChange);

        // Create slider span
        const sliderSpan = document.createElement('span');
        sliderSpan.className = 'slider';

        // Assemble the switch
        switchLabel.appendChild(toggle);
        switchLabel.appendChild(sliderSpan);

        container.appendChild(labelElem);
        container.appendChild(switchLabel);
        this.consoleContent.appendChild(container);
    }

    addSlider(label, id, defaultValue, onChange) {
        const container = document.createElement('div');
        container.style.marginBottom = '15px';

        const labelElem = document.createElement('label');
        labelElem.textContent = label;
        labelElem.style.display = 'block';
        labelElem.style.marginBottom = '5px';
        container.appendChild(labelElem);

        const controlsContainer = document.createElement('div');
        controlsContainer.style.display = 'flex';
        controlsContainer.style.alignItems = 'center';
        controlsContainer.style.gap = '10px';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '100';
        slider.value = defaultValue.toString();
        slider.style.flexGrow = '1';
        if (id) slider.id = id;

        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Reset';
        resetBtn.style.padding = '2px 8px';
        resetBtn.style.fontSize = '12px';
        resetBtn.style.backgroundColor = '#555';
        resetBtn.style.color = 'white';
        resetBtn.style.border = '1px solid #777';
        resetBtn.style.borderRadius = '3px';
        resetBtn.style.cursor = 'pointer';
        resetBtn.style.flexShrink = '0';

        // Listen for input events (user interaction)
        slider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            onChange(value);
        });

        resetBtn.addEventListener('click', () => {
            slider.value = '50';
            handleSliderChange();
        });

        controlsContainer.appendChild(slider);
        controlsContainer.appendChild(resetBtn);
        container.appendChild(controlsContainer);
        this.consoleContent.appendChild(container);
    }

    toggleDayNightEffect(enabled) {
        if (enabled) {
            this.sphere.material = this.standardMaterial;
        } else {
            this.sphere.material = this.basicMaterial;
        }
    }

    /**
     * Create a marker in the planet's equatorial plane
     */
    createMarker() {
        if (this.marker) return; // Marker already exists

        // Create a marker using the PlanetMarker class
        this.planetMarker = new PlanetMarker(this);
        this.marker = this.planetMarker.marker;

        // The marker distance is already set in the PlanetMarker constructor
        // using this.markerDistanceFactor

        // Hide by default
        this.setMarkerVisible(this.markerVisible);
    }

    /**
     * Update the marker's position based on the side marker distance factor
     */
    updateMarkerPosition() {
        if (!this.marker || !this.planetMarker) return;

        // Use the PlanetMarker instance to update the position
        this.planetMarker.setMarkerDistance(this.sideMarkerDistanceFactor);

        // The camera position will be automatically updated by the PlanetMarker
        // if it's in camera view mode
    }

    /**
     * Set the side marker's distance from the planet center
     * @param {number} distanceFactor - Distance as a factor of the planet's radius
     */
    setMarkerDistance(distanceFactor) {
        console.log(`Planet.setMarkerDistance: ${distanceFactor}`);
        this.sideMarkerDistanceFactor = distanceFactor;

        // Update the marker position if it exists
        if (this.planetMarker) {
            this.planetMarker.setMarkerDistance(distanceFactor);
        }
    }

    /**
     * Set the marker's visibility
     * @param {boolean} visible - Whether the marker should be visible
     */
    setMarkerVisible(visible) {
        this.markerVisible = visible;
        if (this.planetMarker) {
            this.planetMarker.setVisible(visible);
        }
    }

    /**
     * Get the marker's world position
     * @returns {THREE.Vector3} The marker's position in world coordinates
     */
    getMarkerWorldPosition() {
        if (this.planetMarker) {
            return this.planetMarker.getWorldPosition();
        }
        return new THREE.Vector3();
    }

    /**
     * Set up planet side view from the marker position
     */
    setPlanetMarkerView() {
        if (!camera) return;

        // Create marker if it doesn't exist
        if (!this.marker) {
            this.createMarker();
        }

        // Only store original camera position the first time
        if (!this.originalCameraPosition) {
            this.originalCameraPosition = {
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z
            };
        }

        // Enable camera view mode on the marker and immediately position the camera
        if (this.planetMarker) {
            this.planetMarker.setCameraView(true);
            this.planetMarker.updateCameraPosition(); // Force immediate camera update
        }

        // Set view state
        this.closeUpViewEnabled = true;
        this.sideViewEnabled = false;
    }

    toggleCloseUpView(enabled, sideView = false) {
        if (!camera) return;

        if (sideView) {
            this.sideViewEnabled = enabled;
            this.closeUpViewEnabled = false;
        } else {
            this.closeUpViewEnabled = enabled;
            this.sideViewEnabled = false;
        }

        if (enabled) {
            this.originalCameraPosition = {
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z
            };

            const planetWorldPos = new THREE.Vector3();
            this.sphere.getWorldPosition(planetWorldPos);
            const closeUpDistance = this.radius * 3;

            if (sideView) {
                const cameraPos = {
                    x: planetWorldPos.x,
                    y: planetWorldPos.y,
                    z: planetWorldPos.z + this.radius * 3
                };
                camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
                camera.lookAt(planetWorldPos);

                if (controls) {
                    controls.target.copy(planetWorldPos);
                    controls.update();
                }
            } else {
                const cameraPos = {
                    x: planetWorldPos.x - closeUpDistance,
                    y: planetWorldPos.y,
                    z: planetWorldPos.z
                };
                camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
                camera.lookAt(planetWorldPos);

                if (controls) {
                    controls.target.copy(planetWorldPos);
                    controls.update();
                }
            }

            this.prevRotationEnabled = this.rotationEnabled;
            this.prevOrbitEnabled = this.orbitEnabled;
            this.rotationEnabled = false;
            this.orbitEnabled = false;

            const planetName = this.constructor.name.toLowerCase();
            document.getElementById(`${planetName}-rotation-toggle`).checked = false;
            document.getElementById(`${planetName}-orbit-toggle`).checked = false;

        } else if (this.originalCameraPosition) {
            camera.position.set(
                this.originalCameraPosition.x,
                this.originalCameraPosition.y,
                this.originalCameraPosition.z
            );

            camera.lookAt(0, 0, 0);

            if (controls) {
                controls.target.set(0, 0, 0);
                controls.update();
            }

            const planetName = this.constructor.name.toLowerCase();
            if (this.prevRotationEnabled) {
                this.rotationEnabled = true;
                document.getElementById(`${planetName}-rotation-toggle`).checked = true;
            }

            if (this.prevOrbitEnabled) {
                this.orbitEnabled = true;
                document.getElementById(`${planetName}-orbit-toggle`).checked = true;
            }
        }
    }

    show() {
        if (this.consolePane) {
            this.consolePane.style.display = 'block';
            this.consoleVisible = true;
        }
    }

    hide() {
        if (this.consolePane) {
            this.consolePane.style.display = 'none';
            this.consoleVisible = false;
        }
    }

    update(time) {
        // Rotate the sphere around its axis if rotation is enabled
        if (this.rotationEnabled && this.rotationSpeed > 0) {
            // Default rotation direction (counterclockwise)
            this.sphere.rotation.y += this.rotationSpeed;

            // Update camera position if marker view is active
            if (this.planetMarker && this.planetMarker.cameraView) {
                this.planetMarker.updateCameraPosition();
            }
        }

        // Orbit around the Sun if orbit is enabled
        if (this.orbitEnabled && this.orbitSpeed > 0) {
            const previousOrbitAngle = this.orbitGroup.rotation.y;
            this.orbitGroup.rotation.y += this.orbitSpeed;
            const deltaAngle = this.orbitGroup.rotation.y - previousOrbitAngle;
            this.group.rotation.y -= deltaAngle;

            // Update camera position if marker view is active
            if (this.planetMarker && this.planetMarker.cameraView) {
                this.planetMarker.updateCameraPosition();
            }
        }
    }

    getObject() {
        return this.orbitGroup;
    }

    /**
     * Creates the console pane for controlling the planet
     * @param {string} planetName - The name of the planet for the console title
     */
    createConsolePane(planetName = this.constructor.name) {
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
        title.textContent = `${planetName} Controls`;
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
            
            // Find the toggle for this planet in the Solar System Controls
            const planetName = this.constructor.name.toLowerCase();
            const toggle = document.getElementById(`${planetName}-controls-toggle`);
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

        // Make the console pane draggable
        this.makeDraggable(this.consolePane, header);

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

        // Create sections for better organization
        this.createVisibilitySection();
        this.createRotationSection();
        this.createOrbitSection();

        // Add to document
        document.body.appendChild(this.consolePane);
    }

    /**
     * Creates the visibility controls section
     */
    createVisibilitySection() {
        const planetName = this.constructor.name.toLowerCase();

        // Create section header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Visibility Controls';
        sectionHeader.style.margin = '0 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Add day/night effect toggle
        this.addToggle('Day/Night Effect: ', `${planetName}-day-night-toggle`, this.dayNightEnabled, (e) => {
            this.dayNightEnabled = e.target.checked;
            this.toggleDayNightEffect(this.dayNightEnabled);
        });

        // Add side marker view toggle
        this.addToggle('Side Marker View: ', `${planetName}-side-marker-view-toggle`, false, (e) => {
            if (e.target.checked) {
                // Create marker if it doesn't exist
                if (!this.marker) {
                    this.createMarker();
                }

                // Make marker visible
                this.setMarkerVisible(true);

                // Enable rotation so the marker rotates with the planet
                this.rotationEnabled = true;
                document.getElementById(`${planetName}-rotation-toggle`).checked = true;

                // Set up the marker view
                this.setPlanetMarkerView();

                // Disable side view if enabled
                if (this.sideViewEnabled) {
                    this.sideViewEnabled = false;
                    document.getElementById(`${planetName}-side-view-toggle`).checked = false;
                }
            } else {
                // Disable camera view mode
                if (this.planetMarker) {
                    this.planetMarker.setCameraView(false);
                }

                // Hide marker
                this.setMarkerVisible(false);

                // Restore original view
                this.toggleCloseUpView(false, false);
            }
        });

        // Add side view toggle
        this.addToggle('Close View: ', `${planetName}-side-view-toggle`, this.sideViewEnabled, (e) => {
            if (e.target.checked) {
                this.toggleCloseUpView(true, true);

                // Disable orbit if enabled
                if (this.orbitEnabled) {
                    this.orbitEnabled = false;
                    document.getElementById(`${planetName}-orbit-toggle`).checked = false;
                }

                // Disable marker view if enabled
                const markerViewToggle = document.getElementById(`${planetName}-marker-view-toggle`);
                if (markerViewToggle && markerViewToggle.checked) {
                    markerViewToggle.checked = false;
                    this.setMarkerVisible(false);
                }
            } else {
                this.toggleCloseUpView(false, false);
            }
        });

        // Add axis toggle
        this.addToggle('Show Axis: ', null, true, (e) => {
            if (this.axis) this.axis.visible = e.target.checked;
        });

        // Add latitude circles toggle
        this.addToggle('Show Latitude Circles: ', null, false, (e) => {
            this.latitudeCircles.visible = e.target.checked;
        });

        // Add marker toggle
        this.addToggle('Show Marker: ', `${planetName}-marker-toggle`, false, (e) => {
            // Create marker if it doesn't exist
            if (!this.marker && e.target.checked) {
                this.createMarker();
            }

            // Set marker visibility
            this.setMarkerVisible(e.target.checked);
        });

        // Add marker distance slider with wider range
        this.createMarkerDistanceSlider(planetName);

        // Add season labels toggle if they exist
        if (this.seasonLabels) {
            this.addToggle('Show Season Labels: ', null, this.seasonLabelsVisible, (e) => {
                this.seasonLabelsVisible = e.target.checked;
                this.seasonLabels.visible = e.target.checked;
            });
        }

        // Add orbit visibility slider
        this.createOrbitVisibilitySlider(planetName);
    }

    /**
     * Creates the side marker distance slider
     * @param {string} planetName - The name of the planet for element IDs
     */
    createMarkerDistanceSlider(planetName) {
        const sideMarkerDistanceContainer = document.createElement('div');
        sideMarkerDistanceContainer.style.marginBottom = '15px';

        const sideMarkerDistanceLabel = document.createElement('label');
        sideMarkerDistanceLabel.textContent = 'Side Marker Distance: ';
        sideMarkerDistanceLabel.style.display = 'block';
        sideMarkerDistanceLabel.style.marginBottom = '5px';

        const sideMarkerDistanceSlider = document.createElement('input');
        sideMarkerDistanceSlider.type = 'range';
        sideMarkerDistanceSlider.min = '1.1';
        sideMarkerDistanceSlider.max = '6.0'; // Increased max value to 6.0
        sideMarkerDistanceSlider.step = '0.1';
        sideMarkerDistanceSlider.value = this.sideMarkerDistanceFactor.toString();
        sideMarkerDistanceSlider.style.width = '100%';
        sideMarkerDistanceSlider.id = `${planetName}-side-marker-distance-slider`;

        // Add value display
        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = this.sideMarkerDistanceFactor.toString();
        valueDisplay.style.marginLeft = '10px';
        valueDisplay.style.fontSize = '12px';

        sideMarkerDistanceSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.sideMarkerDistanceFactor = value;
            valueDisplay.textContent = value.toString();

            // Update marker position if it exists
            // This will automatically update the camera position if in camera view mode
            this.updateMarkerPosition();
        });

        const sliderContainer = document.createElement('div');
        sliderContainer.style.display = 'flex';
        sliderContainer.style.alignItems = 'center';
        sliderContainer.appendChild(sideMarkerDistanceSlider);
        sliderContainer.appendChild(valueDisplay);

        sideMarkerDistanceContainer.appendChild(sideMarkerDistanceLabel);
        sideMarkerDistanceContainer.appendChild(sliderContainer);
        this.consoleContent.appendChild(sideMarkerDistanceContainer);
    }

    /**
     * Creates the rotation controls section
     */
    createRotationSection() {
        const planetName = this.constructor.name.toLowerCase();

        // Create section header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Rotation Controls';
        sectionHeader.style.margin = '15px 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Listen for global rotation slider changes
        document.addEventListener('globalRotationSliderChange', (e) => {
            const slider = document.getElementById(`${planetName}-rotation-speed-slider`);
            if (slider) {
                slider.value = e.detail.value;
                const event = new Event('input', { bubbles: true });
                slider.dispatchEvent(event);
            }
        });

        // Add rotation toggle
        this.addToggle('Enable Rotation: ', `${planetName}-rotation-toggle`, this.rotationEnabled, (e) => {
            this.rotationEnabled = e.target.checked;
        });

        // Add rotation speed slider
        this.addSlider('Rotation Speed: ', `${planetName}-rotation-speed-slider`, 50, (value) => {
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
                document.getElementById(`${planetName}-rotation-toggle`).checked = true;
            }
        });
    }

    /**
     * Creates the orbit controls section
     */
    createOrbitSection() {
        const planetName = this.constructor.name.toLowerCase();

        // Create section header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Orbit Controls';
        sectionHeader.style.margin = '15px 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Listen for global orbit slider changes
        document.addEventListener('globalOrbitSliderChange', (e) => {
            const slider = document.getElementById(`${planetName}-orbit-speed-slider`);
            if (slider) {
                slider.value = e.detail.value;
                const event = new Event('input', { bubbles: true });
                slider.dispatchEvent(event);
            }
        });

        // Listen for global orbit visibility slider changes
        document.addEventListener('globalOrbitVisibilityChange', (e) => {
            const slider = document.getElementById(`${planetName}-orbit-visibility-slider`);
            if (slider) {
                slider.value = e.detail.value;
                const event = new Event('input', { bubbles: true });
                slider.dispatchEvent(event);
            }
        });

        // Add orbit toggle
        this.addToggle('Enable Orbit: ', `${planetName}-orbit-toggle`, this.orbitEnabled, (e) => {
            this.orbitEnabled = e.target.checked;

            if (e.target.checked && this.sideViewEnabled) {
                this.sideViewEnabled = false;
                document.getElementById(`${planetName}-side-view-toggle`).checked = false;
                this.toggleCloseUpView(false, false);
            }
        });

        // Add orbit speed slider
        this.addSlider('Orbit Speed: ', `${planetName}-orbit-speed-slider`, 50, (value) => {
            if (value === 0) {
                this.orbitSpeed = 0;
            } else if (value <= 50) {
                const normalizedValue = value / 50;
                const baseSpeed = (2 * Math.PI) / (this.orbitalPeriod * 60);
                this.orbitSpeed = baseSpeed * normalizedValue;
            } else {
                const normalizedValue = (value - 50) / 50;
                const periodDiff = this.orbitalPeriod - this.maxOrbitalPeriod;
                const adjustedPeriod = this.orbitalPeriod - (periodDiff * normalizedValue);
                this.orbitSpeed = (2 * Math.PI) / (adjustedPeriod * 60);
            }

            if (value > 0 && !this.orbitEnabled) {
                this.orbitEnabled = true;
                document.getElementById(`${planetName}-orbit-toggle`).checked = true;

                if (this.sideViewEnabled) {
                    this.sideViewEnabled = false;
                    document.getElementById(`${planetName}-side-view-toggle`).checked = false;
                    this.toggleCloseUpView(false, false);
                }
            }
        });
    }

    /**
     * Creates the orbit visibility slider
     * @param {string} planetName - The name of the planet for element IDs
     */
    createOrbitVisibilitySlider(planetName) {
        const visContainer = document.createElement('div');
        visContainer.style.marginBottom = '15px';

        const visLabel = document.createElement('label');
        visLabel.textContent = 'Orbit Visibility: ';
        visLabel.style.display = 'block';
        visLabel.style.marginBottom = '5px';

        const visSlider = document.createElement('input');
        visSlider.type = 'range';
        visSlider.min = '0';
        visSlider.max = '100';
        visSlider.value = Math.round(this.orbitVisibility * 100);
        visSlider.style.width = '100%';
        visSlider.id = `${planetName}-orbit-visibility-slider`;
        visSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.orbitVisibility = value / 100;

            if (this.orbitLine) {
                this.orbitLine.material.opacity = this.orbitVisibility;

                const intensity = 0.5 + this.orbitVisibility * 0.5;
                this.orbitLine.material.color.setRGB(intensity, intensity, intensity);
            }
        });

        visContainer.appendChild(visLabel);
        visContainer.appendChild(visSlider);
        this.consoleContent.appendChild(visContainer);
    }

    /**
     * Creates season labels for planets that have seasons
     * @param {Array} seasons - Array of season objects with name, season, and angle properties
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

        scene.add(this.seasonLabels);
        this.seasonLabels.visible = false; // Hide season labels by default
    }
}