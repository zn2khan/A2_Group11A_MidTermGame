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
