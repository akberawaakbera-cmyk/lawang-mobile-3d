// ========================================
// LAWANG MOBILE 3D
// PLAYER + JOYSTICK + RUN + CAMERA
// ========================================
const THREE = window.THREE;
const player = window.gamePlayer;
const camera = window.gameCamera;
const leftLeg = window.gameParts.leftLeg;
const rightLeg = window.gameParts.rightLeg;
const leftArm = window.gameParts.leftArm;
const rightArm = window.gameParts.rightArm;
// ========================================
// PLAYER SETTINGS
// ========================================
const playerState = {
  speed: 0.055,
  runSpeed: 0.11,
  running: false,
  moving: false,
  rotation: 0,
  animation: 0
};
// ========================================
// JOYSTICK
// ========================================
const joystick =
  document.getElementById("joystick");
const joystickKnob =
  document.getElementById(
    "joystickKnob"
  );
let joystickX = 0;
let joystickY = 0;
let joystickActive = false;
const joystickRadius = 70;
const knobRadius = 31;
const maxDistance = 39;
// ========================================
// JOYSTICK POSITION
// ========================================
function updateJoystick(
  clientX,
  clientY
) {
  const rect =
    joystick.getBoundingClientRect();
  const centerX =
    rect.left +
    rect.width / 2;
  const centerY =
    rect.top +
    rect.height / 2;
  let dx =
    clientX - centerX;
  let dy =
    clientY - centerY;
  const distance =
    Math.sqrt(
      dx * dx +
      dy * dy
    );
  if (
    distance >
    maxDistance
  ) {
    dx =
      dx / distance *
      maxDistance;
    dy =
      dy / distance *
      maxDistance;
  }
  joystickKnob.style.transform =
    `translate(${dx}px, ${dy}px)`;
  joystickX =
    dx / maxDistance;
  joystickY =
    dy / maxDistance;
}
// ========================================
// RESET JOYSTICK
// ========================================
function resetJoystick() {
  joystickActive =
    false;
  joystickX = 0;
  joystickY = 0;
  joystickKnob.style.transform =
    "translate(0px, 0px)";
}
// ========================================
// JOYSTICK TOUCH START
// ========================================
joystick.addEventListener(
  "touchstart",
  event => {
    event.preventDefault();
    joystickActive =
      true;
    const touch =
      event.touches[0];
    updateJoystick(
      touch.clientX,
      touch.clientY
    );
  },
  {
    passive: false
  }
);
// ========================================
// JOYSTICK TOUCH MOVE
// ========================================
joystick.addEventListener(
  "touchmove",
  event => {
    if (!joystickActive) {
      return;
    }
    event.preventDefault();
    const touch =
      event.touches[0];
    updateJoystick(
      touch.clientX,
      touch.clientY
    );
  },
  {
    passive: false
  }
);
// ========================================
// JOYSTICK TOUCH END
// ========================================
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
// ========================================
// RUN BUTTON
// ========================================
const runButton =
  document.getElementById(
    "runButton"
  );
function startRun(event) {
  event.preventDefault();
  playerState.running =
    true;
  runButton.style.background =
    "rgba(35,136,255,0.75)";
}
function stopRun(event) {
  event.preventDefault();
  playerState.running =
    false;
  runButton.style.background =
    "rgba(35,136,255,0.35)";
}
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
// ========================================
// CAMERA
// ========================================
const cameraArea =
  document.getElementById(
    "cameraArea"
  );
let cameraTouch = null;
let cameraYaw = 0;
let cameraPitch = 0.35;
const cameraDistance = 7;
const cameraHeight = 3.8;
// ========================================
// CAMERA TOUCH START
// ========================================
cameraArea.addEventListener(
  "touchstart",
  event => {
    if (
      event.touches.length !== 1
    ) {
      return;
    }
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
// ========================================
// CAMERA TOUCH MOVE
// ========================================
cameraArea.addEventListener(
  "touchmove",
  event => {
    if (
      !cameraTouch
    ) {
      return;
    }
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
// ========================================
// CAMERA TOUCH END
// ========================================
cameraArea.addEventListener(
  "touchend",
  () => {
    cameraTouch =
      null;
  }
);
// ========================================
// UPDATE CAMERA
// ========================================
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
// ========================================
// PLAYER MOVEMENT
// ========================================
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
  playerState.moving =
    magnitude > 0.08;
  if (
    !playerState.moving
  ) {
    return;
  }
  const speed =
    playerState.running
      ? playerState.runSpeed
      : playerState.speed;
  // CAMERA RELATIVE MOVEMENT
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
  const moveLength =
    Math.sqrt(
      moveX * moveX +
      moveZ * moveZ
    );
  if (
    moveLength > 0
  ) {
    moveX /=
      moveLength;
    moveZ /=
      moveLength;
  }
  player.position.x +=
    moveX * speed;
  player.position.z +=
    moveZ * speed;
  // CHARACTER ROTATION
  player.rotation.y =
    Math.atan2(
      moveX,
      moveZ
    );
  // WALK ANIMATION
  playerState.animation +=
    playerState.running
      ? 0.28
      : 0.18;
}
// ========================================
// CHARACTER ANIMATION
// ========================================
function updateAnimation() {
  if (
    !playerState.moving
  ) {
    leftLeg.rotation.x = 0;
    rightLeg.rotation.x = 0;
    leftArm.rotation.x = 0;
    rightArm.rotation.x = 0;
    return;
  }
  const amount =
    playerState.running
      ? 0.65
      : 0.45;
  const swing =
    Math.sin(
      playerState.animation
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
// ========================================
// MAP BOUNDARIES
// ========================================
function limitPlayer() {
  const limit = 45;
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
// ========================================
// MAIN UPDATE
// ========================================
function updateGame() {
  updatePlayer();
  updateAnimation();
  limitPlayer();
  updateCamera();
  requestAnimationFrame(
    updateGame
  );
}
// ========================================
// START
// ========================================
updateGame();
// ========================================
// DEBUG
// ========================================
const status =
  document.getElementById(
    "status"
  );
function debugStatus() {
  if (!status) {
    return;
  }
  if (playerState.running) {
    status.textContent =
      "RUNNING";
  } else if (
    playerState.moving
  ) {
    status.textContent =
      "WALKING";
  } else {
    status.textContent =
      "READY";
  }
  requestAnimationFrame(
    debugStatus
  );
}
debugStatus();