/**
 * Skybox creator for the solar system
 */
class Skybox {
    constructor() {
        this.mesh = null;
        this.createSkybox();
    }

    createSkybox() {
        // Create a large sphere geometry - reduced size to ensure visibility in all views
        const geometry = new THREE.SphereGeometry(2000000, 64, 64);
        
        // Load the starry sky texture
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('images/starry-sky-texture.jpg');
        
        // Flip the texture horizontally to correct the mirroring
        texture.repeat.x = -1;
        texture.offset.x = 1;
        
        // Create a material with the texture on the inside of the sphere
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide, // Render on the inside of the sphere
            depthWrite: false // Ensure skybox is always rendered behind other objects
        });
        
        // Create the mesh
        this.mesh = new THREE.Mesh(geometry, material);
        
        // Set renderOrder to ensure it's drawn first
        this.mesh.renderOrder = -1000;
    }

    getObject() {
        return this.mesh;
    }
}