import { suite, suiteSetup, test } from "mocha";
import { assert } from "chai";
import { Solver } from '../controllers/sudoku-solver.js'
const inputStr = '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..'

let solver

suite('Unit Tests', () => {
  suiteSetup(done => {
    solver = new Solver()
    done()
  })
  suite('Function validate()', () => {
    test('is input length 81 chars?', (done) => {
      const output = solver.validate(inputStr)
      assert.strictEqual(output, null)
      done()
    })
    test('are there invalid characters in input?', (done) => {
      const invalidInputStr = '..9..5.1.85.4....2x32......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..'
      const outputFn = () => solver.validate(invalidInputStr)
      assert.throws(outputFn, 'Invalid characters in puzzle')
      done()
    })
    test('puzzle string not 81 chars in length', (done) => {
      const invalidLenStr = '..9..5.1.5.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..'
      const outputFn = () => solver.validate(invalidLenStr)
      assert.throws(outputFn, 'Expected puzzle to be 81 characters long')
      done()
    })
  })
  suite('Function checkRowPlacement()', () => {
    test('check for valid row placement', (done) => {
      const output = solver.checkRowPlacement(inputStr, 0, 3)
      assert.isTrue(output)
      done()
    })
    test('check for invalid row placement', (done) => {
      const output = solver.checkRowPlacement(inputStr, 0, 9)
      assert.isFalse(output)
      done()
    })
  })
  suite('Function checkColPlacement()', () => {
    test('check for valid column placement', (done) => {
      const output = solver.checkColPlacement(inputStr, 5, 2)
      assert.isTrue(output)
      done()
    })
    test('check for invalid column placement', (done) => {
      const output = solver.checkColPlacement(inputStr, 3, 7)
      assert.isFalse(output)
      done()
    })
  })
  suite('Function checkRegionPlacement()', () => {
    test('check for valid region placement', (done) => {
      const output = solver.checkRegionPlacement(inputStr, 4, 4, 3)
      assert.isTrue(output)
      done()
    })
    test('check for invalid region placement', (done) => {
      const output = solver.checkRegionPlacement(inputStr, 1, 8, 2)
      assert.isFalse(output)
      done()
    })
  })
  suite('Test the solver', () => {
    test('check that valid string passes the solver', (done) => {
      const validStr = '769235418851496372432178956174569283395842761628713549283657194516924837947381625'
      const output = solver.solve(validStr)
      assert.isTrue(output)
      done()
    })
    test('check that invalid string fails the solver', (done) => {
      const invalidStr = '779235418851496372432178956174569283395842761628713549283657194516924837947381625'
      const output = solver.solve(invalidStr)
      assert.isFalse(output)
      done()
    })
  })
  suite('Function solve()', () => {
    test('return expected solution for a given string', (done) => {
      const expectedSolution =  '769235418851496372432178956174569283395842761628713549283657194516924837947381625'
      solver.solve(inputStr)
      assert.equal(solver.createStringFromGrid(), expectedSolution)
      done()
    })
  })
})
