import { assertionAnalyser as analyser } from './assertion-analyser.js';
import EventEmitter from 'events';
import Mocha from 'mocha';
import { readdirSync } from 'fs';
import path from 'path';
import * as url from 'url'
const __dirname = url.fileURLToPath(new URL("./tests", import.meta.url))

const mocha = new Mocha({ timeout: 5000 });

// Add each .js file to the mocha instance
readdirSync(__dirname).filter(function(file) {
  // Only keep the .js files
  return file.substr(-3) === '.js';

}).forEach(function(file) {
  mocha.addFile(
    path.join(__dirname, file)
  ).loadFilesAsync();
});

let emitter = new EventEmitter()
emitter.run = function() {

  let tests = [];
  let context = "";
  let separator = ' -> ';
  // Run the tests.
  try {
    let runner = mocha.ui('tdd').run()
      runner.on('test end', function(test) {
        // remove comments
        let body = test.body.replace(/\/\/.*\n|\/\*.*\*\//g, '');
        // collapse spaces
        body = body.replace(/\s+/g, ' ');
        let obj = {
          title: test.title,
          context: context.slice(0, -separator.length),
          state: test.state,
          // body: body,
          assertions: analyser(body)
        };
        tests.push(obj);
      })
      .on('end', function() {
        emitter.report = tests;
        emitter.emit('done', tests)
      })
      .on('suite', function(s) {
        context += (s.title + separator);

      })
      .on('suite end', function(s) {
        context = context.slice(0, -(s.title.length + separator.length))
      })
  } catch (e) {
    throw (e);
  }
};

export {
  emitter
}

