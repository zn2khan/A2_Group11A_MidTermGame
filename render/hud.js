function drawHUD() {
  noStroke();
  fill(255);
  textSize(12);
  textAlign(LEFT, TOP);
  textFont("monospace");
  text("Reach the goal. Avoid walls, gas, and monsters.", 10, 10);
  text("Press I for Instructions", 10, 26);
  text("Level: " + currentLevel + " / " + TOTAL_LEVELS, 10, 42);

  let currentTime = millis() - levelStartTime;
  let seconds = (currentTime / 1000).toFixed(2);
  text("Time: " + seconds + "s", 10, 58);
}

/************************************************************
 * 22) HEALTH BAR
 ************************************************************/
function drawHealthBar() {
  const heartW = 36;
  const heartH = 30;
  const spacing = 8;

  const totalWidth = maxHealth * heartW + (maxHealth - 1) * spacing;
  const x = width - totalWidth - 12;
  const y = 8;

  for (let i = 0; i < maxHealth; i++) {
    const heartX = x + i * (heartW + spacing);

    if (i < health) {
      image(fullHeartImg, heartX, y, heartW, heartH);
    } else {
      image(emptyHeartImg, heartX, y, heartW, heartH);
    }
  }

  fill(255);
  noStroke();
  textSize(12);
  textFont("monospace");
  text("Health", x, y + heartH + 8);
}
