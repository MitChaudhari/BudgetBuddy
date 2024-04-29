require('dotenv').config();
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.get('/login', (req, res) => {
  res.render('login');
});

// Sign up Logic
router.post('/signup', [
  body('firstName', 'First name is required').notEmpty(),
  body('lastName', 'Last name is required').notEmpty(),
  body('emailAddress').isEmail().withMessage('Enter a valid email address'),
  body('username', 'Username is required').notEmpty(),
  body('password', 'Password must be 6 characters or more').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('signup', { errors: errors.array() });
  }

  try {
    const { firstName, lastName, emailAddress, username, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      emailAddress,
      username,
      password: hashedPassword
    });

    await newUser.save();
    req.session.userId = newUser._id;  // Set user ID in session
    res.redirect('/transactions');  // Redirect to transactions page after successful signup
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).render('signup', { errors: [{ msg: 'Server error during signup' }] });
  }
});

// Login Route
router.post('/login', [
  body('username', 'Username is required').notEmpty(),
  body('password', 'Password is required').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('login', { errors: errors.array() });
  }

  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).render('login', { errors: [{ msg: 'Invalid Credentials' }] });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).render('login', { errors: [{ msg: 'Invalid Credentials' }] });
    }

    req.session.userId = user._id;  // Set user ID in session
    res.redirect('/transactions');  // Redirect to transactions page after successful login
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).render('login', { errors: [{ msg: 'Server error during login' }] });
  }
});

module.exports = router;
