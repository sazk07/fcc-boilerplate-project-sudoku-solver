import chai, { assert } from "chai";
import chaiHttp from "chai-http";
import { app } from '../app.js'
import { after, suite, test } from "mocha";

chai.use(chaiHttp)
after(() => {
  chai.request(app).get('/api')
})

suite('Functional Tests', () => {
  suite('POST req to /api/solve', () => {
    test('solve a puzzle with valid puzzle string', (done) => {
      const validPuzzleStr = '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
      const output = '769235418851496372432178956174569283395842761628713549283657194516924837947381625';
      chai.request(app)
        .post('/api/solve')
        .send({
          puzzle: validPuzzleStr
        })
        .end((err, res) => {
          assert.notExists(err)
          assert.isObject(res.body)
          assert.property(res.body, 'solution')
          assert.strictEqual(res.body.solution, output)
          done()
        })
    })
    test('puzzle missing', (done) => {
      chai.request(app)
        .post('/api/solve')
        .end((err, res) => {
          assert.notExists(err)
          assert.throws(() => { throw Error })
          assert.property(res.body, 'error')
          assert.strictEqual(res.body.error, 'Required field missing')
          done()
        })
    })
    test('test for invalid characters', (done) => {
      const invalidCharPuzzle = "..X..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6.."
      chai.request(app)
        .post('/api/solve')
        .send({
          puzzle: invalidCharPuzzle
        })
        .end((err, res) => {
          assert.notExists(err)
          assert.throws(() => { throw Error })
          assert.property(res.body, 'error')
          assert.deepStrictEqual(res.body.error, 'Invalid characters in puzzle')
          done()
        })
    })
    test('test for puzzle length not equalling 81 characters', (done) => {
      const shortLenStr = '..9..5.1.85.4....2432....1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
      const longLenStr = '..9..5.1.85.4....2432........1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
      chai.request(app)
        .post('/api/solve')
        .send({
          puzzle: shortLenStr
        })
        .end((err, res) => {
          assert.notExists(err)
          assert.throws(() => { throw Error })
          assert.property(res.body, 'error')
          assert.deepStrictEqual(res.body.error, 'Expected puzzle to be 81 characters long')
          chai.request(app)
            .post('/api/solve')
            .send({
              puzzle: longLenStr
            })
            .end((err, res) => {
              assert.notExists(err)
              assert.throws(() => { throw Error })
              assert.property(res.body, 'error')
              assert.deepStrictEqual(res.body.error, 'Expected puzzle to be 81 characters long')
              done()
            })
        })
    })
    test('test for unsolvable puzzle', (done) => {
      const unsolvablePuzzleStr = '779235418851496372432178956174569283395842761628713549283657194516924837947381625'
      chai.request(app)
        .post('/api/solve')
        .send({
          puzzle: unsolvablePuzzleStr
        })
        .end((err, res) => {
          assert.notExists(err)
          assert.throws(() => { throw Error })
          assert.property(res.body, 'error')
          assert.deepStrictEqual(res.body.error, 'Puzzle cannot be solved')
          done()
        })
    })
  })
  suite('POST req to /api/check', () => {
    const puzzle = '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
    test('test for puzzle, coordinate, value to be object, letterNumber and number respectively', (done) => {
      const coordinate = "A1"
      const value = "7"
      chai.request(app)
        .post('/api/check')
        .send({
          puzzle,
          coordinate,
          value
        })
        .end((err, res) => {
          assert.notExists(err)
          assert.property(res.body, 'valid')
          assert.isBoolean(res.body.valid)
          assert.isTrue(res.body.valid)
          done()
        })
    })
    test('single placement conflict', (done) => {
      const coordinate = "A2"
      const value = "1"
      chai.request(app)
        .post('/api/check')
        .send({
          puzzle,
          coordinate,
          value
        })
        .end((err, res) => {
          assert.notExists(err)
          assert.property(res.body, 'conflict')
          assert.property(res.body, 'valid')
          assert.isArray(res.body.conflict)
          assert.isBoolean(res.body.valid)
          assert.include(res.body.conflict, 'row')
          assert.deepStrictEqual(res.body.conflict, ['row'])
          assert.isFalse(res.body.valid)
          done()
        })
    })
    test('multiple placement conflict', (done) => {
      const coordinate = "A1"
      const value = "1"
      chai.request(app)
        .post('/api/check')
        .send({
          puzzle,
          coordinate,
          value
        })
        .end((err, res) => {
          assert.notExists(err)
          assert.property(res.body, 'conflict')
          assert.property(res.body, 'valid')
          assert.isArray(res.body.conflict)
          assert.isBoolean(res.body.valid)
          assert.deepStrictEqual(res.body.conflict, ['row', 'column'])
          assert.isFalse(res.body.valid)
          done()
        })
    })
    test('all placement conflicts', (done) => {
      const coordinate = "A1"
      const value = "5"
      chai.request(app)
        .post('/api/check')
        .send({
          puzzle,
          coordinate,
          value
        })
        .end((err, res) => {
          assert.notExists(err)
          assert.property(res.body, 'conflict')
          assert.property(res.body, 'valid')
          assert.isBoolean(res.body.valid)
          assert.isArray(res.body.conflict)
          assert.deepStrictEqual(res.body.conflict, ['row', 'column', 'region'])
          assert.isFalse(res.body.valid)
          done()
        })
    })
    test('Invalid characters in puzzle', (done) => {
      const invalidTestPuzzleStr = '..9.X5.1.85.4....2432... ..1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..'
      const coordinate = "A1"
      const value = "2"
      chai.request(app)
        .post('/api/check')
        .send({
          puzzle: invalidTestPuzzleStr,
          coordinate,
          value
        })
        .end((err, res) => {
          assert.notExists(err)
          assert.throws(() => { throw Error })
          assert.property(res.body, 'error')
          assert.strictEqual(res.body.error, 'Invalid characters in puzzle')
          done()
        })
    })
    test('Expected puzzle to be 81 characters long', (done) => {
      const shortLenStr = '..9..5.1.85.4....2432....1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
      const longLenStr = '..9..5.1.85.4....2432........1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
      const coordinate = "A1"
      const value = "2"
      chai.request(app)
        .post('/api/check')
        .send({
          puzzle: shortLenStr,
          coordinate,
          value
        })
        .end((err, res) => {
          assert.notExists(err)
          assert.property(res.body, 'error')
          assert.strictEqual(res.body.error, 'Expected puzzle to be 81 characters long')
          chai.request(app)
            .post('/api/check')
            .send({
              puzzle: longLenStr,
              coordinate,
              value
            })
            .end((err, res) => {
              assert.notExists(err)
              assert.property(res.body, 'error')
              assert.strictEqual(res.body.error, 'Expected puzzle to be 81 characters long')
              done()
            })
        })
    })
    test("Required field(s) missing", (done) => {
      chai.request(app)
        .post('/api/check')
        .end((err, res) => {
          assert.notExists(err)
          assert.throws(() => { throw Error })
          assert.property(res.body, 'error')
          assert.strictEqual(res.body.error, 'Required field(s) missing')
          done()
        })
    })
    test('Invalid coordinate', (done) => {
      const coordinate1 = "X3"
      const coordinate2 = "A23"
      const coordinate3 = "X23"
      const value = "2"
      chai.request(app)
        .post('/api/check')
        .send({
          puzzle,
          value,
          coordinate: coordinate1
        })
        .end((err, res) => {
          assert.notExists(err)
          assert.property(res.body, 'error')
          assert.strictEqual(res.body.error, 'Invalid coordinate')
          chai.request(app)
            .post('/api/check')
            .send({
              puzzle,
              value,
              coordinate: coordinate2
            })
            .end((err, res) => {
              assert.notExists(err)
              assert.property(res.body, 'error')
              assert.strictEqual(res.body.error, 'Invalid coordinate')
              chai.request(app)
                .post('/api/check')
                .send({
                  puzzle,
                  value,
                  coordinate: coordinate3
                })
                .end((err, res) => {
                  assert.notExists(err)
                  assert.property(res.body, 'error')
                  assert.strictEqual(res.body.error, 'Invalid coordinate')
                  done()
                })
            })
        })
    })
    test('Invalid value', (done) => {
      const coordinate = "A1"
      const value1 = "X"
      const value2 = "0"
      const value3 = "10"
      const value4 = "-1"
      const value5 = "1.5"
      chai.request(app)
        .post('/api/check')
        .send({
          puzzle,
          coordinate,
          value: value1
        })
        .end((err, res) => {
          assert.notExists(err)
          assert.property(res.body, 'error')
          assert.strictEqual(res.body.error, 'Invalid value')
          chai.request(app)
            .post('/api/check')
            .send({
              puzzle,
              coordinate,
              value: value1
            })
            .end((err, res) => {
              assert.notExists(err)
              assert.property(res.body, 'error')
              assert.strictEqual(res.body.error, 'Invalid value')
              chai.request(app)
                .post('/api/check')
                .send({
                  puzzle,
                  coordinate,
                  value: value2
                })
                .end((err, res) => {
                  assert.notExists(err)
                  assert.property(res.body, 'error')
                  assert.strictEqual(res.body.error, 'Invalid value')
                  chai.request(app)
                    .post('/api/check')
                    .send({
                      puzzle,
                      coordinate,
                      value: value3
                    })
                    .end((err, res) => {
                      assert.notExists(err)
                      assert.property(res.body, 'error')
                      assert.strictEqual(res.body.error, 'Invalid value')
                      chai.request(app)
                        .post('/api/check')
                        .send({
                          puzzle,
                          coordinate,
                          value: value4
                        })
                        .end((err, res) => {
                          assert.notExists(err)
                          assert.property(res.body, 'error')
                          assert.strictEqual(res.body.error, 'Invalid value')
                          chai.request(app)
                            .post('/api/check')
                            .send({
                              puzzle,
                              coordinate,
                              value: value5
                            })
                            .end((err, res) => {
                              assert.notExists(err)
                              assert.property(res.body, 'error')
                              assert.strictEqual(res.body.error, 'Invalid value')
                              done()
                            })
                        })
                    })
                })
            })
        })
    })
  })
})
