import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from './Header';
import currency from 'currency.js';
import {Bar, Line, Pie} from 'react-chartjs-2';
import { getTransactionsFromDB, getEOWTransactionsFromTemplate, getMonthlyTransactionsFromTemplate, getTemplateTransactions, getWeeklyTransactionsFromTemplate, getXDAYSTransactionsFromTemplate, initializeTransactions } from '../helpers/DataFunctions';
import categories from '../helpers/categories';
import _ from 'lodash';

const monthNames =  ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
      }
    }

    this.getTrans = getTransactionsFromDB.bind(this);
    this.putTransactionsInState = initializeTransactions.bind(this);
    this.getTemplateTrans = getTemplateTransactions.bind(this);
    this.getCategories = this.getCategories.bind(this);
    this.getSubCategories = this.getSubCategories.bind(this);
    this.eventHandler = this.eventHandler.bind(this);
    this.getChartData = this.getChartData.bind(this);
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
        if(monthData.length) {
          let incomeAmt = 0;
          let expenseAmt = 0;
          let monthTotal = monthData.map( transaction => {
            transaction.transactionType === 'income' ? incomeAmt += Math.abs(transaction.amount) : expenseAmt += Math.abs(transaction.amount);
            return transaction;
          })
          incomeData.push(incomeAmt);
          expenseData.push(expenseAmt);
        }
      }
    }
    let chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Income',
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: incomeData,
        },
        {
          label: 'Expenses',
          backgroundColor: 'rgb(10, 99, 132)',
          borderColor: 'rgb(10, 99, 132)',
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

  render() {
    return (
      <div className='dashboard-component'>
        <Header />
        Dashboard Component!!
        <Link to='/create-budget'><button>Create a new Budget</button></Link>
        <Link to='/add-transactions'><button>Add / Edit Transactions</button></Link>
        <div className=''>
          <select onChange={ e => this.setSelectedMonth(e)} className='chart-month'>
            <option value={0}>January</option>
            <option value={1}>February</option>
            <option value={2}>March</option>
            <option value={3}>April</option>
            <option value={4}>May</option>
            <option value={5}>June</option>
            <option value={6}>July</option>
            <option value={7}>August</option>
            <option value={8}>Septempber</option>
            <option value={9}>October</option>
            <option value={10}>November</option>
            <option value={11}>December</option>
          </select>
          <div>
            <label>Category</label>
            <select id='category' className='create-budget-field category category-select' value={this.state.category} onChange={ e => this.eventHandler(e)}>
              <option selected> -- select an option -- </option>
              {this.getCategories()}
            </select>
            <select id='subCategory' className='create-budget-field category sub-category-select' value={this.state.subCategory} onChange={ e => this.eventHandler(e)}>
              <option selected> -- select an option -- </option>
              {this.getSubCategories()}
            </select>
          </div>
        </div>
        <div className='chart-container'>
          <Bar
            width={90}
            data={this.getChartData()}
            options={{
              maintainAspectRatio: false
            }}
          />
        </div>
      </div>
    )
  }
}