
/*
 * Users controller and model
 * TODO
 *
 *  1. Seperate the model into a models directory
 *  2. Follow indentation
 *  3. Move randomToken() method under utils folder
 *  4. Move sendEmail method under utils folder
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
    unique: true,
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
    unique: true,
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
  
};

exports.create = function(req, res, next){

  // var userDetails = {
  //   name: req.body.name,
  //   username: req.body.username,
  //   email: req.body.email,
  //   location: req.body.city,
  //   password: req.body.password, // i told you we are not going to save passwords in plain text at all
  //   address: req.body.address,

  //   //loginips:  where are the ips ?
  //   confirmationTokenSentAt: new Date(),
  //   createdAt:new Date(),
  //   updatedAt:new Date()
  // };

  var user = new User(req.body);

  user.confirmationToken = randomToken();
  user.confirmationTokenSentAt = user.createdAt = user.updatedAt = new Date();

  // use bcrypt to encrypt and decrypt a password
  user.salt = bcrypt.genSaltSync(10);
  user.hash = bcrypt.hashSync(req.body.password, user.salt);

  user.loginIps.push(req.ip);

  console.log('************************* in insert *******************');
  console.log(req.body.username);
  console.log(req.body.password);
  console.log(req.body.email);
  console.log('************************* in insert *******************')

  user.save(function(err,docs){

    if(err){

      next(err);

    }else {

      console.log('registration was successful');

      smtpTransport.sendMail({
        from: "My Name <programtesting10@gmail.com>",
        to: req.body.email,
        subject: "By form",
        text: "click here : /users/index"
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

function randomToken () {
  return crypto.randomBytes(48).toString('hex');
};
