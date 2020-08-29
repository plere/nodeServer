var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');
var models = require('../models');
var passport = require('passport');

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

router.post('/login', passport.authenticate('local', {session: false}), 
  function(req, res) {    
    if(req.user)
      res.send("login success");
});

module.exports = router;

