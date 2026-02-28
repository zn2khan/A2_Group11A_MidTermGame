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
  let endMessage = ""; // "You escaped!" or "Game Over!"
  
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
    speed: 3
  };
  
  // Camera (we’ll center it on the player)
  let cam = { x: 0, y: 0 };
  
  // Maze walls: each wall is {x, y, w, h}
  let walls = [];
  
  // Goal zone (finish)
  let goal = { x: 1450, y: 850, w: 80, h: 80 };
  
  // Enemies: each enemy is {x,y,r,vx,vy,speed}
  let enemies = [];
  
  
  /************************************************************
   * 1) SETUP
   ************************************************************/
  function setup() {
    createCanvas(VIEW_W, VIEW_H);
  
    buildMaze();      // walls array
    spawnEnemies();   // enemies array
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
  }
  
  
  /************************************************************
   * 3) START PAGE
   ************************************************************/
  function drawStart() {
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
    fill(255);
    textAlign(LEFT, TOP);
    textSize(18);
    text("Instructions", 40, 40);
  
    textSize(14);
    text(
      "- Use WASD or Arrow Keys to move\n" +
      "- Avoid walls (they’re chemical hazards)\n" +
      "- Avoid monsters in the maze\n" +
      "- Reach the green goal zone to win\n\n" +
      "Press B to go back",
      40, 80
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
  
    // Check win/lose
    if (circleHitsAnyWall(player.x, player.y, player.r)) {
      endMessage = "Game Over! You touched a chemical wall.";
      scene = SCENES.END;
    }
  
    if (playerHitsEnemy()) {
      endMessage = "Game Over! A monster got you.";
      scene = SCENES.END;
    }
  
    if (rectContainsCircle(goal.x, goal.y, goal.w, goal.h, player.x, player.y, player.r)) {
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
  
    // Optional HUD (on screen, not world)
    drawHUD();
  }
  
  
  /************************************************************
   * 6) FINAL / END SCREEN
   ************************************************************/
  function drawEnd() {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text(endMessage, width / 2, height / 2 - 10);
  
    textSize(14);
    text("Press R to restart (or B for Start Screen)", width / 2, height / 2 + 25);
  }
  
  
  /************************************************************
   * 7) INPUT HANDLING
   ************************************************************/
  function keyPressed() {
    if (scene === SCENES.START) {
      if (keyCode === ENTER) scene = SCENES.GAME;
      if (key === 'i' || key === 'I') scene = SCENES.INSTRUCTIONS;
    } 
    else if (scene === SCENES.INSTRUCTIONS) {
      if (key === 'b' || key === 'B') scene = SCENES.START;
    }
    else if (scene === SCENES.END) {
      if (key === 'r' || key === 'R') restartGame();
      if (key === 'b' || key === 'B') scene = SCENES.START;
    }
  }
  
  
  /************************************************************
   * 8) PLAYER MOVEMENT + COLLISION
   *    (Simple: try move, if it hits wall, cancel that move)
   ************************************************************/
  function updatePlayer() {
    let dx = 0, dy = 0;
  
    const up = keyIsDown(UP_ARROW) || keyIsDown(87);    // W
    const down = keyIsDown(DOWN_ARROW) || keyIsDown(83); // S
    const left = keyIsDown(LEFT_ARROW) || keyIsDown(65); // A
    const right = keyIsDown(RIGHT_ARROW) || keyIsDown(68); // D
  
    if (up) dy -= player.speed;
    if (down) dy += player.speed;
    if (left) dx -= player.speed;
    if (right) dx += player.speed;
  
    // Try X move
    player.x += dx;
    if (circleHitsAnyWall(player.x, player.y, player.r)) player.x -= dx;
  
    // Try Y move
    player.y += dy;
    if (circleHitsAnyWall(player.x, player.y, player.r)) player.y -= dy;
  
    // Keep inside world bounds
    player.x = constrain(player.x, player.r, WORLD_W - player.r);
    player.y = constrain(player.y, player.r, WORLD_H - player.r);
  }
  
  
  /************************************************************
   * 9) CAMERA MOVEMENT (center on player)
   ************************************************************/
  function updateCamera() {
    cam.x = player.x - width / 2;
    cam.y = player.y - height / 2;
  
    cam.x = constrain(cam.x, 0, WORLD_W - width);
    cam.y = constrain(cam.y, 0, WORLD_H - height);
  }
  
  
  /************************************************************
   * 10) MAZE CREATION (WALLS)
   *     Keep it basic: hardcode rectangles for now.
   ************************************************************/
  function buildMaze() {
    walls = [];
  
    // Outer border walls (simple)
    walls.push({ x: 0, y: 0, w: WORLD_W, h: 30 });
    walls.push({ x: 0, y: WORLD_H - 30, w: WORLD_W, h: 30 });
    walls.push({ x: 0, y: 0, w: 30, h: WORLD_H });
    walls.push({ x: WORLD_W - 30, y: 0, w: 30, h: WORLD_H });
  
    // A few internal walls (your group can expand these)
    walls.push({ x: 100, y: 200, w: 600, h: 30 });
    walls.push({ x: 300, y: 350, w: 30, h: 400 });
    walls.push({ x: 500, y: 500, w: 500, h: 30 });
    walls.push({ x: 900, y: 200, w: 30, h: 500 });
    walls.push({ x: 1100, y: 700, w: 350, h: 30 });
  }
  
  
  /************************************************************
   * 11) COLLISION RESULTS
   *     (Right now: touching a wall = instant lose)
   *     Your group can change this to "damage" or "reset"
   ************************************************************/
  function circleHitsAnyWall(cx, cy, cr) {
    for (const w of walls) {
      if (circleRectCollision(cx, cy, cr, w.x, w.y, w.w, w.h)) return true;
    }
    return false;
  }
  
  
  /************************************************************
   * 12) ENEMIES (simple bouncing movement)
   ************************************************************/
  function spawnEnemies() {
    enemies = [
      { x: 600, y: 150, r: 14, vx: 1, vy: 0, speed: 2 },
      { x: 1200, y: 400, r: 14, vx: 0, vy: 1, speed: 2 },
    ];
  }
  
  function updateEnemies() {
    for (const e of enemies) {
      // Try move
      const nx = e.x + e.vx * e.speed;
      const ny = e.y + e.vy * e.speed;
  
      // If would hit a wall, turn (very basic logic)
      if (circleHitsAnyWall(nx, e.y, e.r)) e.vx *= -1;
      else e.x = nx;
  
      if (circleHitsAnyWall(e.x, ny, e.r)) e.vy *= -1;
      else e.y = ny;
  
      // If both vx and vy are 0 (shouldn't happen), set one
      if (e.vx === 0 && e.vy === 0) e.vx = 1;
    }
  }
  
  function playerHitsEnemy() {
    for (const e of enemies) {
      const d = dist(player.x, player.y, e.x, e.y);
      if (d < player.r + e.r) return true;
    }
    return false;
  }
  
  
  /************************************************************
   * 13) WIN CONDITION (goal zone)
   ************************************************************/
  function drawGoal() {
    noStroke();
    fill(0, 200, 100);
    rect(goal.x, goal.y, goal.w, goal.h);
  }
  
  
  /************************************************************
   * 14) DRAWING FUNCTIONS
   ************************************************************/
  function drawWorldBounds() {
    // Optional: background grid or world indicator
  }
  
  function drawMaze() {
    noStroke();
    fill(200, 80, 80); // chemical walls (red-ish)
    for (const w of walls) rect(w.x, w.y, w.w, w.h);
  }
  
  function drawPlayer() {
    noStroke();
    fill(80, 160, 255);
    circle(player.x, player.y, player.r * 2);
  }
  
  function drawEnemies() {
    noStroke();
    fill(255, 200, 0);
    for (const e of enemies) circle(e.x, e.y, e.r * 2);
  }
  
  function drawHUD() {
    fill(255);
    textSize(12);
    textAlign(LEFT, TOP);
    text("Reach the green zone. Avoid walls + monsters.", 10, 10);
  }
  
  
  /************************************************************
   * 15) RESTART
   ************************************************************/
  function restartGame() {
    player.x = 120;
    player.y = 120;
    spawnEnemies();
    scene = SCENES.GAME;
  }
  
  
  /************************************************************
   * 16) HELPER COLLISION MATH
   ************************************************************/
  // Circle vs Rect collision (classic clamp method)
  function circleRectCollision(cx, cy, cr, rx, ry, rw, rh) {
    const closestX = constrain(cx, rx, rx + rw);
    const closestY = constrain(cy, ry, ry + rh);
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) <= cr * cr;
  }
  
  // Goal: rect contains circle (lenient win zone check)
  function rectContainsCircle(rx, ry, rw, rh, cx, cy, cr) {
    return (
      cx > rx && cx < rx + rw &&
      cy > ry && cy < ry + rh
    );
  }