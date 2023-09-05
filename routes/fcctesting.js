import cors from "cors"
import { readFile } from "fs";
import { emitter as runner } from "../test-runner.js";
import { Router } from "express";
import * as url from 'url'
const __dirname = url.fileURLToPath(new URL(".", import.meta.url))

const router = Router()

router.route('/server.js')
  .get(function(req, res, next) {
    console.log('requested');
    readFile(__dirname + '/server.js', function(err, data) {
      if(err) return next(err);
      res.send(data.toString());
    });
  });
router.route('/routes/api.js')
  .get(function(req, res, next) {
    console.log('requested');
    readFile(__dirname + '/routes/api.js', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });
router.route('/controllers/convertHandler.js')
  .get(function(req, res, next) {
    console.log('requested');
    readFile(__dirname + '/controllers/convertHandler.js', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });

router.get('/get-tests', cors(), function(req, res, next){
  console.log('requested');
  if(process.env.NODE_ENV === 'test') return next();
  res.json({status: 'unavailable'});
},
  function(req, res, next){
    if(!runner.report) return next();
    res.json(testFilter(runner.report, req.query.type, req.query.n));
  },
  function(req, res){
    runner.on('done', function(report){
      process.nextTick(() =>  res.json(testFilter(runner.report, req.query.type, req.query.n)));
    });
  });
router.get('/router-info', function(req, res) {
  let hs = Object.keys(res._headers)
    .filter(h => !h.match(/^access-control-\w+/));
  let hObj = {};
  hs.forEach(h => {hObj[h] = res._headers[h]});
  delete res._headers['strict-transport-security'];
  res.json({headers: hObj});
});

;

function testFilter(tests, type, n) {
  let out;
  switch (type) {
    case 'unit' :
      out = tests.filter(t => t.context.match('Unit Tests'));
      break;
    case 'functional':
      out = tests.filter(t => t.context.match('Functional Tests') && !t.title.match('#example'));
      break;
    default:
      out = tests;
  }
  if(n !== undefined) {
    return out[n] || out;
  }
  return out;
}

export {
  router
}
