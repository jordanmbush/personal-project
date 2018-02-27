import React, { Component } from'react';


export default class Login extends Component {
  constructor() {
    super();
    this.state = {

    }
    this.login = this.login.bind(this);
  }

  login() {
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
    const scope = encodeURIComponent('openid profile email');
    const link = `https://${process.env.REACT_APP_AUTH_DOMAIN}/login?client=${process.env.REACT_APP_AUTH_CLIENT_ID}&scope=${scope}&redirect_uri=${redirectUri}`
    console.log('Login.js link: ', link);
    window.location = link;
  }

  render() {
    return (
      <div className='login'>
        <button onClick={this.login}>Login / Register</button>
      </div>
    )
  }
}