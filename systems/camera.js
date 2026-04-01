/************************************************************
 * 15) CAMERA MOVEMENT
 ************************************************************/
function updateCamera() {
  cam.x = player.x - width / 2;
  cam.y = player.y - height / 2;

  cam.x = constrain(cam.x, 0, WORLD_W - width);
  cam.y = constrain(cam.y, 0, WORLD_H - height);
}
