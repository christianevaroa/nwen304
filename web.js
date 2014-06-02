var flash = require('connect-flash'); // has to go at top
var express = require('express')
  , app = express.createServer(express.logger())
  , pg = require('pg').native
  , connectionString = process.env.DATABASE_URL
  , start = new Date()
  , port = process.env.PORT
  , client;

client = new pg.Client(connectionString);
client.connect();

app.configure(function(){
  app.use(express.static(__dirname));
  app.use(express.cookieParser('keyboard cat'));
  app.use(express.bodyParser());
  app.use(express.session({ cookie : {maxAge : 600000 }}));
  app.use(flash()); // for flashing messages in requests
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  
});

require('./app/routes')(app, client); // put the routes in here. can change them later if we need. 
require('./app/passport')(passport, client);
require('./app/passport-routes.js')(app, passport);

var lat;
var lon;
var monster;


var server = app.listen(port || 3000, function() {
  console.log('Listening on:', server.address().port);
});
