import React, { Component } from 'react';
import axios from 'axios';
import DateFunctions from './../helpers/DateFunctions';
import DaySelectorByWeek from './dateComponents/DaySelectorByWeek';
import DaySelectorByMonth from './dateComponents/DaySelectorByMonth';
import Header from './Header';

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

const DAY = 'DAY';
const WEEK = 'WEEK';
const MONTH = 'MONTH';
const YEAR = 'YEAR';
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
        startDate: DateFunctions.formatDate(new Date()),
        endDate: null,
        category: '',
        frequencyDays: [],
      },
      bills: [],
      incomeSources: [],
      currentIncomeSource: {
        name: '',
        amount: '',
        frequencyType: WEEK,
        startDate: DateFunctions.formatDate(new Date()),
        frequencyDays: []
      },
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
  }

  componentDidMount() {
    axios.get('/api/income').then( incomeSources => {
      console.log('income: ', incomeSources.data);
      let incomeSourcesWithFrequencies = [];
      // LOOP THROUGH EACH BILL THAT COMES OVER
      for(let i = 0; i < incomeSources.data.length; i++) {
        const { amount, income_id, day_num, frequency_type, id, name, start_date } = incomeSources.data[i];
        let index = incomeSourcesWithFrequencies.findIndex(income => income.name === name);
        // CHECK IF THE BILL HAS ALREADY BEEN ADDED TO incomeSourcesWithFrequencies
        if(index === -1) {
          // IF THE BILL IS NOT ALREADY IN THE ARRAY incomeSourcesWithFrequencies, ADD IT
          incomeSourcesWithFrequencies.push({name, amount, frequencyType: frequency_type, start_date, frequencyDays: [day_num]});
        } else {
          // IF THE BILL IS ALREADY IN THE ARRAY, JUST ADD THE day_num TO THE frequencyDays FOR THAT BILL.
          incomeSourcesWithFrequencies[index].frequencyDays.push(day_num);
       }
      }
      console.log('incomeSourcesWithFrequencies: ', incomeSourcesWithFrequencies);
      this.setState({
        incomeSources: incomeSourcesWithFrequencies,
        currentIncomeSource: this.getCurrentIncomeDefaults()
      })
      // DO THE AXIOS CALL FOR INCOME FIRST - DISPLAY THAT, THEN DISPLAY THE BILLS
      axios.get('/api/bills').then( bills => {
        console.log('bills: ', bills.data);
        let billsWithFrequencies = [];
        // LOOP THROUGH EACH BILL THAT COMES OVER
        for(let i = 0; i < bills.data.length; i++) {
          const { amount, bill_id, category, day_num, end_date, frequency_type, id, name, start_date } = bills.data[i];
          let index = billsWithFrequencies.findIndex(bill => bill.name === name);
          // CHECK IF THE BILL HAS ALREADY BEEN ADDED TO billsWithFrequencies
          if(index === -1) {
            // IF THE BILL IS NOT ALREADY IN THE ARRAY billsWithFrequencies, ADD IT
            billsWithFrequencies.push({name, amount, frequencyType: frequency_type, start_date, end_date, category, frequencyDays: [day_num]});
          } else {
            // IF THE BILL IS ALREADY IN THE ARRAY, JUST ADD THE day_num TO THE frequencyDays FOR THAT BILL.
            billsWithFrequencies[index].frequencyDays.push(day_num);
         }
        }
        console.log('billsWithFrequencies: ', billsWithFrequencies);
        this.setState({
          bills: billsWithFrequencies,
          currentBill: this.getCurrentBillDefaults()
        })
      }).catch( err => console.log('createbudgetview.js - get bills err: ', err));
    }).catch( err => console.log('createbudgetview.js - get income err: ', err));
  }
  
  getCurrentBillDefaults() {
    let d = new Date();
    let today = DateFunctions.formatDate(d);
    return {
        name: '',
        amount: 0,
        frequencyType: MONTH,
        startDate: today,
        endDate: null,
        category: 'Bills',
        frequencyDays: [],
    }
  }

  getCurrentIncomeDefaults() {
    let d = new Date();
    let today = DateFunctions.formatDate(d);
    return {
        name: '',
        amount: 0,
        frequencyType: WEEK,
        startDate: today,
        frequencyDays: [],
    }
  }

  saveBudgetTemplate() {
    if(this.state.bills.length) {
      axios.post('/api/bills', { bills: this.state.bills }).then( response => {
        console.log('post bills successful');
      }).catch( err => console.log('createbudgetview.js - error posting bills: ', err));
    }

    if(this.state.incomeSources.length) {
      axios.post('/api/income', { income: this.state.incomeSources }).then( response => {
        console.log('post income successful');
      }).catch( err => console.log('createbudgetview.js - error posting income: ', err));
    }
  }

  updateCurrentBillValues(e) {
    let currentBillCopy = Object.assign({}, this.state.currentBill);
    let id = e.target.id.replace('bill-', '');

    if(id === 'amount') {
      currentBillCopy[id] = e.target.value.replace(/-/g, '');
    } else {
      currentBillCopy[id] = e.target.value;
    }
    // IF THE FREQUENCY TYPE IS BEING CHANGE, RESET THE FREQUENCY DAYS
    if(id === 'frequencyType') {
      currentBillCopy.frequencyDays = []
    }

    this.setState({ currentBill: currentBillCopy });
  }

  updateCurrentIncomeValues(e) {
    let currentIncomeSourceCopy = Object.assign({}, this.state.currentIncomeSource);
    let id = e.target.id.replace('income-', '');
    if(id === 'amount') {
      currentIncomeSourceCopy[id] = e.target.value.replace(/-/g, '');
    } else {
      currentIncomeSourceCopy[id] = e.target.value;
    }
    // IF THE FREQUENCY TYPE IS BEING CHANGE, RESET THE FREQUENCY DAYS
    if(id === 'frequencyType') {
      currentIncomeSourceCopy.frequencyDays = []
    }

    this.setState({ currentIncomeSource: currentIncomeSourceCopy });
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
          <option id={'bill_' + index} onClick={ e => this.changeCurrentBill(e.target.id)}>{bill.name}</option>
        )
      })
      return bills;
    } 
  }

  getIncomeSourcesForSelectTag(){
    if(this.state.incomeSources.length) {
      let incomeSources = this.state.incomeSources.map( (incomeSource, index) => {
        return (
          <option id={'incomeSource_' + index} onClick={ e => this.changeCurrentIncomeSource(e.target.id)}>{incomeSource.name}</option>
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
    switch('') {
      case name:
        window.alert('Each Income Source must have a Name, and it must be unique!');
        document.getElementById('income-name').focus();
        return;
      case amount:
        window.alert('Each Income Source must have an Amount!');
        document.getElementById('income-amount').focus();
        return;
      case startDate:
        window.alert('Each Income Source must have a Start Date!');
        document.getElementById('income-startDate').focus();
      default: break;
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
      this.setState({
        currentBill: this.getCurrentBillDefaults(),
        bills: updatedBills,
      });
    } else {
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
      this.setState({
        currentIncomeSource: this.getCurrentIncomeDefaults(),
        incomeSources: updatedIncomeSources,
      });
    } else {
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

    const index = currentBillCopy.frequencyDays.indexOf(dayNum);
    index === -1 ? currentBillCopy.frequencyDays.push(dayNum) : currentBillCopy.frequencyDays.splice(index, 1);

    this.setState({
      currentBill: currentBillCopy
    })
  }

  updateSelectedIncomeDays(target) {
    const { id } = target;
    const dayNum = parseInt(id.replace(/\D/g, '')); // ID OF THE INPUTS INCLUDE LETTERS - THIS STRIPS ALL NON-NUMERIC CHARACTERS
    const currentIncomeSourceCopy = {...this.state.currentIncomeSource};

    const index = currentIncomeSourceCopy.frequencyDays.indexOf(dayNum);
    index === -1 ? currentIncomeSourceCopy.frequencyDays.push(dayNum) : currentIncomeSourceCopy.frequencyDays.splice(index, 1);

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
        default: return null;
      }
    } else if(id === 'currentIncomeSource') {
      switch(this.state.currentIncomeSource.frequencyType) {
        case WEEK:
          return <DaySelectorByWeek selectorSection='income' selectedDays={this.state.currentIncomeSource.frequencyDays} updateDays={this.updateSelectedIncomeDays}/>
        case MONTH:
          return <DaySelectorByMonth selectorSection='income' selectedDays={this.state.currentIncomeSource.frequencyDays} updateDays={this.updateSelectedIncomeDays}/>;
        default: return null;
      }
    }
  }
  
  render() {
    const expenseDaySelector = this.getDaySelectorComponent('currentBill');
    const incomeDaySelector = this.getDaySelectorComponent('currentIncomeSource');
    const bills = this.getBillsListForSelectTag();
    const incomeSources = this.getIncomeSourcesForSelectTag();

    return (
      <div className='create-budget'>
      <Header />
        <div className='create-budget-title'>
          <h1>Create A New Budget</h1>
        </div>
        <div className='income-entry-container'>
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
              <option value={DAY}>{dayAdjectives.DAY}</option>
              <option value={WEEK}>{dayAdjectives.WEEK}</option>
              <option value={MONTH}>{dayAdjectives.MONTH}</option>
              <option value={EOW}>{dayAdjectives.EOW}</option>
              <option value={YEAR}>{dayAdjectives.YEAR}</option>
              <option value={XDAYS}>{dayAdjectives.XDAYS}</option>
            </select>
          </div>
          {incomeDaySelector && incomeDaySelector}
          <div>
            <label>Start Date</label>
            <input id='income-startDate' type='date' className='create-income-field' value={this.state.currentIncomeSource.startDate} onChange={ e => this.updateCurrentIncomeValues(e)}></input>
          </div>
          <button onClick={this.addCurrentIncomeSourceToIncomeSources}>Add Income Source</button>
          <button onClick={this.deleteCurrentIncomeSource}>Delete Income Source</button>
          <button onClick={this.resetIncomeFields}>Clear Fields</button>
          <div className='income-list-container'>
            <select className='income-list' size={2 + this.state.incomeSources.length}>
              {incomeSources && incomeSources}
            </select>
          </div>
        </div>
        
        <hr />

        <div className='bills-entry-container'>
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
              <option value={DAY}>{dayAdjectives.DAY}</option>
              <option value={WEEK}>{dayAdjectives.WEEK}</option>
              <option value={MONTH}>{dayAdjectives.MONTH}</option>
              <option value={EOW}>{dayAdjectives.EOW}</option>
              <option value={YEAR}>{dayAdjectives.YEAR}</option>
              <option value={XDAYS}>{dayAdjectives.XDAYS}</option>
            </select>
          </div>
          {expenseDaySelector && expenseDaySelector}
          <div>
            <label>Start Date</label>
            <input id='bill-startDate' type='date' className='create-budget-field' value={this.state.currentBill.startDate} onChange={ e => this.updateCurrentBillValues(e)}></input>
          </div>
          <div>
            <label>End Date</label>
            <input id='bill-endDate' type='date' className='create-budget-field' value={this.state.currentBill.endDate} onChange={ e => this.updateCurrentBillValues(e)}></input>
          </div>
          <div>
            <label>Category</label>
            <input id='bill-category' className='create-budget-field' value={this.state.currentBill.category} onChange={ e => this.updateCurrentBillValues(e)}></input>
          </div>
        </div>
        <button onClick={this.addCurrentBillToBillList}>Add Bill</button>
        <button onClick={this.deleteCurrentBill}>Delete Bill</button>
        <button onClick={this.resetBillFields}>Clear Fields</button>
        <div className='bills-list-container'>
          <select className='bills-list' size={2 + this.state.bills.length}>
            {bills && bills}
          </select>
        </div>
        <button onClick={this.saveBudgetTemplate}>Save Budget Template</button>
      </div>
    )
  }
}