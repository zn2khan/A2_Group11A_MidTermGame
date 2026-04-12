/************************************************************
 * 12) PLAYER ANIMATION UPDATE
 ************************************************************/
function updateAnimation() {
  const anim = getCurrentAnimation();
  const animName = player.moving
    ? `${player.direction}_run`
    : `${player.direction}_idle`;

  if (animName !== player.currentAnimName) {
    player.currentAnimName = animName;
    player.frameIndex = 0;
    player.frameCounter = 0;
  }

  player.frameCounter++;

  if (player.frameCounter >= player.frameDelay) {
    player.frameCounter = 0;
    player.frameIndex++;

    if (player.frameIndex >= anim.frames) {
      player.frameIndex = 0;
    }
  }
}

/************************************************************
 * 14) GET CURRENT PLAYER ANIMATION
 ************************************************************/
function getCurrentAnimation() {
  if (player.moving) {
    if (player.direction === "down") {
      return { sheet: sprites.downRun, frames: 8, frameW: 18, frameH: 29 };
    }
    if (player.direction === "up") {
      return { sheet: sprites.upRun, frames: 8, frameW: 18, frameH: 29 };
    }
    if (player.direction === "left") {
      return { sheet: sprites.leftRun, frames: 8, frameW: 18, frameH: 29 };
    }
    if (player.direction === "right") {
      return { sheet: sprites.rightRun, frames: 8, frameW: 18, frameH: 29 };
    }
  } else {
    if (player.direction === "down") {
      return { sheet: sprites.idleDown, frames: 7, frameW: 18, frameH: 29 };
    }
    if (player.direction === "up") {
      return { sheet: sprites.idleUp, frames: 7, frameW: 18, frameH: 29 };
    }
    if (player.direction === "left") {
      return { sheet: sprites.idleLeft, frames: 2, frameW: 18, frameH: 29 };
    }
    if (player.direction === "right") {
      return { sheet: sprites.idleRight, frames: 2, frameW: 18, frameH: 29 };
    }
  }

  return { sheet: sprites.idleDown, frames: 7, frameW: 18, frameH: 29 };
}
