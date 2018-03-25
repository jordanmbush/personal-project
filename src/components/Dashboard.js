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

const colors = ['#0973B3','#2AD705','#FF8E00','#ED003B','#00BA78','#5AE500','#C44464','#1E18BF','#FFC200','#CA0092','#B6F400']
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
      selectedMonth: 0,
      fromMonth: 0,
      throughMonth: (new Date).getMonth(),
      category: '--filter category--',
      subCategory: '--filter subcategory--',
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
    this.getChartDataByCategory = this.getChartDataByCategory.bind(this);
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
    let labels = months.splice(this.state.fromMonth, this.state.throughMonth - this.state.fromMonth + 1);

    let expenseData = [];
    let incomeData = [];

    if(this.state.fullTransactionSet) {
      for(let i = this.state.fromMonth; i <= this.state.throughMonth; i++ ) {
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
  
  getChartDataByCategory() {
    let months = monthNames.slice();
    let labels = months.splice(this.state.fromMonth, this.state.throughMonth - this.state.fromMonth + 1);

    let expenseData = [];
    let datasets = [];
    if(this.state.fullTransactionSet) {
      let allMonths = this.state.fullTransactionSet.slice();
      allMonths = allMonths.filter( transaction => {
        let monthNum = transaction.day.getMonth();
        let year = transaction.day.getFullYear();
        return monthNum >= this.state.fromMonth && monthNum <= this.state.throughMonth && year === this.state.selectedYear && transaction.category;
      });
      
      let uniqueCategories = [];
      let catType = '';
      // IF A CATEGORY HAS BEEN CHOSEN
      if(this.state.category !== '--filter category--') {
        let usedSubCategories = allMonths.map(transaction => {
          if(transaction.category === this.state.category) {
            return transaction.subCategory;
          }
        });
        // GET A UNIQUE LIST OF ALL SUBCATEGORIES
        let objSubCategories = new Set( usedSubCategories );
        uniqueCategories = Array.from(objSubCategories);
        catType = 'subCategory';
      // SHOW CHART DATA BY CATEGORY INSTEAD OF SUBCATEGORIES
      } else {
        let usedCategories = allMonths.map(transaction => transaction.category);
        let objCategories = new Set( usedCategories );
        uniqueCategories = Array.from(objCategories);
        catType = 'category';
      }

      // FOR EACH CATEGORY/SUBCATEGORY - CREATE A DATASET
      for(let i = 0; i < uniqueCategories.length; i++) {
        datasets.push({
          label: uniqueCategories[i],
          data: [],
          backgroundColor: colors[i],
        })
        // FOR EACH DATASET - ENTER 0 FOR EVERY MONTH. IF THERE ARE NO TRANSACTIONS FOR THAT MONTH
        // THE CHART WILL SHOW 0
        for(let j = 0; j <= this.state.fromMonth; j++) {
          datasets[i].data.push(0);
        }
      }
      
      // ADD TRANSACTION DATA TO DATASETS
      for(let i = this.state.fromMonth; i <= this.state.throughMonth; i++) {
        let fullTransactionSet = this.state.fullTransactionSet.slice();
        let monthTransactions = fullTransactionSet.filter( transaction => transaction.day.getMonth() === i && transaction.day.getFullYear() === this.state.selectedYear && transaction.category);
        monthTransactions.map( transaction => {
          let index = datasets.findIndex(dataset => dataset.label === transaction[catType]);
          if(index !== -1) {
            datasets[index].data[i] = currency(datasets[index].data[i]).add(Math.abs(transaction.amount)).value;
          }
        })
      }
      let chartData = {
        labels: labels,
        datasets
      }
      return chartData;
    }
  }
  
  setSelectedMonth(e, monthType) {

    this.setState({
      [monthType]: parseInt(e.target.value),
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
    let balance = null;
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
          // balance = currency(0).format(true);
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
          <div className='chart-criteria-dropdown-container'>
            <span>From</span>
            <select onChange={ e => this.setSelectedMonth(e, 'fromMonth')} className='chart-month'>
              <option selected={this.state.fromMonth === 0} value={0}>January</option>
              <option selected={this.state.fromMonth === 1} value={1}>February</option>
              <option selected={this.state.fromMonth === 2} value={2}>March</option>
              <option selected={this.state.fromMonth === 3} value={3}>April</option>
              <option selected={this.state.fromMonth === 4} value={4}>May</option>
              <option selected={this.state.fromMonth === 5} value={5}>June</option>
              <option selected={this.state.fromMonth === 6} value={6}>July</option>
              <option selected={this.state.fromMonth === 7} value={7}>August</option>
              <option selected={this.state.fromMonth === 8} value={8}>September</option>
              <option selected={this.state.fromMonth === 9} value={9}>October</option>
              <option selected={this.state.fromMonth === 10} value={10}>November</option>
              <option selected={this.state.fromMonth === 11} value={11}>December</option>
            </select>
          </div>
          <div className='chart-criteria-dropdown-container'>
            <span>Through</span>
            <select onChange={ e => this.setSelectedMonth(e, 'throughMonth')} className='chart-month'>
              <option selected={this.state.throughMonth === 0} value={0}>January</option>
              <option selected={this.state.throughMonth === 1} value={1}>February</option>
              <option selected={this.state.throughMonth === 2} value={2}>March</option>
              <option selected={this.state.throughMonth === 3} value={3}>April</option>
              <option selected={this.state.throughMonth === 4} value={4}>May</option>
              <option selected={this.state.throughMonth === 5} value={5}>June</option>
              <option selected={this.state.throughMonth === 6} value={6}>July</option>
              <option selected={this.state.throughMonth === 7} value={7}>August</option>
              <option selected={this.state.throughMonth === 8} value={8}>September</option>
              <option selected={this.state.throughMonth === 9} value={9}>October</option>
              <option selected={this.state.throughMonth === 10} value={10}>November</option>
              <option selected={this.state.throughMonth === 11} value={11}>December</option>
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
        <div className='chart-criteria-container'>
          <div className='chart-criteria-dropdown-container'>
            <select id='category' className='create-budget-field category category-select' value={this.state.category} onChange={ e => this.eventHandler(e)}>
              <option selected>--filter category--</option>
              {this.getCategories()}
            </select>
          </div>
        </div>
        <div className='chart-container'>
          <Bar
            width={90}
            data={this.getChartDataByCategory()}
            options={{
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>
    )
  }
}