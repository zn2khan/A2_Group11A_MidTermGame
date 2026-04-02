/************************************************************
 * 16) MAZE CREATION
 ************************************************************/
let keys = [];
let collectedKeys = 0;
const KEYS_PER_LEVEL = 1;
let keysBuiltForLevel = -1;

function buildMaze() {
  walls = [];
  wallVents = [];
  gasHazards = [];

  // Outer border for all levels
  walls.push({ x: 0, y: 0, w: WORLD_W, h: 30 });
  walls.push({ x: 0, y: WORLD_H - 30, w: WORLD_W, h: 30 });
  walls.push({ x: 0, y: 0, w: 30, h: WORLD_H });
  walls.push({ x: WORLD_W - 30, y: 0, w: 30, h: WORLD_H });

  if (currentLevel === 1) {
    buildLevel1Maze();
    goal = { x: 1450, y: 850, w: 80, h: 80 };
  } else if (currentLevel === 2) {
    buildLevel2Maze();
    goal = { x: 1420, y: 120, w: 80, h: 80 };
  } else if (currentLevel === 3) {
    buildLevel3Maze();
    goal = { x: 1450, y: 820, w: 80, h: 80 };
  }

  buildWallVents();
}

function buildLevel1Maze() {
  walls.push({ x: 100, y: 160, w: 720, h: 30 });
  walls.push({ x: 100, y: 300, w: 520, h: 30 });
  walls.push({ x: 260, y: 300, w: 30, h: 420 });
  walls.push({ x: 460, y: 180, w: 30, h: 380 });
  walls.push({ x: 540, y: 520, w: 520, h: 30 });
  walls.push({ x: 860, y: 180, w: 30, h: 520 });
  walls.push({ x: 1080, y: 700, w: 300, h: 30 });
  walls.push({ x: 1180, y: 430, w: 30, h: 270 });
  walls.push({ x: 640, y: 700, w: 320, h: 30 });
}

function buildLevel2Maze() {
  walls.push({ x: 150, y: 180, w: 800, h: 30 });
  walls.push({ x: 200, y: 380, w: 30, h: 450 });
  walls.push({ x: 420, y: 320, w: 600, h: 30 });
  walls.push({ x: 760, y: 520, w: 30, h: 300 });
  walls.push({ x: 980, y: 160, w: 30, h: 520 });
  walls.push({ x: 1120, y: 680, w: 280, h: 30 });
}

function buildLevel3Maze() {
  walls.push({ x: 120, y: 140, w: 900, h: 30 });
  walls.push({ x: 220, y: 280, w: 30, h: 620 });
  walls.push({ x: 380, y: 280, w: 700, h: 30 });
  walls.push({ x: 520, y: 430, w: 30, h: 420 });
  walls.push({ x: 700, y: 560, w: 650, h: 30 });
  walls.push({ x: 1040, y: 150, w: 30, h: 500 });
  walls.push({ x: 1180, y: 720, w: 250, h: 30 });
}

/************************************************************
 * WALL VENTS
 ************************************************************/
function buildWallVents() {
  const count = VENT_COUNT_BY_LEVEL[currentLevel] || 3;

  const candidates = walls.filter((w) => {
    const isOuterBorder =
      (w.x === 0 && w.w === WORLD_W) ||
      (w.y === 0 && w.h === WORLD_H) ||
      (w.x === WORLD_W - 30) ||
      (w.y === WORLD_H - 30);

    return !isOuterBorder;
  });

  shuffle(candidates, true);

  for (let i = 0; i < min(count, candidates.length); i++) {
    const wall = candidates[i];
    const vent = createVentOnWall(wall);
    if (vent) {
      wallVents.push(vent);
    }
  }
}

function createVentOnWall(wall) {
  const horizontal = wall.w > wall.h;
  const side = horizontal
    ? (random() < 0.5 ? "up" : "down")
    : (random() < 0.5 ? "left" : "right");

  let cx, cy;

  if (horizontal) {
    cx = random(wall.x + 25, wall.x + wall.w - 25);
    cy = side === "up" ? wall.y : wall.y + wall.h;
  } else {
    cx = side === "left" ? wall.x : wall.x + wall.w;
    cy = random(wall.y + 25, wall.y + wall.h - 25);
  }

  return {
    wall,
    side,
    cx,
    cy,
    active: false,
    timer: floor(random(VENT_INACTIVE_MIN, VENT_INACTIVE_MAX)),
    activeDuration: floor(random(VENT_ACTIVE_MIN, VENT_ACTIVE_MAX)),
    burstLength: 0,
    damageTimer: 0,
  };
}

function updateWallVents() {
  for (const v of wallVents) {
    v.timer--;

    if (!v.active) {
      if (v.timer <= 0) {
        v.active = true;
        v.timer = v.activeDuration;
        v.burstLength = 0;
        v.damageTimer = 0;
      }
    } else {
      v.damageTimer++;
      v.burstLength = min(v.burstLength + VENT_GROW_SPEED, VENT_MAX_LENGTH);

      if (v.timer <= 0) {
        v.active = false;
        v.timer = floor(random(VENT_INACTIVE_MIN, VENT_INACTIVE_MAX));
        v.burstLength = 0;
        v.damageTimer = 0;
      }
    }
  }
}

function getWallVentHitbox(v) {
  if (!v.active) {
    return { x: 0, y: 0, w: 0, h: 0 };
  }

  if (v.side === "up") {
    return {
      x: v.cx - VENT_THICKNESS / 2,
      y: v.cy - v.burstLength,
      w: VENT_THICKNESS,
      h: v.burstLength,
    };
  }

  if (v.side === "down") {
    return {
      x: v.cx - VENT_THICKNESS / 2,
      y: v.cy,
      w: VENT_THICKNESS,
      h: v.burstLength,
    };
  }

  if (v.side === "left") {
    return {
      x: v.cx - v.burstLength,
      y: v.cy - VENT_THICKNESS / 2,
      w: v.burstLength,
      h: VENT_THICKNESS,
    };
  }

  return {
    x: v.cx,
    y: v.cy - VENT_THICKNESS / 2,
    w: v.burstLength,
    h: VENT_THICKNESS,
  };
}

function handleWallVentDamage() {
  for (const v of wallVents) {
    if (!v.active) continue;

    const hit = getWallVentHitbox(v);

    if (
      circleRectCollision(
        player.x,
        player.y,
        player.r,
        hit.x,
        hit.y,
        hit.w,
        hit.h
      )
    ) {
      if (v.damageTimer % 18 === 0) {
        applyDamage(VENT_DAMAGE, " (Steam Burst!)");
      }
    }
  }
}

function drawWallVents() {
  for (const v of wallVents) {
    drawWallVentNozzle(v);

    if (v.active) {
      drawWallVentBurst(v);
    }
  }
}

function drawWallVentNozzle(v) {
  push();
  noStroke();
  fill(38, 39, 27);

  if (v.side === "up") {
    rect(v.cx - VENT_NOZZLE_W / 2, v.cy - 4, VENT_NOZZLE_W, 4);
  } else if (v.side === "down") {
    rect(v.cx - VENT_NOZZLE_W / 2, v.cy, VENT_NOZZLE_W, 4);
  } else if (v.side === "left") {
    rect(v.cx - 4, v.cy - VENT_NOZZLE_H / 2, 4, VENT_NOZZLE_H);
  } else if (v.side === "right") {
    rect(v.cx, v.cy - VENT_NOZZLE_H / 2, 4, VENT_NOZZLE_H);
  }

  pop();
}

function drawWallVentBurst(v) {
  const hit = getWallVentHitbox(v);

  if (!pipeBurstImg) {
    push();
    noStroke();
    fill(88, 104, 74);
    rect(hit.x, hit.y, hit.w, hit.h);
    pop();
    return;
  }

  const frameIndex =
    floor(frameCount / PIPE_BURST_FRAME_DELAY) % PIPE_BURST_FRAMES;

  const sx = frameIndex * PIPE_BURST_FRAME_W;
  const sy = 0;

  push();

  if (v.side === "up") {
    image(
      pipeBurstImg,
      v.cx - hit.w / 2,
      hit.y,
      hit.w,
      hit.h,
      sx,
      sy,
      PIPE_BURST_FRAME_W,
      PIPE_BURST_FRAME_H
    );
  } else if (v.side === "down") {
    push();
    translate(v.cx, v.cy + hit.h / 2);
    rotate(PI);
    imageMode(CENTER);
    image(
      pipeBurstImg,
      0,
      0,
      hit.w,
      hit.h,
      sx,
      sy,
      PIPE_BURST_FRAME_W,
      PIPE_BURST_FRAME_H
    );
    imageMode(CORNER);
    pop();
  } else if (v.side === "left") {
    push();
    translate(hit.x + hit.w / 2, v.cy);
    rotate(-HALF_PI);
    imageMode(CENTER);
    image(
      pipeBurstImg,
      0,
      0,
      hit.h,
      hit.w,
      sx,
      sy,
      PIPE_BURST_FRAME_W,
      PIPE_BURST_FRAME_H
    );
    imageMode(CORNER);
    pop();
  } else if (v.side === "right") {
    push();
    translate(hit.x + hit.w / 2, v.cy);
    rotate(HALF_PI);
    imageMode(CENTER);
    image(
      pipeBurstImg,
      0,
      0,
      hit.h,
      hit.w,
      sx,
      sy,
      PIPE_BURST_FRAME_W,
      PIPE_BURST_FRAME_H
    );
    imageMode(CORNER);
    pop();
  }

  pop();
}

/************************************************************
 * MAZE DRAWING
 ************************************************************/
function drawMaze() {
  for (const w of walls) {
    drawPipeWall(w);
  }

  drawWallVents();
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

/************************************************************
 * KEYS
 ************************************************************/
function ensureKeysForCurrentLevel() {
  if (keysBuiltForLevel === currentLevel) return;
  if (walls.length === 0) return;

  buildKeys();
  keysBuiltForLevel = currentLevel;
}

function buildKeys() {
  keys = [];
  collectedKeys = 0;

  for (let i = 0; i < KEYS_PER_LEVEL; i++) {
    const key = createRandomKey();
    if (key) {
      keys.push(key);
    }
  }
}

function createRandomKey() {
  const keyR = 20;
  const padding = 80;

  for (let tries = 0; tries < 600; tries++) {
    const x = random(padding, WORLD_W - padding);
    const y = random(padding, WORLD_H - padding);

    if (isValidKeySpot(x, y, keyR)) {
      return {
        x: x,
        y: y,
        r: keyR,
        collected: false,
      };
    }
  }

  console.log("Could not place key safely on this level");
  return null;
}

function isValidKeySpot(x, y, r) {
  if (circleHitsAnyWall(x, y, r + 10)) return false;

  for (const v of wallVents) {
    const hit = getWallVentHitbox({
      ...v,
      active: true,
      burstLength: VENT_MAX_LENGTH,
    });

    if (circleRectCollision(x, y, r + 14, hit.x, hit.y, hit.w, hit.h)) {
      return false;
    }
  }

  if (goal && circleRectCollision(x, y, r + 30, goal.x, goal.y, goal.w, goal.h)) {
    return false;
  }

  if (player && dist(x, y, player.x, player.y) < 140) {
    return false;
  }

  for (const otherKey of keys) {
    if (dist(x, y, otherKey.x, otherKey.y) < r + otherKey.r + 40) {
      return false;
    }
  }

  return true;
}

function drawKeys() {
  for (const key of keys) {
    if (!key.collected) {
      drawKey(key);
    }
  }
}

function drawKey(key) {
  if (!keySheet) {
    push();
    translate(key.x, key.y);
    stroke(130, 95, 0);
    strokeWeight(3);
    fill(255, 220, 40);
    ellipse(0, 0, key.r * 1.5, key.r * 1.5);
    line(key.r * 0.8, 0, key.r * 2.5, 0);
    line(key.r * 1.7, 0, key.r * 1.7, key.r * 0.7);
    line(key.r * 2.15, 0, key.r * 2.15, key.r * 0.5);
    pop();
    return;
  }

  const frameW = keySheet.width / KEY_COLS;
  const frameH = keySheet.height / KEY_ROWS;
  const frameIndex = floor(frameCount / KEY_FRAME_DELAY) % KEY_FRAMES;

  const sx = (frameIndex % KEY_COLS) * frameW;
  const sy = floor(frameIndex / KEY_COLS) * frameH;

  const drawSize = 70;

  push();
  imageMode(CENTER);
  image(
    keySheet,
    key.x,
    key.y,
    drawSize,
    drawSize,
    sx,
    sy,
    frameW,
    frameH
  );
  imageMode(CORNER);
  pop();
}

function handleKeyPickup() {
  for (const key of keys) {
    if (key.collected) continue;

    if (dist(player.x, player.y, key.x, key.y) < player.r + key.r + 6) {
      key.collected = true;
      collectedKeys++;

      if (sndCoin) {
        sndCoin.play();
      }
    }
  }
}

function hasAllKeys() {
  return collectedKeys >= KEYS_PER_LEVEL;
}

function drawKeyUI() {
  push();
  fill(255);
  noStroke();
  textSize(14);
  textAlign(LEFT, TOP);
  textFont("monospace");
  text("Keys: " + collectedKeys + "/" + KEYS_PER_LEVEL, 10, 74);
  pop();
}