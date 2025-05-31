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
        this.venus = null;
        this.mercury = null;
        this.jupiter = null;
        this.saturn = null;
        this.uranus = null;
        this.neptune = null;
        this.planets = [];

        // Control panels
        this.consolePane = null;
        this.consoleVisible = false;
        this.viewConsolePane = null;
        this.viewConsoleVisible = false;

        // UI configuration
        this.uiConfig = {
            panelAnimationDuration: 0.2, // Animation duration in seconds for panel collapse/expand
            defaultElevationValue: 0.025  // Default middle value for elevation slider (range is 0.001 to 0.05)
        };

        // Scale model flag
        this.useScaleModel = false;

        // Location camera for Earth locations
        this.locationCamera = new LocationCamera();

        // Store camera settings for different views (constant reference values)
        this.cameraSettings = Object.freeze({
            'topView':         { horizontalSliderRange: Math.PI,   horizontalSliderDefault: 0.5, horizontalAngle: Math.PI, verticalSliderRange: Math.PI, verticalSliderDefault: 0.5, verticalAngle: Math.PI/2, elevationSliderRange: 0.05, elevationSliderDefault: 0.1, elevation: 0.01, longitude: 0 },
            'sideView':        { horizontalSliderRange: Math.PI,   horizontalSliderDefault: 1.0, horizontalAngle: Math.PI, verticalSliderRange: Math.PI, verticalSliderDefault: 0.5, verticalAngle: 0.0,       elevationSliderRange: 0.05, elevationSliderDefault: 0.1, elevation: 0.01, longitude: 0 },
            'sunSideView':     { horizontalSliderRange: Math.PI,   horizontalSliderDefault: 0.5, horizontalAngle: Math.PI, verticalSliderRange: Math.PI, verticalSliderDefault: 0.5, verticalAngle: 0.0,       elevationSliderRange: 0.05, elevationSliderDefault: 0.1, elevation: this.uiConfig.defaultElevationValue, longitude: 0 },
            'mercurySideView': { horizontalSliderRange: Math.PI,   horizontalSliderDefault: 0.5, horizontalAngle: Math.PI, verticalSliderRange: Math.PI, verticalSliderDefault: 0.5, verticalAngle: 0.0,       elevationSliderRange: 0.05, elevationSliderDefault: 0.1, elevation: this.uiConfig.defaultElevationValue, longitude: 0 },
            'venusSideView':   { horizontalSliderRange: Math.PI,   horizontalSliderDefault: 0.5, horizontalAngle: Math.PI, verticalSliderRange: Math.PI, verticalSliderDefault: 0.5, verticalAngle: 0.0,       elevationSliderRange: 0.05, elevationSliderDefault: 0.1, elevation: this.uiConfig.defaultElevationValue, longitude: 0 },
            'earthSideView':   { horizontalSliderRange: Math.PI,   horizontalSliderDefault: 0.5, horizontalAngle: Math.PI, verticalSliderRange: Math.PI, verticalSliderDefault: 0.5, verticalAngle: 0.0,       elevationSliderRange: 0.05, elevationSliderDefault: 0.1, elevation: this.uiConfig.defaultElevationValue, longitude: 0 },
            'marsSideView':    { horizontalSliderRange: Math.PI,   horizontalSliderDefault: 0.5, horizontalAngle: Math.PI, verticalSliderRange: Math.PI, verticalSliderDefault: 0.5, verticalAngle: 0.0,       elevationSliderRange: 0.05, elevationSliderDefault: 0.1, elevation: this.uiConfig.defaultElevationValue, longitude: 0 },
            'jupiterSideView': { horizontalSliderRange: Math.PI,   horizontalSliderDefault: 0.5, horizontalAngle: Math.PI, verticalSliderRange: Math.PI, verticalSliderDefault: 0.5, verticalAngle: 0.0,       elevationSliderRange: 0.05, elevationSliderDefault: 0.1, elevation: this.uiConfig.defaultElevationValue, longitude: 0 },
            'saturnSideView':  { horizontalSliderRange: Math.PI,   horizontalSliderDefault: 0.5, horizontalAngle: Math.PI, verticalSliderRange: Math.PI, verticalSliderDefault: 0.5, verticalAngle: 0.0,       elevationSliderRange: 0.05, elevationSliderDefault: 0.1, elevation: this.uiConfig.defaultElevationValue, longitude: 0 },
            'uranusSideView':  { horizontalSliderRange: Math.PI,   horizontalSliderDefault: 0.5, horizontalAngle: Math.PI, verticalSliderRange: Math.PI, verticalSliderDefault: 0.5, verticalAngle: 0.0,       elevationSliderRange: 0.05, elevationSliderDefault: 0.1, elevation: this.uiConfig.defaultElevationValue, longitude: 0 },
            'neptuneSideView': { horizontalSliderRange: Math.PI,   horizontalSliderDefault: 0.5, horizontalAngle: Math.PI, verticalSliderRange: Math.PI, verticalSliderDefault: 0.5, verticalAngle: 0.0,       elevationSliderRange: 0.05, elevationSliderDefault: 0.1, elevation: this.uiConfig.defaultElevationValue, longitude: 0 },
            'budapest':        { horizontalSliderRange: Math.PI,   horizontalSliderDefault: 0.5, horizontalAngle: Math.PI, verticalSliderRange: Math.PI, verticalSliderDefault: 0.5, verticalAngle: 0.0,       elevationSliderRange: 0.05, elevationSliderDefault: 0.1, elevation: 0.01, longitude: 0 },
            'kiruna':          { horizontalSliderRange: Math.PI,   horizontalSliderDefault: 0.5, horizontalAngle: 0,       verticalSliderRange: Math.PI, verticalSliderDefault: 0.5, verticalAngle: 0.0,       elevationSliderRange: 0.05, elevationSliderDefault: 0.1, elevation: 0.01, longitude: 0 }
        });

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
        this.createMercury();
        this.createVenus();
        this.createEarth();
        this.createMars();
        this.createJupiter();
        this.createSaturn();
        this.createUranus();
        this.createNeptune();
        this.createConsolePane();
        this.createViewConsolePane();
    }

    createSun() {
        this.sun = new Sun();
        this.group.add(this.sun.getObject());
    }

    createMercury() {
        this.mercury = new Mercury(); // 4879km diameter
        this.planets.push(this.mercury);
        this.group.add(this.mercury.getObject());
    }

    createVenus() {
        this.venus = new Venus(); // 12104km diameter
        this.planets.push(this.venus);
        this.group.add(this.venus.getObject());
    }

    createMars() {
        this.mars = new Mars(); // 6779km diameter
        this.planets.push(this.mars);
        this.group.add(this.mars.getObject());
    }

    createJupiter() {
        this.jupiter = new Jupiter(); // 139820km diameter
        this.planets.push(this.jupiter);
        this.group.add(this.jupiter.getObject());
    }

    createSaturn() {
        this.saturn = new Saturn(); // 116460km diameter
        this.planets.push(this.saturn);
        this.group.add(this.saturn.getObject());
    }

    createUranus() {
        this.uranus = new Uranus(); // 50724km diameter
        this.planets.push(this.uranus);
        this.group.add(this.uranus.getObject());
    }

    createNeptune() {
        this.neptune = new Neptune(); // 49528km diameter
        this.planets.push(this.neptune);
        this.group.add(this.neptune.getObject());
    }

    createEarth() {
        this.earth = new Earth(); // 12000m diameter
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
        this.consolePane.style.top = '20px';
        this.consolePane.style.left = '20px';
        this.consolePane.style.backgroundColor = 'rgba(80, 80, 80, 0.8)';
        this.consolePane.style.color = 'white';
        this.consolePane.style.padding = '0';
        this.consolePane.style.borderRadius = '5px';
        this.consolePane.style.fontFamily = 'Arial, sans-serif';
        this.consolePane.style.display = 'none';
        this.consolePane.style.width = '300px';
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
        title.textContent = 'Solar System Controls';
        title.style.margin = '0';
        header.appendChild(title);

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
        header.appendChild(collapseIcon);

        // Add the header to the console pane
        this.consolePane.appendChild(header);

        // Create content container with padding
        const content = document.createElement('div');
        this.consolePane.appendChild(content);

        // Create scale model toggle container
        const scaleModelContainer = document.createElement('div');
        scaleModelContainer.className = 'scale-model-container';
        scaleModelContainer.style.padding = '15px';
        scaleModelContainer.style.borderBottom = '1px solid #666';

        // Add scale model label
        const scaleModelLabel = document.createElement('span');
        scaleModelLabel.className = 'scale-model-label';
        scaleModelLabel.textContent = 'Scale Model:';
        scaleModelContainer.appendChild(scaleModelLabel);

        // Create switch container
        const switchLabel = document.createElement('label');
        switchLabel.className = 'switch';
        switchLabel.style.marginLeft = '10px';

        // Create toggle input
        const toggleInput = document.createElement('input');
        toggleInput.type = 'checkbox';
        toggleInput.checked = this.useScaleModel;
        toggleInput.addEventListener('change', (e) => {
            this.useScaleModel = e.target.checked;
            this.applyScaleModel(this.useScaleModel);
            // Reset to top view to see the changes
            window.viewManager.setGlobalView('topView');
        });

        // Create slider span
        const sliderSpan = document.createElement('span');
        sliderSpan.className = 'slider';

        // Assemble the switch
        switchLabel.appendChild(toggleInput);
        switchLabel.appendChild(sliderSpan);
        scaleModelContainer.appendChild(switchLabel);

        // Add scale model container to content
        content.appendChild(scaleModelContainer);

        // Create inner content container with padding
        const innerContent = document.createElement('div');
        innerContent.style.padding = '15px';
        content.appendChild(innerContent);

        // Add collapse/expand functionality
        collapseIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent dragging when clicking the icon

            // Get current position before changing display
            const currentTop = this.consolePane.offsetTop;
            const currentLeft = this.consolePane.offsetLeft;

            if (content.style.display === 'none') {
                // Expand
                content.style.display = 'block';
                content.style.height = '0';
                content.style.overflow = 'hidden';
                content.style.transition = `height ${this.uiConfig.panelAnimationDuration}s ease`;

                // Trigger reflow to ensure transition works
                content.offsetHeight;

                // Get the natural height
                const contentHeight = content.scrollHeight;

                // Animate expansion
                content.style.height = contentHeight + 'px';
                collapseIcon.innerHTML = '&#9650;'; // Up arrow (collapse)
                this.consolePane.style.borderBottomLeftRadius = '5px';
                this.consolePane.style.borderBottomRightRadius = '5px';

                // Reset height to auto after animation
                setTimeout(() => {
                    content.style.height = 'auto';
                    content.style.overflow = 'visible';
                    content.style.transition = '';
                }, this.uiConfig.panelAnimationDuration * 1000);
            } else {
                // Get current content height before collapsing
                const contentHeight = content.offsetHeight;
                content.style.height = contentHeight + 'px';
                content.style.overflow = 'hidden';
                content.style.transition = `height ${this.uiConfig.panelAnimationDuration}s ease`;

                // Trigger reflow to ensure transition works
                content.offsetHeight;

                // Animate collapse
                content.style.height = '0';
                collapseIcon.innerHTML = '&#9660;'; // Down arrow (expand)
                this.consolePane.style.borderBottomLeftRadius = '0';
                this.consolePane.style.borderBottomRightRadius = '0';

                // Hide content after animation completes
                setTimeout(() => {
                    content.style.display = 'none';
                    content.style.transition = '';
                }, this.uiConfig.panelAnimationDuration * 1000);
            }

            // Restore position after changing display
            this.consolePane.style.top = `${currentTop}px`;
            this.consolePane.style.left = `${currentLeft}px`;
        });

        // Make the console pane draggable
        this.makeDraggable(this.consolePane, header);

        // Store content container for adding controls
        this.consoleContent = innerContent;

        // Create celestial bodies section
        this.createCelestialBodiesSection();

        // Create rotation controls section
        this.createRotationControlsSection();

        // Create orbit controls section
        this.createOrbitControlsSection();

        // Add to document
        document.body.appendChild(this.consolePane);
    }

    createViewConsolePane() {
        // Create view console pane
        this.viewConsolePane = document.createElement('div');
        this.viewConsolePane.className = 'console-pane';
        this.viewConsolePane.style.position = 'absolute';
        this.viewConsolePane.style.top = '20px';
        this.viewConsolePane.style.left = '340px'; // Position to the right of the main console
        this.viewConsolePane.style.backgroundColor = 'rgba(80, 80, 80, 0.8)';
        this.viewConsolePane.style.color = 'white';
        this.viewConsolePane.style.padding = '0';
        this.viewConsolePane.style.borderRadius = '5px';
        this.viewConsolePane.style.fontFamily = 'Arial, sans-serif';
        this.viewConsolePane.style.display = 'block'; // Shown by default
        this.viewConsolePane.style.width = '300px';
        this.viewConsolePane.style.boxShadow = '0 4px 8px rgba(0,0,0,0.5)';
        this.viewConsoleVisible = true;

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
        title.textContent = 'View Controls';
        title.style.margin = '0';
        header.appendChild(title);

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
        header.appendChild(collapseIcon);

        // Add the header to the view console pane
        this.viewConsolePane.appendChild(header);

        // Create content container with padding
        const content = document.createElement('div');
        content.style.padding = '15px';
        this.viewConsolePane.appendChild(content);

        // Make the view console pane draggable
        this.makeDraggable(this.viewConsolePane, header);

        // Store view content container for adding controls
        this.viewConsoleContent = content;

        // Add collapse/expand functionality
        collapseIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent dragging when clicking the icon

            // Get current position before changing display
            const currentTop = this.viewConsolePane.offsetTop;
            const currentLeft = this.viewConsolePane.offsetLeft;

            if (content.style.display === 'none') {
                // Expand
                content.style.display = 'block';
                content.style.height = '0';
                content.style.overflow = 'hidden';
                content.style.transition = `height ${this.uiConfig.panelAnimationDuration}s ease`;

                // Trigger reflow to ensure transition works
                content.offsetHeight;

                // Get the natural height
                const contentHeight = content.scrollHeight;

                // Animate expansion
                content.style.height = contentHeight + 'px';
                collapseIcon.innerHTML = '&#9650;'; // Up arrow (collapse)
                this.viewConsolePane.style.borderBottomLeftRadius = '5px';
                this.viewConsolePane.style.borderBottomRightRadius = '5px';

                // Reset height to auto after animation
                setTimeout(() => {
                    content.style.height = 'auto';
                    content.style.overflow = 'visible';
                    content.style.transition = '';
                }, this.uiConfig.panelAnimationDuration * 1000);
            } else {
                // Get current content height before collapsing
                const contentHeight = content.offsetHeight;
                content.style.height = contentHeight + 'px';
                content.style.overflow = 'hidden';
                content.style.transition = `height ${this.uiConfig.panelAnimationDuration}s ease`;

                // Trigger reflow to ensure transition works
                content.offsetHeight;

                // Animate collapse
                content.style.height = '0';
                collapseIcon.innerHTML = '&#9660;'; // Down arrow (expand)
                this.viewConsolePane.style.borderBottomLeftRadius = '0';
                this.viewConsolePane.style.borderBottomRightRadius = '0';

                // Hide content after animation completes
                setTimeout(() => {
                    content.style.display = 'none';
                    content.style.transition = '';
                }, this.uiConfig.panelAnimationDuration * 1000);
            }

            // Restore position after changing display
            this.viewConsolePane.style.top = `${currentTop}px`;
            this.viewConsolePane.style.left = `${currentLeft}px`;
        });

        // Create global view section
        this.createViewSection();

        // Create location views section
        this.createLocationViewsSection();

        // Create camera control buttons
        this.createCameraControlButtons();

        // Add to document
        document.body.appendChild(this.viewConsolePane);
    }

    createCelestialBodiesSection() {
        // Create section header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Visibility Control';
        sectionHeader.style.margin = '15px 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Add toggle for showing individual planets and their controls
        this.addToggle('Sun', false, (checked) => {
            if (checked) {
                this.sun.show();
            } else {
                this.sun.hide();
            }
        }, (checked) => {
            // First switch controls visibility of the sun
            if (this.sun) {
                this.sun.group.visible = checked;
            }
        });

        this.addToggle('Mercury', false, (checked) => {
            if (checked && this.mercury) {
                this.mercury.show();
            } else if (this.mercury) {
                this.mercury.hide();
            }
        }, (checked) => {
            // First switch controls visibility of Mercury and its orbit
            if (this.mercury) {
                this.mercury.group.visible = checked;
                if (this.mercury.orbitLine) {
                    this.mercury.orbitLine.visible = checked;
                }
            }
        });

        this.addToggle('Venus', false, (checked) => {
            if (checked && this.venus) {
                this.venus.show();
            } else if (this.venus) {
                this.venus.hide();
            }
        }, (checked) => {
            // First switch controls visibility of Venus and its orbit
            if (this.venus) {
                this.venus.group.visible = checked;
                if (this.venus.orbitLine) {
                    this.venus.orbitLine.visible = checked;
                }
            }
        });

        this.addToggle('Earth', false, (checked) => {
            if (checked && this.earth) {
                this.earth.show();
            } else if (this.earth) {
                this.earth.hide();
            }
        }, (checked) => {
            // First switch controls visibility of Earth and its orbit
            if (this.earth) {
                this.earth.group.visible = checked;
                if (this.earth.orbitLine) {
                    this.earth.orbitLine.visible = checked;
                }
            }
        });

        this.addToggle('Mars', false, (checked) => {
            if (checked && this.mars) {
                this.mars.show();
            } else if (this.mars) {
                this.mars.hide();
            }
        }, (checked) => {
            // First switch controls visibility of Mars and its orbit
            if (this.mars) {
                this.mars.group.visible = checked;
                if (this.mars.orbitLine) {
                    this.mars.orbitLine.visible = checked;
                }
            }
        });

        this.addToggle('Jupiter', false, (checked) => {
            if (checked && this.jupiter) {
                this.jupiter.show();
            } else if (this.jupiter) {
                this.jupiter.hide();
            }
        }, (checked) => {
            // First switch controls visibility of Jupiter and its orbit
            if (this.jupiter) {
                this.jupiter.group.visible = checked;
                if (this.jupiter.orbitLine) {
                    this.jupiter.orbitLine.visible = checked;
                }
            }
        });

        this.addToggle('Saturn', false, (checked) => {
            if (checked && this.saturn) {
                this.saturn.show();
            } else if (this.saturn) {
                this.saturn.hide();
            }
        }, (checked) => {
            // First switch controls visibility of Saturn and its orbit
            if (this.saturn) {
                this.saturn.group.visible = checked;
                if (this.saturn.orbitLine) {
                    this.saturn.orbitLine.visible = checked;
                }
            }
        });

        this.addToggle('Uranus', false, (checked) => {
            if (checked && this.uranus) {
                this.uranus.show();
            } else if (this.uranus) {
                this.uranus.hide();
            }
        }, (checked) => {
            // First switch controls visibility of Uranus and its orbit
            if (this.uranus) {
                this.uranus.group.visible = checked;
                if (this.uranus.orbitLine) {
                    this.uranus.orbitLine.visible = checked;
                }
            }
        });

        this.addToggle('Neptune', false, (checked) => {
            if (checked && this.neptune) {
                this.neptune.show();
            } else if (this.neptune) {
                this.neptune.hide();
            }
        }, (checked) => {
            // First switch controls visibility of Neptune and its orbit
            if (this.neptune) {
                this.neptune.group.visible = checked;
                if (this.neptune.orbitLine) {
                    this.neptune.orbitLine.visible = checked;
                }
            }
        });
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
        // Create Global Views section header
        const globalSectionHeader = document.createElement('h4');
        globalSectionHeader.textContent = 'Global Views';
        globalSectionHeader.style.margin = '0 0 10px 0';
        globalSectionHeader.style.borderBottom = '1px solid #555';
        globalSectionHeader.style.paddingBottom = '5px';
        this.viewConsoleContent.appendChild(globalSectionHeader);

        // Create radio button group for views
        const viewRadioGroup = document.createElement('div');
        viewRadioGroup.className = 'view-radio-group';
        viewRadioGroup.style.marginBottom = '15px';
        this.viewConsoleContent.appendChild(viewRadioGroup);

        // Add radio buttons for global views
        this.addViewRadioButton('Top View', 'view', 'topView', () => {
            window.viewManager.setGlobalView('topView');
        }, viewRadioGroup, true);

        this.addViewRadioButton('Side View', 'view', 'sideView', () => {
            window.viewManager.setGlobalView('sideView');
        }, viewRadioGroup);

        // Create Planet Side Views section header with extra margin
        const planetSectionHeader = document.createElement('h4');
        planetSectionHeader.textContent = 'Planet Side Views';
        planetSectionHeader.style.margin = '20px 0 10px 0';
        planetSectionHeader.style.borderBottom = '1px solid #555';
        planetSectionHeader.style.paddingBottom = '5px';
        this.viewConsoleContent.appendChild(planetSectionHeader);

        // Create radio button group for planet side views
        const planetViewRadioGroup = document.createElement('div');
        planetViewRadioGroup.className = 'view-radio-group';
        planetViewRadioGroup.style.marginBottom = '15px';
        this.viewConsoleContent.appendChild(planetViewRadioGroup);

        // Add radio buttons for planet side views
        this.addViewRadioButton('Sun Side View', 'view', 'sunSideView', () => {
            window.viewManager.setPlanetSideView('sun', this.sun);
        }, planetViewRadioGroup);

        this.addViewRadioButton('Mercury Side View', 'view', 'mercurySideView', () => {
            window.viewManager.setPlanetSideView('mercury', this.mercury);
        }, planetViewRadioGroup);

        this.addViewRadioButton('Venus Side View', 'view', 'venusSideView', () => {
            window.viewManager.setPlanetSideView('venus', this.venus);
        }, planetViewRadioGroup);

        this.addViewRadioButton('Earth Side View', 'view', 'earthSideView', () => {
            window.viewManager.setPlanetSideView('earth', this.earth);
        }, planetViewRadioGroup);

        this.addViewRadioButton('Mars Side View', 'view', 'marsSideView', () => {
                window.viewManager.setPlanetSideView('mars', this.mars);
        }, planetViewRadioGroup);

        this.addViewRadioButton('Jupiter Side View', 'view', 'jupiterSideView', () => {
                window.viewManager.setPlanetSideView('jupiter', this.jupiter);
        }, planetViewRadioGroup);

        this.addViewRadioButton('Saturn Side View', 'view', 'saturnSideView', () => {
                window.viewManager.setPlanetSideView('saturn', this.saturn);
        }, planetViewRadioGroup);

        this.addViewRadioButton('Uranus Side View', 'view', 'uranusSideView', () => {
                window.viewManager.setPlanetSideView('uranus', this.uranus);
        }, planetViewRadioGroup);

        this.addViewRadioButton('Neptune Side View', 'view', 'neptuneSideView', () => {
                window.viewManager.setPlanetSideView('neptune', this.neptune);
        }, planetViewRadioGroup);
    }

    addViewButton(label, clickHandler, container) {
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
        container.appendChild(buttonContainer);
    }

    addViewRadioButton(label, name, value, clickHandler, container, isChecked = false) {
        const radioContainer = document.createElement('div');
        radioContainer.style.marginBottom = '10px';
        radioContainer.style.display = 'flex';
        radioContainer.style.alignItems = 'center';

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = name;
        radio.value = value;
        radio.id = `radio-${value}`;
        radio.checked = isChecked;
        radio.style.marginRight = '10px';
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                clickHandler();

                // Determine view type
                const isLocalView = value === 'budapest' || value === 'kiruna';
                const isPlanetSideView = value.includes('SideView');

                // Set view type for camera controls
                let viewType = 'global';
                if (isLocalView) {
                    viewType = 'local';
                } else if (isPlanetSideView) {
                    viewType = 'planet';

                    // For first-time selection of a planet side view, set elevation to middle
                    if (this.elevationInput) {
                        this.elevationInput.value = this.uiConfig.defaultElevationValue.toString();
                        // Note: We no longer modify the frozen cameraSettings
                        // Instead, ViewManager will track this in its own viewSettings
                    }
                }

                // Update camera controls based on view type
                this.setCameraControlsEnabled(true, viewType);

                // If using ViewManager, update UI controls to reflect current view settings
                if (window.viewManager) {
                    setTimeout(() => {
                        window.viewManager.updateUIControls();
                    }, 50);
                }
            }
        });

        const radioLabel = document.createElement('label');
        radioLabel.htmlFor = `radio-${value}`;
        radioLabel.textContent = label;
        radioLabel.style.flexGrow = '1';
        radioLabel.style.cursor = 'pointer';

        radioContainer.appendChild(radio);
        radioContainer.appendChild(radioLabel);
        container.appendChild(radioContainer);

        return radio;
    }

    addToggle(label, initialState, controlsChangeHandler, visibilityChangeHandler) {
        const toggleContainer = document.createElement('div');
        toggleContainer.style.marginBottom = '10px';
        toggleContainer.style.display = 'flex';
        toggleContainer.style.justifyContent = 'space-between';
        toggleContainer.style.alignItems = 'center';

        // Add planet icon
        const iconImg = document.createElement('img');
        iconImg.src = `icons/${label.toLowerCase()}.png`;
        iconImg.style.width = '24px';
        iconImg.style.height = '24px';
        iconImg.style.marginRight = '8px';
        iconImg.style.verticalAlign = 'middle';

        const toggleLabel = document.createElement('label');
        toggleLabel.textContent = label;
        toggleLabel.style.flexGrow = '1';
        toggleLabel.style.display = 'flex';
        toggleLabel.style.alignItems = 'center';

        // Add icon to label
        toggleLabel.prepend(iconImg);

        // Create first switch container (visibility switch)
        const switchLabel1 = document.createElement('label');
        switchLabel1.className = 'switch';
        switchLabel1.style.marginRight = '10px';
        switchLabel1.title = "Show/Hide " + label;

        // Create first toggle input (visibility switch)
        const toggle1 = document.createElement('input');
        toggle1.type = 'checkbox';
        toggle1.checked = true; // Default ON
        toggle1.addEventListener('change', (e) => {
            if (visibilityChangeHandler) {
                visibilityChangeHandler(e.target.checked);
            }
        });

        // Create slider span for first switch
        const sliderSpan1 = document.createElement('span');
        sliderSpan1.className = 'slider';

        // Assemble the first switch
        switchLabel1.appendChild(toggle1);
        switchLabel1.appendChild(sliderSpan1);

        // Create second switch container (controls switch)
        const switchLabel2 = document.createElement('label');
        switchLabel2.className = 'switch';
        switchLabel2.title = "Show/Hide " + label + " Controls";

        // Create second toggle input (controls switch)
        const toggle2 = document.createElement('input');
        toggle2.type = 'checkbox';
        toggle2.checked = initialState;
        toggle2.id = `${label.toLowerCase()}-controls-toggle`;
        toggle2.addEventListener('change', (e) => {
            if (controlsChangeHandler) {
                controlsChangeHandler(e.target.checked);
            }
        });

        // Create slider span for second switch
        const sliderSpan2 = document.createElement('span');
        sliderSpan2.className = 'slider';

        // Assemble the second switch
        switchLabel2.appendChild(toggle2);
        switchLabel2.appendChild(sliderSpan2);

        toggleContainer.appendChild(toggleLabel);
        toggleContainer.appendChild(switchLabel1);
        toggleContainer.appendChild(switchLabel2);
        this.consoleContent.appendChild(toggleContainer);
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

        // Update Venus
        if (this.venus) {
            this.venus.update(time);
        }

        // Update Mercury
        if (this.mercury) {
            this.mercury.update(time);
        }

        // Update Jupiter
        if (this.jupiter) {
            this.jupiter.update(time);
        }

        // Update Saturn
        if (this.saturn) {
            this.saturn.update(time);
        }

        // Update Uranus
        if (this.uranus) {
            this.uranus.update(time);
        }

        // Update Neptune
        if (this.neptune) {
            this.neptune.update(time);
        }

        // Update location camera if active
        if (this.locationCamera) {
            this.locationCamera.update();
        }
    }

    createLocationViewsSection() {
        // Create section header
        const locationHeader = document.createElement('h4');
        locationHeader.textContent = 'Local Views';
        locationHeader.style.margin = '15px 0 10px 0';
        locationHeader.style.borderBottom = '1px solid #555';
        locationHeader.style.paddingBottom = '5px';
        this.viewConsoleContent.appendChild(locationHeader);

        // Create radio button group for location views
        const locationViewRadioGroup = document.createElement('div');
        locationViewRadioGroup.className = 'view-radio-group';
        locationViewRadioGroup.style.marginBottom = '15px';
        this.viewConsoleContent.appendChild(locationViewRadioGroup);

        // Add radio buttons for each location marker
        if (this.locationMarkers && this.locationMarkers.length > 0) {
            this.locationMarkers.forEach(marker => {
                this.addViewRadioButton(`View from ${marker.options.name}`, 'view', `${marker.options.name.toLowerCase()}`, () => {
                    if (window.viewManager) {
                        // Use the view manager to set local view
                        window.viewManager.setLocalView(marker);

                        // Set flag that we're entering a location view
                        this.inLocationView = true;

                        // Hide markers when entering location view
                        this.toggleLocationMarkers(false);

                        // Set active view based on location name
                        this.activeView = marker.options.name.toLowerCase();

                        // Enable camera controls for local views
                        this.setCameraControlsEnabled(true, 'local');
                    } else if (this.locationCamera) {
                        // Legacy fallback
                        // Disable any existing marker views on all planets
                        this.planets.forEach(planet => {
                            if (planet.planetMarker && planet.planetMarker.cameraView) {
                                planet.planetMarker.setCameraView(false);
                                planet.setMarkerVisible(false);
                            }
                        });

                        // Set flag that we're entering a location view
                        this.inLocationView = true;

                        // Hide markers when entering location view
                        this.toggleLocationMarkers(false);

                        this.locationCamera.activateView(marker);
                        // Set active view based on location name
                        this.activeView = marker.options.name.toLowerCase();
                        this.updateCameraControls();

                        // Enable camera controls for local views
                        this.setCameraControlsEnabled(true);
                    }
                }, locationViewRadioGroup);
            });
        }
    }

    createCameraControlButtons() {
        // Create section header
        const controlHeader = document.createElement('h4');
        controlHeader.textContent = 'Camera Controls';
        controlHeader.style.margin = '15px 0 10px 0';
        controlHeader.style.borderBottom = '1px solid #555';
        controlHeader.style.paddingBottom = '5px';
        controlHeader.style.marginTop = '25px'; // Add extra margin to separate from previous section
        this.viewConsoleContent.appendChild(controlHeader);

        // Create container for camera controls in three columns
        const cameraControlsContainer = document.createElement('div');
        cameraControlsContainer.style.display = 'grid';
        cameraControlsContainer.style.gridTemplateColumns = '24px 2fr 24px';
        cameraControlsContainer.style.gap = '10px';
        cameraControlsContainer.style.marginBottom = '15px';
        this.viewConsoleContent.appendChild(cameraControlsContainer);

        // Add horizontal angle control with icon
        const horizontalLabel = document.createElement('div');
        horizontalLabel.style.display = 'flex';
        horizontalLabel.style.alignItems = 'center';

        const horizontalIcon = document.createElement('img');
        horizontalIcon.src = 'icons/rotate-vertical.png';
        horizontalIcon.style.width = '24px';
        horizontalIcon.style.height = '24px';
        horizontalIcon.style.marginRight = '5px';

        horizontalLabel.appendChild(horizontalIcon);
        horizontalLabel.style.alignSelf = 'center';
        cameraControlsContainer.appendChild(horizontalLabel);

        // Create horizontal slider
        const horizontalInput = document.createElement('input');
        horizontalInput.type = 'range';
        horizontalInput.min = '-3.14'; // -PI
        horizontalInput.max = '3.14';  // PI
        horizontalInput.step = '0.01';
        horizontalInput.value = '0';
        horizontalInput.style.width = '100%';
        cameraControlsContainer.appendChild(horizontalInput);

        // Store reference to the horizontal slider
        this.horizontalInput = horizontalInput;

        // Add reset icon for horizontal control
        const horizontalResetIcon = document.createElement('img');
        horizontalResetIcon.src = 'icons/reset.png';
        horizontalResetIcon.style.width = '24px';
        horizontalResetIcon.style.height = '24px';
        horizontalResetIcon.style.cursor = 'pointer';
        cameraControlsContainer.appendChild(horizontalResetIcon);

        // Add vertical angle control with icon
        const verticalLabel = document.createElement('div');
        verticalLabel.style.display = 'flex';
        verticalLabel.style.alignItems = 'center';

        const verticalIcon = document.createElement('img');
        verticalIcon.src = 'icons/rotate-horizontal.png';
        verticalIcon.style.width = '24px';
        verticalIcon.style.height = '24px';
        verticalIcon.style.marginRight = '5px';

        verticalLabel.appendChild(verticalIcon);
        verticalLabel.style.alignSelf = 'center';
        cameraControlsContainer.appendChild(verticalLabel);

        // Create vertical slider
        const verticalInput = document.createElement('input');
        verticalInput.type = 'range';
        verticalInput.min = '-1.47'; // -PI/2 + 0.1
        verticalInput.max = '1.47';  // PI/2 - 0.1
        verticalInput.step = '0.01';
        verticalInput.value = '0';
        verticalInput.style.width = '100%';
        cameraControlsContainer.appendChild(verticalInput);

        // Store reference to the vertical slider
        this.verticalInput = verticalInput;

        // Add reset icon for vertical control
        const verticalResetIcon = document.createElement('img');
        verticalResetIcon.src = 'icons/reset.png';
        verticalResetIcon.style.width = '24px';
        verticalResetIcon.style.height = '24px';
        verticalResetIcon.style.cursor = 'pointer';
        cameraControlsContainer.appendChild(verticalResetIcon);

        // Add camera elevation control with icon
        const elevationLabel = document.createElement('div');
        elevationLabel.style.display = 'flex';
        elevationLabel.style.alignItems = 'center';

        const elevationIcon = document.createElement('img');
        elevationIcon.src = 'icons/translate-vertical.png';
        elevationIcon.style.width = '24px';
        elevationIcon.style.height = '24px';
        elevationIcon.style.marginRight = '5px';

        elevationLabel.appendChild(elevationIcon);
        elevationLabel.style.alignSelf = 'center';
        cameraControlsContainer.appendChild(elevationLabel);

        // Create elevation slider
        const elevationInput = document.createElement('input');
        elevationInput.type = 'range';
        elevationInput.min = '0.001';
        elevationInput.max = '0.05';
        elevationInput.step = '0.001';
        elevationInput.value = this.uiConfig.defaultElevationValue.toString();
        elevationInput.style.width = '100%';
        cameraControlsContainer.appendChild(elevationInput);

        // Store reference to the elevation slider
        this.elevationInput = elevationInput;

        // Create reset icon for elevation
        const elevationResetIcon = document.createElement('img');
        elevationResetIcon.src = 'icons/reset.png';
        elevationResetIcon.style.width = '24px';
        elevationResetIcon.style.height = '24px';
        elevationResetIcon.style.cursor = 'pointer';
        cameraControlsContainer.appendChild(elevationResetIcon);
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
        rotationToggleContainer.style.display = 'flex';
        rotationToggleContainer.style.justifyContent = 'space-between';
        rotationToggleContainer.style.alignItems = 'center';

        const rotationToggleLabel = document.createElement('label');
        rotationToggleLabel.textContent = 'Enable All Rotation: ';

        // Create switch container
        const rotationSwitchLabel = document.createElement('label');
        rotationSwitchLabel.className = 'switch';

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

            // Also apply to the Sun
            if (this.sun) {
                this.sun.rotationEnabled = e.target.checked;
                // Update Sun's own control if it exists
                const sunToggle = document.getElementById('sun-rotation-toggle');
                if (sunToggle) {
                    sunToggle.checked = e.target.checked;
                }
            }
        });

        // Create slider span
        const rotationSliderSpan = document.createElement('span');
        rotationSliderSpan.className = 'slider';

        // Assemble the switch
        rotationSwitchLabel.appendChild(rotationToggle);
        rotationSwitchLabel.appendChild(rotationSliderSpan);

        rotationToggleContainer.appendChild(rotationToggleLabel);
        rotationToggleContainer.appendChild(rotationSwitchLabel);
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

        // Create reset icon
        const rotationResetIcon = document.createElement('img');
        rotationResetIcon.src = 'icons/reset.png';
        rotationResetIcon.style.width = '24px';
        rotationResetIcon.style.height = '24px';
        rotationResetIcon.style.cursor = 'pointer';
        rotationResetIcon.style.flexShrink = '0'; // Don't shrink the icon

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

                // Also apply to the Sun
                if (this.sun) {
                    if (value === 0) {
                        this.sun.rotationSpeed = 0;
                    } else if (value <= 50) {
                        const normalizedValue = value / 50;
                        const baseSpeed = (2 * Math.PI) / (this.sun.rotationPeriod * 60);
                        this.sun.rotationSpeed = baseSpeed * normalizedValue;
                    } else {
                        const normalizedValue = (value - 50) / 50;
                        const periodDiff = this.sun.rotationPeriod - this.sun.maxRotationPeriod;
                        const adjustedPeriod = this.sun.rotationPeriod - (periodDiff * normalizedValue);
                        this.sun.rotationSpeed = (2 * Math.PI) / (adjustedPeriod * 60);
                    }

                    // Enable rotation if slider is not at 0
                    if (value > 0) {
                        this.sun.rotationEnabled = true;
                        // Update Sun's own control if it exists
                        const sunToggle = document.getElementById('sun-rotation-toggle');
                        if (sunToggle) {
                            sunToggle.checked = true;
                        }
                    }
                }

                // Dispatch event for individual planet controls to update
                document.dispatchEvent(new CustomEvent('globalRotationSliderChange', {
                    detail: { value: value }
                }));

                // Update global toggle
                if (value > 0) {
                    rotationToggle.checked = true;
                }
            }
        });

        // Reset icon sets slider to default (50)
        rotationResetIcon.addEventListener('click', () => {
            rotationSlider.value = '50';
            // Apply default speed to all planets
            if (this.planets && this.planets.length > 0) {
                this.planets.forEach(planet => {
                    const baseSpeed = (2 * Math.PI) / (planet.rotationPeriod * 60);
                    planet.rotationSpeed = baseSpeed;
                });

                // Also apply to the Sun
                if (this.sun) {
                    const baseSpeed = (2 * Math.PI) / (this.sun.rotationPeriod * 60);
                    this.sun.rotationSpeed = baseSpeed;
                }

                // Dispatch event for individual planet controls to update
                document.dispatchEvent(new CustomEvent('globalRotationSliderChange', {
                    detail: { value: 50 }
                }));
            }
        });

        // Add slider and icon to the container
        rotationSliderControlsContainer.appendChild(rotationSlider);
        rotationSliderControlsContainer.appendChild(rotationResetIcon);
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
        orbitToggleContainer.style.display = 'flex';
        orbitToggleContainer.style.justifyContent = 'space-between';
        orbitToggleContainer.style.alignItems = 'center';

        const orbitToggleLabel = document.createElement('label');
        orbitToggleLabel.textContent = 'Enable All Orbits: ';

        // Create switch container
        const orbitSwitchLabel = document.createElement('label');
        orbitSwitchLabel.className = 'switch';

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

        // Create slider span
        const orbitSliderSpan = document.createElement('span');
        orbitSliderSpan.className = 'slider';

        // Assemble the switch
        orbitSwitchLabel.appendChild(orbitToggle);
        orbitSwitchLabel.appendChild(orbitSliderSpan);

        orbitToggleContainer.appendChild(orbitToggleLabel);
        orbitToggleContainer.appendChild(orbitSwitchLabel);
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

        // Create reset icon
        const orbitResetIcon = document.createElement('img');
        orbitResetIcon.src = 'icons/reset.png';
        orbitResetIcon.style.width = '24px';
        orbitResetIcon.style.height = '24px';
        orbitResetIcon.style.cursor = 'pointer';
        orbitResetIcon.style.flexShrink = '0'; // Don't shrink the icon

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

                // Dispatch event for individual planet controls to update
                document.dispatchEvent(new CustomEvent('globalOrbitSliderChange', {
                    detail: { value: value }
                }));

                // Update global toggle
                if (value > 0) {
                    orbitToggle.checked = true;
                }
            }
        });

        // Reset icon sets slider to default (50)
        orbitResetIcon.addEventListener('click', () => {
            orbitSlider.value = '50';
            // Apply default speed to all planets
            if (this.planets && this.planets.length > 0) {
                this.planets.forEach(planet => {
                    const baseSpeed = (2 * Math.PI) / (planet.orbitalPeriod * 60);
                    planet.orbitSpeed = baseSpeed;
                });

                // Dispatch event for individual planet controls to update
                document.dispatchEvent(new CustomEvent('globalOrbitSliderChange', {
                    detail: { value: 50 }
                }));
            }
        });

        // Add slider and icon to the container
        orbitSliderControlsContainer.appendChild(orbitSlider);
        orbitSliderControlsContainer.appendChild(orbitResetIcon);
        orbitSliderContainer.appendChild(orbitSliderControlsContainer);

        this.consoleContent.appendChild(orbitSliderContainer);

        // Create a separate section for General Control
        const orbitVisibilityHeader = document.createElement('h4');
        orbitVisibilityHeader.textContent = 'General Control';
        orbitVisibilityHeader.style.margin = '15px 0 10px 0';
        orbitVisibilityHeader.style.borderBottom = '1px solid #555';
        orbitVisibilityHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(orbitVisibilityHeader);

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
        orbitVisibilitySlider.value = '50'; // Default to 50% visibility
        orbitVisibilitySlider.style.width = '100%';
        // We'll dispatch a global event to update all planet sliders after the slider is created

        orbitVisibilitySlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            const visibility = value / 100;

            // Apply to all planets
            if (this.planets && this.planets.length > 0) {

                // Dispatch event for individual planet controls to update
                document.dispatchEvent(new CustomEvent('globalOrbitVisibilityChange', {
                    detail: { value: value }
                }));
            }
        });

        orbitVisibilityContainer.appendChild(orbitVisibilityLabel);
        orbitVisibilityContainer.appendChild(orbitVisibilitySlider);
        this.consoleContent.appendChild(orbitVisibilityContainer);

        // Dispatch event to set initial 50% visibility on all planets
        document.dispatchEvent(new CustomEvent('globalOrbitVisibilityChange', {
            detail: { value: 50 }
        }));

        // Add Day/Night Effect toggle
        const dayNightContainer = document.createElement('div');
        dayNightContainer.style.marginBottom = '15px';
        dayNightContainer.style.display = 'flex';
        dayNightContainer.style.justifyContent = 'space-between';
        dayNightContainer.style.alignItems = 'center';

        const dayNightLabel = document.createElement('label');
        dayNightLabel.textContent = 'Enable All Day/Night: ';

        // Create switch container
        const dayNightSwitchLabel = document.createElement('label');
        dayNightSwitchLabel.className = 'switch';

        // Create toggle input
        const dayNightToggle = document.createElement('input');
        dayNightToggle.type = 'checkbox';
        dayNightToggle.checked = true; // Default ON
        dayNightToggle.id = 'global-day-night-toggle';
        dayNightToggle.addEventListener('change', (e) => {
            // Apply to all planets
            if (this.planets && this.planets.length > 0) {
                this.planets.forEach(planet => {
                    planet.dayNightEnabled = e.target.checked;
                    planet.toggleDayNightEffect(e.target.checked);

                    // Update planet's own control if it exists
                    const planetToggle = document.getElementById(`${planet.constructor.name.toLowerCase()}-day-night-toggle`);
                    if (planetToggle) {
                        planetToggle.checked = e.target.checked;
                    }
                });
            }

            // Dispatch event for individual planet controls to update
            document.dispatchEvent(new CustomEvent('globalDayNightChange', {
                detail: { enabled: e.target.checked }
            }));
        });

        // Create slider span
        const dayNightSliderSpan = document.createElement('span');
        dayNightSliderSpan.className = 'slider';

        // Assemble the switch
        dayNightSwitchLabel.appendChild(dayNightToggle);
        dayNightSwitchLabel.appendChild(dayNightSliderSpan);

        dayNightContainer.appendChild(dayNightLabel);
        dayNightContainer.appendChild(dayNightSwitchLabel);
        this.consoleContent.appendChild(dayNightContainer);

        // Dispatch initial event to ensure all planets are in sync with the global toggle
        document.dispatchEvent(new CustomEvent('globalDayNightChange', {
            detail: { enabled: true }
        }));
    }

    /**
     * Update camera control sliders based on the active view settings
     * This method is now a simple wrapper that delegates to ViewManager
     */
    updateCameraControls() {
        // This functionality is now handled by CameraControls class
        if (window.viewManager) {
            window.viewManager.updateUIControls();
        }
    }

    /**
     * Enable or disable camera control sliders based on view type
     * This method is now a simple wrapper that delegates to ViewManager
     */
    setCameraControlsEnabled(enabled, viewType = 'global') {
        // This functionality is now handled by CameraControls class
        if (window.viewManager && window.viewManager.cameraControls) {
            window.viewManager.cameraControls.setEnabledSliders(viewType);
        }
    }

    applyScaleModel(useScale) {
        // Apply scale model to all planets
        if (this.planets && this.planets.length > 0) {
            this.planets.forEach(planet => {
                // Use the appropriate model data directly from the planet instance
                const modelData = useScale ? planet.scaleModelData : planet.nonScaleModelData;

                if (modelData) {
                    // Update planet properties
                    planet.diameter = modelData.diameter;
                    planet.radius = planet.diameter / 2;
                    planet.orbitRadius = modelData.orbitRadius;
                    planet.rotationPeriod = modelData.rotationPeriod;
                    planet.maxRotationPeriod = modelData.maxRotationPeriod;
                    planet.orbitalPeriod = modelData.orbitalPeriod;
                    planet.maxOrbitalPeriod = modelData.maxOrbitalPeriod;

                    // Update speeds
                    planet.rotationSpeed = modelData.rotationSpeed();
                    planet.maxRotationSpeed = modelData.maxRotationSpeed();
                    planet.orbitSpeed = modelData.orbitSpeed();
                    planet.maxOrbitSpeed = modelData.maxOrbitSpeed();

                    // Update orbit position
                    if (planet.group && planet.orbitLine) {
                        // Update orbit line geometry
                        const segments = 128;
                        const vertices = [];

                        for (let i = 0; i <= segments; i++) {
                            const theta = (i / segments) * Math.PI * 2;
                            const x = planet.orbitRadius * Math.cos(theta);
                            const z = planet.orbitRadius * Math.sin(theta);
                            vertices.push(x, 0, z);
                        }

                        // Update orbit line geometry
                        planet.orbitLine.geometry.setAttribute(
                            'position',
                            new THREE.Float32BufferAttribute(vertices, 3)
                        );

                        // Update planet position
                        planet.group.position.x = planet.orbitRadius;
                    }

                    // Update planet sphere size
                    if (planet.sphere) {
                        const newGeometry = new THREE.SphereGeometry(planet.radius, 64, 32);
                        planet.sphere.geometry.dispose();
                        planet.sphere.geometry = newGeometry;
                    }
                }
            });
        }

        // Update sun
        if (this.sun) {
            // Apply appropriate model data to sun
            const sunModelData = useScale ? this.sun.scaleModelData : this.sun.nonScaleModelData;
            if (sunModelData) {
                this.sun.diameter = sunModelData.diameter;
                this.sun.radius = this.sun.diameter / 2;

                // Update sun sphere size
                if (this.sun.sphere) {
                    const newGeometry = new THREE.SphereGeometry(this.sun.radius, 64, 32);
                    this.sun.sphere.geometry.dispose();
                    this.sun.sphere.geometry = newGeometry;
                }
            }
        }
    }

    getObject() {
        return this.group;
    }
}