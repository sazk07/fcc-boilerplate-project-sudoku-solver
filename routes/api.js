import { Solver } from '../controllers/sudoku-solver.js'
import asyncHandler from 'express-async-handler'
import { Router } from 'express'

const solver = new Solver()
const router = Router()

const checkFn = async (req, res, next) => {
  const { puzzle, coordinate, value } = req.body
  if (!puzzle || !coordinate || !value) {
    return next(new Error("Required field(s) missing"))
  }
  const valueNum = new Number(value).valueOf()
  const isBetween = (num, min, max) => {
    return min < num && num < max
  }
  if (!Number.isInteger(valueNum) || !isBetween(valueNum, 0, 10)) {
    return next(new Error("Invalid value"))
  }
  solver.validate(puzzle)
  const [row, col] = solver.getCoordinate(coordinate)
  const clearedPuzzleStr = solver.clearTargetCellInPuzzle(puzzle, row, col)
  const isRowClear = solver.checkRowPlacement(clearedPuzzleStr, row, valueNum)
  const isColClear = solver.checkColPlacement(clearedPuzzleStr, col, valueNum)
  const isRegionClear = solver.checkRegionPlacement(clearedPuzzleStr, row - (row % 3), col - (col % 3), valueNum)
  if (!isRowClear || !isColClear || !isRegionClear) {
    const result = []
    if (!isRowClear) {
      result.push('row')
    }
    if (!isColClear) {
      result.push('column')
    }
    if (!isRegionClear) {
      result.push('region')
    }
    return res.json({
      conflict: result,
      valid: false
    })
  }
  return res.json({
    valid: true
  })
}
router.post('/check', asyncHandler(checkFn))

const solveFn = async (req, res, next) => {
  const { puzzle } = req.body
  if (!puzzle) {
    return next(new Error('Required field missing'))
  }
  solver.validate(puzzle)
  const answer = solver.solve(puzzle)
  if (!answer) {
    return next(new Error('Puzzle cannot be solved'))
  }
  return res.json({
    solution: solver.createStringFromGrid()
  })
}

router.post('/solve', asyncHandler(solveFn))

export {
  router
}
