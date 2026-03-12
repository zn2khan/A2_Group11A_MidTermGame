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
let endMessage = ""; // "You escaped!" or "Game Over!"

let damageTextTimer = 0;

let pipeImg;
let bgImg;
let gameOverImg;
let startImg;

// World settings (bigger than screen so camera matters)
const VIEW_W = 800;
const VIEW_H = 500;
const WORLD_W = 1600;
const WORLD_H = 1000;

// Sprites
let sprites = {};

// Player
let player = {
  x: 120,
  y: 120,
  r: 14, // collision radius
  speed: 3,

  // sprite frame size
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

// Camera (we’ll center it on the player)
let cam = { x: 0, y: 0 };

// Maze walls: each wall is {x, y, w, h}
let walls = [];

// Goal zone (finish)
let goal = { x: 1450, y: 850, w: 80, h: 80 };

// Enemies: each enemy is {x,y,r,vx,vy,speed}
let enemies = [];

// Health Bar
let health = 3;
let maxHealth = 3;
let damageCooldown = 0; // prevents losing health too fast

let health3; // 3 lives left (full bar)
let health2; // 2 lives left
let health1; // 1 life left

// Wall damage tuning
let wallDamage = 1; // health lost per wall bump

pipeImg = loadImage("assets/images/pipe.png"); // Load pipe image for walls

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

  pipeImg = loadImage("assets/images/pipe.png");
  bgImg = loadImage("assets/images/background.png");
  gameOverImg = loadImage("assets/images/game_over_img.png");
  startImg = loadImage("assets/images/start_game_img.png");
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
 * 3) MAIN DRAW LOOP (SCENE MANAGER)
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
  imageMode(CORNER);
  image(startImg, 0, 0, width, height);

  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
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
 * 6) GAME LOOP (UPDATE + DRAW)
 ************************************************************/
function drawGame() {
  // Update
  updatePlayer();
  updateAnimation();
  updateCamera();
  updateEnemies();

  // Check lose + win
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

  // Draw world with camera transform
  push();
  translate(-cam.x, -cam.y);

  imageMode(CORNER);
  image(bgImg, 0, 0, WORLD_W, WORLD_H);

  drawWorldBounds();
  drawGoal();
  drawMaze();
  drawEnemies();
  drawPlayer();

  pop();

  // HUD
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
  imageMode(CORNER);
  image(gameOverImg, 0, 0, width, height);

  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(14);
  text(
    "Press R to restart (or B for Start Screen)",
    width / 2,
    height - 40
  );

  drawHealthBar();
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
 *     Uses your smoother movement structure
 ************************************************************/
function updatePlayer() {
  let dx = 0;
  let dy = 0;

  const up = keyIsDown(UP_ARROW) || keyIsDown(87); // W
  const down = keyIsDown(DOWN_ARROW) || keyIsDown(83); // S
  const left = keyIsDown(LEFT_ARROW) || keyIsDown(65); // A
  const right = keyIsDown(RIGHT_ARROW) || keyIsDown(68); // D

  // No diagonal movement: vertical priority first, then horizontal
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

  // Try X move
  if (dx !== 0) {
    player.x += dx;
    if (circleHitsAnyWall(player.x, player.y, player.r)) {
      player.x -= dx;
      applyDamage(wallDamage);
    }
  }

  // Try Y move
  if (dy !== 0) {
    player.y += dy;
    if (circleHitsAnyWall(player.x, player.y, player.r)) {
      player.y -= dy;
      applyDamage(wallDamage);
    }
  }

  // Keep player inside world bounds
  player.x = constrain(player.x, player.r, WORLD_W - player.r);
  player.y = constrain(player.y, player.r, WORLD_H - player.r);

  checkMonsterCollisions();
}

/************************************************************
 * 11) ANIMATION UPDATE
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
 * 12) GET CURRENT ANIMATION
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
 * 13) CAMERA MOVEMENT (center on player)
 ************************************************************/
function updateCamera() {
  cam.x = player.x - width / 2;
  cam.y = player.y - height / 2;

  cam.x = constrain(cam.x, 0, WORLD_W - width);
  cam.y = constrain(cam.y, 0, WORLD_H - height);
}

/************************************************************
 * 14) MAZE CREATION (WALLS)
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
 * 15) COLLISION RESULTS
 ************************************************************/
function circleHitsAnyWall(cx, cy, cr) {
  for (const w of walls) {
    if (circleRectCollision(cx, cy, cr, w.x, w.y, w.w, w.h)) return true;
  }
  return false;
}

/************************************************************
 * 16) ENEMIES (simple bouncing movement)
 ************************************************************/
function spawnEnemies() {
  enemies = [
    { x: 600, y: 150, r: 14, vx: 1, vy: 0, speed: 2 },
    { x: 1200, y: 400, r: 14, vx: 0, vy: 1, speed: 2 },
  ];
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
 * 17) WIN CONDITION (goal zone)
 ************************************************************/
function drawGoal() {
  noStroke();
  fill(0, 200, 100);
  rect(goal.x, goal.y, goal.w, goal.h);
}

/************************************************************
 * 18) DRAWING FUNCTIONS
 ************************************************************/
function drawWorldBounds() {
  // optional
}

function drawMaze() {
  for (const w of walls) {
    drawPipeWall(w);
  }
}

function drawPipeWall(w) {
  push();
  imageMode(CENTER);

  // vertical wall
  if (w.h > w.w) {
    image(
      pipeImg,
      w.x + w.w / 2,
      w.y + w.h / 2,
      w.w,
      w.h
    );
  }
  // horizontal wall
  else {
    translate(w.x + w.w / 2, w.y + w.h / 2);
    rotate(HALF_PI);
    image(pipeImg, 0, 0, w.h, w.w);
  }

  pop();

  noStroke();
  fill(200, 80, 80);
  for (const w of walls) rect(w.x, w.y, w.w, w.h);
}

function drawPlayer() {
  let anim = getCurrentAnimation();

  let sx = player.frameIndex * anim.frameW;
  let sy = 0;
  let sw = anim.frameW;
  let sh = anim.frameH;

  let dw = anim.frameW * player.scale;
  let dh = anim.frameH * player.scale;

  // centered on player.x/y so collision still matches your original system
  let dx = floor(player.x - dw / 2);
  let dy = floor(player.y - dh / 2);

  image(anim.sheet, dx, dy, dw, dh, sx, sy, sw, sh);
}

function drawEnemies() {
  noStroke();
  fill(255, 200, 0);
  for (const e of enemies) circle(e.x, e.y, e.r * 2);
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
 * 19) RESTART
 ************************************************************/
function restartGame() {
  player.x = 120;
  player.y = 120;
  player.direction = "down";
  player.moving = false;
  player.frameIndex = 0;
  player.frameCounter = 0;
  player.currentAnimName = "down_idle";

  health = maxHealth;
  damageCooldown = 0;
  spawnEnemies();
  scene = SCENES.GAME;
}

/************************************************************
 * 20) HELPER COLLISION MATH
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
 * 21) HEALTH BAR
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
 * 22) MONSTER COLLISIONS (damage)
 ************************************************************/
function checkMonsterCollisions() {
  for (const e of enemies) {
    const d = dist(player.x, player.y, e.x, e.y);

    if (d < player.r + e.r) {
      applyDamage(1, " (Enemy Collision!)");
    }
  }
}
