/**
 * Mars model creator
 */
// Mars real facts data
const marsFactData = {
    diameter: 6779, // km
    axialTilt: 25.19, // degrees
    orbitRadius: 227900000, // km (average distance from Sun)
    rotationPeriod: 24.6, // hours
    orbitalPeriod: 687, // days
};

// Mars scale model data (scaled values for realistic representation)
const marsScaleModelData = {
    diameter: 6000, // scaled diameter in the model
    orbitRadius: 227900000 / 2000, // scaled orbit radius
    rotationPeriod: 10, // 10 seconds to complete one rotation
    maxRotationPeriod: 1, // 1 second at maximum speed
    orbitalPeriod: 1200, // 1200 seconds to complete one orbit
    maxOrbitalPeriod: 120, // 120 seconds at maximum speed
    rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); }, // radians per frame
    maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); }, // based on max period
    orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); }, // radians per frame
    maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); }, // based on max period
};

// Mars non-scale model data (values for visual appeal)
const marsNonScaleModelData = {
    diameter: 6000, // visually appealing diameter
    orbitRadius: 114000, // visually appealing orbit radius (1.5x Earth's orbit)
    rotationPeriod: 1, // 1 second to complete one rotation
    maxRotationPeriod: 0.1, // 0.1 seconds at maximum speed (10x faster)
    orbitalPeriod: 120, // 120 seconds to complete one orbit (2x Earth's period)
    maxOrbitalPeriod: 12, // 12 seconds at maximum speed
    rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); }, // radians per frame
    maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); }, // based on max period
    orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); }, // radians per frame
    maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); }, // based on max period
};

class Mars {
    constructor(diameter = marsNonScaleModelData.diameter) {
        // Use non-scale model data by default
        this.diameter = diameter;
        this.radius = diameter / 2;
        this.axialTilt = marsFactData.axialTilt; // degrees
        this.group = new THREE.Group();
        this.latitudeCircles = new THREE.Group(); // Group for latitude circles
        this.consolePane = null;
        this.consoleVisible = false;

        // Rotation properties
        this.rotationEnabled = false; // Disabled by default
        this.rotationPeriod = marsNonScaleModelData.rotationPeriod; // Time to complete one rotation in seconds
        this.maxRotationPeriod = marsNonScaleModelData.maxRotationPeriod; // Time at maximum speed
        this.rotationSpeed = marsNonScaleModelData.rotationSpeed(); // Initial rotation speed
        this.maxRotationSpeed = marsNonScaleModelData.maxRotationSpeed(); // Maximum rotation speed

        // Orbit properties
        this.actualOrbitRadius = marsFactData.orbitRadius; // Real distance in km
        this.orbitRadius = marsNonScaleModelData.orbitRadius; // Non-scaled for visual appeal
        this.orbitalPeriod = marsNonScaleModelData.orbitalPeriod; // Time to complete one orbit in seconds
        this.maxOrbitalPeriod = marsNonScaleModelData.maxOrbitalPeriod; // Time at maximum speed
        this.orbitEnabled = false; // Disabled by default
        this.orbitSpeed = marsNonScaleModelData.orbitSpeed(); // Initial orbit speed
        this.maxOrbitSpeed = marsNonScaleModelData.maxOrbitSpeed(); // Maximum orbit speed
        this.orbitVisibility = 1.0; // Full visibility by default
        this.orbitLine = null;
        this.orbitGroup = new THREE.Group(); // Parent group for orbital motion

        // Day/Night effect properties
        this.dayNightEnabled = true; // Enabled by default

        // Close-up view properties
        this.closeUpViewEnabled = false;
        this.sideViewEnabled = false;
        this.originalCameraPosition = null;

        this.createSphere();
        this.createAxis();
        this.createLatitudeCircles();
        this.applyTilt();
        this.createOrbit();
        this.createConsolePane();

        // Hide latitude circles by default
        this.latitudeCircles.visible = false;
    }

    createSphere() {
        const geometry = new THREE.SphereGeometry(this.radius, 64, 32);

        // Load Mars texture
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('images/Mars-texture.jpg');

        // Create material with the texture
        // Using MeshStandardMaterial for physically-based rendering
        // This allows Mars to be lit only on the side facing the Sun
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 1.0,
            metalness: 0.0
        });

        this.sphere = new THREE.Mesh(geometry, material);
        this.group.add(this.sphere);

        // Store both material types for toggling day/night effect
        this.standardMaterial = material;
        this.basicMaterial = new THREE.MeshBasicMaterial({
            map: texture
        });
    }

    createAxis() {
        // Axis should be 10% longer than sphere diameter
        const axisLength = this.diameter * 1.1;

        // Create a cylinder to represent the axis
        const cylinderRadius = 100; // Width of the axis
        const cylinderGeometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, axisLength, 16);
        const cylinderMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4500, // Orange-red color for Mars
            depthTest: true,
            depthWrite: false
        });
        this.axis = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

        // Ensure the axis is rendered after the Mars sphere
        this.axis.renderOrder = 1;
        this.group.add(this.axis);
    }

    createLatitudeCircles() {
        const segments = 64;

        // Define latitudes in degrees
        const latitudes = [
            { name: 'Equator', angle: 0, color: 0xff4500 },
            { name: 'North Polar Circle', angle: 65, color: 0x00aaff },
            { name: 'South Polar Circle', angle: -65, color: 0x00aaff }
        ];

        latitudes.forEach(latitude => {
            // Convert latitude angle to radians
            const phi = THREE.MathUtils.degToRad(latitude.angle);

            // Calculate the radius of this latitude circle
            const latRadius = this.radius * Math.cos(phi);

            // Calculate the height of this latitude circle
            const y = this.radius * Math.sin(phi);

            const vertices = [];

            // Create a circle of points for this latitude
            for (let i = 0; i <= segments; i++) {
                const theta = (i / segments) * Math.PI * 2;
                const x = latRadius * Math.cos(theta);
                const z = latRadius * Math.sin(theta);
                vertices.push(x, y, z);
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

            // Create a line for this latitude
            const material = new THREE.LineBasicMaterial({ color: latitude.color, linewidth: 2 });
            const circle = new THREE.Line(geometry, material);
            this.latitudeCircles.add(circle);
        });

        // Add the latitude circles group to the main group
        this.group.add(this.latitudeCircles);
    }

    createOrbit() {
        // Create a circular orbit path
        const segments = 128;
        const orbitGeometry = new THREE.BufferGeometry();
        const vertices = [];

        // Create a circle of points for the orbit
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const x = this.orbitRadius * Math.cos(theta);
            const z = this.orbitRadius * Math.sin(theta);
            vertices.push(x, 0, z); // Orbit is in the XZ plane
        }

        orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        // Create a white line for the orbit
        const orbitMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: this.orbitVisibility,
            depthTest: true,
            depthWrite: false
        });

        this.orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);

        // Ensure the orbit line is rendered after the Mars sphere
        this.orbitLine.renderOrder = 1;

        // Position Mars at the correct distance from the center
        this.group.position.x = this.orbitRadius;

        // Add Mars group to the orbit group
        this.orbitGroup.add(this.group);

        // Add orbit line to the orbit group
        this.orbitGroup.add(this.orbitLine);
    }

    applyTilt() {
        // Apply Mars's axial tilt - fixed in space (always pointing in the same direction)
        this.group.rotation.z = THREE.MathUtils.degToRad(this.axialTilt);
    }

    toggleDayNightEffect(enabled) {
        // Switch between StandardMaterial (day/night effect) and BasicMaterial (always lit)
        if (enabled) {
            this.sphere.material = this.standardMaterial;
        } else {
            this.sphere.material = this.basicMaterial;
        }
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
            // Store current camera position before moving to close-up view
            this.originalCameraPosition = {
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z
            };

            // Get the current Mars position in world space
            const marsWorldPos = new THREE.Vector3();
            this.sphere.getWorldPosition(marsWorldPos);

            // Position camera close to Mars but slightly offset
            const closeUpDistance = this.radius * 3; // Distance to achieve 80% vertical fill

            // Calculate camera position based on Mars's current position and view type
            let cameraPos;

            if (sideView) {
                // Side view - position camera to see the axis tilt from the side
                cameraPos = {
                    x: marsWorldPos.x,
                    y: marsWorldPos.y,
                    z: marsWorldPos.z + this.radius * 3
                };
                // Set camera target to Mars's position
                camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
                camera.lookAt(marsWorldPos);

                if (controls) {
                    controls.target.copy(marsWorldPos);
                    controls.update();
                }
                return; // Skip the default camera positioning below
            } else {
                // Front view - position camera to see Mars from the front
                cameraPos = {
                    x: marsWorldPos.x - closeUpDistance,
                    y: marsWorldPos.y,
                    z: marsWorldPos.z
                };
            }

            // Only for front view - side view already handled above
            if (!sideView) {
                // Position camera looking at Mars
                camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
                camera.lookAt(marsWorldPos);

                // Update orbit controls to target Mars
                if (controls) {
                    controls.target.copy(marsWorldPos);
                    controls.update();
                }
            }

            // Store current rotation/orbit states
            this.prevRotationEnabled = this.rotationEnabled;
            this.prevOrbitEnabled = this.orbitEnabled;

            // Disable orbit and rotation when close view is enabled
            this.rotationEnabled = false;
            this.orbitEnabled = false;

            // Update UI controls
            document.getElementById('mars-rotation-toggle').checked = false;
            document.getElementById('mars-orbit-toggle').checked = false;

        } else if (this.originalCameraPosition) {
            // Restore original camera position
            camera.position.set(
                this.originalCameraPosition.x,
                this.originalCameraPosition.y,
                this.originalCameraPosition.z
            );

            // Reset camera target to center
            camera.lookAt(0, 0, 0);

            // Reset controls target to center
            if (controls) {
                controls.target.set(0, 0, 0);
                controls.update();
            }

            // Restore previous rotation/orbit states if they were enabled
            if (this.prevRotationEnabled) {
                this.rotationEnabled = true;
                document.getElementById('mars-rotation-toggle').checked = true;
            }

            if (this.prevOrbitEnabled) {
                this.orbitEnabled = true;
                document.getElementById('mars-orbit-toggle').checked = true;
            }
        }
    }

    makeDraggable(element, dragHandle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        dragHandle.onmousedown = dragMouseDown;

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
            // Remove the bottom/right positioning once we start dragging
            element.style.bottom = 'auto';
            element.style.right = 'auto';
        }

        function closeDragElement() {
            // Stop moving when mouse button is released
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    createConsolePane() {
        // Create console pane
        this.consolePane = document.createElement('div');
        this.consolePane.className = 'console-pane';
        this.consolePane.style.position = 'absolute';
        this.consolePane.style.bottom = '20px';
        this.consolePane.style.right = '20px';
        this.consolePane.style.backgroundColor = 'rgba(80, 80, 80, 0.8)'; // Lighter gray
        this.consolePane.style.color = 'white';
        this.consolePane.style.padding = '0'; // No padding for the container
        this.consolePane.style.borderRadius = '5px';
        this.consolePane.style.fontFamily = 'Arial, sans-serif';
        this.consolePane.style.display = 'none'; // Hidden by default
        this.consolePane.style.width = '250px';
        this.consolePane.style.boxShadow = '0 4px 8px rgba(0,0,0,0.5)'; // Add shadow for better visibility

        // Create header for dragging
        const header = document.createElement('div');
        header.style.backgroundColor = 'rgba(100, 100, 100, 0.9)'; // Darker than the body
        header.style.padding = '10px 15px';
        header.style.borderTopLeftRadius = '5px';
        header.style.borderTopRightRadius = '5px';
        header.style.cursor = 'move'; // Change cursor to indicate draggable
        header.style.borderBottom = '1px solid #666';

        // Add title to header
        const title = document.createElement('h3');
        title.textContent = 'Mars Controls';
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

        // Create sections for better organization
        this.createVisibilitySection();
        this.createRotationSection();
        this.createOrbitSection();

        // Add to document
        document.body.appendChild(this.consolePane);
    }

    createVisibilitySection() {
        // Create section header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Visibility Controls';
        sectionHeader.style.margin = '0 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Add day/night effect toggle
        const dayNightToggleContainer = document.createElement('div');
        dayNightToggleContainer.style.marginBottom = '10px';

        const dayNightToggleLabel = document.createElement('label');
        dayNightToggleLabel.textContent = 'Day/Night Effect: ';
        dayNightToggleLabel.style.marginRight = '10px';

        const dayNightToggle = document.createElement('input');
        dayNightToggle.type = 'checkbox';
        dayNightToggle.checked = this.dayNightEnabled;
        dayNightToggle.id = 'mars-day-night-toggle';
        dayNightToggle.addEventListener('change', (e) => {
            this.dayNightEnabled = e.target.checked;
            this.toggleDayNightEffect(this.dayNightEnabled);
        });

        dayNightToggleContainer.appendChild(dayNightToggleLabel);
        dayNightToggleContainer.appendChild(dayNightToggle);
        this.consoleContent.appendChild(dayNightToggleContainer);

        // Add side view toggle
        const sideViewToggleContainer = document.createElement('div');
        sideViewToggleContainer.style.marginBottom = '10px';

        const sideViewToggleLabel = document.createElement('label');
        sideViewToggleLabel.textContent = 'Close View: ';
        sideViewToggleLabel.style.marginRight = '10px';

        const sideViewToggle = document.createElement('input');
        sideViewToggle.type = 'checkbox';
        sideViewToggle.checked = this.sideViewEnabled;
        sideViewToggle.id = 'mars-side-view-toggle';
        sideViewToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.toggleCloseUpView(true, true);

                // If orbit is enabled, disable it when close view is enabled
                if (this.orbitEnabled) {
                    this.orbitEnabled = false;
                    document.getElementById('mars-orbit-toggle').checked = false;
                }
            } else {
                this.toggleCloseUpView(false, false);
            }
        });

        sideViewToggleContainer.appendChild(sideViewToggleLabel);
        sideViewToggleContainer.appendChild(sideViewToggle);
        this.consoleContent.appendChild(sideViewToggleContainer);

        // Add axis toggle
        const axisToggleContainer = document.createElement('div');
        axisToggleContainer.style.marginBottom = '10px';

        const axisToggleLabel = document.createElement('label');
        axisToggleLabel.textContent = 'Show Axis: ';
        axisToggleLabel.style.marginRight = '10px';

        const axisToggle = document.createElement('input');
        axisToggle.type = 'checkbox';
        axisToggle.checked = true; // Axis is visible by default
        axisToggle.id = 'mars-axis-toggle';
        axisToggle.addEventListener('change', (e) => {
            if (this.axis) {
                this.axis.visible = e.target.checked;
            }
        });

        axisToggleContainer.appendChild(axisToggleLabel);
        axisToggleContainer.appendChild(axisToggle);
        this.consoleContent.appendChild(axisToggleContainer);

        // Add latitude circles toggle
        const latitudeToggleContainer = document.createElement('div');
        latitudeToggleContainer.style.marginBottom = '10px';

        const latitudeToggleLabel = document.createElement('label');
        latitudeToggleLabel.textContent = 'Show Latitude Circles: ';
        latitudeToggleLabel.style.marginRight = '10px';

        const latitudeToggle = document.createElement('input');
        latitudeToggle.type = 'checkbox';
        latitudeToggle.checked = false; // Explicitly set to false
        latitudeToggle.id = 'mars-latitude-toggle';
        this.latitudeCircles.visible = false; // Ensure circles are hidden
        latitudeToggle.addEventListener('change', (e) => {
            this.latitudeCircles.visible = e.target.checked;
        });

        latitudeToggleContainer.appendChild(latitudeToggleLabel);
        latitudeToggleContainer.appendChild(latitudeToggle);
        this.consoleContent.appendChild(latitudeToggleContainer);
    }

    createRotationSection() {
        // Create section header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Rotation Controls';
        sectionHeader.style.margin = '15px 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Add rotation toggle
        const rotationToggleContainer = document.createElement('div');
        rotationToggleContainer.style.marginBottom = '10px';

        const rotationToggleLabel = document.createElement('label');
        rotationToggleLabel.textContent = 'Enable Rotation: ';
        rotationToggleLabel.style.marginRight = '10px';

        const rotationToggle = document.createElement('input');
        rotationToggle.type = 'checkbox';
        rotationToggle.checked = this.rotationEnabled;
        rotationToggle.id = 'mars-rotation-toggle';
        rotationToggle.addEventListener('change', (e) => {
            this.rotationEnabled = e.target.checked;
        });

        rotationToggleContainer.appendChild(rotationToggleLabel);
        rotationToggleContainer.appendChild(rotationToggle);
        this.consoleContent.appendChild(rotationToggleContainer);

        // Add rotation speed slider
        const rotationSliderContainer = document.createElement('div');
        rotationSliderContainer.style.marginBottom = '15px';

        // Add label for the slider
        const rotationSliderLabel = document.createElement('label');
        rotationSliderLabel.textContent = 'Rotation Speed: ';
        rotationSliderLabel.style.display = 'block';
        rotationSliderLabel.style.marginBottom = '5px';
        rotationSliderContainer.appendChild(rotationSliderLabel);

        // Create slider and reset button container
        const rotationSliderControlsContainer = document.createElement('div');
        rotationSliderControlsContainer.style.display = 'flex';
        rotationSliderControlsContainer.style.alignItems = 'center';
        rotationSliderControlsContainer.style.gap = '10px'; // Space between slider and button

        const rotationSlider = document.createElement('input');
        rotationSlider.type = 'range';
        rotationSlider.min = '0';
        rotationSlider.max = '100';
        rotationSlider.value = '50'; // Default to middle position
        rotationSlider.style.flexGrow = '1'; // Take up available space
        rotationSlider.id = 'mars-rotation-speed-slider';

        // Create reset button
        const rotationResetButton = document.createElement('button');
        rotationResetButton.textContent = 'Reset';
        rotationResetButton.style.padding = '2px 8px';
        rotationResetButton.style.fontSize = '12px';
        rotationResetButton.style.backgroundColor = '#555';
        rotationResetButton.style.color = 'white';
        rotationResetButton.style.border = '1px solid #777';
        rotationResetButton.style.borderRadius = '3px';
        rotationResetButton.style.cursor = 'pointer';
        rotationResetButton.style.flexShrink = '0'; // Don't shrink the button

        // Add slider and button to the container
        rotationSliderControlsContainer.appendChild(rotationSlider);
        rotationSliderControlsContainer.appendChild(rotationResetButton);
        rotationSliderContainer.appendChild(rotationSliderControlsContainer);

        // Function to update rotation speed based on slider value
        const updateRotationSpeed = (value) => {
            if (value === 0) {
                // At 0, set speed to 0 (no movement)
                this.rotationSpeed = 0;
            } else if (value <= 50) {
                // From 1-50, interpolate from very slow to default speed
                const normalizedValue = value / 50; // 0.02 to 1
                const baseSpeed = (2 * Math.PI) / (this.rotationPeriod * 60);
                this.rotationSpeed = baseSpeed * normalizedValue;
            } else {
                // From 51-100, interpolate between default and max speed
                const normalizedValue = (value - 50) / 50; // 0 to 1
                const periodDiff = this.rotationPeriod - this.maxRotationPeriod;
                const adjustedPeriod = this.rotationPeriod - (periodDiff * normalizedValue);
                this.rotationSpeed = (2 * Math.PI) / (adjustedPeriod * 60);
            }

            // If slider is moved to a non-zero value and rotation is off, turn it on
            if (value > 0 && !this.rotationEnabled) {
                this.rotationEnabled = true;
                document.getElementById('mars-rotation-toggle').checked = true;
            }
        };

        rotationSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            updateRotationSpeed(value);
        });

        // Reset button sets slider to default (50) without enabling rotation if it's off
        rotationResetButton.addEventListener('click', () => {
            rotationSlider.value = '50';

            // Calculate the default speed without changing the enabled state
            const baseSpeed = (2 * Math.PI) / (this.rotationPeriod * 60);
            this.rotationSpeed = baseSpeed;

            // Don't enable rotation if it's currently disabled
        });

        this.consoleContent.appendChild(rotationSliderContainer);
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

    getObject() {
        return this.orbitGroup; // Return the orbit group instead of just the Mars group
    }

    update(time) {
        // Rotate the sphere around its axis if rotation is enabled
        if (this.rotationEnabled && this.rotationSpeed > 0) {
            // Rotate around the Y axis (which is tilted due to the group's rotation)
            this.sphere.rotation.y += this.rotationSpeed;
        }

        // Orbit around the Sun (center) if orbit is enabled
        if (this.orbitEnabled && this.orbitSpeed > 0) {
            // Store the current orbit angle
            const previousOrbitAngle = this.orbitGroup.rotation.y;

            // Update the orbit position
            this.orbitGroup.rotation.y += this.orbitSpeed;

            // Calculate the change in orbit angle
            const deltaAngle = this.orbitGroup.rotation.y - previousOrbitAngle;

            // Counter-rotate the Mars group to keep the axis pointing in the same direction
            // This cancels out the rotation that would otherwise be applied to the axis
            this.group.rotation.y -= deltaAngle;
        }
    }

    createOrbitSection() {
        // Create section header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Orbit Controls';
        sectionHeader.style.margin = '15px 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Add orbit toggle
        const orbitToggleContainer = document.createElement('div');
        orbitToggleContainer.style.marginBottom = '10px';

        const orbitToggleLabel = document.createElement('label');
        orbitToggleLabel.textContent = 'Enable Orbit: ';
        orbitToggleLabel.style.marginRight = '10px';

        const orbitToggle = document.createElement('input');
        orbitToggle.type = 'checkbox';
        orbitToggle.checked = this.orbitEnabled;
        orbitToggle.id = 'mars-orbit-toggle';
        orbitToggle.addEventListener('change', (e) => {
            this.orbitEnabled = e.target.checked;

            // If orbit is enabled, disable any close-up views
            if (e.target.checked) {
                if (this.sideViewEnabled) {
                    this.sideViewEnabled = false;
                    document.getElementById('mars-side-view-toggle').checked = false;
                    this.toggleCloseUpView(false, false);
                }
            }
        });

        orbitToggleContainer.appendChild(orbitToggleLabel);
        orbitToggleContainer.appendChild(orbitToggle);
        this.consoleContent.appendChild(orbitToggleContainer);

        // Add orbit speed slider
        const orbitSpeedContainer = document.createElement('div');
        orbitSpeedContainer.style.marginBottom = '15px';

        // Add label for the slider
        const orbitSpeedLabel = document.createElement('label');
        orbitSpeedLabel.textContent = 'Orbit Speed: ';
        orbitSpeedLabel.style.display = 'block';
        orbitSpeedLabel.style.marginBottom = '5px';
        orbitSpeedContainer.appendChild(orbitSpeedLabel);

        // Create slider and reset button container
        const orbitSliderControlsContainer = document.createElement('div');
        orbitSliderControlsContainer.style.display = 'flex';
        orbitSliderControlsContainer.style.alignItems = 'center';
        orbitSliderControlsContainer.style.gap = '10px'; // Space between slider and button

        const orbitSpeedSlider = document.createElement('input');
        orbitSpeedSlider.type = 'range';
        orbitSpeedSlider.min = '0';
        orbitSpeedSlider.max = '100';
        orbitSpeedSlider.value = '50'; // Default to middle position
        orbitSpeedSlider.style.flexGrow = '1'; // Take up available space
        orbitSpeedSlider.id = 'mars-orbit-speed-slider';

        // Create reset button
        const orbitResetButton = document.createElement('button');
        orbitResetButton.textContent = 'Reset';
        orbitResetButton.style.padding = '2px 8px';
        orbitResetButton.style.fontSize = '12px';
        orbitResetButton.style.backgroundColor = '#555';
        orbitResetButton.style.color = 'white';
        orbitResetButton.style.border = '1px solid #777';
        orbitResetButton.style.borderRadius = '3px';
        orbitResetButton.style.cursor = 'pointer';
        orbitResetButton.style.flexShrink = '0'; // Don't shrink the button

        // Add slider and button to the container
        orbitSliderControlsContainer.appendChild(orbitSpeedSlider);
        orbitSliderControlsContainer.appendChild(orbitResetButton);
        orbitSpeedContainer.appendChild(orbitSliderControlsContainer);

        // Function to update orbit speed based on slider value
        const updateOrbitSpeed = (value) => {
            if (value === 0) {
                // At 0, set speed to 0 (no movement)
                this.orbitSpeed = 0;
            } else if (value <= 50) {
                // From 1-50, interpolate from very slow to default speed
                const normalizedValue = value / 50; // 0.02 to 1
                const baseSpeed = (2 * Math.PI) / (this.orbitalPeriod * 60);
                this.orbitSpeed = baseSpeed * normalizedValue;
            } else {
                // From 51-100, interpolate between default and max speed
                const normalizedValue = (value - 50) / 50; // 0 to 1
                const periodDiff = this.orbitalPeriod - this.maxOrbitalPeriod;
                const adjustedPeriod = this.orbitalPeriod - (periodDiff * normalizedValue);
                this.orbitSpeed = (2 * Math.PI) / (adjustedPeriod * 60);
            }

            // If slider is moved to a non-zero value and orbit is off, turn it on
            if (value > 0 && !this.orbitEnabled) {
                this.orbitEnabled = true;
                document.getElementById('mars-orbit-toggle').checked = true;

                // If any close-up view is enabled, disable it
                if (this.sideViewEnabled) {
                    this.sideViewEnabled = false;
                    document.getElementById('mars-side-view-toggle').checked = false;
                    this.toggleCloseUpView(false, false);
                }
            }
        };

        orbitSpeedSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            updateOrbitSpeed(value);
        });

        // Reset button sets slider to default (50) without enabling orbit if it's off
        orbitResetButton.addEventListener('click', () => {
            orbitSpeedSlider.value = '50';

            // Calculate the default speed without changing the enabled state
            const baseSpeed = (2 * Math.PI) / (this.orbitalPeriod * 60);
            this.orbitSpeed = baseSpeed;

            // Don't enable orbit if it's currently disabled
        });

        this.consoleContent.appendChild(orbitSpeedContainer);

        // Add orbit visibility slider
        const orbitVisibilityContainer = document.createElement('div');
        orbitVisibilityContainer.style.marginBottom = '15px';

        const orbitVisibilityLabel = document.createElement('label');
        orbitVisibilityLabel.textContent = 'Orbit Visibility: ';
        orbitVisibilityLabel.style.display = 'block';
        orbitVisibilityLabel.style.marginBottom = '5px';

        const orbitVisibilitySlider = document.createElement('input');
        orbitVisibilitySlider.type = 'range';
        orbitVisibilitySlider.min = '0';
        orbitVisibilitySlider.max = '100';
        orbitVisibilitySlider.value = Math.round(this.orbitVisibility * 100);
        orbitVisibilitySlider.style.width = '100%';
        orbitVisibilitySlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.orbitVisibility = value / 100;

            // Update orbit line opacity
            if (this.orbitLine) {
                this.orbitLine.material.opacity = this.orbitVisibility;

                // Update color based on visibility (white to gray to invisible)
                if (this.orbitVisibility > 0.5) {
                    // Blend from white to gray as visibility goes from 1.0 to 0.5
                    const intensity = 0.5 + this.orbitVisibility * 0.5;
                    this.orbitLine.material.color.setRGB(intensity, intensity, intensity);
                } else {
                    // Keep gray but reduce opacity as visibility goes from 0.5 to 0
                    this.orbitLine.material.color.setRGB(0.5, 0.5, 0.5);
                }
            }
        });

        orbitVisibilityContainer.appendChild(orbitVisibilityLabel);
        orbitVisibilityContainer.appendChild(orbitVisibilitySlider);
        this.consoleContent.appendChild(orbitVisibilityContainer);
    }
}