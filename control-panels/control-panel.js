/**
 * Base class for all control panels
 *
 * Textures:
 *   - planet textures: https://www.solarsystemscope.com/textures/
 *   - sky textures:    https://svs.gsfc.nasa.gov/4851/
 */
class ControlPanel {
    constructor(title, position = { top: '20px', left: '20px' }) {
        this.consolePane = null;
        this.consoleContent = null;
        this.consoleVisible = false;
        this.title = title;
        this.position = position;

        this.createConsolePane();
    }

    createConsolePane() {
        // Create console pane
        this.consolePane = document.createElement('div');
        this.consolePane.className = 'console-pane';
        this.consolePane.style.position = 'absolute';
        this.consolePane.style.top = this.position.top;

        // Handle either left or right position
        if (this.position.right) {
            this.consolePane.style.right = this.position.right;
        } else if (this.position.left) {
            this.consolePane.style.left = this.position.left;
        }
        this.consolePane.style.backgroundColor = 'rgba(80, 80, 80, 0.8)';
        this.consolePane.style.color = 'white';
        this.consolePane.style.padding = '0';
        this.consolePane.style.borderRadius = '5px';
        this.consolePane.style.fontFamily = 'Arial, sans-serif';
        this.consolePane.style.display = 'block';
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
        const titleElement = document.createElement('h3');
        titleElement.textContent = this.title;
        titleElement.style.margin = '0';
        header.appendChild(titleElement);

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

            // Find the toggle for this panel in the Solar System Controls
            const planetName = this.title.split(' ')[0].toLowerCase();
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

        // Add to document
        document.body.appendChild(this.consolePane);

        // Add collapse/expand functionality
        collapseIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent dragging when clicking the icon

            // Get current position before changing display
            const currentTop = this.consolePane.offsetTop;
            const currentLeft = this.consolePane.offsetLeft;

            if (content.style.display === 'none') {
                // Expand
                content.style.display = 'block';
                collapseIcon.innerHTML = '&#9650;'; // Up arrow (collapse)
            } else {
                // Collapse
                content.style.display = 'none';
                collapseIcon.innerHTML = '&#9660;'; // Down arrow (expand)
            }

            // Restore position after changing display
            this.consolePane.style.top = `${currentTop}px`;
            this.consolePane.style.left = `${currentLeft}px`;
        });
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


// ---

    /**
     * Creates a control group with a slider, optional value display, reset button, and toggle switch
     *
     * @param {Object} config - Configuration object for the control
     * @param {string|Object} config.label - Label text or configuration
     * @param {string} [config.label.text] - Label text when using object format
     * @param {number} [config.label.width] - Width of label in pixels (default: 100px)
     * @param {Object} [config.icon] - Icon configuration
     * @param {string} [config.icon.src] - Source URL for the icon
     * @param {number} [config.icon.width] - Width of icon in pixels (default: 20px)
     * @param {Object} config.slider - Slider configuration
     * @param {string} config.slider.min - Minimum value for slider
     * @param {string} config.slider.max - Maximum value for slider
     * @param {string} config.slider.step - Step value for slider
     * @param {string} config.slider.value - Initial value for slider
     * @param {string} config.slider.id - ID for the slider element
     * @param {string|Object} [config.slider.unit] - Unit configuration
     * @param {string} [config.slider.unit.value] - Unit text to display after value
     * @param {number} [config.slider.unit.width] - Width for value display in pixels (default: 40px)
     * @param {Object} [config.resetButton] - Reset button configuration
     * @param {string} [config.resetButton.tooltip] - Tooltip for reset button
     * @param {number|string} [config.resetButton.resetValue] - Value to set when reset button is clicked (use 'none' to hide icon)
     * @param {number} [config.resetButton.width] - Width of reset button in pixels (default: 23px)
     * @param {Object} [config.toggle] - Toggle switch configuration
     * @param {string} [config.toggle.tooltip] - Tooltip for toggle switch
     * @param {boolean} [config.toggle.checked] - Initial state of toggle
     * @param {string} [config.toggle.id] - ID for the toggle element
     * @param {boolean} [config.toggle.required] - Whether to show the toggle (false = hidden but space reserved)
     * @param {Function} [config.onSliderChange] - Function to call when slider value changes
     * @param {Function} [config.onReset] - Function to call when reset button is clicked
     * @param {Function} [config.onToggleChange] - Function to call when toggle state changes
     * @param {HTMLElement} [config.parent] - Parent element to append the control to
     * @returns {Object} - Object containing the container, slider, valueDisplay, resetButton and toggle elements
     *
     * @example
     * // Basic slider with label and unit
     * const fovControls = this.createSliderControllerComponent({
     *     label: 'Field of View',
     *     slider: {
     *         min: '20',
     *         max: '100',
     *         step: '1',
     *         value: '40',
     *         id: 'camera-fov-slider',
     *         unit: '°'  // Simple string unit
     *     },
     *     resetButton: {
     *         tooltip: 'Reset to default',
     *         resetValue: 40
     *     },
     *     onSliderChange: (slider) => {
     *         camera.fov = parseFloat(slider.value);
     *         camera.updateProjectionMatrix();
     *     },
     *     parent: this.consoleContent
     * });
     *
     * @example
     * // Advanced slider with all options
     * const rotationControls = this.createSliderControllerComponent({
     *     label: {
     *         text: 'Rotation',
     *         width: 80
     *     },
     *     icon: {
     *         src: 'icons/rotate.png',
     *         width: 24
     *     },
     *     slider: {
     *         min: '0',
     *         max: '10',
     *         step: '0.1',
     *         value: '1.0',
     *         id: 'rotation-slider',
     *         unit: {
     *             value: 'x',
     *             width: 50
     *         }
     *     },
     *     resetButton: {
     *         tooltip: 'Reset to default speed',
     *         resetValue: 1.0,
     *         width: 24
     *     },
     *     toggle: {
     *         tooltip: 'Enable rotation',
     *         checked: true,
     *         id: 'rotation-toggle',
     *         required: true
     *     },
     *     onSliderChange: (slider, toggle) => {
     *         const speed = parseFloat(slider.value);
     *         setRotationSpeed(speed);
     *     },
     *     onReset: (slider) => {
     *         slider.value = '1.0';
     *         setRotationSpeed(1.0);
     *     },
     *     onToggleChange: (checked) => {
     *         setRotationEnabled(checked);
     *     },
     *     parent: this.consoleContent
     * });
     */
    createSliderControllerComponent(config) {
        const defaultIconWidth = 20;
        const defaultResetButtonWidth = 23;
        const defaultLabelWidth = 100;
        const defaultUnitWidth = 50;

        // Helper function to format value to fit within width
        const formatValueToFit = (value, unitStr, maxWidth) => {
            // Approximate character width in pixels (this is an estimate)
            const charWidth = 8;

            // Calculate how many characters we can fit
            const maxChars = Math.floor(maxWidth / charWidth) - unitStr.length;

            if (maxChars <= 0) return '';

            // Convert value to string
            let valueStr = parseFloat(value).toString();

            // If value already fits, return it
            if (valueStr.length + unitStr.length <= maxChars) {
                return valueStr;
            }

            // Handle negative numbers
            const isNegative = valueStr.startsWith('-');
            if (isNegative) {
                valueStr = valueStr.substring(1);
            }

            // Split into integer and decimal parts
            const parts = valueStr.split('.');
            const intPart = parts[0];
            const decimalPart = parts.length > 1 ? parts[1] : '';

            // Calculate available space for decimal digits
            let availableChars = maxChars - (isNegative ? 1 : 0) - intPart.length;
            if (decimalPart) availableChars--; // For decimal point

            // If we can't even fit the integer part with sign, truncate it
            if (availableChars < 0) {
                return (isNegative ? '-' : '') + intPart.substring(0, maxChars - (isNegative ? 1 : 0));
            }

            // If no decimal part or no space for it, return just the integer part
            if (!decimalPart || availableChars <= 0) {
                return (isNegative ? '-' : '') + intPart;
            }

            // Return formatted number with truncated decimal part
            return (isNegative ? '-' : '') + intPart + '.' + decimalPart.substring(0, availableChars);
        };

        const container = document.createElement('div');
        container.style.marginBottom = '15px';

        // Create controls container for all elements in a single line
        const controlsContainer = document.createElement('div');
        controlsContainer.style.display = 'flex';
        controlsContainer.style.alignItems = 'center';
        controlsContainer.style.gap = '10px';

        // Add icon or empty space for icon if configured
        if (config.icon) {
            const iconWidth = config.icon.width || defaultIconWidth;
            const iconContainer = document.createElement('div');
            iconContainer.style.width = `${iconWidth}px`;
            iconContainer.style.height = `${iconWidth}px`;
            iconContainer.style.flexShrink = '0';

            // Only add the actual icon if src is provided and not null/empty
            if (config.icon.src) {
                const icon = document.createElement('img');
                icon.src = config.icon.src;
                icon.style.width = '100%';
                icon.style.height = '100%';
                iconContainer.appendChild(icon);
            }
            controlsContainer.appendChild(iconContainer);
        }

        // Add label if provided
        if (config.label) {
            const labelContainer = document.createElement('div');
            labelContainer.style.flexShrink = '0';

            // Handle different label formats
            let labelText = '';
            let labelWidth = defaultLabelWidth;

            if (typeof config.label === 'string') {
                // Simple string label
                labelText = config.label;
            } else if (config.label && typeof config.label === 'object') {
                // Object format with text and/or width
                if (config.label.text !== undefined) {
                    labelText = config.label.text;
                }
                if (config.label.width !== undefined) {
                    labelWidth = config.label.width;
                }
            }

            // Set fixed width for the label container
            labelContainer.style.width = `${labelWidth}px`;

            // Create and add the label element
            const controlLabel = document.createElement('label');
            controlLabel.textContent = labelText;
            labelContainer.appendChild(controlLabel);

            controlsContainer.appendChild(labelContainer);
        }

        container.appendChild(controlsContainer);

        // Create slider
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = config.slider.min;
        slider.max = config.slider.max;
        slider.step = config.slider.step;
        slider.value = config.slider.value;
        slider.style.flexGrow = '1';
        slider.id = config.slider.id;

        // Create value display if unit is specified
        const valueDisplay = document.createElement('span');

        // Handle unit configuration
        if (config.slider.unit !== undefined) {
            let unitValue = '';
            let unitWidth = defaultUnitWidth;
            let showValue = true;

            // Handle different unit formats
            if (typeof config.slider.unit === 'string') {
                // Simple string unit
                unitValue = config.slider.unit;
            } else if (config.slider.unit && typeof config.slider.unit === 'object') {
                // Object format with value and/or width
                if (config.slider.unit.value !== undefined) {
                    unitValue = config.slider.unit.value;
                }
                if (config.slider.unit.width !== undefined) {
                    unitWidth = config.slider.unit.width;
                }
                // If neither value nor width is specified, use defaults
                showValue = config.slider.unit.value !== undefined ||
                           Object.keys(config.slider.unit).length === 0;
            }

            // Set width and alignment
            valueDisplay.style.minWidth = `${unitWidth}px`;
            valueDisplay.style.textAlign = 'right';
            valueDisplay.style.flexShrink = '0';

            // Set content if showing value
            if (showValue) {
                const formattedValue = formatValueToFit(slider.value, unitValue, unitWidth);
                valueDisplay.textContent = `${formattedValue}${unitValue}`;
            }
        } else {
            // No unit specified, don't show value display
            valueDisplay.style.display = 'none';
        }

        // Create reset button if configured
        const resetButton = document.createElement('img');

        if (config.resetButton) {
            const resetButtonWidth = config.resetButton.width || defaultResetButtonWidth;
            resetButton.style.width = `${resetButtonWidth}px`;
            resetButton.style.height = `${resetButtonWidth}px`;
            resetButton.style.cursor = 'pointer';

            // Only add the actual reset icon if resetValue is provided and not null
            if (config.resetButton.resetValue !== undefined &&
                config.resetButton.resetValue !== null &&
                config.resetButton.resetValue !== 'none') {
                resetButton.src = 'icons/reset.png';
            }

            if (config.resetButton.tooltip) {
                resetButton.title = config.resetButton.tooltip;
            }
        }

        // Create switch container and toggle elements only if toggle is configured
        const switchLabel = document.createElement('label');
        const toggle = document.createElement('input');
        const sliderSpan = document.createElement('span');

        if (config.toggle) {
            switchLabel.className = 'switch';
            if (config.toggle.tooltip) {
                switchLabel.title = config.toggle.tooltip;
            }

            // Create toggle input
            toggle.type = 'checkbox';
            toggle.checked = config.toggle.checked || false;
            if (config.toggle.id) {
                toggle.id = config.toggle.id;
            }

            // Create slider span
            sliderSpan.className = 'slider';

            // Assemble the switch
            switchLabel.appendChild(toggle);
            switchLabel.appendChild(sliderSpan);

            // Hide the toggle if required is false
            if (config.toggle.required === false) {
                switchLabel.style.visibility = 'hidden';
            }
        }

        // Add event listener for slider
        slider.addEventListener('input', () => {
            // Update value display if visible and showing values
            if (config.slider.unit !== undefined) {
                let unitValue = '';
                let showValue = true;
                let unitWidth = defaultUnitWidth;

                // Handle different unit formats
                if (typeof config.slider.unit === 'string') {
                    unitValue = config.slider.unit;
                } else if (config.slider.unit && typeof config.slider.unit === 'object') {
                    if (config.slider.unit.value !== undefined) {
                        unitValue = config.slider.unit.value;
                    }
                    if (config.slider.unit.width !== undefined) {
                        unitWidth = config.slider.unit.width;
                    }
                    // Only show value if value property exists or object is empty
                    showValue = config.slider.unit.value !== undefined ||
                               Object.keys(config.slider.unit).length === 0;
                }

                if (showValue) {
                    const formattedValue = formatValueToFit(slider.value, unitValue, unitWidth);
                    valueDisplay.textContent = `${formattedValue}${unitValue}`;
                }
            }

            if (config.onSliderChange) {
                config.onSliderChange(slider, toggle);
            }
        });

        // Add event listener for reset button if it has a reset value
        if (config.resetButton &&
            config.resetButton.resetValue !== undefined &&
            config.resetButton.resetValue !== null &&
            config.resetButton.resetValue !== 'none') {
            resetButton.addEventListener('click', () => {
                slider.value = config.resetButton.resetValue;

                // Update value display if visible
                if (config.slider.unit !== undefined) {
                    let unitValue = '';
                    let showValue = true;
                    let unitWidth = defaultUnitWidth;

                    // Handle different unit formats
                    if (typeof config.slider.unit === 'string') {
                        unitValue = config.slider.unit;
                    } else if (config.slider.unit && typeof config.slider.unit === 'object') {
                        if (config.slider.unit.value !== undefined) {
                            unitValue = config.slider.unit.value;
                        }
                        if (config.slider.unit.width !== undefined) {
                            unitWidth = config.slider.unit.width;
                        }
                        // Only show value if value property exists or object is empty
                        showValue = config.slider.unit.value !== undefined ||
                                   Object.keys(config.slider.unit).length === 0;
                    }

                    if (showValue) {
                        const formattedValue = formatValueToFit(slider.value, unitValue, unitWidth);
                        valueDisplay.textContent = `${formattedValue}${unitValue}`;
                    }
                }

                if (config.onReset) {
                    config.onReset(slider, toggle, config.resetButton.resetValue);
                }
            });
        }

        // Add event listener for toggle if it's configured
        if (config.toggle && config.onToggleChange) {
            toggle.addEventListener('change', (e) => {
                config.onToggleChange(e.target.checked, slider);
            });
        }

        // Add slider and other components to controls container
        controlsContainer.appendChild(slider);
        if (config.slider.unit !== undefined) {
            controlsContainer.appendChild(valueDisplay);
        }
        // Only add reset button if it's configured
        if (config.resetButton) {
            controlsContainer.appendChild(resetButton);
        }
        // Add toggle if it's configured (visible or hidden)
        if (config.toggle) {
            controlsContainer.appendChild(switchLabel);
        }

        // Add to control panel if parent is provided
        if (config.parent) {
            config.parent.appendChild(container);
        }

        return {
            container,
            slider,
            valueDisplay,
            resetButton,
            toggle
        };
    }

    /**
     * Creates a control with label and one or more toggle switches
     *
     * @param {Object} config - Configuration object for the control
     * @param {string} config.label - Label text for the control
     * @param {Object} config.icon - Optional icon configuration
     * @param {string} config.icon.src - Source URL for the icon
     * @param {Array} config.toggles - Array of toggle configurations
     * @param {string} config.toggles[].tooltip - Tooltip for the toggle switch
     * @param {boolean} config.toggles[].checked - Initial state of toggle
     * @param {string} config.toggles[].id - ID for the toggle element
     * @param {Function} config.toggles[].onChange - Function to call when toggle state changes
     * @param {number} config.toggles[].marginRight - Optional right margin in pixels
     * @param {HTMLElement} config.parent - Parent element to append the control to
     * @returns {HTMLElement} - The created container element
     *
     * Example for sigle toggle:
     *    addAxisToggle(visibility) {
     *        return this.createToggleComponent({
     *            label: 'Rotation Axis: ',
     *            tooltip: 'Show/Hide Rotation Axis',
     *            checked: visibility,
     *            id: `${this.planet.id}-axis-toggle`,
     *            onChange: (checked) => {
     *                if (this.planet.axis) {
     *                    this.planet.axis.visible = checked;
     *                }
     *            },
     *            parent: this.consoleContent
     *        });
     *    }
     *
     * Example for multiple toggles:
     *
     *    createCelestialBodyControl(body) {
     *        return this.createToggleComponent({
     *            label: body.name,
     *            icon: {
     *                src: `icons/${body.id}.png`
     *            },
     *            toggles: [
     *                {
     *                    tooltip: `Show/Hide ${body.name}`,
     *                    checked: true,
     *                    id: `${body.id}${SolarSystemControlPanel.elementIds.planetVisibilitySwitch}`,
     *                    onChange: (checked) => {
     *                        if (this.solarSystem && this.solarSystem.planetObjs && this.solarSystem.planetObjs[body.id]) {
     *                            this.controlPanels[body.id].setPlanetVisibility(checked);
     *                        }
     *                    },
     *                    marginRight: 10
     *                },
     *                {
     *                    tooltip: `Show/Hide ${body.name} Controls`,
     *                    checked: false,
     *                    id: `${body.id}-controls-toggle`,
     *                    onChange: (checked) => {
     *                        if (checked) {
     *                            this.controlPanels[body.id].show();
     *                        } else {
     *                            this.controlPanels[body.id].hide();
     *                        }
     *                    }
     *                }
     *            ],
     *            parent: this.consoleContent
     *        });
     *    }
     */
    createToggleComponent(config) {
        const container = document.createElement('div');
        container.style.marginBottom = '10px';
        container.style.display = 'flex';
        container.style.justifyContent = 'space-between';
        container.style.alignItems = 'center';

        // Create label container that can include an icon
        const labelContainer = document.createElement('div');
        labelContainer.style.display = 'flex';
        labelContainer.style.alignItems = 'center';
        labelContainer.style.flexGrow = '1';

        // Add icon if provided
        if (config.icon) {
            const iconContainer = document.createElement('div');
            iconContainer.style.width = '24px';
            iconContainer.style.height = '24px';
            iconContainer.style.marginRight = '8px';

            const icon = document.createElement('img');
            icon.src = config.icon.src;
            icon.style.width = '100%';
            icon.style.height = '100%';
            iconContainer.appendChild(icon);
            labelContainer.appendChild(iconContainer);
        }

        // Add label
        const labelElem = document.createElement('label');
        labelElem.textContent = config.label;
        labelContainer.appendChild(labelElem);

        // Add elements to container
        container.appendChild(labelContainer);

        // Handle single toggle case for backward compatibility
        const toggles = config.toggles || [{
            tooltip: config.tooltip,
            checked: config.checked,
            id: config.id,
            onChange: config.onChange
        }];

        // Add all toggles
        toggles.forEach((toggleConfig, index) => {
            // Create switch container
            const switchLabel = document.createElement('label');
            switchLabel.className = 'switch';
            switchLabel.title = toggleConfig.tooltip;

            // Add margin if specified or if not the last toggle
            if (toggleConfig.marginRight || index < toggles.length - 1) {
                switchLabel.style.marginRight = toggleConfig.marginRight ?
                    `${toggleConfig.marginRight}px` : '10px';
            }

            // Create toggle input
            const toggle = document.createElement('input');
            toggle.type = 'checkbox';
            toggle.checked = toggleConfig.checked;
            toggle.id = toggleConfig.id;

            // Add event listener
            toggle.addEventListener('change', (e) => {
                if (toggleConfig.onChange) {
                    toggleConfig.onChange(e.target.checked);
                }
            });

            // Create slider span
            const sliderSpan = document.createElement('span');
            sliderSpan.className = 'slider';

            // Assemble the switch
            switchLabel.appendChild(toggle);
            switchLabel.appendChild(sliderSpan);

            container.appendChild(switchLabel);
        });

        // Add to parent if provided
        if (config.parent) {
            config.parent.appendChild(container);
        }

        return container;
    }
}