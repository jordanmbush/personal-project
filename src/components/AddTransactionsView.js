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
      balanceInfo: {},
      newTransaction: {
        transactionType: '',
        name: '',
        amount: '',
        day: '',
      }
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
    this.toggleTableRowVisibility = this.toggleTableRowVisibility.bind(this);
    this.addTransaction = this.addTransaction.bind(this);
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
              bill.amount = parseFloat(bill.amount) * -1;
              return bill;
            })
            let parsedIncome = incomeSources.data.map( income => {
              income.amount = parseFloat(income.amount);
              return income;
            })
            let parsedTransactions = transactions.data.map( transaction => {
              let multiplier = transaction.type === 'income' ? 1 : -1;
              transaction.amount = parseFloat(transaction.amount) * multiplier;
              return transaction;
            })
            console.log('received transactions: ', transactions.data);
            this.setState({
              bills: parsedBills,
              incomeSources: parsedIncome,
              transactions: parsedTransactions,
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
    let transactionType = template.hasOwnProperty('category') ? 'expense' : 'income';
    
    for(let day = new Date(dayFrom); day <= dayThrough; day.setDate(day.getDate() + 1)) {
      if(day.getDay() === template.day_num && day >= new Date(template.start_date)) {
        transactions.push({ transactionType, name: template.name, amount: template.amount, day: new Date(day) });
      }
    }
    return transactions;
  }

  getMonthlyTransactionsFromTemplate(template, dayFrom, dayThrough) {
    let transactions = [];
    let transactionType = template.hasOwnProperty('category') ? 'expense' : 'income';
    let dayIsLastDayOfMonth = false;
    
    for(let day = new Date(dayFrom); day <= dayThrough; day.setDate(day.getDate() + 1)) {
      dayIsLastDayOfMonth = day.getDate() === (new Date(day.getFullYear(), day.getMonth() + 1 , 0)).getDate();
      if(template.day_num > day.getDate() && dayIsLastDayOfMonth && day >= new Date(template.start_date)){
        transactions.push({ transactionType, name: template.name, amount: template.amount, day: new Date(day) });
      }
      if(day.getDate() === template.day_num && day >= new Date(template.start_date)) {
        transactions.push({ transactionType, name: template.name, amount: template.amount, day: new Date(day) });
      }
    }
    return transactions;
  }

  getEOWTransactionsFromTemplate(template, dayFrom, dayThrough) {
    let transactions = [];
    let transactionType = template.hasOwnProperty('category') ? 'expense' : 'income';
    let startDate = new Date(template.start_date);

    for(let day = new Date(dayFrom); day <= dayThrough; day.setDate(day.getDate() + 1)) {
      let timeDiff = Math.abs(day.getTime() - startDate.getTime());
      let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
      if(diffDays % 14 === 0 && day >= new Date(template.start_date)) {
        transactions.push({ transactionType, name: template.name, amount: template.amount, day: new Date(day) });
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
        case WEEK: templateTransactions =  templateTransactions.concat(this.getWeeklyTransactionsFromTemplate(budgetTempate[i], dayFrom, dayThrough));
          break;
        case MONTH: templateTransactions = templateTransactions.concat(this.getMonthlyTransactionsFromTemplate(budgetTempate[i], dayFrom, dayThrough));
          break;
        case EOW: templateTransactions = templateTransactions.concat(this.getEOWTransactionsFromTemplate(budgetTempate[i], dayFrom, dayThrough));
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
        return  new Date(transaction.date).getMonth() === month &&
          new Date(transaction.date).getFullYear() === year;
      });
      // IF THERE IS A TRANSACTION FOR THE MONTH
      if(index !== -1) {
        firstDayOfCurrentMonth = new Date(year, month, 1);
        lastDayOfCurrentMonth = new Date(year, month + 1, 0);
        for(let day = new Date(year, month, 1); day <= lastDayOfCurrentMonth; day.setDate(day.getDate() + 1)) {
          for(let j = 0; j < transactions.length; j ++) {
            const { name, amount, date, type } = transactions[j];
            if(new Date(date).isSameDateAs(day)) {
              balanceAmount = parseFloat(balanceAmount) + parseFloat(amount);
              formattedTransactions.push({ transactionType: type, balance: balanceAmount, name, amount, day: new Date(date)  });
            }
          }
        }
      } else { // GET budgetTemplate FOR MONTH
        let budgetTemplate = this.getTemplateTransactions(new Date(year, month ,1), new Date(year, month + 1, 0));
        console.log('budgetTemplate for ' + (month + 1) + ': ', budgetTemplate);
        budgetTemplate.sort( (firstItem, secondItem) => {
          return firstItem.day - secondItem.day;
        })
        for(let i = 0; i < budgetTemplate.length; i++) {
          balanceAmount = parseFloat(balanceAmount) + parseFloat(budgetTemplate[i].amount);
          budgetTemplate[i].balance = balanceAmount;
        }
        formattedTransactions = formattedTransactions.concat(budgetTemplate);
      }
    }
    console.log('formatted transactions: ', formattedTransactions);
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
    let day = new Date(firstDayOfSelectedMonth);
    day.setDate(day.getDate() -1);
    for(day ; day >= balanceDate; day.setDate(day.getDate() -1)) {
      // I REVERSE THE ARRAY SINCE findIndex WILL FIND THE FIRST TRANSACTION FOR THE DAY THAT IT IS LOOKING FOR.
      // SINCE TRANSACTIONS ARE LISTED CHRONOLOGICALLY, EVEN WITHIN DAYS, REVERSING WILL MAKE THE FIRST DAY THAT
      // IS FOUND BE THE LAST TRANSACTION FOR THAT DAY, AND THEREFORE THE ENDING BALANCE FOR THAT DAY.
      let index = this.state.fullTransactionSet.reverse().findIndex(transaction => transaction.day.isSameDateAs(day));
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
      if(!billsForDay.length) {
        billsForDay.push({ name: '', amount: 0, balance: balance });
      }
      // REVERSE THE BILLS FOR THAT DAY SO THAT THE LAST TRANSACTION FOR THE DAY IS ON TOP, OR FIRST. ALL TRANSACTIONS ARE HIDDEN
      // EXCEPT THE FIRST. REVERSING THE ARRAY WILL ENSURE THAT THE LATEST BALANCE FOR THE DAY IS WHAT IS SHOWING
      billsForDay = billsForDay.reverse();

      let dailyTransactions = [];
      let id = DateFunctions.formatDate(day);
      const button = <button id={id + '-toggle-button'} className='toggle-transactions-button-show' onClick={ e => this.toggleTableRowVisibility(e) }>+</button>;

      for(let i = 0; i < billsForDay.length; i++) {
        billName = billsForDay[i].name;
        billAmount = billsForDay[i].amount;
        balance = billsForDay[i].balance;

        dailyTransactions.push(
            <div className={i !== 0 && 'row-hidden'} id={`${id}-${i}`}>
              <div className='transaction-table-week-day'>{day.toString().split(' ')[0]}</div>
              <div className='transaction-table-balance'>{balance}</div>
              <div className='transaction-table-date'>{DateFunctions.formatDate(day)}</div>
              <div className='transaction-table-bill-name'>{billName}</div>
              <div className='transaction-table-bill-amount'>{billAmount}</div>
              {i === 0 && button}
            </div>
        );
      }

      transactionTable.push(
        <div className='transaction-table-row-container' id={id}>
          {dailyTransactions}
          <div className='transaction-table-entry-row row-hidden' id={id + '-last'}>
            <input id={id + '-entry-name'}      placeholder="name - eg. 'Water'"></input>
            <input id={id + '-entry-amount'}    placeholder='amount' type='number'></input>
            <input id={id + '-entry-category'}  placeholder='category'></input>
            <div className='income-radio'>
              <label htmlFor={id + '-radio-income'}>Income</label>
              <input id={id + '-radio-income'}  type='radio' name={`${id}-transaction-type`}></input>
            </div>
            <div className='expense-radio'>
              <label htmlFor={id + '-radio-expense'}>Expense</label>
              <input id={id + '-radio-expense'} type='radio' name={`${id}-transaction-type`} checked></input>
            </div>
            <button id={id + '-add-button'} onClick={e => this.addTransaction(e)} >Add</button>
          </div>
        </div>
      )
    }
    return transactionTable;
  }

  addTransaction(e) {
    let id = e.target.id.replace('-add-button', '');
    let name = document.getElementById(id + '-entry-name');
    let amount = document.getElementById(id + '-entry-amount');
    let category = document.getElementById(id + '-entry-category');
    let radioIncome = document.getElementById(id + '-radio-income'); //WE DON'T NEED TO GET THE EXPENSE RADIO BUTTON - WE CAN JUST CHECK WHETHER INCOME IS CHECKED OR NOT

    let newTransaction = {
      name: name.value,
      amount: parseFloat(amount.value),
      category: category.value,
      type: radioIncome.checked ? 'income' : 'expense',
      date: new Date(id.replace(/-/g, '\/')),
    }

    name.value = ''; amount.value = '', category.value = ''; radioIncome.checked = false;

    axios.post('/api/transaction', newTransaction).then( response => {
      let transactionsCopy = this.state.transactions.slice();
      let newTransactions = response.data.map( transaction => {
        let multiplier = transaction.type === 'income' ? 1 : -1;
        transaction.amount = parseFloat(transaction.amount) * multiplier;
        return transaction;
      })
      this.setState({
        transactions: transactionsCopy.concat(newTransactions),
      }, () => this.initializeTransactions())
    }).catch( err => console.log('addTransactionView.js addTransaction err: ', err));
  }
  
  toggleTableRowVisibility(e) {
    // NEED TO SET CLASSNAME BASED ON BUTTON'S CLASS OR VALUE - HAVING ISSUES WHEN ADD TRANSACTIONS
    // ADDED TRANSACTIONS CLASS IS SET TO HIDE - BUT SHOW/HIDE BUTTON IS SET TO HIDE ON THE NEXT CLICK,
    // WHICH CHANGES THE NEW TRANSACTION TO SHOW, BUT THE ENTRY ROW TO HIDE.
    let id = e.target.id.replace('-toggle-button', '');
    let children = document.getElementById(id).childNodes;
    let buttonClassList = document.getElementById(e.target.id).className.split(' ');

    for(let i = 1; i < children.length; i++) {
      let classList = children[i].className.split(' ');
      if(buttonClassList.indexOf('toggle-transactions-button-hide') !== -1) {
        classList.splice(classList.indexOf('row-showing'), 1, 'row-hidden');
        children[i].className = classList.join(' ');
        document.getElementById(e.target.id).className = 'toggle-transactions-button-show';
        document.getElementById(e.target.id).innerText = '+';
      } else if(buttonClassList.indexOf('toggle-transactions-button-show') !== -1) {
        classList.splice(classList.indexOf('row-hidden'), 1, 'row-showing');
        children[i].className = classList.join(' ');
        document.getElementById(e.target.id).className = 'toggle-transactions-button-hide';
        document.getElementById(e.target.id).innerText = '-';
      }
    }
  }
  
  render() {
    
    let transactions = this.populateTransactionsByMonth();

    return (
      <div className='add-transactions'>
        <Header />
        AddTransactionsView
        <div>
          <button onClick={this.previousMonth}>Previous Month</button>
          <button onClick={this.nextMonth}>Next Month</button>
        </div>
        <table>
          <div className='transaction-table-container'>
            <div className='transaction-table-header-container'>
              <div className='transaction-table-header-row'>
                <div>Balance</div>
                <div>Date</div>
                <div>Name</div>
                <div>Amount</div>
              </div>
            </div>
            {transactions}
          </div>
        </table>
      </div>
    )
  }
}