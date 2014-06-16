
module.exports = function(app, client, passport){

/*
 *  routes to pages
 */


 app.get('/signin', function(req, res){
 	res.sendfile('/views/admin-signin.html', {root :__dirname });
 });

 app.post('/signin', 
 	passport.authenticate('local-signin', { session: false } ),
 	function(req, res) {
		//res.setHeader("Access-Control-Allow-Origin", "*");
 		console.log('user ' );

 		var jsonData = { id: req.user.id, name: req.user.name };

		console.log(jsonData);
		res.json(jsonData);
	});

	app.get('/testsignin', passport.authenticate('local-signin', { session: false}),
		function(req, res){
			//res.setHeader("Access-Control-Allow-Origin", "*");
			var jsonData = { "name" : "mr bojangles"};
			res.json(jsonData);
	});
	

	// app.post('/signin', 
	// 	passport.authenticate('local-signin', {successRedirect: '/', failureRedirect: '/signin', failureFlash: true}),
	// 		function(req, res){
	// 			res.sendfile('/views/index.html', { message: req.flash('error') });

	// });


app.get('/mytestfunction', function(req, res){
	client.query('SELECT * FROM users', function(err, result){
		res.send(result);
	});
});

app.get('/', function(req, res) {
	res.sendfile('/views/index.html', {root :__dirname });
});

app.get('/admin', function(req, res){
	res.sendfile('/views/admin-signin.html', {root :__dirname });
});

app.get('/addmonster', function(req, res){

	res.sendfile('/views/monsterupload.html', {root: __dirname });

});

app.get('/numberofrows', function(req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	client.query('SELECT * FROM monsters', function(err, result) {
	    // res.send('number of rows: '+result.rows.length);
	    var jsonval = { numberofrows: result.rows.length };
	    res.json( jsonval );
	});
});

	/*
	 * Get monster at exact given location (kind of useless to be honest)
	 */
	 app.get('/location/:lat/:lon', function(req,res) {
	 	res.setHeader("Access-Control-Allow-Origin", "*");
	 	client.query('SELECT * FROM monsters WHERE lat='+req.params.lat+' AND lon='+req.params.lon, function(err, result) {
	 		res.send(result.rows);
	 	});
	 });

	/*
	 * Get a list of all the monsters in the database
	 */
	 app.get('/monsterlist', function(req, res) {
	 	client.query('SELECT * FROM monsters', function(err, result){
	 		res.send(result.rows);
	 	});
	 });

	 app.get('/map', function(req, res) {
	 	res.sendfile('/views/map.html', {root: __dirname });
	 });

	/*
	 * Client sends current latitude and longitude, server returns list of 5 nearest locations
	 */
	 app.get('/nearest/:mylat/:mylon', function(req, res) {
	 	res.setHeader("Access-Control-Allow-Origin", "*");
	 	client.query('SELECT * FROM monsters ORDER BY (ABS(lat - '+req.params.mylat+') + ABS(lon - '+req.params.mylon+')) LIMIT 5', function(err, result) {
	 		res.send(result.rows);
	 	});
	 });

	/*
	 * Client sends their id and current location, server decides if client is close enough to a location.
	 * If client is close enough, send the monster to the client. Otherwise send error message.
	 */
	 app.get('/getmonster/:uid/:mylat/:mylon', function(req, res) {
	 	res.setHeader("Access-Control-Allow-Origin", "*");
	 	client.query('SELECT * FROM monsters ORDER BY (ABS(lat - '+req.params.mylat+') + ABS(lon - '+req.params.mylon+')) LIMIT 1', function(err, result) {
	    //calculate distance in km from user's location to nearest location in table
	    var dist = distance(+req.params.mylat, +req.params.mylon, +result.rows[0].lat, +result.rows[0].lon);

	    if(dist < 0.001) {
	      // Check if user has monster already and then decide what to do
	      client.query('SELECT * FROM monsterdex WHERE userid = '+req.params.uid+' AND monsterid = '+result.rows[0].monsterid, function(err2, result2) {
	      	// User doesn't already have the monster, add it to their list
	      	if(result2.rows.length == 0) {
	      		client.query('INSERT INTO monsterdex (userid, monsterid) VALUES ($1,$2)', [req.params.uid, result.rows[0].monsterid]);
	      	}
	      	// Send the monster to the user
	      	res.send(result.rows[0]);
	      });
	  }
	  else {
	  	res.send("fail lol");
	  }
	});

	 });

	/*
	 * Get list of monsters the user has caught
	 */
	 app.get('/mymonsters/:uid', function(req, res) {
	 	res.setHeader("Access-Control-Allow-Origin", "*");
	 	client.query('SELECT * FROM monsterdex WHERE userid = '+req.params.uid, function(err, result) {
	 		res.send(result.rows);
	 	});
	 });

	 /*
	  * Get a monster by it's id
	  */
	  app.get('/getmonsterbyid/:id', function(req, res) {
	  	res.setHeader("Access-Control-Allow-Origin", "*");
	  	client.query('SELECT * FROM monsters WHERE monsterid = '+req.params.id, function(err, result) {
	  		res.send(result.rows);
	  	});
	  });

	 /*
	  * Get a list of user's monsters
	  */
	  app.get('/getallmymonsters/:uid', function(req, res) {
	  	res.setHeader("Access-Control-Allow-Origin", "*");
	  	client.query('SELECT * FROM monsterdex WHERE userid = '+req.params.uid, function(err, result) {
	 		// really nasty method to put all the monster ids into a format that SQL can read
	 		var values = convertToSQL(result);
	 		client.query('SELECT * FROM monsters WHERE monsterid in '+values, function(err2, result2) {
	 			res.send(result2.rows);
	 		});
	 	});
	  });

	  app.get('/getbill/', function(req, res) {
	  	res.setHeader("Access-Control-Allow-Origin", "*");
	  	res.send('<img src="https://s3-ap-southeast-2.amazonaws.com/nwen304-assets/billclinton.jpg">');
	  });

	/*
	 * Post a new location
	 * Requires latitude, longitude and monster name
	 */
	 app.post('/location', function(req,res) {
	 	if(!req.body.hasOwnProperty('lat') || 
	 		!req.body.hasOwnProperty('lon') ||
	 		!req.body.hasOwnProperty('name') ||
	 		!req.body.hasOwnProperty('description') ||
	 		!req.body.hasOwnProperty('picture')){
	 		res.statusCode = 400;
	 	return res.send('Error 400: Post syntax incorrect.'); 
	 }
	 client.query('INSERT INTO monsters (lat, lon, name, description, picture) VALUES($1,$2,$3,$4,$5)', [req.body.lat, req.body.lon, req.body.name, req.body.description, req.body.picture]);
	 lat = req.body.lat;
	 lon = req.body.lon;
	 monster = req.body.monster;
	 res.json(true);
	});

	/*
	 * Create a new user with a generated userid and send it back
	 */
	 app.post('/createuser/:username', function(req,res) {
	 	client.query('SELECT * FROM users ORDER BY userid LIMIT 1', function(err, result) {
	 		var newid = +result.rows[0].userid + 1;
	 		client.query('INSERT INTO users (userid, name, score, joindate) VALUES($1,$2,$3,$4)', [newid, res.body.username, 0, new Date()]);
	 		client.query('SELECT * FROM users WHERE userid = '+newid, function(err2, result2) {
	 			res.send(result2.rows[0]);
	 		});
	 	});
	 });
	}

// private functions, functions for money



/*
 * Work out distance in kilometres between 2 latitude/longitude locations 
 */
 var distance = function (lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = 
  0.5 - Math.cos(dLat)/2 + 
  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
  (1 - Math.cos(dLon))/2;

  return R * 2 * Math.asin(Math.sqrt(a));
}


function isSignedIn(req, res, next) {
	if(req.isAuthenticated()){
		return next(); 
	}
	res.redirect('/signin');
}

function convertToSQL(list) {
	var values ='(';
		for(var i = 0; i < list.rows.length; i++){
			values+=list.rows[i].monsterid;
			if(i+1 == list.rows.length){
				values+=')';
			} else {
				values+=',';
			}
		}
		console.log(values);
	return values;
}



// SQL stuff:
// TABLE monsterdex: userid (user's id), monsterid (id of a monster owned by that user)
// TABLE friends: userid (user's id), friendid (id of another user that userid has added as a friend)
// TABLE users: userid (user's id - assigned when signing up), name (username, 30 characters), score (total score from monsters collected), joindate (might not use this)
// TABLE monsters: monsterid (monster's id - serial assigned on add), lat (latitude), lon (longitude), name (name, 20 characters), description (text description), picture (url of monster's picture)    ::  Need to add score?
// 02/06 created new users table

// CREATE TABLE users (id SERIAL, name varchar(30), password varchar(40), score integer, joindate DATE );

// INSERT INTO users (name, score, password, joindate) VALUES('admin', 69, 'admin', current_date);



// INSERT INTO users (name, score, password, joindate) VALUES('user', 69, 'user', current_date);


// curl functions 

// AUthenticate user & password GET request
// curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET -d '{ "name": "user", "password":"user"}' http://pure-gorge-4988.herokuapp.com/testsignin


// authenticate user & password  with POST request
// curl -v  "Accept:application/json" -H "Content-type:application/json" -X POST -d '{ "name": "admin", "password":"admin"}' http://pure-gorge-4988.herokuapp.com/signin
