/************************************************************
 * GAS HAZARDS
 ************************************************************/

function getCurrentLevelSettings() {
  return LEVEL_SETTINGS[currentLevel];
}

function buildGasHazards() {
  gasHazards = [];

  // LEVEL 1
  if (currentLevel === 1) {
    gasHazards.push(createGasHazard(700, 170, 120, 45, "horizontal"));
    gasHazards.push(createGasHazard(920, 560, 45, 120, "vertical"));
  }

  // LEVEL 2
  else if (currentLevel === 2) {
    gasHazards.push(createGasHazard(250, 300, 130, 45, "horizontal"));
    gasHazards.push(createGasHazard(850, 250, 45, 130, "vertical"));
    gasHazards.push(createGasHazard(1080, 620, 150, 45, "horizontal"));
  }

  // LEVEL 3
  else if (currentLevel === 3) {
    gasHazards.push(createGasHazard(280, 180, 140, 45, "horizontal"));
    gasHazards.push(createGasHazard(620, 420, 45, 150, "vertical"));
    gasHazards.push(createGasHazard(1000, 260, 160, 45, "horizontal"));
    gasHazards.push(createGasHazard(1220, 650, 45, 150, "vertical"));
  }
}

function createGasHazard(x, y, w, h, direction) {
  const settings = getCurrentLevelSettings();

  return {
    x,
    y,
    w,
    h,
    direction,
    active: false,
    timer: floor(random(settings.gasInactiveMin, settings.gasInactiveMax)),
    damageTimer: 0,
  };
}

function updateGasHazards() {
  const settings = getCurrentLevelSettings();

  for (const g of gasHazards) {
    g.timer--;

    if (g.timer <= 0) {
      g.active = !g.active;

      if (g.active) {
        g.timer = settings.gasActiveDuration;
        g.damageTimer = 0;
      } else {
        g.timer = floor(
          random(settings.gasInactiveMin, settings.gasInactiveMax),
        );
      }
    }

    if (g.active) {
      g.damageTimer++;
    }
  }
}

function drawGasHazards() {
  for (const g of gasHazards) {
    drawGasPipe(g);

    if (g.active) {
      drawGasSpray(g);
    }
  }
}

function drawGasPipe(g) {
  push();
  noStroke();
  fill(80, 80, 80);

  if (g.direction === "horizontal") {
    rect(g.x - 20, g.y + 5, 20, g.h - 10);
  } else {
    rect(g.x + 5, g.y - 20, g.w - 10, 20);
  }

  pop();
}

function drawGasSpray(g) {
  push();

  if (gasGif) {
    image(gasGif, g.x, g.y, g.w, g.h);
  } else {
    noStroke();
    fill(120, 255, 120, 150);
    rect(g.x, g.y, g.w, g.h);
  }

  pop();
}

function gasHitsPlayer(px, py, pr) {
  for (const g of gasHazards) {
    if (!g.active) continue;

    if (circleRectCollision(px, py, pr, g.x, g.y, g.w, g.h)) {
      return g;
    }
  }
  return null;
}

function canMoveIntoGas(px, py, pr) {
  if (!GAS_BLOCKS_PLAYER) return false;
  return gasHitsPlayer(px, py, pr) !== null;
}

function handleGasDamage() {
  const settings = getCurrentLevelSettings();

  for (const g of gasHazards) {
    if (!g.active) continue;

    if (circleRectCollision(player.x, player.y, player.r, g.x, g.y, g.w, g.h)) {
      if (g.damageTimer % settings.gasDamageInterval === 0) {
        applyDamage(GAS_DAMAGE, " (Chemical Gas!)");
      }
    }
  }
}
