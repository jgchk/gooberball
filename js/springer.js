/// <reference path="../types/p5.global-mode.d.ts" />

let dot
let ball

function setup() {
  createCanvas(500, 500)
  dot = createSpring(createVector(width / 2, height / 2), 0.1, 1, 5, color(255))
  ball = createSpring(createVector(mouseX, mouseY), 1, 1, 30, color(255, 0, 0))
}

function draw() {
  background(0)

  ball.targetPos = createVector(mouseX, mouseY)
  let ballForce = createVector(0, 0)
  const ballSpringForce = getSpringForce(ball)
  ballForce = V.add(ballForce, ballSpringForce)
  const ballDragForce = V.mult(ball.v, -0.9)
  ballForce = V.add(ballForce, ballDragForce)

  let dotForce = createVector(0, 0)

  if (mouseIsPressed) {
    const clickForce = V.add(dotForce, createVector(10, 0))
    dotForce = V.add(dotForce, clickForce)
  }

  const springForce = getSpringForce(dot)
  dotForce = V.add(dotForce, springForce)

  const ballToDot = V.sub(dot.p, ball.p)
  const ballToDotMag = ballToDot.mag()
  const distanceBetween = ballToDotMag - (ball.r + dot.r)
  if (distanceBetween < 0) {
    const displacement = V.div(ballToDot, ballToDotMag).mult(-distanceBetween)
    const pushForce = V.mult(displacement, 1)
    dotForce = V.add(dotForce, pushForce)
  }

  const dragForce = V.mult(dot.v, -0.1)
  dotForce = V.add(dotForce, dragForce)

  updateSpring(dot, dotForce)
  updateSpring(ball, ballForce)

  drawSpring(dot)
  drawSpring(ball)
}

const V = {
  add: (a, b) => p5.Vector.add(a, b),
  sub: (a, b) => p5.Vector.sub(a, b),
  mult: (a, b) => p5.Vector.mult(a, b),
  div: (a, b) => p5.Vector.div(a, b),
  dot: (a, b) => p5.Vector.dot(a, b),
}

const createSpring = (initialPos, k, m, r, c) => ({
  targetPos: initialPos,
  k,
  m,
  v: createVector(0, 0),
  p: initialPos,
  r,
  c,
})

const updateSpring = (spring, force) => {
  const a = V.div(force, spring.m)
  spring.v = V.add(spring.v, a)
  spring.p = V.add(spring.p, spring.v)
}

const getSpringForce = (spring) => {
  const displacement = V.sub(spring.p, spring.targetPos)
  return V.mult(displacement, -spring.k)
}

const drawSpring = (spring) => {
  push()
  fill(spring.c)
  noStroke()
  circle(spring.p.x, spring.p.y, spring.r * 2)
  pop()
}

const springsColliding = (a, b) => V.sub(a.p, b.p).mag() <= a.r + b.r
