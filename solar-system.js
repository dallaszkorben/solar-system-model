/**
 * SolarSystem class to manage the 3D solar system model
 */
class SolarSystem {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.sky = null;
        
        this.init();
    }
    
    init() {
        // Create the scene
        this.scene = new THREE.Scene();

        // Create the camera
        this.camera = new THREE.PerspectiveCamera(
            45, // Field of view
            window.innerWidth / window.innerHeight, // Aspect ratio
            1, // Near clipping plane
            100000000 // Far clipping plane
        );
        
        // Position the camera
        this.camera.position.z = 5000;

        // Create the renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('canvas'),
            antialias: true,
            logarithmicDepthBuffer: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Add minimal ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Create sky as a planet
        this.sky = new Sky();
        this.sky.rotationEnabled = true; // Enable rotation mechanism but speed is 0
        this.sky.applyTilt(); // Apply any tilt
        this.scene.add(this.sky.getObject());
        
        // The sky rotation is initially set to 0 in the Sky class
        // You can set it later using: this.sky.setRotationSpeed(0.0001);

        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // Start the animation loop
        this.animate();
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Update sky rotation
        if (this.sky) {
            this.sky.update(Date.now());
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    // Method to set the sky rotation speed
    setSkyRotationSpeed(speed) {
        if (this.sky) {
            this.sky.setRotationSpeed(speed);
        }
    }
}