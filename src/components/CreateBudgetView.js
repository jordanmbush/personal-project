import React, { Component } from 'react';
import axios from 'axios';
import { Database } from '../../../../AppData/Local/Microsoft/TypeScript/2.6/node_modules/@types/massive';


{/* <option>Daily</option>
<option>Weekly</option>
<option>Every Other Week</option>
<option>Monthly</option>
<option>Anually</option>
<option>Every so many days...</option> */}

const frequencyNames = {
  Daily: 'a Day',
  Weekly: 'a Week',
  Monthly: 'a Month',
  'Every Other Week': 'every other week',
  'Every so many days...': '',
  Anually: 'a Year',
}
export default class CreateBudgetView extends Component {
  constructor() {
    super();
    this.state = {
      currentBill: {
        name: '',
        amount: '',
        frequencyType: 'Monthly',
        frequencyValue: 0,
        startDate: '',
        endDate: '',
        category: '',
      },
      bills: [],
    }
    this.updateCurrentBill = this.updateCurrentBill.bind(this);
    this.addBill = this.addBill.bind(this);
    this.saveBillList = this.saveBillList.bind(this);  

  }

  saveBillList() {
    axios.post('/api/bills', { bills: this.state.bills }).then( response => {
      console.log('post bills successful');
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
      currentBill: {
        name: '',
        amount: '',
        frequencyType: '',
        frequencyValue: 0,
        startDate: '',
        endDate: '',
        category: '',
      },
      bills: updatedBills
    })
  }
  
  render() {

    const bills = this.getBillsList();

    return (
      <div className='create-budget'>
        <div className='create-budget-title'>
        </div>
        <div className='create-budget-entry-fields-container'>
          <div className='create-budget-entry-container'>
            <label>Name</label>
            <input id='name' className='create-budget-field' value={this.state.currentBill.name} onChange={ e => this.updateCurrentBill(e)}></input>
          </div>
          <div className='create-budget-entry-container'>
            <label>Amount</label>
            <input id='amount' type='number' className='create-budget-field' value={this.state.currentBill.amount} onChange={ e => this.updateCurrentBill(e)}></input>
          </div>
          <div className='create-budget-entry-container'>
            <label>How Often Does this Bill Occur?</label>
            <select id='frequencyType' value={this.state.currentBill.frequencyType} onChange={ e => this.updateCurrentBill(e)}> 
              <option>Daily</option>
              <option>Weekly</option>
              <option>Every Other Week</option>
              <option>Monthly</option>
              <option>Anually</option>
              <option>Every so many days...</option>
            </select>
          </div>
          <div className='create-budget-entry-container'>
            <label>{`How many times ${frequencyNames[this.state.currentBill.frequencyType]}?`}</label>
            <input id='frequencyValue' className='create-budget-field' value={this.state.currentBill.frequencyValue} onChange={ e => this.updateCurrentBill(e)}></input>
          </div>
          <div className='create-budget-entry-container'>
            <label>Start Date</label>
            <input id='startDate' type='date' className='create-budget-field' value={this.state.currentBill.startDate} onChange={ e => this.updateCurrentBill(e)}></input>
          </div>
          <div className='create-budget-entry-container'>
            <label>End Date</label>
            <input id='endDate' type='date' className='create-budget-field' value={this.state.currentBill.endDate} onChange={ e => this.updateCurrentBill(e)}></input>
          </div>
          <div className='create-budget-entry-container'>
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
        <button onClick={this.saveBillList}>Save List</button>
      </div>
    )
  }
}