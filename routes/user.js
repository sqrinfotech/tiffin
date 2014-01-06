
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
  , Schema = mongoose.Schema
  , userValidation = require('./userValidation.js'); 

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
    //validate: userValidation.usernameValidator  
  },
  salt: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    validate: userValidation.nameValidator
  },
  email: {
    type: String,
    //unique: true,
    required: true,
    validate: userValidation.emailValidator
  },
  address: {
    type: String,
    validate: userValidation.addressValidator
  },
  location: {
    type: String,
    validate: userValidation.locationValidator
  },
  state: {
    type: String,
    validate: userValidation.stateValidator
  },
  zipCode: {
    type: Number,
    validate: userValidation.zipCodeValidator
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
  updatedAt: Date,
});



var User = mongoose.model('User',UserSchema);

exports.index = function(req, res, next){
  
  User.find(function (err, users) {

    if(err) next(err);
    res.json(users);

  });
};

exports.currentuser = function(req, res, next) {
  
  var username = req.cookies.username;
  var id = req.cookies.id;
  
  console.log('In CurrUser SEssion    :   '+req.session.user.username)
  if (username == req.session.user.username){
    console.log('session is correct');
    next();
  } else{
    res.json('Please Login');
   };
};

exports.isLogged = function(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  };
  res.locals.user = req.user = req.session.user;
  next();
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
      next();
    };
  });
};

exports.sendEmail = function(req, res){
  var login = req.body.email;
  var query = {$or: [{username: login}, {email: login}]};
  User.findOne(query,function (err, user) {
    if(user.confirmationToken){
      smtpTransport.sendMail({
            from: "Tiffin <programtesting10@gmail.com>",
            to: user.email,
            subject: "Confirmation Of Account",
            text: "click here for confirm your account :http://localhost:3000/users/confirm?token="+user.confirmationToken+"&username="+user.username
      }, function (error, response){
        if (error) {
          next(error);
        } else{
          res.json('Confirmation Link send to Your Email');
        };
      });
    }else{
      res.json('Your Account has already confirmed'); 
    }
  });
};

exports.newConfirm = function(req, res){
  res.render('users/newConfirm');
};

exports.confirm = function(req, res, next) {

  var token = req.query.token;
  var username = req.query.username;

  User.findOne({confirmationToken: token, username: username},function (err, user) {
    user.update({updatedAt: new Date()},function(err,user){});
    if(err) next(err);

      user.update({$set: {confirmationToken: null}}, function() {
      user.update({$set: {confirmationAt: new Date()}},function(err,user){});
      if(err) next(err);
      if (err) {
        next(err);
      } else{
        res.json('Your Account has confirmed');
      };
    });

  });
};

exports.resetPassword = function(req, res){
  res.render('users/resetPassword');
};

exports.reset = function(req, res, next) {
  
  var login = req.body.email;
  var query = {$or: [{username: login}, {email: login}]};
  
  User.findOne(query, function(err, user) { 
    var resetToken=randomToken();
    user.update({resetPasswordToken: resetToken}, function() {
       console.log('reset email : '+user.email)
      if(err) next(err);
      if (err) {
        next(err);
      } else{
        user.update({resetPasswordTokenSentAt: new Date()},function(err,user){});
        smtpTransport.sendMail({
          from: "Tiffin <programtesting10@gmail.com>",
          to: user.email,
          subject: "Reset Password",
          text: "Click here for reset your password :http://localhost:3000/users/resetnew?resetToken="+resetToken
        }, function ( error, response){});
        res.json('Reset Password Instruction send to Your Email');
      };
    });
  });
};

exports.resetNew = function(req, res, next) {

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

exports.newPassword = function(req, res){
  var email = req.query.email;
  res.render('users/newPassword',{email: email});
};

exports.newPasswordSave = function(req, res, next){

  var npassword = req.body.npassword;
  var cpassword = req.body.cpassword;
  var email = req.body.email;
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
          res.json('Password change');
        };
      });
    };
  });
};


exports.login = function(req, res, next) {
  res.render('users/login');
};

exports.register = function(req, res){
  res.render('users/register');
}

exports.authenticate = function(req, res, next) {

  var login = req.body.login;
  var password = req.body.password;

  var query = {$or: [{username: login}, {email: login}]};

  User.findOne(query, function (err, user) {
    if(err) next(err);

      if(user != null)
      {
        if (user == req.session.user){
          res.json(user);
        } else{
          
          var result = bcrypt.compareSync(password, user.hash);

          if(result) {
             if(err) next(err);
                req.session.user = user;

                if(user.loginIps.length == 5){
                  user.update({$pop: {loginIps: 1}},function(err,user){});
                  user.update({$push: {loginIps: req.ip}},function(err,user){});
                }
                else{
                  user.update({$push: {loginIps: req.ip}},function(err,user){});
                }

                var count=user.signInCount+1; //done
                user.update({$set: {signInCount: count}},function(err,user){});
                //res.redirect('users/dabbawalaList');
                res.redirect('/dabbawalaList');
                //res.json(user);
          } else {
              res.json('User name or Password is incorrect!'); //change to json
          };
        };
      }
      else{
        res.json('User name or Password is incorrect!'); //change to json
      }
      
  });
};


exports.show = function(req, res){
  User.findById(req.params.id, function (err, user){
    if (err){
      throw err;
    } else{
      res.json(user);
    };
  });
};

exports.delete= function(req, res){
  User.remove({_id:req.params.id},function (err, user){
    if (err){
      throw err;
    } else{
      res.json('Your Account has Deleted');
    };
  });
};

exports.update= function(req, res){
  var slt = bcrypt.genSaltSync(10);
  var hsh = bcrypt.hashSync(req.body.password, slt);

  User.findByIdAndUpdate(req.params.id,{
    username:req.body.username,
    name: req.body.name,
    email:req.body.email,
    address: req.body.address,
    location : req.body.city,
    salt : slt,
    hash : hsh,
    updatedAt : new Date()
  },function(err,docs){
      if (err){
        throw err;
      } else{
        res.json('Your Account has Updated');
      };
    }
  );
};

exports.logout = function(req, res){
  req.session.user = null;
  console.log('After logout : ' + req.session.user);
  res.redirect('/login');
}

function randomToken () {
  return crypto.randomBytes(48).toString('hex');
};

exports.trial = function (req, res, next) {
  res.json('this is the response');
};

exports.dabbawalaList = function(req, res){
  User.find({},function(err,docs){
    if (err){
      throw err;
    } else{
      res.render('users/dabbawalaList', {records:docs});
    };
  });
};