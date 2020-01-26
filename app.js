// esversion:6
require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const indexRouter = require('./routes/index');
const postsRouter = require('./routes/posts');
const revieswRouter = require('./routes/reviews');
const User = require('./models/user');
const session = require('express-session');
var favicon = require('serve-favicon');
const engine = require('ejs-mate')
const app = express();
// const seedPosts = require('./seeds')
// seedPosts()
app.use(methodOverride('_method'));
app.use(express.static('public'))
app.locals.moment = require('moment');

// connect to db
mongoose.connect(`mongodb://${process.env.MONGO_URL}`, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
}, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Connection Sucessful');
  }
});

const db = mongoose.connection;
db.on('error', () => {
  console.log('DB connection Error');
});
db.once('open', () => {
  console.log('DB is connected');
});


app.engine('ejs',engine);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'ajdkaj adsjakl',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  // req.user = {
  //   //ObjectId(""),
  //   // ObjectId("5dcfded64538880614ebe655"),
  //   '_id':'5dcfded64538880614ebe655',
  //   'username':'ian2'
  // }
  res.locals.username = req.user;
  res.locals.title ='Surf Shop';
  res.locals.success = req.session.success ||'';
  delete req.session.success
  res.locals.error = req.session.error ||'';
  delete req.session.error
  next();
});

app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/posts/:id/reviews', revieswRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // // render the error page
  // res.status(err.status || 500);
  // res.render('error');
  // console.log(err);
  req.session.error = err.message
  res.redirect('back');
});

module.exports = app;