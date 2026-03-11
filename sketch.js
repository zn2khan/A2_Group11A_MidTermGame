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

// World settings (bigger than screen so camera matters)
const VIEW_W = 800;
const VIEW_H = 500;
const WORLD_W = 1600;
const WORLD_H = 1000;

// Player
let player = {
  x: 120,
  y: 120,
  r: 14,
  speed: 3,

  // animation / facing
  facing: "down",   // "up", "down", "left", "right"
  moving: false,
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
let wallDamage = 1; // health lost per wall bump (tune as needed)

/************************************************************
 * PLAYER SPRITES / ANIMATION
 ************************************************************/
let idleDownSheet;
let idleUpSheet;
let idleLeftSheet;
let idleRightSheet;

let runDownSheet;
let runUpSheet;
let runLeftSheet;
let runRightSheet;

// frame info based on your uploaded sheets
const SPRITE_FRAME_W = 18;
const SPRITE_FRAME_H = 29;

// draw size on canvas
const PLAYER_DRAW_W = 36;
const PLAYER_DRAW_H = 58;

// animation timing
let animCounter = 0;
const ANIM_SPEED = 8; // lower = faster

const anims = {
  idleDown: { sheet: null, frames: 7 },
  idleUp: { sheet: null, frames: 7 },
  idleLeft: { sheet: null, frames: 2 },
  idleRight: { sheet: null, frames: 2 },
  runDown: { sheet: null, frames: 8 },
  runUp: { sheet: null, frames: 8 },
  runLeft: { sheet: null, frames: 8 },
  runRight: { sheet: null, frames: 8 },
};

/************************************************************
 * 1) SETUP
 ************************************************************/
function preload() {
  health3 = loadImage("assets/images/fullHealthBar.png");
  health2 = loadImage("assets/images/2LifeHealthBar.png");
  health1 = loadImage("assets/images/1LifeHealthBar.png");

  // character sprite sheets
  idleDownSheet = loadImage("assets/images/idle_animation.png");
  idleUpSheet = loadImage("assets/images/idle_animation_backside.png");
  idleLeftSheet = loadImage("assets/images/idle_animation_L.png");
  idleRightSheet = loadImage("assets/images/idle_animation_R.png");

  runDownSheet = loadImage("assets/images/down_run_animation.png");
  runUpSheet = loadImage("assets/images/up_run_animation.png");
  runLeftSheet = loadImage("assets/images/left_run_animation.png");
  runRightSheet = loadImage("assets/images/right_run_animation.png");
}

function setup() {
  createCanvas(VIEW_W, VIEW_H);

  anims.idleDown.sheet = idleDownSheet;
  anims.idleUp.sheet = idleUpSheet;
  anims.idleLeft.sheet = idleLeftSheet;
  anims.idleRight.sheet = idleRightSheet;
  anims.runDown.sheet = runDownSheet;
  anims.runUp.sheet = runUpSheet;
  anims.runLeft.sheet = runLeftSheet;
  anims.runRight.sheet = runRightSheet;

  buildMaze();
  spawnEnemies();
}

/************************************************************
 * 2) MAIN DRAW LOOP (SCENE MANAGER)
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
 * 3) START PAGE
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
 * 4) INSTRUCTIONS PAGE
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
      "- Movement is only up, down, left, or right\n" +
      "- Avoid walls (they’re chemical hazards)\n" +
      "- Avoid monsters in the maze\n" +
      "- Reach the green goal zone to win\n\n" +
      "Press B to go back",
    40,
    80,
  );
}

/************************************************************
 * 5) GAME LOOP (UPDATE + DRAW)
 ************************************************************/
function drawGame() {
  // Update
  updatePlayer();
  updateCamera();
  updateEnemies();

  // Check lose (health only) + win
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
      player.r,
    )
  ) {
    endMessage = "You escaped! 🎉";
    scene = SCENES.END;
  }

  // Draw world with camera transform
  push();
  translate(-cam.x, -cam.y);

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
 * 6) FINAL / END SCREEN
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
    height / 2 + 25,
  );
}

/************************************************************
 * 7) INPUT HANDLING
 ************************************************************/
function keyPressed() {
  if (scene === SCENES.START) {
    if (keyCode === ENTER) scene = SCENES.GAME;
    if (key === "i" || key === "I") scene = SCENES.INSTRUCTIONS;
  } else if (scene === SCENES.INSTRUCTIONS) {
    if (key === "b" || key === "B") scene = SCENES.START;
  } else if (scene === SCENES.END) {
    if (key === "r" || key === "R") restartGame();
    if (key === "b" || key === "B") scene = SCENES.START;
  }
}

/************************************************************
 * 8) DAMAGE HELPER
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
 * 9) PLAYER MOVEMENT + COLLISION
 *    Strict 4-direction movement, no diagonal
 ************************************************************/
function updatePlayer() {
  let dx = 0;
  let dy = 0;

  const up = keyIsDown(UP_ARROW) || keyIsDown(87); // W
  const down = keyIsDown(DOWN_ARROW) || keyIsDown(83); // S
  const left = keyIsDown(LEFT_ARROW) || keyIsDown(65); // A
  const right = keyIsDown(RIGHT_ARROW) || keyIsDown(68); // D

  player.moving = false;

  // PRIORITY: vertical first, then horizontal
  // this prevents diagonal movement
  if (up && !down) {
    dy = -player.speed;
    player.facing = "up";
    player.moving = true;
  } else if (down && !up) {
    dy = player.speed;
    player.facing = "down";
    player.moving = true;
  } else if (left && !right) {
    dx = -player.speed;
    player.facing = "left";
    player.moving = true;
  } else if (right && !left) {
    dx = player.speed;
    player.facing = "right";
    player.moving = true;
  }

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

  // Keep inside world bounds
  player.x = constrain(player.x, player.r, WORLD_W - player.r);
  player.y = constrain(player.y, player.r, WORLD_H - player.r);

  checkMonsterCollisions();
}

/************************************************************
 * 10) CAMERA MOVEMENT (center on player)
 ************************************************************/
function updateCamera() {
  cam.x = player.x - width / 2;
  cam.y = player.y - height / 2;

  cam.x = constrain(cam.x, 0, WORLD_W - width);
  cam.y = constrain(cam.y, 0, WORLD_H - height);
}

/************************************************************
 * 11) MAZE CREATION (WALLS)
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
 * 12) COLLISION RESULTS
 ************************************************************/
function circleHitsAnyWall(cx, cy, cr) {
  for (const w of walls) {
    if (circleRectCollision(cx, cy, cr, w.x, w.y, w.w, w.h)) return true;
  }
  return false;
}

/************************************************************
 * 13) ENEMIES (simple bouncing movement)
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
 * 14) WIN CONDITION (goal zone)
 ************************************************************/
function drawGoal() {
  noStroke();
  fill(0, 200, 100);
  rect(goal.x, goal.y, goal.w, goal.h);
}

/************************************************************
 * 15) DRAWING FUNCTIONS
 ************************************************************/
function drawWorldBounds() {
  // Optional
}

function drawMaze() {
  noStroke();
  fill(200, 80, 80);
  for (const w of walls) rect(w.x, w.y, w.w, w.h);
}

function drawPlayer() {
  const anim = getCurrentAnimation();
  const frameIndex = floor(animCounter / ANIM_SPEED) % anim.frames;
  const sx = frameIndex * SPRITE_FRAME_W;
  const sy = 0;

  image(
    anim.sheet,
    player.x - PLAYER_DRAW_W / 2,
    player.y - PLAYER_DRAW_H / 2,
    PLAYER_DRAW_W,
    PLAYER_DRAW_H,
    sx,
    sy,
    SPRITE_FRAME_W,
    SPRITE_FRAME_H,
  );

  if (player.moving) {
    animCounter++;
  } else {
    // still animate idle, just more slowly
    if (frameCount % 12 === 0) animCounter++;
  }
}

function getCurrentAnimation() {
  if (player.moving) {
    if (player.facing === "up") return anims.runUp;
    if (player.facing === "down") return anims.runDown;
    if (player.facing === "left") return anims.runLeft;
    if (player.facing === "right") return anims.runRight;
  } else {
    if (player.facing === "up") return anims.idleUp;
    if (player.facing === "down") return anims.idleDown;
    if (player.facing === "left") return anims.idleLeft;
    if (player.facing === "right") return anims.idleRight;
  }

  return anims.idleDown;
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
}

/************************************************************
 * 16) RESTART
 ************************************************************/
function restartGame() {
  player.x = 120;
  player.y = 120;
  player.facing = "down";
  player.moving = false;

  health = maxHealth;
  damageCooldown = 0;
  animCounter = 0;

  spawnEnemies();
  scene = SCENES.GAME;
}

/************************************************************
 * 17) HELPER COLLISION MATH
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
 * 18) Health Bar
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
 * 19) MONSTER COLLISIONS (damage)
 ************************************************************/
function checkMonsterCollisions() {
  for (const e of enemies) {
    const d = dist(player.x, player.y, e.x, e.y);

    if (d < player.r + e.r) {
      applyDamage(1, " (Enemy Collision!)");
    }
  }
}
