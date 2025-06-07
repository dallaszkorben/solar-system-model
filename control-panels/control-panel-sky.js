/**
 * SkyControlPanel class for controlling the sky
 * Extends PlanetControlPanel with sky-specific functionality
 */
class SkyControlPanel extends PlanetControlPanel {
    constructor(sky) {
        super(sky); // Call parent constructor

        // Override the title to verify implementation
        this.consolePane.querySelector('h3').textContent = 'Sky Controls';

        // Initialize the toggle state based on the actual sky visibility
        const skyToggle = document.getElementById('sky-panel-visibility-toggle');
        if (skyToggle && sky && sky.getObject()) {
            skyToggle.checked = sky.getObject().visible;

            // Update dependent controls based on actual visibility
            const starsContainer = document.getElementById('sky-stars-container');
            const constellationsContainer = document.getElementById('sky-constellations-container');

            if (starsContainer) {
                starsContainer.style.opacity = sky.getObject().visible ? '1' : '0.5';
                const interactiveElements = starsContainer.querySelectorAll('input, img');
                interactiveElements.forEach(element => {
                    element.disabled = !sky.getObject().visible;
                    if (element.tagName === 'IMG') {
                        element.style.cursor = sky.getObject().visible ? 'pointer' : 'default';
                    }
                });
            }

            if (constellationsContainer) {
                constellationsContainer.style.opacity = sky.getObject().visible ? '1' : '0.5';
                const interactiveElements = constellationsContainer.querySelectorAll('input, img');
                interactiveElements.forEach(element => {
                    element.disabled = !sky.getObject().visible;
                    if (element.tagName === 'IMG') {
                        element.style.cursor = sky.getObject().visible ? 'pointer' : 'default';
                    }
                });
            }
        }
    }

    /**
     * Override createVisibilitySection to customize for Sky
     */
    createVisibilitySection() {
        // Create section header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Visibility Controls';
        sectionHeader.style.margin = '0 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Add visibility toggle
        this.addVisibilityToggle();

        // Add brightness sliders directly in the visibility section
        this.addBrightnessSlider('Stars', 'stars');
        this.addBrightnessSlider('Constellations', 'constellations');

        // Add axis toggle
        this.addAxisToggle();

        // Add latitude circles toggle if planet has them
        if (this.planet && this.planet.latitudeCircles) {
            this.addLatitudeCirclesToggle();
        }
    }

    /**
     * Override addVisibilityToggle to handle brightness sliders
     */
    addVisibilityToggle() {
        const container = document.createElement('div');
        container.style.marginBottom = '10px';
        container.style.display = 'flex';
        container.style.justifyContent = 'space-between';
        container.style.alignItems = 'center';

        const labelElem = document.createElement('label');
        labelElem.textContent = 'Sky: ';

        // Create switch container
        const switchLabel = document.createElement('label');
        switchLabel.className = 'switch';

        // Create toggle input
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = true; // Initially visible
        toggle.id = 'sky-panel-visibility-toggle';

        // Add event listener
        toggle.addEventListener('change', (e) => {
            if (this.planet) {
                // Always set visibility directly on the sky object
                this.planet.getObject().visible = e.target.checked;

                // Update the Starry Sky toggle in the Solar System Controls panel
                const starryToggle = document.getElementById('starry-sky-visibility-toggle');
                if (starryToggle) {
                    starryToggle.checked = e.target.checked;
                }

                // Manually trigger scene background update
                if (e.target.checked) {
                    // Load the starry sky texture
                    const textureLoader = new THREE.TextureLoader();
                    textureLoader.load('textures/starry-sky-texture.jpg', (texture) => {
                        if (window.solarSystem && window.solarSystem.scene) {
                            window.solarSystem.scene.background = texture;
                        }
                    });
                } else {
                    // Set to black background
                    if (window.solarSystem && window.solarSystem.scene) {
                        window.solarSystem.scene.background = new THREE.Color(0x000000);
                    }
                }

                // Update Stars and Constellations brightness sliders
                const starsContainer = document.getElementById('sky-stars-container');
                const constellationsContainer = document.getElementById('sky-constellations-container');

                if (starsContainer) {
                    // Grey out the entire container when disabled
                    starsContainer.style.opacity = e.target.checked ? '1' : '0.5';

                    // Disable all interactive elements in the container
                    const interactiveElements = starsContainer.querySelectorAll('input, img');
                    interactiveElements.forEach(element => {
                        element.disabled = !e.target.checked;
                        // Set cursor style based on element state
                        if (element.tagName === 'IMG') {
                            element.style.cursor = e.target.checked ? 'pointer' : 'default';
                            if (!e.target.checked) {
                                element.style.pointerEvents = 'none';
                            } else {
                                element.style.pointerEvents = 'auto';
                            }
                        } else if (element.tagName === 'INPUT') {
                            if (element.type === 'range' || element.type === 'checkbox') {
                                element.style.cursor = e.target.checked ? 'pointer' : 'default';
                            }
                        }
                    });
                }

                if (constellationsContainer) {
                    // Grey out the entire container when disabled
                    constellationsContainer.style.opacity = e.target.checked ? '1' : '0.5';

                    // Disable all interactive elements in the container
                    const interactiveElements = constellationsContainer.querySelectorAll('input, img');
                    interactiveElements.forEach(element => {
                        element.disabled = !e.target.checked;
                        // Set cursor style based on element state
                        if (element.tagName === 'IMG') {
                            element.style.cursor = e.target.checked ? 'pointer' : 'default';
                            if (!e.target.checked) {
                                element.style.pointerEvents = 'none';
                            } else {
                                element.style.pointerEvents = 'auto';
                            }
                        } else if (element.tagName === 'INPUT') {
                            if (element.type === 'range' || element.type === 'checkbox') {
                                element.style.cursor = e.target.checked ? 'pointer' : 'default';
                            }
                        }
                    });
                }
            }
        });

        // Create slider span
        const sliderSpan = document.createElement('span');
        sliderSpan.className = 'slider';

        // Assemble the switch
        switchLabel.appendChild(toggle);
        switchLabel.appendChild(sliderSpan);

        // Add elements to container
        container.appendChild(labelElem);
        container.appendChild(switchLabel);

        // Add to control panel
        this.consoleContent.appendChild(container);
    }

    /**
     * Add brightness slider with toggle
     */
    addBrightnessSlider(label, id) {
        const container = document.createElement('div');
        container.style.marginBottom = '15px';
        container.style.paddingLeft = '20px'; // Indent to show hierarchy
        container.id = `sky-${id}-container`;

        // Add label
        const sliderLabel = document.createElement('label');
        sliderLabel.textContent = `${label}: `;
        sliderLabel.style.display = 'block';
        sliderLabel.style.marginBottom = '5px';
        container.appendChild(sliderLabel);

        // Create controls container for slider, reset button and toggle
        const controlsContainer = document.createElement('div');
        controlsContainer.style.display = 'flex';
        controlsContainer.style.alignItems = 'center';
        controlsContainer.style.gap = '10px';

        // Create slider
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '1';
        slider.step = '0.01';
        // Use default brightness values from the Sky object
        const defaultValue = id === 'stars' ? this.planet.defaultStarBrightness : this.planet.defaultConstellationBrightness;
        slider.value = defaultValue.toString();
        slider.style.flexGrow = '1';
        slider.id = `sky-${id}-brightness-slider`;

        // Create reset button
        const resetButton = document.createElement('img');
        resetButton.src = 'icons/reset.png';
        resetButton.style.width = '24px';
        resetButton.style.height = '24px';
        resetButton.title = "Reset to default brightness";
        // Set cursor style based on disabled state
        resetButton.style.cursor = 'pointer';
        resetButton.setAttribute('data-disabled', 'false');

        // Add event listener for reset button
        resetButton.addEventListener('click', () => {
            slider.value = defaultValue.toString();

            if (id === 'stars') {
                this.planet.setStarsBrightness(defaultValue);
                toggle.checked = true;
                if (this.planet.sphere) {
                    this.planet.sphere.visible = true;
                }
            } else if (id === 'constellations') {
                this.planet.setConstellationsBrightness(defaultValue);
                toggle.checked = id === 'stars'; // Only turn on constellations if it's stars
                if (this.planet.constellationSphere) {
                    this.planet.constellationSphere.visible = id === 'stars';
                }
            }
        });

        // Create switch container
        const switchLabel = document.createElement('label');
        switchLabel.className = 'switch';
        switchLabel.title = `Show/Hide ${label}`;

        // Create toggle input
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = id === 'stars' ? true : false; // Stars on by default, constellations off
        toggle.id = `sky-${id}-toggle`;

        // Create slider span
        const sliderSpan = document.createElement('span');
        sliderSpan.className = 'slider';

        // Assemble the switch
        switchLabel.appendChild(toggle);
        switchLabel.appendChild(sliderSpan);

        // Add event listener for slider
        slider.addEventListener('input', () => {
            const brightness = parseFloat(slider.value);

            // If slider is moved and toggle is off, turn it on
            if (!toggle.checked && brightness > 0) {
                toggle.checked = true;

                // Update visibility based on toggle
                if (id === 'stars' && this.planet.sphere) {
                    this.planet.sphere.visible = true;
                } else if (id === 'constellations' && this.planet.constellationSphere) {
                    this.planet.constellationSphere.visible = true;
                }
            }

            // Update brightness
            if (id === 'stars') {
                this.planet.setStarsBrightness(brightness);
            } else if (id === 'constellations') {
                this.planet.setConstellationsBrightness(brightness);
            }
        });

        // Add event listener for toggle
        toggle.addEventListener('change', (e) => {
            if (id === 'stars' && this.planet.sphere) {
                this.planet.sphere.visible = e.target.checked;

                // If turning on, apply current brightness
                if (e.target.checked) {
                    this.planet.setStarsBrightness(parseFloat(slider.value));
                }
            } else if (id === 'constellations' && this.planet.constellationSphere) {
                this.planet.constellationSphere.visible = e.target.checked;

                // If turning on, apply current brightness
                if (e.target.checked) {
                    this.planet.setConstellationsBrightness(parseFloat(slider.value));
                }
            }
        });

        // Add components to controls container
        controlsContainer.appendChild(slider);
        controlsContainer.appendChild(resetButton);
        controlsContainer.appendChild(switchLabel);

        // Add controls container to main container
        container.appendChild(controlsContainer);

        // Add to control panel
        this.consoleContent.appendChild(container);

        // Apply initial brightness
        if (id === 'stars') {
            this.planet.setStarsBrightness(parseFloat(slider.value));
        } else if (id === 'constellations') {
            this.planet.setConstellationsBrightness(parseFloat(slider.value));
        }
    }

    /**
     * Override parent method to create Sky rotation controls section
     */
    createSkyRotationSection() {
        // Create section header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Rotation Controls';
        sectionHeader.style.margin = '15px 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Get default values from the Sky object if available
        const defaultPitch = this.planet.defaultPitchDegrees !== undefined ? this.planet.defaultPitchDegrees : 0;
        const defaultYaw = this.planet.defaultYawDegrees !== undefined ? this.planet.defaultYawDegrees : 0;
        const defaultRoll = this.planet.defaultRollDegrees !== undefined ? this.planet.defaultRollDegrees : 23.4;

        // Add rotation sliders with defaults from Sky object
        this.addRotationSlider('Pitch', 'pitch', defaultPitch);
        this.addRotationSlider('Yaw', 'yaw', defaultYaw);
        this.addRotationSlider('Roll', 'roll', defaultRoll);
    }
}