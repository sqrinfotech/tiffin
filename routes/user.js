
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

//Validations added by Raeesaa

var nameValidator = [
  validate({message: 'Name should not be empty'},'notNull'), 
  validate({message: 'Name must contain only letters'}, 'isAlpha')
];

var emailValidator = [
  validate({message: 'Email should not be empty'}, 'notNull'), 
  validate({message: 'Invalid email format'}, 'isEmail')
];

var usernameValidator = [
  validate({message: 'Username should not be empty'},'notNull'), 
  validate({message: 'Username should be between 2 and 20 characters'}, 'len', 2, 20),
  validate({message: 'Username must contain only aplhanumeric characters or underscores'}, 'regex', /^[a-zA-Z0-9_]]*$/)
];

var passwordValidator = [
  validate({message: 'Password should not be empty'}, 'notNull'), 
  validate({message: 'Password should be minimum 8 characters long'}, 'len', 8)
];

var addressValidator = [
  validate({message: 'Address should not be empty'}, 'notNull')
];

var zipCodeValidator = [
  validate({message: 'Zip code should not be empty'}, 'notNull'), 
  validate({message: 'Zip code should contain only numbers'}, 'isNumeric')
];

var locationValidator = [
  validate({message: 'Location should not be empty'}, 'notNull'),
  validate({message: 'Location should contain only letters'}, 'isAlpha')
];

var UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    validate: usernameValidator
  },
  salt: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    validate: nameValidator
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: emailValidator
  },
  address: {
    type: String,
    validate: addressValidator
  },
  location: {
    type: String,
    validate: locationValidator
  },
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