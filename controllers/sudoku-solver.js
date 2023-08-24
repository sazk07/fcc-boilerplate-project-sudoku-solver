const TOTALHEIGHT = 9
const TOTALWIDTH = 9

class SudokuSolver {

  #puzzle
  #recursions
  constructor() {
    this.#puzzle = []
    this.#recursions = 0
  }

  validate(puzzleString) {
    // has 81 valid chars as puzzleString input?
    if (puzzleString.length !== 81) {
      throw new Error('Expected puzzle to be 81 characters long')
    }

    const invalidChars = /[^1-9.]/gi;
    if (puzzleString.match(invalidChars)) {
      throw new Error('Invalid characters in puzzle')
    }

    this.#createGridFromString(puzzleString)
    const isLegal = this.#isDigitLegal({ emptyCellsAllowed: true })
    if (!isLegal) {
      throw new Error('Puzzle cannot be solved')
    }
    return null
  }

  static #isUsedInRow(grid, row, value) {
    for (let col = 0; col < TOTALWIDTH; col++) {
      if (grid[row][col]===value) {
        return true
      }
    }
    return false
  }

  checkRowPlacement(puzzleString, row, value) {
    this.#createGridFromString(puzzleString)
    if (SudokuSolver.#isUsedInRow(this.#puzzle, row, value)) {
      return false
    }
    return true
  }

  static #isUsedInColumn(grid, col, value) {
    for (let row = 0; row < TOTALHEIGHT; row++) {
      if (grid[row][col]===value) {
        return true
      }
    }
    return false
  }

  checkColPlacement(puzzleString, column, value) {
    this.#createGridFromString(puzzleString)
    if (SudokuSolver.#isUsedInColumn(this.#puzzle, column, value)) {
      return false
    }
    return true
  }

  static #isUsedInSubGrid(grid, initRow, initCol, value) {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (grid[initRow+row][initCol+col]===value) {
          return true
        }
      }
    }
    return false
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    this.#createGridFromString(puzzleString)
    if (SudokuSolver.#isUsedInSubGrid(this.#puzzle, row, column, value)) {
      return false
    }
    return true
  }

  static #getUnassignedLocation(grid) {
   for (let row = 0; row < TOTALHEIGHT; row++) {
      for (let col = 0; col < TOTALWIDTH; col++) {
        if (grid[row][col]===0) {
          return [row, col]
        }
      }
    }
    return [10, 10]
  }

  #solveSudoku(grid) {
    this.#recursions++
    if (this.#recursions > 250000) {
      return false
    }
    // check if all slots are filled
    const [row, col] = SudokuSolver.#getUnassignedLocation(grid)
    if (row===10 || col===10) {
      return true
    }
    // try 1 to 9 for each zero present in the grid
    for (let value = 1; value < 10; value++) {
      if (SudokuSolver.#isSafe(grid, row, col, value)) {
        grid[row][col] = value
        if (this.#solveSudoku(grid)) {
          return true
        }
        grid[row][col] = 0
      }
    }
    return false
  }

  static #isSafe(grid, row, col, value) {
    // check is num placed in row, col or subgrid?
    if (SudokuSolver.#isUsedInRow(grid, row, value) || SudokuSolver.#isUsedInColumn(grid, col, value) || SudokuSolver.#isUsedInSubGrid(grid, row-(row%3), col-(col%3), value)) {
      return false
    }
    return true
  }

  #isDigitLegal({ emptyCellsAllowed }) {
    for (let row=0; row<TOTALHEIGHT; row++) {
      for (let col=0; col<TOTALWIDTH; col++) {
        let value = this.#puzzle[row][col]
        // if empty cells are allowed then ignore zeroes
        if (emptyCellsAllowed && value === 0) {
          continue
        }
        // fill with zeroes
        this.#puzzle[row][col] = 0
        if ((!emptyCellsAllowed && value === 0) || !SudokuSolver.#isSafe(this.#puzzle, row, col, value)) {
          this.#puzzle[row][col] = value
          return false
        }
        this.#puzzle[row][col] = value
      }
    }
    return true
  }

  #isSolutionComplete() {
    return this.#isDigitLegal({
      emptyCellsAllowed: false
    })
  }

  static #isValidInput(inputChar) {
    return (typeof inputChar === 'string' && inputChar.match(/[1-9]/))
  }

  #createGridFromString(puzzleString) {
    for (let row = 0; row < TOTALWIDTH; row++) {
      this.#puzzle.push([])
    }
    for (let row = 0; row < TOTALHEIGHT; row++) {
      for (let col = 0; col < TOTALWIDTH; col++) {
        const charOfInputStr = puzzleString.charAt(String(row).concat(String(col))-row)
        this.#puzzle[row][col] = SudokuSolver.#isValidInput(charOfInputStr) ? parseInt(charOfInputStr): 0;
      }
    }
  }

  solve(puzzleString) {
    this.#createGridFromString(puzzleString)
    if (puzzleString.match(/\./gi)) {
      this.#recursions = 0
      return this.#solveSudoku(this.#puzzle)
    }
    return this.#isSolutionComplete()
  }

  clearTargetCellInPuzzle(puzzleString, row, col) {
    this.#createGridFromString(puzzleString)
    this.#puzzle[row][col] = 0
    return this.createStringFromGrid()
  }

  createStringFromGrid() {
    let output = ''
    for (let row = 0; row < TOTALHEIGHT; row++) {
      for (let col = 0; col < TOTALWIDTH; col++) {
        output += this.#puzzle[row][col] ? this.#puzzle[row][col].toString() : '.'
      }
    }
    return output
  }

  static invalidCoordinateError() {
    return new Error('Invalid coordinate')
  }

  getCoordinate(coord) {
    coord = coord.toUpperCase()
    const [letterPortion, numPortion] = [...coord]
    const valNumPortion = parseInt(numPortion)
    // coordinate value should be string with len 2
    if (typeof coord !== 'string' || coord.length !== 2) {
      throw SudokuSolver.invalidCoordinateError()
    }
    // check for coord row matches A to I
    if (letterPortion.match(/[^A-I]/)) {
      throw SudokuSolver.invalidCoordinateError()
    }
    const row = letterPortion.codePointAt(0) - 'A'.codePointAt(0)
    // second digit must be a number
    if (!valNumPortion) {
      throw SudokuSolver.invalidCoordinateError()
    }
    const isBetween = (num, min, max) => {
      return min < num && num < max
    }
    if (!isBetween(valNumPortion, 0, 10)) {
      throw SudokuSolver.invalidCoordinateError()
    }
    const col = valNumPortion - 1
    return [row, col]
  }

}

export {
  SudokuSolver as Solver
}
