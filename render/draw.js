/************************************************************
 * 7) GAME LOOP
 ************************************************************/
function drawGame() {
  updatePlayer();
  updateAnimation();
  updateMonsterAnimation();
  updateCamera();
  updateEnemies();
  updateGasHazards();
  handleGasDamage();
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
      player.r,
    )
  ) {
    advanceLevel();
    return;
  }

  push();
  translate(-cam.x, -cam.y);

  drawWorldBackground();
  drawWorldBounds();
  drawGoal();
  drawMaze();
  drawGasHazards();
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

/************************************************************
 * LEVEL ADVANCEMENT
 ************************************************************/
function advanceLevel() {
  if (currentLevel < TOTAL_LEVELS) {
    currentLevel++;
    loadCurrentLevel();
  } else {
    triggerVictory();
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

function drawWorldBounds() {
  // optional
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
