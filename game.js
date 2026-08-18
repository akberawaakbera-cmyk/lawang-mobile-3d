// ==================================================
// LAWANG MOBILE 3D
// vNEXT
// LOBBY + CHARACTER + CITY + ENEMIES + MISSION
// JOYSTICK + CAMERA + RUN + JUMP + CROUCH
// FIRE + RELOAD + WEAPON SWITCH
// ==================================================
const THREE = window.THREE;
const scene = window.gameScene;
const camera = window.gameCamera;
const player = window.gamePlayer;
const parts = window.gameParts;
const leftLeg = parts.leftLeg;
const rightLeg = parts.rightLeg;
const leftArm = parts.leftArm;
const rightArm = parts.rightArm;
// ==================================================
// DOM
// ==================================================
const lobby =
document.getElementById("lobby");
const playButton =
document.getElementById("playButton");
const weaponLobby =
document.getElementById("weaponLobby");
const lobbyWeapon =
document.getElementById("lobbyWeapon");
const hud =
document.getElementById("hud");
const mission =
document.getElementById("mission");
const joystick =
document.getElementById("joystick");
const knob =
document.getElementById("joystickKnob");
const runButton =
document.getElementById("runButton");
const jumpButton =
document.getElementById("jumpButton");
const fireButton =
document.getElementById("fireButton");
const reloadButton =
document.getElementById("reloadButton");
const gunButton =
document.getElementById("gunButton");
const crouchButton =
document.getElementById("crouchButton");
const message =
document.getElementById("message");
const complete =
document.getElementById("missionComplete");
const finalScore =
document.getElementById("finalScore");
const backLobby =
document.getElementById("backLobby");
// ==================================================
// WEAPONS
// ==================================================
const weapons = [
  {
    name:"PISTOL",
    damage:25,
    magazine:12,
    delay:350
  },
  {
    name:"RIFLE",
    damage:15,
    magazine:30,
    delay:120
  },
  {
    name:"SHOTGUN",
    damage:40,
    magazine:6,
    delay:650
  }
];
let weaponIndex=0;
let ammo=weapons[0].magazine;
// ==================================================
// PLAYER STATE
// ==================================================
const state = {
  hp:100,
  score:0,
  moving:false,
  running:false,
  crouching:false,
  jumping:false,
  velocityY:0,
  animation:0,
  reloading:false,
  lastShot:0,
  gameStarted:false
};
// ==================================================
// JOYSTICK
// ==================================================
let joystickX=0;
let joystickY=0;
let joystickActive=false;
const maxDistance=40;
function updateJoystick(
  clientX,
  clientY
){
  const rect =
  joystick.getBoundingClientRect();
  const centerX =
  rect.left+
  rect.width/2;
  const centerY =
  rect.top+
  rect.height/2;
  let dx=
    clientX-centerX;
  let dy=
    clientY-centerY;
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
  joystickX=
    dx/maxDistance;
  joystickY=
    dy/maxDistance;
  knob.style.transform=
    `translate(${dx}px,${dy}px)`;
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
  event=>{
    event.preventDefault();
    joystickActive=true;
    const t=
      event.touches[0];
    updateJoystick(
      t.clientX,
      t.clientY
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
    const t=
      event.touches[0];
    updateJoystick(
      t.clientX,
      t.clientY
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
// ==================================================
// CAMERA
// ==================================================
let cameraYaw=0;
let cameraPitch=.28;
let cameraTouch=null;
window.addEventListener(
  "touchstart",
  event=>{
    if(!state.gameStarted)
      return;
    if(event.touches.length!==1)
      return;
    const target=
      event.target;
    if(
      target===joystick ||
      target.closest(".gameButton")
    ){
      return;
    }
    const t=
      event.touches[0];
    cameraTouch={
      x:t.clientX,
      y:t.clientY
    };
  },
  {passive:true}
);
window.addEventListener(
  "touchmove",
  event=>{
    if(!cameraTouch)
      return;
    const t=
      event.touches[0];
    const dx=
      t.clientX-
      cameraTouch.x;
    const dy=
      t.clientY-
      cameraTouch.y;
    cameraYaw-=
      dx*.006;
    cameraPitch-=
      dy*.004;
    cameraPitch=
      Math.max(
        .05,
        Math.min(
          .75,
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
// ==================================================
// CAMERA UPDATE
// ==================================================
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
// ==================================================
// MOVEMENT
// ==================================================
function updateMovement(){
  const magnitude=
    Math.sqrt(
      joystickX*joystickX+
      joystickY*joystickY
    );
  state.moving=
    magnitude>.08;
  if(!state.moving)
    return;
  let speed=
    state.running
      ? .115
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
    forwardX*(-joystickY)+
    rightX*joystickX;
  let moveZ=
    forwardZ*(-joystickY)+
    rightZ*joystickX;
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
      ? .32
      : .20;
}
// ==================================================
// RUN
// ==================================================
function runStart(event){
  event.preventDefault();
  state.running=true;
  runButton.style.background=
    "rgba(35,136,255,.75)";
}
function runStop(event){
  event.preventDefault();
  state.running=false;
  runButton.style.background=
    "rgba(255,255,255,.15)";
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
// ==================================================
// JUMP
// ==================================================
function jump(){
  if(state.jumping)
    return;
  state.jumping=true;
  state.velocityY=.18;
}
jumpButton.addEventListener(
  "touchstart",
  event=>{
    event.preventDefault();
    jump();
  },
  {passive:false}
);
function updateJump(){
  if(!state.jumping)
    return;
  player.position.y+=
    state.velocityY;
  state.velocityY-=.012;
  if(
    player.position.y<=0
  ){
    player.position.y=0;
    state.velocityY=0;
    state.jumping=false;
  }
}
// ==================================================
// CROUCH
// ==================================================
function crouchStart(event){
  event.preventDefault();
  state.crouching=true;
  player.scale.y=.65;
}
function crouchStop(event){
  event.preventDefault();
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
// ==================================================
// ANIMATION
// ==================================================
function updateAnimation(){
  if(!state.moving){
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
// ==================================================
// WEAPON SWITCH
// ==================================================
function updateWeaponUI(){
  const weapon=
    weapons[weaponIndex];
  document.getElementById(
    "weapon"
  ).textContent=
    weapon.name;
  document.getElementById(
    "ammo"
  ).textContent=
    ammo;
  lobbyWeapon.textContent=
    weapon.name;
}
function switchWeapon(){
  if(state.reloading)
    return;
  weaponIndex++;
  if(
    weaponIndex>=
    weapons.length
  ){
    weaponIndex=0;
  }
  ammo=
    weapons[
      weaponIndex
    ].magazine;
  showMessage(
    weapons[
      weaponIndex
    ].name
  );
  updateWeaponUI();
}
gunButton.addEventListener(
  "touchstart",
  event=>{
    event.preventDefault();
    switchWeapon();
  },
  {passive:false}
);
weaponLobby.addEventListener(
  "click",
  switchWeapon
);
// ==================================================
// RELOAD
// ==================================================
function reload(){
  if(state.reloading)
    return;
  const weapon=
    weapons[weaponIndex];
  if(ammo>=weapon.magazine)
    return;
  state.reloading=true;
  showMessage(
    "RELOADING..."
  );
  setTimeout(
    ()=>{
      ammo=
        weapon.magazine;
      state.reloading=false;
      showMessage(
        "READY"
      );
      updateWeaponUI();
    },
    1000
  );
}
reloadButton.addEventListener(
  "touchstart",
  event=>{
    event.preventDefault();
    reload();
  },
  {passive:false}
);
// ==================================================
// ENEMY
// ==================================================
const enemies=[];
function createEnemy(
  x,
  z
){
  const enemy=
    new THREE.Group();
  const enemyBody=
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1,
        1.7,
        .6
      ),
      new THREE.MeshStandardMaterial({
        color:0xd93636
      })
    );
  enemyBody.position.y=2;
  enemy.add(enemyBody);
  const enemyHead=
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
  enemyHead.position.y=3.15;
  enemy.add(enemyHead);
  enemy.position.set(
    x,0,z
  );
  enemy.userData.hp=100;
  enemy.userData.alive=true;
  scene.add(enemy);
  enemies.push(enemy);
}
function spawnEnemies(){
  enemies.forEach(
    enemy=>{
      scene.remove(enemy);
    }
  );
  enemies.length=0;
  createEnemy(12,12);
  createEnemy(-12,15);
  createEnemy(15,-15);
  createEnemy(-15,-12);
  createEnemy(25,0);
}
// ==================================================
// FIRE
// ==================================================
function fire(){
  if(
    !state.gameStarted ||
    state.reloading
  )
    return;
  const now=
    Date.now();
  const weapon=
    weapons[weaponIndex];
  if(
    now-state.lastShot<
    weapon.delay
  )
    return;
  state.lastShot=now;
  if(ammo<=0){
    showMessage(
      "RELOAD!"
    );
    return;
  }
  ammo--;
  let target=null;
  let closest=Infinity;
  enemies.forEach(
    enemy=>{
      if(
        !enemy.userData.alive
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
        distance<closest
      ){
        closest=distance;
        target=enemy;
      }
    }
  );
  if(
    target &&
    closest<22
  ){
    target.userData.hp-=
      weapon.damage;
    if(
      target.userData.hp<=0
    ){
      target.userData.hp=0;
      target.userData.alive=false;
      target.visible=false;
      state.score+=100;
      showMessage(
        "ENEMY DOWN +100"
      );
    }else{
      showMessage(
        "HIT -"+
        weapon.damage
      );
    }
  }
  updateHUD();
  checkMission();
}
// ==================================================
// FIRE BUTTON
// ==================================================
fireButton.addEventListener(
  "touchstart",
  event=>{
    event.preventDefault();
    fire();
  },
  {passive:false}
);
// ==================================================
// HUD
// ==================================================
function updateHUD(){
  document.getElementById(
    "hp"
  ).textContent=
    state.hp;
  document.getElementById(
    "score"
  ).textContent=
    state.score;
  updateWeaponUI();
}
// ==================================================
// MESSAGE
// ==================================================
let messageTimer=null;
function showMessage(text){
  message.textContent=text;
  message.style.display=
    "block";
  clearTimeout(
    messageTimer
  );
  messageTimer=
    setTimeout(
      ()=>{
        message.style.display=
          "none";
      },
      1000
    );
}
// ==================================================
// MISSION
// ==================================================
function checkMission(){
  const alive=
    enemies.filter(
      enemy=>
        enemy.userData.alive
    ).length;
  if(
    alive===0 &&
    state.gameStarted
  ){
    state.gameStarted=false;
    finalScore.textContent=
      state.score;
    complete.style.display=
      "flex";
  }
}
// ==================================================
// START GAME
// ==================================================
function startGame(){
  state.gameStarted=true;
  state.hp=100;
  state.score=0;
  weaponIndex=0;
  ammo=
    weapons[0].magazine;
  player.position.set(
    0,0,5
  );
  player.rotation.y=0;
  spawnEnemies();
  lobby.classList.add(
    "hidden"
  );
  hud.classList.remove(
    "hidden"
  );
  mission.classList.remove(
    "hidden"
  );
  joystick.classList.remove(
    "hidden"
  );
  runButton.classList.remove(
    "hidden"
  );
  jumpButton.classList.remove(
    "hidden"
  );
  reloadButton.classList.remove(
    "hidden"
  );
  gunButton.classList.remove(
    "hidden"
  );
  fireButton.classList.remove(
    "hidden"
  );
  crouchButton.classList.remove(
    "hidden"
  );
  document.getElementById(
    "crosshair"
  ).classList.remove(
    "hidden"
  );
  complete.style.display=
    "none";
  updateHUD();
}
// ==================================================
// BACK TO LOBBY
// ==================================================
backLobby.addEventListener(
  "click",
  ()=>{
    complete.style.display=
      "none";
    state.gameStarted=false;
    hud.classList.add(
      "hidden"
    );
    mission.classList.add(
      "hidden"
    );
    joystick.classList.add(
      "hidden"
    );
    runButton.classList.add(
      "hidden"
    );
    jumpButton.classList.add(
      "hidden"
    );
    reloadButton.classList.add(
      "hidden"
    );
    gunButton.classList.add(
      "hidden"
    );
    fireButton.classList.add(
      "hidden"
    );
    crouchButton.classList.add(
      "hidden"
    );
    document.getElementById(
      "crosshair"
    ).classList.add(
      "hidden"
    );
    lobby.classList.remove(
      "hidden"
    );
  }
);
// ==================================================
// PLAY BUTTON
// ==================================================
playButton.addEventListener(
  "click",
  startGame
);
// ==================================================
// MAP LIMIT
// ==================================================
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
// ==================================================
// MAIN LOOP
// ==================================================
function gameLoop(){
  if(state.gameStarted){
    updateMovement();
    updateJump();
    updateAnimation();
    limitPlayer();
    updateCamera();
  }
  requestAnimationFrame(
    gameLoop
  );
}
// ==================================================
// INITIALIZE
// ==================================================
updateHUD();
updateCamera();
gameLoop();