var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');
var models = require('../models');
var passport = require('passport');
const jwt = require('jsonwebtoken');

/* GET users listing. */
router.post('/', function(req, res, next) {
  let id = req.body.id;
  let email = req.body.email;
  let password = req.body.password;
  let phone = req.body.phone;

  let Op = Sequelize.Op;

  models.User.findOne({
    where: {
      [Op.or]: [{id: id}, {email: email}, {phone: phone}]
    }
  }).then(result => {
    if(result != null) {
      res.sendStatus(409);
    } else {
      models.User.create({
        id: id,
        email: email,
        password: password,
        phone: phone
      }).then(() => {
        res.send("User create Success");
      });
    }
  });
});

router.post('/login/local', passport.authenticate('local', {session: false}),
  (req, res) => {
    const token = jwt.sign({
      id: req.user.id
    },
    'secret_key'
    );
    res.cookie('jwt', token);
    return res.sendStatus(200);
  }
);

router.get('/kakao', function(req, res) {
  res.render('login');
});

router.post('/login/kakao', passport.authenticate('kakao'));

router.get('/kakao/oauth', passport.authenticate('kakao', {  
  session: false,
  failureRedirect: '/user/kakao'
}), (req, res) => {
  const token = jwt.sign({
    id: req.user.id
  },
  'secret_key'
  );  
  res.cookie('jwt', token);
  return res.sendStatus(200);
}
);

router.get('/info', passport.authenticate('jwt', {session: false}), (req, res) => {
  return res.json(req.user);
});

module.exports = router;
