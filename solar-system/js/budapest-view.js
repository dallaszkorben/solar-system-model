// Budapest view implementation
let budapestCamera = null;
let originalCamera = null;
let budapestViewDirection = 0; // 0 = south, PI/2 = west, PI = north, 3*PI/2 = east
// When budapestViewDirection = 0, compass shows 180° (South)
// When budapestViewDirection = PI, compass shows 0° (North)
let budapestViewElevation = 0; // 0 = horizontal, positive = looking up, negative = looking down

// Direction names for the compass
const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const DIRECTION_TEXT = DIRECTIONS.join("-") + "-";

// Create a separate camera for Budapest view
function setupBudapestView() {
    // Store original camera
    originalCamera = camera;

    // Create a new camera for Budapest view with normal FOV
    budapestCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Reset view direction to south (180° in compass)
    budapestViewDirection = 0;
    budapestViewElevation = 0;
}

// Update Budapest view
function updateBudapestView() {
    if (!budapestCamera || !budapestSphere) return;

    const earth = planets.earth;
    if (!earth) return;

    // Get Budapest position
    const budapestPos = budapestSphere.position.clone();

    // Position the camera slightly above the surface
    const earthRadius = earth.data.size * SIZE_SCALE;
    const cameraHeight = earthRadius * 0.01; // 1% of Earth's radius

    // Calculate the "up" direction (away from Earth's center)
    const earthPos = earth.mesh.position.clone();
    const up = new THREE.Vector3(
        budapestPos.x - earthPos.x,
        budapestPos.y - earthPos.y,
        budapestPos.z - earthPos.z
    ).normalize();

    // Position camera at Budapest
    budapestCamera.position.set(
        budapestPos.x + up.x * cameraHeight,
        budapestPos.y + up.y * cameraHeight,
        budapestPos.z + up.z * cameraHeight
    );

    // Calculate the "south" direction
    const northPole = new THREE.Vector3(0, 1, 0).applyQuaternion(earth.mesh.quaternion);
    const east = new THREE.Vector3().crossVectors(up, northPole).normalize();
    const south = new THREE.Vector3().crossVectors(east, up).normalize();

    // Create a rotation matrix for horizontal rotation (around up vector)
    const horizontalRotation = new THREE.Matrix4().makeRotationAxis(up, budapestViewDirection);

    // Apply horizontal rotation to south vector to get view direction
    const viewDirection = south.clone().applyMatrix4(horizontalRotation);

    // Create a rotation matrix for vertical rotation (around east vector)
    // First, get the rotated east vector
    const rotatedEast = east.clone().applyMatrix4(horizontalRotation);
    const verticalRotation = new THREE.Matrix4().makeRotationAxis(rotatedEast, budapestViewElevation);

    // Apply vertical rotation to view direction
    viewDirection.applyMatrix4(verticalRotation);

    // Set target point
    const target = new THREE.Vector3(
        budapestPos.x + viewDirection.x,
        budapestPos.y + viewDirection.y,
        budapestPos.z + viewDirection.z
    );

    // Look at target
    budapestCamera.lookAt(target);
    budapestCamera.up.copy(up);

    // Update camera aspect ratio if window was resized
    budapestCamera.aspect = window.innerWidth / window.innerHeight;
    budapestCamera.updateProjectionMatrix();
}

// Update the direction indicator
function updateDirectionIndicator() {
    // Normalize budapestViewDirection to 0-2π range
    while (budapestViewDirection < 0) budapestViewDirection += 2 * Math.PI;
    while (budapestViewDirection >= 2 * Math.PI) budapestViewDirection -= 2 * Math.PI;

    // Convert from our system (0 = south, PI/2 = west, PI = north, 3*PI/2 = east)
    // to compass degrees (0 = north, 90 = east, 180 = south, 270 = west)
    // Use negative budapestViewDirection to reverse the compass direction
    let degrees = (-budapestViewDirection + Math.PI) * 180 / Math.PI;

    // Normalize to 0-360 range
    degrees = (degrees + 360) % 360;

    // Update the degrees display
    const degreesElement = document.getElementById('direction-degrees');
    if (degreesElement) {
        degreesElement.textContent = Math.round(degrees) + '°';
    }

    // Update the direction text
    const textElement = document.getElementById('direction-text');
    if (textElement) {
        // Find the closest direction
        const directionIndex = Math.round(degrees / 45) % 8;
        const currentDirection = DIRECTIONS[directionIndex];

        // Create a fixed text with the current direction in the middle
        let displayText = "";

        // Add directions before the current one
        for (let i = -2; i < 0; i++) {
            let idx = (directionIndex + i + 8) % 8;
            displayText += DIRECTIONS[idx] + "-";
        }

        // Add the current direction
        displayText += currentDirection + "-";

        // Add directions after the current one
        for (let i = 1; i <= 2; i++) {
            let idx = (directionIndex + i) % 8;
            displayText += DIRECTIONS[idx] + "-";
        }

        // Set the text content
        textElement.textContent = displayText;

        // Center the text
        textElement.style.textAlign = "center";
    }
}

// Rotate Budapest view horizontally
function rotateBudapestViewHorizontal(angle) {
    // For camera rotation: use negative angle to maintain correct camera movement
    // For compass: use positive angle to make numbers increase when turning right
    budapestViewDirection -= angle;  // Camera rotation direction
    
    // Update the view direction for the compass separately
    updateBudapestView();
    updateDirectionIndicator();
}

// Rotate Budapest view vertically
function rotateBudapestViewVertical(angle) {
    // Limit vertical rotation to avoid flipping
    budapestViewElevation = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, budapestViewElevation + angle));
    updateBudapestView();
}

// Switch to Budapest view
function activateBudapestView() {
    if (!budapestCamera) {
        setupBudapestView();
    }

    // Use Budapest camera for rendering
    camera = budapestCamera;

    // Update direction indicator
    updateDirectionIndicator();
}

// Switch back to space view
function deactivateBudapestView() {
    if (originalCamera) {
        camera = originalCamera;
    }
}