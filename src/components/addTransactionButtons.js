import React from 'react';

const NewTransactionButtons = ({dayID, isIncomeChecked, isExpenseChecked, setNewTransactionValue, addTransaction}) => {

  return (
    <div className='transaction-buttons-container button-fields entry-row'>
      <div className='income-radio radio-container entry-field'>
        <label htmlFor={dayID + '-radio-income'}>Income</label>
        <input id={dayID + '-radio-income'}  type='radio' name={`${dayID}-transaction-type`} checked={isIncomeChecked} onChange={e => setNewTransactionValue(e.currentTarget)}></input>
      </div>
      <div className='expense-radio radio-container entry-field'>
        <label htmlFor={dayID + '-radio-expense'}>Expense</label>
        <input id={dayID + '-radio-expense'} type='radio' name={`${dayID}-transaction-type`} checked={isExpenseChecked} onChange={e => setNewTransactionValue(e.currentTarget)}></input>
      </div>
      <button className='entry-field' id={dayID + '-add-button'} onClick={e => addTransaction(e.currentTarget)} >Add</button>
    </div>
  )
}

export default NewTransactionButtons;