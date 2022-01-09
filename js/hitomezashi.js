let seed1Input
let seed2Input
let saveButton

let margin = 0.1

function setup() {
  const size = min(windowWidth, windowHeight * 0.85)
  createCanvas(size, size)
  seed1Input = createInput('')
  seed2Input = createInput('')

  seed1Input.attribute('placeholder', 'Type in any word or phrase,')
  seed2Input.attribute('placeholder', 'and another one...')

  seed1Input.input(onInput)
  seed2Input.input(onInput)

  saveButton = createButton('Download')
  saveButton.mouseClicked(() => saveCanvas('hitomezashi', 'png'))

  const inputContainer = createDiv()
  inputContainer.id('inputs')
  seed1Input.parent(inputContainer)
  seed2Input.parent(inputContainer)
  saveButton.parent(inputContainer)

  noLoop()
}

function windowResized() {
  const size = min(windowWidth, windowHeight * 0.85)
  resizeCanvas(size, size)
}

function onInput() {
  const seed1 = seed1Input.value()
  const seed2 = seed2Input.value()

  if (seed1.length === 0 || seed2.length === 0) {
    saveButton.attribute('disabled', true)
  } else {
    saveButton.removeAttribute('disabled')
  }

  redraw()
}

function draw() {
  clear()
  background(0)

  const seed1 = seed1Input.value()
  const seed2 = seed2Input.value()

  const dashLength = min(
    (height * (1 - margin)) / seed1.length,
    (width * (1 - margin)) / seed2.length
  )

  const totalWidth = seed2.length * dashLength
  const totalHeight = seed1.length * dashLength

  translate((width - totalWidth) / 2, (height - totalHeight) / 2)

  // if top is open, get color from top
  // if left is open, get color from left
  // if neither is open, flip color from top or left (whichever more efficient)

  // if r === 0, only look at left
  // if c === 0, only look at top
  // if r === 0 && c === 0, set red
  let board = Array.from({ length: seed1.length }, () =>
    Array.from({ length: seed2.length }, () => false)
  )
  for (let r = 0; r < seed1.length; r++) {
    for (let c = 0; c < seed2.length; c++) {
      let topLine = isVowel(seed1.charAt(r))
      if (c % 2 === 0) topLine = !topLine

      let leftLine = isVowel(seed2.charAt(c))
      if (r % 2 === 0) leftLine = !leftLine

      const x = c * dashLength
      const y = r * dashLength

      let val
      if (r === 0 && c === 0) {
        val = false
      } else if (r === 0) {
        const leftVal = board[r][c - 1]
        if (leftLine) {
          val = !leftVal
        } else {
          val = leftVal
        }
      } else if (c === 0) {
        const topVal = board[r - 1][c]
        if (topLine) {
          val = !topVal
        } else {
          val = topVal
        }
      } else {
        if (!topLine) {
          const topVal = board[r - 1][c]
          val = topVal
        } else if (!leftLine) {
          const leftVal = board[r][c - 1]
          val = leftVal
        } else {
          const topVal = board[r - 1][c]
          val = !topVal
        }
      }

      board[r][c] = val
      const colr = val ? 0 : 255
      push()
      fill(colr)
      noStroke()
      rect(x, y, dashLength + 1, dashLength + 1)
      pop()

      // push()
      // stroke(255)
      // strokeWeight(2)
      // if (topLine) line(x, y, x + dashLength, y)
      // if (leftLine) line(x, y, x, y + dashLength)
      // pop()
    }
  }

  // stroke(255)
  // strokeWeight(2)
  // line(0, 0, totalWidth, 0)
  // line(0, totalHeight, totalWidth, totalHeight)
  // line(0, 0, 0, totalHeight)
  // line(totalWidth, 0, totalWidth, totalHeight)
}

function isVowel(char) {
  return ['a', 'e', 'i', 'o', 'u'].includes(char.toLowerCase())
}
