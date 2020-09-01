var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var models = require('./models')

var app = express();

var passport = require('passport');
var LocalStrategy = require('passport-local');
var kakaoStrategy = require('passport-kakao').Strategy;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'password'
},
  function(id, password, done) {
    models.User.findOne({
      where: {
        id: id,
        password: password
      }
    }).then(user => {
      if(user == null)
        return done(null, false);
      else{
        return done(null, user);
      }
    });
  }
));

passport.use('kakao', new kakaoStrategy({
  clientID: '{REST_API_KEY}',  
  callbackURL: 'http://localhost:3000/user/kakao/oauth'
},
  function(accessToken, refreshToken, profile, done) {        
    let newId = "kakao:"+profile.id;
    let email = profile._json.kakao_account.email;    

    models.User.findOne({
      where: {
        id: newId
      }
    }).then(loginUser => {
      if(loginUser != null)
      {        
        console.log(loginUser);
        return done(null, loginUser);
      }
      else {
        models.User.create({
          id: newId,
          email: email,
          phone: profile.id //임시처리
        }).then(user => {          
          return done(null, user);
        });
      }
    });    
  }
));

app.use('/', indexRouter);
app.use('/user', usersRouter);

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
