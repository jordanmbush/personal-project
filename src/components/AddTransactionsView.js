import React, { Component } from 'react';
import axios from 'axios';
import DateFunctions from './../helpers/DateFunctions';
import Header from './Header';
import currency from 'currency.js';
import { getTransactionsFromDB, getEOWTransactionsFromTemplate, getMonthlyTransactionsFromTemplate, getTemplateTransactions, getWeeklyTransactionsFromTemplate, getXDAYSTransactionsFromTemplate, initializeTransactions } from '../helpers/DataFunctions';
import categories from '../helpers/categories';
import _ from 'lodash';

const monthNames =  ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
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
      },
      currentMonthTransactions: [],
      newTransactions: []
    }
    this.nextMonth = this.nextMonth.bind(this);
    this.currentMonth = this.currentMonth.bind(this);
    this.previousMonth = this.previousMonth.bind(this);
    this.populateTransactionsByMonth = this.populateTransactionsByMonth.bind(this);
    this.toggleTableRowVisibility = this.toggleTableRowVisibility.bind(this);
    this.toggleEditSaveTransactionButton = this.toggleEditSaveTransactionButton.bind(this);
    this.toggleRowButtonsVisibility = this.toggleRowButtonsVisibility.bind(this);
    this.addTransaction = this.addTransaction.bind(this);
    this.saveTransaction = this.saveTransaction.bind(this);
    this.deleteTransaction = this.deleteTransaction.bind(this);
    this.updateTransactionValues = this.updateTransactionValues.bind(this);
    // ===========================================
    this.getTrans = getTransactionsFromDB.bind(this);
    this.putTransactionsInState = initializeTransactions.bind(this);
    this.getTemplateTrans = getTemplateTransactions.bind(this);
    this.getCategories = this.getCategories.bind(this);
    this.getSubCategories = this.getSubCategories.bind(this);
    this.getNewTransaction = this.getNewTransaction.bind(this);
    this.getNewTransactionIndex = this.getNewTransactionIndex.bind(this);
    this.setNewTransactionValue = this.setNewTransactionValue.bind(this);
    this.currentMonthHasTransactions = this.currentMonthHasTransactions.bind(this);
    this.convertBudgetItemsToTransactions = this.convertBudgetItemsToTransactions.bind(this);
  }

  componentDidMount() {
    this.getTrans();
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
  getSubCategories(category) {
    let subCategories = categories[category];
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
    }, () => this.putTransactionsInState());
  }

  currentMonth() {
    let month = (new Date()).getMonth();
    let year = (new Date()).getFullYear();

    this.setState({
      selectedMonth: month,
      selectedYear: year,
    }, () => this.putTransactionsInState());
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
    }, () => this.putTransactionsInState());
  }

  // ==========================================
  getNewTransaction(id) {
    let newTransactions = this.state.newTransactions.slice();
    // RETURNS UNDEFINED IF NOT FOUND
    return newTransactions.find( transaction => transaction.id === id);
  }
  setNewTransactionValue(target) {
    let newTransactions = this.state.newTransactions.slice();
    let value ='', prop = '', index = -1, id ='';
    
    switch(target.type) {
      case 'radio':
        id = target.id.substring(0, target.id.indexOf('-radio-'));
        index = this.getNewTransactionIndex(id);
        value = target.id.substring(target.id.indexOf('-radio-') + 7);
        prop = 'transactionType';
        break;
      default:
        id = target.id.substring(0, target.id.indexOf('-entry-'));
        index = this.getNewTransactionIndex(id);
        prop = target.id.substring(target.id.indexOf('-entry-') + 7);
        if(prop === 'amount') {
          value = Math.abs(currency(target.value).value);
          break;
        } else {
          value = target.value;
        }
    }
    if(index !== -1) {
        newTransactions[index][prop] = value;
    } else {
      newTransactions.push({
        id: id,
        date: id,
        [prop]: value
      })
    }
    this.setState({ newTransactions });
  }
  getNewTransactionIndex(id) {
    let newTransactions = this.state.newTransactions.slice();
    let index = newTransactions.findIndex( transaction => transaction.id === id );
    return index;
  }

  currentMonthHasTransactions() {
    let monthNum = this.state.selectedMonth;
    let yearNum = this.state.selectedYear;
    let transactions = this.state.transactions.slice();
    let index = transactions.findIndex( transaction => {
      return(
        new Date(transaction.date).getMonth === monthNum &&
        new Date(transaction.date).getFullYear === yearNum);
    });

    return index !== -1;
  }

  // =======================================================================================
  // =========================== GENERATE BUDGET TABLE =====================================
  // =======================================================================================
  
  populateTransactionsByMonth(){
    let firstDayOfSelectedMonth = new Date(this.state.selectedYear, this.state.selectedMonth, 1 );
    let lastDayOfSelectedMonth = new Date(this.state.selectedYear, this.state.selectedMonth + 1, 0);
    // let transactions = this.state.fullTransactionSet.filter( transaction => {
    //   return transaction.day >= firstDayOfSelectedMonth && transaction.day <= lastDayOfSelectedMonth;
    // })
    let transactions  = this.state.currentMonthTransactions.slice();

    let daysInMonth = lastDayOfSelectedMonth.getDate();
    let transactionTable = [];
    let balanceDate = this.state.balanceInfo.date ? new Date(this.state.balanceInfo.date) : new Date(firstDayOfSelectedMonth);
    let balance = null;
    let day = new Date(firstDayOfSelectedMonth);
    day.setDate(day.getDate() -1); //START DAY OFF AS LAST DAY OF PREVIOUS MONTH
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
    // THIS SECTION WILL BE USED TO HOLD DATA FOR BANDING ROWS BY WEEK
    let bandStartDate = null; //TO BE SET UPON THE FIRST SUNDAY OF THE MONTH
    // ==========================================================================
    // ======================= FOR EVERY DAY OF THE MONTH =======================
    // ==========================================================================
    for(let day = new Date(firstDayOfSelectedMonth); day <= lastDayOfSelectedMonth; day.setDate(day.getDate() + 1)) {
      
      let billsForDay = [];
      if(transactions.length) {
        billsForDay = transactions.filter( bill => bill.day.isSameDateAs(day));
      }
      
      let billName = '';
      let billAmount = 0;
      let dailyTotal = 0;
      let dailyTransactions = [];
      let dayID = DateFunctions.formatDate(day);
      const subTransactionHeader = (
        <div className='transaction-table-row-header'>
          <div className='sub-transaction-header-title'>Bal</div>
          <div className='sub-transaction-header-title'>Name</div>
          <div className='sub-transaction-header-title'>Amt</div>
          <div className='sub-transaction-header-title'>Ctg</div>
          <div className='sub-transaction-header-title'>SubCtg</div>
        </div>
      );
      // ==========================================================================
      // ==================== FOR EVERY TRANSACTION OF THE DAY ====================
      // ==========================================================================
      for(let i = 0; i < billsForDay.length; i++) {
        let { name, amount, transactionType, id, category, currentMonthTransactionKey, formattedTransactionKey } = billsForDay[i];
        billName = name;
        billAmount = amount;

        balance = billsForDay[i].balance;
        dailyTotal = currency(amount).add(dailyTotal).value;
        const deleteTransactionButton = <button data-is-transaction={id || false} data-index={formattedTransactionKey} id={`${currentMonthTransactionKey}-delete-button`} onClick={(e) => this.deleteTransaction(e.currentTarget)} className='delete-button'><i className="fas fa-trash-alt"></i></button>
        const editTransactionButton = <button data-is-transaction={id || false} data-index={formattedTransactionKey} id={`${currentMonthTransactionKey}-edit-button`} onClick={(e) => this.toggleEditSaveTransactionButton(e.currentTarget)} className='edit-button'>Edit</button>

        dailyTransactions.push(
          <div className='transaction-table-row' id={`${dayID}-${i}`}>
            <div className='transaction-info' onClick={() => this.toggleRowButtonsVisibility(`${dayID}-${i}`)}>
                <div><input disabled id={`${currentMonthTransactionKey}-balance`} className='transaction-balance' onChange={e => this.updateTransactionValues(e)} value={currency(this.state.currentMonthTransactions[currentMonthTransactionKey].balance).format(true)}></input></div>
                <div><input disabled id={`${currentMonthTransactionKey}-name`} className='transaction-name' onChange={e => this.updateTransactionValues(e)} value={this.state.currentMonthTransactions[currentMonthTransactionKey].name}></input></div>
                <div><input disabled id={`${currentMonthTransactionKey}-amount`} className='transaction-amount' onChange={e => this.updateTransactionValues(e)} value={currency(this.state.currentMonthTransactions[currentMonthTransactionKey].amount).value} type='number'></input></div>
                <div><input disabled id={`${currentMonthTransactionKey}-category`} className='transaction-category' onChange={e => this.updateTransactionValues(e)} value={this.state.currentMonthTransactions[currentMonthTransactionKey].category}></input></div>
                <div><input disabled id={`${currentMonthTransactionKey}-subCategory`} className='transaction-subcCategory' onChange={e => this.updateTransactionValues(e)} value={this.state.currentMonthTransactions[currentMonthTransactionKey].subCategory}></input></div>
            </div>
            <div id={`${dayID}-${i}-buttons`} className='transaction-buttons-container row-hidden'>
              <div className='income-radio radio-container'>
                <label htmlFor={currentMonthTransactionKey + '-radio-income'}><i class="far fa-money-bill-alt"></i></label>
                <input disabled id={`${currentMonthTransactionKey}-radio-income`}  type='radio' name={`${currentMonthTransactionKey}-transaction-type`} onChange={(e) => this.updateTransactionValues(e)} checked={this.state.currentMonthTransactions[currentMonthTransactionKey].transactionType === 'income'}></input>
              </div>
              <div className='expense-radio radio-container'>
                <label htmlFor={`${currentMonthTransactionKey}-radio-expense`}>Expense</label>
                <input disabled id={currentMonthTransactionKey + '-radio-expense'} type='radio' name={`${currentMonthTransactionKey}-transaction-type`} onChange={(e) => this.updateTransactionValues(e)} checked={this.state.currentMonthTransactions[currentMonthTransactionKey].transactionType === 'expense'}></input>
              </div>
              {editTransactionButton}
              {deleteTransactionButton}
            </div>
          </div>
        );
      }
      // ============================================================================
      let bandedWeekClass = 'banded-false';
      let tempDay = new Date(day);
      if(tempDay.getDay() === 0 && !bandStartDate) {
        bandStartDate = new Date(tempDay);
        bandedWeekClass = 'banded-true';
      }
      if(bandStartDate) {
        if(Math.floor((tempDay.getDate() - bandStartDate.getDate())/7) % 2 === 0) {
          bandedWeekClass = 'banded-true';
        } else {
          bandedWeekClass = 'banded-false';
        }
      }
      if(day.isSameDateAs(new Date())) {
        bandedWeekClass += ' transaction-row-today'
      }

      let dayBalanceStyle = {
      }

      balance < 0 ? dayBalanceStyle.color = 'red' : '';
      
      let dailySummaryRow = (
        <div className={`transaction-table-daily-header-row ${bandedWeekClass}`} id={`${dayID}-header-row`} onClick={e => this.toggleTableRowVisibility(e.currentTarget)}>
          <div className='transaction-table-date-column'>{DateFunctions.simpleDateFormat(day)}</div>
          <div className='transaction-table-week-day-column'>{day.toString().split(' ')[0]}</div>
          <div style={dayBalanceStyle} className='transaction-table-balance-column'>{currency(balance).format(true)}</div>
          <div className='transaction-table-name-column'>{billsForDay.length > 1 && 'Multiple Transactions...' || billName}</div>
          <div className='transaction-table-amount-column'>{currency(dailyTotal).format(true)}</div>
        </div>
      );
      // ===========================================================================
      // =============== PUSH ALL TRANSACTIONS TO RETURN VALUE =====================
      // ===========================================================================
      transactionTable.push(
        <div className='transaction-table-row-container' id={dayID}>
          {dailySummaryRow}
          <div className='transaction-row-content-container row-hidden' id={`${dayID}-content-container`}>
            {subTransactionHeader}
            {dailyTransactions}
            <div className='show-entry-fields-button-container'>
              <button id={dayID + '-toggle-entry-row-button'} className='show-fields' onClick={() => this.toggleEntryRowVisibility(dayID)}>+ Add Transactions</button>
            </div>
            <div className='transaction-table-entry-container row-hidden' id={dayID + '-entry-row'}>
              <div className='data-fields entry-row'>
                <div className='entry-field'><input id={dayID + '-entry-name'}      value={this.getNewTransaction(`${dayID}`) && this.getNewTransaction(`${dayID}`).name || ''} placeholder="name - e.g. 'Water'" onChange={e => this.setNewTransactionValue(e.target)}></input></div>
                <div className='entry-field'><input id={dayID + '-entry-amount'}    value={this.getNewTransaction(`${dayID}`) && this.getNewTransaction(`${dayID}`).amount || ''} placeholder='amount' type='number' onChange={e => this.setNewTransactionValue(e.target)}></input></div>
                <div className='entry-field'>
                  <select id={dayID + '-entry-category'} value={this.getNewTransaction(`${dayID}`) && this.getNewTransaction(`${dayID}`).category || ''} onChange={e => this.setNewTransactionValue(e.target)}>
                    <option selected> --category-- </option>
                    {this.getCategories()}
                  </select>
                </div>
                <div className='entry-field'>
                  <select id={dayID + '-entry-subCategory'} value={this.getNewTransaction(`${dayID}`) && this.getNewTransaction(`${dayID}`).subCategory} onChange={e => this.setNewTransactionValue(e.target)}>
                    <option selected> --subcategory-- </option>
                    {this.getSubCategories(this.getNewTransaction(`${dayID}`) && this.getNewTransaction(`${dayID}`).category)}
                  </select>
                </div>
              </div>
              <div className='transaction-buttons-container button-fields entry-row'>
                <div className='income-radio radio-container entry-field'>
                  <label htmlFor={dayID + '-radio-income'}>Income</label>
                  <input id={dayID + '-radio-income'}  type='radio' name={`${dayID}-transaction-type`} checked={this.getNewTransaction(`${dayID}`) && this.getNewTransaction(`${dayID}`).transactionType === 'income'} onChange={e => this.setNewTransactionValue(e.target)}></input>
                </div>
                <div className='expense-radio radio-container entry-field'>
                  <label htmlFor={dayID + '-radio-expense'}>Expense</label>
                  <input id={dayID + '-radio-expense'} type='radio' name={`${dayID}-transaction-type`} checked={this.getNewTransaction(`${dayID}`) && this.getNewTransaction(`${dayID}`).transactionType === 'expense'} onChange={e => this.setNewTransactionValue(e.target)}></input>
                </div>
                <button className='entry-field' id={dayID + '-add-button'} onClick={e => this.addTransaction(e.target)} >Add</button>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return transactionTable;
  }

  // ===========================================================================
  // ================== ADD, EDIT, AND DELETE TRANSACTIONS =====================
  // ===========================================================================
  updateTransactionValues(e) {
    let index = parseInt(e.target.id.replace(/\D/g, ''));
    let prop = e.target.id.substring(index.toString().length + 1);
    let currentMonthTransactions = this.state.currentMonthTransactions.slice();
    if(prop.includes('radio')) {
      currentMonthTransactions[index].transactionType = currentMonthTransactions[index].transactionType === 'income' ? 'expense' : 'income';
      if(currentMonthTransactions[index].transactionType === 'income') {
        currentMonthTransactions[index].amount = Math.abs(currentMonthTransactions[index].amount);
      } else {
        currentMonthTransactions[index].amount = Math.abs(currentMonthTransactions[index].amount) * -1;
      }
    } else {
      switch(prop) {
        case 'amount':
          if(currentMonthTransactions[index].transactionType === 'income') {
            currentMonthTransactions[index][prop] = Math.abs(currency(e.target.value).value);
            break;
          } else {
            currentMonthTransactions[index][prop] = Math.abs(currency(e.target.value).value) * -1;
            break; 
          }
        default:
          currentMonthTransactions[index][prop] = e.target.value;
          break;
      }
    }
    
    this.setState({ currentMonthTransactions });
  }
  // =========================================== EDIT ===========================================
  toggleEditSaveTransactionButton(target) {
    let id = parseInt(target.id.replace('-edit-button', ''));
    let isDisabled = true;

    let transactionID = target.dataset.isTransaction;
    if(target.innerText === 'Edit') {
      target.innerText = 'Save';
      isDisabled = false;
    } else {
      target.innerText = 'Edit';
      isDisabled = true;
    }
    document.getElementById(id + '-name').disabled = isDisabled;
    document.getElementById(id + '-amount').disabled = isDisabled;
    document.getElementById(id + '-category').disabled = isDisabled;
    document.getElementById(id + '-subCategory').disabled = isDisabled;
    document.getElementById(id + '-radio-income').disabled = isDisabled;
    document.getElementById(id + '-radio-expense').disabled = isDisabled;

    if(target.innerText === 'Edit') {
      this.saveTransaction(target);
    }
  }

  saveTransaction(target) {
    let id = parseInt(target.id.replace('-edit-button', ''));
    let transactionID = target.dataset.isTransaction;

    if(transactionID !== 'false') {
      let monthlyTransaction = { ...this.state.currentMonthTransactions[id] };
      console.log('id: ', id, this.state);
      let transactionsCopy = this.state.transactions.slice();
      let transactionIndex = transactionsCopy.findIndex( transaction => transaction.id === monthlyTransaction.id);
      let updatedTransaction = {
        name: monthlyTransaction.name,
        amount: Math.abs(currency(monthlyTransaction.amount).value),
        category: monthlyTransaction.category,
        subCategory: monthlyTransaction.subCategory,
        type: monthlyTransaction.transactionType,
        date: monthlyTransaction.day,
        id: monthlyTransaction.id
      }
      axios.put(`/api/transaction`, updatedTransaction).then( transaction => {
        updatedTransaction.amount = updatedTransaction.type === 'income' ? updatedTransaction.amount : updatedTransaction.amount *-1;
        transactionsCopy.splice(transactionIndex, 1, updatedTransaction);
        this.setState({ transactions: transactionsCopy }, () => this.putTransactionsInState());
      }).catch( err => console.log('addtransactionview - edit transaction err: ', err));
    } else {
      let fullTransactionSetCopy = this.state.fullTransactionSet.slice();
      // GET ALL BUDGET TEMPLATE ITEMS FOR THE CURRENT MONTH
      let budgetTempateItems = fullTransactionSetCopy.filter( transaction => {
        return( !transaction.hasOwnProperty('id') &&
        transaction.day.getMonth() === this.state.selectedMonth &&
        transaction.day.getFullYear() === this.state.selectedYear);
      });
      // CHANGE THE PROPERTY TYPE transactionType TO type SINCE THAT'S WHAT THE '/api/transactions' ENDPOINT IS EXPECTING
      budgetTempateItems.map( transaction => {
        transaction.type = transaction.transactionType;
        delete transaction.transactionType;
        transaction.day = new Date(transaction.day);
        transaction.amount = Math.abs(currency(transaction.amount).value);
      });
      axios.post('/api/transactions', {transactionsArray: budgetTempateItems}).then( transactions => {
        axios.get('/api/transactions').then( allTransactions => {
          let parsedTransactions = allTransactions.data.map( transaction => {
            let multiplier = transaction.type === 'income' ? 1 : -1;
            transaction.amount = currency(transaction.amount).multiply(multiplier).value;
            return transaction;
          });
          this.setState({
            transactions: parsedTransactions,
          }, () => this.putTransactionsInState());
        })
      })
    }
  }
  // =========================================== DELETE ===========================================
  deleteTransaction(target) {
    let id = target.id.replace('-delete-button', '');
    let transactionID = target.dataset.isTransaction;
    let indexInState = target.dataset.index;
    let name = document.getElementById(id + '-name').innerText;
    // IF THIS IS AN ACTUAL TRANSACTION, AND NOT JUST A BUDGET TEMPLATE ITEM
    if(transactionID !== 'false') {
      axios.delete(`/api/transaction/${transactionID}`).then( response => {
        let transactionsCopy = this.state.transactions.slice();
        let index = transactionsCopy.findIndex( transaction => transaction.id === parseInt(transactionID));
        transactionsCopy.splice(index,1);
        console.log('delete successful');
        this.setState({
          transactions: transactionsCopy,
        }, () => this.putTransactionsInState());
      }).catch(err => console.log('AddTransactionsView.js - deleteTransaction err: ', err));
    } else {
      // IT THIS IS A BUDGET TEMPLATE ITEM TRYING TO BE DELETED, ADD ALL TEMPLATE ITEMS FOR THE MONTH
      // TO THE TRANSACTIONS TABLE EXCEPT THIS TEMPLATE ITEM
      // PASS THE ITEMS indexInState THAT WE WANT DELETED TO IT'S NOT ADDED TO THE TRANSACTIONS TABLE
      this.convertBudgetItemsToTransactions(indexInState);
    }
  }

  convertBudgetItemsToTransactions(deleteItemIndex = -1) {
    let fullTransactionSetCopy = this.state.fullTransactionSet.slice();
    // GET ALL BUDGET TEMPLATE ITEMS FOR THE CURRENT MONTH
    let budgetTempateItems = fullTransactionSetCopy.filter( transaction => {
      return( !transaction.hasOwnProperty('id') &&
      transaction.day.getMonth() === this.state.selectedMonth &&
      transaction.day.getFullYear() === this.state.selectedYear &&
      transaction.key !== parseInt(deleteItemIndex)); // <--IF AN ITEM IS BEING DELETED
    });
    // CONVERT DATE STRING TO ACTUAL DATE OBJECT, AND CHANGE ALL AMOUNTS TO ABSOLUTE NUMBERS
    budgetTempateItems.map( transaction => {
      transaction.day = new Date(transaction.day);
      transaction.amount = Math.abs(currency(transaction.amount).value);
    });
    axios.post('/api/transactions', {transactionsArray: budgetTempateItems}).then( transactions => {
      axios.get('/api/transactions').then( allTransactions => {
        let parsedTransactions = allTransactions.data.map( transaction => {
          let multiplier = transaction.type === 'income' ? 1 : -1;
          transaction.amount = currency(transaction.amount).multiply(multiplier).value;
          return transaction;
        });
        this.setState({
          transactions: parsedTransactions,
        }, () => this.putTransactionsInState());
      })
    })
  }
  
  // =========================================== ADD ===========================================
  addTransaction(target) {
    // THE ID PROPERTY OF NEW TRANSACTIONS EQUALS THE DATE OF THE TRANSACTIONS. ID WILL BE USED AS THE DATE TO SEND TO THE SERVER
    let id = target.id.substring(0, target.id.indexOf('-add-button'));
    let newTransactions = this.state.newTransactions.slice();
    let transactionToAdd = newTransactions.splice(this.getNewTransactionIndex(id),1)[0];

    if(!this.currentMonthHasTransactions()) {
      this.convertBudgetItemsToTransactions();
    };

    axios.post('/api/transaction', transactionToAdd).then( response => {
      let transactionsCopy = this.state.transactions.slice();
      let addedTransaction = response.data[0];
      addedTransaction.amount = addedTransaction.type === 'income' ? addedTransaction.amount : currency(addedTransaction.amount).multiply(-1).value;
      transactionsCopy.push(addedTransaction);
      this.setState({
        transactions: transactionsCopy,
        newTransactions: newTransactions,
      }, () => this.putTransactionsInState())
    }).catch( err => console.log('addTransactionView.js addTransaction err: ', err));
  }
  
  toggleTableRowVisibility(target) {
    let id = target.id.replace('-header-row', '');
    let contentContainer = document.getElementById(id + '-content-container');
    
    // 'transaction-row-content-container'
    let contentContainerClassList = contentContainer.className.split(' ');

    if(contentContainerClassList.indexOf('row-showing') !== -1) {
      contentContainerClassList.splice(contentContainerClassList.indexOf('row-showing'), 1, 'row-hidden');
      contentContainer.className = contentContainerClassList.join(' ');
    } else if(contentContainerClassList.indexOf('row-hidden') !== -1) {
      contentContainerClassList.splice(contentContainerClassList.indexOf('row-hidden'), 1, 'row-showing');
      contentContainer.className = contentContainerClassList.join(' ');
    }
  }

  toggleEntryRowVisibility(dayID) {
    let entryRow = document.getElementById(dayID + '-entry-row');
    let toggleButton = document.getElementById(dayID + '-toggle-entry-row-button');

    let entryRowClassList = entryRow.className.split(' ');

    let index = entryRowClassList.indexOf('row-hidden');
    
    if(index !== -1) {
      entryRowClassList.splice(entryRowClassList.indexOf('row-hidden'),1)
      entryRow.className = entryRowClassList.join(' ');
      toggleButton.innerText = 'Cancel';
      toggleButton.className = 'hide-fields'
    } else {
      entryRowClassList.push('row-hidden');
      entryRow.className = entryRowClassList.join(' ');
      toggleButton.innerText = '+ Add Transaction';
      toggleButton.className = 'show-fields'
    }
  }
  toggleRowButtonsVisibility(dayID) {
    let buttonContainer = document.getElementById(dayID + '-buttons');
    let buttonContainerClassList = buttonContainer.className.split(' ');

    let index = buttonContainerClassList.indexOf('row-hidden');
    
    if(index !== -1) {
      buttonContainerClassList.splice(buttonContainerClassList.indexOf('row-hidden'),1)
      buttonContainer.className = buttonContainerClassList.join(' ');
    } else {
      buttonContainerClassList.push('row-hidden');
      buttonContainer.className = buttonContainerClassList.join(' ');
    }
  }
  
  render() {
    let transactions = this.populateTransactionsByMonth();
    let monthYearHeader = `${monthNames[this.state.selectedMonth]} ${this.state.selectedYear}`

    return (
      <div className='add-transactions-component'>
        <Header />
        <div className='add-transactions-header'><h1>{monthYearHeader}</h1></div>
        <div className='month-navigation-buttons-container top-buttons'>
          <button onClick={this.previousMonth}><i className="fas fa-chevron-circle-left"></i><span>Previous Month</span></button>
          <button onClick={this.currentMonth}>Current Month</button>
          <button onClick={this.nextMonth}><i className="fas fa-chevron-circle-right"></i><span>Next Month</span></button>
        </div>
        <div className='transaction-table-container'>
          <div className='transaction-table-header-container'>
            <div className='transaction-table-header'>
              <div className='transaction-table-date-column'><span>Date</span></div>
              <div className='transaction-table-week-day-column'><span>Day</span></div>
              <div className='transaction-table-balance-column'><span>Balance</span></div>
              <div className='transaction-table-name-column'><span>Name</span></div>
              <div className='transaction-table-amount-column'><span>Amount</span></div>
            </div>
          </div>
          {transactions}
        </div>
        <div className='month-navigation-buttons-container bottom-buttons'>
          <button onClick={this.previousMonth}><i className="fas fa-chevron-circle-left"></i><span>Previous Month</span></button>
          <button onClick={this.currentMonth}>Current Month</button>
          <button onClick={this.nextMonth}><i className="fas fa-chevron-circle-right"></i><span>Next Month</span></button>
        </div>
      </div>
    )
  }
}