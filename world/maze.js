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
