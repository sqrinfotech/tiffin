
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , users = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , connect = require('connect')
<<<<<<< Updated upstream
  , mongoose = require('mongoose')
  , MongoStore = require('connect-mongo')(connect);

=======
  , mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(connect);
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
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
=======
app.use(express.cookieParser());
app.use(express.session({
>>>>>>> Stashed changes
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

app.get('/users', users.index);
app.post('/users/create', users.create);
app.get('/users/confirm', users.confirm);
app.get('/users/reset', users.reset);
app.get('/users/resetnew', users.resetnew);
app.get('/newpassword', routes.newpassword);
app.post('/users/newpassword', users.newpassword);

app.get('/trial', users.isLogged, users.trial);

app.get('/login', users.login);
// app.post('/users/login', users.isLogged, users.authenticate);
app.post('/users/login', users.authenticate);

app.get('/users/:id/show',users.currentuser,users.show);

app.get('/users/:id/delete',users.currentuser,users.delete);

app.put('/users/:id/update',users.currentuser,users.update);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});