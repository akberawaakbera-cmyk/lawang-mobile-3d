// =====================================================
// LAWANG MOBILE 3D
// GAME CONTROLLER
// =====================================================

const THREE = window.THREE;

const player =
window.gamePlayer;

const camera =
window.gameCamera;

const scene =
window.gameScene;

const parts =
window.gameParts;

const leftLeg =
parts.leftLeg;

const rightLeg =
parts.rightLeg;

const leftArm =
parts.leftArm;

const rightArm =
parts.rightArm;

// =====================================================
// STATE
// =====================================================

const state = {

  hp:100,

  ammo:30,

  maxAmmo:30,

  score:0,

  weaponIndex:0,

  weapons:[
    {
      name:"PISTOL",
      damage:25,
      delay:350
    },
    {
      name:"RIFLE",
      damage:15,
      delay:120
    },
    {
      name:"SHOTGUN",
      damage:45,
      delay:650
    }
  ],

  moving:false,

  running:false,

  crouching:false,

  jumping:false,

  jumpVelocity:0,

  firing:false,

  reloading:false,

  animation:0

};

// =====================================================
// HUD
// =====================================================

const hp =
document.getElementById("hp");

const weapon =
document.getElementById("weapon");

const ammo =
document.getElementById("ammo");

const score =
document.getElementById("score");

const status =
document.getElementById("status");

function updateHUD(){

  hp.textContent =
    state.hp;

  weapon.textContent =
    state.weapons[
      state.weaponIndex
    ].name;

  ammo.textContent =
    state.ammo;

  score.textContent =
    state.score;
}

// =====================================================
// JOYSTICK
// =====================================================

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

function moveJoystick(
  x,
  y
){

  const rect =
    joystick.getBoundingClientRect();

  const cx =
    rect.left +
    rect.width/2;

  const cy =
    rect.top +
    rect.height/2;

  let dx =
    x-cx;

  let dy =
    y-cy;

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

function resetJoystick(){

  joystickActive=false;

  joystickX=0;

  joystickY=0;

  knob.style.transform =
    "translate(0,0)";
}

joystick.addEventListener(
  "touchstart",
  e=>{

    e.preventDefault();

    joystickActive=true;

    const t=e.touches[0];

    moveJoystick(
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

    moveJoystick(
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

// =====================================================
// BUTTON HELPER
// =====================================================

function button(
  id,
  action
){

  const element =
    document.getElementById(id);

  element.addEventListener(
    "touchstart",
    e=>{

      e.preventDefault();

      action();

    },
    {passive:false}
  );

  element.addEventListener(
    "click",
    e=>{

      e.preventDefault();

      action();

    }
  );

  return element;
}

// =====================================================
// FIRE
// =====================================================

function fire(){

  if(
    state.reloading ||
    state.firing
  )
    return;

  if(
    state.ammo<=0
  ){

    reload();

    return;
  }

  state.firing=true;

  state.ammo--;

  updateHUD();

  /* recoil */

  player.position.y +=
    .04;

  setTimeout(
    ()=>{
      player.position.y -=
        .04;
    },
    60
  );

  /* arm animation */

  leftArm.rotation.x=
    -0.8;

  rightArm.rotation.x=
    -0.8;

  setTimeout(
    ()=>{

      leftArm.rotation.x=0;

      rightArm.rotation.x=0;

    },
    100
  );

  /* hit enemy */

  damageEnemy();

  setTimeout(
    ()=>{

      state.firing=false;

    },
    state.weapons[
      state.weaponIndex
    ].delay
  );
}

// =====================================================
// RELOAD
// =====================================================

function reload(){

  if(
    state.reloading ||
    state.ammo===
    state.maxAmmo
  )
    return;

  state.reloading=true;

  status.textContent=
    "RELOADING...";

  setTimeout(
    ()=>{

      state.ammo=
        state.maxAmmo;

      state.reloading=
        false;

      status.textContent=
        "READY";

      updateHUD();

    },
    1200
  );
}

// =====================================================
// SWITCH GUN
// =====================================================

function switchGun(){

  if(state.reloading)
    return;

  state.weaponIndex++;

  if(
    state.weaponIndex>=
    state.weapons.length
  ){

    state.weaponIndex=0;
  }

  updateHUD();

  status.textContent=
    state.weapons[
      state.weaponIndex
    ].name;

  setTimeout(
    ()=>{
      status.textContent=
        "READY";
    },
    600
  );
}

// =====================================================
// JUMP
// =====================================================

function jump(){

  if(state.jumping)
    return;

  state.jumping=true;

  state.jumpVelocity=
    .18;
}

function updateJump(){

  if(
    !state.jumping
  )
    return;

  player.position.y +=
    state.jumpVelocity;

  state.jumpVelocity -=
    .012;

  if(
    player.position.y<=0
  ){

    player.position.y=0;

    state.jumpVelocity=0;

    state.jumping=false;
  }
}

// =====================================================
// CROUCH
// =====================================================

function crouch(){

  state.crouching=
    !state.crouching;

  if(
    state.crouching
  ){

    player.scale.y=.65;

  }else{

    player.scale.y=1;
  }
}

// =====================================================
// RUN
// =====================================================

const runButton =
document.getElementById(
  "run"
);

runButton.addEventListener(
  "touchstart",
  e=>{

    e.preventDefault();

    state.running=true;

    runButton.style.background=
      "rgba(35,136,255,.8)";

  },
  {passive:false}
);

runButton.addEventListener(
  "touchend",
  e=>{

    e.preventDefault();

    state.running=false;

    runButton.style.background=
      "rgba(35,136,255,.35)";

  },
  {passive:false}
);

runButton.addEventListener(
  "touchcancel",
  ()=>{
    state.running=false;
  }
);

// =====================================================
// BUTTONS
// =====================================================

button(
  "fire",
  fire
);

button(
  "jump",
  jump
);

button(
  "reload",
  reload
);

button(
  "gun",
  switchGun
);

button(
  "crouch",
  crouch
);

// =====================================================
// CAMERA
// =====================================================

const cameraArea =
document.getElementById(
  "cameraArea"
);

let cameraTouch=null;

let yaw=0;

let pitch=.35;

const distance=7;

cameraArea.addEventListener(
  "touchstart",
  e=>{

    if(
      e.touches.length!==1
    )
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
      t.clientX-
      cameraTouch.x;

    const dy=
      t.clientY-
      cameraTouch.y;

    yaw -=
      dx*.008;

    pitch -=
      dy*.004;

    pitch=
      Math.max(
        .05,
        Math.min(
          .8,
          pitch
        )
      );

    cameraTouch.x=
      t.clientX;

    cameraTouch.y=
      t.clientY;

  },
  {passive:true}
);

cameraArea.addEventListener(
  "touchend",
  ()=>{
    cameraTouch=null;
  }
);

// =====================================================
// CAMERA UPDATE
// =====================================================

function updateCamera(){

  const target =
    new THREE.Vector3(
      player.position.x,
      player.position.y+2,
      player.position.z
    );

  camera.position.x=
    player.position.x+
    Math.cos(yaw)*
    distance;

  camera.position.z=
    player.position.z+
    Math.sin(yaw)*
    distance;

  camera.position.y=
    player.position.y+
    3.8+
    pitch*2;

  camera.lookAt(
    target
  );
}

// =====================================================
// PLAYER MOVEMENT
// =====================================================

function updatePlayer(){

  const magnitude=
    Math.sqrt(
      joystickX*
      joystickX+
      joystickY*
      joystickY
    );

  state.moving=
    magnitude>.08;

  if(
    !state.moving
  )
    return;

  let speed=
    state.running
      ? .11
      : .055;

  if(
    state.crouching
  )
    speed*=.5;

  const forwardX=
    -Math.sin(yaw);

  const forwardZ=
    -Math.cos(yaw);

  const rightX=
    Math.cos(yaw);

  const rightZ=
    -Math.sin(yaw);

  let moveX=
    forwardX*
    -joystickY+
    rightX*
    joystickX;

  let moveZ=
    forwardZ*
    -joystickY+
    rightZ*
    joystickX;

  const length=
    Math.sqrt(
      moveX*moveX+
      moveZ*moveZ
    );

  if(
    length>0
  ){

    moveX/=length;

    moveZ/=length;
  }

  player.position.x +=
    moveX*speed;

  player.position.z +=
    moveZ*speed;

  player.rotation.y=
    Math.atan2(
      moveX,
      moveZ
    );

  state.animation +=
    state.running
      ? .30
      : .18;
}

// =====================================================
// WALK ANIMATION
// =====================================================

function animation(){

  if(
    !state.moving
  ){

    leftLeg.rotation.x*=.8;

    rightLeg.rotation.x*=.8;

    leftArm.rotation.x*=.8;

    rightArm.rotation.x*=.8;

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

// =====================================================
// ENEMIES
// =====================================================

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
        .9,1.6,.55
      ),
      new THREE.MeshStandardMaterial({
        color:0xd93636
      })
    );

  body.position.y=
    1.8;

  enemy.add(body);

  const head=
    new THREE.Mesh(
      new THREE.SphereGeometry(
        .4,16,16
      ),
      new THREE.MeshStandardMaterial({
        color:0xe0a078
      })
    );

  head.position.y=
    3;

  enemy.add(head);

  enemy.position.set(
    x,0,z
  );

  enemy.userData.hp=
    100;

  enemy.userData.alive=
    true;

  scene.add(enemy);

  enemies.push(enemy);
}

createEnemy(
  8,-10
);

createEnemy(
  -12,-12
);

createEnemy(
  15,15
);

// =====================================================
// DAMAGE ENEMY
// =====================================================

function damageEnemy(){

  let closest=null;

  let nearest=
    Infinity;

  for(
    const enemy of enemies
  ){

    if(
      !enemy.userData.alive
    )
      continue;

    const d=
      player.position.distanceTo(
        enemy.position
      );

    if(
      d<nearest
    ){

      nearest=d;

      closest=enemy;
    }
  }

  if(
    !closest ||
    nearest>30
  )
    return;

  closest.userData.hp -=
    state.weapons[
      state.weaponIndex
    ].damage;

  if(
    closest.userData.hp<=0
  ){

    closest.userData.alive=
      false;

    closest.visible=
      false;

    state.score+=100;

    updateHUD();
  }
}

// =====================================================
// LIMIT MAP
// =====================================================

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

// =====================================================
// MAIN LOOP
// =====================================================

function update(){

  updatePlayer();

  animation();

  updateJump();

  updateCamera();

  limitPlayer();

  updateHUD();

  if(
    state.running &&
    state.moving
  ){

    status.textContent=
      "RUNNING";

  }else if(
    state.moving
  ){

    status.textContent=
      "WALKING";

  }else if(
    state.jumping
  ){

    status.textContent=
      "JUMP";

  }else if(
    !state.reloading
  ){

    status.textContent=
      "READY";
  }

  requestAnimationFrame(
    update
  );
}

// =====================================================
// START
// =====================================================

updateHUD();

update();

console.log(
  "LAWANG MOBILE 3D READY"
);