let tennisBallTexture
let groundTexture
let font

let defaultCursor
let pointerCursor

let renderer
let canvas
let camera

let mouseSensitivity
let moveSpeed

let groundSize = 2048
let numSquares = 20
const squareSize = groundSize / numSquares

let numImages = 0

let isPointerLocked

function preload() {
  tennisBallTexture = loadImage('img/tennis-ball.jpg')
  font = loadFont('font/open-sans.ttf')
}

function setup() {
  mouseSensitivity = 1 / windowWidth
  moveSpeed = 4

  renderer = createCanvas(windowWidth, windowHeight, WEBGL)
  canvas = renderer.elt
  camera = createCamera()
  camera.move(0, -50, 0)
  camera.getPosition = () => createVector(camera.eyeX, camera.eyeY, camera.eyeZ)
  camera.getLookPosition = () =>
    createVector(camera.centerX, camera.centerY, camera.centerZ)
  camera.getDirection = () =>
    p5.Vector.sub(camera.getLookPosition(), camera.getPosition()).normalize()

  push()
  defaultCursor = createImg('img/mouse-default.png', 'default cursor')
  defaultCursor.position(windowWidth / 2, windowHeight / 2)
  defaultCursor.hide()

  pointerCursor = createImg('img/mouse-pointer.png', 'pointer cursor')
  pointerCursor.position(windowWidth / 2, windowHeight / 2)
  pointerCursor.hide()
  pop()

  canvas.requestPointerLock()
  canvas.addEventListener('click', () => canvas.requestPointerLock())

  document.addEventListener('pointerlockchange', (e) => {
    if (document.pointerLockElement === canvas) {
      document.addEventListener('mousemove', onMouseMove)
      defaultCursor.show()
      isPointerLocked = true
    } else {
      document.removeEventListener('mousemove', onMouseMove)
      defaultCursor.hide()
      isPointerLocked = false
    }
  })

  angleMode(RADIANS)

  groundTexture = createGraphics(2048, 2048)
  groundTexture.background(255)
  groundTexture.stroke(0)
  groundTexture.strokeWeight(3)
  for (let i = 0; i < groundSize; i += squareSize) {
    groundTexture.line(i, 0, i, groundSize)
    groundTexture.line(0, i, groundSize, i)
  }
}

function draw() {
  clear()

  let cameraPos = camera.getPosition()
  cameraPos = createVector(cameraPos.x, cameraPos.z)
  let lookingPos = camera.getLookPosition()
  lookingPos = createVector(lookingPos.x, lookingPos.z)
  const lookingDir = p5.Vector.sub(lookingPos, cameraPos)
  const forwardMoveVec = p5.Vector.normalize(lookingDir).mult(moveSpeed)
  const sidewaysMoveVec = p5.Vector.rotate(forwardMoveVec, HALF_PI)
  if (keyIsDown(87))
    // w
    camera.setPosition(
      camera.eyeX + forwardMoveVec.x,
      camera.eyeY,
      camera.eyeZ + forwardMoveVec.y
    )
  if (keyIsDown(83))
    // s
    camera.setPosition(
      camera.eyeX - forwardMoveVec.x,
      camera.eyeY,
      camera.eyeZ - forwardMoveVec.y
    )
  if (keyIsDown(65))
    // a
    camera.setPosition(
      camera.eyeX - sidewaysMoveVec.x,
      camera.eyeY,
      camera.eyeZ - sidewaysMoveVec.y
    )
  if (keyIsDown(68))
    // d
    camera.setPosition(
      camera.eyeX + sidewaysMoveVec.x,
      camera.eyeY,
      camera.eyeZ + sidewaysMoveVec.y
    )

  const spherePos = createVector(-40, 0, 0)
  const sphereRadius = 80
  const mouseIsOverSphere = intersectSphere(
    spherePos,
    sphereRadius,
    camera.getPosition(),
    camera.getDirection()
  )

  const diskRadius = (squareSize / 4) * 0.666
  const diskPos = createVector(
    groundSize / 4 - squareSize / 4,
    79.99,
    -(groundSize / 4 - squareSize / 4)
  )
  const mouseIsOverDisk = intersectDisk(
    createVector(0, 1, 0),
    diskPos,
    diskRadius,
    camera.getPosition(),
    camera.getDirection()
  )

  if (!isPointerLocked) {
    defaultCursor.hide()
    pointerCursor.hide()
    window.removeEventListener('click', onSphereClick)
    window.removeEventListener('click', onDiskClick)
  } else if (mouseIsOverSphere) {
    defaultCursor.hide()
    pointerCursor.show()
    window.addEventListener('click', onSphereClick)
    window.removeEventListener('click', onDiskClick)
  } else if (mouseIsOverDisk) {
    defaultCursor.hide()
    pointerCursor.show()
    window.removeEventListener('click', onSphereClick)
    window.addEventListener('click', onDiskClick)
  } else {
    defaultCursor.show()
    pointerCursor.hide()
    window.removeEventListener('click', onSphereClick)
  }

  push()
  translate(spherePos.x, spherePos.y, spherePos.z)
  rotateY(millis() / 1000)
  texture(tennisBallTexture)
  noStroke()
  sphere(sphereRadius, 8, 8)
  pop()

  push()
  textFont(font)
  textSize(50)
  textAlign(CENTER, CENTER)
  rotateX(cos(millis() * 0.002) * 0.1)
  rotateY(sin(millis() * 0.001) * 0.5)
  translate(0, cos(millis() * 0.002) * 10, 0)
  translate(0, 0, 50)
  fill(255, 0, 0)
  text('goober', 60, -40)
  pop()

  push()
  noStroke()
  texture(groundTexture)
  translate(0, 80, 0)
  rotateX(HALF_PI)
  plane(1024, 1024)
  pop()

  push()
  noStroke()
  fill(0)
  translate(diskPos.x, diskPos.y, diskPos.z)
  rotateX(HALF_PI)
  circle(0, 0, diskRadius * 2)
  pop()

  for (let i = 0; i < numImages; i++) {
    const j = i % 3
    const k = Math.floor(i / 3)
    push()
    translate(
      -groundSize / 4 + j * tennisBallTexture.width,
      79.99,
      -groundSize / 4 + k * tennisBallTexture.height
    )
    rotateX(HALF_PI)
    image(tennisBallTexture, 0, 0)
    pop()
  }
}

function onMouseMove(e) {
  camera.tilt(e.movementY * mouseSensitivity)
  camera.pan(e.movementX * -mouseSensitivity)
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
  mouseSensitivity = 1 / windowWidth
  defaultCursor.position(windowWidth / 2, windowHeight / 2)
  pointerCursor.position(windowWidth / 2, windowHeight / 2)
}

function intersectSphere(center, radius, rayOrigin, rayDirection) {
  const oc = p5.Vector.sub(rayOrigin, center)
  const a = p5.Vector.dot(rayDirection, rayDirection)
  const b = 2.0 * p5.Vector.dot(oc, rayDirection)
  const c = p5.Vector.dot(oc, oc) - radius * radius
  const discriminant = b * b - 4 * a * c
  return discriminant > 0
}

function intersectPlane(
  surfaceNormal,
  surfacePosition,
  rayOrigin,
  rayDirection
) {
  const denom = p5.Vector.dot(surfaceNormal, rayDirection)
  if (denom > 1e-6) {
    const p0l0 = p5.Vector.sub(surfacePosition, rayOrigin)
    const t = p5.Vector.dot(p0l0, surfaceNormal) / denom
    return t
  }
}

function intersectDisk(
  diskNormal,
  diskPosition,
  diskRadius,
  rayOrigin,
  rayDirection
) {
  let t = intersectPlane(diskNormal, diskPosition, rayOrigin, rayDirection)
  if (t === undefined) return false

  const p = p5.Vector.add(rayOrigin, p5.Vector.mult(rayDirection, t))
  const v = p5.Vector.sub(p, diskPosition)
  const d2 = p5.Vector.dot(v, v)
  console.log(sqrt(d2))
  return sqrt(d2) <= diskRadius
}

function onSphereClick() {
  if (!isPointerLocked) return
  numImages += 1
}

function onDiskClick() {
  if (!isPointerLocked) return
  console.log('DISK')
}
