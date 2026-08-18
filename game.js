// ======================================================
// LAWANG MOBILE 3D
// COMPLETE MOBILE GAME CONTROLLER
// ======================================================

const THREE = window.THREE;

const player = window.gamePlayer;
const camera = window.gameCamera;

const parts = window.gameParts;

const leftLeg = parts.leftLeg;
const rightLeg = parts.rightLeg;
const leftArm = parts.leftArm;
const rightArm = parts.rightArm;

const scene = window.gameScene;

// ======================================================
// GAME STATE
// ======================================================

const state = {
  hp: 100,

  ammo: 30,
  maxAmmo: 30,

  weaponIndex: 0,

  weapons: [
    {
      name: "PISTOL",
      damage: 25,
      fireDelay: 350
    },
    {
      name: "RIFLE",
      damage: 15,
      fireDelay: 120
    },
    {
      name: "SHOTGUN",
      damage: 40,
      fireDelay: 600
    }
  ],

  firing: false,
  reloading: false,

  jumping: false,
  crouching: false,
  running: false,
  moving: false,

  jumpVelocity: 0,

  animation: 0,

  score: 0
};

// ======================================================
// UI
// ======================================================

const hudWeapon =
  document.getElementById("weapon");

const hudHP =
  document.getElementById("hp");

const hudScore =
  document.getElementById("score");

const status =
  document.getElementById("status");

function updateHUD() {

  if (hudWeapon) {
    hudWeapon.textContent =
      state.weapons[state.weaponIndex].name +
      " | " +
      state.ammo;
  }

  if (hudHP) {
    hudHP.textContent =
      state.hp;
  }

  if (hudScore) {
    hudScore.textContent =
      state.score;
  }
}

// ======================================================
// JOYSTICK
// ======================================================

const joystick =
  document.getElementById("joystick");

const joystickKnob =
  document.getElementById(
    "joystickKnob"
  );

let joystickX = 0;
let joystickY = 0;

let joystickActive = false;

const maxDistance = 39;

function setJoystick(x, y) {

  const rect =
    joystick.getBoundingClientRect();

  const centerX =
    rect.left +
    rect.width / 2;

  const centerY =
    rect.top +
    rect.height / 2;

  let dx =
    x - centerX;

  let dy =
    y - centerY;

  const distance =
    Math.sqrt(
      dx * dx +
      dy * dy
    );

  if (
    distance > maxDistance
  ) {

    dx =
      dx / distance *
      maxDistance;

    dy =
      dy / distance *
      maxDistance;
  }

  joystickKnob.style.transform =
    `translate(${dx}px,${dy}px)`;

  joystickX =
    dx / maxDistance;

  joystickY =
    dy / maxDistance;
}

function resetJoystick() {

  joystickActive = false;

  joystickX = 0;
  joystickY = 0;

  joystickKnob.style.transform =
    "translate(0px,0px)";
}

joystick.addEventListener(
  "touchstart",
  event => {

    event.preventDefault();

    joystickActive = true;

    const touch =
      event.touches[0];

    setJoystick(
      touch.clientX,
      touch.clientY
    );
  },
  {
    passive: false
  }
);

joystick.addEventListener(
  "touchmove",
  event => {

    if (!joystickActive)
      return;

    event.preventDefault();

    const touch =
      event.touches[0];

    setJoystick(
      touch.clientX,
      touch.clientY
    );
  },
  {
    passive: false
  }
);

joystick.addEventListener(
  "touchend",
  event => {

    event.preventDefault();

    resetJoystick();
  },
  {
    passive: false
  }
);

joystick.addEventListener(
  "touchcancel",
  resetJoystick
);

// ======================================================
// CREATE MOBILE BUTTON
// ======================================================

function createGameButton(
  id,
  text,
  css
) {

  let old =
    document.getElementById(id);

  if (old) {
    old.remove();
  }

  const button =
    document.createElement("div");

  button.id = id;

  button.textContent = text;

  button.style.position =
    "fixed";

  button.style.width =
    css.width || "68px";

  button.style.height =
    css.height || "68px";

  button.style.right =
    css.right || "auto";

  button.style.left =
    css.left || "auto";

  button.style.bottom =
    css.bottom || "auto";

  button.style.top =
    css.top || "auto";

  button.style.borderRadius =
    "50%";

  button.style.border =
    "2px solid rgba(255,255,255,0.5)";

  button.style.background =
    css.background ||
    "rgba(255,255,255,0.15)";

  button.style.color =
    "white";

  button.style.display =
    "flex";

  button.style.alignItems =
    "center";

  button.style.justifyContent =
    "center";

  button.style.fontWeight =
    "bold";

  button.style.fontSize =
    css.fontSize || "13px";

  button.style.zIndex =
    "500";

  button.style.touchAction =
    "none";

  button.style.userSelect =
    "none";

  document.body.appendChild(
    button
  );

  return button;
}

// ======================================================
// BUTTONS
// ======================================================

const fireButton =
  createGameButton(
    "lawangFire",
    "FIRE",
    {
      right: "25px",
      bottom: "45px",
      width: "92px",
      height: "92px",
      background:
        "rgba(220,40,40,0.45)",
      fontSize: "17px"
    }
  );

const jumpButton =
  createGameButton(
    "lawangJump",
    "JUMP",
    {
      right: "130px",
      bottom: "45px"
    }
  );

const reloadButton =
  createGameButton(
    "lawangReload",
    "RELOAD",
    {
      right: "145px",
      bottom: "125px",
      width: "62px",
      height: "62px",
      fontSize: "10px"
    }
  );

const gunButton =
  createGameButton(
    "lawangGun",
    "GUN",
    {
      right: "35px",
      bottom: "155px",
      fontSize: "12px"
    }
  );

const crouchButton =
  createGameButton(
    "lawangCrouch",
    "CROUCH",
    {
      right: "220px",
      bottom: "45px",
      width: "60px",
      height: "60px",
      fontSize: "10px"
    }
  );

const runButton =
  document.getElementById(
    "runButton"
  );

// ======================================================
// FIRE
// ======================================================

function fire() {

  if (state.reloading)
    return;

  if (state.ammo <= 0) {

    reload();

    return;
  }

  if (state.firing)
    return;

  state.firing = true;

  state.ammo--;

  updateHUD();

  // weapon kick

  player.rotation.x =
    -0.04;

  setTimeout(() => {

    player.rotation.x =
      0;

  }, 80);

  // shooting animation

  leftArm.rotation.x =
    -0.8;

  rightArm.rotation.x =
    -0.8;

  setTimeout(() => {

    leftArm.rotation.x = 0;
    rightArm.rotation.x = 0;

  }, 100);

  // find enemy

  shootEnemy();

  setTimeout(() => {

    state.firing = false;

  }, state.weapons[
    state.weaponIndex
  ].fireDelay);
}

// ======================================================
// ENEMY SYSTEM
// ======================================================

const enemies = [];

function createEnemy(
  x,
  z
) {

  const enemy =
    new THREE.Group();

  const material =
    new THREE.MeshStandardMaterial({
      color: 0xd93636
    });

  const enemyBody =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.9,
        1.6,
        0.55
      ),
      material
    );

  enemyBody.position.y =
    1.8;

  enemy.add(
    enemyBody
  );

  const enemyHead =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.4,
        16,
        16
      ),
      new THREE.MeshStandardMaterial({
        color: 0xe0a078
      })
    );

  enemyHead.position.y =
    3;

  enemy.add(
    enemyHead
  );

  enemy.position.set(
    x,
    0,
    z
  );

  enemy.userData.hp =
    100;

  enemy.userData.alive =
    true;

  scene.add(
    enemy
  );

  enemies.push(
    enemy
  );
}

createEnemy(
  8,
  -10
);

createEnemy(
  -10,
  -15
);

createEnemy(
  15,
  12
);

createEnemy(
  -18,
  10
);

// ======================================================
// SHOOT ENEMY
// ======================================================

function shootEnemy() {

  let closest = null;

  let closestDistance =
    Infinity;

  for (
    const enemy of enemies
  ) {

    if (
      !enemy.userData.alive
    )
      continue;

    const distance =
      player.position.distanceTo(
        enemy.position
      );

    if (
      distance <
      closestDistance
    ) {

      closestDistance =
        distance;

      closest =
        enemy;
    }
  }

  if (
    !closest ||
    closestDistance > 30
  )
    return;

  const damage =
    state.weapons[
      state.weaponIndex
    ].damage;

  closest.userData.hp -=
    damage;

  if (
    closest.userData.hp <= 0
  ) {

    closest.userData.alive =
      false;

    closest.visible =
      false;

    state.score +=
      100;

    updateHUD();

  } else {

    closest.scale.set(
      1.15,
      1.15,
      1.15
    );

    setTimeout(() => {

      closest.scale.set(
        1,
        1,
        1
      );

    }, 100);
  }
}

// ======================================================
// RELOAD
// ======================================================

function reload() {

  if (
    state.reloading ||
    state.ammo === state.maxAmmo
  )
    return;

  state.reloading =
    true;

  if (status) {
    status.textContent =
      "RELOADING...";
  }

  setTimeout(() => {

    state.ammo =
      state.maxAmmo;

    state.reloading =
      false;

    updateHUD();

    if (status) {
      status.textContent =
        "READY";
    }

  }, 1200);
}

// ======================================================
// WEAPON SWITCH
// ======================================================

function switchWeapon() {

  if (state.reloading)
    return;

  state.weaponIndex++;

  if (
    state.weaponIndex >=
    state.weapons.length
  ) {

    state.weaponIndex = 0;
  }

  updateHUD();

  if (status) {

    status.textContent =
      state.weapons[
        state.weaponIndex
      ].name;
  }

  setTimeout(() => {

    if (status)
      status.textContent =
        "READY";

  }, 700);
}

// ======================================================
// JUMP
// ======================================================

function jump() {

  if (state.jumping)
    return;

  state.jumping =
    true;

  state.jumpVelocity =
    0.18;
}

// ======================================================
// JUMP PHYSICS
// ======================================================

function updateJump() {

  if (
    !state.jumping
  )
    return;

  player.position.y +=
    state.jumpVelocity;

  state.jumpVelocity -=
    0.012;

  if (
    player.position.y <= 0
  ) {

    player.position.y =
      0;

    state.jumpVelocity =
      0;

    state.jumping =
      false;
  }
}

// ======================================================
// CROUCH
// ======================================================

function toggleCrouch() {

  state.crouching =
    !state.crouching;

  if (
    state.crouching
  ) {

    player.scale.y =
      0.65;

    crouchButton.style.background =
      "rgba(35,136,255,0.7)";

  } else {

    player.scale.y =
      1;

    crouchButton.style.background =
      "rgba(255,255,255,0.15)";
  }
}

// ======================================================
// RUN
// ======================================================

function startRun(
  event
) {

  event.preventDefault();

  state.running =
    true;

  if (runButton) {

    runButton.style.background =
      "rgba(35,136,255,0.75)";
  }
}

function stopRun(
  event
) {

  event.preventDefault();

  state.running =
    false;

  if (runButton) {

    runButton.style.background =
      "rgba(35,136,255,0.35)";
  }
}

if (runButton) {

  runButton.addEventListener(
    "touchstart",
    startRun,
    {
      passive: false
    }
  );

  runButton.addEventListener(
    "touchend",
    stopRun,
    {
      passive: false
    }
  );

  runButton.addEventListener(
    "touchcancel",
    stopRun,
    {
      passive: false
    }
  );
}

// ======================================================
// BUTTON TOUCH HELPERS
// ======================================================

function pressButton(
  button,
  action
) {

  button.addEventListener(
    "touchstart",
    event => {

      event.preventDefault();

      action();

    },
    {
      passive: false
    }
  );

  button.addEventListener(
    "click",
    event => {

      event.preventDefault();

      action();

    }
  );
}

pressButton(
  fireButton,
  fire
);

pressButton(
  jumpButton,
  jump
);

pressButton(
  reloadButton,
  reload
);

pressButton(
  gunButton,
  switchWeapon
);

pressButton(
  crouchButton,
  toggleCrouch
);

// ======================================================
// CAMERA
// ======================================================

const cameraArea =
  document.getElementById(
    "cameraArea"
  );

let cameraTouch =
  null;

let cameraYaw =
  0;

let cameraPitch =
  0.35;

const cameraDistance =
  7;

const cameraHeight =
  3.8;

if (cameraArea) {

  cameraArea.addEventListener(
    "touchstart",
    event => {

      if (
        event.touches.length !== 1
      )
        return;

      const touch =
        event.touches[0];

      cameraTouch = {
        x: touch.clientX,
        y: touch.clientY
      };

    },
    {
      passive: true
    }
  );

  cameraArea.addEventListener(
    "touchmove",
    event => {

      if (!cameraTouch)
        return;

      const touch =
        event.touches[0];

      const dx =
        touch.clientX -
        cameraTouch.x;

      const dy =
        touch.clientY -
        cameraTouch.y;

      cameraYaw -=
        dx * 0.008;

      cameraPitch -=
        dy * 0.004;

      cameraPitch =
        Math.max(
          0.05,
          Math.min(
            0.8,
            cameraPitch
          )
        );

      cameraTouch.x =
        touch.clientX;

      cameraTouch.y =
        touch.clientY;
    },
    {
      passive: true
    }
  );

  cameraArea.addEventListener(
    "touchend",
    () => {

      cameraTouch =
        null;

    }
  );
}

// ======================================================
// CAMERA UPDATE
// ======================================================

function updateCamera() {

  const target =
    new THREE.Vector3(
      player.position.x,
      player.position.y + 2,
      player.position.z
    );

  const horizontal =
    Math.cos(cameraYaw) *
    cameraDistance;

  const depth =
    Math.sin(cameraYaw) *
    cameraDistance;

  camera.position.x =
    player.position.x +
    horizontal;

  camera.position.z =
    player.position.z +
    depth;

  camera.position.y =
    player.position.y +
    cameraHeight +
    cameraPitch * 2;

  camera.lookAt(
    target
  );
}

// ======================================================
// PLAYER MOVEMENT
// ======================================================

function updatePlayer() {

  const inputX =
    joystickX;

  const inputY =
    joystickY;

  const magnitude =
    Math.sqrt(
      inputX * inputX +
      inputY * inputY
    );

  state.moving =
    magnitude > 0.08;

  if (
    !state.moving
  )
    return;

  let speed =
    state.running
      ? 0.11
      : 0.055;

  if (
    state.crouching
  ) {

    speed *=
      0.5;
  }

  const forwardX =
    -Math.sin(cameraYaw);

  const forwardZ =
    -Math.cos(cameraYaw);

  const rightX =
    Math.cos(cameraYaw);

  const rightZ =
    -Math.sin(cameraYaw);

  let moveX =
    forwardX * -inputY +
    rightX * inputX;

  let moveZ =
    forwardZ * -inputY +
    rightZ * inputX;

  const length =
    Math.sqrt(
      moveX * moveX +
      moveZ * moveZ
    );

  if (
    length > 0
  ) {

    moveX /=
      length;

    moveZ /=
      length;
  }

  player.position.x +=
    moveX * speed;

  player.position.z +=
    moveZ * speed;

  // Character faces movement

  player.rotation.y =
    Math.atan2(
      moveX,
      moveZ
    );

  state.animation +=
    state.running
      ? 0.30
      : 0.18;
}

// ======================================================
// WALK / RUN ANIMATION
// ======================================================

function updateAnimation() {

  if (
    !state.moving
  ) {

    leftLeg.rotation.x *=
      0.8;

    rightLeg.rotation.x *=
      0.8;

    leftArm.rotation.x *=
      0.8;

    rightArm.rotation.x *=
      0.8;

    return;
  }

  const amount =
    state.running
      ? 0.75
      : 0.45;

  const swing =
    Math.sin(
      state.animation
    ) * amount;

  leftLeg.rotation.x =
    swing;

  rightLeg.rotation.x =
    -swing;

  leftArm.rotation.x =
    -swing * 0.7;

  rightArm.rotation.x =
    swing * 0.7;
}

// ======================================================
// MAP LIMIT
// ======================================================

function limitPlayer() {

  const limit =
    45;

  player.position.x =
    Math.max(
      -limit,
      Math.min(
        limit,
        player.position.x
      )
    );

  player.position.z =
    Math.max(
      -limit,
      Math.min(
        limit,
        player.position.z
      )
    );
}

// ======================================================
// ENEMY SIMPLE MOVEMENT
// ======================================================

function updateEnemies() {

  for (
    const enemy of enemies
  ) {

    if (
      !enemy.userData.alive
    )
      continue;

    const distance =
      enemy.position.distanceTo(
        player.position
      );

    if (
      distance < 18 &&
      distance > 2
    ) {

      const direction =
        new THREE.Vector3()
          .subVectors(
            player.position,
            enemy.position
          )
          .normalize();

      enemy.position.x +=
        direction.x * 0.01;

      enemy.position.z +=
        direction.z * 0.01;

      enemy.lookAt(
        player.position.x,
        enemy.position.y,
        player.position.z
      );
    }
  }
}

// ======================================================
// GAME UPDATE
// ======================================================

function updateGame() {

  updatePlayer();

  updateAnimation();

  updateJump();

  updateEnemies();

  limitPlayer();

  updateCamera();

  updateHUD();

  if (status) {

    if (
      state.reloading
    ) {

      status.textContent =
        "RELOADING...";

    } else if (
      state.running &&
      state.moving
    ) {

      status.textContent =
        "RUNNING";

    } else if (
      state.moving
    ) {

      status.textContent =
        "WALKING";

    } else if (
      state.jumping
    ) {

      status.textContent =
        "JUMP";

    } else {

      status.textContent =
        "READY";
    }
  }

  requestAnimationFrame(
    updateGame
  );
}

// ======================================================
// START
// ======================================================

updateHUD();

updateGame();

console.log(
  "LAWANG MOBILE 3D CONTROLLER READY"
);