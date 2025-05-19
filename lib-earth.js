/**
 * Earth model creator
 */
class Earth {
    constructor(diameter = 12000) {
        this.diameter = diameter;
        this.radius = diameter / 2;
        this.axialTilt = 23.4; // degrees
        this.group = new THREE.Group();
        this.latitudeCircles = new THREE.Group(); // Group for latitude circles
        this.consolePane = null;
        this.consoleVisible = false;

        // Rotation properties
        this.rotationEnabled = false; // Disabled by default
        this.rotationSpeed = 0.0005; // Initial rotation speed
        this.maxRotationSpeed = 0.01; // Maximum rotation speed

        // Orbit properties
        this.actualOrbitRadius = 145000000; // 145,000,000 km
        this.orbitRadius = this.actualOrbitRadius / 1000; // Scaled down by 1000
        this.orbitEnabled = false; // Disabled by default
        this.orbitSpeed = 0.0001; // Initial orbit speed
        this.maxOrbitSpeed = 0.001; // Maximum orbit speed
        this.orbitVisibility = 1.0; // Full visibility by default
        this.orbitLine = null;
        this.orbitGroup = new THREE.Group(); // Parent group for orbital motion

        // Season labels properties
        this.seasonLabels = new THREE.Group(); // Group for season labels
        this.seasonLabelsVisible = false; // Hide season labels by default

        // Close-up view properties
        this.closeUpViewEnabled = false;
        this.sideViewEnabled = false;
        this.originalCameraPosition = null;

        this.createSphere();
        this.createAxis();
        this.createLatitudeCircles();
        this.applyTilt();
        this.createOrbit();
        this.createSeasonLabels();
        this.createConsolePane();

        // Hide latitude circles by default
        this.latitudeCircles.visible = false;

        // Hide season labels by default
        this.seasonLabels.visible = false;
    }

    createSphere() {
        const geometry = new THREE.SphereGeometry(this.radius, 64, 32);

        // Load Earth texture
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('images/Earth-texture.jpg');

        // Create material with the texture
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            shininess: 5,
            transparent: false,
            depthWrite: true
        });

        this.sphere = new THREE.Mesh(geometry, material);
        this.group.add(this.sphere);
    }

    createAxis() {
        // Axis should be 10% longer than sphere diameter
        const axisLength = this.diameter * 1.1;

        // Create a cylinder to represent the axis - make it wider (20 pixels)
        const cylinderRadius = 100; // Increased from 5 to 10 (20 pixels wide)
        const cylinderGeometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, axisLength, 16);
        const cylinderMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            depthTest: true,
            depthWrite: false
        });
        this.axis = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

        // Ensure the axis is rendered after the Earth sphere
        this.axis.renderOrder = 1;
        this.group.add(this.axis);
    }

    createLatitudeCircles() {
        const segments = 64;

        // Define latitudes in degrees
        const latitudes = [
            { name: 'Equator', angle: 0, color: 0xff0000 },
            { name: 'Tropic of Cancer', angle: 23.4, color: 0xff8800 },
            { name: 'Tropic of Capricorn', angle: -23.4, color: 0xff8800 },
            { name: 'Arctic Circle', angle: 66.6, color: 0x00aaff },
            { name: 'Antarctic Circle', angle: -66.6, color: 0x00aaff }
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

        // Ensure the orbit line is rendered after the Earth sphere
        this.orbitLine.renderOrder = 1;

        // Position Earth at the correct distance from the center (Aphelion position)
        this.group.position.x = this.orbitRadius;

        // Add Earth group to the orbit group
        this.orbitGroup.add(this.group);

        // Add orbit line to the orbit group
        this.orbitGroup.add(this.orbitLine);
    }

    createSeasonLabels() {
        // Create labels for all four seasons
        const seasons = [
            { name: '', season: 'summer', angle: 0 },       // Aphelion - summer in northern hemisphere
            { name: '', season: 'winter', angle: Math.PI }, // Perihelion - winter in northern hemisphere
            { name: '', season: 'spring', angle: Math.PI/2 },
            { name: '', season: 'autumn', angle: Math.PI*3/2 }
        ];

        seasons.forEach(season => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 256;

            // Draw main letter (A or P) if present
            if (season.name) {
                ctx.font = 'Bold 120px Arial';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.fillText(season.name, 128, 120);
            }

            // Draw season name
            ctx.font = '40px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText(`(${season.season})`, 128, season.name ? 180 : 128);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);

            // Position the label at the correct point on the orbit
            const x = this.orbitRadius * Math.cos(season.angle);
            const z = this.orbitRadius * Math.sin(season.angle);
            sprite.position.set(x, this.radius * 3, z);
            sprite.scale.set(this.radius * 5, this.radius * 5, 1);

            this.seasonLabels.add(sprite);
        });

        // Add season labels to the scene, not to the orbit group
        scene.add(this.seasonLabels);
    }

    applyTilt() {
        // Apply Earth's axial tilt - fixed in space (always pointing in the same direction)
        this.group.rotation.z = THREE.MathUtils.degToRad(this.axialTilt);
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
        title.textContent = 'Earth Controls';
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

        // Front view toggle - commented out as requested
        /*
        const closeUpToggleContainer = document.createElement('div');
        closeUpToggleContainer.style.marginBottom = '10px';

        const closeUpToggleLabel = document.createElement('label');
        closeUpToggleLabel.textContent = 'Front View: ';
        closeUpToggleLabel.style.marginRight = '10px';

        const closeUpToggle = document.createElement('input');
        closeUpToggle.type = 'checkbox';
        closeUpToggle.checked = this.closeUpViewEnabled;
        closeUpToggle.id = 'close-up-toggle';
        closeUpToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                // If side view is enabled, disable it
                if (this.sideViewEnabled) {
                    this.sideViewEnabled = false;
                    document.getElementById('side-view-toggle').checked = false;
                }
                this.toggleCloseUpView(true, false);
            } else {
                this.toggleCloseUpView(false, false);
            }
        });

        closeUpToggleContainer.appendChild(closeUpToggleLabel);
        closeUpToggleContainer.appendChild(closeUpToggle);
        this.consoleContent.appendChild(closeUpToggleContainer);
        */

        // Add side view toggle
        const sideViewToggleContainer = document.createElement('div');
        sideViewToggleContainer.style.marginBottom = '10px';

        const sideViewToggleLabel = document.createElement('label');
        sideViewToggleLabel.textContent = 'Close View: ';
        sideViewToggleLabel.style.marginRight = '10px';

        const sideViewToggle = document.createElement('input');
        sideViewToggle.type = 'checkbox';
        sideViewToggle.checked = this.sideViewEnabled;
        sideViewToggle.id = 'side-view-toggle';
        sideViewToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                // Front view is commented out, so no need to check
                /*if (this.closeUpViewEnabled) {
                    this.closeUpViewEnabled = false;
                    document.getElementById('close-up-toggle').checked = false;
                }*/
                this.toggleCloseUpView(true, true);
                
                // If orbit is enabled, disable it when close view is enabled
                if (this.orbitEnabled) {
                    this.orbitEnabled = false;
                    document.getElementById('orbit-toggle').checked = false;
                }
            } else {
                this.toggleCloseUpView(false, false);
            }
        });

        sideViewToggleContainer.appendChild(sideViewToggleLabel);
        sideViewToggleContainer.appendChild(sideViewToggle);
        this.consoleContent.appendChild(sideViewToggleContainer);

        // Add latitude circles toggle
        const latitudeToggleContainer = document.createElement('div');
        latitudeToggleContainer.style.marginBottom = '10px';

        const latitudeToggleLabel = document.createElement('label');
        latitudeToggleLabel.textContent = 'Show Latitude Circles: ';
        latitudeToggleLabel.style.marginRight = '10px';

        const latitudeToggle = document.createElement('input');
        latitudeToggle.type = 'checkbox';
        latitudeToggle.checked = false; // Explicitly set to false
        this.latitudeCircles.visible = false; // Ensure circles are hidden
        latitudeToggle.addEventListener('change', (e) => {
            this.latitudeCircles.visible = e.target.checked;
        });

        latitudeToggleContainer.appendChild(latitudeToggleLabel);
        latitudeToggleContainer.appendChild(latitudeToggle);
        this.consoleContent.appendChild(latitudeToggleContainer);

        // Add season labels toggle
        const labelsToggleContainer = document.createElement('div');
        labelsToggleContainer.style.marginBottom = '15px';

        const labelsToggleLabel = document.createElement('label');
        labelsToggleLabel.textContent = 'Show Season Labels: ';
        labelsToggleLabel.style.marginRight = '10px';

        const labelsToggle = document.createElement('input');
        labelsToggle.type = 'checkbox';
        labelsToggle.checked = this.seasonLabelsVisible;
        labelsToggle.addEventListener('change', (e) => {
            this.seasonLabelsVisible = e.target.checked;
            this.seasonLabels.visible = e.target.checked;
        });

        labelsToggleContainer.appendChild(labelsToggleLabel);
        labelsToggleContainer.appendChild(labelsToggle);
        this.consoleContent.appendChild(labelsToggleContainer);
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
        rotationToggle.id = 'rotation-toggle';
        rotationToggle.addEventListener('change', (e) => {
            this.rotationEnabled = e.target.checked;
        });

        rotationToggleContainer.appendChild(rotationToggleLabel);
        rotationToggleContainer.appendChild(rotationToggle);
        this.consoleContent.appendChild(rotationToggleContainer);

        // Add rotation speed slider
        const rotationSliderContainer = document.createElement('div');
        rotationSliderContainer.style.marginBottom = '15px';

        const rotationSliderLabel = document.createElement('label');
        rotationSliderLabel.textContent = 'Rotation Speed: ';
        rotationSliderLabel.style.display = 'block';
        rotationSliderLabel.style.marginBottom = '5px';

        const rotationSlider = document.createElement('input');
        rotationSlider.type = 'range';
        rotationSlider.min = '0';
        rotationSlider.max = '500';
        rotationSlider.value = Math.round((this.rotationSpeed / this.maxRotationSpeed) * 100);
        rotationSlider.style.width = '100%';
        rotationSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.rotationSpeed = (value / 100) * this.maxRotationSpeed;

            // If slider is moved to a non-zero value and rotation is off, turn it on
            if (value > 0 && !this.rotationEnabled) {
                this.rotationEnabled = true;
                document.getElementById('rotation-toggle').checked = true;
            }
        });

        rotationSliderContainer.appendChild(rotationSliderLabel);
        rotationSliderContainer.appendChild(rotationSlider);
        this.consoleContent.appendChild(rotationSliderContainer);
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
        orbitToggle.id = 'orbit-toggle';
        orbitToggle.addEventListener('change', (e) => {
            this.orbitEnabled = e.target.checked;

            // If orbit is enabled, disable any close-up views
            if (e.target.checked) {
                if (this.sideViewEnabled) {
                    this.sideViewEnabled = false;
                    document.getElementById('side-view-toggle').checked = false;
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

        const orbitSpeedLabel = document.createElement('label');
        orbitSpeedLabel.textContent = 'Orbit Speed: ';
        orbitSpeedLabel.style.display = 'block';
        orbitSpeedLabel.style.marginBottom = '5px';

        const orbitSpeedSlider = document.createElement('input');
        orbitSpeedSlider.type = 'range';
        orbitSpeedSlider.min = '0';
        orbitSpeedSlider.max = '500';
        orbitSpeedSlider.value = Math.round((this.orbitSpeed / this.maxOrbitSpeed) * 100);
        orbitSpeedSlider.style.width = '100%';
        orbitSpeedSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.orbitSpeed = (value / 100) * this.maxOrbitSpeed;

            // If slider is moved to a non-zero value and orbit is off, turn it on
            if (value > 0 && !this.orbitEnabled) {
                this.orbitEnabled = true;
                document.getElementById('orbit-toggle').checked = true;

                // If any close-up view is enabled, disable it
                if (this.sideViewEnabled) {
                    this.sideViewEnabled = false;
                    document.getElementById('side-view-toggle').checked = false;
                    this.toggleCloseUpView(false, false);
                }
            }
        });

        orbitSpeedContainer.appendChild(orbitSpeedLabel);
        orbitSpeedContainer.appendChild(orbitSpeedSlider);
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
        return this.orbitGroup; // Return the orbit group instead of just the Earth group
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

            // Get the current Earth position in world space
            const earthWorldPos = new THREE.Vector3();
            this.sphere.getWorldPosition(earthWorldPos);

            // Position camera close to Earth but slightly offset
            const closeUpDistance = this.radius * 3; // Distance to achieve 80% vertical fill

            // Calculate camera position based on Earth's current position and view type
            let cameraPos;

            if (sideView) {
                // Side view - position camera to see the axis tilt from the side
                cameraPos = {
                    x: earthWorldPos.x,
                    y: earthWorldPos.y,
                    z: earthWorldPos.z + this.radius * 3
                };
                // Set camera target to Earth's position
                camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
                camera.lookAt(earthWorldPos);

                if (controls) {
                    controls.target.copy(earthWorldPos);
                    controls.update();
                }
                return; // Skip the default camera positioning below
            } else {
                // Front view - position camera to see the Earth from the front
                cameraPos = {
                    x: earthWorldPos.x - closeUpDistance,
                    y: earthWorldPos.y,
                    z: earthWorldPos.z
                };
            }

            // Only for front view - side view already handled above
            if (!sideView) {
                // Position camera looking at Earth
                camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
                camera.lookAt(earthWorldPos);

                // Update orbit controls to target Earth
                if (controls) {
                    controls.target.copy(earthWorldPos);
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
            document.getElementById('rotation-toggle').checked = false;
            document.getElementById('orbit-toggle').checked = false;

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
                document.getElementById('rotation-toggle').checked = true;
            }

            if (this.prevOrbitEnabled) {
                this.orbitEnabled = true;
                document.getElementById('orbit-toggle').checked = true;
            }
        }
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

            // Counter-rotate the Earth group to keep the axis pointing in the same direction
            // This cancels out the rotation that would otherwise be applied to the axis
            this.group.rotation.y -= deltaAngle;
        }
    }
}