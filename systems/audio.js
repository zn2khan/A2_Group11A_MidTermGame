function handleSceneAudio() {
  if (scene === previousScene) return;

  if (
    scene === SCENES.START ||
    scene === SCENES.CUTSCENE ||
    scene === SCENES.GAME
  ) {
    startFullGameMusic();

    if (scene === SCENES.GAME) {
      if (
        sndGutterWater &&
        getAudioContext().state === "running" &&
        !sndGutterWater.isPlaying()
      ) {
        sndGutterWater.setLoop(true);
        sndGutterWater.setVolume(0.12);
        sndGutterWater.play();
      }

      if (
        sndSteam &&
        getAudioContext().state === "running" &&
        !sndSteam.isPlaying()
      ) {
        sndSteam.setLoop(true);
        sndSteam.setVolume(0.1);
        sndSteam.play();
      }
    } else {
      if (sndGutterWater && sndGutterWater.isPlaying()) {
        sndGutterWater.stop();
      }
      if (sndSteam && sndSteam.isPlaying()) {
        sndSteam.stop();
      }
      if (sndFootsteps && sndFootsteps.isPlaying()) {
        sndFootsteps.stop();
      }
    }
  } else if (scene === SCENES.INSTRUCTIONS) {
    if (sndFootsteps && sndFootsteps.isPlaying()) {
      sndFootsteps.stop();
    }
  } else if (scene === SCENES.END) {
    stopAllSounds();

    if (getAudioContext().state === "running") {
      if (endSoundType === "victory" && sndVictory) {
        sndVictory.setVolume(0.65);
        sndVictory.play();
      } else if (endSoundType === "gameOver" && sndGameOver) {
        sndGameOver.setVolume(0.65);
        sndGameOver.play();
      }
    }
  }

  previousScene = scene;
}

/************************************************************
 * 24) SOUND HELPERS
 ************************************************************/
function stopAllSounds() {
  const allSounds = [
    sndBackground,
    sndBubbling,
    sndCoin,
    sndDamage,
    sndFallingManhole,
    sndFootsteps,
    sndGameOver,
    sndGutterWater,
    sndIntroduction,
    sndMonsterSound,
    sndStartSound,
    sndSteam,
    sndVictory,
    sndWaterDrip,
  ];

  for (const s of allSounds) {
    if (s && s.isPlaying()) {
      s.stop();
    }
  }
}

function startFullGameMusic() {
  if (!sndBackground) return;
  if (getAudioContext().state !== "running") return;

  if (!sndBackground.isPlaying()) {
    sndBackground.setLoop(true);
    sndBackground.setVolume(0.18);
    sndBackground.play();
  }
}

function updateFootstepSound() {
  if (!sndFootsteps) return;

  if (getAudioContext().state !== "running" || scene !== SCENES.GAME) {
    if (sndFootsteps.isPlaying()) {
      sndFootsteps.stop();
    }
    return;
  }

  if (player.moving) {
    if (!sndFootsteps.isPlaying()) {
      sndFootsteps.setLoop(true);
      sndFootsteps.setVolume(0.22);
      sndFootsteps.play();
    }
  } else {
    if (sndFootsteps.isPlaying()) {
      sndFootsteps.stop();
    }
  }
}

function triggerVictory() {
  stopAllSounds();
  endMessage = "You escaped all 3 levels! 🎉";
  endSoundType = "victory";
  scene = SCENES.END;
}

function triggerGameOver() {
  stopAllSounds();
  endMessage = "Game Over! You ran out of health.";
  endSoundType = "gameOver";
  scene = SCENES.END;
}

/************************************************************
 * LEVEL LOADING
 ************************************************************/
function loadCurrentLevel() {
  levelStartTime = millis();

  player.x = 120;
  player.y = 120;
  player.direction = "down";
  player.moving = false;
  player.frameIndex = 0;
  player.frameCounter = 0;
  player.currentAnimName = "down_idle";

  monsterFrameIndex = 0;
  monsterFrameCounter = 0;

  damageCooldown = 0;
  damageText = "";
  damageTextTimer = 0;

  buildMaze();
  buildGasHazards();
  spawnEnemies();
}

/************************************************************
 * 20) RESTART
 ************************************************************/
function restartGame() {
  stopAllSounds();

  currentLevel = 1;
  health = maxHealth;
  endMessage = "";
  endSoundType = "";
  lastMonsterSoundTime = -9999;

  loadCurrentLevel();
  scene = SCENES.GAME;

  startFullGameMusic();

  if (getAudioContext().state === "running") {
    if (sndGutterWater && !sndGutterWater.isPlaying()) {
      sndGutterWater.setLoop(true);
      sndGutterWater.setVolume(0.12);
      sndGutterWater.play();
    }

    if (sndSteam && !sndSteam.isPlaying()) {
      sndSteam.setLoop(true);
      sndSteam.setVolume(0.1);
      sndSteam.play();
    }
  }
}
