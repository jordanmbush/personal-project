import React, { Component } from 'react';
import axios from 'axios';
import DateFunctions from './../helpers/DateFunctions';
import Header from './Header';

const DAY = 'DAY';
const WEEK = 'WEEK';
const MONTH = 'MONTH';
const YEAR = 'YEAR';
const EOW = 'EOW';
const XDAYS = 'XDAYS';

Date.prototype.isSameDateAs = function(pDate) {
  return (
    this.getFullYear() === pDate.getFullYear() &&
    this.getMonth() === pDate.getMonth() &&
    this.getDate() === pDate.getDate()
  );
}

export default class AddTransactionsView extends Component {
  constructor() {
    super();
    this.state = {
      bills: [],
      incomeSources: [],
      transactions: [],
      fullTransactionSet: [],
      selectedYear: (new Date).getFullYear(),
      selectedMonth: (new Date).getMonth(),
      isMonthInitialized: false,
      balanceInfo: {},
    }
    this.getTransactionsFromDB = this.getTransactionsFromDB.bind(this);
    this.nextMonth = this.nextMonth.bind(this);
    this.previousMonth = this.previousMonth.bind(this);
    this.populateTransactionsByMonth = this.populateTransactionsByMonth.bind(this);
    this.getWeeklyTransactionsFromTemplate = this.getWeeklyTransactionsFromTemplate.bind(this);
    this.getMonthlyTransactionsFromTemplate = this.getMonthlyTransactionsFromTemplate.bind(this);
    this.getEOWTransactionsFromTemplate = this.getEOWTransactionsFromTemplate.bind(this);
    this.getTemplateTransactions = this.getTemplateTransactions.bind(this);
    this.initializeTransactions = this.initializeTransactions.bind(this);
  }

  componentDidMount() {
    this.getTransactionsFromDB();
  }

  getTransactionsFromDB() {
    // PULL IN TEMPLATE BILLS AND ALL ACTUAL TRANSACTIONS
    axios.get('/api/balance').then( balanceInfo => {
      axios.get(`/api/transactions`).then( transactions => {
        axios.get('/api/bills').then( bills => {
          axios.get('/api/income').then( incomeSources => {
            let parsedBills = bills.data.map( bill => {
              bill.amount = parseFloat(bill.amount);
              return bill;
            })
            let parsedIncome = incomeSources.data.map( income => {
              income.amount = parseFloat(income.amount);
              return income;
            })
            this.setState({
              bills: parsedBills,
              incomeSources: parsedIncome,
              transactions: transactions.data,
              balanceInfo: balanceInfo.data,
            })
            this.initializeTransactions();
          }).catch( err => console.log('addtransactionsview - get income err: ', err));
        }).catch( err => console.log('addtransactionsview - get bills err: ', err));
      }).catch( err => console.log('addtransactionsview - get transactions err: ', err));
    }).catch( err => console.log('addtransactionview - get balance err: ', err));
  }

  // =============================== CHANGE MONTH BUTTONS ===============================
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
      selectedYear: year,
    }, () => this.initializeTransactions());

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
      selectedYear: year,
    });
    this.initializeTransactions();
  }
  // =======================================================================================
  
  // =============================== PARSE TEMPLATES INTO TRANSACTIONS ===============================
  getWeeklyTransactionsFromTemplate(template, dayFrom, dayThrough) {
    let transactions = [];
    let templateType = template.hasOwnProperty('category') ? 'bill' : 'income';
    
    for(let day = new Date(); day <= dayThrough; day.setDate(day.getDate() + 1)) {
      if(day.getDay() === template.day_num && day >= new Date(template.start_date)) {
        transactions.push({ templateType, name: template.name, amount: template.amount, day: new Date(day) });
      }
    }
    return transactions;
  }

  getMonthlyTransactionsFromTemplate(template, dayFrom, dayThrough) {
    let transactions = [];
    let templateType = template.hasOwnProperty('category') ? 'bill' : 'income';
    let dayIsLastDayOfMonth = false;
    
    for(let day = new Date(dayFrom); day <= dayThrough; day.setDate(day.getDate() + 1)) {
      dayIsLastDayOfMonth = day.getDate() === (new Date(day.getFullYear(), day.getMonth() + 1 , 0)).getDate();
      if(template.day_num > day.getDate() && dayIsLastDayOfMonth && day >= new Date(template.start_date)){
        transactions.push({ templateType, name: template.name, amount: template.amount, day: new Date(day) });
      }
      if(day.getDate() === template.day_num && day >= new Date(template.start_date)) {
        transactions.push({ templateType, name: template.name, amount: template.amount, day: new Date(day) });
      }
    }
    return transactions;
  }

  getEOWTransactionsFromTemplate(template, dayFrom, dayThrough) {
    let transactions = [];
    let templateType = template.hasOwnProperty('category') ? 'bill' : 'income';
    let startDate = new Date(template.start_date);

    for(let day = new Date(dayFrom); day <= dayThrough; day.setDate(day.getDate() + 1)) {
      let timeDiff = Math.abs(day.getTime() - startDate.getTime());
      let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
      if(diffDays % 14 === 0 && day >= new Date(template.start_date)) {
        transactions.push({ templateType, name: template.name, amount: template.amount, day: new Date(day) });
      }
    }
    return transactions;
  }
  // ==========================================================================================

  getTemplateTransactions(dayFrom, dayThrough) {
    let bills = this.state.bills.slice();
    let income = this.state.incomeSources.slice();
    let budgetTempate = bills.concat(income);
    let templateTransactions = [];
    for(let i = 0; i < budgetTempate.length; i++) {
      switch(budgetTempate[i].frequency_type) {
        case WEEK:
          templateTransactions =  templateTransactions.concat(this.getWeeklyTransactionsFromTemplate(budgetTempate[i], dayFrom, dayThrough));
          break;
        case MONTH:
          templateTransactions = templateTransactions.concat(this.getMonthlyTransactionsFromTemplate(budgetTempate[i], dayFrom, dayThrough));
          break;
        case EOW:
          templateTransactions = templateTransactions.concat(this.getEOWTransactionsFromTemplate(budgetTempate[i], dayFrom, dayThrough));
          break;
      }
    }
    return templateTransactions;
  }

  initializeTransactions() {
    let transactions = this.state.transactions.slice();
    let balanceDate = new Date(this.state.balanceInfo.date);
    let balanceAmount = +this.state.balanceInfo.amount;
    let startDate = new Date(balanceDate.getFullYear(), balanceDate.getMonth(), 1);
    // IF THERE ARE NO TRANSACTIONS YET, SET lastTransactionDate TO TODAY;
    let lastTransactionDate = transactions.length ? new Date(transactions[transactions.length -1].date) : new Date();
    let lastDayOfSelectedMonth = new Date(this.state.selectedYear, this.state.selectedMonth + 1, 0);
    // END DATE WILL EQUAL LAST TRANSACTION DATE OR LAST DAY OF SELECTED MONTH - WHICHEVER IS GREATER
    let endDate = lastTransactionDate >= lastDayOfSelectedMonth ? new Date(lastTransactionDate) : new Date(lastDayOfSelectedMonth);
    let months = [];

    // GET EVERY MONTH INBETWEEN THE TWO DATES INTO AN ARRAY
    for(let day = new Date(startDate); day <= endDate; day.setDate(day.getDate() + 1)) {
      if(months.length) {
        if(months.findIndex( month => month.monthNum === day.getMonth() && month.yearNum === day.getFullYear()) === -1) {
          months.push({ monthNum: day.getMonth(), yearNum: day.getFullYear() });
        }
      } else {
        months.push({ monthNum: day.getMonth(), yearNum: day.getFullYear() });
      }
    }

    let formattedTransactions = [];
    let month = null;
    let year = null;
    let firstDayOfCurrentMonth = null;
    let lastDayOfCurrentMonth = null;
    // FOR EVERY MONTH - CHECK IF THERE IS A TRANSACTION OR NOT
    for(let i = 0; i < months.length; i++) {
      month = months[i].monthNum;
      year = months[i].yearNum;
      let index = transactions.findIndex( transaction => { 
        transaction.date.getMonth() === months[i].monthNum &&
        transaction.date.getFullYear() === months[i].yearNum;
      });
      if(index !== -1) {
        firstDayOfCurrentMonth = new Date(year, month, 1);
        lastDayOfCurrentMonth = new Date(year, month + 1, 0);
        for(let day = new Date(year, month, 1); day <= lastDayOfCurrentMonth; day.setDate(day.getDate() + 1)) {
          for(let j = 0; j < transactions.length; j ++) {
            const { name, amount, date } = transactions[j];
            if(date.isSameDateAs(day)) {
              balanceAmount += +amount;
              formattedTransactions.push({ balance: balanceAmount, name, amount: +amount, date  });
            }
          }
        }
      } else { // get budgetTemplate for month
        let budgetTemplate = this.getTemplateTransactions(new Date(year, month ,1), new Date(year, month + 1, 0));
        budgetTemplate.sort( (firstItem, secondItem) => {
          return firstItem.day - secondItem.day;
        })
        for(let i = 0; i < budgetTemplate.length; i++) {
          balanceAmount += budgetTemplate[i].amount;
          budgetTemplate[i].balance = balanceAmount;
        }
        formattedTransactions = formattedTransactions.concat(budgetTemplate);
      }
    }
    this.setState({
      fullTransactionSet: formattedTransactions,
    })
  }
  
  populateTransactionsByMonth(){
    let firstDayOfSelectedMonth = new Date(this.state.selectedYear, this.state.selectedMonth, 1 );
    let lastDayOfSelectedMonth = new Date(this.state.selectedYear, this.state.selectedMonth + 1, 0);
    let transactions = this.state.fullTransactionSet.filter( transaction => {
      return transaction.day >= firstDayOfSelectedMonth && transaction.day <= lastDayOfSelectedMonth;
    })
    // let transactions = this.getTemplateTransactions(firstDayOfSelectedMonth, lastDayOfSelectedMonth);
    console.log('transactions: ', transactions);

    let daysInMonth = lastDayOfSelectedMonth.getDate();
    let transactionTable = [];
    let balanceDate = new Date(this.state.balanceInfo.date);
    let balance = null;

    for(let day = new Date(firstDayOfSelectedMonth); day >= balanceDate; day.setDate(day.getDate() -1)) {
      let index = this.state.fullTransactionSet.findIndex(transaction => transaction.day.isSameDateAs(day));
      if(index !== -1) {
        balance = this.state.fullTransactionSet[index].balance;
        break;
      }
    }

    balance = balance ? balance : this.state.balanceInfo.amount;

    for(let day = new Date(firstDayOfSelectedMonth); day <= lastDayOfSelectedMonth; day.setDate(day.getDate() + 1)) {
        
      let billName = '';
      let billAmount = 0;

      let billsForDay = transactions.filter( bill => bill.day.isSameDateAs(day));

      // I HAVE A LIST OF TRANSACTIONS AT THIS POINT THAT ALREADY HAVE A BALANCE:
      // I MAY HAVE MORE THAN ONE TRANSACTION PER DAY - WHICH WOULD BE INCLUDED IN billsForDay ABOVE. ARE THE
      // BALANCE AMOUNTS CORRECT?
      for(let i = 0; i < billsForDay.length; i++) {
        billName = billsForDay[i].name;
        billAmount = billsForDay[i].amount;
        balance = billsForDay[i].balance;
      }
      
      transactionTable.push(
        <div className='transaction-table-row-container' id={DateFunctions.formatDate(day)}>
          <div className='transaction-table-balance'>{balance}</div>
          <div className='transaction-table-date'>{DateFunctions.formatDate(day)}</div>
          <div className='transaction-table-bill-name'>{billName}</div>
          <div className='transaction-table-bill-amount'>{billAmount}</div>
        </div>
      );
    }

    return transactionTable;
  }
  
  
  render() {
    
    let transactions = this.populateTransactionsByMonth();

    return (
      <div className='add-transactoins'>
        <Header />
        AddTransactionsView
        <div>
          <button onClick={this.previousMonth}>Previous Month</button>
          <button onClick={this.nextMonth}>Next Month</button>
        </div>
        <table>
          <div className='transaction-table-container'>
            <div className='transaction-header-container'>
              <div>Balance</div>
              <div>Date</div>
              <div>Name</div>
              <div>Amount</div>
            </div>
            {transactions}
          </div>
        </table>
      </div>
    )
  }
}