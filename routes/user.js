
/*
 * Users controller and model
 * TODO
 *
 *  1. Seperate the model into a models directory
 *  2. Follow indentation
 *  3. Move randomToken() method under utils folder
 *  4. Move sendEmail method under utils folder
 // user.update({$push: {loginIps: req.ip}},function(err,user){});
 */
var validate = require('mongoose-validator').validate
  , nodemailer = require("nodemailer")
  , flash = require('connect-flash')
  , mongoose = require('mongoose')
  , crypto = require('crypto')
  , bcrypt = require('bcrypt')
  , Schema = mongoose.Schema; 

var smtpTransport = nodemailer.createTransport("SMTP",{
   service: "Gmail",
   auth: {
       user: "programtesting10@gmail.com",
       pass: "programtesting"
   }
});

var UserSchema = new Schema({
  username: {
    type: String,
    //unique: true,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true
  },
  name: String,
  email: {
    type: String,
    //unique: true,
    required: true
  },
  address: String,
  location: String,
  loginIps: Array,
  confirmationToken:  String,
  confirmationTokenSentAt: Date,
  confirmationAt: Date,
  resetPasswordToken: String,
  resetPasswordTokenSentAt: Date,
  signInCount: {
    type: Number,
    default: 0
  },
  createdAt: Date,
  updatedAt: Date
});

var User = mongoose.model('User',UserSchema);

exports.index = function(req, res, next){
  
  User.find(function (err, users) {

    if(err) next(err);
    res.json(users);

  });
};

exports.create = function(req, res, next){

  console.log(req.body);
  var user = new User(req.body);

  user.confirmationToken = randomToken();
  user.confirmationTokenSentAt = user.createdAt = user.updatedAt = new Date();

  // use bcrypt to encrypt and decrypt a password
  user.salt = bcrypt.genSaltSync(10);
  user.hash = bcrypt.hashSync(req.body.password, user.salt);

  user.loginIps.push(req.ip);

  user.save(function(err,docs){

    if(err){

      next(err);

    }else {

      console.log('registration was successful');

      // trigger sending email
     smtpTransport.sendMail({
        from: "My Name <programtesting10@gmail.com>",
        to: req.body.email,
        subject: "By form",
        text: "click here :http://localhost:3000/users/confirm?token="+user.confirmationToken+"&username="+user.username
      }, function(error, response){

        if(error){
          console.log(error);
        }else{
          console.log("Message sent: " + response.message);
        };

      });

      res.json(user);
    };
  });
};

exports.confirm = function(req, res, next) {

  var token = req.query.token;
  var username = req.query.username;

  User.findOne({confirmationToken: token, username: username},function (err, user) {
    user.update({updatedAt: new Date()},function(err,user){});
    if(err) next(err);

      user.update({confirmationToken: null}, function() {
      user.update({confirmationAt: new Date()},function(err,user){});
      if(err) next(err);
      if (err) {
        next(err);
      } else{
        res.json(user);
      };
    });

  });
};

exports.reset = function(req, res, next) {
  
  var query;
  User.findOne(query, function(err, user) { 
    var resetToken=randomToken();
    user.update({resetPasswordToken: resetToken}, function() {
      
      if(err) next(err);
      if (err) {
        next(err);
      } else{
        user.update({resetPasswordTokenSentAt: new Date()},function(err,user){});
        smtpTransport.sendMail({
          from: "My Name <programtesting10@gmail.com>",
          to: user.email,
          subject: "By form",
          text: "RESET PASSWORD MSG *****  :http://localhost:3000/users/resetnew?resetToken="+resetToken
        }, function(error, response){});
        res.json(user);
      };
    });
  });
};

exports.resetnew = function(req, res, next) {

  var resetToken = req.query.resetToken;
  User.findOne({resetPasswordToken: resetToken},function (err, user) {
    if(err) next(err);
    user.update({resetPasswordToken: null}, function() {
      if(err) next(err);
      if (err) {
        next(err);
      } else{
        res.redirect('/newpassword?email='+user.email);
      };
    });

  });
};

exports.newpassword = function(req, res, next){

  var npassword = req.query.npassword;
  var cpassword = req.query.cpassword;
  var email = req.query.email;
  User.findOne({email: email},function (err, user) {
    if(npassword == cpassword){
      slt = bcrypt.genSaltSync(10);
      hsh = bcrypt.hashSync(npassword,slt);
      user.update({salt: slt,hash: hsh }, function() {
        user.update({updatedAt: new Date()},function(err,user){});
        if(err) next(err);
        if (err) {
          next(err);
        } else{
          res.redirect('Password change');
        };
      });
    };
  });
};

exports.login = function(req, res, next) {

  var username = req.query.username;
  var password = req.query.password;

  User.findOne({username: username},function (err, user) {
    if(err) next(err);

     if (username == req.session.name){
        console.log('Session Maintainging ************************* : '+req.session.name);
        res.json(user); 
      } else{
        var result = bcrypt.compareSync(password, user.hash);
        console.log('Password Match ************************* : '+result);

        if(result) {
          User.findOne({confirmationToken: null},function (err, user) {
            if(err) next(err);

              req.session.name = req.query.username;

              console.log('Session ************************* : '+req.session.name);
              user.update({$push: {loginIps: req.ip}},function(err,user){});
              var count=user.signInCount+1;
              user.update({signInCount: count},function(err,user){});

              res.json(user); 
          }); 
        } else {
            console.log('Password Not Matching'+result);
           next(err);
        };
      };
  });
};

function randomToken () {
  return crypto.randomBytes(48).toString('hex');
};