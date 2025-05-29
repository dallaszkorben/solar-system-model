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
        const geometry = new THREE.SphereGeometry(20000000, 64, 64);

        // Load the starry sky texture
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('images/starry-sky-texture.jpg');
//        const texture = textureLoader.load('images/starry-sky-texture-constellations.jpg');

        // Rotate the texture 90 degrees to the right
//        texture.rotation = Math.PI / 2;
//        texture.center.set(0.5, 0.5);

        // Flip the texture horizontally to correct the mirroring
//        texture.repeat.y = -1;
//        texture.offset.y = 1;

        // Create a shader material that only applies the texture to the northern hemisphere
        const material = new THREE.ShaderMaterial({
            uniforms: {
                skyTexture: { value: texture }
            },
            vertexShader: `
                varying vec2 vUv;
                varying float vY;

                void main() {
                    vUv = uv;
                    vY = position.y;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D skyTexture;
                varying vec2 vUv;
                varying float vY;

                void main() {
//                    if (vY > 0.0) {
                        // Northern hemisphere - use texture
                        gl_FragColor = texture2D(skyTexture, vUv);
//                    } else {
                        // Southern hemisphere - use black color
//                        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
//                    }
                }
            `,
            side: THREE.BackSide,
            depthWrite: false
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