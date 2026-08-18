// ========================================
// LAWANG MOBILE 3D
// MOVEMENT + CAMERA + JUMP + RUN
// ========================================

const THREE = window.THREE;

const player = window.gamePlayer;
const camera = window.gameCamera;

const parts = window.gameParts;

const leftLeg = parts.leftLeg;
const rightLeg = parts.rightLeg;

const leftArm = parts.leftArm;
const rightArm = parts.rightArm;


// ========================================
// PLAYER STATE
// ========================================

const state = {

  speed:0.07,

  runSpeed:0.14,

  running:false,

  moving:false,

  jumping:false,

  verticalVelocity:0,

  gravity:-0.012,

  animation:0,

  yaw:0

};


// ========================================
// JOYSTICK
// ========================================

const joystick =
  document.getElementById("joystick");

const knob =
  document.getElementById("knob");

let joyX=0;
let joyY=0;

let joystickActive=false;

const maxDistance=39;


function updateJoystick(x,y){

  const rect =
    joystick.getBoundingClientRect();

  const cx =
    rect.left+rect.width/2;

  const cy =
    rect.top+rect.height/2;

  let dx=x-cx;
  let dy=y-cy;

  const distance =
    Math.sqrt(
      dx*dx+dy*dy
    );

  if(distance>maxDistance){

    dx =
      dx/distance*
      maxDistance;

    dy =
      dy/distance*
      maxDistance;
  }

  knob.style.transform =
    `translate(${dx}px,${dy}px)`;

  joyX =
    dx/maxDistance;

  joyY =
    dy/maxDistance;
}


function resetJoystick(){

  joystickActive=false;

  joyX=0;
  joyY=0;

  knob.style.transform=
    "translate(0px,0px)";
}


joystick.addEventListener(
  "touchstart",
  e=>{

    e.preventDefault();

    joystickActive=true;

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

    if(!joystickActive)
      return;

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


joystick.addEventListener(
  "touchcancel",
  resetJoystick
);


// ========================================
// RUN
// ========================================

const runButton =
  document.getElementById(
    "runButton"
  );


// Optional: run button may not exist
if(runButton){

  runButton.addEventListener(
    "touchstart",
    e=>{

      e.preventDefault();

      state.running=true;

    },
    {passive:false}
  );

  runButton.addEventListener(
    "touchend",
    e=>{

      e.preventDefault();

      state.running=false;

    },
    {passive:false}
  );

}


// ========================================
// JUMP
// ========================================

const jumpButton =
  document.getElementById(
    "jump"
  );


jumpButton.addEventListener(
  "touchstart",
  e=>{

    e.preventDefault();

    jump();

  },
  {passive:false}
);


function jump(){

  if(state.jumping)
    return;

  state.jumping=true;

  state.verticalVelocity=0.22;

}


// ========================================
// GRAVITY
// ========================================

function updateJump(){

  if(!state.jumping)
    return;

  player.position.y +=
    state.verticalVelocity;

  state.verticalVelocity +=
    state.gravity;

  if(player.position.y<=0){

    player.position.y=0;

    state.verticalVelocity=0;

    state.jumping=false;
  }

}


// ========================================
// CAMERA
// ========================================

const cameraArea =
  document.getElementById(
    "cameraArea"
  );

let cameraTouch=null;

let cameraYaw=0;

let cameraPitch=0.35;

const cameraDistance=7;

const cameraHeight=3.5;


cameraArea.addEventListener(
  "touchstart",
  e=>{

    if(e.touches.length!==1)
      return;

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

    if(!cameraTouch)
      return;

    const t=e.touches[0];

    const dx=
      t.clientX-cameraTouch.x;

    const dy=
      t.clientY-cameraTouch.y;

    cameraYaw -=
      dx*0.008;

    cameraPitch -=
      dy*0.004;

    cameraPitch=
      Math.max(
        0.05,
        Math.min(
          0.8,
          cameraPitch
        )
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
// CAMERA UPDATE
// ========================================

function updateCamera(){

  const target =
    new THREE.Vector3(
      player.position.x,
      player.position.y+2.1,
      player.position.z
    );

  camera.position.x =
    player.position.x+
    Math.sin(cameraYaw)*
    cameraDistance;

  camera.position.z =
    player.position.z+
    Math.cos(cameraYaw)*
    cameraDistance;

  camera.position.y =
    player.position.y+
    cameraHeight+
    cameraPitch*2;

  camera.lookAt(target);

}


// ========================================
// MOVEMENT
// ========================================

function updateMovement(){

  const magnitude =
    Math.sqrt(
      joyX*joyX+
      joyY*joyY
    );

  state.moving =
    magnitude>0.08;

  if(!state.moving)
    return;


  const speed =
    state.running
      ? state.runSpeed
      : state.speed;


  const forwardX =
    -Math.sin(cameraYaw);

  const forwardZ =
    -Math.cos(cameraYaw);

  const rightX =
    Math.cos(cameraYaw);

  const rightZ =
    -Math.sin(cameraYaw);


  let moveX =
    forwardX*(-joyY)+
    rightX*joyX;

  let moveZ =
    forwardZ*(-joyY)+
    rightZ*joyX;


  const length =
    Math.sqrt(
      moveX*moveX+
      moveZ*moveZ
    );


  if(length>0){

    moveX/=length;

    moveZ/=length;

  }


  player.position.x +=
    moveX*speed;

  player.position.z +=
    moveZ*speed;


  // Face movement direction

  state.yaw =
    Math.atan2(
      moveX,
      moveZ
    );

  player.rotation.y =
    state.yaw;


  state.animation +=
    state.running
      ? 0.30
      : 0.19;

}


// ========================================
// WALK / RUN ANIMATION
// ========================================

function updateAnimation(){

  if(!state.moving){

    leftLeg.rotation.x=
      0;

    rightLeg.rotation.x=
      0;

    leftArm.rotation.x=
      0;

    rightArm.rotation.x=
      0;

    return;

  }


  const amount =
    state.running
      ? 0.75
      : 0.48;


  const swing =
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


// ========================================
// MAP BOUNDARY
// ========================================

function limitPlayer(){

  const limit=47;

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
// FIRE
// ========================================

const fireButton =
  document.getElementById(
    "fire"
  );

let score=0;

fireButton.addEventListener(
  "touchstart",
  e=>{

    e.preventDefault();

    fire();

  },
  {passive:false}
);


function fire(){

  const weapon =
    document.getElementById(
      "weapon"
    );

  const scoreText =
    document.getElementById(
      "score"
    );

  score+=10;

  scoreText.textContent=
    score;

  weapon.textContent=
    "PISTOL";

}


// ========================================
// GUN SWITCH
// ========================================

const gunButton =
  document.getElementById(
    "gun"
  );

const weapons=[
  "PISTOL",
  "RIFLE",
  "SHOTGUN"
];

let weaponIndex=0;


gunButton.addEventListener(
  "touchstart",
  e=>{

    e.preventDefault();

    weaponIndex++;

    if(
      weaponIndex>=
      weapons.length
    ){

      weaponIndex=0;

    }

    document.getElementById(
      "weapon"
    ).textContent=
      weapons[weaponIndex];

  },
  {passive:false}
);


// ========================================
// RELOAD
// ========================================

const reloadButton =
  document.getElementById(
    "reload"
  );


reloadButton.addEventListener(
  "touchstart",
  e=>{

    e.preventDefault();

    reloadButton.textContent=
      "READY";

    setTimeout(
      ()=>{
        reloadButton.textContent=
          "RELOAD";
      },
      800
    );

  },
  {passive:false}
);


// ========================================
// MAIN LOOP
// ========================================

function update(){

  updateMovement();

  updateAnimation();

  updateJump();

  limitPlayer();

  updateCamera();

  requestAnimationFrame(
    update
  );

}


update();