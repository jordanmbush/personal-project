import React, { Component } from 'react';
import axios from 'axios';
import DateFunctions from './../helpers/DateFunctions';

export default class AddTransactionsView extends Component {
  constructor() {
    super();
    this.state = {
      bills: [],
      transactions: [],
      selectedYear: (new Date).getFullYear(),
      selectedMonth: (new Date).getMonth() + 1,
      isMonthInitialized: false,
    }
    this.getTransactions = this.getTransactions.bind(this);
    this.nextMonth = this.nextMonth.bind(this);
    this.previousMonth = this.previousMonth.bind(this);
  }

  componentDidMount() {
    this.getTransactions();
  }

  getTransactions() {
    axios.get(`/api/transactions/?month=${this.state.selectedMonth}&year=${this.state.selectedYear}`).then( transactions => {
      if(!transactions.data.length) {
        axios.get('/api/bills').then( bills => {
          console.log('received bills: ', bills.data);
          this.setState({
            bills: bills.data,
          })
        }).catch( err => console.log('addtransactionsview - get bills err: ', err));
      } else {
        console.log('received transactions: ', transactions);
        this.setState({
          transactions: transactions.data,
          isMonthInitialized: true,
        })
      }
    }).catch( err => console.log('addtransactionsview - get transactions err: ', err));
  }

  nextMonth() {
    let month = this.state.selectedMonth;
    let year = this.state.selectedYear;
    month++;
    if(month > 12) {
      month = 1;
      year++;
    }
    this.setState({
      selectedMonth: month,
      selectedYear: year
    });
  }

  previousMonth() {
    let month = this.state.selectedMonth;
    let year = this.state.selectedYear;
    month--;
    if(month === 0) {
      month = 12;
      year--;
    }
    this.setState({
      selectedMonth: month,
      selectedYear: year
    });
  }

  populateTransactionFromBills(){
    let transactions = this.state.bills;
    
  }
  
  render() {

    
    return (
      <div className='add-transactoins'>
        AddTransactionsView
        <div>
          <button onClick={this.previousMonth}>Previous Month</button>
          <button onClick={this.nextMonth}>Next Month</button>
        </div>
      </div>
    )
  }
}