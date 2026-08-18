// ============================================
// LAWANG MOBILE 3D
// COMPLETE GAME SYSTEM
// MOVEMENT + CAMERA + RUN + JUMP
// FIRE + RELOAD + WEAPON SWITCH
// ENEMY + DAMAGE + SCORE
// ============================================

const THREE = window.THREE;

const player = window.gamePlayer;
const camera = window.gameCamera;

const parts = window.gameParts;

const leftLeg = parts.leftLeg;
const rightLeg = parts.rightLeg;
const leftArm = parts.leftArm;
const rightArm = parts.rightArm;

// ============================================
// GAME STATE
// ============================================

const state = {

  hp:100,

  score:0,

  weaponIndex:0,

  ammo:12,

  maxAmmo:12,

  moving:false,

  running:false,

  crouching:false,

  jumping:false,

  velocityY:0,

  animation:0,

  firing:false,

  reloading:false

};

const weapons = [

  {
    name:"PISTOL",
    damage:25,
    maxAmmo:12,
    fireDelay:350
  },

  {
    name:"RIFLE",
    damage:15,
    maxAmmo:30,
    fireDelay:120
  },

  {
    name:"SHOTGUN",
    damage:40,
    maxAmmo:6,
    fireDelay:650
  }

];

// ============================================
// DOM
// ============================================

const joystick =
document.getElementById(
  "joystick"
);

const joystickKnob =
document.getElementById(
  "joystickKnob"
);

const runButton =
document.getElementById(
  "runButton"
);

const jumpButton =
document.getElementById(
  "jumpButton"
);

const fireButton =
document.getElementById(
  "fireButton"
);

const reloadButton =
document.getElementById(
  "reloadButton"
);

const gunButton =
document.getElementById(
  "gunButton"
);

const crouchButton =
document.getElementById(
  "crouchButton"
);

const cameraArea =
document.body;

// ============================================
// SHOW GAME
// ============================================

function showGame(){

  document.getElementById(
    "lobby"
  ).classList.add("hidden");

  document.getElementById(
    "hud"
  ).classList.remove("hidden");

  document.getElementById(
    "crosshair"
  ).classList.remove("hidden");

  joystick.classList.remove(
    "hidden"
  );

  runButton.classList.remove(
    "hidden"
  );

  jumpButton.classList.remove(
    "hidden"
  );

  fireButton.classList.remove(
    "hidden"
  );

  reloadButton.classList.remove(
    "hidden"
  );

  gunButton.classList.remove(
    "hidden"
  );

  crouchButton.classList.remove(
    "hidden"
  );

}

// ============================================
// LOBBY
// ============================================

document.getElementById(
  "playButton"
).addEventListener(
  "click",
  showGame
);

// ============================================
// JOYSTICK
// ============================================

let joyX=0;
let joyY=0;
let joyActive=false;

const maxJoy=40;

function updateJoystick(
  x,
  y
){

  const rect =
    joystick.getBoundingClientRect();

  const centerX =
    rect.left +
    rect.width/2;

  const centerY =
    rect.top +
    rect.height/2;

  let dx=x-centerX;
  let dy=y-centerY;

  const distance =
    Math.sqrt(
      dx*dx+
      dy*dy
    );

  if(distance>maxJoy){

    dx=
      dx/distance*
      maxJoy;

    dy=
      dy/distance*
      maxJoy;

  }

  joyX=dx/maxJoy;
  joyY=dy/maxJoy;

  joystickKnob.style.transform=
    `translate(${dx}px,${dy}px)`;

}

function resetJoystick(){

  joyX=0;
  joyY=0;
  joyActive=false;

  joystickKnob.style.transform=
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

// ============================================
// RUN
// ============================================

function runStart(e){

  e.preventDefault();

  state.running=true;

}

function runStop(e){

  e.preventDefault();

  state.running=false;

}

runButton.addEventListener(
  "touchstart",
  runStart,
  {passive:false}
);

runButton.addEventListener(
  "touchend",
  runStop,
  {passive:false}
);

runButton.addEventListener(
  "touchcancel",
  runStop,
  {passive:false}
);

// ============================================
// JUMP
// ============================================

function jump(){

  if(state.jumping)return;

  state.jumping=true;

  state.velocityY=.18;

}

jumpButton.addEventListener(
  "touchstart",
  e=>{

    e.preventDefault();

    jump();

  },
  {passive:false}
);

// ============================================
// CROUCH
// ============================================

function crouchStart(e){

  e.preventDefault();

  state.crouching=true;

  player.scale.y=.65;

}

function crouchStop(e){

  e.preventDefault();

  state.crouching=false;

  player.scale.y=1;

}

crouchButton.addEventListener(
  "touchstart",
  crouchStart,
  {passive:false}
);

crouchButton.addEventListener(
  "touchend",
  crouchStop,
  {passive:false}
);

// ============================================
// CAMERA
// ============================================

let cameraYaw=0;
let cameraPitch=.3;

let cameraTouch=null;

const cameraSensitivity=.006;

window.addEventListener(
  "touchstart",
  e=>{

    if(e.touches.length!==1)
      return;

    const t=e.touches[0];

    const target=e.target;

    if(
      target===joystick ||
      target.closest(".gameButton")
    ){
      return;
    }

    cameraTouch={
      x:t.clientX,
      y:t.clientY
    };

  },
  {passive:true}
);

window.addEventListener(
  "touchmove",
  e=>{

    if(!cameraTouch)
      return;

    const t=e.touches[0];

    const dx=
      t.clientX-
      cameraTouch.x;

    const dy=
      t.clientY-
      cameraTouch.y;

    cameraYaw-=
      dx*cameraSensitivity;

    cameraPitch-=
      dy*.004;

    cameraPitch=
      Math.max(
        .05,
        Math.min(
          .8,
          cameraPitch
        )
      );

    cameraTouch.x=
      t.clientX;

    cameraTouch.y=
      t.clientY;

  },
  {passive:true}
);

window.addEventListener(
  "touchend",
  ()=>{
    cameraTouch=null;
  }
);

// ============================================
// CAMERA UPDATE
// ============================================

function updateCamera(){

  const distance=7;

  const height=3.7;

  camera.position.x=
    player.position.x+
    Math.sin(cameraYaw)*
    distance;

  camera.position.z=
    player.position.z+
    Math.cos(cameraYaw)*
    distance;

  camera.position.y=
    player.position.y+
    height+
    cameraPitch*2;

  camera.lookAt(
    player.position.x,
    player.position.y+2,
    player.position.z
  );

}

// ============================================
// PLAYER MOVEMENT
// ============================================

function updateMovement(){

  const magnitude=
    Math.sqrt(
      joyX*joyX+
      joyY*joyY
    );

  state.moving=
    magnitude>.08;

  if(!state.moving)
    return;

  let speed=
    state.running
      ? .12
      : .055;

  if(state.crouching)
    speed*=.5;

  const forwardX=
    -Math.sin(cameraYaw);

  const forwardZ=
    -Math.cos(cameraYaw);

  const rightX=
    Math.cos(cameraYaw);

  const rightZ=
    -Math.sin(cameraYaw);

  let moveX=
    forwardX*(-joyY)+
    rightX*joyX;

  let moveZ=
    forwardZ*(-joyY)+
    rightZ*joyX;

  const length=
    Math.sqrt(
      moveX*moveX+
      moveZ*moveZ
    );

  if(length>0){

    moveX/=length;
    moveZ/=length;

  }

  player.position.x+=
    moveX*speed;

  player.position.z+=
    moveZ*speed;

  player.rotation.y=
    Math.atan2(
      moveX,
      moveZ
    );

  state.animation+=
    state.running
      ? .3
      : .18;

}

// ============================================
// JUMP PHYSICS
// ============================================

function updateJump(){

  if(!state.jumping)
    return;

  player.position.y+=
    state.velocityY;

  state.velocityY-=.012;

  if(player.position.y<=0){

    player.position.y=0;

    state.velocityY=0;

    state.jumping=false;

  }

}

// ============================================
// WALK ANIMATION
// ============================================

function updateAnimation(){

  if(!state.moving){

    leftLeg.rotation.x=0;
    rightLeg.rotation.x=0;
    leftArm.rotation.x=0;
    rightArm.rotation.x=0;

    return;

  }

  const amount=
    state.running
      ? .75
      : .45;

  const swing=
    Math.sin(
      state.animation
    )*amount;

  leftLeg.rotation.x=
    swing;

  rightLeg.rotation.x=
    -swing;

  leftArm.rotation.x=
    -swing*.7;

  rightArm.rotation.x=
    swing*.7;

}

// ============================================
// WEAPON SWITCH
// ============================================

function switchWeapon(){

  if(state.reloading)
    return;

  state.weaponIndex++;

  if(
    state.weaponIndex>=
    weapons.length
  ){

    state.weaponIndex=0;

  }

  const weapon=
    weapons[
      state.weaponIndex
    ];

  state.ammo=
    weapon.maxAmmo;

  updateHUD();

}

gunButton.addEventListener(
  "touchstart",
  e=>{

    e.preventDefault();

    switchWeapon();

  },
  {passive:false}
);

// ============================================
// RELOAD
// ============================================

function reload(){

  if(state.reloading)
    return;

  const weapon=
    weapons[
      state.weaponIndex
    ];

  if(state.ammo>=weapon.maxAmmo)
    return;

  state.reloading=true;

  showMessage(
    "RELOADING..."
  );

  setTimeout(
    ()=>{

      state.ammo=
        weapon.maxAmmo;

      state.reloading=false;

      showMessage(
        "READY"
      );

      updateHUD();

    },
    1200
  );

}

reloadButton.addEventListener(
  "touchstart",
  e=>{

    e.preventDefault();

    reload();

  },
  {passive:false}
);

// ============================================
// ENEMIES
// ============================================

const enemies=[];

function createEnemy(
  x,
  z
){

  const enemy=
    new THREE.Group();

  const body=
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1,
        1.7,
        .6
      ),
      new THREE.MeshStandardMaterial({
        color:0xd83232
      })
    );

  body.position.y=2;

  enemy.add(body);

  const head=
    new THREE.Mesh(
      new THREE.SphereGeometry(
        .45,
        16,
        16
      ),
      new THREE.MeshStandardMaterial({
        color:0xf0b48a
      })
    );

  head.position.y=3.15;

  enemy.add(head);

  enemy.position.set(
    x,
    0,
    z
  );

  enemy.userData.hp=100;

  window.gameScene.add(
    enemy
  );

  enemies.push(enemy);

}

createEnemy(10,10);
createEnemy(-10,15);
createEnemy(15,-15);
createEnemy(-15,-10);

// ============================================
// FIRE
// ============================================

function fire(){

  if(state.reloading)
    return;

  if(state.ammo<=0){

    showMessage(
      "RELOAD!"
    );

    return;

  }

  state.ammo--;

  const weapon=
    weapons[
      state.weaponIndex
    ];

  // SIMPLE TARGETING

  let closest=null;

  let closestDistance=Infinity;

  enemies.forEach(
    enemy=>{

      if(
        enemy.userData.hp<=0
      )
        return;

      const dx=
        enemy.position.x-
        player.position.x;

      const dz=
        enemy.position.z-
        player.position.z;

      const distance=
        Math.sqrt(
          dx*dx+
          dz*dz
        );

      if(
        distance<closestDistance
      ){

        closestDistance=
          distance;

        closest=enemy;

      }

    }
  );

  if(
    closest &&
    closestDistance<18
  ){

    closest.userData.hp-=
      weapon.damage;

    if(
      closest.userData.hp<=0
    ){

      closest.userData.hp=0;

      closest.visible=false;

      state.score+=100;

      showMessage(
        "+100 ENEMY DOWN"
      );

    }else{

      showMessage(
        "HIT -"+
        weapon.damage
      );

    }

  }

  updateHUD();

}

// ============================================
// FIRE BUTTON
// ============================================

fireButton.addEventListener(
  "touchstart",
  e=>{

    e.preventDefault();

    fire();

  },
  {passive:false}
);

// ============================================
// HUD
// ============================================

function updateHUD(){

  const weapon=
    weapons[
      state.weaponIndex
    ];

  document.getElementById(
    "hp"
  ).textContent=
    state.hp;

  document.getElementById(
    "weapon"
  ).textContent=
    weapon.name;

  document.getElementById(
    "ammo"
  ).textContent=
    state.ammo;

  document.getElementById(
    "score"
  ).textContent=
    state.score;

}

// ============================================
// MESSAGE
// ============================================

let messageTimer=null;

function showMessage(text){

  const box=
    document.getElementById(
      "message"
    );

  box.textContent=text;

  box.style.display="block";

  clearTimeout(messageTimer);

  messageTimer=
    setTimeout(
      ()=>{
        box.style.display="none";
      },
      1000
    );

}

// ============================================
// MAP LIMIT
// ============================================

function limitPlayer(){

  const limit=48;

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

// ============================================
// GAME LOOP
// ============================================

function gameLoop(){

  updateMovement();

  updateJump();

  updateAnimation();

  updateCamera();

  limitPlayer();

  requestAnimationFrame(
    gameLoop
  );

}

updateHUD();

gameLoop();