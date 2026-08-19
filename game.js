/* =========================================================
   LAWANG MOBILE 3D — REVISED GAME.JS
   LAWANG CHARACTER + LOBBY + BATTLE + AIRCRAFT
   WEAPONS + FIRE + RELOAD + JUMP + CROUCH
   ENEMIES + PICKUPS + MOBILE CONTROLS
   ========================================================= */

(() => {
  "use strict";

  const THREE = window.THREE;
  const scene = window.gameScene;
  const camera = window.gameCamera;
  const renderer = window.gameRenderer;
  const player = window.gamePlayer;

  if (!THREE || !scene || !camera || !renderer || !player) {
    console.error("LAWANG: Game engine objects missing.");
    return;
  }

  /* =======================================================
     GAME STATE
     ======================================================= */

  const state = {
    phase: "LOBBY",

    hp: 100,
    score: 0,
    kills: 0,

    weaponIndex: 0,
    ammo: 12,
    reloading: false,

    firing: false,
    running: false,
    crouching: false,

    jumping: false,
    velocityY: 0,

    yaw: 0,
    pitch: 0.30,

    joystickX: 0,
    joystickY: 0,

    cameraTouch: null,
    joystickTouch: null,

    fireTimer: 0,
    animationTime: 0,

    aircraftTime: 0,
    canJumpFromAircraft: false,

    enemies: [],
    pickups: [],

    emote: "NONE",
    emoteTimer: 0,

    lastTime: performance.now()
  };

  /* =======================================================
     LAWANG CHARACTER
     ======================================================= */

  let lawangParts = {};

  function createLawangCharacter() {

    /* Remove old character children */
    while (player.children.length) {
      player.remove(player.children[0]);
    }

    lawangParts = {};

    const skinMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xc88968,
        roughness: 0.75
      });

    const jacketMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x111318,
        roughness: 0.55,
        metalness: 0.05
      });

    const pantsMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x090b0f,
        roughness: 0.7
      });

    const shoeMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x050505,
        roughness: 0.5
      });

    const hairMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x080808,
        roughness: 0.9
      });

    const eyeMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x4b2818,
        roughness: 0.3
      });

    /* BODY / JACKET */

    const body =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.92,
          1.35,
          0.52
        ),
        jacketMaterial
      );

    body.position.y = 1.65;
    player.add(body);

    lawangParts.body = body;

    /* NECK */

    const neck =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.16,
          0.16,
          0.25,
          12
        ),
        skinMaterial
      );

    neck.position.y = 2.42;
    player.add(neck);

    /* HEAD */

    const head =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.42,
          24,
          24
        ),
        skinMaterial
      );

    head.scale.set(
      0.95,
      1.08,
      0.95
    );

    head.position.y = 2.92;
    player.add(head);

    lawangParts.head = head;

    /* HAIR */

    const hair =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.435,
          24,
          16
        ),
        hairMaterial
      );

    hair.scale.set(
      1.02,
      0.58,
      1.02
    );

    hair.position.y = 3.18;
    player.add(hair);

    lawangParts.hair = hair;

    /* LEFT EYE */

    const leftEye =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.055,
          12,
          12
        ),
        eyeMaterial
      );

    leftEye.position.set(
      -0.16,
      2.98,
      -0.385
    );

    player.add(leftEye);

    /* RIGHT EYE */

    const rightEye =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.055,
          12,
          12
        ),
        eyeMaterial
      );

    rightEye.position.set(
      0.16,
      2.98,
      -0.385
    );

    player.add(rightEye);

    /* LEFT ARM */

    const leftArm =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.25,
          1.25,
          0.28
        ),
        jacketMaterial
      );

    leftArm.position.set(
      -0.65,
      1.68,
      0
    );

    player.add(leftArm);

    lawangParts.leftArm = leftArm;

    /* RIGHT ARM */

    const rightArm =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.25,
          1.25,
          0.28
        ),
        jacketMaterial
      );

    rightArm.position.set(
      0.65,
      1.68,
      0
    );

    player.add(rightArm);

    lawangParts.rightArm = rightArm;

    /* LEFT LEG */

    const leftLeg =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.30,
          1.25,
          0.34
        ),
        pantsMaterial
      );

    leftLeg.position.set(
      -0.23,
      0.62,
      0
    );

    player.add(leftLeg);

    lawangParts.leftLeg = leftLeg;

    /* RIGHT LEG */

    const rightLeg =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.30,
          1.25,
          0.34
        ),
        pantsMaterial
      );

    rightLeg.position.set(
      0.23,
      0.62,
      0
    );

    player.add(rightLeg);

    lawangParts.rightLeg = rightLeg;

    /* LEFT SHOE */

    const leftShoe =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.38,
          0.20,
          0.62
        ),
        shoeMaterial
      );

    leftShoe.position.set(
      -0.23,
      0.08,
      -0.08
    );

    player.add(leftShoe);

    /* RIGHT SHOE */

    const rightShoe =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.38,
          0.20,
          0.62
        ),
        shoeMaterial
      );

    rightShoe.position.set(
      0.23,
      0.08,
      -0.08
    );

    player.add(rightShoe);

    player.scale.set(
      1,
      1,
      1
    );

    player.visible = true;

    player.userData.character =
      "LAWANG";

    console.log(
      "LAWANG 3D CHARACTER CREATED"
    );
  }

  createLawangCharacter();

  /* =======================================================
     WEAPONS
     ======================================================= */

  const weapons = [
    {
      name: "PISTOL",
      magazine: 12,
      ammo: 12,
      bodyDamage: 25,
      headDamage: 55,
      fireRate: 320,
      range: 60,
      color: 0x222222
    },
    {
      name: "RIFLE",
      magazine: 30,
      ammo: 30,
      bodyDamage: 18,
      headDamage: 42,
      fireRate: 110,
      range: 90,
      color: 0x111111
    },
    {
      name: "SHOTGUN",
      magazine: 6,
      ammo: 6,
      bodyDamage: 12,
      headDamage: 30,
      fireRate: 650,
      range: 30,
      color: 0x54351f
    }
  ];

  /* =======================================================
     HUD
     ======================================================= */

  function text(id, value) {

    const el =
      document.getElementById(id);

    if (el) {
      el.textContent = value;
    }
  }

  function updateHUD() {

    text(
      "hp",
      Math.max(
        0,
        Math.round(state.hp)
      )
    );

    text(
      "kills",
      state.kills
    );

    text(
      "score",
      state.score
    );

    text(
      "weapon",
      weapons[
        state.weaponIndex
      ].name
    );

    const ammo =
      document.getElementById(
        "ammo"
      );

    if (ammo) {

      ammo.textContent =
        state.reloading
          ? "RELOADING"
          : `${state.ammo}/${weapons[state.weaponIndex].magazine}`;
    }

    const status =
      document.getElementById(
        "status"
      );

    if (!status) {
      return;
    }

    if (
      state.phase === "LOBBY"
    ) {
      status.textContent =
        "LOBBY READY";
    }

    else if (
      state.phase === "AIRCRAFT"
    ) {
      status.textContent =
        "✈️ INSIDE AIRCRAFT — JUMP";
    }

    else if (
      state.phase === "BATTLE"
    ) {

      if (
        player.position.y > 3
      ) {
        status.textContent =
          "🪂 FALLING";
      }

      else if (
        state.reloading
      ) {
        status.textContent =
          "RELOADING";
      }

      else if (
        state.running
      ) {
        status.textContent =
          "RUNNING";
      }

      else {
        status.textContent =
          "BATTLE READY";
      }
    }
  }

  /* =======================================================
     MOBILE BUTTON
     ======================================================= */

  function createButton(
    id,
    label,
    right,
    bottom
  ) {

    let button =
      document.getElementById(id);

    if (!button) {

      button =
        document.createElement(
          "button"
        );

      button.id = id;
      button.textContent =
        label;

      button.style.position =
        "fixed";

      button.style.right =
        right + "px";

      button.style.bottom =
        bottom + "px";

      button.style.width =
        "64px";

      button.style.height =
        "64px";

      button.style.borderRadius =
        "50%";

      button.style.border =
        "2px solid rgba(255,255,255,.55)";

      button.style.background =
        "rgba(0,0,0,.55)";

      button.style.color =
        "white";

      button.style.fontWeight =
        "bold";

      button.style.fontSize =
        "11px";

      button.style.zIndex =
        "500";

      button.style.touchAction =
        "none";

      document.body.appendChild(
        button
      );
    }

    return button;
  }

  const fireButton =
    createButton(
      "lawangFire",
      "FIRE",
      25,
      35
    );

  const jumpButton =
    createButton(
      "lawangJump",
      "JUMP",
      100,
      35
    );

  const gunButton =
    createButton(
      "lawangGun",
      "GUN",
      100,
      110
    );

  const reloadButton =
    createButton(
      "lawangReload",
      "RELOAD",
      175,
      110
    );

  const crouchButton =
    createButton(
      "lawangCrouch",
      "CROUCH",
      250,
      35
    );

  const emoteButton =
    createButton(
      "lawangEmote",
      "EMOTE",
      250,
      110
    );

  const startButton =
    createButton(
      "lawangStart",
      "START",
      25,
      110
    );

  const lobbyButton =
    createButton(
      "lawangLobby",
      "LOBBY",
      325,
      110
    );

  /* =======================================================
     CROSSHAIR
     ======================================================= */

  let crosshair =
    document.getElementById(
      "lawangCrosshair"
    );

  if (!crosshair) {

    crosshair =
      document.createElement(
        "div"
      );

    crosshair.id =
      "lawangCrosshair";

    crosshair.textContent =
      "+";

    crosshair.style.position =
      "fixed";

    crosshair.style.left =
      "50%";

    crosshair.style.top =
      "50%";

    crosshair.style.transform =
      "translate(-50%,-50%)";

    crosshair.style.color =
      "white";

    crosshair.style.fontSize =
      "30px";

    crosshair.style.zIndex =
      "400";

    crosshair.style.pointerEvents =
      "none";

    document.body.appendChild(
      crosshair
    );
  }

  /* =======================================================
     JOYSTICK
     ======================================================= */

  const joystick =
    document.getElementById(
      "joystick"
    );

  const knob =
    document.getElementById(
      "joystickKnob"
    ) ||
    document.getElementById(
      "knob"
    );

  function resetJoystick() {

    state.joystickX = 0;
    state.joystickY = 0;
    state.joystickTouch =
      null;

    if (knob) {
      knob.style.transform =
        "translate(0px,0px)";
    }
  }

  function updateJoystick(
    touch
  ) {

    if (!joystick) {
      return;
    }

    const rect =
      joystick.getBoundingClientRect();

    const centerX =
      rect.left +
      rect.width / 2;

    const centerY =
      rect.top +
      rect.height / 2;

    let x =
      touch.clientX -
      centerX;

    let y =
      touch.clientY -
      centerY;

    const max =
      Math.min(
        rect.width,
        rect.height
      ) * 0.32;

    const distance =
      Math.hypot(
        x,
        y
      );

    if (
      distance > max
    ) {

      x =
        x /
        distance *
        max;

      y =
        y /
        distance *
        max;
    }

    state.joystickX =
      x / max;

    state.joystickY =
      y / max;

    if (knob) {

      knob.style.transform =
        `translate(${x}px,${y}px)`;
    }
  }

  if (joystick) {

    joystick.addEventListener(
      "touchstart",
      event => {

        event.preventDefault();

        const touch =
          event.changedTouches[0];

        state.joystickTouch =
          touch.identifier;

        updateJoystick(
          touch
        );
      },
      { passive: false }
    );

    joystick.addEventListener(
      "touchmove",
      event => {

        event.preventDefault();

        for (
          const touch
          of event.changedTouches
        ) {

          if (
            touch.identifier ===
            state.joystickTouch
          ) {

            updateJoystick(
              touch
            );
          }
        }
      },
      { passive: false }
    );

    ["touchend","touchcancel"]
      .forEach(type => {

        joystick.addEventListener(
          type,
          event => {

            for (
              const touch
              of event.changedTouches
            ) {

              if (
                touch.identifier ===
                state.joystickTouch
              ) {

                resetJoystick();
              }
            }
          },
          { passive: false }
        );
      });
  }

  /* =======================================================
     CAMERA
     ======================================================= */

  const cameraArea =
    document.getElementById(
      "cameraArea"
    );

  const cameraTarget =
    cameraArea ||
    document.body;

  cameraTarget.addEventListener(
    "touchstart",
    event => {

      if (
        event.target.closest &&
        event.target.closest(
          "#joystick,button"
        )
      ) {
        return;
      }

      if (
        event.touches.length !== 1
      ) {
        return;
      }

      const touch =
        event.touches[0];

      state.cameraTouch = {
        id:
          touch.identifier,
        x:
          touch.clientX,
        y:
          touch.clientY
      };
    },
    { passive: true }
  );

  cameraTarget.addEventListener(
    "touchmove",
    event => {

      if (
        !state.cameraTouch
      ) {
        return;
      }

      for (
        const touch
        of event.changedTouches
      ) {

        if (
          touch.identifier !==
          state.cameraTouch.id
        ) {
          continue;
        }

        const dx =
          touch.clientX -
          state.cameraTouch.x;

        const dy =
          touch.clientY -
          state.cameraTouch.y;

        state.yaw -=
          dx * 0.008;

        state.pitch -=
          dy * 0.004;

        state.pitch =
          THREE.MathUtils.clamp(
            state.pitch,
            0.05,
            0.85
          );

        state.cameraTouch.x =
          touch.clientX;

        state.cameraTouch.y =
          touch.clientY;
      }
    },
    { passive: true }
  );

  cameraTarget.addEventListener(
    "touchend",
    () => {
      state.cameraTouch =
        null;
    }
  );

  /* =======================================================
     BUTTON SYSTEM
     ======================================================= */

  function holdButton(
    button,
    down,
    up
  ) {

    button.addEventListener(
      "touchstart",
      event => {

        event.preventDefault();
        down();
      },
      { passive: false }
    );

    button.addEventListener(
      "touchend",
      event => {

        event.preventDefault();
        up();
      },
      { passive: false }
    );

    button.addEventListener(
      "touchcancel",
      event => {

        event.preventDefault();
        up();
      },
      { passive: false }
    );

    button.addEventListener(
      "mousedown",
      down
    );

    button.addEventListener(
      "mouseup",
      up
    );
  }

  holdButton(
    fireButton,
    () => {
      state.firing = true;
    },
    () => {
      state.firing = false;
    }
  );

  holdButton(
    jumpButton,
    () => jump(),
    () => {}
  );

  holdButton(
    crouchButton,
    () => {
      state.crouching = true;
    },
    () => {
      state.crouching = false;
    }
  );

  holdButton(
    gunButton,
    () => switchWeapon(),
    () => {}
  );

  holdButton(
    reloadButton,
    () => reload(),
    () => {}
  );

  holdButton(
    emoteButton,
    () => playEmote(),
    () => {}
  );

  holdButton(
    startButton,
    () => startMatch(),
    () => {}
  );

  holdButton(
    lobbyButton,
    () => enterLobby(),
    () => {}
  );

  /* =======================================================
     WEAPON MODEL
     ======================================================= */

  let weaponModel =
    null;

  function removeWeapon() {

    if (weaponModel) {

      player.remove(
        weaponModel
      );

      weaponModel =
        null;
    }
  }

  function createWeapon() {

    removeWeapon();

    const weapon =
      weapons[
        state.weaponIndex
      ];

    const group =
      new THREE.Group();

    const body =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          weapon.name ===
          "SHOTGUN"
            ? 0.22
            : 0.18,

          0.18,

          weapon.name ===
          "PISTOL"
            ? 0.55
            : 1.15
        ),

        new THREE.MeshStandardMaterial({
          color:
            weapon.color,
          metalness:
            0.7,
          roughness:
            0.3
        })
      );

    body.position.z =
      -0.25;

    group.add(
      body
    );

    const barrel =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.045,
          0.045,
          weapon.name ===
          "PISTOL"
            ? 0.45
            : 0.9,
          10
        ),

        new THREE.MeshStandardMaterial({
          color:
            0x111111,
          metalness:
            0.8
        })
      );

    barrel.rotation.x =
      Math.PI / 2;

    barrel.position.z =
      -0.75;

    group.add(
      barrel
    );

    const grip =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.14,
          0.4,
          0.14
        ),

        new THREE.MeshStandardMaterial({
          color:
            0x151515
        })
      );

    grip.position.set(
      0,
      -0.25,
      0.05
    );

    group.add(
      grip
    );

    group.position.set(
      0.48,
      1.85,
      -0.65
    );

    group.rotation.x =
      -0.15;

    player.add(
      group
    );

    weaponModel =
      group;
  }

  function switchWeapon() {

    if (
      state.reloading ||
      state.phase ===
      "AIRCRAFT"
    ) {
      return;
    }

    state.weaponIndex++;

    if (
      state.weaponIndex >=
      weapons.length
    ) {
      state.weaponIndex =
        0;
    }

    state.ammo =
      weapons[
        state.weaponIndex
      ].magazine;

    createWeapon();

    updateHUD();
  }

  /* =======================================================
     JUMP
     ======================================================= */

  function jump() {

    if (
      state.phase ===
      "AIRCRAFT"
    ) {

      dropFromAircraft();
      return;
    }

    if (
      state.phase !==
      "BATTLE"
    ) {
      return;
    }

    if (
      state.jumping ||
      player.position.y >
      0.05
    ) {
      return;
    }

    state.jumping =
      true;

    state.velocityY =
      7.5;
  }

  /* =======================================================
     RELOAD
     ======================================================= */

  function reload() {

    if (
      state.reloading ||
      state.phase !==
      "BATTLE"
    ) {
      return;
    }

    const weapon =
      weapons[
        state.weaponIndex
      ];

    if (
      state.ammo >=
      weapon.magazine
    ) {
      return;
    }

    state.reloading =
      true;

    updateHUD();

    setTimeout(
      () => {

        state.ammo =
          weapon.magazine;

        state.reloading =
          false;

        updateHUD();

      },
      900
    );
  }

  /* =======================================================
     MUZZLE FLASH
     ======================================================= */

  function muzzleFlash() {

    if (!weaponModel) {
      return;
    }

    const flash =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.14,
          8,
          8
        ),

        new THREE.MeshBasicMaterial({
          color:
            0xffcc33
        })
      );

    flash.position.z =
      -0.9;

    weaponModel.add(
      flash
    );

    setTimeout(
      () => {

        if (
          flash.parent
        ) {

          flash.parent.remove(
            flash
          );
        }
      },
      60
    );
  }

  /* =======================================================
     SHOOT
     ======================================================= */

  function shoot() {

    if (
      state.phase !==
      "BATTLE"
    ) {
      return;
    }

    if (
      state.reloading
    ) {
      return;
    }

    if (
      state.fireTimer >
      0
    ) {
      return;
    }

    const weapon =
      weapons[
        state.weaponIndex
      ];

    if (
      state.ammo <= 0
    ) {

      reload();
      return;
    }

    state.ammo--;

    state.fireTimer =
      weapon.fireRate;

    muzzleFlash();

    const direction =
      new THREE.Vector3();

    camera.getWorldDirection(
      direction
    );

    const ray =
      new THREE.Raycaster(
        camera.position.clone(),
        direction,
        0,
        weapon.range
      );

    const targets = [];

    for (
      const enemy
      of state.enemies
    ) {

      if (
        enemy.dead
      ) {
        continue;
      }

      targets.push(
        ...enemy.meshes
      );
    }

    const hits =
      ray.intersectObjects(
        targets,
        false
      );

    if (
      hits.length
    ) {

      const hit =
        hits[0].object;

      const enemy =
        hit.userData.enemy;

      if (enemy) {

        const damage =
          hit.userData.part ===
          "HEAD"
            ? weapon.headDamage
            : weapon.bodyDamage;

        enemy.hp -=
          damage;

        if (
          enemy.hp <= 0
        ) {

          killEnemy(
            enemy
          );
        }
      }
    }

    updateHUD();
  }

  /* =======================================================
     ENEMIES
     ======================================================= */

  function createEnemy(
    x,
    z
  ) {

    const group =
      new THREE.Group();

    const skin =
      new THREE.MeshStandardMaterial({
        color:
          0xd69b72
      });

    const clothes =
      new THREE.MeshStandardMaterial({
        color:
          0x9b2226
      });

    const body =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.8,
          1.4,
          0.55
        ),
        clothes
      );

    body.position.y =
      1.55;

    body.userData.part =
      "BODY";

    const head =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.36,
          16,
          16
        ),
        skin
      );

    head.position.y =
      2.55;

    head.userData.part =
      "HEAD";

    const leftLeg =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.22,
          1,
          0.25
        ),
        clothes
      );

    leftLeg.position.set(
      -0.22,
      0.5,
      0
    );

    const rightLeg =
      leftLeg.clone();

    rightLeg.position.x =
      0.22;

    group.add(
      body,
      head,
      leftLeg,
      rightLeg
    );

    group.position.set(
      x,
      0,
      z
    );

    scene.add(
      group
    );

    const enemy = {
      group,
      hp: 100,
      maxHP: 100,
      dead: false,
      meshes: [
        body,
        head,
        leftLeg,
        rightLeg
      ]
    };

    for (
      const mesh
      of enemy.meshes
    ) {

      mesh.userData.enemy =
        enemy;
    }

    state.enemies.push(
      enemy
    );
  }

  function spawnEnemies() {

    for (
      const enemy
      of state.enemies
    ) {

      scene.remove(
        enemy.group
      );
    }

    state.enemies = [];

    const locations = [
      [-18,-16],
      [18,-16],
      [-20,14],
      [20,14],
      [0,-24],
      [-28,0],
      [28,0],
      [0,25]
    ];

    for (
      const point
      of locations
    ) {

      createEnemy(
        point[0],
        point[1]
      );
    }
  }

  function killEnemy(
    enemy
  ) {

    if (
      enemy.dead
    ) {
      return;
    }

    enemy.dead =
      true;

    state.kills++;
    state.score +=
      100;

    enemy.group.visible =
      false;

    updateHUD();

    setTimeout(
      () => {

        enemy.hp =
          enemy.maxHP;

        enemy.dead =
          false;

        enemy.group.visible =
          true;

        enemy.group.position.set(
          THREE.MathUtils.randFloat(
            -35,
            35
          ),
          0,
          THREE.MathUtils.randFloat(
            -35,
            35
          )
        );

      },
      4000
    );
  }

  function updateEnemies(
    dt
  ) {

    if (
      state.phase !==
      "BATTLE"
    ) {
      return;
    }

    for (
      const enemy
      of state.enemies
    ) {

      if (
        enemy.dead
      ) {
        continue;
      }

      const dx =
        player.position.x -
        enemy.group.position.x;

      const dz =
        player.position.z -
        enemy.group.position.z;

      const distance =
        Math.hypot(
          dx,
          dz
        );

      if (
        distance > 4 &&
        distance < 35
      ) {

        enemy.group.position.x +=
          dx / distance *
          dt;

        enemy.group.position.z +=
          dz / distance *
          dt;

        enemy.group.rotation.y =
          Math.atan2(
            dx,
            dz
          );
      }
    }
  }

  /* =======================================================
     PICKUPS
     ======================================================= */

  function spawnPickups() {

    for (
      const pickup
      of state.pickups
    ) {

      scene.remove(
        pickup
      );
    }

    state.pickups = [];

    for (
      let i = 0;
      i < 10;
      i++
    ) {

      const pickup =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.5,
            0.25,
            0.7
          ),

          new THREE.MeshStandardMaterial({
            color:
              0xffcc22
          })
        );

      pickup.position.set(
        THREE.MathUtils.randFloat(
          -35,
          35
        ),
        0.3,
        THREE.MathUtils.randFloat(
          -35,
          35
        )
      );

      scene.add(
        pickup
      );

      state.pickups.push(
        pickup
      );
    }
  }

  function updatePickups() {

    for (
      const pickup
      of state.pickups
    ) {

      if (
        !pickup.visible
      ) {
        continue;
      }

      if (
        pickup.position.distanceTo(
          player.position
        ) < 1.5
      ) {

        pickup.visible =
          false;

        state.ammo =
          weapons[
            state.weaponIndex
          ].magazine;

        updateHUD();
      }
    }
  }

  /* =======================================================
     PLAYER MOVEMENT
     ======================================================= */

  function updatePlayer(
    dt
  ) {

    if (
      state.phase ===
      "AIRCRAFT"
    ) {
      return;
    }

    const magnitude =
      Math.hypot(
        state.joystickX,
        state.joystickY
      );

    const moving =
      magnitude > 0.08;

    const speed =
      (
        state.running
          ? 6
          : 3.4
      ) *
      (
        state.crouching
          ? 0.55
          : 1
      );

    if (moving) {

      const forwardX =
        -Math.sin(
          state.yaw
        );

      const forwardZ =
        -Math.cos(
          state.yaw
        );

      const rightX =
        Math.cos(
          state.yaw
        );

      const rightZ =
        -Math.sin(
          state.yaw
        );

      let moveX =
        forwardX *
        -state.joystickY +
        rightX *
        state.joystickX;

      let moveZ =
        forwardZ *
        -state.joystickY +
        rightZ *
        state.joystickX;

      const length =
        Math.hypot(
          moveX,
          moveZ
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
        moveX *
        speed *
        dt;

      player.position.z +=
        moveZ *
        speed *
        dt;

      player.rotation.y =
        Math.atan2(
          moveX,
          moveZ
        );

      state.animationTime +=
        dt *
        (
          state.running
            ? 13
            : 8
        );

      const swing =
        Math.sin(
          state.animationTime
        ) *
        (
          state.running
            ? 0.7
            : 0.45
        );

      if (
        lawangParts.leftLeg
      ) {
        lawangParts.leftLeg.rotation.x =
          swing;
      }

      if (
        lawangParts.rightLeg
      ) {
        lawangParts.rightLeg.rotation.x =
          -swing;
      }

      if (
        lawangParts.leftArm
      ) {
        lawangParts.leftArm.rotation.x =
          -swing * 0.7;
      }

      if (
        lawangParts.rightArm
      ) {
        lawangParts.rightArm.rotation.x =
          swing * 0.7;
      }

    } else {

      [
        "leftLeg",
        "rightLeg",
        "leftArm",
        "rightArm"
      ].forEach(
        name => {

          if (
            lawangParts[name]
          ) {

            lawangParts[name]
              .rotation.x *=
              0.82;
          }
        }
      );
    }

    /* JUMP */

    if (
      state.jumping ||
      player.position.y > 0
    ) {

      state.velocityY -=
        18 * dt;

      player.position.y +=
        state.velocityY * dt;

      if (
        player.position.y <= 0
      ) {

        player.position.y =
          0;

        state.velocityY =
          0;

        state.jumping =
          false;
      }
    }

    /* MAP LIMIT */

    player.position.x =
      THREE.MathUtils.clamp(
        player.position.x,
        -45,
        45
      );

    player.position.z =
      THREE.MathUtils.clamp(
        player.position.z,
        -45,
        45
      );
  }

  /* =======================================================
     CAMERA
     ======================================================= */

  function updateCamera(
    dt
  ) {

    const target =
      new THREE.Vector3(
        player.position.x,
        player.position.y +
        (
          state.crouching
            ? 1.3
            : 2
        ),
        player.position.z
      );

    let distance =
      state.crouching
        ? 5.3
        : 6.8;

    if (
      state.phase ===
      "AIRCRAFT"
    ) {
      distance = 7;
    }

    if (
      state.phase ===
      "BATTLE" &&
      player.position.y > 5
    ) {
      distance = 10;
    }

    const horizontal =
      Math.cos(
        state.yaw
      ) *
      distance;

    const depth =
      Math.sin(
        state.yaw
      ) *
      distance;

    const desired =
      new THREE.Vector3(
        player.position.x +
          horizontal,

        player.position.y +
          3.2 +
          state.pitch * 2,

        player.position.z +
          depth
      );

    const smooth =
      1 -
      Math.pow(
        0.001,
        dt
      );

    camera.position.lerp(
      desired,
      smooth
    );

    camera.lookAt(
      target
    );
  }

  /* =======================================================
     EMOTE
     ======================================================= */

  function playEmote() {

    if (
      state.phase !==
      "LOBBY"
    ) {
      return;
    }

    const emotes = [
      "WAVE",
      "DANCE",
      "VICTORY"
    ];

    state.emote =
      emotes[
        Math.floor(
          Math.random() *
          emotes.length
        )
      ];

    state.emoteTimer =
      2000;
  }

  function updateEmote(
    dt
  ) {

    if (
      state.emoteTimer <= 0
    ) {
      return;
    }

    state.emoteTimer -=
      dt * 1000;

    const time =
      performance.now() *
      0.01;

    if (
      state.emote ===
      "WAVE"
    ) {

      if (
        lawangParts.rightArm
      ) {

        lawangParts.rightArm
          .rotation.z =
          Math.sin(time) *
          0.8;
      }
    }

    if (
      state.emote ===
      "DANCE"
    ) {

      player.rotation.y +=
        dt * 3;
    }

    if (
      state.emote ===
      "VICTORY"
    ) {

      if (
        lawangParts.leftArm
      ) {

        lawangParts.leftArm
          .rotation.z =
          -1.2;
      }

      if (
        lawangParts.rightArm
      ) {

        lawangParts.rightArm
          .rotation.z =
          1.2;
      }
    }

    if (
      state.emoteTimer <= 0
    ) {

      state.emote =
        "NONE";

      if (
        lawangParts.leftArm
      ) {
        lawangParts.leftArm
          .rotation.z = 0;
      }

      if (
        lawangParts.rightArm
      ) {
        lawangParts.rightArm
          .rotation.z = 0;
      }
    }
  }

  /* =======================================================
     AIRCRAFT
     ======================================================= */

  function createAircraft() {

    let aircraft =
      scene.getObjectByName(
        "LAWANG_AIRCRAFT"
      );

    if (aircraft) {
      return aircraft;
    }

    aircraft =
      new THREE.Group();

    aircraft.name =
      "LAWANG_AIRCRAFT";

    /* MAIN BODY */

    const body =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          3,
          1.2,
          8
        ),

        new THREE.MeshStandardMaterial({
          color:
            0x4d5966,
          metalness:
            0.55,
          roughness:
            0.4
        })
      );

    aircraft.add(
      body
    );

    /* WINGS */

    const wingMaterial =
      new THREE.MeshStandardMaterial({
        color:
          0x66727d,
        metalness:
          0.5
      });

    const leftWing =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          8,
          0.22,
          1.7
        ),
        wingMaterial
      );

    leftWing.position.x =
      -4;

    aircraft.add(
      leftWing
    );

    const rightWing =
      leftWing.clone();

    rightWing.position.x =
      4;

    aircraft.add(
      rightWing
    );

    /* TAIL */

    const tail =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          2,
          2,
          1.2
        ),

        new THREE.MeshStandardMaterial({
          color:
            0x3d4650
        })
      );

    tail.position.set(
      0,
      0.8,
      3.1
    );

    aircraft.add(
      tail
    );

    /* WINDOWS */

    const windowMaterial =
      new THREE.MeshStandardMaterial({
        color:
          0x152b42,
        metalness:
          0.8,
        roughness:
          0.15
      });

    for (
      let side of [-1,1]
    ) {

      for (
        let i = -2;
        i <= 2;
        i++
      ) {

        const window =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              0.08,
              0.55,
              0.8
            ),
            windowMaterial
          );

        window.position.set(
          side * 1.53,
          0.15,
          i * 1.1
        );

        aircraft.add(
          window
        );
      }
    }

    /* AIRCRAFT DOOR */

    const door =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.12,
          1.5,
          1.1
        ),

        new THREE.MeshStandardMaterial({
          color:
            0x20252b
        })
      );

    door.position.set(
      1.55,
      0,
      0
    );

    aircraft.add(
      door
    );

    aircraft.position.set(
      0,
      30,
      0
    );

    aircraft.visible =
      false;

    scene.add(
      aircraft
    );

    return aircraft;
  }

  /* =======================================================
     AIRCRAFT FRIENDS
     ======================================================= */

  function createAircraftFriends() {

    const aircraft =
      createAircraft();

    let old =
      aircraft.getObjectByName(
        "AIRCRAFT_FRIENDS"
      );

    if (old) {
      aircraft.remove(old);
    }

    const friends =
      new THREE.Group();

    friends.name =
      "AIRCRAFT_FRIENDS";

    const positions = [
      [-0.8,0,-2],
      [0.8,0,-2],
      [-0.8,0,0],
      [0.8,0,0],
      [-0.8,0,2],
      [0.8,0,2]
    ];

    positions.forEach(
      (position,index) => {

        const friend =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              0.55,
              1.7,
              0.45
            ),

            new THREE.MeshStandardMaterial({
              color:
                [
                  0x2266aa,
                  0xaa3333,
                  0x228855,
                  0xaa7722,
                  0x8844aa,
                  0xdddddd
                ][index]
            })
          );

        friend.position.set(
          position[0],
          0.9,
          position[2]
        );

        friends.add(
          friend
        );
      }
    );

    aircraft.add(
      friends
    );

    return friends;
  }

  /* =======================================================
     START MATCH
     ======================================================= */

  function startMatch() {

    console.log(
      "LAWANG: MATCH START"
    );

    state.phase =
      "AIRCRAFT";

    state.hp =
      100;

    state.kills =
      0;

    state.score =
      0;

    state.firing =
      false;

    state.reloading =
      false;

    state.running =
      false;

    state.crouching =
      false;

    const aircraft =
      createAircraft();

    aircraft.visible =
      true;

    aircraft.position.set(
      0,
      30,
      0
    );

    aircraft.rotation.set(
      0,
      0,
      0
    );

    createAircraftFriends();

    /* PLAYER INSIDE */

    player.visible =
      true;

    player.userData.inAircraft =
      true;

    player.position.set(
      0,
      29.4,
      0
    );

    player.rotation.y =
      Math.PI;

    state.aircraftTime =
      0;

    state.canJumpFromAircraft =
      true;

    updateHUD();

    console.log(
      "LAWANG: PLAYER ENTERED AIRCRAFT"
    );
  }

  /* Global function */

  window.lawangStartAircraft =
    startMatch;

  /* =======================================================
     AIRCRAFT UPDATE
     ======================================================= */

  function updateAircraft(
    dt
  ) {

    if (
      state.phase !==
      "AIRCRAFT"
    ) {
      return;
    }

    const aircraft =
      createAircraft();

    aircraft.visible =
      true;

    state.aircraftTime +=
      dt;

    /* Move aircraft */

    aircraft.position.y -=
      dt * 2.5;

    aircraft.position.z +=
      dt * 2;

    /* Keep player inside */

    player.position.x =
      aircraft.position.x;

    player.position.y =
      aircraft.position.y - 0.6;

    player.position.z =
      aircraft.position.z;

    /* Aircraft rotation */

    aircraft.rotation.y =
      Math.sin(
        state.aircraftTime *
        0.3
      ) * 0.03;

    /* Reset flight */

    if (
      aircraft.position.y <
      8
    ) {

      aircraft.position.y =
        30;

      aircraft.position.z =
        0;
    }

    updateHUD();
  }

  /* =======================================================
     DROP FROM AIRCRAFT
     ======================================================= */

  function dropFromAircraft() {

    if (
      state.phase !==
      "AIRCRAFT"
    ) {
      return;
    }

    const aircraft =
      createAircraft();

    state.phase =
      "BATTLE";

    player.userData.inAircraft =
      false;

    player.visible =
      true;

    player.position.set(
      aircraft.position.x,
      aircraft.position.y - 1,
      aircraft.position.z
    );

    state.jumping =
      true;

    state.velocityY =
      -2;

    aircraft.visible =
      true;

    spawnEnemies();

    spawnPickups();

    updateHUD();

    console.log(
      "LAWANG: PLAYER JUMPED FROM AIRCRAFT"
    );
  }

  /* =======================================================
     LOBBY
     ======================================================= */

  function buildLobby() {

    if (
      scene.getObjectByName(
        "LAWANG_LOBBY"
      )
    ) {
      return;
    }

    const lobby =
      new THREE.Group();

    lobby.name =
      "LAWANG_LOBBY";

    const floor =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          14,
          14,
          0.3,
          40
        ),

        new THREE.MeshStandardMaterial({
          color:
            0x252b35,
          metalness:
            0.2
        })
      );

    floor.position.y =
      -0.15;

    lobby.add(
      floor
    );

    for (
      let i = 0;
      i < 8;
      i++
    ) {

      const pillar =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.8,
            5,
            0.8
          ),

          new THREE.MeshStandardMaterial({
            color:
              0x3d4655
          })
        );

      const angle =
        i *
        Math.PI /
        4;

      pillar.position.set(
        Math.cos(angle) *
          10,
        2.5,
        Math.sin(angle) *
          10
      );

      lobby.add(
        pillar
      );
    }

    scene.add(
      lobby
    );
  }

  /* =======================================================
     ENTER LOBBY
     ======================================================= */

  function enterLobby() {

    state.phase =
      "LOBBY";

    state.hp =
      100;

    state.firing =
      false;

    state.running =
      false;

    state.crouching =
      false;

    state.jumping =
      false;

    state.velocityY =
      0;

    const aircraft =
      scene.getObjectByName(
        "LAWANG_AIRCRAFT"
      );

    if (aircraft) {
      aircraft.visible =
        false;
    }

    player.visible =
      true;

    player.userData.inAircraft =
      false;

    player.position.set(
      0,
      0,
      8
    );

    updateHUD();
  }

  /* =======================================================
     MAIN LOOP
     ======================================================= */

  function gameLoop(
    now
  ) {

    requestAnimationFrame(
      gameLoop
    );

    const dt =
      Math.min(
        (
          now -
          state.lastTime
        ) / 1000,
        0.05
      );

    state.lastTime =
      now;

    if (
      state.fireTimer > 0
    ) {

      state.fireTimer -=
        dt * 1000;
    }

    if (
      state.firing
    ) {
      shoot();
    }

    updatePlayer(dt);

    updateCamera(dt);

    updateEnemies(dt);

    updatePickups();

    updateEmote(dt);

    updateAircraft(dt);

    updateHUD();

    renderer.render(
      scene,
      camera
    );
  }

  /* =======================================================
     INITIALIZE
     ======================================================= */

  buildLobby();

  createAircraft();

  createWeapon();

  enterLobby();

  updateHUD();

  requestAnimationFrame(
    gameLoop
  );

  console.log(
    "LAWANG MOBILE 3D — GAME.JS READY"
  );

})();