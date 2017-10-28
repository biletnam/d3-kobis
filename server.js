'use strict';
const
  express = require('express'),
  app = express(),
  path = require('path'),
  morgan = require('morgan'),
  helmet = require('helmet'),
  favicon = require('serve-favicon');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('./controllers'))
app.use(morgan('dev'));
app.use(helmet());

app.locals.siteName = "Daily Boxoffice";

app.listen(3000, () => {
  console.log("ready captain.");
});
