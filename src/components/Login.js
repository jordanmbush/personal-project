import React, { Component } from'react';
import axios from 'axios';

export default class Login extends Component {
  constructor() {
    super();
    this.state = {

    }
    this.login = this.login.bind(this);
  }

  componentDidMount() {
    axios.get(`/api/user-data`).then( users => {
      console.log('dashboard.js - received user data: ', users.data);
      window.location = '/dashboard';
    }).catch( err => {
      // ADD CODE HERE
      console.log('dashboard.js - api get error: ', err);
    })
  }
  
  login() {
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
    const scope = encodeURIComponent('openid profile email');
    const link = `https://${process.env.REACT_APP_AUTH_DOMAIN}/login?client=${process.env.REACT_APP_AUTH_CLIENT_ID}&scope=${scope}&redirect_uri=${redirectUri}`
    console.log('Login.js link: ', link);
    window.location = link;
  }

  logout() {
    axios.post('/api/logout').then( response => {

    }).then( err => console.log('login.js - logout err: ', err));
  }

  render() {
    return (
      <div className='login'>
        <button onClick={this.login}>Login / Register</button>
        <button onClick={this.logout}>Logout</button>
      </div>
    )
  }
}