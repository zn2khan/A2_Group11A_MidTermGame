/************************************************************
 * 21) HELPER COLLISION MATH
 ************************************************************/
function circleRectCollision(cx, cy, cr, rx, ry, rw, rh) {
  const closestX = constrain(cx, rx, rx + rw);
  const closestY = constrain(cy, ry, ry + rh);
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy <= cr * cr;
}

function rectContainsCircle(rx, ry, rw, rh, cx, cy, cr) {
  return cx > rx && cx < rx + rw && cy > ry && cy < ry + rh;
}

/************************************************************
 * 17) COLLISION RESULTS
 ************************************************************/
function circleHitsAnyWall(cx, cy, cr) {
  for (const w of walls) {
    if (circleRectCollision(cx, cy, cr, w.x, w.y, w.w, w.h)) return true;
  }
  return false;
}
