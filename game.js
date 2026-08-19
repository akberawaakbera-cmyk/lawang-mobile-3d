// ========================================
// LAWANG MOBILE 3D
// COMBAT + MOVEMENT + CAMERA + GUNS
// ========================================

const THREE = window.THREE;

const player = window.gamePlayer;
const camera = window.gameCamera;

const leftLeg = window.gameParts.leftLeg;
const rightLeg = window.gameParts.rightLeg;
const leftArm = window.gameParts.leftArm;
const rightArm = window.gameParts.rightArm;

const gunGroup = window.gameParts.gunGroup;

const enemies = window.gameEnemies;


// ========================================
// STATE
// ========================================

const state = {

 speed:0.075,
 runSpeed:0.145,

 running:false,
 moving:false,

 yaw:0,
 pitch:.35,

 animation:0,

 hp:100,
 kills:0,

 firing:false,
 reloading:false,

 weaponIndex:0

};


// ========================================
// WEAPONS
// ========================================

const weapons=[

 {
  name:"PISTOL",
  damage:25,
  headDamage:60,
  ammo:12,
  maxAmmo:12,
  fireDelay:320,
  color:0x222222
 },

 {
  name:"RIFLE",
  damage:18,
  headDamage:45,
  ammo:30,
  maxAmmo:30,
  fireDelay:120,
  color:0x333333
 },

 {
  name:"SHOTGUN",
  damage:55,
  headDamage:90,
  ammo:6,
  maxAmmo:6,
  fireDelay:650,
  color:0x552b18
 }

];


// ========================================
// CURRENT WEAPON
// ========================================

function currentWeapon(){

 return weapons[state.weaponIndex];

}


// ========================================
// HUD
// ========================================

const hpUI=document.getElementById("hp");
const ammoUI=document.getElementById("ammo");
const killsUI=document.getElementById("kills");

const weaponUI=document.getElementById(
 "weaponName"
);

const statusUI=document.getElementById(
 "status"
);

function updateHUD(){

 const w=currentWeapon();

 hpUI.textContent=state.hp;

 killsUI.textContent=state.kills;

 ammoUI.textContent=
   w.ammo+"/"+w.maxAmmo;

 weaponUI.textContent=w.name;

}


// ========================================
// JOYSTICK
// ========================================

const joystick=document.getElementById(
 "joystick"
);

const knob=document.getElementById(
 "joystickKnob"
);

let joyX=0;
let joyY=0;
let joyActive=false;

const joyMax=39;


function updateJoystick(x,y){

 const rect=
   joystick.getBoundingClientRect();

 const cx=
   rect.left+
   rect.width/2;

 const cy=
   rect.top+
   rect.height/2;

 let dx=x-cx;
 let dy=y-cy;

 const distance=
   Math.sqrt(dx*dx+dy*dy);

 if(distance>joyMax){

  dx=
   dx/distance*joyMax;

  dy=
   dy/distance*joyMax;
 }

 knob.style.transform=
   `translate(${dx}px,${dy}px)`;

 joyX=dx/joyMax;
 joyY=dy/joyMax;
}


function resetJoystick(){

 joyActive=false;

 joyX=0;
 joyY=0;

 knob.style.transform=
   "translate(0px,0px)";
}


joystick.addEventListener(
 "touchstart",
 e=>{

  e.preventDefault();

  joyActive=true;

  const t=e.touches[0];

  updateJoystick(
   t.clientX,
   t.clientY
  );

 },
 {passive:false}
);


joystick.addEventListener(
 "touchmove",
 e=>{

  if(!joyActive)return;

  e.preventDefault();

  const t=e.touches[0];

  updateJoystick(
   t.clientX,
   t.clientY
  );

 },
 {passive:false}
);


joystick.addEventListener(
 "touchend",
 e=>{

  e.preventDefault();

  resetJoystick();

 },
 {passive:false}
);


// ========================================
// RUN
// ========================================

const runButton=document.getElementById(
 "runButton"
);


function startRun(e){

 e.preventDefault();

 state.running=true;

 runButton.style.background=
  "rgba(35,136,255,.8)";
}


function stopRun(e){

 e.preventDefault();

 state.running=false;

 runButton.style.background=
  "rgba(35,136,255,.35)";
}


runButton.addEventListener(
 "touchstart",
 startRun,
 {passive:false}
);

runButton.addEventListener(
 "touchend",
 stopRun,
 {passive:false}
);

runButton.addEventListener(
 "touchcancel",
 stopRun,
 {passive:false}
);


// ========================================
// CAMERA
// ========================================

const cameraArea=document.createElement(
 "div"
);

cameraArea.style.position="fixed";
cameraArea.style.left="35%";
cameraArea.style.top="0";
cameraArea.style.width="65%";
cameraArea.style.height="70%";
cameraArea.style.zIndex="50";
cameraArea.style.touchAction="none";

document.body.appendChild(cameraArea);


let cameraTouch=null;


cameraArea.addEventListener(
 "touchstart",
 e=>{

  if(e.touches.length!==1)return;

  const t=e.touches[0];

  cameraTouch={
   x:t.clientX,
   y:t.clientY
  };

 },
 {passive:true}
);


cameraArea.addEventListener(
 "touchmove",
 e=>{

  if(!cameraTouch)return;

  const t=e.touches[0];

  const dx=
   t.clientX-cameraTouch.x;

  const dy=
   t.clientY-cameraTouch.y;

  state.yaw-=dx*.008;

  state.pitch-=dy*.004;

  state.pitch=
   Math.max(
    .05,
    Math.min(.8,state.pitch)
   );

  cameraTouch.x=t.clientX;
  cameraTouch.y=t.clientY;

 },
 {passive:true}
);


cameraArea.addEventListener(
 "touchend",
 ()=>{
  cameraTouch=null;
 }
);


// ========================================
// PLAYER MOVEMENT
// ========================================

function updatePlayer(){

 const x=joyX;
 const y=joyY;

 const magnitude=
  Math.sqrt(x*x+y*y);

 state.moving=
  magnitude>.08;

 if(!state.moving)return;

 const speed=
  state.running?
  state.runSpeed:
  state.speed;

 const forwardX=
  -Math.sin(state.yaw);

 const forwardZ=
  -Math.cos(state.yaw);

 const rightX=
  Math.cos(state.yaw);

 const rightZ=
  -Math.sin(state.yaw);

 let moveX=
  forwardX*(-y)+
  rightX*x;

 let moveZ=
  forwardZ*(-y)+
  rightZ*x;

 const length=
  Math.sqrt(
   moveX*moveX+
   moveZ*moveZ
  );

 if(length>0){

  moveX/=length;
  moveZ/=length;

 }

 player.position.x+=moveX*speed;
 player.position.z+=moveZ*speed;

 player.rotation.y=
  Math.atan2(moveX,moveZ);

 state.animation+=
  state.running?.30:.19;

}


// ========================================
// CHARACTER ANIMATION
// ========================================

function animateCharacter(){

 if(!state.moving){

  leftLeg.rotation.x=0;
  rightLeg.rotation.x=0;
  leftArm.rotation.x=0;
  rightArm.rotation.x=0;

  return;
 }

 const amount=
  state.running?.7:.45;

 const swing=
  Math.sin(state.animation)*amount;

 leftLeg.rotation.x=swing;
 rightLeg.rotation.x=-swing;

 leftArm.rotation.x=-swing*.7;
 rightArm.rotation.x=swing*.7;

}


// ========================================
// CAMERA FOLLOW
// ========================================

function updateCamera(){

 const target=new THREE.Vector3(
  player.position.x,
  player.position.y+2,
  player.position.z
 );

 const distance=7;

 camera.position.x=
  player.position.x+
  Math.cos(state.yaw)*distance;

 camera.position.z=
  player.position.z+
  Math.sin(state.yaw)*distance;

 camera.position.y=
  player.position.y+
  3.8+
  state.pitch*2;

 camera.lookAt(target);

}


// ========================================
// GUN SWITCH
// ========================================

function changeGun(){

 if(state.reloading)return;

 state.weaponIndex++;

 if(state.weaponIndex>=weapons.length)
  state.weaponIndex=0;

 const w=currentWeapon();

 // Change gun appearance
 gunGroup.children.forEach(
  child=>{
   if(child.material)
    child.material.color.setHex(
     w.color
    );
  }
 );

 updateHUD();

 statusUI.textContent=
  "GUN: "+w.name;

}


// ========================================
// GUN BUTTON
// ========================================

const gunButton=document.getElementById(
 "gunButton"
);

gunButton.addEventListener(
 "touchstart",
 e=>{
  e.preventDefault();
  changeGun();
 },
 {passive:false}
);


// ========================================
// MUZZLE FLASH
// ========================================

function muzzleFlash(){

 const flash=new THREE.Mesh(
  new THREE.SphereGeometry(
   .18,8,8
  ),
  new THREE.MeshBasicMaterial({
   color:0xffaa22
  })
 );

 flash.position.set(
  player.position.x,
  player.position.y+2,
  player.position.z-.9
 );

 window.gameScene.add(flash);

 setTimeout(()=>{
  window.gameScene.remove(flash);
 },70);

}


// ========================================
// SHOOT RAY
// ========================================

const raycaster=
 new THREE.Raycaster();

const center=
 new THREE.Vector2(0,0);


function shoot(){

 if(state.reloading)return;

 const w=currentWeapon();

 if(w.ammo<=0){

  statusUI.textContent=
   "RELOAD";

  return;
 }

 w.ammo--;

 updateHUD();

 muzzleFlash();

 raycaster.setFromCamera(
  center,
  camera
 );

 const objects=[];

 enemies.forEach(enemy=>{

  if(enemy.userData.alive){

   enemy.traverse(obj=>{

    if(obj.isMesh)
     objects.push(obj);

   });

  }

 });

 const hits=
  raycaster.intersectObjects(
   objects,
   true
  );

 if(hits.length===0)return;

 let object=hits[0].object;

 let enemy=null;

 enemies.forEach(e=>{

  if(e.userData.alive &&
     e.children.includes(object))
   enemy=e;

  if(
   e.userData.head===object ||
   e.userData.body===object
  )
   enemy=e;

 });

 if(!enemy)return;

 const headshot=
  object===enemy.userData.head;

 const damage=
  headshot?
  w.headDamage:
  w.damage;

 enemy.userData.hp-=damage;

 const info=
  document.getElementById(
   "enemyInfo"
  );

 info.style.display="block";

 info.textContent=
  headshot?
  "HEADSHOT -"+damage:
  "HIT -"+damage;

 setTimeout(()=>{
  info.style.display="none";
 },400);

 if(enemy.userData.hp<=0){

  killEnemy(enemy);

 }

}


// ========================================
// FIRE
// ========================================

let lastShot=0;


function fire(){

 const now=Date.now();

 const w=currentWeapon();

 if(
  now-lastShot<
  w.fireDelay
 )
  return;

 lastShot=now;

 shoot();

}


// ========================================
// FIRE BUTTON
// ========================================

const fireButton=document.getElementById(
 "fireButton"
);


fireButton.addEventListener(
 "touchstart",
 e=>{

  e.preventDefault();

  state.firing=true;

  fire();

 },
 {passive:false}
);


fireButton.addEventListener(
 "touchend",
 e=>{

  e.preventDefault();

  state.firing=false;

 },
 {passive:false}
);


fireButton.addEventListener(
 "touchcancel",
 ()=>{
  state.firing=false;
 }
);


// ========================================
// RELOAD
// ========================================

const reloadButton=
 document.getElementById(
  "reloadButton"
 );


function reload(){

 if(state.reloading)return;

 const w=currentWeapon();

 if(w.ammo===w.maxAmmo)return;

 state.reloading=true;

 statusUI.textContent=
  "RELOADING...";

 setTimeout(()=>{

  w.ammo=w.maxAmmo;

  state.reloading=false;

  updateHUD();

  statusUI.textContent=
   "READY";

 },1200);

}


reloadButton.addEventListener(
 "touchstart",
 e=>{

  e.preventDefault();

  reload();

 },
 {passive:false}
);


// ========================================
// ENEMY DEATH
// ========================================

function killEnemy(enemy){

 enemy.userData.alive=false;

 state.kills++;

 updateHUD();

 statusUI.textContent=
  "ENEMY DOWN";

 let fall=0;

 const animation=setInterval(()=>{

  fall+=.12;

  enemy.rotation.x=
   Math.min(
    Math.PI/2,
    fall
   );

  if(fall>=Math.PI/2){

   clearInterval(animation);

   setTimeout(()=>{

    enemy.visible=false;

   },300);

  }

 },30);

}


// ========================================
// ENEMY SIMPLE AI
// ========================================

function updateEnemies(){

 enemies.forEach(enemy=>{

  if(!enemy.userData.alive)return;

  const dx=
   player.position.x-
   enemy.position.x;

  const dz=
   player.position.z-
   enemy.position.z;

  const distance=
   Math.sqrt(dx*dx+dz*dz);

  // Enemy approaches player
  if(distance>6 && distance<45){

   enemy.position.x+=
    dx/distance*.018;

   enemy.position.z+=
    dz/distance*.018;

   enemy.rotation.y=
    Math.atan2(dx,dz);

  }

 });

}


// ========================================
// JUMP
// ========================================

const jumpButton=
 document.getElementById(
  "jumpButton"
 );

let verticalVelocity=0;
let onGround=true;


jumpButton.addEventListener(
 "touchstart",
 e=>{

  e.preventDefault();

  if(!onGround)return;

  verticalVelocity=.16;

  onGround=false;

 },
 {passive:false}
);


function updateJump(){

 verticalVelocity-=.008;

 player.position.y+=
  verticalVelocity;

 if(player.position.y<=0){

  player.position.y=0;

  verticalVelocity=0;

  onGround=true;

 }

}


// ========================================
// MAP LIMIT
// ========================================

function limitPlayer(){

 const limit=80;

 player.position.x=
  Math.max(
   -limit,
   Math.min(
    limit,
    player.position.x
   )
  );

 player.position.z=
  Math.max(
   -limit,
   Math.min(
    limit,
    player.position.z
   )
  );

}


// ========================================
// MAIN LOOP
// ========================================

function updateGame(){

 updatePlayer();

 animateCharacter();

 updateCamera();

 updateEnemies();

 updateJump();

 limitPlayer();

 if(state.firing)
  fire();

 requestAnimationFrame(
  updateGame
 );

}


// ========================================
// START
// ========================================

updateHUD();

updateGame();

statusUI.textContent=
 "READY";