/************************************************************
 * 4) START PAGE
 ************************************************************/
function drawStart() {
  background(0);

  startFullGameMusic();

  if (startBg) {
    image(startBg, 0, 0, width, height);
  }

  noStroke();
  fill(0, 0, 0, 185);
  rect(0, height - 120, width, 120);

  drawPixelBox(width / 2 - 170, height - 90, 340, 34);
  drawPixelBox(width / 2 - 170, height - 46, 340, 34);

  textAlign(CENTER, CENTER);
  textFont("monospace");

  fill(240, 255, 200);
  textSize(20);
  text("PRESS ENTER TO START", width / 2, height - 73);

  fill(220);
  textSize(16);
  text("PRESS I FOR INSTRUCTIONS", width / 2, height - 29);
}

/************************************************************
 * 5) INSTRUCTIONS PAGE
 ************************************************************/
function drawInstructions() {
  background(10);
  noStroke();
  fill(255);
  textAlign(LEFT, TOP);
  textFont("monospace");

  textSize(22);
  text("INSTRUCTIONS", 40, 40);

  textSize(15);
  text(
    "- Use WASD or Arrow Keys to move\n" +
      "- Character only moves up, down, left, or right\n" +
      "- Avoid walls (they're chemical hazards)\n" +
      "- Avoid monsters in the maze\n" +
      "- Reach the green goal zone to win\n\n" +
      "Press B to go back to the Start Screen\n" +
      "Press G to return to the game",
    40,
    90,
  );
}

/************************************************************
 * 6) CUTSCENE
 ************************************************************/
function startCutscene() {
  cutsceneStartTime = millis();
  scene = SCENES.CUTSCENE;
}

function drawCutscene() {
  background(0);

  if (cutsceneGif) {
    const maxW = width * 0.92;
    const maxH = height * 0.78;

    const scale = min(maxW / cutsceneGif.width, maxH / cutsceneGif.height);

    const dw = floor(cutsceneGif.width * scale);
    const dh = floor(cutsceneGif.height * scale);

    const dx = floor((width - dw) / 2);
    const dy = floor((height - dh) / 2) - 10;

    imageMode(CORNER);
    image(cutsceneGif, dx, dy, dw, dh);
  } else {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Cutscene loading...", width / 2, height / 2);
  }

  fill(255);
  textAlign(CENTER, BOTTOM);
  textSize(14);
  text("Press SPACE to skip", width / 2, height - 18);

  if (millis() - cutsceneStartTime >= cutsceneDuration) {
    scene = SCENES.GAME;
  }
}

/************************************************************
 * 8) END SCREEN
 ************************************************************/
function drawEnd() {
  background(0);
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textFont("monospace");

  textSize(26);
  text(endMessage, width / 2, height / 2 - 20);

  textSize(15);
  text("Press R to restart", width / 2, height / 2 + 20);
  text("Press B for Start Screen", width / 2, height / 2 + 45);
}
