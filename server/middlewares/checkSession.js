module.exports = function(req, res, next) {
  console.log('checkSession HIT - SESSION: ', req.session);
  const user = req.session.user;
  if (!user) {
      res.status(404).json( {message: 'Unauthorized' });
  } else {
      // console.log(request.)
      next();
  }
}