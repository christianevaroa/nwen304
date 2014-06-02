
module.exports = function(app, passport){


	app.get('/signin', function(req, res){
		res.sendfile('/view/admin-signin.html');
	});






}


function isSignedIn(req, res, next){
	if (req.isAuthenticated()){
		return next();
	}
	res.redirect('/signin');

}