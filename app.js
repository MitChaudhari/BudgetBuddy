require('dotenv').config(); 
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Route Setup
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const transactionsRouter = require('./routes/transactions');
const budgetRouter = require('./routes/budget');


const app = express();

// Database connection setup
const db = require('./database/db');
(async function connectDB() {
  try {
    await db.connect(); // Attempt to connect to MongoDB Atlas
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
})();

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

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
app.use('/', indexRouter); 
app.use(authRouter); // Use auth router specifically for login and signup functionalities
app.use('/users', usersRouter);
app.use('/transactions', transactionsRouter); // Use transactions router for handling transaction-related routes
app.use('/budget', budgetRouter);


// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
