import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from './Header';
import currency from 'currency.js';
import DateFunctions from '../helpers/DateFunctions';

Date.prototype.isSameDateAs = function(pDate) {
  return (
    this.getFullYear() === pDate.getFullYear() &&
    this.getMonth() === pDate.getMonth() &&
    this.getDate() === pDate.getDate()
  );
}

export default class AdminDashboard extends Component {
  constructor() {
    super();
    this.state = {}

  }

  componentDidMount() {
    axios.get('/api/admin-data').then( (userData) => {
      this.setState({
        userData: userData.data
      });
    }).catch( err => {
      console.log('get userData err: ', err);
      alert('You must be logged in as admin to view this page!');
      window.location = '/';
    })
  }
  
  render() {
    return (
      <div className='admin-dashboard-component'>
        <Header />
      </div>
    )
  } 
}