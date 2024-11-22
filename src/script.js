import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'lil-gui';


// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Geometry Library
// Geometry Library with More Options
const geometries = {
    Box: new THREE.BoxGeometry(1, 1, 1),
    Sphere: new THREE.SphereGeometry(1, 32, 32),
    Torus: new THREE.TorusGeometry(1, 0.4, 16, 100),
    TorusKnot: new THREE.TorusKnotGeometry(0.7, 0.3, 100, 16),
    Cone: new THREE.ConeGeometry(1, 2, 32),
    Cylinder: new THREE.CylinderGeometry(1, 1, 2, 32),
    Dodecahedron: new THREE.DodecahedronGeometry(1),
    Icosahedron: new THREE.IcosahedronGeometry(1),
    Octahedron: new THREE.OctahedronGeometry(1),
    Tetrahedron: new THREE.TetrahedronGeometry(1),
    Plane: new THREE.PlaneGeometry(3, 3),
    Capsule: new THREE.CapsuleGeometry(0.5, 2, 4, 8),
    Ring: new THREE.RingGeometry(0.5, 1, 32),
    Extrude: new THREE.ExtrudeGeometry(
        new THREE.Shape()
            .moveTo(0, 0)
            .lineTo(1, 0)
            .lineTo(0.5, 1)
            .lineTo(0, 0),
        { depth: 0.5, bevelEnabled: true, bevelThickness: 0.1 }
    ),
    CustomHeart: new THREE.ShapeGeometry(
        new THREE.Shape()
            .moveTo(0, 0.5)
            .bezierCurveTo(-0.25, 0.75, -0.5, 0.5, -0.5, 0.2)
            .bezierCurveTo(-0.5, -0.1, 0, -0.4, 0, -0.5)
            .bezierCurveTo(0, -0.4, 0.5, -0.1, 0.5, 0.2)
            .bezierCurveTo(0.5, 0.5, 0.25, 0.75, 0, 0.5)
    ),
};


// Material (Singleton)
const defaultMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.5,
    roughness: 0.5,
});

// Object Collection
let selectedObject = null;
let spinEnabled = false;

// Function to Add a 3D Object
function addObject(type) {
    if (selectedObject) {
        scene.remove(selectedObject);
        selectedObject.geometry.dispose();
        selectedObject.material.dispose();
    }

    const geometry = geometries[type];
    const mesh = new THREE.Mesh(geometry, defaultMaterial.clone());
    mesh.position.set(0, 1, 0);
    scene.add(mesh);

    selectedObject = mesh;
    updateGUI(mesh);
}

// Update Texture Function
function updateTexture(object, texturePath) {
    if (!object) return;

    const loader = new THREE.TextureLoader();
    if (texturePath) {
        loader.load(texturePath, (texture) => {
            object.material.map = texture;
            object.material.needsUpdate = true;

            object.material.color.set(0xffffff);
        });
    } else {
        object.material.map = null;
        object.material.color.set(0xffffff);
        object.material.needsUpdate = true;
    }
}

// Debug UI
const gui = new GUI();
let materialFolder, transformFolder, spinFolder;

// Update Debug UI
function updateGUI(object) {
    if (materialFolder) materialFolder.destroy();
    if (transformFolder) transformFolder.destroy();
    if (spinFolder) spinFolder.destroy();

    selectedObject = object;

    transformFolder = gui.addFolder('Transform');
    transformFolder.add(object.position, 'x', -10, 10, 0.1).name('Position X');
    transformFolder.add(object.position, 'y', -10, 10, 0.1).name('Position Y');
    transformFolder.add(object.position, 'z', -10, 10, 0.1).name('Position Z');
    transformFolder.add(object.rotation, 'x', 0, Math.PI * 2, 0.01).name('Rotation X');
    transformFolder.add(object.rotation, 'y', 0, Math.PI * 2, 0.01).name('Rotation Y');
    transformFolder.add(object.rotation, 'z', 0, Math.PI * 2, 0.01).name('Rotation Z');
    transformFolder.add(object.scale, 'x', 0.1, 5, 0.1).name('Scale X');
    transformFolder.add(object.scale, 'y', 0.1, 5, 0.1).name('Scale Y');
    transformFolder.add(object.scale, 'z', 0.1, 5, 0.1).name('Scale Z');

    materialFolder = gui.addFolder('Material');
    materialFolder.addColor(object.material, 'color').name('Color');
    materialFolder
        .add({ Texture: 'None' }, 'Texture', Object.keys(textures))
        .name('Texture')
        .onChange((selectedTexture) => {
            updateTexture(object, textures[selectedTexture]);
        });
    materialFolder.add(object.material, 'metalness', 0, 1, 0.01).name('Metalness');
    materialFolder.add(object.material, 'roughness', 0, 1, 0.01).name('Roughness');
    materialFolder.add(object.material, 'wireframe').name('Wireframe');

    spinFolder = gui.addFolder('Spin');
    spinFolder.add({ Spin: () => (spinEnabled = !spinEnabled) }, 'Spin');
}

// Add Buttons for Shapes
const geometryFolder = gui.addFolder('Add Geometry');
geometryFolder.add({ Box: () => addObject('Box') }, 'Box');
geometryFolder.add({ Sphere: () => addObject('Sphere') }, 'Sphere');
geometryFolder.add({ Torus: () => addObject('Torus') }, 'Torus');
geometryFolder.add({ TorusKnot: () => addObject('TorusKnot') }, 'TorusKnot');
geometryFolder.add({ Cone: () => addObject('Cone') }, 'Cone');
geometryFolder.add({ Cylinder: () => addObject('Cylinder') }, 'Cylinder');
geometryFolder.add({ Dodecahedron: () => addObject('Dodecahedron') }, 'Dodecahedron');
geometryFolder.add({ Icosahedron: () => addObject('Icosahedron') }, 'Icosahedron');
geometryFolder.add({ Octahedron: () => addObject('Octahedron') }, 'Octahedron');
geometryFolder.add({ Tetrahedron: () => addObject('Tetrahedron') }, 'Tetrahedron');
geometryFolder.add({ Plane: () => addObject('Plane') }, 'Plane');
geometryFolder.add({ Capsule: () => addObject('Capsule') }, 'Capsule');
geometryFolder.add({ Ring: () => addObject('Ring') }, 'Ring');
geometryFolder.add({ Extrude: () => addObject('Extrude') }, 'Extrude');
geometryFolder.add({ CustomHeart: () => addObject('CustomHeart') }, 'CustomHeart');

// Fullscreen Toggle
const fullscreenFolder = gui.addFolder('Fullscreen');
fullscreenFolder.add({ Toggle: toggleFullscreen }, 'Toggle');

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
    }
}

const textures = {
    'None': null,
    'M1': '/texture/m1.jpg',
    'M2': '/texture/m2.jpg',
    'M3': '/texture/m3.jpg',
    'M4': '/texture/m4.jpg',
    'M5': '/texture/m5.jpg',
    'M6': '/texture/m6.jpg',
    'Swirl': '/texture/swirl.jpg',
    'Wood': '/texture/wood.jpg',
};



// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Double-Click to Toggle Fullscreen
renderer.domElement.addEventListener('dblclick', () => {
    if (!document.fullscreenElement) {
        renderer.domElement.requestFullscreen(); 
    } else {
        document.exitFullscreen(); 
    }
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    if (spinEnabled && selectedObject) {
        selectedObject.rotation.y += 0.01;
    }

    controls.update();
    renderer.render(scene, camera);
}
animate();

