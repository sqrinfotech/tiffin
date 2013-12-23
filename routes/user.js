
/*
 * Users controller and model
 * TODO
 *
 *  1. Seperate the model into a models directory
 *  2. Follow indentation
 *  3. Move randomToken() method under utils folder
 *  4. Move sendEmail method under utils folder
 */
var flash = require('connect-flash')
  , nodemailer = require("nodemailer")
  , crypto = require('crypto')
  , mongoose = require('mongoose')
  , validate = require('mongoose-validator').validate
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

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
  password: {
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
  loginips: String,
  confirmationTokan:  String,
  confirmationTokanSentAt: Date,
  confirmationAt: Date,
  resetPasswordTokan: String,
  resetPasswordTokanSentAt: Date,
  signInCount: Number,
  createdAt: Date,
  updatedAt: Date
});

var User = mongoose.model('User',UserSchema);

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.create = function(req, res){

  var userDetails = {
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    location: req.body.city,
    password: req.body.password, // i told you we are not going to save passwords in plain text at all
    address: req.body.address,

    //loginips:  where are the ips ?
    signInCount:0, // default this in schema to 0
    confirmationTokan: randomToken(), // what is this ?
    confirmationTokanSentAt: new Date(),
    createdAt:new Date(),
    updatedAt:new Date()
  };

  var user = new User(req.body);

  user.confirmationTokan = randomToken();
  user.createdAt = user.updatedAt = new Date();
  // use bcrypt to encrypt and decrypt a password

    console.log('************************* in insert *******************');
    console.log(req.body.username);
    console.log(req.body.password);
    console.log(req.body.email);
    console.log('************************* in insert *******************')

  user.save(function(err,docs){

    if(err){

      Object.keys(err.errors).forEach(function(key) {

        var message = err.errors[key].message;
        console.log('Validation error for "%s": %s', key, message);
        res.end('Registration Unsuccessful '); 

      });

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

