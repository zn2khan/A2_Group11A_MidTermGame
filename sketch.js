/************************************************************
 * 0) GLOBALS + GAME STATE
 ************************************************************/
const SCENES = {
  START: "start",
  INSTRUCTIONS: "instructions",
  CUTSCENE: "cutscene",
  GAME: "game",
  END: "end",
};

let scene = SCENES.START;
let previousScene = null;

let damageText = "";
let endMessage = "";
let damageTextTimer = 0;
let endSoundType = "";

let lastMonsterSoundTime = -9999;

// World settings
const VIEW_W = 800;
const VIEW_H = 500;
const WORLD_W = 1600;
const WORLD_H = 1000;

// Sprites
let sprites = {};

// Images
let startBg;
let gameBg;
let pipeImg;
let monsterSheet;
let cutsceneGif;
let doorImg;

// Sounds
let sndBackground;
let sndBubbling;
let sndCoin;
let sndDamage;
let sndFallingManhole;
let sndFootsteps;
let sndGameOver;
let sndGutterWater;
let sndIntroduction;
let sndMonsterSound;
let sndStartSound;
let sndSteam;
let sndVictory;
let sndWaterDrip;

// Cutscene settings
let cutsceneDuration = 6200;
let cutsceneStartTime = 0;

// Monster animation settings
const MONSTER_FRAME_W = 29;
const MONSTER_FRAME_H = 29;
const MONSTER_FRAMES = 6;
const MONSTER_SCALE = 2;
let monsterFrameIndex = 0;
let monsterFrameCounter = 0;
let monsterFrameDelay = 10;

// Player
let player = {
  x: 120,
  y: 120,
  r: 14,
  speed: 3,

  w: 18,
  h: 29,
  scale: 3,

  direction: "down",
  moving: false,

  frameIndex: 0,
  frameDelay: 8,
  frameCounter: 0,
  currentAnimName: "down_idle",
};

// Camera
let cam = { x: 0, y: 0 };

// Maze walls
let walls = [];

// Goal zone
let goal = { x: 1450, y: 850, w: 80, h: 80 };

// Enemies
let enemies = [];

// Health
let health = 3;
let maxHealth = 3;
let damageCooldown = 0;

let health3;
let health2;
let health1;

// Damage tuning
let wallDamage = 1;

/************************************************************
 * 1) PRELOAD
 ************************************************************/
function preload() {
  // Health bars
  health3 = loadImage("assets/images/fullHealthBar.png");
  health2 = loadImage("assets/images/2LifeHealthBar.png");
  health1 = loadImage("assets/images/1LifeHealthBar.png");

  // Player animations
  sprites.downRun = loadImage("assets/images/down_run_animation.png");
  sprites.leftRun = loadImage("assets/images/left_run_animation.png");
  sprites.rightRun = loadImage("assets/images/right_run_animation.png");
  sprites.upRun = loadImage("assets/images/up_run_animation.png");

  sprites.idleDown = loadImage("assets/images/idle_animation.png");
  sprites.idleUp = loadImage("assets/images/idle_animation_backside.png");
  sprites.idleLeft = loadImage("assets/images/idle_animation_L.png");
  sprites.idleRight = loadImage("assets/images/idle_animation_R.png");

  // Screen / environment images
  startBg = loadImage("assets/images/GBDA302_Background.png");
  gameBg = loadImage("assets/images/background.png");
  pipeImg = loadImage("assets/images/pipe.png");
  doorImg = loadImage("assets/images/door.png");

  // Enemy + cutscene
  monsterSheet = loadImage("assets/images/monster.png");
  cutsceneGif = loadImage("assets/images/cutscene.gif");

  // Audio
  sndBackground = loadSound("assets/music/background.mp3");
  sndBubbling = loadSound("assets/music/bubbling.mp3");
  sndCoin = loadSound("assets/music/coin.mp3");
  sndDamage = loadSound("assets/music/damage.mp3");
  sndFallingManhole = loadSound("assets/music/fallingManhole.mp3");
  sndFootsteps = loadSound("assets/music/footsteps.mp3");
  sndGameOver = loadSound("assets/music/gameOver.mp3");
  sndGutterWater = loadSound("assets/music/gutterWater.mp3");
  sndIntroduction = loadSound("assets/music/introduction.mp3");
  sndMonsterSound = loadSound("assets/music/monsterSound.mp3");
  sndStartSound = loadSound("assets/music/startSound.mp3");
  sndSteam = loadSound("assets/music/steam.mp3");
  sndVictory = loadSound("assets/music/victory.mp3");
  sndWaterDrip = loadSound("assets/music/waterDrip.mp3");
}

/************************************************************
 * 2) SETUP
 ************************************************************/
function setup() {
  createCanvas(VIEW_W, VIEW_H);
  noSmooth();
  textFont("monospace");

  buildMaze();
  spawnEnemies();
}

/************************************************************
 * 3) MAIN DRAW LOOP
 ************************************************************/
function draw() {
  background(20);

  if (scene === SCENES.START) drawStart();
  else if (scene === SCENES.INSTRUCTIONS) drawInstructions();
  else if (scene === SCENES.CUTSCENE) drawCutscene();
  else if (scene === SCENES.GAME) drawGame();
  else if (scene === SCENES.END) drawEnd();

  handleSceneAudio();

  if (damageCooldown > 0) {
    damageCooldown--;
  }
}

/************************************************************
 * 4) START PAGE
 ************************************************************/
function drawStart() {
  background(0);

  startFullGameMusic();

  if (startBg) {
    image(startBg, 0, 0, width, height);
  }

  noStroke();
  fill(0, 0, 0, 185);
  rect(0, height - 120, width, 120);

  drawPixelBox(width / 2 - 170, height - 90, 340, 34);
  drawPixelBox(width / 2 - 170, height - 46, 340, 34);

  textAlign(CENTER, CENTER);
  textFont("monospace");

  fill(240, 255, 200);
  textSize(20);
  text("PRESS ENTER TO START", width / 2, height - 73);

  fill(220);
  textSize(16);
  text("PRESS I FOR INSTRUCTIONS", width / 2, height - 29);
}

function drawPixelBox(x, y, w, h) {
  noStroke();

  fill(0, 0, 0, 120);
  rect(x + 4, y + 4, w, h);

  fill(30, 45, 30, 245);
  rect(x, y, w, h);

  fill(140, 170, 70, 255);
  rect(x + 3, y + 3, w - 6, h - 6);

  fill(35, 55, 35, 240);
  rect(x + 6, y + 6, w - 12, h - 12);
}

/************************************************************
 * 5) INSTRUCTIONS PAGE
 ************************************************************/
function drawInstructions() {
  background(10);
  noStroke();
  fill(255);
  textAlign(LEFT, TOP);
  textFont("monospace");

  textSize(22);
  text("INSTRUCTIONS", 40, 40);

  textSize(15);
  text(
    "- Use WASD or Arrow Keys to move\n" +
      "- Character only moves up, down, left, or right\n" +
      "- Avoid walls (they're chemical hazards)\n" +
      "- Avoid monsters in the maze\n" +
      "- Reach the green goal zone to win\n\n" +
      "Press B to go back to the Start Screen\n" +
      "Press G to return to the game",
    40,
    90
  );
}

/************************************************************
 * 6) CUTSCENE
 ************************************************************/
function startCutscene() {
  cutsceneStartTime = millis();
  scene = SCENES.CUTSCENE;
}

function drawCutscene() {
  background(0);

  if (cutsceneGif) {
    const maxW = width * 0.92;
    const maxH = height * 0.78;

    const scale = min(maxW / cutsceneGif.width, maxH / cutsceneGif.height);

    const dw = floor(cutsceneGif.width * scale);
    const dh = floor(cutsceneGif.height * scale);

    const dx = floor((width - dw) / 2);
    const dy = floor((height - dh) / 2) - 10;

    imageMode(CORNER);
    image(cutsceneGif, dx, dy, dw, dh);
  } else {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Cutscene loading...", width / 2, height / 2);
  }

  fill(255);
  textAlign(CENTER, BOTTOM);
  textSize(14);
  text("Press SPACE to skip", width / 2, height - 18);

  if (millis() - cutsceneStartTime >= cutsceneDuration) {
    scene = SCENES.GAME;
  }
}

/************************************************************
 * 7) GAME LOOP
 ************************************************************/
function drawGame() {
  updatePlayer();
  updateAnimation();
  updateMonsterAnimation();
  updateCamera();
  updateEnemies();
  updateFootstepSound();

  if (health <= 0) {
    triggerGameOver();
    return;
  }

  if (
    rectContainsCircle(
      goal.x,
      goal.y,
      goal.w,
      goal.h,
      player.x,
      player.y,
      player.r
    )
  ) {
    triggerVictory();
    return;
  }

  push();
  translate(-cam.x, -cam.y);

  drawWorldBackground();
  drawWorldBounds();
  drawGoal();
  drawMaze();
  drawEnemies();
  drawPlayer();

  pop();

  drawHUD();

  if (damageTextTimer > 0) {
    fill(255, 0, 0);
    textSize(20);
    textAlign(CENTER, CENTER);
    text(damageText, width / 2, 60);
    damageTextTimer--;
  }

  drawHealthBar();
}

/************************************************************
 * 8) END SCREEN
 ************************************************************/
function drawEnd() {
  background(0);
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textFont("monospace");

  textSize(26);
  text(endMessage, width / 2, height / 2 - 20);

  textSize(15);
  text("Press R to restart", width / 2, height / 2 + 20);
  text("Press B for Start Screen", width / 2, height / 2 + 45);
}

/************************************************************
 * 9) INPUT HANDLING
 ************************************************************/
function keyPressed() {
  userStartAudio();

  if (scene === SCENES.START) {
    if (keyCode === ENTER) startCutscene();
    if (key === "i" || key === "I") scene = SCENES.INSTRUCTIONS;
  } else if (scene === SCENES.INSTRUCTIONS) {
    if (key === "b" || key === "B") scene = SCENES.START;
    if (key === "g" || key === "G") scene = SCENES.GAME;
  } else if (scene === SCENES.CUTSCENE) {
    if (key === " " || keyCode === 32) {
      scene = SCENES.GAME;
    }
  } else if (scene === SCENES.GAME) {
    if (key === "i" || key === "I") scene = SCENES.INSTRUCTIONS;
  } else if (scene === SCENES.END) {
    if (key === "r" || key === "R") restartGame();
    if (key === "b" || key === "B") scene = SCENES.START;
  }
}

/************************************************************
 * 10) DAMAGE HELPER
 ************************************************************/
function applyDamage(amount, source = "") {
  if (damageCooldown <= 0) {
    health = max(0, health - amount);
    damageCooldown = 30;
    damageText = "-" + amount + " health!" + source;
    damageTextTimer = 40;

    if (
      sndDamage &&
      getAudioContext().state === "running" &&
      !sndDamage.isPlaying()
    ) {
      sndDamage.setVolume(0.65);
      sndDamage.play();
    }
  }
}

/************************************************************
 * 11) PLAYER MOVEMENT + COLLISION
 ************************************************************/
function updatePlayer() {
  let dx = 0;
  let dy = 0;

  const up = keyIsDown(UP_ARROW) || keyIsDown(87);
  const down = keyIsDown(DOWN_ARROW) || keyIsDown(83);
  const left = keyIsDown(LEFT_ARROW) || keyIsDown(65);
  const right = keyIsDown(RIGHT_ARROW) || keyIsDown(68);

  if (up && !down) {
    dy = -player.speed;
    player.direction = "up";
  } else if (down && !up) {
    dy = player.speed;
    player.direction = "down";
  } else if (left && !right) {
    dx = -player.speed;
    player.direction = "left";
  } else if (right && !left) {
    dx = player.speed;
    player.direction = "right";
  }

  player.moving = dx !== 0 || dy !== 0;

  if (dx !== 0) {
    player.x += dx;
    if (circleHitsAnyWall(player.x, player.y, player.r)) {
      player.x -= dx;
      applyDamage(wallDamage);
    }
  }

  if (dy !== 0) {
    player.y += dy;
    if (circleHitsAnyWall(player.x, player.y, player.r)) {
      player.y -= dy;
      applyDamage(wallDamage);
    }
  }

  player.x = constrain(player.x, player.r, WORLD_W - player.r);
  player.y = constrain(player.y, player.r, WORLD_H - player.r);

  checkMonsterCollisions();
}

/************************************************************
 * 12) PLAYER ANIMATION UPDATE
 ************************************************************/
function updateAnimation() {
  const anim = getCurrentAnimation();
  const animName = player.moving
    ? `${player.direction}_run`
    : `${player.direction}_idle`;

  if (animName !== player.currentAnimName) {
    player.currentAnimName = animName;
    player.frameIndex = 0;
    player.frameCounter = 0;
  }

  player.frameCounter++;

  if (player.frameCounter >= player.frameDelay) {
    player.frameCounter = 0;
    player.frameIndex++;

    if (player.frameIndex >= anim.frames) {
      player.frameIndex = 0;
    }
  }
}

/************************************************************
 * 13) MONSTER ANIMATION UPDATE
 ************************************************************/
function updateMonsterAnimation() {
  monsterFrameCounter++;

  if (monsterFrameCounter >= monsterFrameDelay) {
    monsterFrameCounter = 0;
    monsterFrameIndex++;

    if (monsterFrameIndex >= MONSTER_FRAMES) {
      monsterFrameIndex = 0;
    }
  }
}

/************************************************************
 * 14) GET CURRENT PLAYER ANIMATION
 ************************************************************/
function getCurrentAnimation() {
  if (player.moving) {
    if (player.direction === "down") {
      return { sheet: sprites.downRun, frames: 8, frameW: 18, frameH: 29 };
    }
    if (player.direction === "up") {
      return { sheet: sprites.upRun, frames: 8, frameW: 18, frameH: 29 };
    }
    if (player.direction === "left") {
      return { sheet: sprites.leftRun, frames: 8, frameW: 18, frameH: 29 };
    }
    if (player.direction === "right") {
      return { sheet: sprites.rightRun, frames: 8, frameW: 18, frameH: 29 };
    }
  } else {
    if (player.direction === "down") {
      return { sheet: sprites.idleDown, frames: 7, frameW: 18, frameH: 29 };
    }
    if (player.direction === "up") {
      return { sheet: sprites.idleUp, frames: 7, frameW: 18, frameH: 29 };
    }
    if (player.direction === "left") {
      return { sheet: sprites.idleLeft, frames: 2, frameW: 18, frameH: 29 };
    }
    if (player.direction === "right") {
      return { sheet: sprites.idleRight, frames: 2, frameW: 18, frameH: 29 };
    }
  }

  return { sheet: sprites.idleDown, frames: 7, frameW: 18, frameH: 29 };
}

/************************************************************
 * 15) CAMERA MOVEMENT
 ************************************************************/
function updateCamera() {
  cam.x = player.x - width / 2;
  cam.y = player.y - height / 2;

  cam.x = constrain(cam.x, 0, WORLD_W - width);
  cam.y = constrain(cam.y, 0, WORLD_H - height);
}

/************************************************************
 * 16) MAZE CREATION
 ************************************************************/
function buildMaze() {
  walls = [];

  walls.push({ x: 0, y: 0, w: WORLD_W, h: 30 });
  walls.push({ x: 0, y: WORLD_H - 30, w: WORLD_W, h: 30 });
  walls.push({ x: 0, y: 0, w: 30, h: WORLD_H });
  walls.push({ x: WORLD_W - 30, y: 0, w: 30, h: WORLD_H });

  walls.push({ x: 100, y: 200, w: 600, h: 30 });
  walls.push({ x: 300, y: 350, w: 30, h: 400 });
  walls.push({ x: 500, y: 500, w: 500, h: 30 });
  walls.push({ x: 900, y: 200, w: 30, h: 500 });
  walls.push({ x: 1100, y: 700, w: 350, h: 30 });
}

/************************************************************
 * 17) COLLISION RESULTS
 ************************************************************/
function circleHitsAnyWall(cx, cy, cr) {
  for (const w of walls) {
    if (circleRectCollision(cx, cy, cr, w.x, w.y, w.w, w.h)) return true;
  }
  return false;
}

/************************************************************
 * 18) ENEMIES
 ************************************************************/
function spawnEnemies() {
  enemies = [];

  const enemyCount = 8;
  const maxAttemptsPerEnemy = 200;

  for (let i = 0; i < enemyCount; i++) {
    let placed = false;

    for (let attempt = 0; attempt < maxAttemptsPerEnemy; attempt++) {
      const x = random(60, WORLD_W - 60);
      const y = random(60, WORLD_H - 60);
      const r = 14;

      if (circleHitsAnyWall(x, y, r)) continue;
      if (dist(x, y, 120, 120) < 140) continue;

      if (
        x > goal.x - 80 &&
        x < goal.x + goal.w + 80 &&
        y > goal.y - 80 &&
        y < goal.y + goal.h + 80
      ) {
        continue;
      }

      let tooClose = false;
      for (const e of enemies) {
        if (dist(x, y, e.x, e.y) < 80) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      let vx = 0;
      let vy = 0;
      const dir = floor(random(4));

      if (dir === 0) vx = 1;
      else if (dir === 1) vx = -1;
      else if (dir === 2) vy = 1;
      else vy = -1;

      enemies.push({
        x: x,
        y: y,
        r: r,
        vx: vx,
        vy: vy,
        speed: random(1.5, 2.5),
      });

      placed = true;
      break;
    }

    if (!placed) {
      console.log("Could not place enemy #" + i);
    }
  }
}

function updateEnemies() {
  for (const e of enemies) {
    const nx = e.x + e.vx * e.speed;
    const ny = e.y + e.vy * e.speed;

    if (circleHitsAnyWall(nx, e.y, e.r)) e.vx *= -1;
    else e.x = nx;

    if (circleHitsAnyWall(e.x, ny, e.r)) e.vy *= -1;
    else e.y = ny;

    if (e.vx === 0 && e.vy === 0) e.vx = 1;
  }
}

/************************************************************
 * 19) WORLD / GOAL / DRAWING
 ************************************************************/
function drawWorldBackground() {
  if (gameBg) {
    image(gameBg, 0, 0, WORLD_W, WORLD_H);
  } else {
    background(40, 25, 20);
  }
}

function drawGoal() {
  if (doorImg) {
    const drawW = 110;
    const drawH = 110;

    const dx = goal.x + goal.w / 2 - drawW / 2;
    const dy = goal.y + goal.h / 2 - drawH / 2;

    image(doorImg, dx, dy, drawW, drawH);
  } else {
    noStroke();
    fill(0, 200, 100);
    rect(goal.x, goal.y, goal.w, goal.h);
  }
}

function drawWorldBounds() {
  // optional
}

function drawMaze() {
  for (const w of walls) {
    drawPipeWall(w);
  }
}

function drawPipeWall(wall) {
  if (!pipeImg) {
    noStroke();
    fill(200, 80, 80);
    rect(wall.x, wall.y, wall.w, wall.h);
    return;
  }

  const srcTile = pipeImg.width;

  if (wall.h > wall.w) {
    const tileSize = wall.w;

    for (let y = wall.y, i = 0; y < wall.y + wall.h; y += tileSize, i++) {
      const remaining = wall.y + wall.h - y;
      const drawH = min(tileSize, remaining);

      const syMax = max(1, pipeImg.height - srcTile);
      const sy = (i * floor(srcTile * 0.8)) % syMax;

      image(pipeImg, wall.x, y, wall.w, drawH, 0, sy, pipeImg.width, srcTile);
    }
  } else {
    const tileSize = wall.h;

    for (let x = wall.x, i = 0; x < wall.x + wall.w; x += tileSize, i++) {
      const remaining = wall.x + wall.w - x;
      const drawW = min(tileSize, remaining);

      const syMax = max(1, pipeImg.height - srcTile);
      const sy = (i * floor(srcTile * 0.8)) % syMax;

      push();
      translate(x + drawW / 2, wall.y + wall.h / 2);
      rotate(HALF_PI);
      imageMode(CENTER);

      image(pipeImg, 0, 0, wall.h, drawW, 0, sy, pipeImg.width, srcTile);

      imageMode(CORNER);
      pop();
    }
  }
}

function drawPlayer() {
  const anim = getCurrentAnimation();

  const sx = player.frameIndex * anim.frameW;
  const sy = 0;
  const sw = anim.frameW;
  const sh = anim.frameH;

  const dw = anim.frameW * player.scale;
  const dh = anim.frameH * player.scale;

  const dx = floor(player.x - dw / 2);
  const dy = floor(player.y - dh / 2);

  image(anim.sheet, dx, dy, dw, dh, sx, sy, sw, sh);
}

function drawEnemies() {
  if (!monsterSheet) {
    noStroke();
    fill(255, 200, 0);
    for (const e of enemies) circle(e.x, e.y, e.r * 2);
    return;
  }

  const sx = monsterFrameIndex * MONSTER_FRAME_W;
  const sy = 0;
  const sw = MONSTER_FRAME_W;
  const sh = MONSTER_FRAME_H;

  const dw = MONSTER_FRAME_W * MONSTER_SCALE;
  const dh = MONSTER_FRAME_H * MONSTER_SCALE;

  for (const e of enemies) {
    const dx = floor(e.x - dw / 2);
    const dy = floor(e.y - dh / 2);

    image(monsterSheet, dx, dy, dw, dh, sx, sy, sw, sh);
  }
}

function drawHUD() {
  noStroke();
  fill(255);
  textSize(12);
  textAlign(LEFT, TOP);
  textFont("monospace");
  text("Reach the green zone. Avoid walls + monsters.", 10, 10);
  text("Press I for Instructions", 10, 26);
}

/************************************************************
 * 20) RESTART
 ************************************************************/
function restartGame() {
  stopAllSounds();

  player.x = 120;
  player.y = 120;
  player.direction = "down";
  player.moving = false;
  player.frameIndex = 0;
  player.frameCounter = 0;
  player.currentAnimName = "down_idle";

  monsterFrameIndex = 0;
  monsterFrameCounter = 0;

  health = maxHealth;
  damageCooldown = 0;
  damageText = "";
  damageTextTimer = 0;
  endMessage = "";
  endSoundType = "";
  lastMonsterSoundTime = -9999;

  spawnEnemies();
  scene = SCENES.GAME;

  startFullGameMusic();

  if (getAudioContext().state === "running") {
    if (sndGutterWater && !sndGutterWater.isPlaying()) {
      sndGutterWater.setLoop(true);
      sndGutterWater.setVolume(0.12);
      sndGutterWater.play();
    }

    if (sndSteam && !sndSteam.isPlaying()) {
      sndSteam.setLoop(true);
      sndSteam.setVolume(0.1);
      sndSteam.play();
    }
  }
}

/************************************************************
 * 21) HELPER COLLISION MATH
 ************************************************************/
function circleRectCollision(cx, cy, cr, rx, ry, rw, rh) {
  const closestX = constrain(cx, rx, rx + rw);
  const closestY = constrain(cy, ry, ry + rh);
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy <= cr * cr;
}

function rectContainsCircle(rx, ry, rw, rh, cx, cy, cr) {
  return cx > rx && cx < rx + rw && cy > ry && cy < ry + rh;
}

/************************************************************
 * 22) HEALTH BAR
 ************************************************************/
function drawHealthBar() {
  const barWidth = 200;
  const barHeight = 30;
  const x = width - barWidth - 10;
  const y = 1;

  if (health === 3) {
    image(health3, x, y, barWidth, barHeight);
  } else if (health === 2) {
    image(health2, x, y, barWidth, barHeight);
  } else if (health === 1) {
    image(health1, x, y, barWidth, barHeight);
  }

  fill(0, 255, 0);
  noStroke();
  textSize(12);
  textFont("monospace");
  text("Health: lives player has left", x + 20, y + barHeight + 15);
}

/************************************************************
 * 23) MONSTER COLLISIONS
 ************************************************************/
function checkMonsterCollisions() {
  for (const e of enemies) {
    const d = dist(player.x, player.y, e.x, e.y);
    if (d < player.r + e.r) {
      if (damageCooldown <= 0) {
        const now = millis();

        if (
          sndMonsterSound &&
          getAudioContext().state === "running" &&
          now - lastMonsterSoundTime > 350
        ) {
          sndMonsterSound.setVolume(0.6);
          sndMonsterSound.play();
          lastMonsterSoundTime = now;
        }

        applyDamage(1, " (Enemy Collision!)");
      }
    }
  }
}

/************************************************************
 * 24) SOUND HELPERS
 ************************************************************/
function stopAllSounds() {
  const allSounds = [
    sndBackground,
    sndBubbling,
    sndCoin,
    sndDamage,
    sndFallingManhole,
    sndFootsteps,
    sndGameOver,
    sndGutterWater,
    sndIntroduction,
    sndMonsterSound,
    sndStartSound,
    sndSteam,
    sndVictory,
    sndWaterDrip,
  ];

  for (const s of allSounds) {
    if (s && s.isPlaying()) {
      s.stop();
    }
  }
}

function startFullGameMusic() {
  if (!sndBackground) return;
  if (getAudioContext().state !== "running") return;

  if (!sndBackground.isPlaying()) {
    sndBackground.setLoop(true);
    sndBackground.setVolume(0.18);
    sndBackground.play();
  }
}

function updateFootstepSound() {
  if (!sndFootsteps) return;

  if (getAudioContext().state !== "running" || scene !== SCENES.GAME) {
    if (sndFootsteps.isPlaying()) {
      sndFootsteps.stop();
    }
    return;
  }

  if (player.moving) {
    if (!sndFootsteps.isPlaying()) {
      sndFootsteps.setLoop(true);
      sndFootsteps.setVolume(0.22);
      sndFootsteps.play();
    }
  } else {
    if (sndFootsteps.isPlaying()) {
      sndFootsteps.stop();
    }
  }
}

function handleSceneAudio() {
  if (scene === previousScene) return;

  if (
    scene === SCENES.START ||
    scene === SCENES.CUTSCENE ||
    scene === SCENES.GAME
  ) {
    startFullGameMusic();

    if (scene === SCENES.GAME) {
      if (
        sndGutterWater &&
        getAudioContext().state === "running" &&
        !sndGutterWater.isPlaying()
      ) {
        sndGutterWater.setLoop(true);
        sndGutterWater.setVolume(0.12);
        sndGutterWater.play();
      }

      if (
        sndSteam &&
        getAudioContext().state === "running" &&
        !sndSteam.isPlaying()
      ) {
        sndSteam.setLoop(true);
        sndSteam.setVolume(0.1);
        sndSteam.play();
      }
    } else {
      if (sndGutterWater && sndGutterWater.isPlaying()) {
        sndGutterWater.stop();
      }
      if (sndSteam && sndSteam.isPlaying()) {
        sndSteam.stop();
      }
      if (sndFootsteps && sndFootsteps.isPlaying()) {
        sndFootsteps.stop();
      }
    }
  } else if (scene === SCENES.INSTRUCTIONS) {
    if (sndFootsteps && sndFootsteps.isPlaying()) {
      sndFootsteps.stop();
    }
  } else if (scene === SCENES.END) {
    stopAllSounds();

    if (getAudioContext().state === "running") {
      if (endSoundType === "victory" && sndVictory) {
        sndVictory.setVolume(0.65);
        sndVictory.play();
      } else if (endSoundType === "gameOver" && sndGameOver) {
        sndGameOver.setVolume(0.65);
        sndGameOver.play();
      }
    }
  }

  previousScene = scene;
}

function triggerVictory() {
  stopAllSounds();
  endMessage = "You escaped! 🎉";
  endSoundType = "victory";
  scene = SCENES.END;
}

function triggerGameOver() {
  stopAllSounds();
  endMessage = "Game Over! You ran out of health.";
  endSoundType = "gameOver";
  scene = SCENES.END;
}