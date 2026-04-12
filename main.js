/************************************************************
 * 1) PRELOAD
 ************************************************************/
function preload() {
  // Heart HUD
  fullHeartImg = loadImage("assets/images/full_heart.png");
  emptyHeartImg = loadImage("assets/images/empty_heart.png");

  // Player animations
  sprites.downRun = loadImage("assets/images/down_run_animation.png");
  sprites.leftRun = loadImage("assets/images/left_run_animation.png");
  sprites.rightRun = loadImage("assets/images/right_run_animation.png");
  sprites.upRun = loadImage("assets/images/up_run_animation.png");

  sprites.idleDown = loadImage("assets/images/idle_animation.png");
  sprites.idleUp = loadImage("assets/images/idle_animation_backside.png");
  sprites.idleLeft = loadImage("assets/images/idle_animation_L.png");
  sprites.idleRight = loadImage("assets/images/idle_animation_R.png");
  sprites.freeze = loadImage("assets/images/damage_animation.png");

  // Screen / environment images
  startBg = loadImage("assets/images/GBDA302_Background.png");
  gameBg = loadImage("assets/images/background.png");
  pipeImg = loadImage("assets/images/pipe.png");
  doorImg = loadImage("assets/images/door.png");
  burstPipeSheet = loadImage("assets/images/pipes-bursting-spritesheet.png");
  pipeBurstImg = loadImage("assets/images/pipe_burst.png");
  keySheet = loadImage("assets/images/key_spritesheet.png");

  // Placeholder gas gif path
  gasGif = null;

  // Enemy + cutscene
  monsterSheet = loadImage("assets/images/monster.png");
  cutsceneGif = loadImage("assets/images/cutscene.gif");

  // Audio
  sndBackground = loadSound("assets/music/background.mp3");
  sndBubbling = loadSound("assets/music/bubbling.mp3");
  sndCoin = loadSound("assets/music/coin.mp3");
  sndDamage = loadSound("assets/music/damage.mp3");
  sndFallingManhole = loadSound("assets/music/fallingManhole.mp3");
  sndFootsteps = loadSound("assets/music/footsteps.mp3");
  sndGameOver = loadSound("assets/music/gameOver.mp3");
  sndGutterWater = loadSound("assets/music/gutterWater.mp3");
  sndIntroduction = loadSound("assets/music/introduction.mp3");
  sndMonsterSound = loadSound("assets/music/monsterSound.mp3");
  sndStartSound = loadSound("assets/music/startSound.mp3");
  sndSteam = loadSound("assets/music/steam.mp3");
  sndVictory = loadSound("assets/music/victory.mp3");
  sndWaterDrip = loadSound("assets/music/waterDrip.mp3");
}

/************************************************************
 * 2) SETUP
 ************************************************************/
function setup() {
  VIEW_W = windowWidth;
  VIEW_H = windowHeight;
  createCanvas(VIEW_W, VIEW_H);
  noSmooth();
  textFont("monospace");

  loadCurrentLevel();
}

function windowResized() {
  VIEW_W = windowWidth;
  VIEW_H = windowHeight;
  resizeCanvas(VIEW_W, VIEW_H);
}

/************************************************************
 * 3) MAIN DRAW LOOP
 ************************************************************/
function draw() {
  background(20);

  if (scene === SCENES.START) drawStart();
  else if (scene === SCENES.INSTRUCTIONS) drawInstructions();
  else if (scene === SCENES.CUTSCENE) drawCutscene();
  else if (scene === SCENES.GAME) drawGame();
  else if (scene === SCENES.END) drawEnd();

  handleSceneAudio();

  if (damageCooldown > 0) {
    damageCooldown--;
  }
}

/************************************************************
 * 9) INPUT HANDLING
 ************************************************************/
function keyPressed() {
  userStartAudio();

  if (scene === SCENES.START) {
    if (keyCode === ENTER) startCutscene();
    if (key === "i" || key === "I") scene = SCENES.INSTRUCTIONS;
  } else if (scene === SCENES.INSTRUCTIONS) {
    if (key === "b" || key === "B") scene = SCENES.START;
    if (key === "g" || key === "G") scene = SCENES.GAME;
  } else if (scene === SCENES.CUTSCENE) {
    if (key === " " || keyCode === 32) {
      scene = SCENES.GAME;
    }
  } else if (scene === SCENES.GAME) {
    if (key === "i" || key === "I") scene = SCENES.INSTRUCTIONS;
  } else if (scene === SCENES.END) {
    if (key === "r" || key === "R") restartGame();
    if (key === "b" || key === "B") scene = SCENES.START;
  }
}
