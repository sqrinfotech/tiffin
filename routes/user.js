
// // /*
// //  * GET users listing.
// //  */
var express = require('express');
var flash=require('connect-flash');
var nodemailer = require("nodemailer");
var crypto = require('crypto');


var smtpTransport = nodemailer.createTransport("SMTP",{
   service: "Gmail",
   auth: {
       user: "programtesting10@gmail.com",
       pass: "programtesting"
   }
});


var app = express();

app.configure(function() {
  app.use(express.cookieParser('keyboard cat'));
  app.use(express.session({ cookie: { maxAge: 60000 }}));
  app.use(flash());
});

var mongoose=require('mongoose'),
	validate = require('mongoose-validator').validate,
   Schema=mongoose.Schema,
   ObjectId=Schema.ObjectId;

var DabbawalaSchema=new Schema({
	uname:{ type: String, unique: true, required: true },
	password:{ type: String, required: true},
	name:{ type: String, required: true },
	email:{ type: String, unique: true, required: true },
	address:String,
	location:String,
	loginips:String,
	confirmationTokan: String,
	confirmationTokanSentAt:Date,
	confirmationAt:Date,
	resetPasswordTokan:String,
	resetPasswordTokanSentAt:Date,
	signInCount:Number,
	createdAt:Date,
	updatedAt:Date
});

var Dabbawala=mongoose.model('Dabbawala',DabbawalaSchema);

exports.list = function(req, res){
	res.send("respond with a resource");
};

var token = crypto.randomBytes(48);

exports.insert = function(req, res){
	var dabba = new Dabbawala({
    	uname:req.body.uname,
    	password:req.body.pass,
    	name:req.body.name,
    	email:req.body.email,
    	address:req.body.address ,
    	location:req.body.city,
    	//loginips:
		confirmationTokan: token,
		confirmationTokanSentAt:new Date,
    	signInCount:0,
    	createdAt:new Date,
		updatedAt:new Date
  	});
  	console.log('************************* in insert *******************');
  	console.log(req.body.uname)
  	console.log(req.body.pass)
  	console.log(req.body.email)
  	console.log('************************* in insert *******************')
	dabba.save(function(err,docs){
		if(err){
				Object.keys(err.errors).forEach(function(key) {
				var message = err.errors[key].message;
				console.log('Validation error for "%s": %s', key, message);
				res.end('Registration Unsuccessful '); 
			});
		}//if
		else{
				res.writeHead(200, {'Content-type': 'text/plain'
						});
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
   				}
			});

			res.end('Registration successful'); 
		}
	});
};