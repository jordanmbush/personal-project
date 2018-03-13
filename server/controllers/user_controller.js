module.exports = {
  getUser: (req, res) => {
    const { user_id } = req.session.user;
    console.log('session: ', req.session.user);
    const db = req.app.get('db');
    db.get_user_by_user_id(user_id).then( users => {
      if(users.length) {
        res.json(users[0])
      } else {
        res.status(403).send({message: 'User not found in db!'});
      }
    }).catch( err => console.log('user_controller.js - get user err: ', err));
  },
  logout: (req, res) => {
    console.log('logout hit');
    req.session.destroy();
    res.send(); 
  },
}