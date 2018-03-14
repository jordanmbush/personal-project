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


  render() {
    return (
      <div className='login-component'>
        <h1>Monilibrium</h1>
        <div className='login-button-container'>
          <div className='login-into'><p>Let's do this! Not a member? Psst. No problem. Login with one of many major online platforms.</p></div>
          <button onClick={this.login}>Login / Register</button>
        </div>
        <div id='panel-1' className='panel'>
          <h2>50% of Americans have less than one month's income saved!</h2>
          <div className='panel-content'>
            <img src='http://ak3.picdn.net/shutterstock/videos/9802973/thumb/1.jpg' alt='Savings Jar with a few coins'></img>
            <p>Top personal finance advisors will tell you - and especially drawing from lessons in the economic crisis to have at least six months income saved, just in case.</p>
          </div>
          <aside><a href='http://www.businessinsider.com/a-dozen-shocking-personal-finance-statistics-2011-5'>www.businessinsider.com</a></aside>
        </div>
        <div id='panel-2' className='panel'>
          <div>
          </div>
        </div>
        <div id='panel-3' className='panel'>
          <div>
          </div>
        </div>
        <div id='panel-4' className='panel'>
          <div>
          </div>
        </div>
      </div>
    )
  }
}