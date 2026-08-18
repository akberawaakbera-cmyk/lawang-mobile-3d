// ========================================
// LAWANG MOBILE 3D - COMBAT V1
// ========================================

const THREE = window.THREE;

const player = window.gamePlayer;
const camera = window.gameCamera;

const {
  leftLeg,
  rightLeg,
  leftArm,
  rightArm,
  body,
  head
} = window.gameParts;


// ========================================
// PLAYER
// ========================================

const state = {

  speed: 0.065,

  runSpeed: 0.12,

  moving: false,

  running: false,

  jumping: false,

  crouching: false,

  animation: 0,

  velocityY: 0,

  gravity: 0.012

};


// ========================================
// WEAPONS
// ========================================

const weapons = [

  {
    name:"PISTOL",
    damage:25,
    headDamage:50,
    magazine:12,
    ammo:60,
    fireDelay:350
  },

  {
    name:"RIFLE",
    damage:18,
    headDamage:40,
    magazine:30,
    ammo:120,
    fireDelay:120
  },

  {
    name:"SHOTGUN",
    damage:55,
    headDamage:90,
    magazine:6,
    ammo:36,
    fireDelay:650
  }

];

let weaponIndex=0;

let currentAmmo =
weapons[0].magazine;

let reserveAmmo =
weapons[0].ammo;

let reloading=false;

let firing=false;

let score=0;


// ========================================
// HUD
// ========================================

const hpElement =
document.getElementById("hp");

const weaponElement =
document.getElementById("weapon");

const ammoElement =
document.getElementById("ammo");

const scoreElement =
document.getElementById("score");

const statusElement =
document.getElementById("status");

const messageElement =
document.getElementById("message");


function updateHUD(){

  hpElement.textContent =
  Math.max(0,Math.round(playerHP));

  weaponElement.textContent =
  weapons[weaponIndex].name;

  ammoElement.textContent =
  currentAmmo+" / "+reserveAmmo;

  scoreElement.textContent =
  score;
}


// ========================================
// PLAYER HP
// ========================================

let playerHP=100;


// ========================================
// JOYSTICK
// ========================================

const joystick =
document.getElementById("joystick");

const knob =
document.getElementById("joystickKnob");

let joystickX=0;
let joystickY=0;

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
  Math.sqrt(dx*dx+dy*dy);

  if(distance>maxDistance){

    dx =
    dx/distance*maxDistance;

    dy =
    dy/distance*maxDistance;
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

  if(!joystickActive)return;

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

const runButton =
document.getElementById(
  "runButton"
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


function stopRun(e){

  e.preventDefault();

  state.running=false;

  runButton.style.background=
  "rgba(35,136,255,.35)";
}


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

let cameraPitch=.35;

const cameraDistance=7;

const cameraHeight=3.8;


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
  dx*.008;

  cameraPitch -=
  dy*.004;

  cameraPitch=
  Math.max(
    .05,
    Math.min(.8,cameraPitch)
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


// ========================================
// JUMP
// ========================================

const jumpButton =
document.getElementById(
  "jumpButton"
);


function jump(){

  if(state.jumping)
    return;

  state.jumping=true;

  state.velocityY=.20;
}


jumpButton.addEventListener(
"touchstart",
e=>{

  e.preventDefault();

  jump();

},
{passive:false}
);


// ========================================
// CROUCH
// ========================================

const crouchButton =
document.getElementById(
  "crouchButton"
);


function toggleCrouch(){

  state.crouching=
  !state.crouching;

  if(state.crouching){

    player.scale.y=.65;

    crouchButton.style.background=
    "rgba(255,255,255,.5)";

  }else{

    player.scale.y=1;

    crouchButton.style.background=
    "rgba(80,80,80,.5)";
  }
}


crouchButton.addEventListener(
"touchstart",
e=>{

  e.preventDefault();

  toggleCrouch();

},
{passive:false}
);


// ========================================
// ENEMIES
// ========================================

const enemies=[];


function createEnemy(x,z){

  const enemy =
  new THREE.Group();

  const enemyBody =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      1,1.7,.6
    ),
    new THREE.MeshStandardMaterial({
      color:0xd93636
    })
  );

  enemyBody.position.y=2;

  enemy.add(enemyBody);


  const enemyHead =
  new THREE.Mesh(
    new THREE.SphereGeometry(
      .45,16,16
    ),
    new THREE.MeshStandardMaterial({
      color:0xe6a27d
    })
  );

  enemyHead.position.y=3.15;

  enemy.add(enemyHead);


  enemy.position.set(
    x,0,z
  );

  sceneAdd(enemy);


  const data={

    object:enemy,

    body:enemyBody,

    head:enemyHead,

    hp:100,

    alive:true

  };

  enemy.userData.enemy=data;

  enemyBody.userData.enemy=data;

  enemyHead.userData.enemy=data;

  enemies.push(data);
}


function sceneAdd(object){

  window.gameScene.add(object);
}


// Create enemies

createEnemy(
  -6,
  -10
);

createEnemy(
  8,
  -12
);

createEnemy(
  15,
  5
);

createEnemy(
  -12,
  14
);


// ========================================
// DAMAGE NUMBER
// ========================================

function showDamage(
  position,
  amount
){

  messageElement.textContent=
  amount;

  messageElement.style.color=
  amount>=50
  ?"red"
  :"white";

  messageElement.style.top=
  "45%";

  setTimeout(
    ()=>{
      messageElement.textContent="";
    },
    350
  );
}


// ========================================
// FIRE
// ========================================

const fireButton =
document.getElementById(
  "fireButton"
);


function fire(){

  if(reloading)
    return;

  if(currentAmmo<=0){

    reload();

    return;
  }

  currentAmmo--;

  updateHUD();

  fireButton.classList.add(
    "active"
  );

  setTimeout(
    ()=>{
      fireButton.classList.remove(
        "active"
      );
    },
    80
  );


  // Ray from camera center

  const raycaster =
  new THREE.Raycaster();

  raycaster.setFromCamera(
    new THREE.Vector2(0,0),
    camera
  );


  const targets=[];

  enemies.forEach(
    enemy=>{

      if(!enemy.alive)
        return;

      targets.push(
        enemy.body,
        enemy.head
      );

    }
  );


  const hits =
  raycaster.intersectObjects(
    targets,
    true
  );


  if(hits.length>0){

    const hit=
    hits[0].object;

    const enemy=
    hit.userData.enemy;

    if(enemy){

      const isHead=
      hit===enemy.head;

      const weapon=
      weapons[weaponIndex];

      const damage=
      isHead
      ?weapon.headDamage
      :weapon.damage;

      enemy.hp-=damage;

      showDamage(
        enemy.object.position,
        damage
      );


      if(enemy.hp<=0){

        enemy.hp=0;

        enemy.alive=false;

        enemy.object.visible=false;

        score+=100;

        updateHUD();

      }
    }
  }
}


fireButton.addEventListener(
"touchstart",
e=>{

  e.preventDefault();

  firing=true;

  fire();

},
{passive:false}
);


fireButton.addEventListener(
"touchend",
e=>{

  e.preventDefault();

  firing=false;

},
{passive:false}
);


fireButton.addEventListener(
"touchcancel",
()=>{
  firing=false;
}
);


// ========================================
// AUTOMATIC FIRE
// ========================================

let lastFire=0;


function automaticFire(){

  if(!firing)
    return;

  const now=Date.now();

  const delay=
  weapons[weaponIndex].fireDelay;

  if(now-lastFire>=delay){

    fire();

    lastFire=now;
  }
}


// ========================================
// RELOAD
// ========================================

const reloadButton =
document.getElementById(
  "reloadButton"
);


function reload(){

  if(reloading)
    return;

  const weapon=
  weapons[weaponIndex];

  if(
    currentAmmo>=weapon.magazine ||
    reserveAmmo<=0
  )
    return;

  reloading=true;

  statusElement.textContent=
  "RELOADING...";

  setTimeout(
    ()=>{

      const needed=
      weapon.magazine-currentAmmo;

      const amount=
      Math.min(
        needed,
        reserveAmmo
      );

      currentAmmo+=amount;

      reserveAmmo-=amount;

      reloading=false;

      statusElement.textContent=
      "READY";

      updateHUD();

    },
    900
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


// ========================================
// GUN SWITCH
// ========================================

const gunButton =
document.getElementById(
  "gunButton"
);


function switchGun(){

  if(reloading)
    return;

  weaponIndex++;

  if(
    weaponIndex>=weapons.length
  )
    weaponIndex=0;

  const weapon=
  weapons[weaponIndex];

  currentAmmo=
  weapon.magazine;

  reserveAmmo=
  weapon.ammo;

  updateHUD();

  statusElement.textContent=
  weapon.name;

  setTimeout(
    ()=>{
      statusElement.textContent=
      "READY";
    },
    500
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


// ========================================
// PLAYER MOVEMENT
// ========================================

function updatePlayer(){

  const x=joystickX;

  const y=joystickY;

  const magnitude=
  Math.sqrt(x*x+y*y);

  state.moving=
  magnitude>.08;


  if(state.moving){

    const speed=
    state.running
    ?state.runSpeed
    :state.speed;


    const forwardX=
    -Math.sin(cameraYaw);

    const forwardZ=
    -Math.cos(cameraYaw);

    const rightX=
    Math.cos(cameraYaw);

    const rightZ=
    -Math.sin(cameraYaw);


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
    ?.30
    :.18;
  }
}


// ========================================
// JUMP PHYSICS
// ========================================

function updateJump(){

  if(!state.jumping)
    return;

  player.position.y+=
  state.velocityY;

  state.velocityY-=
  state.gravity;


  if(player.position.y<=0){

    player.position.y=0;

    state.velocityY=0;

    state.jumping=false;

  }
}


// ========================================
// WALK/RUN ANIMATION
// ========================================

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
  ?.7
  :.45;


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


// ========================================
// CAMERA
// ========================================

function updateCamera(){

  const target=
  new THREE.Vector3(
    player.position.x,
    player.position.y+2,
    player.position.z
  );


  const horizontal=
  Math.cos(cameraYaw)*
  cameraDistance;


  const depth=
  Math.sin(cameraYaw)*
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
// MAP LIMIT
// ========================================

function limitPlayer(){

  const limit=45;

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
// ENEMY AI
// ========================================

function updateEnemies(){

  enemies.forEach(
    enemy=>{

      if(!enemy.alive)
        return;


      const dx=
      player.position.x-
      enemy.object.position.x;

      const dz=
      player.position.z-
      enemy.object.position.z;

      const distance=
      Math.sqrt(
        dx*dx+dz*dz
      );


      // Enemy slowly follows player

      if(
        distance>4 &&
        distance<30
      ){

        enemy.object.position.x+=
        (dx/distance)*.018;

        enemy.object.position.z+=
        (dz/distance)*.018;

        enemy.object.rotation.y=
        Math.atan2(
          dx,
          dz
        );
      }


      // Enemy damages player

      if(distance<2.5){

        playerHP-=.03;

        if(playerHP<0)
          playerHP=0;

        updateHUD();

      }
    }
  );
}


// ========================================
// GAME LOOP
// ========================================

function gameLoop(){

  requestAnimationFrame(
    gameLoop
  );

  updatePlayer();

  updateJump();

  updateAnimation();

  updateEnemies();

  automaticFire();

  updateCamera();

  limitPlayer();

  updateHUD();


  if(playerHP<=0){

    statusElement.textContent=
    "MISSION FAILED";

  }
}


updateHUD();

gameLoop();