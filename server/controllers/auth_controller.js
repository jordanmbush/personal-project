const axios = require('axios');

module.exports = {
  connect: (req, res) => {
    const authorizationCode = req.query.code;
    console.log('/auth/callback endpoint hit! heres the code we received: ', authorizationCode);
    
    axios.post(`https://${process.env.REACT_APP_AUTH_DOMAIN}/oauth/token`, {
      client_id: process.env.REACT_APP_AUTH_CLIENT_ID,
      client_secret: process.env.AUTH_CLIENT_SECRET,
      code: authorizationCode,
      grant_type: 'authorization_code',
      redirect_uri: `http://${req.headers.host}/auth/callback`
    }).then( accessToken => {
      return axios.get(`https://${process.env.REACT_APP_AUTH_DOMAIN}/userinfo/?access_token=${accessToken.data.access_token}`).then( userInfo => {
        console.log('auth_controller.connect - received userInfo from auth0: ', userInfo.data);
        const { sub, name, email } = userInfo.data;
        let names = name.split(' ');
        let firstName = '';
        let lastName = '';

        // SPLIT OUT THE FIRST AND LAST NAME. WE ARE NOT STORING MIDDLE NAMES OR MULTPLE LAST NAMES
        switch(names.length) {
          case 0: break;
          case 1:
            firstName = names[0];
            break;
          case 2:
            firstName = names[0];
            lastName = names[1];
            break;
          default:
            firstName = names[0];
            lastName = names[names.length -1];
            break;
        }
        const auth0User = {
            user_id: sub,
            firstName,
            lastName,
            email,
        }
        const db = req.app.get('db');
        // SEARCH FOR THE AUTH0 USER IN OUR DATABASE - ALWAYS RETURN DB RESULTS, AND NEVER AUTH0 RECEIVED USER(FOR CONSISTENCY PURPOSES)
        db.get_user_by_user_id(sub).then( users => {
          // IF USER EXISTS, RETURN THE USER INFO WE HAVE IN OUR DB
          if(users.length) {
            req.session.user = users[0];
            res.redirect('/dashboard');
          } else {
            // OTHERWIESE CREATE A NEW USER IN THE DB, AND RETURN THAT USER
            return db.create_user([sub, firstName, lastName, email]).then( user => {
              req.session.user = user[0];
              res.redirect('/dashboard');
            }).catch( err => console.log('auth_controller.connect - create user err'));
          }
        }).catch( err => console.log('auth_controller.connect - get user from database err: ', err));
      }).catch( err => console.log('auth_controller.connect - get user info err: ', err));
    }).catch( err => console.log('auth_controller.connect - token sent err: ', err));
  }
}