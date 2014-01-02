
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , users = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , connect = require('connect')
  , mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(connect);
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// var MemoryStore = require('connect').session.MemoryStore;
// app.use(express.cookieParser());
// app.use(express.session({ 
//     secret: "keyboard cat", 
//     store: new MemoryStore({ 
//         reapInterval: 60000 
//     })
// }));

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
   var connection= mongoose.connect('mongodb://localhost/tiffin_development',{
    server: {
      poolSize: 3
    }
  }
  );
}else{
  mongoose.connect('mongodb://localhost/tiffin_production');
};



app.use(express.cookieParser());
app.use(express.session({
    secret: '5234523451',
    store: new MongoStore({
      mongoose_connection: connection.connections[0],
      clear_interval: 3600
    })
  }));

app.get('/users', users.index);

app.post('/users/create', users.create);

app.get('/users/confirm', users.confirm);

app.get('/users/reset', users.reset);
app.get('/users/resetnew', users.resetnew);
app.get('/newpassword', routes.newpassword);
app.post('/users/newpassword', users.newpassword);

app.post('/users/login', users.login);

app.get('/users/:id/show',users.currentuser,users.show);

app.get('/users/:id/delete',users.currentuser,users.delete);

app.put('/users/:id/update',users.currentuser,users.update);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});