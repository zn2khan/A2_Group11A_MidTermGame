/************************************************************
 * 18) ENEMIES
 ************************************************************/
function spawnEnemies() {
  enemies = [];

  const enemyCount = 8;
  const maxAttemptsPerEnemy = 200;

  for (let i = 0; i < enemyCount; i++) {
    let placed = false;

    for (let attempt = 0; attempt < maxAttemptsPerEnemy; attempt++) {
      const x = random(60, WORLD_W - 60);
      const y = random(60, WORLD_H - 60);
      const r = 14;

      if (circleHitsAnyWall(x, y, r)) continue;
      if (dist(x, y, 120, 120) < 140) continue;

      if (
        x > goal.x - 80 &&
        x < goal.x + goal.w + 80 &&
        y > goal.y - 80 &&
        y < goal.y + goal.h + 80
      ) {
        continue;
      }

      let tooClose = false;
      for (const e of enemies) {
        if (dist(x, y, e.x, e.y) < 80) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      let vx = 0;
      let vy = 0;
      const dir = floor(random(4));

      if (dir === 0) vx = 1;
      else if (dir === 1) vx = -1;
      else if (dir === 2) vy = 1;
      else vy = -1;

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
 * 23) MONSTER COLLISIONS
 ************************************************************/
function checkMonsterCollisions() {
  for (const e of enemies) {
    const d = dist(player.x, player.y, e.x, e.y);
    if (d < player.r + e.r) {
      if (damageCooldown <= 0) {
        const now = millis();

        if (
          sndMonsterSound &&
          getAudioContext().state === "running" &&
          now - lastMonsterSoundTime > 350
        ) {
          sndMonsterSound.setVolume(0.6);
          sndMonsterSound.play();
          lastMonsterSoundTime = now;
        }

        applyDamage(1, " (Enemy Collision!)");
      }
    }
  }
}

/************************************************************
 * 13) MONSTER ANIMATION UPDATE
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
