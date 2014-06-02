
module.exports = function(app, passport){


	app.get('/signin', function(req, res){
		res.sendfile('/view/admin-signin.html');
	});

	app.post('/signin', passport.authenticate('local-signin', {session :false }),
		function(req, res) {
			console.log('user ' );

			var jsonData = { id: req.user.id, username: req.user.username };
			console.log(jsonData);
			res.send(jsonData);
	});
	
}


function isSignedIn(req, res, next){
	if (req.isAuthenticated()){
		return next();
	}
	res.redirect('/signin');

}