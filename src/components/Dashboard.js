import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default class Dashboard extends Component {
  constructor() {
    super();
    this.state = {

    }
  }

  componentDidMount() {
    axios.get(`/api/user-data`).then( users => {
      // MAYBE LOAD TRANSACTIONS INTO STATE 
      console.log('dashboard.js - received user data: ', users.data);
    }).catch( err => {
      // ADD CODE HERE
      console.log('dashboard.js - api get error: ', err);
    })
  }
  
  render() {

    return (
      <div>
        Dashboard Component!!
        <Link to='/create-budget'>Create a new Budget</Link>
      </div>
    )
  }
}