var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var dbsql = require('mysql');

var con = dbsql.createConnection({
    host: "localhost",
    user: "root",
    password: "7B0fb6967",
    database: "holandly"
});

con.connect(function (error) {
  if (error) throw error;
  console.log('Connected');
});

app.use(function (req, res, next) {
    if (req.url === '/') {
      res.sendFile(__dirname + '/visitor.html');
    }
    else next();
});

app.get('/:eventsAdmin', function(req, res, next) {
  var usr = req.params.eventsAdmin;
});



// app.listen(8255);