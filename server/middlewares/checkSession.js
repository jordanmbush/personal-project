module.exports = function(req, res, next) {
	console.log('checkSession HIT');
	// const user = req.session.user;
	console.log(req.session);
	if (!req.session.user) {
			console.log('user not found');
			res.status(401).send();
	} else {
			console.log('go to next')
			next();
	}
}