const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const {
  postRegister,
  postLogin,
  getLogout,
  landingPage,
  getLogin,
  getRegister,
  getProfile,
  updateProfile
} = require('../controllers/index');
const {
  asyncErrorHandler,
  isLoggedIn,
  isValidPassword,
  changePassword
} = require('../middleware/index');
const {
  storage
} = require('../cloudinary/index');
const upload = multer({
  storage
});

// Home page
router.get('/', asyncErrorHandler(landingPage));

// register form
router.get('/register', getRegister);

// register user
router.post('/register', upload.single('image'), asyncErrorHandler(postRegister));

// user login form
router.get('/login', getLogin);

// login user
router.post('/login', asyncErrorHandler(postLogin));

// user profile form
router.get('/profile', asyncErrorHandler(getProfile));

// profile update form
router.put('/profile', isLoggedIn, upload.single('image'),
  asyncErrorHandler(isValidPassword),
  asyncErrorHandler(changePassword),
  asyncErrorHandler(updateProfile)
);

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
router.get('/logout', getLogout);


module.exports = router;