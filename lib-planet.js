/**
 * Base Planet class for all planets in the solar system
 */
class Planet {

    static scaleDownDiameterFactor = 100;
    static scaleDownOrbitFactor = 2000;

    // Earth reference data for relative calculations
    static earthData = {
        rotationPeriod: 23.93, // hours
        orbitalPeriod: 365.25, // days
    };

    // Calculate relative periods based on Earth as reference
    static calculateRelativePeriods(rotationPeriod, orbitalPeriod) {
        // Calculate planet-to-Earth ratios
        const rotationRatio = rotationPeriod / this.earthData.rotationPeriod;
        const orbitalRatio = orbitalPeriod / this.earthData.orbitalPeriod;

        return {
            rotation: rotationRatio,
            orbit: orbitalRatio
        };
    }

//    constructor(diameter, factData, nonScaleModelData, scaleModelData) {
    constructor(factData, nonScaleModelData, scaleModelData) {
            // Store reference data
        this.factData = factData;
        this.nonScaleModelData = nonScaleModelData;
        this.scaleModelData = scaleModelData;

        // Use non-scale model data by default
//        this.diameter = diameter;
        this.diameter = nonScaleModelData.diameter

        this.radius = this.diameter / 2;
        this.axialTilt = factData.axialTilt; // degrees
        this.group = new THREE.Group();
        this.latitudeCircles = new THREE.Group(); // Group for latitude circles
        this.consolePane = null;
        this.consoleVisible = false;

        // Rotation properties
        this.rotationEnabled = false; // Disabled by default
        this.rotationPeriod = nonScaleModelData.rotationPeriod; // Time to complete one rotation in seconds
        this.maxRotationPeriod = nonScaleModelData.maxRotationPeriod; // Time at maximum speed
        this.rotationSpeed = nonScaleModelData.rotationSpeed(); // Initial rotation speed
        this.maxRotationSpeed = nonScaleModelData.maxRotationSpeed(); // Maximum rotation speed

        // Orbit properties
        this.actualOrbitRadius = factData.orbitRadius; // Real distance in km
        this.orbitRadius = nonScaleModelData.orbitRadius; // Non-scaled for visual appeal
        this.orbitalPeriod = nonScaleModelData.orbitalPeriod; // Time to complete one orbit in seconds
        this.maxOrbitalPeriod = nonScaleModelData.maxOrbitalPeriod; // Time at maximum speed
        this.orbitEnabled = false; // Disabled by default
        this.orbitSpeed = nonScaleModelData.orbitSpeed(); // Initial orbit speed
        this.maxOrbitSpeed = nonScaleModelData.maxOrbitSpeed(); // Maximum orbit speed
        this.orbitVisibility = 1.0; // Full visibility by default
        this.orbitLine = null;
        this.orbitGroup = new THREE.Group(); // Parent group for orbital motion

        // Day/Night effect properties
        this.dayNightEnabled = true; // Enabled by default

        // Close-up view properties
        this.closeUpViewEnabled = false;
        this.sideViewEnabled = false;
        this.originalCameraPosition = null;
    }

    createSphere(texturePath) {
        const geometry = new THREE.SphereGeometry(this.radius, 64, 32);
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(texturePath);

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 1.0,
            metalness: 0.0
        });

        this.sphere = new THREE.Mesh(geometry, material);
        this.group.add(this.sphere);

        this.standardMaterial = material;
        this.basicMaterial = new THREE.MeshBasicMaterial({
            map: texture
        });
    }

    createAxis(color = 0xff0000) {
        const axisLength = this.diameter * 1.1;
        const cylinderRadius = 100;
        const cylinderGeometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, axisLength, 16);
        const cylinderMaterial = new THREE.MeshBasicMaterial({
            color: color,
            depthTest: true,
            depthWrite: false
        });
        this.axis = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        this.axis.renderOrder = 1;
        this.group.add(this.axis);
    }

    createLatitudeCircles(latitudes) {
        const segments = 64;

        latitudes.forEach(latitude => {
            const phi = THREE.MathUtils.degToRad(latitude.angle);
            const latRadius = this.radius * Math.cos(phi);
            const y = this.radius * Math.sin(phi);
            const vertices = [];

            for (let i = 0; i <= segments; i++) {
                const theta = (i / segments) * Math.PI * 2;
                const x = latRadius * Math.cos(theta);
                const z = latRadius * Math.sin(theta);
                vertices.push(x, y, z);
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            const material = new THREE.LineBasicMaterial({ color: latitude.color, linewidth: 2 });
            const circle = new THREE.Line(geometry, material);
            this.latitudeCircles.add(circle);
        });

        this.group.add(this.latitudeCircles);
        this.latitudeCircles.visible = false; // Hide by default
    }

    createOrbit() {
        const segments = 128;
        const orbitGeometry = new THREE.BufferGeometry();
        const vertices = [];

        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const x = this.orbitRadius * Math.cos(theta);
            const z = this.orbitRadius * Math.sin(theta);
            vertices.push(x, 0, z);
        }

        orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        const orbitMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: this.orbitVisibility,
            depthTest: true,
            depthWrite: false
        });

        this.orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
        this.orbitLine.renderOrder = 1;

        this.group.position.x = this.orbitRadius;
        this.orbitGroup.add(this.group);
        this.orbitGroup.add(this.orbitLine);
    }

    applyTilt() {
        this.group.rotation.z = THREE.MathUtils.degToRad(this.axialTilt);
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

    addToggle(label, id, initialState, onChange) {
        const container = document.createElement('div');
        container.style.marginBottom = '10px';
        container.style.display = 'flex';
        container.style.justifyContent = 'space-between';
        container.style.alignItems = 'center';

        const labelElem = document.createElement('label');
        labelElem.textContent = label;

        // Create switch container
        const switchLabel = document.createElement('label');
        switchLabel.className = 'switch';

        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = initialState;
        if (id) toggle.id = id;
        toggle.addEventListener('change', onChange);

        // Create slider span
        const sliderSpan = document.createElement('span');
        sliderSpan.className = 'slider';

        // Assemble the switch
        switchLabel.appendChild(toggle);
        switchLabel.appendChild(sliderSpan);

        container.appendChild(labelElem);
        container.appendChild(switchLabel);
        this.consoleContent.appendChild(container);
    }

    addSlider(label, id, defaultValue, onChange) {
        const container = document.createElement('div');
        container.style.marginBottom = '15px';

        const labelElem = document.createElement('label');
        labelElem.textContent = label;
        labelElem.style.display = 'block';
        labelElem.style.marginBottom = '5px';
        container.appendChild(labelElem);

        const controlsContainer = document.createElement('div');
        controlsContainer.style.display = 'flex';
        controlsContainer.style.alignItems = 'center';
        controlsContainer.style.gap = '10px';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '100';
        slider.value = defaultValue.toString();
        slider.style.flexGrow = '1';
        if (id) slider.id = id;

        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Reset';
        resetBtn.style.padding = '2px 8px';
        resetBtn.style.fontSize = '12px';
        resetBtn.style.backgroundColor = '#555';
        resetBtn.style.color = 'white';
        resetBtn.style.border = '1px solid #777';
        resetBtn.style.borderRadius = '3px';
        resetBtn.style.cursor = 'pointer';
        resetBtn.style.flexShrink = '0';

        slider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            onChange(value);
        });

        resetBtn.addEventListener('click', () => {
            slider.value = '50';
            onChange(50);
        });

        controlsContainer.appendChild(slider);
        controlsContainer.appendChild(resetBtn);
        container.appendChild(controlsContainer);
        this.consoleContent.appendChild(container);
    }

    toggleDayNightEffect(enabled) {
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
            this.originalCameraPosition = {
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z
            };

            const planetWorldPos = new THREE.Vector3();
            this.sphere.getWorldPosition(planetWorldPos);
            const closeUpDistance = this.radius * 3;

            if (sideView) {
                const cameraPos = {
                    x: planetWorldPos.x,
                    y: planetWorldPos.y,
                    z: planetWorldPos.z + this.radius * 3
                };
                camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
                camera.lookAt(planetWorldPos);

                if (controls) {
                    controls.target.copy(planetWorldPos);
                    controls.update();
                }
            } else {
                const cameraPos = {
                    x: planetWorldPos.x - closeUpDistance,
                    y: planetWorldPos.y,
                    z: planetWorldPos.z
                };
                camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
                camera.lookAt(planetWorldPos);

                if (controls) {
                    controls.target.copy(planetWorldPos);
                    controls.update();
                }
            }

            this.prevRotationEnabled = this.rotationEnabled;
            this.prevOrbitEnabled = this.orbitEnabled;
            this.rotationEnabled = false;
            this.orbitEnabled = false;

            const planetName = this.constructor.name.toLowerCase();
            document.getElementById(`${planetName}-rotation-toggle`).checked = false;
            document.getElementById(`${planetName}-orbit-toggle`).checked = false;

        } else if (this.originalCameraPosition) {
            camera.position.set(
                this.originalCameraPosition.x,
                this.originalCameraPosition.y,
                this.originalCameraPosition.z
            );

            camera.lookAt(0, 0, 0);

            if (controls) {
                controls.target.set(0, 0, 0);
                controls.update();
            }

            const planetName = this.constructor.name.toLowerCase();
            if (this.prevRotationEnabled) {
                this.rotationEnabled = true;
                document.getElementById(`${planetName}-rotation-toggle`).checked = true;
            }

            if (this.prevOrbitEnabled) {
                this.orbitEnabled = true;
                document.getElementById(`${planetName}-orbit-toggle`).checked = true;
            }
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
        // Rotate the sphere around its axis if rotation is enabled
        if (this.rotationEnabled && this.rotationSpeed > 0) {
            // Default rotation direction (counterclockwise)
            this.sphere.rotation.y += this.rotationSpeed;
        }

        // Orbit around the Sun if orbit is enabled
        if (this.orbitEnabled && this.orbitSpeed > 0) {
            const previousOrbitAngle = this.orbitGroup.rotation.y;
            this.orbitGroup.rotation.y += this.orbitSpeed;
            const deltaAngle = this.orbitGroup.rotation.y - previousOrbitAngle;
            this.group.rotation.y -= deltaAngle;
        }
    }

    getObject() {
        return this.orbitGroup;
    }
}