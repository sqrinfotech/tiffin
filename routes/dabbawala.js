

var validate = require('mongoose-validator').validate
  , nodemailer = require("nodemailer")
  , flash = require('connect-flash')
  , mongoose = require('mongoose')
  , crypto = require('crypto')
  , bcrypt = require('bcrypt')
  , Schema = mongoose.Schema
  , dabbawalaSchema = require('../models/dabbawalaSchema.js');

var smtpTransport = nodemailer.createTransport("SMTP",{
   service: "Gmail",
   auth: {
       user: "programtesting10@gmail.com",
       pass: "programtesting"
   }
});


var Dabbawala = dabbawalaSchema.Dabbawala;
var Menu = dabbawalaSchema.Menu;
var Item = dabbawalaSchema.Item;

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

  var dabbawala = new Dabbawala(req.body);

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
  Dabbawala.findOne(query,function (err, dabbawala) {
    if(dabbawala.confirmationToken){
      smtpTransport.sendMail({
            from: "Tiffin <programtesting10@gmail.com>",
            to: dabbawala.email,
            subject: "Confirmation Of Account",
            text: "click here for confirm your account :http://localhost:3000/dabbawalas/confirm?token="+dabbawala.confirmationToken+"&username="+dabbawala.username
      }, function (error, response){
        if (error) {
          console(error);
        } else{
          //res.json('Confirmation Link send to Your Email');
          console.log(dabbawala);
          res.render('dabbawalas/addTiffinDetails', {dabbawala: dabbawala});
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

  Dabbawala.findOne({confirmationToken: token, username: username},function (err, dabbawala) {
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



exports.addTiffinDetails = function(req, res) {
  res.render('dabbawalas/addTiffinDetails');
};
exports.addDailyMenu = function(req, res) {
  res.render('dabbawalas/addDailyMenu');
};
exports.editFullProfile = function(req, res) {
  res.render('dabbawalas/editFullProfile');
};
exports.editDailyMenu = function(req, res) {
  res.render('dabbawalas/editDailyMenu');
};

exports.updateTiffinDetails = function(req, res) {
  var distributionAreas = req.body.area;
  var arr = distributionAreas.split(",");

  console.log(arr);
  console.log(req.body);

  Dabbawala.findOne(req.params.id, function(err, dabbawala){
    if(err){
      console.log(err);
    }
    else{
      dabbawala.updatedAt = new Date();
      dabbawala.distributionAreas = arr;
      dabbawala.category = {veg: req.body.category_veg, nonVeg: req.body.category_nonveg},
      dabbawala.orderType = {monthly: req.body.order_type_monthly, weekly: req.body.order_type_weekly, daily: req.body.order_type_daily},
      dabbawala.price = {
        monthly: {
          veg: req.body.price_monthly_veg,
          nonVeg: req.body.price_monthly_nonveg 
        },
        weekly:{
          veg: req.body.price_weekly_veg,
          nonVeg: req.body.price_weekly_nonveg
        },
        daily:{
          veg: req.body.price_daily_veg,
          nonVeg: req.body.price_daily_nonveg
        }
      }
      dabbawala.save(function(err){
        if(err)
          console.log(err);
        else
          //res.json(dabbawala);
          res.render('dabbawalas/addDailyMenu', {dabbawala: dabbawala});
      });
    }
      
  });

  /*Dabbawala.findByIdAndUpdate(req.params.id, {$set: {
    updatedAt: new Date(),
      distributionAreas: arr,
      category: {veg: req.body.category_veg, nonVeg: req.body.category_nonveg},
      orderType: {monthly: req.body.order_type_monthly, weekly: req.body.order_type_weekly, daily: req.body.order_type_daily},
      price: {
        monthly: {
          veg: req.body.price_monthly_veg,
          nonVeg: req.body.price_monthly_nonveg 
        },
        weekly:{
          veg: req.body.price_weekly_veg,
          nonVeg: req.body.price_weekly_nonveg
        },
        daily:{
          veg: req.body.price_daily_veg,
          nonVeg: req.body.price_daily_nonveg
        }
      }
      }
    }, function(err, dabbawala){

      if(err){
        console.log(err);
      }
      else{
        res.json(dabbawala);
      }

  });*/
};

exports.updateDailyMenu= function(req, res){


};

exports.updateProfile = function(req, res){

};

exports.newDailyMenu = function(req, res) {

  var lunchVeg = req.body.lunch_veg
    , lunchNonveg = req.body.lunch_nonveg
    , dinnerVeg = req.body.dinner_veg
    , dinnerNonveg = req.body.dinner_nonveg;

  var lunchVegArr = lunchVeg.split(",");
  var lunchNonvegArr = lunchNonveg.split(",");
  var dinnerVegArr = dinnerVeg.split(",");
  var dinnerNonvegArr = dinnerNonveg.split(","); 


  Menu.findOne({dabbawalaId: req.params.id}, function(err, menu){
    if(err){
      console.log(err);
    }
    else{
      if(menu == null){
        var menu = new Menu;
        menu.dabbawalaId = req.params.id;
        menu.dayArray.push({date: req.body.date,
            lunch: {veg: lunchVegArr, nonVeg: lunchNonvegArr}, 
            dinner: {veg: dinnerVegArr, nonVeg: dinnerNonvegArr}
        });

        menu.save(function(err, menu){
          if(err){
            console.log(err);
          }
          else{
            res.json(menu);
          }
        });
      }
      else{
        menu.update({$push: {dayArray: {date: req.body.date, 
            lunch: {veg: lunchVegArr, nonVeg: lunchNonvegArr}, 
            dinner: {veg: dinnerVegArr, nonVeg: dinnerNonvegArr}}}}, function(err){
            if(err){
              console.log(err);
            }
            else
            {
              res.json(menu);
            }
        });
      }
    }
  });
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
