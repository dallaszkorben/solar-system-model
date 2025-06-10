/**
 * Base class for all control panels
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
     * Creates a control group with a slider, reset button, and toggle switch
     *
     * @param {Object} config - Configuration object for the control
     * @param {string} config.label - Label text for the control
     * @param {Object} config.slider - Slider configuration
     * @param {string} config.slider.min - Minimum value for slider
     * @param {string} config.slider.max - Maximum value for slider
     * @param {string} config.slider.step - Step value for slider
     * @param {string} config.slider.value - Initial value for slider
     * @param {string} config.slider.id - ID for the slider element
     * @param {Object} config.resetButton - Reset button configuration
     * @param {string} config.resetButton.tooltip - Tooltip for reset button
     * @param {number} config.resetButton.resetValue - Value to set when reset button is clicked
     * @param {Object} config.toggle - Toggle switch configuration
     * @param {string} config.toggle.tooltip - Tooltip for toggle switch
     * @param {boolean} config.toggle.checked - Initial state of toggle
     * @param {string} config.toggle.id - ID for the toggle element
     * @param {Function} config.onSliderChange - Function to call when slider value changes
     * @param {Function} config.onReset - Function to call when reset button is clicked
     * @param {Function} config.onToggleChange - Function to call when toggle state changes
     * @returns {HTMLElement} - The created container element
     */
    createSliderControllerComponent(config) {
        const container = document.createElement('div');
        container.style.marginBottom = '15px';

        // Add label
        const controlLabel = document.createElement('label');
        controlLabel.textContent = config.label;
        controlLabel.style.display = 'block';
        controlLabel.style.marginBottom = '5px';
        container.appendChild(controlLabel);

        // Create controls container for slider, reset button and toggle
        const controlsContainer = document.createElement('div');
        controlsContainer.style.display = 'flex';
        controlsContainer.style.alignItems = 'center';
        controlsContainer.style.gap = '10px';

        // Create slider
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = config.slider.min;
        slider.max = config.slider.max;
        slider.step = config.slider.step;
        slider.value = config.slider.value;
        slider.style.flexGrow = '1';
        slider.id = config.slider.id;

        // Create reset button
        const resetButton = document.createElement('img');
        resetButton.src = 'icons/reset.png';
        resetButton.style.width = '24px';
        resetButton.style.height = '24px';
        resetButton.style.cursor = 'pointer';
        resetButton.title = config.resetButton.tooltip;

        // Create switch container
        const switchLabel = document.createElement('label');
        switchLabel.className = 'switch';
        switchLabel.title = config.toggle.tooltip;

        // Create toggle input
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = config.toggle.checked;
        toggle.id = config.toggle.id;

        // Create slider span
        const sliderSpan = document.createElement('span');
        sliderSpan.className = 'slider';

        // Assemble the switch
        switchLabel.appendChild(toggle);
        switchLabel.appendChild(sliderSpan);

        // Add event listener for slider
        slider.addEventListener('input', () => {
            if (config.onSliderChange) {
                config.onSliderChange(slider, toggle);
            }
        });

        // Add event listener for reset button
        resetButton.addEventListener('click', () => {
            if (config.onReset) {
                config.onReset(slider, toggle, config.resetButton.resetValue);
            }
        });

        // Add event listener for toggle
        toggle.addEventListener('change', (e) => {
            if (config.onToggleChange) {
                config.onToggleChange(e.target.checked, slider);
            }
        });

        // Add components to controls container
        controlsContainer.appendChild(slider);
        controlsContainer.appendChild(resetButton);
        controlsContainer.appendChild(switchLabel);

        // Add controls container to main container
        container.appendChild(controlsContainer);

        // Add to control panel if parent is provided
        if (config.parent) {
            config.parent.appendChild(container);
        }

        return container;
    }


}