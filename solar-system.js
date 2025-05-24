/**
 * Solar System model creator
 */
class SolarSystem {
    constructor() {
        // Main group for the entire solar system
        this.group = new THREE.Group();

        // Store celestial bodies
        this.sun = null;
        this.earth = null;
        this.mars = null;
        this.planets = [];

        // Control panel
        this.consolePane = null;
        this.consoleVisible = false;

        // Location camera for Earth locations
        this.locationCamera = new LocationCamera();

        // Store camera settings for different views
        this.cameraSettings = {
            'topView': { horizontalAngle: Math.PI, verticalAngle: 0, elevation: 0.01 },
            'sideView': { horizontalAngle: Math.PI, verticalAngle: 0, elevation: 0.01 },
            'sunView': { horizontalAngle: Math.PI, verticalAngle: 0, elevation: 0.01 },
            'earthView': { horizontalAngle: Math.PI, verticalAngle: 0, elevation: 0.01 },
            'budapest': { horizontalAngle: Math.PI, verticalAngle: 0.0, elevation: 0.01 },
            'kiruna': { horizontalAngle: 0, verticalAngle: 0.0, elevation: 0.01 }
        };

        // Current active view
        this.activeView = null;
        
        // Flag to track if we're in a location view
        this.inLocationView = false;

        // References to camera control sliders
        this.horizontalInput = null;
        this.verticalInput = null;
        this.elevationInput = null;

        // Create the solar system
        this.createSun();
        this.createEarth();
        this.createMars();
        this.createConsolePane();
    }

    createSun() {
        this.sun = new Sun();
        this.group.add(this.sun.getObject());
    }
    
    createMars() {
        this.mars = new Mars(6000); // 6000m diameter
        this.planets.push(this.mars);
        this.group.add(this.mars.getObject());
    }

    createEarth() {
        this.earth = new Earth(12000); // 12000m diameter
        this.planets.push(this.earth);
        this.group.add(this.earth.getObject());

        // Make solar system instance globally available for LocationCamera
        window.solarSystem = this;

        // Set Earth reference in location camera
        this.locationCamera.setEarth(this.earth);

        // Store location markers for easy access
        this.locationMarkers = [];

        // Add Budapest marker to Earth
        const budapestMarker = new LocationMarker(LOCATIONS.BUDAPEST);
        budapestMarker.attachToPlanet(this.earth);
        this.locationMarkers.push(budapestMarker);

        // Add Kiruna marker to Earth
        const kirunaMarker = new LocationMarker(LOCATIONS.KIRUNA);
        kirunaMarker.attachToPlanet(this.earth);
        this.locationMarkers.push(kirunaMarker);

        // Listen for toggle location markers event
        document.addEventListener('toggleLocationMarkers', (e) => {
            this.toggleLocationMarkers(e.detail.visible);
        });
    }

    toggleLocationMarkers(visible) {
        if (this.locationMarkers && this.locationMarkers.length > 0) {
            this.locationMarkers.forEach(marker => {
                marker.setVisible(visible);
            });
        }
    }

    createConsolePane() {
        // Create console pane
        this.consolePane = document.createElement('div');
        this.consolePane.className = 'console-pane';
        this.consolePane.style.position = 'absolute';
        this.consolePane.style.bottom = '20px';
        this.consolePane.style.left = '20px';
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

        // Add title to header
        const title = document.createElement('h3');
        title.textContent = 'Solar System Controls';
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

        // Create global view section
        this.createViewSection();

        // Add to document
        document.body.appendChild(this.consolePane);
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

    createViewSection() {
        // Create section header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Global View';
        sectionHeader.style.margin = '0 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Add buttons for different views
        this.addViewButton('Top View', () => this.setTopView());
        this.addViewButton('Side View', () => this.setSideView());
        this.addViewButton('Sun View', () => this.setSunView());
        this.addViewButton('Earth View', () => this.setEarthView());

        // Create location views section
        this.createLocationViewsSection();
        
        // Create rotation controls section
        this.createRotationControlsSection();
        
        // Create orbit controls section
        this.createOrbitControlsSection();

        // Add toggle for showing individual controls
        this.addToggle('Show Sun Controls', false, (checked) => {
            if (checked) {
                this.sun.show();
            } else {
                this.sun.hide();
            }
        });

        this.addToggle('Show Earth Controls', false, (checked) => {
            if (checked && this.earth) {
                this.earth.show();
            } else if (this.earth) {
                this.earth.hide();
            }
        });
        
        this.addToggle('Show Mars Controls', false, (checked) => {
            if (checked && this.mars) {
                this.mars.show();
            } else if (this.mars) {
                this.mars.hide();
            }
        });
    }

    addViewButton(label, clickHandler) {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.marginBottom = '10px';

        const button = document.createElement('button');
        button.textContent = label;
        button.style.width = '100%';
        button.style.padding = '8px';
        button.style.backgroundColor = '#444';
        button.style.color = 'white';
        button.style.border = '1px solid #666';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.addEventListener('click', clickHandler);

        buttonContainer.appendChild(button);
        this.consoleContent.appendChild(buttonContainer);
    }

    addToggle(label, initialState, changeHandler) {
        const toggleContainer = document.createElement('div');
        toggleContainer.style.marginBottom = '10px';
        toggleContainer.style.display = 'flex';
        toggleContainer.style.justifyContent = 'space-between';
        toggleContainer.style.alignItems = 'center';

        const toggleLabel = document.createElement('label');
        toggleLabel.textContent = label;

        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = initialState;
        toggle.addEventListener('change', (e) => {
            changeHandler(e.target.checked);
        });

        toggleContainer.appendChild(toggleLabel);
        toggleContainer.appendChild(toggle);
        this.consoleContent.appendChild(toggleContainer);
    }

    setTopView() {
        if (!camera) return;

        // If we're in a location view, deactivate it first
        if (this.locationCamera && this.locationCamera.isActive) {
            this.locationCamera.deactivateView();
            
            // We're exiting a location view
            if (this.inLocationView) {
                this.inLocationView = false;
                
                // Restore location markers based on Earth Controls panel setting
                const markerToggle = document.getElementById('location-markers-toggle');
                if (markerToggle) {
                    this.toggleLocationMarkers(markerToggle.checked);
                }
            }
        }

        // Find the largest orbit radius among all planets
        let maxOrbitRadius = 1500000; // Default value

        if (this.planets.length > 0) {
            maxOrbitRadius = Math.max(...this.planets.map(planet => planet.orbitRadius || 0));
        }

        // Calculate camera distance based on field of view to ensure the entire orbit is visible
        const orbitDiameter = maxOrbitRadius * 2;
        const aspectRatio = window.innerWidth / window.innerHeight;
        const vFov = camera.fov * Math.PI / 180;

        // Calculate the required distance based on the smaller dimension (width or height)
        let distance;
        if (aspectRatio >= 1.0) {
            // Width is greater than or equal to height, so height is the limiting factor
            distance = orbitDiameter / (2 * Math.tan(vFov / 2));
        } else {
            // Height is greater than width, so width is the limiting factor
            distance = orbitDiameter / (2 * Math.tan((vFov * aspectRatio) / 2));
        }

        // Add 20% margin to ensure the orbit is fully visible with larger orbit radius
        distance *= 1.2;

        // Set far clipping plane to ensure the camera can see distant objects
        camera.far = distance * 10;
        camera.updateProjectionMatrix();

        camera.position.set(0, distance, 0);
        camera.lookAt(0, 0, 0);

        if (controls) {
            controls.target.set(0, 0, 0);
            controls.update();
        }

        // Set active view and update camera controls
        this.activeView = 'topView';
        this.updateCameraControls();
    }

    setSideView() {
        if (!camera) return;

        // If we're in a location view, deactivate it first
        if (this.locationCamera && this.locationCamera.isActive) {
            this.locationCamera.deactivateView();
            
            // We're exiting a location view
            if (this.inLocationView) {
                this.inLocationView = false;
                
                // Restore location markers based on Earth Controls panel setting
                const markerToggle = document.getElementById('location-markers-toggle');
                if (markerToggle) {
                    this.toggleLocationMarkers(markerToggle.checked);
                }
            }
        }

        // Position camera to the side of the solar system
        const maxOrbitRadius = this.earth ? this.earth.orbitRadius : 150000;
        const distance = maxOrbitRadius * 1.5;

        // Set far clipping plane to ensure the camera can see distant objects
        camera.far = distance * 10;
        camera.updateProjectionMatrix();

        camera.position.set(0, 0, distance);
        camera.lookAt(0, 0, 0);

        if (controls) {
            controls.target.set(0, 0, 0);
            controls.update();
        }

        // Set active view and update camera controls
        this.activeView = 'sideView';
        this.updateCameraControls();
    }

    setSunView() {
        if (!camera || !this.sun) return;

        // If we're in a location view, deactivate it first
        if (this.locationCamera && this.locationCamera.isActive) {
            this.locationCamera.deactivateView();
            
            // We're exiting a location view
            if (this.inLocationView) {
                this.inLocationView = false;
                
                // Restore location markers based on Earth Controls panel setting
                const markerToggle = document.getElementById('location-markers-toggle');
                if (markerToggle) {
                    this.toggleLocationMarkers(markerToggle.checked);
                }
            }
        }

        // Position camera to view the Sun up close
        const viewFactor = 0.8; // 80% of vertical screen
        const distance = this.sun.diameter / (2 * Math.tan((camera.fov * Math.PI / 180) / 2) * viewFactor);

        camera.position.set(0, 0, distance);
        camera.lookAt(0, 0, 0);

        if (controls) {
            controls.target.set(0, 0, 0);
            controls.update();
        }

        // Set active view and update camera controls
        this.activeView = 'sunView';
        this.updateCameraControls();
    }

    setEarthView() {
        if (!camera || !this.earth) return;

        // If we're in a location view, deactivate it first
        if (this.locationCamera && this.locationCamera.isActive) {
            this.locationCamera.deactivateView();
            
            // We're exiting a location view
            if (this.inLocationView) {
                this.inLocationView = false;
                
                // Restore location markers based on Earth Controls panel setting
                const markerToggle = document.getElementById('location-markers-toggle');
                if (markerToggle) {
                    this.toggleLocationMarkers(markerToggle.checked);
                }
            }
        }

        // Get Earth's current position
        const earthPos = new THREE.Vector3();
        this.earth.group.getWorldPosition(earthPos);

        // Position camera to view Earth up close
        const viewFactor = 0.5; // 50% of vertical screen
        const distance = this.earth.diameter / (2 * Math.tan((camera.fov * Math.PI / 180) / 2) * viewFactor);

        // Calculate camera position
        const cameraPos = new THREE.Vector3();
        cameraPos.copy(earthPos);
        cameraPos.z += distance;

        camera.position.copy(cameraPos);
        camera.lookAt(earthPos);

        if (controls) {
            controls.target.copy(earthPos);
            controls.update();
        }

        // Set active view and update camera controls
        this.activeView = 'earthView';
        this.updateCameraControls();
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
        // Update sun
        if (this.sun) {
            this.sun.update(time);
        }

        // Update earth and other planets
        if (this.earth) {
            this.earth.update(time);
        }
        
        // Update Mars
        if (this.mars) {
            this.mars.update(time);
        }

        // Update location camera if active
        if (this.locationCamera) {
            this.locationCamera.update();
        }
    }

    createLocationViewsSection() {
        // Create section header
        const locationHeader = document.createElement('h4');
        locationHeader.textContent = 'Location Views';
        locationHeader.style.margin = '15px 0 10px 0';
        locationHeader.style.borderBottom = '1px solid #555';
        locationHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(locationHeader);

        // Add buttons for each location marker
        if (this.locationMarkers && this.locationMarkers.length > 0) {
            this.locationMarkers.forEach(marker => {
                this.addViewButton(`View from ${marker.options.name}`, () => {
                    if (this.locationCamera) {
                        // Set flag that we're entering a location view
                        this.inLocationView = true;
                        
                        // Hide markers when entering location view
                        this.toggleLocationMarkers(false);
                        
                        this.locationCamera.activateView(marker);
                        // Set active view based on location name
                        this.activeView = marker.options.name.toLowerCase();
                        this.updateCameraControls();
                    }
                });
            });
        }

        // Add camera control buttons
        this.createCameraControlButtons();
    }

    createCameraControlButtons() {
        // Create section header
        const controlHeader = document.createElement('h4');
        controlHeader.textContent = 'Camera Controls';
        controlHeader.style.margin = '15px 0 10px 0';
        controlHeader.style.borderBottom = '1px solid #555';
        controlHeader.style.paddingBottom = '5px';
        controlHeader.style.marginTop = '25px'; // Add extra margin to separate from previous section
        this.consoleContent.appendChild(controlHeader);

        // Add camera elevation control
        const elevationContainer = document.createElement('div');
        elevationContainer.style.marginBottom = '15px';
        elevationContainer.style.display = 'flex';
        elevationContainer.style.justifyContent = 'space-between';
        elevationContainer.style.alignItems = 'center';

        const elevationLabel = document.createElement('label');
        elevationLabel.textContent = 'Camera Height:';
        elevationLabel.style.marginRight = '10px';

        const elevationInput = document.createElement('input');
        elevationInput.type = 'range';
        elevationInput.min = '0.001';
        elevationInput.max = '0.05';
        elevationInput.step = '0.001';
        elevationInput.value = '0.01';
        elevationInput.style.flexGrow = '1';
        elevationInput.addEventListener('input', (e) => {
            const elevation = parseFloat(e.target.value);

            // Save the current setting for the active view
            if (this.activeView && this.cameraSettings[this.activeView]) {
                this.cameraSettings[this.activeView].elevation = elevation;
            }

            // Apply to location camera if active
            if (this.locationCamera && this.locationCamera.isActive) {
                this.locationCamera.cameraElevation = elevation;
                this.locationCamera.updateView();
            } else if (camera && this.activeView) {
                // For global views, adjust camera distance
                const target = new THREE.Vector3(0, 0, 0);
                const direction = new THREE.Vector3().subVectors(camera.position, target).normalize();
                const distance = this.earth ? this.earth.radius * (20 + elevation * 200) : 150000 * elevation * 10;
                camera.position.copy(direction.multiplyScalar(distance));
                camera.lookAt(target);
                if (controls) controls.update();
            }
        });

        // Store reference to the elevation slider
        this.elevationInput = elevationInput;

        elevationContainer.appendChild(elevationLabel);
        elevationContainer.appendChild(elevationInput);
        this.consoleContent.appendChild(elevationContainer);

        // Add horizontal angle control
        const horizontalContainer = document.createElement('div');
        horizontalContainer.style.marginBottom = '15px';
        horizontalContainer.style.display = 'flex';
        horizontalContainer.style.justifyContent = 'space-between';
        horizontalContainer.style.alignItems = 'center';

        const horizontalLabel = document.createElement('label');
        horizontalLabel.textContent = 'Horizontal Angle:';
        horizontalLabel.style.marginRight = '10px';

        const horizontalInput = document.createElement('input');
        horizontalInput.type = 'range';

        // Calculate min and max based on camera angle from LocationCamera
        const cameraAngle = -this.locationCamera.cameraHorizontalAngle;
        const minValue = cameraAngle - Math.PI;
        const maxValue = cameraAngle + Math.PI;

        console.log("cameraAngle: " + cameraAngle + ", minValue: " + minValue  + " maxValue: " + maxValue);

        horizontalInput.min = minValue.toString();
        horizontalInput.max = maxValue.toString();
        horizontalInput.step = '0.01';
        horizontalInput.value = cameraAngle.toString();
        horizontalInput.style.flexGrow = '1';
        horizontalInput.addEventListener('input', (e) => {
            const sliderValue = parseFloat(e.target.value);

            // Use slider value directly as camera angle (negated)
            let cameraAngle = -sliderValue;

            // Save the current setting for the active view
            if (this.activeView && this.cameraSettings[this.activeView]) {
                this.cameraSettings[this.activeView].horizontalAngle = cameraAngle;
            }

            // Apply to location camera if active
            if (this.locationCamera && this.locationCamera.isActive) {
                this.locationCamera.cameraHorizontalAngle = cameraAngle;
                this.locationCamera.updateView();
            } else if (camera && this.activeView) {
                // For global views, rotate camera around y-axis
                const target = new THREE.Vector3(0, 0, 0);
                const distance = camera.position.distanceTo(target);
                const angle = cameraAngle;
                
                // Keep current vertical angle (y position)
                const y = camera.position.y;
                
                // Calculate new x and z positions
                camera.position.x = distance * Math.sin(angle);
                camera.position.z = distance * Math.cos(angle);
                camera.position.y = y; // Maintain vertical position
                
                camera.lookAt(target);
                if (controls) controls.update();
            }
        });

        // Store reference to the horizontal slider
        this.horizontalInput = horizontalInput;

        horizontalContainer.appendChild(horizontalLabel);
        horizontalContainer.appendChild(horizontalInput);
        this.consoleContent.appendChild(horizontalContainer);

        // Add vertical angle control
        const verticalContainer = document.createElement('div');
        verticalContainer.style.marginBottom = '15px';
        verticalContainer.style.display = 'flex';
        verticalContainer.style.justifyContent = 'space-between';
        verticalContainer.style.alignItems = 'center';

        const verticalLabel = document.createElement('label');
        verticalLabel.textContent = 'Vertical Angle:';
        verticalLabel.style.marginRight = '10px';

        const verticalInput = document.createElement('input');
        verticalInput.type = 'range';
        verticalInput.min = '-1.47'; // -PI/2 + 0.1
        verticalInput.max = '1.47';  // PI/2 - 0.1
        verticalInput.step = '0.01';
        verticalInput.value = this.locationCamera ? this.locationCamera.cameraVerticalAngle.toString() : '1.0';
        verticalInput.style.flexGrow = '1';
        verticalInput.addEventListener('input', (e) => {
            const verticalAngle = parseFloat(e.target.value);

            // Save the current setting for the active view
            if (this.activeView && this.cameraSettings[this.activeView]) {
                this.cameraSettings[this.activeView].verticalAngle = verticalAngle;
            }

            // Apply to location camera if active
            if (this.locationCamera && this.locationCamera.isActive) {
                this.locationCamera.cameraVerticalAngle = verticalAngle;
                this.locationCamera.updateView();
            } else if (camera && this.activeView) {
                // For global views, adjust camera height
                const target = new THREE.Vector3(0, 0, 0);
                const horizontalDistance = Math.sqrt(camera.position.x * camera.position.x + camera.position.z * camera.position.z);
                const distance = camera.position.distanceTo(target);
                
                // Calculate new y position based on vertical angle
                // Constrain vertical angle to avoid flipping
                const constrainedAngle = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, verticalAngle));
                camera.position.y = distance * Math.sin(constrainedAngle);
                
                // Adjust horizontal distance to maintain overall distance
                const newHorizontalDistance = distance * Math.cos(constrainedAngle);
                const ratio = newHorizontalDistance / horizontalDistance;
                
                camera.position.x *= ratio;
                camera.position.z *= ratio;
                
                camera.lookAt(target);
                if (controls) controls.update();
            }
        });

        // Store reference to the vertical slider
        this.verticalInput = verticalInput;

        verticalContainer.appendChild(verticalLabel);
        verticalContainer.appendChild(verticalInput);
        this.consoleContent.appendChild(verticalContainer);

        elevationContainer.appendChild(elevationLabel);
        elevationContainer.appendChild(elevationInput);
        this.consoleContent.appendChild(elevationContainer);

        // Create container for arrow buttons
        const arrowContainer = document.createElement('div');
        arrowContainer.style.display = 'grid';
        arrowContainer.style.gridTemplateColumns = '1fr 1fr 1fr';
        arrowContainer.style.gridTemplateRows = '1fr 1fr 1fr';
        arrowContainer.style.gap = '5px';
        arrowContainer.style.width = '120px';
        arrowContainer.style.margin = '0 auto 15px auto';

        // Create up arrow button
        const upButton = document.createElement('button');
        upButton.innerHTML = '&#9650;'; // Up arrow symbol
        upButton.style.gridColumn = '2';
        upButton.style.gridRow = '1';
        upButton.style.padding = '8px';
        upButton.style.backgroundColor = '#444';
        upButton.style.color = 'white';
        upButton.style.border = '1px solid #666';
        upButton.style.borderRadius = '4px';
        upButton.style.cursor = 'pointer';
        upButton.addEventListener('click', () => {
            if (this.activeView && this.cameraSettings[this.activeView]) {
                // Update the camera settings
                const newAngle = this.cameraSettings[this.activeView].verticalAngle - 0.1;
                this.cameraSettings[this.activeView].verticalAngle = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, newAngle));

                // Apply to location camera if active
                if (this.locationCamera && this.locationCamera.isActive) {
                    this.locationCamera.cameraVerticalAngle = this.cameraSettings[this.activeView].verticalAngle;
                    this.locationCamera.updateView();
                }

                // Update the vertical slider
                if (this.verticalInput) {
                    this.verticalInput.value = this.cameraSettings[this.activeView].verticalAngle;
                }
            }
        });

        // Create down arrow button
        const downButton = document.createElement('button');
        downButton.innerHTML = '&#9660;'; // Down arrow symbol
        downButton.style.gridColumn = '2';
        downButton.style.gridRow = '3';
        downButton.style.padding = '8px';
        downButton.style.backgroundColor = '#444';
        downButton.style.color = 'white';
        downButton.style.border = '1px solid #666';
        downButton.style.borderRadius = '4px';
        downButton.style.cursor = 'pointer';
        downButton.addEventListener('click', () => {
            if (this.activeView && this.cameraSettings[this.activeView]) {
                // Update the camera settings
                const newAngle = this.cameraSettings[this.activeView].verticalAngle + 0.1;
                this.cameraSettings[this.activeView].verticalAngle = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, newAngle));

                // Apply to location camera if active
                if (this.locationCamera && this.locationCamera.isActive) {
                    this.locationCamera.cameraVerticalAngle = this.cameraSettings[this.activeView].verticalAngle;
                    this.locationCamera.updateView();
                }

                // Update the vertical slider
                if (this.verticalInput) {
                    this.verticalInput.value = this.cameraSettings[this.activeView].verticalAngle;
                }
            }
        });

        // Create left arrow button
        const leftButton = document.createElement('button');
        leftButton.innerHTML = '&#9668;'; // Left arrow symbol
        leftButton.style.gridColumn = '1';
        leftButton.style.gridRow = '2';
        leftButton.style.padding = '8px';
        leftButton.style.backgroundColor = '#444';
        leftButton.style.color = 'white';
        leftButton.style.border = '1px solid #666';
        leftButton.style.borderRadius = '4px';
        leftButton.style.cursor = 'pointer';
        leftButton.addEventListener('click', () => {
            if (this.activeView && this.cameraSettings[this.activeView]) {
                // Update the camera settings
                this.cameraSettings[this.activeView].horizontalAngle += 0.1;
                // Normalize angle to 0-2π range
                this.cameraSettings[this.activeView].horizontalAngle %= (2 * Math.PI);
                if (this.cameraSettings[this.activeView].horizontalAngle < 0) {
                    this.cameraSettings[this.activeView].horizontalAngle += 2 * Math.PI;
                }

                // Apply to location camera if active
                if (this.locationCamera && this.locationCamera.isActive) {
                    this.locationCamera.cameraHorizontalAngle = this.cameraSettings[this.activeView].horizontalAngle;
                    this.locationCamera.updateView();
                }

                // Update the horizontal slider
                if (this.horizontalInput) {
                    // Convert camera angle to slider value
                    let sliderValue;
                    if (this.cameraSettings[this.activeView].horizontalAngle <= Math.PI) {
                        // 0->PI maps directly
                        sliderValue = this.cameraSettings[this.activeView].horizontalAngle;
                    } else {
                        // PI->2*PI maps to PI->0
                        sliderValue = 2 * Math.PI - this.cameraSettings[this.activeView].horizontalAngle;
                    }
                    this.horizontalInput.value = sliderValue;
                }
            }
        });

        // Create right arrow button
        const rightButton = document.createElement('button');
        rightButton.innerHTML = '&#9658;'; // Right arrow symbol
        rightButton.style.gridColumn = '3';
        rightButton.style.gridRow = '2';
        rightButton.style.padding = '8px';
        rightButton.style.backgroundColor = '#444';
        rightButton.style.color = 'white';
        rightButton.style.border = '1px solid #666';
        rightButton.style.borderRadius = '4px';
        rightButton.style.cursor = 'pointer';
        rightButton.addEventListener('click', () => {
            if (this.activeView && this.cameraSettings[this.activeView]) {
                // Update the camera settings
                this.cameraSettings[this.activeView].horizontalAngle -= 0.1;
                // Normalize angle to 0-2π range
                this.cameraSettings[this.activeView].horizontalAngle %= (2 * Math.PI);
                if (this.cameraSettings[this.activeView].horizontalAngle < 0) {
                    this.cameraSettings[this.activeView].horizontalAngle += 2 * Math.PI;
                }

                // Apply to location camera if active
                if (this.locationCamera && this.locationCamera.isActive) {
                    this.locationCamera.cameraHorizontalAngle = this.cameraSettings[this.activeView].horizontalAngle;
                    this.locationCamera.updateView();
                }

                // Update the horizontal slider
                if (this.horizontalInput) {
                    // Convert camera angle to slider value
                    let sliderValue;
                    if (this.cameraSettings[this.activeView].horizontalAngle <= Math.PI) {
                        // 0->PI maps directly
                        sliderValue = this.cameraSettings[this.activeView].horizontalAngle;
                    } else {
                        // PI->2*PI maps to PI->0
                        sliderValue = 2 * Math.PI - this.cameraSettings[this.activeView].horizontalAngle;
                    }
                    this.horizontalInput.value = sliderValue;
                }
            }
        });

        // Add buttons to container
        arrowContainer.appendChild(upButton);
        arrowContainer.appendChild(downButton);
        arrowContainer.appendChild(leftButton);
        arrowContainer.appendChild(rightButton);

        // Add container to console content
        this.consoleContent.appendChild(arrowContainer);

        // Add instructions
        const instructions = document.createElement('div');
        instructions.style.fontSize = '12px';
        instructions.style.textAlign = 'center';
        instructions.style.marginBottom = '15px';
        instructions.style.marginTop = '10px';
        instructions.textContent = 'Use arrows to rotate camera view';
        this.consoleContent.appendChild(instructions);
    }

    createRotationControlsSection() {
        // Create section header
        const rotationHeader = document.createElement('h4');
        rotationHeader.textContent = 'Rotation Controls';
        rotationHeader.style.margin = '15px 0 10px 0';
        rotationHeader.style.borderBottom = '1px solid #555';
        rotationHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(rotationHeader);
        
        // Add rotation toggle for all planets
        const rotationToggleContainer = document.createElement('div');
        rotationToggleContainer.style.marginBottom = '10px';
        
        const rotationToggleLabel = document.createElement('label');
        rotationToggleLabel.textContent = 'Enable All Rotation: ';
        rotationToggleLabel.style.marginRight = '10px';
        
        const rotationToggle = document.createElement('input');
        rotationToggle.type = 'checkbox';
        rotationToggle.checked = false;
        rotationToggle.id = 'global-rotation-toggle';
        rotationToggle.addEventListener('change', (e) => {
            // Apply to all planets
            if (this.planets && this.planets.length > 0) {
                this.planets.forEach(planet => {
                    planet.rotationEnabled = e.target.checked;
                    // Update planet's own control if it exists
                    const planetToggle = document.getElementById(`${planet.constructor.name.toLowerCase()}-rotation-toggle`);
                    if (planetToggle) {
                        planetToggle.checked = e.target.checked;
                    }
                });
            }
        });
        
        rotationToggleContainer.appendChild(rotationToggleLabel);
        rotationToggleContainer.appendChild(rotationToggle);
        this.consoleContent.appendChild(rotationToggleContainer);
        
        // Add rotation speed slider
        const rotationSliderContainer = document.createElement('div');
        rotationSliderContainer.style.marginBottom = '15px';
        
        // Add label for the slider
        const rotationSliderLabel = document.createElement('label');
        rotationSliderLabel.textContent = 'Global Rotation Speed: ';
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
        rotationSlider.id = 'global-rotation-speed-slider';
        
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
        
        rotationSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            // Apply to all planets
            if (this.planets && this.planets.length > 0) {
                this.planets.forEach(planet => {
                    if (value === 0) {
                        planet.rotationSpeed = 0;
                    } else if (value <= 50) {
                        const normalizedValue = value / 50;
                        const baseSpeed = (2 * Math.PI) / (planet.rotationPeriod * 60);
                        planet.rotationSpeed = baseSpeed * normalizedValue;
                    } else {
                        const normalizedValue = (value - 50) / 50;
                        const periodDiff = planet.rotationPeriod - planet.maxRotationPeriod;
                        const adjustedPeriod = planet.rotationPeriod - (periodDiff * normalizedValue);
                        planet.rotationSpeed = (2 * Math.PI) / (adjustedPeriod * 60);
                    }
                    
                    // Enable rotation if slider is not at 0
                    if (value > 0) {
                        planet.rotationEnabled = true;
                        // Update planet's own control if it exists
                        const planetToggle = document.getElementById(`${planet.constructor.name.toLowerCase()}-rotation-toggle`);
                        if (planetToggle) {
                            planetToggle.checked = true;
                        }
                    }
                });
                
                // Update global toggle
                if (value > 0) {
                    rotationToggle.checked = true;
                }
            }
        });
        
        // Reset button sets slider to default (50)
        rotationResetButton.addEventListener('click', () => {
            rotationSlider.value = '50';
            // Apply default speed to all planets
            if (this.planets && this.planets.length > 0) {
                this.planets.forEach(planet => {
                    const baseSpeed = (2 * Math.PI) / (planet.rotationPeriod * 60);
                    planet.rotationSpeed = baseSpeed;
                });
            }
        });
        
        // Add slider and button to the container
        rotationSliderControlsContainer.appendChild(rotationSlider);
        rotationSliderControlsContainer.appendChild(rotationResetButton);
        rotationSliderContainer.appendChild(rotationSliderControlsContainer);
        
        this.consoleContent.appendChild(rotationSliderContainer);
    }
    
    createOrbitControlsSection() {
        // Create section header
        const orbitHeader = document.createElement('h4');
        orbitHeader.textContent = 'Orbit Controls';
        orbitHeader.style.margin = '15px 0 10px 0';
        orbitHeader.style.borderBottom = '1px solid #555';
        orbitHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(orbitHeader);
        
        // Add orbit toggle for all planets
        const orbitToggleContainer = document.createElement('div');
        orbitToggleContainer.style.marginBottom = '10px';
        
        const orbitToggleLabel = document.createElement('label');
        orbitToggleLabel.textContent = 'Enable All Orbits: ';
        orbitToggleLabel.style.marginRight = '10px';
        
        const orbitToggle = document.createElement('input');
        orbitToggle.type = 'checkbox';
        orbitToggle.checked = false;
        orbitToggle.id = 'global-orbit-toggle';
        orbitToggle.addEventListener('change', (e) => {
            // Apply to all planets
            if (this.planets && this.planets.length > 0) {
                this.planets.forEach(planet => {
                    planet.orbitEnabled = e.target.checked;
                    // Update planet's own control if it exists
                    const planetToggle = document.getElementById(`${planet.constructor.name.toLowerCase()}-orbit-toggle`);
                    if (planetToggle) {
                        planetToggle.checked = e.target.checked;
                    }
                    
                    // Disable close-up view if orbit is enabled
                    if (e.target.checked && planet.sideViewEnabled) {
                        planet.sideViewEnabled = false;
                        const sideViewToggle = document.getElementById(`${planet.constructor.name.toLowerCase()}-side-view-toggle`);
                        if (sideViewToggle) {
                            sideViewToggle.checked = false;
                        }
                        planet.toggleCloseUpView(false, false);
                    }
                });
            }
        });
        
        orbitToggleContainer.appendChild(orbitToggleLabel);
        orbitToggleContainer.appendChild(orbitToggle);
        this.consoleContent.appendChild(orbitToggleContainer);
        
        // Add orbit speed slider
        const orbitSliderContainer = document.createElement('div');
        orbitSliderContainer.style.marginBottom = '15px';
        
        // Add label for the slider
        const orbitSliderLabel = document.createElement('label');
        orbitSliderLabel.textContent = 'Global Orbit Speed: ';
        orbitSliderLabel.style.display = 'block';
        orbitSliderLabel.style.marginBottom = '5px';
        orbitSliderContainer.appendChild(orbitSliderLabel);
        
        // Create slider and reset button container
        const orbitSliderControlsContainer = document.createElement('div');
        orbitSliderControlsContainer.style.display = 'flex';
        orbitSliderControlsContainer.style.alignItems = 'center';
        orbitSliderControlsContainer.style.gap = '10px'; // Space between slider and button
        
        const orbitSlider = document.createElement('input');
        orbitSlider.type = 'range';
        orbitSlider.min = '0';
        orbitSlider.max = '100';
        orbitSlider.value = '50'; // Default to middle position
        orbitSlider.style.flexGrow = '1'; // Take up available space
        orbitSlider.id = 'global-orbit-speed-slider';
        
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
        
        orbitSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            // Apply to all planets
            if (this.planets && this.planets.length > 0) {
                this.planets.forEach(planet => {
                    if (value === 0) {
                        planet.orbitSpeed = 0;
                    } else if (value <= 50) {
                        const normalizedValue = value / 50;
                        const baseSpeed = (2 * Math.PI) / (planet.orbitalPeriod * 60);
                        planet.orbitSpeed = baseSpeed * normalizedValue;
                    } else {
                        const normalizedValue = (value - 50) / 50;
                        const periodDiff = planet.orbitalPeriod - planet.maxOrbitalPeriod;
                        const adjustedPeriod = planet.orbitalPeriod - (periodDiff * normalizedValue);
                        planet.orbitSpeed = (2 * Math.PI) / (adjustedPeriod * 60);
                    }
                    
                    // Enable orbit if slider is not at 0
                    if (value > 0) {
                        planet.orbitEnabled = true;
                        // Update planet's own control if it exists
                        const planetToggle = document.getElementById(`${planet.constructor.name.toLowerCase()}-orbit-toggle`);
                        if (planetToggle) {
                            planetToggle.checked = true;
                        }
                        
                        // Disable close-up view if orbit is enabled
                        if (planet.sideViewEnabled) {
                            planet.sideViewEnabled = false;
                            const sideViewToggle = document.getElementById(`${planet.constructor.name.toLowerCase()}-side-view-toggle`);
                            if (sideViewToggle) {
                                sideViewToggle.checked = false;
                            }
                            planet.toggleCloseUpView(false, false);
                        }
                    }
                });
                
                // Update global toggle
                if (value > 0) {
                    orbitToggle.checked = true;
                }
            }
        });
        
        // Reset button sets slider to default (50)
        orbitResetButton.addEventListener('click', () => {
            orbitSlider.value = '50';
            // Apply default speed to all planets
            if (this.planets && this.planets.length > 0) {
                this.planets.forEach(planet => {
                    const baseSpeed = (2 * Math.PI) / (planet.orbitalPeriod * 60);
                    planet.orbitSpeed = baseSpeed;
                });
            }
        });
        
        // Add slider and button to the container
        orbitSliderControlsContainer.appendChild(orbitSlider);
        orbitSliderControlsContainer.appendChild(orbitResetButton);
        orbitSliderContainer.appendChild(orbitSliderControlsContainer);
        
        this.consoleContent.appendChild(orbitSliderContainer);
        
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
        orbitVisibilitySlider.value = '100'; // Default to full visibility
        orbitVisibilitySlider.style.width = '100%';
        orbitVisibilitySlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            const visibility = value / 100;
            
            // Apply to all planets
            if (this.planets && this.planets.length > 0) {
                this.planets.forEach(planet => {
                    planet.orbitVisibility = visibility;
                    
                    // Update orbit line opacity
                    if (planet.orbitLine) {
                        planet.orbitLine.material.opacity = visibility;
                        
                        // Update color based on visibility
                        if (visibility > 0.5) {
                            // Blend from white to gray as visibility goes from 1.0 to 0.5
                            const intensity = 0.5 + visibility * 0.5;
                            planet.orbitLine.material.color.setRGB(intensity, intensity, intensity);
                        } else {
                            // Keep gray but reduce opacity as visibility goes from 0.5 to 0
                            planet.orbitLine.material.color.setRGB(0.5, 0.5, 0.5);
                        }
                    }
                });
            }
        });
        
        orbitVisibilityContainer.appendChild(orbitVisibilityLabel);
        orbitVisibilityContainer.appendChild(orbitVisibilitySlider);
        this.consoleContent.appendChild(orbitVisibilityContainer);
    }

    /**
     * Update camera control sliders based on the active view settings
     */
    updateCameraControls() {
        if (!this.activeView || !this.cameraSettings[this.activeView]) return;

        const settings = this.cameraSettings[this.activeView];

        // Update horizontal slider
        if (this.horizontalInput) {
            // Update min and max based on current camera angle
            const cameraAngle = -settings.horizontalAngle;
            this.horizontalInput.min = (cameraAngle - Math.PI).toString();
            this.horizontalInput.max = (cameraAngle + Math.PI).toString();
            this.horizontalInput.value = cameraAngle.toString();
        }

        // Update vertical slider
        if (this.verticalInput) {
            this.verticalInput.value = settings.verticalAngle;
        }

        // Update elevation slider
        if (this.elevationInput) {
            this.elevationInput.value = settings.elevation;
        }

        // Apply settings to location camera if active
        if (this.locationCamera && this.locationCamera.isActive) {
            this.locationCamera.cameraHorizontalAngle = settings.horizontalAngle;
            this.locationCamera.cameraVerticalAngle = settings.verticalAngle;
            this.locationCamera.cameraElevation = settings.elevation;
            this.locationCamera.updateView();
        }
    }

    getObject() {
        return this.group;
    }
}