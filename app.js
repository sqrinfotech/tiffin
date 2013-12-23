
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , users = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , flash = require('connect-flash')
  , mongoose = require('mongoose');

var app = express();

app.configure(function() {
  app.use(express.cookieParser('keyboard cat'));
  app.use(express.session({ cookie: { maxAge: 60000 }}));
  app.use(flash());
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.bodyParser());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  mongoose.connect('mongodb://localhost/tiffin_development');
}else{
  mongoose.connect('mongodb://localhost/tiffin_production');
};

app.get('/', function(req, res){
  req.flash('info', 'Hello,Welcome To dabba wala Application ');
  res.render('home', { message: req.flash('info') });
});

app.get('/users', users.index);
app.post('/users/create', users.create);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});