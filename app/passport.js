var LocalStrategy   = require('passport-local').Strategy;

module.exports = function(passport, client) {

	// LOCAL SIGN IN 
	passport.use('local-signin' , new LocalStrategy({
		usernameField: 'name',
		passwordField: 'password'
	} ,
	  function(username, password, done) {
	    // asynchronous verification, for effect...
	    process.nextTick(function () {

	      console.log("1 : " + username);
	      // Find the user by username.  If there is no user with the given
	      // username, or the password is not correct, set the user to `false` to
	      // indicate failure and set a flash message.  Otherwise, return the
	      // authenticated `user`.

	        findByUsername(username, function(err, user) {
	            if (err) { 
	            	return done(err); }
	            if (!user) {  
	            	// couldn't find user
	              return done(null, false, { message: 'User doesn\'t exist'});
	            }
	            if (user.password != password) { 
	            	console.log("WRONG PASSWORD " + password);
	            	// user found but wrong password
	              return done(null, false, { message: 'Invalid password' }); 
	            }
	            	//everything ok
	            	console.log("Successful pissword");
	              return done(null, user, { message: 'Successful password'});
	        })
	    });
	  }
	));
//*****************/
// LOCAL SIGN UP
/*******************/

	passport.use('local-signup', new LocalStrategy(
		function(username, password, done){
			console.log('local-signup');
			console.log("user "  + username);
		  process.nextTick(function() {
		  	 findByUsername(username, function(err, user) {
		  	 	console.log("findByUsername local-signup");
		  	 	if(err){
		  	 		return done(err);
		  	 	}
		  	 	if(user ){
		  	 		// User already exists
		  	 		return done(null, false, { message: 'That email is already taken.' });
		  	 	} else {
		  	 		// create new user 
		  	 		addUserIntoDatabase(username, password, function(result){
	  	 				var userId = result.rows[0].id;
	  	 					// console.log("user id = " + userId);
	  	 				findById(userId, function(err, user){
	  	 					return done(null, user ,  { message: 'Successful password'});
	  	 				});	  	 				
		  	 		});
		  	 	}
		  	 });
		  })
		}
	));

	// end sign up
    /** 
	 *	
	 **/
	passport.serializeUser(function(user, done) {
	  done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
	  findById(id, function(err, user) {
	    done(err, user);
	  });
	});

	function findById(id, fn){
	  // used to deserialize the user id.
	  var selectString = 'SELECT * FROM users WHERE id = $1'; // have to wrap user name in quotes
	  var query = client.query(selectString, [id]);

	  query.on('row', function(result) {
	       return fn(null, result);
	  });
	   query.on('error', function(error){
	  	console.log(error);
	  	return fn(null, null);
	  });
	}

	/**
	 *  does an sql select based on username
	 */
	function findByUsername(username, fn) {
	 // console.log("2: findByUsername. User =  " + username);
	  var selectString = 'SELECT * FROM users WHERE name = $1'; // have to wrap user name in quotes
	  var query = client.query(selectString, [username]);
	  
	  query.on('row', function(result) {
	    return fn(null, result);
	  });
	  query.on('error', function(error){
	  	 	console.log(error);
	  	return fn(null, null);
	  });
	  // query on doesn't work for sign in
	  query.on('end', function(result){
	  	console.log("on end findByUsername");
	  	if(result.rowCount==0){
	  		//  couldn't find the user
	  		return fn(null, null);
	  	}else{
	  		// found the user
	  		 return null;
	  	}
	  });
	}

	function addUserIntoDatabase(username, password, next){
	// var selectString
	console.log('add user to databse');
		var query = client.query('INSERT INTO users (name, password, score) VALUES($1,$2,$3) RETURNING id', [username, password, 0]); // add date later!!
		query.on('row', function(row, result) {
			// console.log("on row");
			result.addRow(row);
			// console.log(row);
		});
		query.on('end', function(result){
		 	// console.log(result);	
		 	return next(result);
	  });
	}

	function getDate(){
		var d = new Date();
	}

}  // end of export


