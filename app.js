
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , home = require('./routes/home')
  , users = require('./routes/user')
  , dabbawalas = require('./routes/dabbawala')
  , http = require('http')
  , path = require('path')
  , connect = require('connect')
  , mongoose = require('mongoose')
  , MongoStore = require('connect-mongo')(connect)
  , mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(connect);

var app = express();

// all environments

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
   var connection = mongoose.connect('mongodb://localhost/tiffin_development',{
    server: {
      poolSize: 3
    }
  });
}else{
  var connection = mongoose.connect('mongodb://localhost/tiffin_production');
};


app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.compress());
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: '5234523451',
    store: new MongoStore({
      mongoose_connection: connection.connections[0],
      clear_interval: 3600
    })
  }));
  app.use(app.router);
  app.use(require('less-middleware')({ 
    src: path.join(__dirname, 'public')
  })); // Using Less CSS styling !
  app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/', routes.home);
app.post('/home',home.home);

app.get('/users', users.index);
app.get('/users/register', users.register);
app.post('/users/create', users.create,users.sendEmail);
app.get('/users/confirm', users.confirm);
app.get('/newconfirm', users.newConfirm);
app.post('/users/newconfirm',users.sendEmail);
app.get('/resetpassword', users.resetPassword);
app.post('/users/resetpassword', users.reset);
app.get('/users/resetnew', users.resetNew);
app.get('/newpassword', users.newPassword);
app.post('/users/newpassword', users.newPasswordSave);

app.get('/trial', users.isLogged, users.trial);
app.get('/login', users.login);

app.post('/users/login', users.authenticate);
app.get('/users/:id/show',users.isLogged,users.show);
app.get('/users/:id/delete',users.isLogged,users.delete);
app.put('/users/:id/update',users.isLogged,users.update);
app.get('/users/:id/logout', users.isLogged, users.logout);

app.get('/users/sendLocation', users.getDabbawalas);
app.get('/users/enterLocation',users.enterLocation);

// ---------------------------------DABBAWALA---------------------------------------------
app.get('/dabbawalas/register', dabbawalas.register);
app.post('/dabbawalas/create', dabbawalas.create,dabbawalas.sendEmail);
app.get('/dabbawalas/confirm', dabbawalas.confirm);
app.get('/dabbawalas/newconfirm', dabbawalas.newConfirm);
app.post('/dabbawalas/newconfirm',dabbawalas.sendEmail);

app.get('/dabbawalas/resetpassword', dabbawalas.resetPassword);
app.post('/dabbawalas/resetpassword', dabbawalas.reset);
app.get('/dabbawalas/resetnew', dabbawalas.resetNew);
app.get('/dabbawalas/newpassword', dabbawalas.newPassword);
app.post('/dabbawalas/newpassword', dabbawalas.newPasswordSave);

app.get('/dabbawalas/trial', dabbawalas.isLogged, dabbawalas.trial);
app.get('/dabbawalas/login', dabbawalas.login);
app.post('/dabbawalas/login', dabbawalas.authenticate);
app.get('/dabbawalas/logoutButton',dabbawalas.logoutButton);

// app.get('/index',dabbawalas.index);
// app.get('/dabbawalas/:id/show',dabbawalas.show);

app.get('/dabbawalas/addTiffinDetails',dabbawalas.addTiffinDetails);
app.get('/dabbawalas/addDailyMenu',dabbawalas.addDailyMenu);
app.get('/dabbawalas/:id/editfullprofile',dabbawalas.editFullProfile);
app.get('/dabbawalas/:id/editDailyMenu',dabbawalas.editDailyMenu);
app.post('/dabbawalas/:id/updateTiffinDetails', dabbawalas.updateTiffinDetails);
app.post('/dabbawalas/:id/newDailyMenu', dabbawalas.newDailyMenu);
app.put('/dabbawalas/:id/updateProfile',dabbawalas.updateProfile);
app.put('/dabbawalas/:id/updateDailyMenu',dabbawalas.updateDailyMenu);

//app.get('/dabbawalas/:id/delete',dabbawalas.isLogged,dabbawalas.delete);



app.get('/dabbawalas/:id/logout', dabbawalas.isLogged, dabbawalas.logout);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});