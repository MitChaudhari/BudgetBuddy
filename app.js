require('dotenv').config(); // Load environment variables from .env file
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Route Setup
var indexRouter = require('./routes/index'); // Landing page and potentially other static pages
var authRouter = require('./routes/auth'); // Routes for login/signup
var usersRouter = require('./routes/users'); // Routes for user-specific functionalities


var app = express();

// Database connection setup
const db = require('./database/db'); // Database connection setup file
(async function connectDB() {
  try {
    await db.connect(); // Attempt to connect to MongoDB Atlas
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1); // Exit if connection fails
  }
})();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Routes
app.use('/', indexRouter); // Use index router for landing and welcome page
app.use(authRouter); // Use auth router specifically for login and signup functionalities
app.use(authRouter); // Use auth router specifically for login and signup functionalities
app.use('/users', usersRouter); // Use users router for handling user-specific routes

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
