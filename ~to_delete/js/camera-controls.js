// Camera control functions
function rotateCameraVertical(angle) {
    console.log('Rotating camera vertically by', angle);
    
    // Get the camera's current position relative to the target
    const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
    
    // Convert to spherical coordinates
    const spherical = new THREE.Spherical().setFromVector3(offset);
    
    // Add the angle to the phi (vertical angle)
    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi + angle));
    
    // Convert back to Cartesian coordinates
    offset.setFromSpherical(spherical);
    
    // Update camera position
    camera.position.copy(controls.target).add(offset);
    
    // Make camera look at the target
    camera.lookAt(controls.target);
    
    // Update controls
    controls.update();
}

function rotateCameraHorizontal(angle) {
    console.log('Rotating camera horizontally by', angle);
    
    // Get the camera's current position relative to the target
    const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
    
    // Convert to spherical coordinates
    const spherical = new THREE.Spherical().setFromVector3(offset);
    
    // Add the angle to the theta (horizontal angle)
    spherical.theta += angle;
    
    // Convert back to Cartesian coordinates
    offset.setFromSpherical(spherical);
    
    // Update camera position
    camera.position.copy(controls.target).add(offset);
    
    // Make camera look at the target
    camera.lookAt(controls.target);
    
    // Update controls
    controls.update();
}