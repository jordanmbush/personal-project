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
        <button onClick={this.logout}>Logout</button>
        <Link to='/dashboard'><button>Dashboard</button></Link>
      </div>
    )
  }
}