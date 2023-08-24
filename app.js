import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser';
import logger from 'morgan'
import createHttpError from 'http-errors';
import { router as apiRoutes } from './routes/api.js'
import { indexRouter } from './routes/index.js';
import { router as fccTestingRoutes } from './routes/fcctesting.js';
import 'dotenv/config'
import cors from 'cors'
import { emitter as runner } from './test-runner.js';
import * as url from 'url'
const __dirname = url.fileURLToPath(new URL(".", import.meta.url))

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({origin: '*'})); //For FCC testing purposes only
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter)
app.use('/_api', fccTestingRoutes)
app.use('/api', apiRoutes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createHttpError(404))
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.json({
    error: err.message
  })
})

if (process.env.NODE_ENV === 'test') {
  console.log('Running Tests...');
  setTimeout(function() {
    try {
      runner.run();
    } catch (error) {
      console.log('Tests are not valid:');
      console.error(error);
    }
  }, 1500);
}

export { app }
