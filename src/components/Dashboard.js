import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from './Header';

export default class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
    }
  }

  componentDidMount() {
    axios.get(`/api/user-data`).then( users => {
      console.log('dashboard.js - received user data: ', users.data);
    }).catch( err => {
      // ADD CODE HERE
      console.log('dashboard.js - api get error: ', err);
    })
  }
  
  
  
  render() {

    return (
      <div>
        <Header />
        Dashboard Component!!
        <Link to='/create-budget'><button>Create a new Budget</button></Link>
        <Link to='/add-transactions'><button>Add / Edit Transactions</button></Link>
      </div>
    )
  }
}