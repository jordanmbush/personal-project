import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from './Header';
import currency from 'currency.js';
import {Bar, Line, Pie} from 'react-chartjs-2';
import { getTransactionsFromDB, getEOWTransactionsFromTemplate, getMonthlyTransactionsFromTemplate, getTemplateTransactions, getWeeklyTransactionsFromTemplate, getXDAYSTransactionsFromTemplate, initializeTransactions } from '../helpers/DataFunctions';
import categories from '../helpers/categories';
import _ from 'lodash';
import DateFunctions from '../helpers/DateFunctions';

const monthNames =  ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
Date.prototype.isSameDateAs = function(pDate) {
  return (
    this.getFullYear() === pDate.getFullYear() &&
    this.getMonth() === pDate.getMonth() &&
    this.getDate() === pDate.getDate()
  );
}

export default class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      transactions: [],
      selectedYear: (new Date).getFullYear(),
      selectedMonth: (new Date).getMonth(),
      category: '',
      subCategory: '',
      filteredTransactions: [],
      chartData: {
        labels: monthNames,
        datasets: [
          {
          label: 'Transactions',
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: [0, 10, 5, 2, 20, 30, 45],
          },
        ]
      },
      numNextBills: 5
    }

    this.getTrans = getTransactionsFromDB.bind(this);
    this.putTransactionsInState = initializeTransactions.bind(this);
    this.getTemplateTrans = getTemplateTransactions.bind(this);
    this.getCategories = this.getCategories.bind(this);
    this.getSubCategories = this.getSubCategories.bind(this);
    this.eventHandler = this.eventHandler.bind(this);
    this.getChartData = this.getChartData.bind(this);
    this.showNextXBills = this.showNextXBills.bind(this);
  }
  
  componentDidMount() {
    this.getTrans();
  }

  eventHandler(e) {
    let prop = e.target.id;
    let val = e.target.value;

    this.setState({
      [prop]: val
    })
  }

  getChartData() {
    let months = monthNames.slice();
    let labels = months.splice(0, parseInt(this.state.selectedMonth) + 1);

    let expenseData = [];
    let incomeData = [];

    if(this.state.fullTransactionSet) {
      for(let i = 0; i < this.state.selectedMonth + 1; i++ ) {
        let fullTransactionSet = this.state.fullTransactionSet.slice();
        let monthData = fullTransactionSet.filter( transaction => {
          return transaction.day.getMonth() === i;
        })
        
        let incomeAmt = 0;
        let expenseAmt = 0;
        if(monthData.length) {
          let monthTotal = monthData.map( transaction => {
            transaction.transactionType === 'income' ? incomeAmt += Math.abs(transaction.amount) : expenseAmt += Math.abs(transaction.amount);
            return transaction;
          })
        }
        incomeData.push(currency(incomeAmt).value);
        expenseData.push(currency(expenseAmt).value);
      }
    }
    let chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Income',
          backgroundColor: '#2AD705',
          borderColor: '#2AD705',
          data: incomeData,
        },
        {
          label: 'Expenses',
          backgroundColor: '#FFF400',
          borderColor: '#FFF400',
          data: expenseData,
        }
      ]
    }

    return chartData;
  }
  
  setSelectedMonth(e) {
    this.setState({
      selectedMonth: e.target.value
    }, () => this.putTransactionsInState());
  }
  
  getCategories() {
    let categoriesJSX = _.keys(categories);
    categoriesJSX = categoriesJSX.map( key => {
      return (
        <option>{key}</option>
      )
    })
    return categoriesJSX;
  }
  getSubCategories() {
    let subCategories = categories[this.state.category];
    let subCategoriesJSX = []
    if(subCategories) {
      subCategoriesJSX = subCategories.map( subCat => {
        return (
          <option>{subCat}</option>
        )
      })
    }
    return subCategoriesJSX;
  }

  getTodaysBalance() {
    let balance = 'Loading...';
    let today = new Date();
    if(this.state.fullTransactionSet) {
      // I REVERSE THE ARRAY SINCE findIndex WILL FIND THE FIRST TRANSACTION FOR THE DAY THAT IT IS LOOKING FOR.
      // SINCE TRANSACTIONS ARE LISTED CHRONOLOGICALLY, EVEN WITHIN DAYS, REVERSING WILL MAKE THE FIRST DAY THAT
      // IS FOUND BE THE LAST TRANSACTION FOR THAT DAY, AND THEREFORE THE ENDING BALANCE FOR THAT DAY.
      let reversedTransactionSet = this.state.fullTransactionSet.slice().reverse();
      let index = reversedTransactionSet.findIndex(transaction => transaction.day <= today);
      if(index !== -1) {
        if(reversedTransactionSet[index].day.isSameDateAs(today)){
          balance = reversedTransactionSet[index].balance;
        } else {
          balance = currency(reversedTransactionSet[index - 1].balance).format(true);
        }
      }
      balance = balance ? balance : this.state.balanceInfo.amount;
    }
    return balance;
  }
  showNextXBills() {
    let x = this.state.numNextBills;
    let today = new Date();
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate()); //GET TODAY WITH NO TIME
    let bills = [];
    if(this.state.fullTransactionSet) {
      let fullTransactionSet = this.state.fullTransactionSet.slice();
      fullTransactionSet = fullTransactionSet.filter(transaction => {
        return(
          transaction.transactionType === 'expense' &&
          transaction.day >= today
        )
      })
      bills = fullTransactionSet.splice(0, x);
      bills = bills.map( (transaction, i) => {
        return (
          <div className={`row ${i % 2 === 0 ? 'even-row' : 'odd-row'}`}>
            <div className='name' >-{transaction.name}</div>
            <div className='amount' >{currency(transaction.amount).format(true)}</div>
            <div className='date' >{DateFunctions.simpleDateFormat(transaction.day)}</div>
          </div>
        )
      })
    }
    return bills
  }

  getBudgetStatus() {
    let today = new Date();
    let status = 'Good';
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate()); //GET TODAY WITH NO TIME
    let bills = [];
    if(this.state.fullTransactionSet) {
      let fullTransactionSet = this.state.fullTransactionSet.slice();
      fullTransactionSet = fullTransactionSet.filter(transaction => {
        return(
          transaction.transactionType === 'expense' &&
          transaction.day >= today
        )
      })
      for(let i = 0; i < fullTransactionSet.length; i++) {
        if(fullTransactionSet[i].balance < 0){
          status = 'Bad'
          break;
        } 
      }
    }

    return status;
  }
  
  render() {
    let budgetStatus = this.getBudgetStatus();
    let currentBalance = currency(this.getTodaysBalance()).format(true);
    return (
      <div className='dashboard-component'>
        <Header />
        <div className='nav-buttons-container'>
          <Link to='/create-budget'><button className='edit-budget-button'>Edit My Budget</button></Link>
          <Link to='/add-transactions'><button className='add-transactions-button'>Add / Edit Transactions</button></Link>
        </div>
        <div className='current-financial-summary' >
          <div className='balance-container'>
            <label htmlFor='balance' >Today's Balance: </label>
            <span id='balance' className='balance'>{currentBalance}</span>
          </div>
          <div className='upcoming-bills-container'>
            <label className='upcoming-bill-title'>Upcoming Bills...</label>
            <div className='upcoming-bills-header'>
              <div className='name' >Name</div>
              <div className='amount' >Amount</div>
              <div className='date' >Date</div>
            </div>
            {this.showNextXBills()}
          </div>
          <div className='financial-status-container'>
            <label htmlFor='status' >Budget Status: </label>
            <span id='status' className={`${budgetStatus === 'Bad' ? 'status-bad' : 'status-good'} status`}>{budgetStatus}</span>
          </div>
          <div className='balance'></div>
          <div className='balance'></div>
        </div>
        <div className='chart-criteria-container'>
          <select onChange={ e => this.setSelectedMonth(e)} className='chart-month'>
            <option selected={this.state.selectedMonth === 0} value={0}>January</option>
            <option selected={this.state.selectedMonth === 1} value={1}>February</option>
            <option selected={this.state.selectedMonth === 2} value={2}>March</option>
            <option selected={this.state.selectedMonth === 3} value={3}>April</option>
            <option selected={this.state.selectedMonth === 4} value={4}>May</option>
            <option selected={this.state.selectedMonth === 5} value={5}>June</option>
            <option selected={this.state.selectedMonth === 6} value={6}>July</option>
            <option selected={this.state.selectedMonth === 7} value={7}>August</option>
            <option selected={this.state.selectedMonth === 8} value={8}>Septempber</option>
            <option selected={this.state.selectedMonth === 9} value={9}>October</option>
            <option selected={this.state.selectedMonth === 10} value={10}>November</option>
            <option selected={this.state.selectedMonth === 11} value={11}>December</option>
          </select>
          <div>
            <label>Filter:</label>
            <select id='category' className='create-budget-field category category-select' value={this.state.category} onChange={ e => this.eventHandler(e)}>
              <option selected> -- select a category -- </option>
              {this.getCategories()}
            </select>
            <select id='subCategory' className='create-budget-field category sub-category-select' value={this.state.subCategory} onChange={ e => this.eventHandler(e)}>
              <option selected> -- select subcategory -- </option>
              {this.getSubCategories()}
            </select>
          </div>
        </div>
        <div className='chart-container'>
          <Bar
            width={90}
            data={this.getChartData()}
            options={{
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>
    )
  }
}