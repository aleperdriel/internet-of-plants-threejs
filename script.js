import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import TWEEN from 'https://unpkg.com/@tweenjs/tween.js@23.1.3/dist/tween.esm.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

gsap.registerPlugin(ScrollTrigger) 

function degToRad(angle) {
    return angle*Math.PI/180;
}


const scene = new THREE.Scene(); 
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, -9, 78);
camera.rotation.set(degToRad(20),0,0)

const spotLight = new THREE.SpotLight( 0x137030, 100000);
const pointLight = new THREE.PointLight( 0x000000, 2000);
spotLight.position.set( 0, 10,40);
pointLight.position.set( -5, 0,80);
spotLight.castShadow = true;
spotLight.angle = 2.


spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 200;
spotLight.penumbra = 1


const canvas = document.getElementById("canvas");

// const controls = new OrbitControls(camera, canvas);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});
renderer.setClearColor(0x001600);


const textureLoader = new THREE.TextureLoader();

renderer.setSize( window.innerWidth, window.innerHeight);

const css3DRenderer = new CSS3DRenderer();
css3DRenderer.setSize( window.innerWidth, window.innerHeight);
css3DRenderer.domElement.style.position = 'absolute';
css3DRenderer.domElement.style.top = '0px';
css3DRenderer.domElement.style.left = '0px';

var title = document.getElementById("anim_title");
const object = new CSS3DObject(title);
object.position.set(0, 30, 0);
scene.add(object);

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    new THREE.MeshStandardMaterial({
        color: 0x000000
    })
)

plane.position.set(0,10,-10)


const light = new THREE.AmbientLight(0x606060, 15);
const directionLight = new THREE.DirectionalLight(0x000000, 10000);


spotLight.target = plane;

function createCircularTexture() {
    const size = 256; // Texture size
    const canvas_color = document.createElement('canvas');

    canvas_color.width = size;
    canvas_color.height = size;
    const ctx = canvas_color.getContext('2d');

    // Create radial gradient
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255, 250, 209, 1)'); // Golden yellow center
    gradient.addColorStop(1, 'rgba(255, 250, 209, 0)'); // Transparent edges
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(canvas_color);
}

// Use the texture in PointsMaterial
const glowTexture = createCircularTexture();

// Particle Geometry
const particlesGeometry = new THREE.BufferGeometry();
const particleCount = 1000;

// Position data
const positions = new Float32Array(particleCount * 3); // x, y, z for each particle
for (let i = 0; i < particleCount; i++) {
    positions[i] = (Math.random() - 0.5) * 30; // Random positions within a range
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));


// Particle Material
const particlesMaterial = new THREE.PointsMaterial({
    size: 6, // Adjust size
    color: 0xfffae5, // Golden yellow
    map: glowTexture, // Use a circular texture
    transparent: true,
    opacity: 0.8, // Slight transparency
    blending: THREE.AdditiveBlending, // Makes particles blend like light
    alphaTest: 0.5, // Ensures only the visible part of the texture is rendered
    depthWrite: false, // Prevents z-sorting issues
});


// particlesMaterial.map = glowTexture;
particlesMaterial.needsUpdate = true;

// Create the particle system
const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
// scene.add(particleSystem);

// Path to follow ?
const curve = new THREE.CatmullRomCurve3( [
	new THREE.Vector3( -10, 0, 10 ),
	new THREE.Vector3( -5, 5, 5 ),
	new THREE.Vector3( 0, 0, 0 ),
	new THREE.Vector3( 5, -5, 5 ),
	new THREE.Vector3( 10, 0, 10 )
] );

const points = curve.getPoints( 50 );
const geometry = new THREE.BufferGeometry().setFromPoints( points );

const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );

// Create the final object to add to the scene
const curveObject = new THREE.Line( geometry, material );
scene.add(curveObject);

// fin curve

let helper = new THREE.AxesHelper(50);
scene.add(helper);


scene.add(light);
scene.add(spotLight);
scene.add(pointLight);
scene.add(plane);

gsap.to(object.position, { x: 200, y: 100, duration: 2, ease: 'power2.inOut' });
gsap.to(object.rotation, { y: Math.PI, duration: 2, ease: 'power2.inOut' });
gsap.to(anim_title.style, { backgroundColor: 'rgba(255, 0, 0, 0.8)', duration: 2 });


const alphaLeaf = textureLoader.load("images/alpha_map_leaf.png")


const loader = new GLTFLoader();
var plant_mesh;

loader.load('./scene_plant_2.gltf',
    (gltf) => {
        plant_mesh = gltf.scene;
        plant_mesh.scale.set(20, 20, 20);
        plant_mesh.light = false;
        scene.add(plant_mesh);
        console.log(plant_mesh);
        plant_mesh.children[0].children[1].material.setValues({
            alphaMap : alphaLeaf,
            transparent : true,
            side : THREE.DoubleSide, 
            alphaTest: 0.5,
        })

        // Dirt material
        plant_mesh.traverse(function(child) {
            if(child.name == "Mesh004_1") {
                console.log(child.material);
                child.material.roughness = 1;
            }   
        })
        plant_mesh.rotation.set(0,degToRad(-115), 0)


        gltf.scene.position.set(0,-12,60);
        // new TWEEN.Tween(plant_mesh.position)
        // .to( { x:plant_mesh.position.x-10 }, 2000)
        // .delay(2000)
        // .easing(TWEEN.Easing.Cubic.InOut)
        // .start()
        gsap.to(plant_mesh.position, {
            scrollTrigger: {
                    trigger: "#trigger",
                    start: "top top",
                    end: "bottom top",
                    markers: true,
                    scrub: 1,
                    toggleActions: "restart pause resume pause"
                },
            x:plant_mesh.position.x-10
        });

        // raycaster.setFromCamera(pointerPosition, camera);
        // const intersects = raycaster.intersectObject(plant_mesh);
        // if (intersects.length > 0) {
        //     console.log(plant_mesh)
        // } else {
        //     console.log("nan")
        // }
    },
    (xhr) => {
        console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
    },
    (error) => {
        console.log(error);
    }
);


const raycaster = new THREE.Raycaster();

let pointerPosition = { x: 0, y: 0 };
window.addEventListener('pointermove', (event) => {
    pointerPosition.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointerPosition.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
});



const animate = () => {


    // Call animate recursively
    requestAnimationFrame(animate);
    // controls.update();
    TWEEN.update()
    // spotLightHelper.update();


    // Render the scene
    renderer.render(scene, camera);

}

animate();



