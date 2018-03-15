import React, { Component } from'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default class Header extends Component {
  constructor() {
    super();
    this.state = {

    }
    this.logout = this.logout.bind(this);
  }

  logout() {
    axios.post('/api/logout').then( response => {
      window.location = '/';
    }).catch( err => console.log('header.js - logout err: ', err));
  }

  render() {
    return (
      <div className='header'>
        <Link to='/dashboard'><button className='dashboard-button'><i className="fas fa-tachometer-alt"></i></button></Link>
        <div><h1>Monilibrium</h1></div>
        <button className='logout-button' onClick={this.logout}><i className="fas fa-sign-out-alt"></i></button>
      </div>
    )
  }
}