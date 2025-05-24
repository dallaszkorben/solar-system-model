/**
 * Sun model creator
 */
// Sun real facts data
const sunFactData = {
    diameter: 1391400, // km
    rotationPeriod: 28, // days
    axialTilt: 7.25, // degrees
};

// Sun scale model data (scaled values for realistic representation)
const sunScaleModelData = {
    diameter: (1391400 / 1000) * 20, // scaled diameter
    rotationPeriod: 280, // 280 seconds to complete one rotation (10x Earth's rotation period)
    maxRotationPeriod: 28, // 28 seconds at maximum speed
    rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); }, // radians per frame
    maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); }, // based on max period
};

// Sun non-scale model data (values for visual appeal)
const sunNonScaleModelData = {
    diameter: (1391400 / 1000) * 20, // visually appealing diameter
    rotationPeriod: 28, // 28 seconds to complete one rotation (28x Earth's rotation period)
    maxRotationPeriod: 2.8, // 2.8 seconds at maximum speed
    rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); }, // radians per frame
    maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); }, // based on max period
};

class Sun {
    constructor() {
        // Use non-scale model data by default
        this.actualDiameter = sunFactData.diameter;
        this.diameter = sunNonScaleModelData.diameter;
        this.radius = this.diameter / 2;

        // Rotation properties
        this.rotationEnabled = false; // Disabled by default
        this.axialTilt = sunFactData.axialTilt; // degrees
        this.rotationPeriod = sunNonScaleModelData.rotationPeriod; // Time to complete one rotation in seconds
        this.maxRotationPeriod = sunNonScaleModelData.maxRotationPeriod; // Time at maximum speed
        this.rotationSpeed = sunNonScaleModelData.rotationSpeed(); // Initial rotation speed
        this.maxRotationSpeed = sunNonScaleModelData.maxRotationSpeed(); // Maximum rotation speed

        this.group = new THREE.Group();
        this.consolePane = null;
        this.consoleVisible = false;

        this.createSphere();
        this.createAxis();
        this.applyTilt();
        this.createConsolePane();
    }

    createSphere() {
        const geometry = new THREE.SphereGeometry(this.radius, 64, 32);

        // Load Sun texture
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('images/Sun-texture.jpg');

        // Create material with the texture and emissive properties
        //const material = new THREE.MeshPhongMaterial({
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            emissive: 0xffaa00,
            emissiveIntensity: 0.3,
            shininess: 5
        });

        this.sphere = new THREE.Mesh(geometry, material);
        this.group.add(this.sphere);

        // Add a point light at the center of the sun with increased intensity and no distance falloff
        const sunLight = new THREE.PointLight(0xffffff, 2.0, 0, 1);
        sunLight.castShadow = true;
        this.group.add(sunLight);
        
        // Create the rotation axis
        this.createAxis();
        
        // Apply axial tilt
        this.applyTilt();
    }
    
    createAxis() {
        // Axis should be 10% longer than sphere diameter
        const axisLength = this.diameter * 1.1;

        // Create a cylinder to represent the axis - make it wider (20 pixels)
        const cylinderRadius = 100; // Increased from 5 to 10 (20 pixels wide)
        const cylinderGeometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, axisLength, 16);
        const cylinderMaterial = new THREE.MeshBasicMaterial({
            color: 0xff8800, // Orange color for Sun's axis
            depthTest: true,
            depthWrite: false
        });
        this.axis = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

        // Ensure the axis is rendered after the Sun sphere
        this.axis.renderOrder = 1;
        this.group.add(this.axis);
    }
    
    applyTilt() {
        // Apply Sun's axial tilt - fixed in space (always pointing in the same direction)
        this.group.rotation.z = THREE.MathUtils.degToRad(this.axialTilt);
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
        title.textContent = 'Sun Controls';
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

        // Create rotation section
        this.createRotationSection();

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

    createRotationSection() {
        // Create section header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Rotation Controls';
        sectionHeader.style.margin = '0 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);
        
        // Add axis toggle
        const axisToggleContainer = document.createElement('div');
        axisToggleContainer.style.marginBottom = '10px';

        const axisToggleLabel = document.createElement('label');
        axisToggleLabel.textContent = 'Show Axis: ';
        axisToggleLabel.style.marginRight = '10px';

        const axisToggle = document.createElement('input');
        axisToggle.type = 'checkbox';
        axisToggle.checked = true; // Axis is visible by default
        axisToggle.id = 'sun-axis-toggle';
        axisToggle.addEventListener('change', (e) => {
            if (this.axis) {
                this.axis.visible = e.target.checked;
            }
        });

        axisToggleContainer.appendChild(axisToggleLabel);
        axisToggleContainer.appendChild(axisToggle);
        this.consoleContent.appendChild(axisToggleContainer);

        // Add rotation toggle
        const rotationToggleContainer = document.createElement('div');
        rotationToggleContainer.style.marginBottom = '10px';

        const rotationToggleLabel = document.createElement('label');
        rotationToggleLabel.textContent = 'Enable Rotation: ';
        rotationToggleLabel.style.marginRight = '10px';

        const rotationToggle = document.createElement('input');
        rotationToggle.type = 'checkbox';
        rotationToggle.checked = this.rotationEnabled;
        rotationToggle.id = 'sun-rotation-toggle';
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
        rotationSlider.id = 'sun-rotation-speed-slider';
        
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
                document.getElementById('sun-rotation-toggle').checked = true;
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
        
        // Add slider and button to the container
        rotationSliderControlsContainer.appendChild(rotationSlider);
        rotationSliderControlsContainer.appendChild(rotationResetButton);
        rotationSliderContainer.appendChild(rotationSliderControlsContainer);

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

    update(deltaTime) {
        // Handle rotation if enabled
        if (this.rotationEnabled && this.rotationSpeed > 0) {
            // Rotate counterclockwise (positive value for y-axis rotation)
            this.sphere.rotation.y += this.rotationSpeed;
        }
    }

    // Method to toggle rotation on/off
    toggleRotation() {
        this.rotationEnabled = !this.rotationEnabled;
        return this.rotationEnabled;
    }

    // Method to set rotation speed
    setRotationSpeed(speed) {
        this.rotationSpeed = speed;
    }



    // Method to get the sun object
    getObject() {
        return this.group;
    }
}