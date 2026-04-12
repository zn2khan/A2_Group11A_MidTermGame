function drawHUD() {
  noStroke();
  fill(255);
  textSize(12);
  textAlign(LEFT, TOP);
  textFont("monospace");
  text("Reach the goal. Avoid walls, gas, and monsters.", 10, 10);
  text("Press I for Instructions", 10, 26);
  text("Level: " + currentLevel + " / " + TOTAL_LEVELS, 10, 42);
}

/************************************************************
 * 22) HEALTH BAR
 ************************************************************/
function drawHealthBar() {
  const barWidth = 200;
  const barHeight = 30;
  const x = width - barWidth - 10;
  const y = 1;

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
  textFont("monospace");
  text("Health: lives player has left", x + 20, y + barHeight + 15);
}
