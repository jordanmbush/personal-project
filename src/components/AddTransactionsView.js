import React, { Component } from 'react';
import axios from 'axios';
import DateFunctions from './../helpers/DateFunctions';
import Header from './Header';
import currency from 'currency.js';

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
    this.currentMonth = this.currentMonth.bind(this);
    this.previousMonth = this.previousMonth.bind(this);
    this.populateTransactionsByMonth = this.populateTransactionsByMonth.bind(this);
    this.getWeeklyTransactionsFromTemplate = this.getWeeklyTransactionsFromTemplate.bind(this);
    this.getMonthlyTransactionsFromTemplate = this.getMonthlyTransactionsFromTemplate.bind(this);
    this.getEOWTransactionsFromTemplate = this.getEOWTransactionsFromTemplate.bind(this);
    this.getTemplateTransactions = this.getTemplateTransactions.bind(this);
    this.initializeTransactions = this.initializeTransactions.bind(this);
    this.toggleTableRowVisibility = this.toggleTableRowVisibility.bind(this);
    this.addTransaction = this.addTransaction.bind(this);
    this.deleteTransaction = this.deleteTransaction.bind(this);
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
              bill.amount = currency(bill.amount).multiply(-1).value;
              return bill;
            })
            let parsedIncome = incomeSources.data.map( income => {
              income.amount = currency(income.amount).value;
              return income;
            })
            let parsedTransactions = transactions.data.map( transaction => {
              let multiplier = transaction.type === 'income' ? 1 : -1;
              transaction.amount = currency(transaction.amount).multiply(multiplier).value;
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

  currentMonth() {
    let month = (new Date()).getMonth();
    let year = (new Date()).getFullYear();

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
        transactions.push({ transactionType, name: template.name, amount: currency(template.amount).value, category: template.category, day: new Date(day) });
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
        transactions.push({ transactionType, name: template.name, amount: currency(template.amount).value, category: template.category, day: new Date(day) });
      }
      if(day.getDate() === template.day_num && day >= new Date(template.start_date)) {
        transactions.push({ transactionType, name: template.name, amount: currency(template.amount).value, category: template.category, day: new Date(day) });
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
        transactions.push({ transactionType, name: template.name, amount: currency(template.amount).value, category: template.category, day: new Date(day) });
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
    let balanceAmount = currency(this.state.balanceInfo.amount);
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
            const { name, amount, date, type, category, id } = transactions[j];
            if(new Date(date).isSameDateAs(day)) {
              balanceAmount = currency(balanceAmount).add(amount).value;
              formattedTransactions.push({ id, transactionType: type, balance: balanceAmount, name, amount: currency(amount).value, category, day: new Date(date)  });
            }
          }
        }
      } else { // GET budgetTemplate FOR MONTH
        let budgetTemplate = this.getTemplateTransactions(new Date(year, month ,1), new Date(year, month + 1, 0));
        budgetTemplate.sort( (firstItem, secondItem) => {
          return firstItem.day - secondItem.day;
        })
        for(let i = 0; i < budgetTemplate.length; i++) {
          balanceAmount = currency(balanceAmount).add(budgetTemplate[i].amount).value;
          budgetTemplate[i].balance = balanceAmount;
        }
        formattedTransactions = formattedTransactions.concat(budgetTemplate);
      }
    }
    // ADD A KEY WHICH CORRESPONDS THE THE TRANSACTIONS INDEX. WHEN OTHER ARRAYS ARE MADE FROM THIS ARRAY
    // AND THEN FILTERED - THEY WILL HAVE A REFERENCE TO THIS ARRAY, WHICH WILL BE IN STATE.
    formattedTransactions.map( (transaction, i) => transaction.key = i );
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

    let daysInMonth = lastDayOfSelectedMonth.getDate();
    let transactionTable = [];
    let balanceDate = new Date(this.state.balanceInfo.date);
    let balance = null;
    let day = new Date(firstDayOfSelectedMonth);
    day.setDate(day.getDate() -1); //START DAY OFF AS LAST DAY OF PREVIOUS MONTH
    // console.log('reversed Transactions: ', this.state.fullTransactionSet.reverse());
    for(day ; day >= balanceDate; day.setDate(day.getDate() -1)) {
      // I REVERSE THE ARRAY SINCE findIndex WILL FIND THE FIRST TRANSACTION FOR THE DAY THAT IT IS LOOKING FOR.
      // SINCE TRANSACTIONS ARE LISTED CHRONOLOGICALLY, EVEN WITHIN DAYS, REVERSING WILL MAKE THE FIRST DAY THAT
      // IS FOUND BE THE LAST TRANSACTION FOR THAT DAY, AND THEREFORE THE ENDING BALANCE FOR THAT DAY.
      let reversedTransactionSet = this.state.fullTransactionSet.slice().reverse();
      let index = reversedTransactionSet.findIndex(transaction => transaction.day.isSameDateAs(day));
      if(index !== -1) {
        balance = reversedTransactionSet[index].balance;
        break;
      }
    }

    balance = balance ? balance : this.state.balanceInfo.amount;

    // ==========================================================================
    // ======================= FOR EVERY DAY OF THE MONTH =======================
    // ==========================================================================
    for(let day = new Date(firstDayOfSelectedMonth); day <= lastDayOfSelectedMonth; day.setDate(day.getDate() + 1)) {
        
      
      let billsForDay = transactions.filter( bill => bill.day.isSameDateAs(day));
      
      let billName = '';
      let billAmount = 0;
      let dailyTotal = 0;
      let dailyTransactions = [];
      let dayID = DateFunctions.formatDate(day);
      const expandDayButton = <button id={dayID + '-toggle-button'} className='toggle-transactions-button-show' onClick={ e => this.toggleTableRowVisibility(e) }>+</button>;
      const subTransactionHeader = (
        <div className='row-hidden'>
          <div className='sub-transaction-header-title'>Balance</div>
          <div className='sub-transaction-header-title'>Name</div>
          <div className='sub-transaction-header-title'>Amount</div>
          <div className='sub-transaction-header-title'>Category</div>
        </div>
      )

      // ==========================================================================
      // ==================== FOR EVERY TRANSACTION OF THE DAY ====================
      // ==========================================================================
      for(let i = 0; i < billsForDay.length; i++) {
        let { name, amount, transactionType, id, category } = billsForDay[i];
        let indexInState = billsForDay[i].key;
        billName = name;
        billAmount = amount;
        balance = billsForDay[i].balance;
        dailyTotal = currency(amount).add(dailyTotal).value;
        const editTransactionButton = <button>Edit</button>
        const deleteTransactionButton = <button data-is-transaction={id || false} data-index={indexInState} id={`${dayID}-${i}-delete-button`} onClick={(e) => this.deleteTransaction(e.currentTarget)}><i className="fas fa-trash-alt"></i></button>

        dailyTransactions.push(
            <div className='row-hidden' id={`${dayID}-${i}`}>
              <input id={`${dayID}-${i}-balance`} className='transaction-table-balance'value={currency(balance).value}></input>
              <input id={`${dayID}-${i}-name`} className='transaction-table-bill-name'value={billName}></input>
              <input id={`${dayID}-${i}-amount`} className='transaction-table-bill-amount'value={currency(billAmount).value}></input>
              <input id={`${dayID}-${i}-category`} className='transaction-table-bill-category'value={category}></input>
              <div className='income-radio'>
                <label htmlFor={dayID + '-radio-income'}>Income</label>
                <input id={dayID + i + '-radio-income'}  type='radio' name={`${dayID}-${i}-transaction-type`} checked={transactionType === 'income'}></input>
              </div>
              <div className='expense-radio'>
                <label htmlFor={dayID + i + '-radio-expense'}>Expense</label>
                <input id={dayID + '-radio-expense'} type='radio' name={`${dayID}-${i}-transaction-type`} checked={transactionType === 'expense'}></input>
              </div>
              {editTransactionButton}
              {deleteTransactionButton}
            </div>
        );
      }
      // ============================================================================

      // WORK ON EDIT, AND DELETE BUTTON FUNCTIONALITY, AS WELL AS THE ADD NEW BUTTON.
      let dailySummaryRow = (
        <div className='transaction-table-daily-header-row' id={`${dayID}-header-row`}>
          <div className='transaction-table-week-day'>{day.toString().split(' ')[0]}</div>
          <div className='transaction-table-balance'>{currency(balance).value}</div>
          <div className='transaction-table-date'>{DateFunctions.formatDate(day)}</div>
          <div className='transaction-table-bill-name'>{billsForDay.length > 1 && 'Multiple Transactions...' || billName}</div>
          <div className='transaction-table-bill-amount'>{currency(dailyTotal).value}</div>
          {expandDayButton}
        </div>
      );

      // ===========================================================================
      // =============== PUSH ALL TRANSACTIONS TO RETURN VALUE =====================
      // ===========================================================================
      transactionTable.push(
        <div className='transaction-table-row-container' id={dayID}>
          {dailySummaryRow}
          {subTransactionHeader}
          {dailyTransactions}
          <div className='transaction-table-entry-row row-hidden' id={dayID + '-entry-row'}>
            <input id={dayID + '-entry-name'}      placeholder="name - eg. 'Water'"></input>
            <input id={dayID + '-entry-amount'}    placeholder='amount' type='number'></input>
            <input id={dayID + '-entry-category'}  placeholder='category'></input>
            <div className='income-radio'>
              <label htmlFor={dayID + '-radio-income'}>Income</label>
              <input id={dayID + '-radio-income'}  type='radio' name={`${dayID}-transaction-type`}></input>
            </div>
            <div className='expense-radio'>
              <label htmlFor={dayID + '-radio-expense'}>Expense</label>
              <input id={dayID + '-radio-expense'} type='radio' name={`${dayID}-transaction-type`} checked></input>
            </div>
            <button id={dayID + '-add-button'} onClick={e => this.addTransaction(e)} >Add</button>
          </div>
        </div>
      )
    }
    return transactionTable;
  }

  deleteTransaction(target) {
    let id = target.id.replace('-delete-button', '');
    let transactionID = target.dataset.isTransaction;
    let indexInState = target.dataset.index;
    let name = document.getElementById(id + '-name').innerText;

    // IF THIS IS AN ACTUAL TRANSACTION, AND NOT JUST A BUDGET TEMPLATE ITEM
    if(transactionID !== 'false') {
      axios.delete(`/api/transaction/${transactionID}`).then( response => {
        let transactionsCopy = this.state.transactions.slice();
        let index = transactionsCopy.findIndex( transaction => transaction.id === transactionID);
        transactionsCopy.splice(index,1);
        console.log('delete successful');
        this.setState({
          transactions: transactionsCopy,
        }, () => this.initializeTransactions());
      }).catch(err => console.log('AddTransactionsView.js - deleteTransaction err: ', err));
    // IT THIS IS A BUDGET TEMPLATE ITEM TRYING TO BE DELETED, ADD ALL TEMPLATE ITEMS FOR THE MONTH
    // TO THE TRANSACTIONS TABLE EXCEPT THIS TEMPLATE ITEM
    } else { //ADD ALL BUDGET TEMPLATE TRANSACTIONS TO THE DATABASE
      let fullTransactionSetCopy = this.state.fullTransactionSet.slice();
      // GET ALL BUDGET TEMPLATE ITEMS FOR THE CURRENT MONTH
      let budgetTempateItems = fullTransactionSetCopy.filter( transaction => {
        return( !transaction.hasOwnProperty('id') &&
        transaction.day.getMonth() === this.state.selectedMonth &&
        transaction.day.getFullYear() === this.state.selectedYear &&
        transaction.key !== parseInt(indexInState));
      });
      // CHANGE THE PROPERTY TYPE transactionType TO type SINCE THAT'S WHAT THE '/api/transactions' ENDPOINT IS EXPECTING
      budgetTempateItems.map( transaction => {
        transaction.type = transaction.transactionType;
        delete transaction.transactionType;
        transaction.day = new Date(transaction.day);
        transaction.amount = Math.abs(currency(transaction.amount).value);
      });
      console.log('budget items: ', budgetTempateItems);
      axios.post('/api/transactions', {transactionsArray: budgetTempateItems}).then( transactions => {
        axios.get('/api/transactions').then( allTransactions => {
          let parsedTransactions = allTransactions.data.map( transaction => {
            let multiplier = transaction.type === 'income' ? 1 : -1;
            transaction.amount = currency(transaction.amount).multiply(multiplier).value;
            return transaction;
          });
          this.setState({
            transactions: parsedTransactions,
          }, () => this.initializeTransactions());
        })
      })
    }
  }

  addTransaction(e) {
    let id = e.target.id.replace('-add-button', '');
    let name = document.getElementById(id + '-entry-name');
    let amount = document.getElementById(id + '-entry-amount');
    let category = document.getElementById(id + '-entry-category');
    let radioIncome = document.getElementById(id + '-radio-income'); //WE DON'T NEED TO GET THE EXPENSE RADIO BUTTON - WE CAN JUST CHECK WHETHER INCOME IS CHECKED OR NOT

    let newTransaction = {
      name: name.value,
      amount: Math.abs(currency(amount.value).value),
      category: category.value,
      type: radioIncome.checked ? 'income' : 'expense',
      date: new Date(id.replace(/-/g, '/')),
    }

    name.value = ''; amount.value = '', category.value = ''; radioIncome.checked = false;

    axios.post('/api/transaction', newTransaction).then( response => {
      let transactionsCopy = this.state.transactions.slice();
      let newTransactions = response.data.map( transaction => {
        let multiplier = transaction.type === 'income' ? 1 : -1;
        transaction.amount = currency(transaction.amount).multiply(multiplier).value;
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
    let dateArr = (new Date(this.state.selectedYear, this.state.selectedMonth)).toDateString().split(' ');
    let monthYearHeader = dateArr[1] + ' ' + dateArr[3];
    return (
      <div className='add-transactions'>
        <Header />
        <h1>AddTransactionsView</h1>
        <h2>{monthYearHeader}</h2>
        <div className='month-navigation-buttons-container top-buttons'>
          <button onClick={this.previousMonth}>Previous Month</button>
          <button onClick={this.currentMonth}>Current Month</button>
          <button onClick={this.nextMonth}>Next Month</button>
        </div>
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
        <div className='month-navigation-buttons-container bottom-buttons'>
          <button onClick={this.previousMonth}>Previous Month</button>
          <button onClick={this.currentMonth}>Current Month</button>
          <button onClick={this.nextMonth}>Next Month</button>
        </div>
      </div>
    )
  }
}