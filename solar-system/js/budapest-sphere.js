// Budapest sphere implementation
let budapestSphere = null;

// Create the red sphere at Budapest position
function createBudapestSphere() {
    // Only create if it doesn't exist yet
    if (budapestSphere) return;

    const earth = planets.earth;
    if (!earth) return;

    // Get Earth's radius
    const earthRadius = earth.data.size * SIZE_SCALE;

    // Create a red sphere with 1/10th of Earth's diameter
    const sphereRadius = earthRadius / 10; // 1/10th of Earth's diameter (radius/5)
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000
    });
    budapestSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(budapestSphere);

    // Update position immediately
    updateBudapestPosition();
}

// Update Budapest position
function updateBudapestPosition() {
    if (!budapestSphere) return;

    const earth = planets.earth;
    if (!earth) return;

    // Get Earth's position and radius
    const earthPos = earth.mesh.position.clone();
    const earthRadius = earth.data.size * SIZE_SCALE;

    // Budapest coordinates
    const latitude = 47.4979 * Math.PI / 180;  // Convert to radians
    const longitude = 19.0402 * Math.PI / 180; // Convert to radians

    // Calculate position on Earth's surface
    // We need to account for Earth's rotation
    const earthRotation = earth.mesh.rotation.y;

    // Calculate the position on Earth's surface with negative longitude
    // to match Earth's rotation direction
    const x = earthPos.x + earthRadius * Math.cos(latitude) * Math.cos(-(longitude + earthRotation));
    const y = earthPos.y + earthRadius * Math.sin(latitude);
    const z = earthPos.z + earthRadius * Math.cos(latitude) * Math.sin(-(longitude + earthRotation));

    // Position the red sphere at Budapest
    budapestSphere.position.set(x, y, z);
}