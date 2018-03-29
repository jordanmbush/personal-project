module.exports = function(req, res, next) {
	// const user = req.session.user;
	if (!req.session.admin) {
			console.log('checkSession.js - admin not found');
			res.status(401).send();
	} else {
			console.log('go to next')
			next();
	}
}