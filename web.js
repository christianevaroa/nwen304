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
});

var lat;
var lon;
var monster;

app.get('/', function(req, res) {

  client.query('SELECT * FROM locations', function(err, result) {
    res.send('number of rows: '+result.rows.length);
  });
  
});

app.get('/location', function(req,res) {
  res.send(lat + ", " + lon + ": " +monster);
});

app.post('/location', function(req,res) {
  if(!req.body.hasOwnProperty('lat') || 
    !req.body.hasOwnProperty('lon') ||
    !req.body.hasOwnProperty('monster')){
     res.statusCode = 400;
     return res.send('Error 400: Post syntax incorrect.'); 
    }
    lat = req.body.lat;
    lon = req.body.lon;
    monster = req.body.monster;
    res.json(true);
})

app.listen(port, function() {
  console.log('Listening on:', port);
});
