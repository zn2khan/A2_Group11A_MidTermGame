/************************************************************
 * 0) GLOBALS + GAME STATE
 ************************************************************/
const SCENES = {
  START: "start",
  INSTRUCTIONS: "instructions",
  GAME: "game",
  END: "end",
};

let scene = SCENES.START;
let damageText = "";
let endMessage = "";

let damageTextTimer = 0;

// World settings
const VIEW_W = 800;
const VIEW_H = 500;
const WORLD_W = 1600;
const WORLD_H = 1000;

// Sprites
let sprites = {};

// Background + pipe texture + monster sprite
let gameBg;
let pipeImg;
let monsterSheet;

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

// Health Bar
let health = 3;
let maxHealth = 3;
let damageCooldown = 0;

let health3;
let health2;
let health1;

// Wall damage tuning
let wallDamage = 1;

/************************************************************
 * 1) PRELOAD
 ************************************************************/
function preload() {
  // Health bars
  health3 = loadImage("assets/images/fullHealthBar.png");
  health2 = loadImage("assets/images/2LifeHealthBar.png");
  health1 = loadImage("assets/images/1LifeHealthBar.png");

  // Running animations
  sprites.downRun = loadImage("assets/images/down_run_animation.png");
  sprites.leftRun = loadImage("assets/images/left_run_animation.png");
  sprites.rightRun = loadImage("assets/images/right_run_animation.png");
  sprites.upRun = loadImage("assets/images/up_run_animation.png");

  // Idle animations
  sprites.idleDown = loadImage("assets/images/idle_animation.png");
  sprites.idleUp = loadImage("assets/images/idle_animation_backside.png");
  sprites.idleLeft = loadImage("assets/images/idle_animation_L.png");
  sprites.idleRight = loadImage("assets/images/idle_animation_R.png");

  // Gameplay background
  gameBg = loadImage("assets/images/background.png");

  // Pipe texture for walls
  pipeImg = loadImage("assets/images/pipe.png");

  // Monster sprite sheet
  monsterSheet = loadImage("assets/images/monster.png");
}

/************************************************************
 * 2) SETUP
 ************************************************************/
function setup() {
  createCanvas(VIEW_W, VIEW_H);
  noSmooth();

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
  else if (scene === SCENES.GAME) drawGame();
  else if (scene === SCENES.END) drawEnd();

  if (damageCooldown > 0) {
    damageCooldown--;
  }
}

/************************************************************
 * 4) START PAGE
 ************************************************************/
function drawStart() {
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("MAZE ESCAPE", width / 2, height / 2 - 40);

  textSize(16);
  text("Press ENTER to Start", width / 2, height / 2 + 10);
  text("Press I for Instructions", width / 2, height / 2 + 35);
}

/************************************************************
 * 5) INSTRUCTIONS PAGE
 ************************************************************/
function drawInstructions() {
  noStroke();
  fill(255);
  textAlign(LEFT, TOP);
  textSize(18);
  text("Instructions", 40, 40);

  textSize(14);
  text(
    "- Use WASD or Arrow Keys to move\n" +
      "- Character only moves up, down, left, or right\n" +
      "- Avoid walls (they’re chemical hazards)\n" +
      "- Avoid monsters in the maze\n" +
      "- Reach the green goal zone to win\n\n" +
      "Press B to go back to the Start Screen\n" +
      "Press G to return to the game",
    40,
    80
  );
}

/************************************************************
 * 6) GAME LOOP
 ************************************************************/
function drawGame() {
  updatePlayer();
  updateAnimation();
  updateMonsterAnimation();
  updateCamera();
  updateEnemies();

  if (health <= 0) {
    endMessage = "Game Over! You ran out of health.";
    scene = SCENES.END;
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
    endMessage = "You escaped! 🎉";
    scene = SCENES.END;
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
    textAlign(CENTER);
    text(damageText, width / 2, 60);
    damageTextTimer--;
  }

  drawHealthBar();
}

/************************************************************
 * 7) FINAL / END SCREEN
 ************************************************************/
function drawEnd() {
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);
  text(endMessage, width / 2, height / 2 - 10);

  textSize(14);
  text(
    "Press R to restart (or B for Start Screen)",
    width / 2,
    height / 2 + 25
  );
}

/************************************************************
 * 8) INPUT HANDLING
 ************************************************************/
function keyPressed() {
  if (scene === SCENES.START) {
    if (keyCode === ENTER) scene = SCENES.GAME;
    if (key === "i" || key === "I") scene = SCENES.INSTRUCTIONS;
  } else if (scene === SCENES.INSTRUCTIONS) {
    if (key === "b" || key === "B") scene = SCENES.START;
    if (key === "g" || key === "G") scene = SCENES.GAME;
  } else if (scene === SCENES.GAME) {
    if (key === "i" || key === "I") scene = SCENES.INSTRUCTIONS;
  } else if (scene === SCENES.END) {
    if (key === "r" || key === "R") restartGame();
    if (key === "b" || key === "B") scene = SCENES.START;
  }
}

/************************************************************
 * 9) DAMAGE HELPER
 ************************************************************/
function applyDamage(amount, source = "") {
  if (damageCooldown <= 0) {
    health = max(0, health - amount);
    damageCooldown = 30;

    damageText = "-" + amount + " health!" + source;
    damageTextTimer = 40;
  }
}

/************************************************************
 * 10) PLAYER MOVEMENT + COLLISION
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
 * 11) PLAYER ANIMATION UPDATE
 ************************************************************/
function updateAnimation() {
  let anim = getCurrentAnimation();
  let animName = player.moving
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
 * 12) MONSTER ANIMATION UPDATE
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
 * 13) GET CURRENT PLAYER ANIMATION
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
 * 14) CAMERA MOVEMENT
 ************************************************************/
function updateCamera() {
  cam.x = player.x - width / 2;
  cam.y = player.y - height / 2;

  cam.x = constrain(cam.x, 0, WORLD_W - width);
  cam.y = constrain(cam.y, 0, WORLD_H - height);
}

/************************************************************
 * 15) MAZE CREATION
 ************************************************************/
function buildMaze() {
  walls = [];

  // Outer border walls
  walls.push({ x: 0, y: 0, w: WORLD_W, h: 30 });
  walls.push({ x: 0, y: WORLD_H - 30, w: WORLD_W, h: 30 });
  walls.push({ x: 0, y: 0, w: 30, h: WORLD_H });
  walls.push({ x: WORLD_W - 30, y: 0, w: 30, h: WORLD_H });

  // Internal walls
  walls.push({ x: 100, y: 200, w: 600, h: 30 });
  walls.push({ x: 300, y: 350, w: 30, h: 400 });
  walls.push({ x: 500, y: 500, w: 500, h: 30 });
  walls.push({ x: 900, y: 200, w: 30, h: 500 });
  walls.push({ x: 1100, y: 700, w: 350, h: 30 });
}

/************************************************************
 * 16) COLLISION RESULTS
 ************************************************************/
function circleHitsAnyWall(cx, cy, cr) {
  for (const w of walls) {
    if (circleRectCollision(cx, cy, cr, w.x, w.y, w.w, w.h)) return true;
  }
  return false;
}

/************************************************************
 * 17) ENEMIES
 ************************************************************/
function spawnEnemies() {
  enemies = [];

  const enemyCount = 8; // change this to add more or fewer monsters
  const maxAttemptsPerEnemy = 200;

  for (let i = 0; i < enemyCount; i++) {
    let placed = false;

    for (let attempt = 0; attempt < maxAttemptsPerEnemy; attempt++) {
      let x = random(60, WORLD_W - 60);
      let y = random(60, WORLD_H - 60);
      let r = 14;

      // keep away from walls
      if (circleHitsAnyWall(x, y, r)) continue;

      // keep away from player start
      if (dist(x, y, 120, 120) < 140) continue;

      // keep away from goal
      if (
        x > goal.x - 80 &&
        x < goal.x + goal.w + 80 &&
        y > goal.y - 80 &&
        y < goal.y + goal.h + 80
      )
        continue;

      // keep away from other enemies
      let tooClose = false;
      for (const e of enemies) {
        if (dist(x, y, e.x, e.y) < 80) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      // random movement direction
      let dir = floor(random(4));
      let vx = 0;
      let vy = 0;

      if (dir === 0) vx = 1;
      else if (dir === 1) vx = -1;
      else if (dir === 2) vy = 1;
      else if (dir === 3) vy = -1;

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
 * 18) WIN CONDITION
 ************************************************************/
function drawGoal() {
  noStroke();
  fill(0, 200, 100);
  rect(goal.x, goal.y, goal.w, goal.h);
}

/************************************************************
 * 19) DRAWING FUNCTIONS
 ************************************************************/
function drawWorldBackground() {
  if (gameBg) {
    image(gameBg, 0, 0, WORLD_W, WORLD_H);
  } else {
    background(40, 25, 20);
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
      const sy = (i * Math.floor(srcTile * 0.8)) % syMax;

      image(pipeImg, wall.x, y, wall.w, drawH, 0, sy, pipeImg.width, srcTile);
    }
  } else {
    const tileSize = wall.h;

    for (let x = wall.x, i = 0; x < wall.x + wall.w; x += tileSize, i++) {
      const remaining = wall.x + wall.w - x;
      const drawW = min(tileSize, remaining);

      const syMax = max(1, pipeImg.height - srcTile);
      const sy = (i * Math.floor(srcTile * 0.8)) % syMax;

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
  let anim = getCurrentAnimation();

  let sx = player.frameIndex * anim.frameW;
  let sy = 0;
  let sw = anim.frameW;
  let sh = anim.frameH;

  let dw = anim.frameW * player.scale;
  let dh = anim.frameH * player.scale;

  let dx = floor(player.x - dw / 2);
  let dy = floor(player.y - dh / 2);

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
  text("Reach the green zone. Avoid walls + monsters.", 10, 10);
  text("Press I for Instructions", 10, 26);
}

/************************************************************
 * 20) RESTART
 ************************************************************/
function restartGame() {
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
  spawnEnemies();
  scene = SCENES.GAME;
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
  let barWidth = 200;
  let barHeight = 30;
  let x = width - barWidth - 10;
  let y = 1;

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
  text("Health: lives player has left", x + 20, y + barHeight + 15);
}

/************************************************************
 * 23) MONSTER COLLISIONS
 ************************************************************/
function checkMonsterCollisions() {
  for (const e of enemies) {
    const d = dist(player.x, player.y, e.x, e.y);

    if (d < player.r + e.r) {
      applyDamage(1, " (Enemy Collision!)");
    }
  }
}
