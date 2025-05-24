/**
 * Venus model creator
 */
// Venus real facts data
const venusFactData = {
    diameter: 12104, // km
    axialTilt: 177.3, // degrees (retrograde rotation)
    orbitRadius: 108200000, // km (average distance from Sun)
    rotationPeriod: 5832.5, // hours (243 days, retrograde)
    orbitalPeriod: 224.7, // days
};

// Calculate relative periods based on Earth as reference
function calculateRelativePeriods(rotationPeriod, orbitalPeriod) {
    // Earth's rotation period in hours and orbital period in days
    const earthRotationHours = 23.93;
    const earthOrbitalDays = 365.25;
    
    // Calculate planet-to-Earth ratios
    const rotationRatio = rotationPeriod / earthRotationHours;
    const orbitalRatio = orbitalPeriod / earthOrbitalDays;
    
    return {
        rotation: rotationRatio,
        orbit: orbitalRatio
    };
}

// Get the relative periods for Venus
const relativePeriods = calculateRelativePeriods(venusFactData.rotationPeriod, venusFactData.orbitalPeriod);

// Venus scale model data (scaled values for realistic representation)
const venusScaleModelData = {
    diameter: 12000, // scaled diameter in the model
    orbitRadius: 108200000 / 2000, // scaled orbit radius
    rotationPeriod: 10 * relativePeriods.rotation, // scaled from Earth's 10 seconds
    maxRotationPeriod: 1 * relativePeriods.rotation, // scaled from Earth's 1 second
    orbitalPeriod: 600 * relativePeriods.orbit, // scaled from Earth's 600 seconds
    maxOrbitalPeriod: 60 * relativePeriods.orbit, // scaled from Earth's 60 seconds
    rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); }, // radians per frame
    maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); }, // based on max period
    orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); }, // radians per frame
    maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); }, // based on max period
};

// Venus non-scale model data (values for visual appeal)
const venusNonScaleModelData = {
    diameter: 11800, // visually appealing diameter
    orbitRadius: 54100, // visually appealing orbit radius
    rotationPeriod: 1 * relativePeriods.rotation, // scaled from Earth's 1 second
    maxRotationPeriod: 0.1 * relativePeriods.rotation, // scaled from Earth's 0.1 seconds
    orbitalPeriod: 50 * relativePeriods.orbit, // scaled from Earth's 50 seconds
    maxOrbitalPeriod: 5 * relativePeriods.orbit, // scaled from Earth's 5 seconds
    rotationSpeed: function() { return (2 * Math.PI) / (this.rotationPeriod * 60); },
    maxRotationSpeed: function() { return (2 * Math.PI) / (this.maxRotationPeriod * 60); },
    orbitSpeed: function() { return (2 * Math.PI) / (this.orbitalPeriod * 60); },
    maxOrbitSpeed: function() { return (2 * Math.PI) / (this.maxOrbitalPeriod * 60); },
};

class Venus {
    constructor(diameter = venusNonScaleModelData.diameter) {
        // Use non-scale model data by default
        this.diameter = diameter;
        this.radius = diameter / 2;
        this.axialTilt = venusFactData.axialTilt; // degrees
        this.group = new THREE.Group();
        this.latitudeCircles = new THREE.Group();
        this.consolePane = null;
        this.consoleVisible = false;

        // Rotation properties
        this.rotationEnabled = false;
        this.rotationPeriod = venusNonScaleModelData.rotationPeriod;
        this.maxRotationPeriod = venusNonScaleModelData.maxRotationPeriod;
        this.rotationSpeed = venusNonScaleModelData.rotationSpeed();
        this.maxRotationSpeed = venusNonScaleModelData.maxRotationSpeed();

        // Orbit properties
        this.actualOrbitRadius = venusFactData.orbitRadius;
        this.orbitRadius = venusNonScaleModelData.orbitRadius;
        this.orbitalPeriod = venusNonScaleModelData.orbitalPeriod;
        this.maxOrbitalPeriod = venusNonScaleModelData.maxOrbitalPeriod;
        this.orbitEnabled = false;
        this.orbitSpeed = venusNonScaleModelData.orbitSpeed();
        this.maxOrbitSpeed = venusNonScaleModelData.maxOrbitSpeed();
        this.orbitVisibility = 1.0;
        this.orbitLine = null;
        this.orbitGroup = new THREE.Group();

        // Day/Night effect properties
        this.dayNightEnabled = true;

        // Season labels properties
        this.seasonLabels = new THREE.Group();
        this.seasonLabelsVisible = false;

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
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('images/Venus-texture.jpg');
        
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

    createAxis() {
        const axisLength = this.diameter * 1.1;
        const cylinderRadius = 100;
        const cylinderGeometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, axisLength, 16);
        const cylinderMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            depthTest: true,
            depthWrite: false
        });
        this.axis = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        this.axis.renderOrder = 1;
        this.group.add(this.axis);
    }

    createLatitudeCircles() {
        const segments = 64;
        const latitudes = [
            { name: 'Equator', angle: 0, color: 0xff0000 },
            { name: 'North Tropic', angle: 23.4, color: 0xff8800 },
            { name: 'South Tropic', angle: -23.4, color: 0xff8800 },
            { name: 'North Polar', angle: 66.6, color: 0x00aaff },
            { name: 'South Polar', angle: -66.6, color: 0x00aaff }
        ];

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

    createSeasonLabels() {
        const seasons = [
            { name: '', season: 'perihelion', angle: 0 },
            { name: '', season: 'aphelion', angle: Math.PI },
            { name: '', season: 'position 1', angle: Math.PI/2 },
            { name: '', season: 'position 2', angle: Math.PI*3/2 }
        ];

        seasons.forEach(season => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 256;

            if (season.name) {
                ctx.font = 'Bold 120px Arial';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.fillText(season.name, 128, 120);
            }

            ctx.font = '40px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText(`(${season.season})`, 128, season.name ? 180 : 128);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);

            const x = this.orbitRadius * Math.cos(season.angle);
            const z = this.orbitRadius * Math.sin(season.angle);
            sprite.position.set(x, this.radius * 3, z);
            sprite.scale.set(this.radius * 5, this.radius * 5, 1);

            this.seasonLabels.add(sprite);
        });

        scene.add(this.seasonLabels);
    }

    applyTilt() {
        this.group.rotation.z = THREE.MathUtils.degToRad(this.axialTilt);
    }

    createConsolePane() {
        // Basic console setup
        this.consolePane = document.createElement('div');
        this.consolePane.className = 'console-pane';
        this.consolePane.style.position = 'absolute';
        this.consolePane.style.bottom = '20px';
        this.consolePane.style.right = '20px';
        this.consolePane.style.backgroundColor = 'rgba(80, 80, 80, 0.8)';
        this.consolePane.style.color = 'white';
        this.consolePane.style.padding = '0';
        this.consolePane.style.borderRadius = '5px';
        this.consolePane.style.fontFamily = 'Arial, sans-serif';
        this.consolePane.style.display = 'none';
        this.consolePane.style.width = '250px';
        this.consolePane.style.boxShadow = '0 4px 8px rgba(0,0,0,0.5)';

        // Create header
        const header = document.createElement('div');
        header.style.backgroundColor = 'rgba(100, 100, 100, 0.9)';
        header.style.padding = '10px 15px';
        header.style.borderTopLeftRadius = '5px';
        header.style.borderTopRightRadius = '5px';
        header.style.cursor = 'move';
        header.style.borderBottom = '1px solid #666';

        const title = document.createElement('h3');
        title.textContent = 'Venus Controls';
        title.style.margin = '0';
        header.appendChild(title);
        this.consolePane.appendChild(header);

        // Create content container
        const content = document.createElement('div');
        content.style.padding = '15px';
        this.consolePane.appendChild(content);
        this.consoleContent = content;

        // Make draggable
        this.makeDraggable(this.consolePane, header);

        // Add sections
        this.createVisibilitySection();
        this.createRotationSection();
        this.createOrbitSection();

        document.body.appendChild(this.consolePane);
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

    createVisibilitySection() {
        // Basic visibility controls
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Visibility Controls';
        sectionHeader.style.margin = '0 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);

        // Day/Night toggle
        this.addToggle('Day/Night Effect: ', 'day-night-toggle', this.dayNightEnabled, (e) => {
            this.dayNightEnabled = e.target.checked;
            this.toggleDayNightEffect(this.dayNightEnabled);
        });

        // Close view toggle
        this.addToggle('Close View: ', 'side-view-toggle', this.sideViewEnabled, (e) => {
            if (e.target.checked) {
                this.toggleCloseUpView(true, true);
                if (this.orbitEnabled) {
                    this.orbitEnabled = false;
                    document.getElementById('orbit-toggle').checked = false;
                }
            } else {
                this.toggleCloseUpView(false, false);
            }
        });

        // Axis toggle
        this.addToggle('Show Axis: ', null, true, (e) => {
            if (this.axis) this.axis.visible = e.target.checked;
        });

        // Latitude circles toggle
        this.addToggle('Show Latitude Circles: ', null, false, (e) => {
            this.latitudeCircles.visible = e.target.checked;
        });

        // Season labels toggle
        this.addToggle('Show Season Labels: ', null, this.seasonLabelsVisible, (e) => {
            this.seasonLabelsVisible = e.target.checked;
            this.seasonLabels.visible = e.target.checked;
        });
    }

    addToggle(label, id, initialState, onChange) {
        const container = document.createElement('div');
        container.style.marginBottom = '10px';

        const labelElem = document.createElement('label');
        labelElem.textContent = label;
        labelElem.style.marginRight = '10px';

        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = initialState;
        if (id) toggle.id = id;
        toggle.addEventListener('change', onChange);

        container.appendChild(labelElem);
        container.appendChild(toggle);
        this.consoleContent.appendChild(container);
    }

    createRotationSection() {
        // Rotation controls header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Rotation Controls';
        sectionHeader.style.margin = '15px 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);
        
        // Global rotation slider listener
        document.addEventListener('globalRotationSliderChange', (e) => {
            const slider = document.getElementById('rotation-speed-slider');
            if (slider) {
                slider.value = e.detail.value;
                const event = new Event('input', { bubbles: true });
                slider.dispatchEvent(event);
            }
        });

        // Rotation toggle
        this.addToggle('Enable Rotation: ', 'rotation-toggle', this.rotationEnabled, (e) => {
            this.rotationEnabled = e.target.checked;
        });

        // Rotation speed slider
        this.addSlider('Rotation Speed: ', 'rotation-speed-slider', 50, (value) => {
            if (value === 0) {
                this.rotationSpeed = 0;
            } else if (value <= 50) {
                const normalizedValue = value / 50;
                const baseSpeed = (2 * Math.PI) / (this.rotationPeriod * 60);
                this.rotationSpeed = baseSpeed * normalizedValue;
            } else {
                const normalizedValue = (value - 50) / 50;
                const periodDiff = this.rotationPeriod - this.maxRotationPeriod;
                const adjustedPeriod = this.rotationPeriod - (periodDiff * normalizedValue);
                this.rotationSpeed = (2 * Math.PI) / (adjustedPeriod * 60);
            }

            if (value > 0 && !this.rotationEnabled) {
                this.rotationEnabled = true;
                document.getElementById('rotation-toggle').checked = true;
            }

            // Update global slider
            const globalSlider = document.getElementById('global-rotation-speed-slider');
            if (globalSlider) globalSlider.value = value;
        });
    }

    createOrbitSection() {
        // Orbit controls header
        const sectionHeader = document.createElement('h4');
        sectionHeader.textContent = 'Orbit Controls';
        sectionHeader.style.margin = '15px 0 10px 0';
        sectionHeader.style.borderBottom = '1px solid #555';
        sectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(sectionHeader);
        
        // Global orbit slider listeners
        document.addEventListener('globalOrbitSliderChange', (e) => {
            const slider = document.getElementById('orbit-speed-slider');
            if (slider) {
                slider.value = e.detail.value;
                const event = new Event('input', { bubbles: true });
                slider.dispatchEvent(event);
            }
        });
        
        document.addEventListener('globalOrbitVisibilityChange', (e) => {
            const slider = document.getElementById('orbit-visibility-slider');
            if (slider) {
                slider.value = e.detail.value;
                const event = new Event('input', { bubbles: true });
                slider.dispatchEvent(event);
            }
        });

        // Orbit toggle
        this.addToggle('Enable Orbit: ', 'orbit-toggle', this.orbitEnabled, (e) => {
            this.orbitEnabled = e.target.checked;
            if (e.target.checked && this.sideViewEnabled) {
                this.sideViewEnabled = false;
                document.getElementById('side-view-toggle').checked = false;
                this.toggleCloseUpView(false, false);
            }
        });

        // Orbit speed slider
        this.addSlider('Orbit Speed: ', 'orbit-speed-slider', 50, (value) => {
            if (value === 0) {
                this.orbitSpeed = 0;
            } else if (value <= 50) {
                const normalizedValue = value / 50;
                const baseSpeed = (2 * Math.PI) / (this.orbitalPeriod * 60);
                this.orbitSpeed = baseSpeed * normalizedValue;
            } else {
                const normalizedValue = (value - 50) / 50;
                const periodDiff = this.orbitalPeriod - this.maxOrbitalPeriod;
                const adjustedPeriod = this.orbitalPeriod - (periodDiff * normalizedValue);
                this.orbitSpeed = (2 * Math.PI) / (adjustedPeriod * 60);
            }

            if (value > 0 && !this.orbitEnabled) {
                this.orbitEnabled = true;
                document.getElementById('orbit-toggle').checked = true;
                
                if (this.sideViewEnabled) {
                    this.sideViewEnabled = false;
                    document.getElementById('side-view-toggle').checked = false;
                    this.toggleCloseUpView(false, false);
                }
            }

            // Update global slider
            const globalSlider = document.getElementById('global-orbit-speed-slider');
            if (globalSlider) globalSlider.value = value;
        });

        // Orbit visibility slider
        const visContainer = document.createElement('div');
        visContainer.style.marginBottom = '15px';

        const visLabel = document.createElement('label');
        visLabel.textContent = 'Orbit Visibility: ';
        visLabel.style.display = 'block';
        visLabel.style.marginBottom = '5px';

        const visSlider = document.createElement('input');
        visSlider.type = 'range';
        visSlider.min = '0';
        visSlider.max = '100';
        visSlider.value = Math.round(this.orbitVisibility * 100);
        visSlider.style.width = '100%';
        visSlider.id = 'orbit-visibility-slider';
        
        visSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.orbitVisibility = value / 100;

            if (this.orbitLine) {
                this.orbitLine.material.opacity = this.orbitVisibility;
                
                if (this.orbitVisibility > 0.5) {
                    const intensity = 0.5 + this.orbitVisibility * 0.5;
                    this.orbitLine.material.color.setRGB(intensity, intensity, intensity);
                } else {
                    this.orbitLine.material.color.setRGB(0.5, 0.5, 0.5);
                }
            }

            const globalSlider = document.getElementById('global-orbit-visibility-slider');
            if (globalSlider) globalSlider.value = value;
        });

        visContainer.appendChild(visLabel);
        visContainer.appendChild(visSlider);
        this.consoleContent.appendChild(visContainer);
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
        return this.orbitGroup;
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

            const venusWorldPos = new THREE.Vector3();
            this.sphere.getWorldPosition(venusWorldPos);
            const closeUpDistance = this.radius * 3;

            if (sideView) {
                const cameraPos = {
                    x: venusWorldPos.x,
                    y: venusWorldPos.y,
                    z: venusWorldPos.z + this.radius * 3
                };
                camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
                camera.lookAt(venusWorldPos);

                if (controls) {
                    controls.target.copy(venusWorldPos);
                    controls.update();
                }
            } else {
                const cameraPos = {
                    x: venusWorldPos.x - closeUpDistance,
                    y: venusWorldPos.y,
                    z: venusWorldPos.z
                };
                camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
                camera.lookAt(venusWorldPos);

                if (controls) {
                    controls.target.copy(venusWorldPos);
                    controls.update();
                }
            }

            this.prevRotationEnabled = this.rotationEnabled;
            this.prevOrbitEnabled = this.orbitEnabled;
            this.rotationEnabled = false;
            this.orbitEnabled = false;

            document.getElementById('rotation-toggle').checked = false;
            document.getElementById('orbit-toggle').checked = false;

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

    toggleDayNightEffect(enabled) {
        if (enabled) {
            this.sphere.material = this.standardMaterial;
        } else {
            this.sphere.material = this.basicMaterial;
        }
    }

    update(time) {
        // Rotate the sphere around its axis if rotation is enabled
        if (this.rotationEnabled && this.rotationSpeed > 0) {
            // Venus rotates in the opposite direction (retrograde rotation)
            // due to its axial tilt of ~177.3 degrees (nearly upside down)
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
}