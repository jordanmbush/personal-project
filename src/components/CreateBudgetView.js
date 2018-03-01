import React, { Component } from 'react';
import axios from 'axios';
import DateFunctions from './../helpers/DateFunctions';
import DaySelectorByWeek from './dateComponents/DaySelectorByWeek';
import DaySelectorByMonth from './dateComponents/DaySelectorByMonth';

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
        frequencyValue: 0,
        startDate: DateFunctions.formatDate(new Date()),
        endDate: null,
        category: '',
        weekDays: [],
        monthDays: [],
      },
      bills: [],
    }
    this.updateCurrentBill = this.updateCurrentBill.bind(this);
    this.addBill = this.addBill.bind(this);
    this.saveBillList = this.saveBillList.bind(this);  
    this.getCurrentBillDefaults = this.getCurrentBillDefaults.bind(this);
    this.updateSelectedDays = this.updateSelectedDays.bind(this);
  }

  componentDidMount() {
    this.setState({
      currentBill: this.getCurrentBillDefaults()
    })
  }
  
  getCurrentBillDefaults() {
    // GET TODAY'S DATE FOR START DATE
    let d = new Date();
    let today = DateFunctions.formatDate(d);
    // -----------------------------------------
    return {
        name: '',
        amount: '',
        frequencyType: MONTH,
        frequencyValue: 1,
        startDate: today,
        endDate: null,
        category: 'Bills',
        weekDays: [],
        monthDays: [],
    }
  }

  saveBillList() {
    axios.post('/api/bills', { bills: this.state.bills }).then( response => {
      console.log('post bills successful');
      window.location = '/dashboard';
    }).catch( err => console.log('createbudgetview.js - error posting bills: ', err));
  }


  updateCurrentBill(e) {
    let currentBillCopy = Object.assign({}, this.state.currentBill);
    currentBillCopy[e.target.id] = e.target.value;

    this.setState({ currentBill: currentBillCopy });
  }

  getBillsList(){
    if(this.state.bills.length) {
      let bills = this.state.bills.map( bill => {
        return (
          <option id={bill.name}>{bill.name}</option>
        )
      })

      return bills;
    } else {
      return null;
    }
  }

  addBill() {
    let updatedBills = this.state.bills.slice();
    updatedBills.push(this.state.currentBill);

    this.setState({
      currentBill: this.getCurrentBillDefaults(),
      bills: updatedBills
    })
  }

  updateSelectedDays(target, arrayName) {
    const { id } = target;
    const dayOfWeekNum = parseInt(id.replace(/\D/g, '')); // ID OF THE INPUTS INCLUDE LETTERS - THIS STRIPS ALL NON-NUMERIC CHARACTERS
    const currentBillCopy = {...this.state.currentBill};
    let daysArr = currentBillCopy[arrayName];

    const index = daysArr.indexOf(dayOfWeekNum);
    index === -1 ? daysArr.push(dayOfWeekNum) : daysArr.splice(index, 1);

    this.setState({
      currentBill: currentBillCopy
    })
  }
  
  getDaySelector() {
    switch(this.state.currentBill.frequencyType) {
      case DAY:
        return '';
      case WEEK:
        return <DaySelectorByWeek selectedDays={this.state.currentBill.weekDays} updateDays={this.updateSelectedDays}/>
      case MONTH:
        return <DaySelectorByMonth selectedDays={this.state.currentBill.monthDays} updateDays={this.updateSelectedDays}/>;
      case YEAR:
        return '';
      case EOW:
        return '';
      case XDAYS:
        return '';
      default:
        return '';
    }
  }
  
  render() {
    const daySelector = this.getDaySelector();
    const bills = this.getBillsList();

    return (
      <div className='create-budget'>
        <div className='create-budget-title'>
        </div>
        <div className='bills-entry-container'>
          <div>
            <label>Name</label>
            <input id='name' className='create-budget-field' value={this.state.currentBill.name} onChange={ e => this.updateCurrentBill(e)}></input>
          </div>
          <div>
            <label>Amount</label>
            <input id='amount' type='number' className='create-budget-field' value={this.state.currentBill.amount} onChange={ e => this.updateCurrentBill(e)}></input>
          </div>
          <div>
            <label>How Often Does this Bill Occur?</label>
            <select id='frequencyType' value={this.state.currentBill.frequencyType} onChange={ e => this.updateCurrentBill(e)}> 
              <option value={DAY}>{dayAdjectives.DAY}</option>
              <option value={WEEK}>{dayAdjectives.WEEK}</option>
              <option value={MONTH}>{dayAdjectives.MONTH}</option>
              <option value={YEAR}>{dayAdjectives.YEAR}</option>
              <option value={EOW}>{dayAdjectives.EOW}</option>
              <option value={XDAYS}>{dayAdjectives.XDAYS}</option>
            </select>
          </div>
          {daySelector && daySelector}
          <div>
            <label>Start Date</label>
            <input id='startDate' type='date' className='create-budget-field' value={this.state.currentBill.startDate} onChange={ e => this.updateCurrentBill(e)}></input>
          </div>
          <div>
            <label>End Date</label>
            <input id='endDate' type='date' className='create-budget-field' value={this.state.currentBill.endDate} onChange={ e => this.updateCurrentBill(e)}></input>
          </div>
          <div>
            <label>Category</label>
            <input id='category' className='create-budget-field' value={this.state.currentBill.category} onChange={ e => this.updateCurrentBill(e)}></input>
          </div>
        </div>
        <button onClick={this.addBill}>Add Bill</button>
        <div className='bills-list-container'>
          <select className='bills-list' size={this.state.bills.length}>
            {bills && bills}
          </select>
        </div>
        <button onClick={this.saveBillList}>Create Budget Template</button>
      </div>
    )
  }
}