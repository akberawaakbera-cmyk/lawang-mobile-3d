// ============================================
// LAWANG MOBILE 3D
// COMPLETE MOBILE GAME CONTROLLER
// ============================================

const THREE = window.THREE;

const player = window.gamePlayer;
const camera = window.gameCamera;

const leftLeg = window.gameParts.leftLeg;
const rightLeg = window.gameParts.rightLeg;

const leftArm = window.gameParts.leftArm;
const rightArm = window.gameParts.rightArm;

const gun = window.gameParts.gun;


// ============================================
// GAME STATE
// ============================================

const state = {

  speed: 0.055,

  runSpeed: 0.11,

  running: false,

  moving: false,

  animation: 0,

  yaw: 0,

  pitch: 0.30,

  distance: 6,

  hp: 100,

  kills: 0,

  ammo: 12,

  maxAmmo: 12,

  firing: false,

  jumping: false,

  jumpVelocity: 0,

  weaponIndex: 0

};


// ============================================
// WEAPONS
// ============================================

const weapons = [

  {
    name:"PISTOL",
    ammo:12,
    maxAmmo:12,
    damage:25
  },

  {
    name:"RIFLE",
    ammo:30,
    maxAmmo:30,
    damage:35
  },

  {
    name:"SHOTGUN",
    ammo:6,
    maxAmmo:6,
    damage:50
  }

];


// ============================================
// JOYSTICK
// ============================================

const joystick =
document.getElementById("joystick");

const knob =
document.getElementById(
  "joystickKnob"
);

let joystickX=0;
let joystickY=0;

let joystickActive=false;

const maxDistance=39;


function updateJoystick(x,y){

  const rect=
    joystick.getBoundingClientRect();

  const centerX=
    rect.left+
    rect.width/2;

  const centerY=
    rect.top+
    rect.height/2;

  let dx=x-centerX;
  let dy=y-centerY;

  const distance=
    Math.sqrt(
      dx*dx+
      dy*dy
    );

  if(distance>maxDistance){

    dx=
      dx/distance*
      maxDistance;

    dy=
      dy/distance*
      maxDistance;

  }

  knob.style.transform=
    `translate(${dx}px,${dy}px)`;

  joystickX=
    dx/maxDistance;

  joystickY=
    dy/maxDistance;
}


function resetJoystick(){

  joystickActive=false;

  joystickX=0;
  joystickY=0;

  knob.style.transform=
    "translate(0px,0px)";
}


// ============================================
// JOYSTICK TOUCH
// ============================================

joystick.addEventListener(
  "touchstart",
  event=>{

    event.preventDefault();

    joystickActive=true;

    const touch=
      event.changedTouches[0];

    updateJoystick(
      touch.clientX,
      touch.clientY
    );

  },
  {passive:false}
);


joystick.addEventListener(
  "touchmove",
  event=>{

    if(!joystickActive)
      return;

    event.preventDefault();

    const touch=
      event.changedTouches[0];

    updateJoystick(
      touch.clientX,
      touch.clientY
    );

  },
  {passive:false}
);


joystick.addEventListener(
  "touchend",
  event=>{

    event.preventDefault();

    resetJoystick();

  },
  {passive:false}
);


joystick.addEventListener(
  "touchcancel",
  resetJoystick
);


// ============================================
// RUN
// ============================================

const runButton=
document.getElementById("run");


function startRun(e){

  e.preventDefault();

  state.running=true;

  runButton.style.background=
    "rgba(35,136,255,.8)";
}


function stopRun(e){

  if(e)
    e.preventDefault();

  state.running=false;

  runButton.style.background=
    "rgba(35,136,255,.15)";
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


// ============================================
// CAMERA
// ============================================

const cameraArea=
document.getElementById(
  "game"
);

let cameraTouch=null;


document.addEventListener(
  "touchstart",
  event=>{

    if(!window.gameStarted)
      return;

    const touch=
      event.changedTouches[0];

    const x=touch.clientX;

    // Camera uses right side.
    // Ignore joystick side.

    if(x<
      window.innerWidth*0.35
    )
      return;

    cameraTouch={

      id:touch.identifier,

      x:touch.clientX,

      y:touch.clientY

    };

  },
  {passive:false}
);


document.addEventListener(
  "touchmove",
  event=>{

    if(!cameraTouch)
      return;

    for(
      const touch
      of event.changedTouches
    ){

      if(
        touch.identifier !==
        cameraTouch.id
      )
        continue;

      const dx=
        touch.clientX-
        cameraTouch.x;

      const dy=
        touch.clientY-
        cameraTouch.y;

      state.yaw -=
        dx*0.008;

      state.pitch -=
        dy*0.004;

      state.pitch=
        Math.max(
          0.08,
          Math.min(
            0.75,
            state.pitch
          )
        );

      cameraTouch.x=
        touch.clientX;

      cameraTouch.y=
        touch.clientY;

      event.preventDefault();

    }

  },
  {passive:false}
);


document.addEventListener(
  "touchend",
  event=>{

    if(!cameraTouch)
      return;

    for(
      const touch
      of event.changedTouches
    ){

      if(
        touch.identifier===
        cameraTouch.id
      ){

        cameraTouch=null;

      }

    }

  },
  {passive:false}
);


// ============================================
// MOVEMENT
// ============================================

function updatePlayer(){

  const x=joystickX;
  const y=joystickY;

  const magnitude=
    Math.sqrt(
      x*x+y*y
    );

  state.moving=
    magnitude>0.08;

  if(!state.moving)
    return;

  const speed=
    state.running
      ? state.runSpeed
      : state.speed;

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
      ? 0.30
      : 0.18;

}


// ============================================
// WALK / RUN ANIMATION
// ============================================

function updateAnimation(){

  if(!state.moving){

    leftLeg.rotation.x*=0.8;
    rightLeg.rotation.x*=0.8;

    leftArm.rotation.x*=0.8;
    rightArm.rotation.x*=0.8;

    return;

  }

  const amount=
    state.running
      ? 0.75
      : 0.45;

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
// JUMP
// ============================================

const jumpButton=
document.getElementById("jump");


function jump(){

  if(state.jumping)
    return;

  state.jumping=true;

  state.jumpVelocity=
    0.18;
}


jumpButton.addEventListener(
  "touchstart",
  e=>{

    e.preventDefault();

    jump();

  },
  {passive:false}
);


function updateJump(){

  if(!state.jumping)
    return;

  player.position.y+=
    state.jumpVelocity;

  state.jumpVelocity-=
    0.009;

  if(
    player.position.y<=0
  ){

    player.position.y=0;

    state.jumping=false;

    state.jumpVelocity=0;

  }

}


// ============================================
// RELOAD
// ============================================

const reloadButton=
document.getElementById("reload");


function reload(){

  const weapon=
    weapons[
      state.weaponIndex
    ];

  state.ammo=
    weapon.maxAmmo;

  updateHUD();

  showStatus("RELOADED");

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
// GUN SWITCH
// ============================================

const gunButton=
document.getElementById("gun");


function switchGun(){

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
    weapon.ammo;

  state.maxAmmo=
    weapon.maxAmmo;

  document
    .getElementById("weaponHUD")
    .textContent=
    weapon.name;

  document
    .getElementById("weaponName")
    .textContent=
    weapon.name;

  updateHUD();

  showStatus(
    weapon.name
  );

}


gunButton.addEventListener(
  "touchstart",
  e=>{

    e.preventDefault();

    switchGun();

  },
  {passive:false}
);


// ============================================
// FIRE
// ============================================

const fireButton=
document.getElementById("fire");


function fire(){

  if(!window.gameStarted)
    return;

  if(state.ammo<=0){

    showStatus("RELOAD");

    return;

  }

  state.ammo--;

  gun.rotation.x=
    -0.08;

  setTimeout(
    ()=>{
      gun.rotation.x=0;
    },
    80
  );

  updateHUD();

  showStatus("FIRE");

}


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

  document
    .getElementById("hp")
    .textContent=
    state.hp;

  document
    .getElementById("ammo")
    .textContent=
    state.ammo;

  document
    .getElementById("maxAmmo")
    .textContent=
    state.maxAmmo;

  document
    .getElementById("kills")
    .textContent=
    state.kills;

}


function showStatus(text){

  const status=
    document.getElementById(
      "status"
    );

  status.textContent=text;

  clearTimeout(
    showStatus.timer
  );

  showStatus.timer=
    setTimeout(
      ()=>{
        status.textContent=
          "READY";
      },
      700
    );

}


// ============================================
// CAMERA UPDATE
// ============================================

function updateCamera(){

  const horizontal=
    Math.cos(state.yaw)*
    state.distance;

  const depth=
    Math.sin(state.yaw)*
    state.distance;

  camera.position.x=
    player.position.x+
    horizontal;

  camera.position.z=
    player.position.z+
    depth;

  camera.position.y=
    player.position.y+
    3.2+
    state.pitch*2;

  camera.lookAt(
    player.position.x,
    player.position.y+2,
    player.position.z
  );

}


// ============================================
// MAP LIMIT
// ============================================

function limitPlayer(){

  const limit=70;

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
// MAIN LOOP
// ============================================

function gameLoop(){

  updatePlayer();

  updateAnimation();

  updateJump();

  limitPlayer();

  updateCamera();

  requestAnimationFrame(
    gameLoop
  );

}


// ============================================
// START
// ============================================

updateHUD();

gameLoop();

console.log(
  "LAWANG MOBILE 3D READY"
);