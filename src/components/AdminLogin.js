import React, { Component } from'react';
import axios from 'axios';

export default class Login extends Component {
  constructor() {
    super();
    this.state = {
      username: '',
      password: '',
    }

    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.eventHandler = this.eventHandler.bind(this);
  }

  
  login() {
    axios.post(`/api/admin-login`, this.state).then( admin => {
      window.location = '/admin-dashboard';
    }).catch( err => {
      console.log('admin login err: ', err);
    });
  } 

  register() {
    axios.post(`/api/admin-register`, this.state).then( admin => {
      window.location('/admin-dashboard')
    }).catch( err => {
      console.log('admin register err: ', err);
    });
  }

  eventHandler(e) {
    this.setState({
      [e.target.name]: e.target.value,
    })
  }

  render() {
    return (
      <div className='login-component'>
        <h1>Monilibrium</h1>
        <div className='hero-panel'>
          <div className='welcome-container'>
            <h2>Administrator Login</h2>
          </div>
          <div className='login-blur-box'>
          </div>
          <div className='login-button-container'>
            <div>
              <input name='username' placeholder='username' value={this.state.username} onChange={e => this.eventHandler(e)}></input>
            </div>
            <div>
              <input type='password' name='password' placeholder='password' value={this.state.password} onChange={e => this.eventHandler(e)}></input>
            </div>
            <button onClick={this.login}>Login</button>
          </div>
        </div>
      </div>
    )
  }
}