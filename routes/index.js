const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  postRegister,postLogin,getLogout
} = require('../controllers/index');
const {
  asyncErrorHandler
} = require('../middleware/index');

// Home page
router.get('/', (req, res, next) => {
  res.render('index', {
    title: 'Surf Shop'
  });
});

// register form
router.get('/register', (req, res, next) => {
  res.send('register here');
});

// register user
router.post('/register', asyncErrorHandler(postRegister));

// user login form
router.get('/login', (req, res, next) => {
  res.send('login here');
});

// login user
router.post('/login',postLogin);

// user profile form
router.get('/profile', (req, res, next) => {
  res.send('get profile here');
});

// profile update form
router.put('/profile/:user_id', (req, res, next) => {
  res.send('update your profile');
});

// forgot password
router.get('/forgot-pw', (req, res, next) => {
  res.send('enter mail id');
});

// update user and token
router.put('/forgot-pw', (req, res, next) => {
  res.send('updates user password and token');
});

// get user details for password reset
router.get('/reset-pw/:id', (req, res, next) => {
  res.send('enter mail id');
});

//update password
router.put('/reset-pw/:id', (req, res, next) => {
  res.send('enter mail id');
});

// logout
router.get('/logout',getLogout);

module.exports = router;