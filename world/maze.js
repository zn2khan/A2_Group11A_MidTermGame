/************************************************************
 * 16) MAZE CREATION
 ************************************************************/
function buildMaze() {
  walls = [];

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
