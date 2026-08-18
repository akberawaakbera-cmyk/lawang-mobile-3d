import * as THREE from “three”;

// ===============================
// BASIC SETUP
// ===============================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87ceeb);

scene.fog = new THREE.Fog(
0x87ceeb,
30,
180
);

// ===============================
// CAMERA
// ===============================

const camera = new THREE.PerspectiveCamera(
60,
window.innerWidth / window.innerHeight,
0.1,
500
);

camera.position.set(
0,
5,
8
);

// ===============================
// RENDERER
// ===============================

const renderer =
new THREE.WebGLRenderer({
antialias: true,
powerPreference: “high-performance”
});

renderer.setSize(
window.innerWidth,
window.innerHeight
);

renderer.setPixelRatio(
Math.min(window.devicePixelRatio, 1.5)
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
THREE.PCFSoftShadowMap;

document.body.appendChild(
renderer.domElement
);

// ===============================
// LIGHTING
// ===============================

const ambientLight =
new THREE.HemisphereLight(
0xffffff,
0x557755,
2
);

scene.add(ambientLight);

const sun =
new THREE.DirectionalLight(
0xffffff,
3
);

sun.position.set(
30,
50,
20
);

sun.castShadow = true;

sun.shadow.mapSize.width = 1024;
sun.shadow.mapSize.height = 1024;

sun.shadow.camera.left = -60;
sun.shadow.camera.right = 60;
sun.shadow.camera.top = 60;
sun.shadow.camera.bottom = -60;

scene.add(sun);

// ===============================
// GROUND
// ===============================

const groundGeometry =
new THREE.PlaneGeometry(
200,
200
);

const groundMaterial =
new THREE.MeshStandardMaterial({
color: 0x3f7f3f,
roughness: 1
});

const ground =
new THREE.Mesh(
groundGeometry,
groundMaterial
);

ground.rotation.x =
-Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);

// ===============================
// ROAD
// ===============================

const roadGeometry =
new THREE.PlaneGeometry(
14,
200
);

const roadMaterial =
new THREE.MeshStandardMaterial({
color: 0x303030
});

const road =
new THREE.Mesh(
roadGeometry,
roadMaterial
);

road.rotation.x =
-Math.PI / 2;

road.position.y =
0.01;

scene.add(road);

// ===============================
// ROAD MARKINGS
// ===============================

for (
let z = -90;
z < 100;
z += 10
) {

const lineGeometry =
new THREE.PlaneGeometry(
0.4,
5
);

const lineMaterial =
new THREE.MeshBasicMaterial({
color: 0xffffff
});

const line =
new THREE.Mesh(
lineGeometry,
lineMaterial
);

line.rotation.x =
-Math.PI / 2;

line.position.set(
0,
0.03,
z
);

scene.add(line);
}

// ===============================
// PLAYER
// ===============================

const player =
new THREE.Group();

player.position.set(
0,
0,
10
);

scene.add(player);

// ===============================
// PLAYER MATERIALS
// ===============================

const skinMaterial =
new THREE.MeshStandardMaterial({
color: 0xc6865b
});

const shirtMaterial =
new THREE.MeshStandardMaterial({
color: 0x2388ff
});

const pantsMaterial =
new THREE.MeshStandardMaterial({
color: 0x202020
});

const shoeMaterial =
new THREE.MeshStandardMaterial({
color: 0x111111
});

// ===============================
// BODY
// ===============================

const bodyGeometry =
new THREE.BoxGeometry(
1.2,
1.7,
0.7
);

const body =
new THREE.Mesh(
bodyGeometry,
shirtMaterial
);

body.position.y =
2.1;

body.castShadow = true;

player.add(body);

// ===============================
// HEAD
// ===============================

const headGeometry =
new THREE.SphereGeometry(
0.48,
24,
24
);

const head =
new THREE.Mesh(
headGeometry,
skinMaterial
);

head.position.y =
3.35;

head.castShadow = true;

player.add(head);

// ===============================
// LEFT ARM
// ===============================

const armGeometry =
new THREE.BoxGeometry(
0.35,
1.5,
0.35
);

const leftArm =
new THREE.Mesh(
armGeometry,
shirtMaterial
);

leftArm.position.set(
-0.85,
2.1,
0
);

leftArm.castShadow = true;

player.add(leftArm);

// ===============================
// RIGHT ARM
// ===============================

const rightArm =
new THREE.Mesh(
armGeometry,
shirtMaterial
);

rightArm.position.set(
0.85,
2.1,
0
);

rightArm.castShadow = true;

player.add(rightArm);

// ===============================
// LEFT LEG
// ===============================

const legGeometry =
new THREE.BoxGeometry(
0.42,
1.7,
0.45
);

const leftLeg =
new THREE.Mesh(
legGeometry,
pantsMaterial
);

leftLeg.position.set(
-0.35,
0.75,
0
);

leftLeg.castShadow = true;

player.add(leftLeg);

// ===============================
// RIGHT LEG
// ===============================

const rightLeg =
new THREE.Mesh(
legGeometry,
pantsMaterial
);

rightLeg.position.set(
0.35,
0.75,
0
);

rightLeg.castShadow = true;

player.add(rightLeg);

// ===============================
// SHOES
// ===============================

const shoeGeometry =
new THREE.BoxGeometry(
0.48,
0.3,
0.75
);

const leftShoe =
new THREE.Mesh(
shoeGeometry,
shoeMaterial
);

leftShoe.position.set(
-0.35,
-0.05,
-0.12
);

leftShoe.castShadow = true;

player.add(leftShoe);

const rightShoe =
new THREE.Mesh(
shoeGeometry,
shoeMaterial
);

rightShoe.position.set(
0.35,
-0.05,
-0.12
);

rightShoe.castShadow = true;

player.add(rightShoe);

// ===============================
// GUN
// ===============================

const gunGeometry =
new THREE.BoxGeometry(
0.18,
0.18,
1.4
);

const gunMaterial =
new THREE.MeshStandardMaterial({
color: 0x222222
});

const gun =
new THREE.Mesh(
gunGeometry,
gunMaterial
);

gun.position.set(
0.55,
2.0,
-0.65
);

gun.rotation.x =
Math.PI / 2;

gun.castShadow = true;

player.add(gun);

// ===============================
// TREES
// ===============================

function createTree(
x,
z
) {

const tree =
new THREE.Group();

const trunkGeometry =
new THREE.CylinderGeometry(
0.35,
0.45,
3,
10
);

const trunkMaterial =
new THREE.MeshStandardMaterial({
color: 0x6b3e1f
});

const trunk =
new THREE.Mesh(
trunkGeometry,
trunkMaterial
);

trunk.position.y =
1.5;

trunk.castShadow = true;

tree.add(trunk);

const leavesGeometry =
new THREE.SphereGeometry(
1.7,
16,
16
);

const leavesMaterial =
new THREE.MeshStandardMaterial({
color: 0x176b32
});

const leaves =
new THREE.Mesh(
leavesGeometry,
leavesMaterial
);

leaves.position.y =
3.7;

leaves.castShadow = true;

tree.add(leaves);

tree.position.set(
x,
0,
z
);

scene.add(tree);
}

// Create trees

createTree(-10, -15);
createTree(10, -25);
createTree(-12, 20);
createTree(12, 30);
createTree(-18, 40);
createTree(18, 50);

// ===============================
// HOUSE
// ===============================

function createHouse(
x,
z
) {

const house =
new THREE.Group();

const wallGeometry =
new THREE.BoxGeometry(
8,
5,
7
);

const wallMaterial =
new THREE.MeshStandardMaterial({
color: 0xd6c19a
});

const walls =
new THREE.Mesh(
wallGeometry,
wallMaterial
);

walls.position.y =
2.5;

walls.castShadow = true;
walls.receiveShadow = true;

house.add(walls);

const roofGeometry =
new THREE.ConeGeometry(
5.8,
2.5,
4
);

const roofMaterial =
new THREE.MeshStandardMaterial({
color: 0x7a2525
});

const roof =
new THREE.Mesh(
roofGeometry,
roofMaterial
);

roof.rotation.y =
Math.PI / 4;

roof.position.y =
6.2;

roof.castShadow = true;

house.add(roof);

house.position.set(
x,
0,
z
);

scene.add(house);
}

createHouse(
-14,
-5
);

createHouse(
14,
-15
);

// ===============================
// PLAYER MOVEMENT
// ===============================

const keys = {};

window.addEventListener(
“keydown”,
event => {
keys[
event.key.toLowerCase()
] = true;
}
);

window.addEventListener(
“keyup”,
event => {
keys[
event.key.toLowerCase()
] = false;
}
);

// ===============================
// MOBILE JOYSTICK
// ===============================

let joystickX = 0;
let joystickY = 0;

const joystickSize = 120;

const joystick =
document.createElement(
“div”
);

joystick.style.position =
“fixed”;

joystick.style.left =
“25px”;

joystick.style.bottom =
“25px”;

joystick.style.width =
joystickSize + “px”;

joystick.style.height =
joystickSize + “px”;

joystick.style.borderRadius =
“50%”;

joystick.style.background =
“rgba(255,255,255,0.12)”;

joystick.style.border =
“2px solid rgba(255,255,255,0.35)”;

joystick.style.zIndex =
“100”;

joystick.style.touchAction =
“none”;

document.body.appendChild(
joystick
);

const knob =
document.createElement(
“div”
);

knob.style.position =
“absolute”;

knob.style.left =
“50%”;

knob.style.top =
“50%”;

knob.style.width =
“55px”;

knob.style.height =
“55px”;

knob.style.marginLeft =
“-27.5px”;

knob.style.marginTop =
“-27.5px”;

knob.style.borderRadius =
“50%”;

knob.style.background =
“rgba(255,255,255,0.3)”;

joystick.appendChild(
knob
);

function updateJoystick(
touch
) {

const rect =
joystick.getBoundingClientRect();

let x =
touch.clientX -
rect.left -
joystickSize / 2;

let y =
touch.clientY -
rect.top -
joystickSize / 2;

const distance =
Math.sqrt(
x * x +
y * y
);

const max =
joystickSize / 2 -
27;

if (distance > max) {

x =
  (x / distance) *
  max;
y =
  (y / distance) *
  max;

}

knob.style.transform =
translate(${x}px,${y}px);

joystickX =
x / max;

joystickY =
y / max;
}

function resetJoystick() {

joystickX = 0;
joystickY = 0;

knob.style.transform =
“translate(0,0)”;
}

joystick.addEventListener(
“touchstart”,
event => {

event.preventDefault();
updateJoystick(
  event.touches[0]
);

},
{
passive: false
}
);

joystick.addEventListener(
“touchmove”,
event => {

event.preventDefault();
updateJoystick(
  event.touches[0]
);

},
{
passive: false
}
);

joystick.addEventListener(
“touchend”,
resetJoystick
);

// ===============================
// CAMERA
// ===============================

const cameraOffset =
new THREE.Vector3(
0,
5,
8
);

function updateCamera() {

const target =
new THREE.Vector3(
player.position.x,
player.position.y + 2.2,
player.position.z
);

const desired =
new THREE.Vector3(
player.position.x +
cameraOffset.x,

  player.position.y +
    cameraOffset.y,
  player.position.z +
    cameraOffset.z
);

camera.position.lerp(
desired,
0.08
);

camera.lookAt(
target
);
}

// ===============================
// ANIMATION
// ===============================

let walkTime = 0;

function animatePlayer(
moving
) {

if (moving) {

walkTime += 0.15;
const swing =
  Math.sin(
    walkTime
  ) * 0.5;
leftLeg.rotation.x =
  swing;
rightLeg.rotation.x =
  -swing;
leftArm.rotation.x =
  -swing;
rightArm.rotation.x =
  swing;

} else {

leftLeg.rotation.x *=
  0.8;
rightLeg.rotation.x *=
  0.8;
leftArm.rotation.x *=
  0.8;
rightArm.rotation.x *=
  0.8;

}
}

// ===============================
// GAME LOOP
// ===============================

const clock =
new THREE.Clock();

function gameLoop() {

requestAnimationFrame(
gameLoop
);

const delta =
clock.getDelta();

const speed =
5 * delta;

let moveX = 0;
let moveZ = 0;

if (
keys[“w”] ||
keys[“arrowup”]
) {
moveZ -= 1;
}

if (
keys[“s”] ||
keys[“arrowdown”]
) {
moveZ += 1;
}

if (
keys[“a”] ||
keys[“arrowleft”]
) {
moveX -= 1;
}

if (
keys[“d”] ||
keys[“arrowright”]
) {
moveX += 1;
}

moveX += joystickX;
moveZ += joystickY;

const moving =
Math.abs(moveX) > 0.05 ||
Math.abs(moveZ) > 0.05;

if (moving) {

const length =
  Math.sqrt(
    moveX * moveX +
    moveZ * moveZ
  );
if (length > 1) {
  moveX /=
    length;
  moveZ /=
    length;
}
player.position.x +=
  moveX * speed;
player.position.z +=
  moveZ * speed;
player.rotation.y =
  Math.atan2(
    moveX,
    moveZ
  );

}

animatePlayer(
moving
);

updateCamera();

renderer.render(
scene,
camera
);
}

gameLoop();

// ===============================
// RESIZE
// ===============================

window.addEventListener(
“resize”,
() => {

camera.aspect =
  window.innerWidth /
  window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

}
);

// ===============================
// HIDE LOADING
// ===============================

const loading =
document.getElementById(
“loading”
);

if (loading) {
loading.style.display =
“none”;
}