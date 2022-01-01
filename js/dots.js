const vDup = (v) => createVector(v.x, v.y, v.z)
const vMag = (v) => vDup(v).mag()
const vDir = (v) => vDup(v).normalize()
const vRot = (v, angle) => vDup(v).rotate(angle)
const vAdd = (...vectors) => vectors.reduce((a, b) => p5.Vector.add(a, b))
const vSub = (a, b) => p5.Vector.sub(a, b)
const vMult = (a, b) => p5.Vector.mult(a, b)
const vDiv = (a, b) => p5.Vector.div(a, b)

const DEFAULT_SIZE = 1000
const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const DIM = Math.min(WIDTH, HEIGHT)
const M = DIM / DEFAULT_SIZE

function random_hash() {
  let x = '0123456789abcdef',
    hash = '0x'
  for (let i = 64; i > 0; --i) {
    hash += x[Math.floor(Math.random() * x.length)]
  }
  return hash
}
tokenData = {
  hash: random_hash(),
  tokenId: '123000456',
}

let seed = parseInt(tokenData.hash.slice(0, 16), 16)
let randomDecimal = () => {
  /* Algorithm "xor" from p. 4 of Marsaglia, "Xorshift RNGs" */
  seed ^= seed << 13
  seed ^= seed >> 17
  seed ^= seed << 5
  return ((seed < 0 ? ~seed + 1 : seed) % 1000) / 1000
}
let randomFloat = (min, max) => min + (max - min) * randomDecimal()
let randomInt = (min, max) => Math.floor(randomFloat(min, max + 1))
let randomBool = () => randomDecimal() < 0.5
let randomNormal = (min = 0, max = 1, skew = 1) => {
  let u = 0,
    v = 0
  while (u === 0) u = randomDecimal() //Converting [0,1) to (0,1)
  while (v === 0) v = randomDecimal()
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)

  num = num / 10.0 + 0.5 // Translate to 0 -> 1
  if (num > 1 || num < 0) num = randomNormal(min, max, skew)
  // resample between 0 and 1 if out of range
  else {
    num = Math.pow(num, skew) // Skew
    num *= max - min // Stretch to fill range
    num += min // offset to min
  }
  return num
}
let randomChoiceWeighted = (choices) => {
  const totalWeight = choices
    .map((choice) => choice[0])
    .reduce((a, b) => a + b, 0)

  let threshold = randomFloat(0, totalWeight)

  let total = 0
  for (let i = 0; i < choices.length - 1; i++) {
    total += choices[i][0]
    if (total >= threshold) return choices[i][1]
  }

  return choices[choices.length - 1][1]
}
let randomChoice = (choices) =>
  randomChoiceWeighted(choices.map((choice) => [1, choice]))

let wrap = (m, n) => (n >= 0 ? n % m : ((n % m) + m) % m)

let aSliders

function setup() {
  createCanvas(windowWidth, windowHeight)
  background(255)

  aSliders = setupSliders(0, 0)
  bSliders = setupSliders(250, 0)
}

function setupSliders(x, y) {
  const rowsLabel = createDiv('Rows')
  rowsLabel.position(x + 150, y + 10)
  const rows = createSlider(1, 100, 10, 1)
  rows.position(x + 10, y + 10)

  const colsLabel = createDiv('Cols')
  colsLabel.position(x + 150, y + 30)
  const cols = createSlider(1, 100, 10, 1)
  cols.position(x + 10, y + 30)

  const hSpaceLabel = createDiv('H Gap')
  hSpaceLabel.position(x + 150, y + 50)
  const hSpace = createSlider(0, 100, 10, 0.1)
  hSpace.position(x + 10, y + 50)

  const vSpaceLabel = createDiv('V Gap')
  vSpaceLabel.position(x + 150, y + 70)
  const vSpace = createSlider(0, 100, 10, 0.1)
  vSpace.position(x + 10, y + 70)

  const rLabel = createDiv('Radius')
  rLabel.position(x + 150, y + 90)
  const r = createSlider(0, 20, 2, 0.1)
  r.position(x + 10, y + 90)

  return { rows, cols, vSpace, hSpace, r }
}

function draw() {
  background(255)

  drawMatrixWithSliders(aSliders)
  drawMatrixWithSliders(bSliders)
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
}

function drawMatrixWithSliders(sliders) {
  drawMatrix(
    sliders.rows.value(),
    sliders.cols.value(),
    sliders.vSpace.value(),
    sliders.hSpace.value(),
    sliders.r.value()
  )
}

function drawMatrix(rows, cols, vSpace, hSpace, r) {
  const tWidth = cols * hSpace
  const tHeight = rows * vSpace

  push()
  translate((windowWidth - tWidth) / 2, (windowHeight - tHeight) / 2)
  fill(1)
  for (let row = 0; row < rows; row++) {
    const y = row * vSpace
    for (let col = 0; col < cols; col++) {
      const x = col * hSpace
      circle(x, y, r * 2)
    }
  }
  pop()
}
