const bcrypt = require('bcrypt');
const saltRounds = 12;

module.exports = {
  login: (req, res) => {
    const db = req.app.get('db');
    const { username, password } = req.body;
    db.get_admin([username]).then(users => {
      if (users.length) {
        bcrypt.compare(password, users[0].password).then( passwordsMatch => {
          if (passwordsMatch) {
            req.session.admin = { username: users[0].user_name };
            res.send();
          } else {
            res.status(401).json({ message: 'Wrong password' })
          }
        })
      } else {
        res.status(401).json({ message: "That user is not registered" })
      }
    });
  },

  // THERE IS NO ACCESS TO THIS METHOD FROM THE FRONT END - IT WILL ONLY BE USED
  // ON AN AS NEEDED BASIS FOR INDIVIDUAL PEOPLE
  register: (req, res) => {
    const db = req.app.get('db');
    // const { username, password } = req.body;
    const dateCreated = new Date();

    bcrypt.hash(password, saltRounds).then( hashedPassword => {
      db.create_admin([username, hashedPassword, firstName, lastName, email, dateCreated]).then(() => {
        res.json({ user: req.session.user })
      }).catch(error => {
        console.log('error', error);
        res.status(500).json({ message: 'Something bad happened! '})
      });
    }).catch( err => {
      res.status(500).json( {message: 'Oh no!'});
    })
  },

  logout: (req, res) => {
    console.log('logout hit');
    req.session.destroy();
    res.send(); 
  },

  getUsersData: (req, res) => {
    const db = req.app.get('db');

    db.get_all_users().then( userInfo => {
      res.json(userInfo);
    }).catch( err => {
      console.log('getUsersData err:', err);
    })
  }
}