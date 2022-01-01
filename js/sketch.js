let tennisBallTexture;
let groundTexture;
let font;

let defaultCursor;
let pointerCursor;

let renderer;
let canvas;
let camera;

let mouseSensitivity;
let moveSpeed;

let groundSize = 2048;
let numSquares = 20;

let numImages = 0;

let isPointerLocked;
let isPointingToSphere;

function preload() {
  tennisBallTexture = loadImage("img/tennis-ball.jpg");
  font = loadFont("font/open-sans.ttf");
}

function setup() {
  mouseSensitivity = 1 / windowWidth;
  moveSpeed = 4;

  renderer = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas = renderer.elt;
  camera = createCamera();
  camera.move(0, -50, 0);
  camera.getPosition = () =>
    createVector(camera.eyeX, camera.eyeY, camera.eyeZ);
  camera.getLookPosition = () =>
    createVector(camera.centerX, camera.centerY, camera.centerZ);
  camera.getDirection = () =>
    p5.Vector.sub(camera.getLookPosition(), camera.getPosition()).normalize();

  push();
  defaultCursor = createImg("img/mouse-default.png", "default cursor");
  defaultCursor.position(windowWidth / 2, windowHeight / 2);
  defaultCursor.hide();

  pointerCursor = createImg("img/mouse-pointer.png", "pointer cursor");
  pointerCursor.position(windowWidth / 2, windowHeight / 2);
  pointerCursor.hide();
  pop();

  canvas.addEventListener("click", () => canvas.requestPointerLock());

  document.addEventListener("pointerlockchange", (e) => {
    if (document.pointerLockElement === canvas) {
      document.addEventListener("mousemove", onMouseMove);
      defaultCursor.show();
      isPointerLocked = true;
    } else {
      document.removeEventListener("mousemove", onMouseMove);
      defaultCursor.hide();
      isPointerLocked = false;
    }
  });

  angleMode(RADIANS);

  groundTexture = createGraphics(2048, 2048);
  groundTexture.background(255);
  groundTexture.stroke(0);
  const squareSize = groundSize / numSquares;
  for (let i = 0; i < groundSize; i += squareSize) {
    groundTexture.line(i, 0, i, groundSize);
    groundTexture.line(0, i, groundSize, i);
  }
}

function draw() {
  clear();

  // const cameraPos = createVector(camera.eyeX, camera.eyeZ);
  let cameraPos = camera.getPosition();
  cameraPos = createVector(cameraPos.x, cameraPos.z);
  let lookingPos = camera.getLookPosition();
  lookingPos = createVector(lookingPos.x, lookingPos.z);
  const lookingDir = p5.Vector.sub(lookingPos, cameraPos);
  const forwardMoveVec = p5.Vector.normalize(lookingDir).mult(moveSpeed);
  const sidewaysMoveVec = p5.Vector.rotate(forwardMoveVec, HALF_PI);
  if (keyIsDown(87))
    // w
    camera.setPosition(
      camera.eyeX + forwardMoveVec.x,
      camera.eyeY,
      camera.eyeZ + forwardMoveVec.y
    );
  // camera.move(0, 0, -moveSpeed);
  if (keyIsDown(83))
    // s
    camera.setPosition(
      camera.eyeX - forwardMoveVec.x,
      camera.eyeY,
      camera.eyeZ - forwardMoveVec.y
    );
  if (keyIsDown(65))
    // a
    camera.setPosition(
      camera.eyeX - sidewaysMoveVec.x,
      camera.eyeY,
      camera.eyeZ - sidewaysMoveVec.y
    );
  if (keyIsDown(68))
    // d
    camera.setPosition(
      camera.eyeX + sidewaysMoveVec.x,
      camera.eyeY,
      camera.eyeZ + sidewaysMoveVec.y
    );

  const spherePos = createVector(-40, 0, 0);
  const sphereRadius = 80;
  const isColliding = collideSphere(
    spherePos,
    sphereRadius,
    camera.getPosition(),
    camera.getDirection()
  );
  if (isColliding) {
    defaultCursor.hide();
    pointerCursor.show();
    window.addEventListener("click", onSphereClick);
  } else {
    defaultCursor.show();
    pointerCursor.hide();
    window.removeEventListener("click", onSphereClick);
  }

  push();
  translate(spherePos.x, spherePos.y, spherePos.z);
  rotateY(millis() / 1000);
  texture(tennisBallTexture);
  noStroke();
  sphere(sphereRadius, 8, 8);
  pop();

  push();
  textFont(font);
  textSize(50);
  textAlign(CENTER, CENTER);
  rotateX(cos(millis() * 0.002) * 0.25);
  rotateY(sin(millis() * 0.001) * 0.5);
  translate(0, 0, 50);
  fill(255, 0, 0);
  text("goober", 60, -40);
  pop();

  push();
  noStroke();
  texture(groundTexture);
  translate(0, 80, 0);
  rotateX(HALF_PI);
  plane(1024, 1024);
  pop();

  for (let i = 0; i < numImages; i++) {
    const j = i % 3;
    const k = Math.floor(i / 3);
    push();
    translate(
      -groundSize / 4 + j * tennisBallTexture.width,
      79.99,
      -groundSize / 4 + k * tennisBallTexture.height
    );
    rotateX(HALF_PI);
    image(tennisBallTexture, 0, 0);
    pop();
  }
}

function onMouseMove(e) {
  camera.tilt(e.movementY * mouseSensitivity);
  camera.pan(e.movementX * -mouseSensitivity);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  mouseSensitivity = 1 / windowWidth;
  defaultCursor.position(windowWidth / 2, windowHeight / 2);
  pointerCursor.position(windowWidth / 2, windowHeight / 2);
}

function collideSphere(center, radius, rayOrigin, rayDirection) {
  const oc = p5.Vector.sub(rayOrigin, center);
  const a = p5.Vector.dot(rayDirection, rayDirection);
  const b = 2.0 * p5.Vector.dot(oc, rayDirection);
  const c = p5.Vector.dot(oc, oc) - radius * radius;
  const discriminant = b * b - 4 * a * c;
  return discriminant > 0;
}

function onSphereClick() {
  if (!isPointerLocked) return;
  numImages += 1;
}
