import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {Bar, Line, Pie} from 'react-chartjs-2';
import Header from './Header';
import currency from 'currency.js';
import DateFunctions from '../helpers/DateFunctions';

const monthNames =  ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
    this.state = {
      userData: null,
      chartYear: new Date().getFullYear(),
    }

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


  getChartDataForUsersByMonth() {
    let months = monthNames.slice();
    let datasets = [];
    let chartData = {}
    if(this.state.userData) {
      console.log(months)
      for(let month = 0; month < months.length; month++) {
        for(let i = 0; i < this.state.userData.length; i++) {
          let date = new Date(this.state.userData[i].date_created);
          if(date.getFullYear === this.state.chartYear && date.getMonth === month) {
            datasets[month].data += 1;
            datasets[month].labal = months[month];
          }
        }
      }
      let chartData = {
        labels: months,
        datasets: datasets
      }
    }

    console.log(chartData)
    return chartData;
  }
  
  
  render() {
    return (
      <div className='admin-dashboard-component'>
        <Header />
        <div className='chart-container'>
          <Bar
            width={90}
            data={this.getChartDataForUsersByMonth()}
            options={{
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>
    )
  } 
}