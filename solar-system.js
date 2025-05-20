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
        this.planets = [];
        
        // Control panel
        this.consolePane = null;
        this.consoleVisible = false;
        
        // Create the solar system
        this.createSun();
        this.createEarth();
        this.createConsolePane();
    }
    
    createSun() {
        this.sun = new Sun();
        this.group.add(this.sun.getObject());
    }
    
    createEarth() {
        this.earth = new Earth(12000); // 12000m diameter
        this.planets.push(this.earth);
        this.group.add(this.earth.getObject());
        
        // Add Budapest marker to Earth
        const budapestMarker = new LocationMarker(LOCATIONS.BUDAPEST);
        budapestMarker.attachToPlanet(this.earth);
        
        // Add Kiruna marker to Earth
        const kirunaMarker = new LocationMarker(LOCATIONS.KIRUNA);
        kirunaMarker.attachToPlanet(this.earth);
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
        
        // Create view controls section
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
        sectionHeader.textContent = 'View Controls';
        sectionHeader.style.margin = '0 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);
        
        // Add buttons for different views
        this.addViewButton('Top View', () => this.setTopView());
        this.addViewButton('Side View', () => this.setSideView());
        this.addViewButton('Sun View', () => this.setSunView());
        this.addViewButton('Earth View', () => this.setEarthView());
        

        
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
        
        // Find the largest orbit radius among all planets
        let maxOrbitRadius = 150000; // Default value
        
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
        
        // Add 10% margin to ensure the orbit is fully visible
        distance *= 1.1;
        
        camera.position.set(0, distance, 0);
        camera.lookAt(0, 0, 0);
        
        if (controls) {
            controls.target.set(0, 0, 0);
            controls.update();
        }
    }
    
    setSideView() {
        if (!camera) return;
        
        // Position camera to the side of the solar system
        const maxOrbitRadius = this.earth ? this.earth.orbitRadius : 150000;
        const distance = maxOrbitRadius * 1.5;
        
        camera.position.set(0, 0, distance);
        camera.lookAt(0, 0, 0);
        
        if (controls) {
            controls.target.set(0, 0, 0);
            controls.update();
        }
    }
    
    setSunView() {
        if (!camera || !this.sun) return;
        
        // Position camera to view the Sun up close
        const viewFactor = 0.8; // 80% of vertical screen
        const distance = this.sun.diameter / (2 * Math.tan((camera.fov * Math.PI / 180) / 2) * viewFactor);
        
        camera.position.set(0, 0, distance);
        camera.lookAt(0, 0, 0);
        
        if (controls) {
            controls.target.set(0, 0, 0);
            controls.update();
        }
    }
    
    setEarthView() {
        if (!camera || !this.earth) return;
        
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
    }
    
    getObject() {
        return this.group;
    }
}