

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


var dabbawala= mongoose.model('Dabbawala',DabbawalaSchema);

exports.index = function(req, res, next){
  
  dabbawala.find(function (err, users) {

    if(err) next(err);
    res.json(users);

  });
};

exports.currentdabbawala= function(req, res, next) {
  
  var username = req.cookies.username;
  var id = req.cookies.id;
  
  console.log('In CurrdabbawalaSEssion    :   '+req.session.dabbawala.username)
  if (username == req.session.dabbawala.username){
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
  res.locals.dabbawala= req.dabbawala= req.session.user;
  next();
};

exports.register = function(req, res){
  res.render('dabbawalas/register');
}

exports.create = function(req, res, next){

  var dabbawala= new Dabbawala(req.body);

  dabbawala.confirmationToken = randomToken();
  dabbawala.confirmationTokenSentAt = dabbawala.createdAt = dabbawala.updatedAt = new Date();
  // use bcrypt to encrypt and decrypt a password
  dabbawala.salt = bcrypt.genSaltSync(10);
  dabbawala.hash = bcrypt.hashSync(req.body.password, dabbawala.salt);

  dabbawala.loginIps.push(req.ip);

  dabbawala.save(function(err,docs){

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
  dabbawala.findOne(query,function (err, user) {
    if(dabbawala.confirmationToken){
      smtpTransport.sendMail({
            from: "Tiffin <programtesting10@gmail.com>",
            to: dabbawala.email,
            subject: "Confirmation Of Account",
            text: "click here for confirm your account :http://localhost:3000/dabbawalas/confirm?token="+dabbawala.confirmationToken+"&username="+dabbawala.username
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
  res.render('dabbawalas/newConfirm');
};

exports.confirm = function(req, res, next) {

  var token = req.query.token;
  var username = req.query.username;

  dabbawala.findOne({confirmationToken: token, username: username},function (err, user) {
    dabbawala.update({updatedAt: new Date()},function(err,user){});
    if(err) next(err);

      dabbawala.update({$set: {confirmationToken: null}}, function() {
      dabbawala.update({$set: {confirmationAt: new Date()}},function(err,user){});
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
  res.render('dabbawalas/resetPassword');
};

exports.reset = function(req, res, next) {
  
  var login = req.body.email;
  var query = {$or: [{username: login}, {email: login}]};
  
  dabbawala.findOne(query, function(err, user) { 
    var resetToken=randomToken();
    dabbawala.update({resetPasswordToken: resetToken}, function() {
      if(err) next(err);
      if (err) {
        next(err);
      } else{
        dabbawala.update({resetPasswordTokenSentAt: new Date()},function(err,user){});
        smtpTransport.sendMail({
          from: "Tiffin <programtesting10@gmail.com>",
          to: dabbawala.email,
          subject: "Reset Password",
          text: "Click here for reset your password :http://localhost:3000/dabbawalas/resetnew?resetToken="+resetToken
        }, function ( error, response){});
        res.json('Reset Password Instruction send to Your Email');
      };
    });
  });
};

exports.resetNew = function(req, res, next) {

  var resetToken = req.query.resetToken;
  dabbawala.findOne({resetPasswordToken: resetToken},function (err, user) {
    if(err) next(err);
    dabbawala.update({resetPasswordToken: null}, function() {
      if(err) next(err);
      if (err) {
        next(err);
      } else{
        res.redirect('/newpassword?email='+dabbawala.email);
      };
    });

  });
};

exports.newPassword = function(req, res){
  var email = req.query.email;
  res.render('dabbawalas/newPassword',{email: email});
};

exports.newPasswordSave = function(req, res, next){

  var npassword = req.body.npassword;
  var cpassword = req.body.cpassword;
  var email = req.body.email;
  dabbawala.findOne({email: email},function (err, user) {
    if(npassword == cpassword){
      slt = bcrypt.genSaltSync(10);
      hsh = bcrypt.hashSync(npassword,slt);
      dabbawala.update({salt: slt,hash: hsh }, function() {
        dabbawala.update({updatedAt: new Date()},function(err,user){});
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
  res.render('dabbawalas/login');
};

exports.authenticate = function(req, res, next) {

  var login = req.body.login;
  var password = req.body.password;

  var query = {$or: [{username: login}, {email: login}]};

  dabbawala.findOne(query, function (err, user) {
    if(err) next(err);

      if(dabbawala!= null)
      {
        if (dabbawala== req.session.user){
          res.json(user);
        } else{
          
          var result = bcrypt.compareSync(password, dabbawala.hash);

          if(result) {
             if(err) next(err);
                req.session.dabbawala= user;

                if(dabbawala.loginIps.length == 5){
                  dabbawala.update({$pop: {loginIps: 1}},function(err,user){});
                  dabbawala.update({$push: {loginIps: req.ip}},function(err,user){});
                }
                else{
                  dabbawala.update({$push: {loginIps: req.ip}},function(err,user){});
                }

                var count=dabbawala.signInCount+1; //done
                dabbawala.update({$set: {signInCount: count}},function(err,user){});
                //res.redirect('/dabbawalaList');
                //shd open dabbawalas.edit
                res.json(user);
          } else {
              res.json('username or Password is incorrect!'); //change to json
          };
        };
      }
      else{
        res.json('username or Password is incorrect!'); //change to json
      }
      
  });
};


//will contain method of
//app.get('/index',dabbawala.index);
//app.get('/dabbawala/:id/show',dabbwala.show);

exports.delete= function(req, res){
  dabbawala.remove({_id:req.params.id},function (err, user){
    if (err){
      throw err;
    } else{
      res.json('Your Account has Deleted');
    };
  });
};

// exports.edit= function(req, res){
//   Dabbawala.findById(req.params.id, function(err,dabbawala){
//     if (err){
//       throw err;
//     } else{
//       res.render('dabbawalas/edit', {user: dabbawala});
//     };
//   });
// };
//will contain method of
//app.get('/dabbawlas/:id/edit',dabbawalas.edit);
//app.get('/dabbawalas/:id/editdailymenu',dabbawalas.editDailyMenu);
//app.get('/dabbawalas/:id/editfullprofile',dabbawalas.editFullProfile);

exports.update= function(req, res){
  var slt = bcrypt.genSaltSync(10);
  var hsh = bcrypt.hashSync(req.body.password, slt);

  dabbawala.findByIdAndUpdate(req.params.id,{
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
  req.session.dabbawala= null;
  res.redirect('/login');
}

function randomToken () {
  return crypto.randomBytes(48).toString('hex');
};

exports.trial = function (req, res, next) {
  res.json('this is the response');
};
