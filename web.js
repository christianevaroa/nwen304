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

var lat;
var lon;
var monster;

/*
 *  routes to pages
 */

app.get('/', function(req, res) {
  res.sendfile('/app/views/index.html', {root :__dirname });
});



app.get('/addmonster', function(req, res){

  res.sendfile('/app/views/monsterupload.html', {root: __dirname });
  
});

app.get('/numberofrows', function(req, res) {

  client.query('SELECT * FROM locations', function(err, result) {
    res.send('number of rows: '+result.rows.length);
  });
});

app.get('/location/:lat/:lon', function(req,res) {
  client.query('SELECT * FROM locations WHERE lat='+req.params.lat+' AND lon='+req.params.lon, function(err, result) {
    res.send(result);
  });
});


app.get('/monsterlist', function(req, res) {
  client.query('SELECT * FROM locations', function(err, result){
    res.send(result);
  });

});

app.get('/map', function(req, res) {
   res.sendfile('/app/views/map.html', {root: __dirname });
 });

/*
 * Client sends current latitude and longitude, server returns list of 5 nearest locations
 */
app.get('/nearest/:mylat/:mylon', function(req, res) {
  client.query('SELECT * FROM locations ORDER BY (ABS(lat - '+req.params.mylat+') + ABS(lon - '+req.params.mylon+')) LIMIT 5', function(err, result) {
    res.send(result.rows);
  });
});

/*
 * Client sends current location, server decides if client is close enough to a location.
 * If client is close enough, send the monster to the client.
 */
 app.get('/getmonster/:mylat/:mylon', function(req, res) {
  client.query('SELECT * FROM locations ORDER BY (ABS(lat - '+req.params.mylat+') + ABS(lon - '+req.params.mylon+')) LIMIT 1', function(err, result) {
    var dist = distance(req.params.mylat, req.params.mylon, result.rows[0].lat, result.rows[0].lon);
    // Need to make server decide if client is close enough to location and respond accordingly
    res.send(dist);
    // var dist = distance(req.params.mylat, req.params.mylon, result.rows[0].lat, result.rows[0].lon);
    // res.send(dist);
  });
 });

app.post('/location', function(req,res) {
  if(!req.body.hasOwnProperty('lat') || 
    !req.body.hasOwnProperty('lon') ||
    !req.body.hasOwnProperty('monster')){
     res.statusCode = 400;
     return res.send('Error 400: Post syntax incorrect.'); 
    }
    client.query('INSERT INTO locations (lat, lon, monster) VALUES($1,$2,$3)', [req.body.lat, req.body.lon, req.body.monster]);
    lat = req.body.lat;
    lon = req.body.lon;
    monster = req.body.monster;
    res.json(true);
})

var server = app.listen(port || 3000, function() {
  console.log('Listening on:', server.address().port);
});

var distance = function (lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = (lat2 - lat1) * Math.PI / 180;  // deg2rad below
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = 
     0.5 - Math.cos(dLat)/2 + 
     Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
     (1 - Math.cos(dLon))/2;

  return R * 2 * Math.asin(Math.sqrt(a));
  }
