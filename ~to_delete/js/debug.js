// Debug script to add a large red sphere
window.addEventListener('load', () => {
    // Wait a bit for the solar system to initialize
    setTimeout(() => {
        console.log("Adding debug sphere");
        
        // Create a large red sphere
        const sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
        const sphereMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0.7
        });
        const debugSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        
        // Position it at a visible location
        debugSphere.position.set(0, 0, 0);
        
        // Add to scene
        scene.add(debugSphere);
        
        console.log("Debug sphere added");
    }, 1000);
});