/************************************************************
 * 12) PLAYER ANIMATION UPDATE
 ************************************************************/
function updateAnimation() {
  const anim = getCurrentAnimation();
  const animName = anim.name;

  if (animName !== player.currentAnimName) {
    player.currentAnimName = animName;
    player.frameIndex = 0;
    player.frameCounter = 0;
  }

  player.frameCounter++;

  const frameDelay = anim.frameDelay ?? player.frameDelay;

  if (player.frameCounter >= frameDelay) {
    player.frameCounter = 0;

    if (anim.loop === false) {
      if (player.frameIndex < anim.frames - 1) {
        player.frameIndex++;
      }
    } else {
      player.frameIndex++;
      if (player.frameIndex >= anim.frames) {
        player.frameIndex = 0;
      }
    }
  }
}

/************************************************************
 * 14) GET CURRENT PLAYER ANIMATION
 ************************************************************/
function getCurrentAnimation() {
  // Special frozen / stunned animation
  if (freezeEffect.active && sprites.freeze) {
    return {
      name: "freeze",
      sheet: sprites.freeze,
      frames: 12,
      frameW: 18,
      frameH: 29,
      frameDelay: 6,
      loop: false,
    };
  }

  if (player.moving) {
    if (player.direction === "down") {
      return {
        name: "down_run",
        sheet: sprites.downRun,
        frames: 8,
        frameW: 18,
        frameH: 29,
        frameDelay: 8,
        loop: true,
      };
    }
    if (player.direction === "up") {
      return {
        name: "up_run",
        sheet: sprites.upRun,
        frames: 8,
        frameW: 18,
        frameH: 29,
        frameDelay: 8,
        loop: true,
      };
    }
    if (player.direction === "left") {
      return {
        name: "left_run",
        sheet: sprites.leftRun,
        frames: 8,
        frameW: 18,
        frameH: 29,
        frameDelay: 8,
        loop: true,
      };
    }
    if (player.direction === "right") {
      return {
        name: "right_run",
        sheet: sprites.rightRun,
        frames: 8,
        frameW: 18,
        frameH: 29,
        frameDelay: 8,
        loop: true,
      };
    }
  } else {
    if (player.direction === "down") {
      return {
        name: "down_idle",
        sheet: sprites.idleDown,
        frames: 7,
        frameW: 18,
        frameH: 29,
        frameDelay: 8,
        loop: true,
      };
    }
    if (player.direction === "up") {
      return {
        name: "up_idle",
        sheet: sprites.idleUp,
        frames: 7,
        frameW: 18,
        frameH: 29,
        frameDelay: 8,
        loop: true,
      };
    }
    if (player.direction === "left") {
      return {
        name: "left_idle",
        sheet: sprites.idleLeft,
        frames: 2,
        frameW: 18,
        frameH: 29,
        frameDelay: 8,
        loop: true,
      };
    }
    if (player.direction === "right") {
      return {
        name: "right_idle",
        sheet: sprites.idleRight,
        frames: 2,
        frameW: 18,
        frameH: 29,
        frameDelay: 8,
        loop: true,
      };
    }
  }

  return {
    name: "down_idle",
    sheet: sprites.idleDown,
    frames: 7,
    frameW: 18,
    frameH: 29,
    frameDelay: 8,
    loop: true,
  };
}