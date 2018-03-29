import React, { Component } from 'react';
import axios from 'axios';
import DateFunctions from './../helpers/DateFunctions';
import DaySelectorByWeek from './dateComponents/DaySelectorByWeek';
import DaySelectorByMonth from './dateComponents/DaySelectorByMonth';
import Header from './Header';
import categories from './../helpers/categories';
import currency from 'currency.js';
import _ from 'lodash';
import index from 'axios';

const lables = {
  DAY: 'a Day',
  WEEK: 'a Week',
  MONTH: 'a Month',
  YEAR: 'a Year',
  EOW: 'every other week',
  XDAYS: '',
}
const dayAdjectives = {
  DAY: 'Daily',
  WEEK: 'Weekly',
  MONTH: 'Monthly',
  YEAR: 'Anually',
  EOW: 'Every Other Week',
  XDAYS: 'Every So Many Days',
}

const WEEK = 'WEEK';
const MONTH = 'MONTH';
const EOW = 'EOW';
const XDAYS = 'XDAYS';

export default class CreateBudgetView extends Component {
  constructor() {
    super();
    this.state = {
      currentBill: {
        name: '',
        amount: '',
        frequencyType: MONTH,
        startDate: '',
        endDate: '',
        category: '',
        subCategory: '',
        frequencyDays: [],
      },
      bills: [],
      incomeSources: [],
      currentIncomeSource: {
        name: '',
        amount: '',
        frequencyType: WEEK,
        startDate: '',
        frequencyDays: []
      },
      balanceInfo: {
        date: new Date(),
        amount: 0,
      },
      saveButtonIsDisabled: true
    }
    // ======================== BILL METHODS ===============================
    this.updateCurrentBillValues = this.updateCurrentBillValues.bind(this);
    this.addCurrentBillToBillList = this.addCurrentBillToBillList.bind(this);
    this.getCurrentBillDefaults = this.getCurrentBillDefaults.bind(this);
    this.updateSelectedBillDays = this.updateSelectedBillDays.bind(this);
    this.changeCurrentBill = this.changeCurrentBill.bind(this);
    this.getBillsListForSelectTag = this.getBillsListForSelectTag.bind(this);
    this.deleteCurrentBill = this.deleteCurrentBill.bind(this);
    this.resetBillFields = this.resetBillFields.bind(this);
    // ======================== INCOME METHODS ===============================
    this.updateSelectedIncomeDays = this.updateSelectedIncomeDays.bind(this);
    this.updateCurrentIncomeValues = this.updateCurrentIncomeValues.bind(this);
    this.getCurrentIncomeDefaults = this.getCurrentIncomeDefaults.bind(this);
    this.addCurrentIncomeSourceToIncomeSources = this.addCurrentIncomeSourceToIncomeSources.bind(this);
    this.resetIncomeFields = this.resetIncomeFields.bind(this);
    this.deleteCurrentIncomeSource = this.deleteCurrentIncomeSource.bind(this);
    // ====================== INCOME AND BILL METHODS ==========================
    this.saveBudgetTemplate = this.saveBudgetTemplate.bind(this);
    //======================= CATEGORY METHODS =================================
    this.getCategories = this.getCategories.bind(this);
    this.getSubCategories = this.getSubCategories.bind(this);
    //======================= BALANCE METHODS =================================
    this.updateCurrentBalanceValues = this.updateCurrentBalanceValues.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentDidMount() {
    axios.get('/api/user-data').then( userInfo => {
      axios.get('/api/income').then( incomeSources => {
        axios.get('/api/bills').then( bills => {
          axios.get('/api/balance').then( balanceInfo => {
            let incomeSourcesWithFrequencies = [];
            // LOOP THROUGH EACH INCOME SOURCE THAT COMES OVER
            for(let i = 0; i < incomeSources.data.length; i++) {
              const { amount, income_id, day_num, frequency_type, id, name, start_date } = incomeSources.data[i];
              let index = incomeSourcesWithFrequencies.findIndex(income => income.name === name);
              // CHECK IF THE BILL HAS ALREADY BEEN ADDED TO incomeSourcesWithFrequencies
              if(index === -1) {
                // IF THE BILL IS NOT ALREADY IN THE ARRAY incomeSourcesWithFrequencies, ADD IT
                incomeSourcesWithFrequencies.push({name, amount, frequencyType: frequency_type, startDate: DateFunctions.formatDate(new Date(start_date)), frequencyDays: [day_num]});
              } else {
                // IF THE BILL IS ALREADY IN THE ARRAY, JUST ADD THE day_num TO THE frequencyDays FOR THAT BILL.
                incomeSourcesWithFrequencies[index].frequencyDays.push(day_num);
              }
            }

            let billsWithFrequencies = [];
            // LOOP THROUGH EACH BILL THAT COMES OVER
            for(let i = 0; i < bills.data.length; i++) {
              const { amount, bill_id, category, sub_category, day_num, end_date, frequency_type, id, name, start_date } = bills.data[i];
              let index = billsWithFrequencies.findIndex(bill => bill.name === name);
              // CHECK IF THE BILL HAS ALREADY BEEN ADDED TO billsWithFrequencies
              if(index === -1) {
                // IF THE BILL IS NOT ALREADY IN THE ARRAY billsWithFrequencies, ADD IT
                billsWithFrequencies.push({name, amount, frequencyType: frequency_type, startDate: DateFunctions.formatDate(new Date(start_date)), endDate: end_date, category, subCategory: sub_category, frequencyDays: [day_num]});
              } else {
                // IF THE BILL IS ALREADY IN THE ARRAY, JUST ADD THE day_num TO THE frequencyDays FOR THAT BILL.
                billsWithFrequencies[index].frequencyDays.push(day_num);
            }
            }
            let balanceData = balanceInfo.data;
            balanceData.date = DateFunctions.formatDate(new Date(balanceData.date));
            
            window.addEventListener('scroll', this.handleScroll);

            this.setState({
              bills: billsWithFrequencies,
              currentBill: this.getCurrentBillDefaults(),
              incomeSources: incomeSourcesWithFrequencies,
              currentIncomeSource: this.getCurrentIncomeDefaults(),
              balanceInfo: balanceData,
            })
          }).catch( err => console.log('createbudgetview.js - get balance err: ', err));
        }).catch( err => console.log('createbudgetview.js - get bills err: ', err));
      }).catch( err => console.log('createbudgetview.js - get income err: ', err));
    }).catch( err => {
      console.log('createbudgetview.js - get user-data err: ', err);
      this.props.history.push('/');
    });
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  enableSaveBudgetButton() {
    // ENABLE THE SAVE BUDGET BUTTON
    this.setState({
      saveButtonIsDisabled: false
    })
  }
  handleScroll(event) {
    let scrollTop = event.srcElement.body.scrollTop,
      itemTranslate = Math.min(0, scrollTop/3 - 60);
    let buttonContainer = document.getElementById('save-budget-button');
    let containerClassList = buttonContainer.className.split(' ');
    let index = containerClassList.indexOf('sticky-container');

    if(window.pageYOffset > 85) {
      if(index === -1) {
        containerClassList.push('sticky-container');
        buttonContainer.className = containerClassList.join(' ');
      }
    } else {
      if(index !== -1) {
        containerClassList.splice(index, 1);
        buttonContainer.className = containerClassList.join(' ');
      }
    }
  }

  getCurrentBillDefaults() {
    return {
      name: '',
      amount: 0,
      frequencyType: MONTH,
      startDate: null,
      endDate: null,
      category: '',
      subCategory: '',
      frequencyDays: [],
    }
  }

  getCurrentIncomeDefaults() {
    return {
        name: '',
        amount: 0,
        frequencyType: WEEK,
        startDate: null,
        frequencyDays: [],
    }
  }

  saveBudgetTemplate() {
    console.log('clicked');
    axios.get('/api/user-data').then( userInfo => {
      axios.post('/api/balance', { ...this.state.balanceInfo }).then( response => {
        console.log('post bills successful');
      }).catch( err => console.log('createbudgetview.js - error posting balance: ', err));

      // if(this.state.bills.length) {
        axios.post('/api/bills', { bills: this.state.bills }).then( response => {
          console.log('post bills successful');
        }).catch( err => console.log('createbudgetview.js - error posting bills: ', err));
      // }

      // if(this.state.incomeSources.length) {
        axios.post('/api/income', { income: this.state.incomeSources }).then( response => {
          console.log('post income successful');
        }).catch( err => console.log('createbudgetview.js - error posting income: ', err));
      // }

      this.setState({
        saveButtonIsDisabled: true
      });

    }).catch( err => {
      console.log('createbudgetview.js(saveBudgetTemplate) get user-data err: ', err);
      this.props.history.push('/');
    });
  }

  updateCurrentBillValues(e) {
    let currentBillCopy = Object.assign({}, this.state.currentBill);
    let prop = e.target.id.replace('bill-', '');

    if(prop === 'amount') {
      currentBillCopy[prop] = e.target.value.replace(/-/g, '');
    } else {
      currentBillCopy[prop] = e.target.value;
    }
    // IF THE FREQUENCY TYPE IS BEING CHANGE, RESET THE FREQUENCY DAYS
    if(prop === 'frequencyType') {
      currentBillCopy.frequencyDays = []
    }
    this.enableSaveBudgetButton();
    this.setState({ currentBill: currentBillCopy });
  }
  updateCurrentIncomeValues(e) {
    let currentIncomeSourceCopy = Object.assign({}, this.state.currentIncomeSource);
    let prop = e.target.id.replace('income-', '');
    if(prop === 'amount') {
      currentIncomeSourceCopy[prop] = e.target.value.replace(/-/g, '');
    } else {
      currentIncomeSourceCopy[prop] = e.target.value;
    }
    // IF THE FREQUENCY TYPE IS BEING CHANGE, RESET THE FREQUENCY DAYS
    if(prop === 'frequencyType') {
      currentIncomeSourceCopy.frequencyDays = []
    }
    this.enableSaveBudgetButton();
    this.setState({ currentIncomeSource: currentIncomeSourceCopy });
  }
  updateCurrentBalanceValues(e) {
    let balanceInfo = { ...this.state.balanceInfo };
    let prop = e.target.id.replace('balance-', '');
    let val = prop === 'amount' ? currency(e.target.value).value : new Date(e.target.value);
    balanceInfo[prop] = e.target.value;
    this.enableSaveBudgetButton();
    this.setState({ balanceInfo });
  }

  // WHEN SELECTING A BILL FROM THE BILLS LIST
  changeCurrentBill(id) {
    // GET A COPY OF THE BILL OBJECT, AND SET IT AS THE currentBill OBJECT IN STATE
    let billsCopy = this.state.bills.slice();
    // REMOVE ALL LETTERS TO GET ID
    id = parseInt(id.replace(/\D/g, ''));
    let newCurrentBill = billsCopy.splice(id, 1)[0];
    // ADD AN ID THAT WILL REPRESENT THE BILL'S INDEX IN THE BILLS ARRAY.
    // THIS PROPERTY IS DELETED BEFORE THE BILL IS ADDED BACK TO THE BILLS ARRAY.
    newCurrentBill.id = id;

    console.log('id: ', id, 'newCurrentBill: ', newCurrentBill);
    this.setState({
      currentBill: newCurrentBill,
    })
  }

  // WHEN SELECTING AN INCOME FROM THE INCOMESOURCES LIST
  changeCurrentIncomeSource(id) {
    // GET A COPY OF THE INCOME OBJECT, AND SET IT AS THE currentIncomeSource OBJECT IN STATE
    let incomeSourcesCopy = this.state.incomeSources.slice();
    // REMOVE ALL LETTERS TO GET ID
    id = parseInt(id.replace(/\D/g, ''));
    let newCurrentIncomeSource = incomeSourcesCopy.splice(id, 1)[0];
    // ADD AN ID THAT WILL REPRESENT THE INCOME SOURCE'S INDEX IN THE INCOMESOURCES ARRAY.
    // THIS PROPERTY IS DELETED BEFORE THE INCOMESOURCE IS ADDED BACK TO THE ARRAY
    newCurrentIncomeSource.id = id;

    console.log('id: ', id, 'newCurrentIncomeSource: ', newCurrentIncomeSource);
    this.setState({
      currentIncomeSource: newCurrentIncomeSource,
    })
  }

  getBillsListForSelectTag(){
    if(this.state.bills.length) {
      let bills = this.state.bills.map( (bill, index) => {
        return (
          <option value={'bill_' + index}>{bill.name}</option>
        )
      })
      return bills;
    } 
  }

  getIncomeSourcesForSelectTag(){
    if(this.state.incomeSources.length) {
      let incomeSources = this.state.incomeSources.map( (incomeSource, index) => {
        return (
          <option value={'incomeSource_' + index}>{incomeSource.name}</option>
        )
      })
      return incomeSources;
    } 
  }

  addCurrentBillToBillList() {
    let updatedBills = this.state.bills.slice();
    let currentBillCopy = { ...this.state.currentBill };

    const { name, amount, frequencyDays, frequencyType, startDate } = currentBillCopy;
    switch('') {
      case name:
        window.alert('Each Bill must have a Name, and it must be unique!');
        document.getElementById('bill-name').focus();
        return;
      case amount:
        window.alert('Each Bill must have an Amount!');
        document.getElementById('bill-amount').focus();
        return;
      case startDate:
        window.alert('Each Bill must have a Start Date!');
        document.getElementById('bill-startDate').focus();
      default: break;
    }
    if(!frequencyDays.length && (frequencyType === WEEK || frequencyType === MONTH)) {
          window.alert('Please select at least 1 day for the frequency!');
          document.getElementById('bill-selector').focus();
          return;
    }

    if(currentBillCopy.hasOwnProperty('id')) {
      let id = currentBillCopy.id;
      delete currentBillCopy.id;
      updatedBills.splice(id, 1, currentBillCopy)
    } else {
      updatedBills.push(this.state.currentBill);
    }
    this.setState({
      currentBill: this.getCurrentBillDefaults(),
      bills: updatedBills
    })
  }

  addCurrentIncomeSourceToIncomeSources() {
    let updatedIncomeSources = this.state.incomeSources.slice();
    let currentIncomeSourceCopy = { ...this.state.currentIncomeSource };

    const { name, amount, frequencyDays, frequencyType, startDate } = currentIncomeSourceCopy;
    if(name === '') {
      window.alert('Each Income Source must have a Name, and it must be unique!');
      document.getElementById('income-name').focus();
      return;
    }
    if(amount === '' || amount === 0) {
      window.alert('Each Income Source must have an Amount!');
      document.getElementById('income-amount').focus();
      return;
    }
    if(startDate === null) {
      window.alert('Each Income Source must have a Start Date!');
      document.getElementById('income-startDate').focus();
      return;
    }
      
    if(!frequencyDays.length && (frequencyType === WEEK || frequencyType === MONTH)) {
          window.alert('Please select at least 1 day for the frequency!');
          document.getElementById('income-selector').focus();
          return;
    }
    
    if(currentIncomeSourceCopy.hasOwnProperty('id')) {
      let id = currentIncomeSourceCopy.id;
      delete currentIncomeSourceCopy.id;
      updatedIncomeSources.splice(id, 1, currentIncomeSourceCopy)
    } else {
      updatedIncomeSources.push(this.state.currentIncomeSource);
    }
    this.setState({
      currentIncomeSource: this.getCurrentIncomeDefaults(),
      incomeSources: updatedIncomeSources
    })
  }

  deleteCurrentBill() {
    let currentBillCopy = { ...this.state.currentBill };
    if(currentBillCopy.hasOwnProperty('id')) {
      let updatedBills = this.state.bills.slice();
      updatedBills.splice(currentBillCopy.id, 1);
      this.enableSaveBudgetButton();
      this.setState({
        currentBill: this.getCurrentBillDefaults(),
        bills: updatedBills,
      });
    } else {
      this.enableSaveBudgetButton();
      this.setState({
        currentBill: this.getCurrentBillDefaults(),
      });
    }
  }

  deleteCurrentIncomeSource() {
    let currentIncomeSourceCopy = { ...this.state.currentIncomeSource };
    if(currentIncomeSourceCopy.hasOwnProperty('id')) {
      let updatedIncomeSources = this.state.incomeSources.slice();
      updatedIncomeSources.splice(currentIncomeSourceCopy.id, 1);
      this.enableSaveBudgetButton();
      this.setState({
        currentIncomeSource: this.getCurrentIncomeDefaults(),
        incomeSources: updatedIncomeSources,
      });
    } else {
      this.enableSaveBudgetButton();
      this.setState({
        currentIncomeSource: this.getCurrentIncomeDefaults(),
      });
    }
  }

  resetBillFields() {
    this.setState({
      currentBill: this.getCurrentBillDefaults(),
    })
  }

  resetIncomeFields() {
    this.setState({
      currentIncomeSource: this.getCurrentIncomeDefaults(),
    })
  }

  updateSelectedBillDays(target) {
    const { id } = target;
    const dayNum = parseInt(id.replace(/\D/g, '')); // ID OF THE INPUTS INCLUDE LETTERS - THIS STRIPS ALL NON-NUMERIC CHARACTERS
    const currentBillCopy = {...this.state.currentBill};

    if(id !== 'every-x-days') {
    const index = currentBillCopy.frequencyDays.indexOf(dayNum);
    index === -1 ? currentBillCopy.frequencyDays.push(dayNum) : currentBillCopy.frequencyDays.splice(index, 1);
    } else {
      currentBillCopy.frequencyDays[0] = target.value;
    }
    // ENABLE THE SAVE BUDGET BUTTON
    let buttonContainer = document.getElementById('save-budget-button');
    buttonContainer.disabled = false;
    this.setState({
      currentBill: currentBillCopy
    })
  }

  updateSelectedIncomeDays(target) {
    const { id } = target;
    const currentIncomeSourceCopy = {...this.state.currentIncomeSource};
    const dayNum = parseInt(id.replace(/\D/g, '')); // ID OF THE INPUTS INCLUDE LETTERS - THIS STRIPS ALL NON-NUMERIC CHARACTERS
    
    if(id !== 'every-x-days') {
      const index = currentIncomeSourceCopy.frequencyDays.indexOf(dayNum);
      index === -1 ? currentIncomeSourceCopy.frequencyDays.push(dayNum) : currentIncomeSourceCopy.frequencyDays.splice(index, 1);
    } else {
      currentIncomeSourceCopy.frequencyDays[0] = target.value;
    }
    // ENABLE THE SAVE BUDGET BUTTON
    let buttonContainer = document.getElementById('save-budget-button');
    buttonContainer.disabled = false;
    this.setState({
      currentIncomeSource: currentIncomeSourceCopy
    })
  }

  getDaySelectorComponent(id) {
    if(id === 'currentBill') {
      switch(this.state.currentBill.frequencyType) {
        case WEEK:
          return <DaySelectorByWeek selectorSection='bill' selectedDays={this.state.currentBill.frequencyDays} updateDays={this.updateSelectedBillDays}/>
        case MONTH:
          return <DaySelectorByMonth selectorSection='bill' selectedDays={this.state.currentBill.frequencyDays} updateDays={this.updateSelectedBillDays}/>;
        case XDAYS:
          return <input placeholder='enter number of days' id='every-x-days' className='every-x-days-input' type='number' value={this.state.currentBill.frequencyDays[0]} onChange={e => this.updateSelectedBillDays(e.target)}></input>;
        default: return null;
      }
    } else if(id === 'currentIncomeSource') {
      switch(this.state.currentIncomeSource.frequencyType) {
        case WEEK:
          return <DaySelectorByWeek selectorSection='income' selectedDays={this.state.currentIncomeSource.frequencyDays} updateDays={this.updateSelectedIncomeDays}/>
        case MONTH:
          return <DaySelectorByMonth selectorSection='income' selectedDays={this.state.currentIncomeSource.frequencyDays} updateDays={this.updateSelectedIncomeDays}/>;
        case XDAYS:
          return <div><input placeholder='enter number of days' id='every-x-days' className='every-x-days-input' type='number' value={this.state.currentIncomeSource.frequencyDays[0]} onChange={e => this.updateSelectedIncomeDays(e.target)}></input></div>;
        default: return null;
      }
    }
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
    let subCategories = categories[this.state.currentBill.category];
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
    const expenseDaySelector = this.getDaySelectorComponent('currentBill');
    const incomeDaySelector = this.getDaySelectorComponent('currentIncomeSource');
    const bills = this.getBillsListForSelectTag();
    const incomeSources = this.getIncomeSourcesForSelectTag();

    return (
      <div className='create-budget-component'>
      <Header />
        <div className='create-budget-title'>
          <h1>My Budget Template</h1>
        </div>
        <div id='save-budget-button-container' className='save-budget-button-container'>
          <button id='save-budget-button' className='save-budget-button' disabled={this.state.saveButtonIsDisabled} onClick={this.saveBudgetTemplate}>Save Budget Template</button>
        </div>
        <div className='balance-entry-container entry-container'>
          <h2>Starting Balance</h2>
          <div>
            <label>Amount</label>
            <input id='balance-amount' type='number' className='create-balance-field' value={this.state.balanceInfo.amount} onChange={ e => this.updateCurrentBalanceValues(e)}></input>
          </div>
          <div>
            <label>Start Date</label>
            <input id='balance-date' type='date' className='create-balance-field' value={this.state.balanceInfo.date} onChange={ e => this.updateCurrentBalanceValues(e)}></input>
          </div>
        </div>

        <hr/>
        
        <div className='income-entry-container entry-container'>
          <h2>Income</h2>
          <div>
            <label>Income Name</label>
            <input id='income-name' className='create-income-field' value={this.state.currentIncomeSource.name} onChange={ e => this.updateCurrentIncomeValues(e)}></input>
          </div>
          <div>
            <label>Amount</label>
            <input id='income-amount' type='number' className='create-income-field' value={this.state.currentIncomeSource.amount} onChange={ e => this.updateCurrentIncomeValues(e)}></input>
          </div>
          <div>
            <label>How often do you receive this income?</label>
            <select id='income-frequencyType' value={this.state.currentIncomeSource.frequencyType} onChange={ e => this.updateCurrentIncomeValues(e)}> 
              <option value={WEEK}>{dayAdjectives.WEEK}</option>
              <option value={MONTH}>{dayAdjectives.MONTH}</option>
              <option value={EOW}>{dayAdjectives.EOW}</option>
              <option value={XDAYS}>{dayAdjectives.XDAYS}</option>
            </select>
          </div>
          {incomeDaySelector && incomeDaySelector}
          <div>
            <label>Start Date</label>
            <input id='income-startDate' type='date' className='create-income-field' value={this.state.currentIncomeSource.startDate} onChange={ e => this.updateCurrentIncomeValues(e)}></input>
          </div>
          <div className='summary-management-container'>
            <div className='budget-buttons-container bill-buttons-container'>
              <button onClick={this.addCurrentIncomeSourceToIncomeSources}>Add Income</button>
              <button onClick={this.deleteCurrentIncomeSource}>Delete Income</button>
              <button onClick={this.resetIncomeFields}>Clear Fields</button>
            </div>
            <div className='income-list-container list-container'>
              <label htmlFor='income-list'>Income List</label>
              <select id='income-list' className='income-list budget-list' size={1 + this.state.incomeSources.length} onChange={e => this.changeCurrentIncomeSource(e.target.value)} onClick={e => this.changeCurrentIncomeSource(e.target.value)}>
                {incomeSources && incomeSources}
              </select>
            </div>
          </div>
        </div>
        
        <hr />

        <div className='bills-entry-container entry-container'>
          <h2>Expenses</h2>
          <div>
            <label>Name</label>
            <input id='bill-name' className='create-budget-field' value={this.state.currentBill.name} onChange={ e => this.updateCurrentBillValues(e)}></input>
          </div>
          <div>
            <label>Amount</label>
            <input id='bill-amount' type='number' className='create-budget-field' value={this.state.currentBill.amount} onChange={ e => this.updateCurrentBillValues(e)}></input>
          </div>
          <div>
            <label>How Often Does this Bill Occur?</label>
            <select id='bill-frequencyType' value={this.state.currentBill.frequencyType} onChange={ e => this.updateCurrentBillValues(e)}> 
              <option value={WEEK}>{dayAdjectives.WEEK}</option>
              <option value={MONTH}>{dayAdjectives.MONTH}</option>
              <option value={EOW}>{dayAdjectives.EOW}</option>
              <option value={XDAYS}>{dayAdjectives.XDAYS}</option>
            </select>
          </div>
          <div>
            {expenseDaySelector && expenseDaySelector}
          </div>
          <div>
            <label>Start Date</label>
            <input id='bill-startDate' type='date' className='create-budget-field' value={this.state.currentBill.startDate} onChange={ e => this.updateCurrentBillValues(e)}></input>
          </div>
          <div>
            <label>End Date</label>
            <input id='bill-endDate' type='date' className='create-budget-field' value={this.state.currentBill.endDate} onChange={ e => this.updateCurrentBillValues(e)}></input>
          </div>
          <div className='category-container'>
            <label>Category</label>
            <select id='bill-category' className='create-budget-field category category-select' value={this.state.currentBill.category} onChange={ e => this.updateCurrentBillValues(e)}>
              <option selected> -- select an option -- </option>
              {this.getCategories()}
            </select>
            <select id='bill-subCategory' className='create-budget-field category sub-category-select' value={this.state.currentBill.subCategory} onChange={ e => this.updateCurrentBillValues(e)}>
              <option selected> -- select an option -- </option>
              {this.getSubCategories()}
            </select>
          </div>
          <div className='summary-management-container'>
            <div className='budget-buttons-container bill-buttons-container'>
              <button onClick={this.addCurrentBillToBillList}>Add Bill</button>
              <button onClick={this.deleteCurrentBill}>Delete Bill</button>
              <button onClick={this.resetBillFields}>Clear Fields</button>
            </div>
            <div className='bills-list-container list-container'>
              <label htmlFor='bill-list'>Bill List</label>
              <select id='bill-list' className='bills-list budget-list' size={1 + this.state.bills.length}  onChange={e => this.changeCurrentBill(e.target.value)} onClick={e => this.changeCurrentBill(e.target.value)}>
                {bills && bills}
              </select>
            </div>
          </div>
        </div>
      </div>
    )
  }
}