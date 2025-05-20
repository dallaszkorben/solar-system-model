/**
 * Sun model creator
 */
class Sun {
    constructor() {
        // Actual diameter in km
        this.actualDiameter = 1391400;

        // Scaled diameter (divided by 1000 like Earth model) and multiplied by 10 for visibility
        this.diameter = (this.actualDiameter / 1000) * 50;
        this.radius = this.diameter / 2;

        // Rotation properties
        this.rotationEnabled = false; // Disabled by default
        this.rotationSpeed = 0.0001; // Initial rotation speed (28 day period)
        this.maxRotationSpeed = 0.001; // Maximum rotation speed
        this.rotationPeriod = 28; // days

        this.group = new THREE.Group();
        this.consolePane = null;
        this.consoleVisible = false;

        this.createSphere();
        this.createConsolePane();
    }

    createSphere() {
        const geometry = new THREE.SphereGeometry(this.radius, 64, 32);

        // Load Sun texture
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('images/Sun-texture.jpg');

        // Create material with the texture and emissive properties
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            emissive: 0xffff00,
            emissiveIntensity: 0.5,
            shininess: 0
        });

        this.sphere = new THREE.Mesh(geometry, material);
        this.group.add(this.sphere);

        // Add a point light at the center of the sun with increased intensity and no distance falloff
        const sunLight = new THREE.PointLight(0xffffff, 2.0, 0, 1);
        sunLight.castShadow = true;
        this.group.add(sunLight);
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
                document.getElementById('sun-rotation-toggle').checked = true;
            }
        });

        rotationSliderContainer.appendChild(rotationSliderLabel);
        rotationSliderContainer.appendChild(rotationSlider);
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
        if (this.rotationEnabled) {
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
    
undefined

    // Method to get the sun object
    getObject() {
        return this.group;
    }
}