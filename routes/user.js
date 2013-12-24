
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

//Validations added by Raeesaa

var nameValidator = validate[validate('notNull'), validate('isAlpha')];

var emailValidator = validate[validate('notNull'), validate('isEmail')];

var usernameValidator = validate[validate('notNull'), 
                        validate({message: 'Username should be between 2 and 20 characters'}, 'len', 2, 20),
                        validate({message: 'Username must contain only aplhanumeric characters or underscores'}, 'regex', /^[a-zA-Z0-9_]]*$/)];

var passwordValidator = validate[validate('notNull'), validate({message: "Password should be minimum 8 characters long"}, 'len', 8)];

var addressValidator = validate[validate('notNull')];

var zipCodeValidator = validate[validate('notNull'), validate('isNumeric')];

/*UserSchema.path('name').validate(isEmpty(val), 'Name is required');

UserSchema.path('username').validate(isEmpty(val), 'Username is required');

UserSchema.path('password').validate(isEmpty(val), 'Password is required');

UserSchema.path('email').validate(isEmpty(val), 'Email ID is required');

UserSchema.path('address').validate(isEmpty(val), 'Address is required');

UserSchema.path('zipcode').validate(isEmpty(val), 'ZipCode is required');


UserSchema.path('username').validate(message: "Username should be between 2 and 20 characters"}, 'len', 2, 20);

UserSchema.path('username').validate(/^[a-zA-Z0-9_]]*$/
  , 'Username must contain only aplhanumeric characters or underscores');
*/


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

/*var isEmpty = function(val){
  if(val == null){
    return false;
  }
  else{
    return true;
  }

};*/