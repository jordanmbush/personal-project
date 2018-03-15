module.exports = function(req, res, next) {
	// const user = req.session.user;
	if (!req.session.user) {
			console.log('checkSession.js - user not found');
			res.status(401).send();
	} else {
			console.log('go to next')
			next();
	}
}