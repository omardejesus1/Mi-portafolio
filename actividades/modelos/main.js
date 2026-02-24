import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- CONFIGURACIÓN DE LA ESCENA ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222); 

// Ajustamos el "Near" a 0.01 para que no se corte la imagen al acercarnos
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- CONTROLES DE MOUSE ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- LUCES ---
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); 
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Alejamos la cámara para ver todo el panorama
camera.position.set(0, 2, 10);

// --- CARGA DE MODELOS ---
const loader = new GLTFLoader();

const archivos = [
    { nombre: 'Rubber Duck.glb', x: -1.5 },
    { nombre: 'Tree.glb', x: 0 },
    { nombre: 'Phone.glb', x: 1.5 }
];

archivos.forEach(item => {
    loader.load(`./models/${item.nombre}`, (gltf) => {
        const model = gltf.scene;

        // --- TRUCO DE ESCALADO AUTOMÁTICO ---
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        // Hacemos que todos los modelos midan 3 unidades de alto proporcionalmente
        const escala = 3 / maxDim;
        model.scale.set(escala, escala, escala);

        // Los separamos en el eje X para que no se amontonen
        model.position.x = item.x * 4; 
        
        // Centramos el modelo en el suelo (Y=0)
        const center = box.getCenter(new THREE.Vector3());
        model.position.y = - (center.y * escala);

        scene.add(model);
        console.log(`Cargado y ajustado: ${item.nombre}`);
    }, undefined, (error) => {
        console.error(`Error cargando ${item.nombre}:`, error);
    });
});

// --- ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Necesario para el movimiento suave del mouse
    renderer.render(scene, camera);
}
animate();

// Ajuste de ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});