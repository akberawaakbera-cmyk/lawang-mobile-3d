// ========================================
// LAWANG MOBILE 3D
// MOVEMENT + CAMERA + RUN + COLLISION
// ========================================

const THREE = window.THREE;

const player = window.gamePlayer;
const camera = window.gameCamera;

const leftLeg =
window.gameParts.leftLeg;

const rightLeg =
window.gameParts.rightLeg;

const leftArm =
window.gameParts.leftArm;

const rightArm =
window.gameParts.rightArm;


// ========================================
// PLAYER STATE
// ========================================

const playerState = {

  speed: 0.075,

  runSpeed: 0.145,

  running: false,

  moving: false,

  animation: 0

};


// ========================================
// JOYSTICK
// ========================================

const joystick =
document.getElementById(
  "joystick"
);

const knob =
document.getElementById(
  "joystickKnob"
);

let joystickX=0;
let joystickY=0;
let joystickActive=false;

const maxDistance=39;


// ========================================
// JOYSTICK UPDATE
// ========================================

function updateJoystick(
  x,
  y
){

  const rect =
  joystick.getBoundingClientRect();

  const centerX =
  rect.left+
  rect.width/2;

  const centerY =
  rect.top+
  rect.height/2;

  let dx=x-centerX;
  let dy=y-centerY;

  const distance =
  Math.sqrt(
    dx*dx+
    dy*dy
  );

  if(
    distance>maxDistance
  ){

    dx =
    dx/distance*
    maxDistance;

    dy =
    dy/distance*
    maxDistance;
  }

  knob.style.transform =
  `translate(${dx}px,${dy}px)`;

  joystickX =
    dx/maxDistance;

  joystickY =
    dy/maxDistance;
}


// ========================================
// RESET JOYSTICK
// ========================================

function resetJoystick(){

  joystickActive=false;

  joystickX=0;
  joystickY=0;

  knob.style.transform=
    "translate(0px,0px)";
}


// ========================================
// JOYSTICK TOUCH
// ========================================

joystick.addEventListener(
  "touchstart",
  event=>{

    event.preventDefault();

    joystickActive=true;

    const touch=
      event.touches[0];

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
      event.touches[0];

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


// ========================================
// RUN
// ========================================

const runButton =
document.getElementById(
  "runButton"
);


function startRun(event){

  event.preventDefault();

  playerState.running=true;

  runButton.style.background=
    "rgba(35,136,255,.80)";
}


function stopRun(event){

  event.preventDefault();

  playerState.running=false;

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

const cameraArea =
document.getElementById(
  "cameraArea"
);

let cameraTouch=null;

let cameraYaw=0;

let cameraPitch=.30;

const cameraDistance=7;

const cameraHeight=3.5;


// ========================================
// CAMERA START
// ========================================

cameraArea.addEventListener(
  "touchstart",
  event=>{

    if(
      event.touches.length!==1
    )
      return;

    const touch=
      event.touches[0];

    cameraTouch={
      x:touch.clientX,
      y:touch.clientY
    };

  },
  {passive:true}
);


// ========================================
// CAMERA MOVE
// ========================================

cameraArea.addEventListener(
  "touchmove",
  event=>{

    if(!cameraTouch)
      return;

    const touch=
      event.touches[0];

    const dx=
      touch.clientX-
      cameraTouch.x;

    const dy=
      touch.clientY-
      cameraTouch.y;

    cameraYaw -=
      dx*.007;

    cameraPitch -=
      dy*.004;

    cameraPitch=
      Math.max(
        .05,
        Math.min(
          .85,
          cameraPitch
        )
      );

    cameraTouch.x=
      touch.clientX;

    cameraTouch.y=
      touch.clientY;

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
      player.position.y+1.8,
      player.position.z
    );

  const horizontal =
    Math.sin(cameraYaw)*
    cameraDistance;

  const depth =
    Math.cos(cameraYaw)*
    cameraDistance;

  camera.position.x=
    player.position.x+
    horizontal;

  camera.position.z=
    player.position.z+
    depth;

  camera.position.y=
    player.position.y+
    cameraHeight+
    cameraPitch*2;

  camera.lookAt(target);
}


// ========================================
// COLLISION
// ========================================

function canMoveTo(
  x,
  z
){

  const radius=.55;

  const colliders =
    window.buildingColliders||
    [];

  for(
    const box of colliders
  ){

    const closestX=
      Math.max(
        box.minX,
        Math.min(
          x,
          box.maxX
        )
      );

    const closestZ=
      Math.max(
        box.minZ,
        Math.min(
          z,
          box.maxZ
        )
      );

    const dx=
      x-closestX;

    const dz=
      z-closestZ;

    if(
      dx*dx+
      dz*dz<
      radius*radius
    ){

      return false;
    }
  }

  return true;
}


// ========================================
// PLAYER MOVEMENT
// ========================================

function updatePlayer(){

  const inputX=
    joystickX;

  const inputY=
    joystickY;

  const magnitude=
    Math.sqrt(
      inputX*inputX+
      inputY*inputY
    );

  playerState.moving=
    magnitude>.08;

  if(
    !playerState.moving
  ){

    return;
  }

  const speed=
    playerState.running
      ? playerState.runSpeed
      : playerState.speed;


  // CAMERA RELATIVE MOVEMENT

  const forwardX=
    -Math.sin(cameraYaw);

  const forwardZ=
    -Math.cos(cameraYaw);

  const rightX=
    Math.cos(cameraYaw);

  const rightZ=
    -Math.sin(cameraYaw);


  let moveX=
    forwardX*(-inputY)+
    rightX*inputX;

  let moveZ=
    forwardZ*(-inputY)+
    rightZ*inputX;


  const length=
    Math.sqrt(
      moveX*moveX+
      moveZ*moveZ
    );


  if(length>0){

    moveX/=length;
    moveZ/=length;
  }


  const newX=
    player.position.x+
    moveX*speed;

  const newZ=
    player.position.z+
    moveZ*speed;


  // COLLISION

  if(
    canMoveTo(
      newX,
      player.position.z
    )
  ){

    player.position.x=
      newX;
  }


  if(
    canMoveTo(
      player.position.x,
      newZ
    )
  ){

    player.position.z=
      newZ;
  }


  // CHARACTER ROTATION

  player.rotation.y=
    Math.atan2(
      moveX,
      moveZ
    );


  // ANIMATION

  playerState.animation +=
    playerState.running
      ? .30
      : .20;
}


// ========================================
// WALK / RUN ANIMATION
// ========================================

function updateAnimation(){

  if(
    !playerState.moving
  ){

    leftLeg.rotation.x=0;
    rightLeg.rotation.x=0;

    leftArm.rotation.x=0;
    rightArm.rotation.x=0;

    return;
  }


  const amount=
    playerState.running
      ? .75
      : .48;


  const swing=
    Math.sin(
      playerState.animation
    )*amount;


  leftLeg.rotation.x=
    swing;

  rightLeg.rotation.x=
    -swing;

  leftArm.rotation.x=
    -swing*.65;

  rightArm.rotation.x=
    swing*.65;
}


// ========================================
// MAP BOUNDARY
// ========================================

function limitPlayer(){

  const limit=82;

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
// STATUS
// ========================================

const status=
document.getElementById(
  "status"
);


function updateStatus(){

  if(
    playerState.running &&
    playerState.moving
  ){

    status.textContent=
      "RUNNING";

  }else if(
    playerState.moving
  ){

    status.textContent=
      "WALKING";

  }else{

    status.textContent=
      "READY";
  }

  requestAnimationFrame(
    updateStatus
  );
}


// ========================================
// GAME LOOP
// ========================================

function gameLoop(){

  updatePlayer();

  updateAnimation();

  limitPlayer();

  updateCamera();

  requestAnimationFrame(
    gameLoop
  );
}


// ========================================
// START
// ========================================

updateCamera();

gameLoop();

updateStatus();