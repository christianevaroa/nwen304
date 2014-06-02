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
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(__dirname));
});

require('./app/routes')(app, client); // put the routes in here. can change them later if we need. 

var lat;
var lon;
var monster;


var server = app.listen(port || 3000, function() {
  console.log('Listening on:', server.address().port);
});
