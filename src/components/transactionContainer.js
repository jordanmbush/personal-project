import React from 'react';
import Loader from './Loader';
import currency from 'currency.js';

const TransactionContainer = ({dayID, i, currKey, currentMonthTransactions, editTransactionButton, deleteTransactionButton, updateTransactionValues, toggleRowButtonsVisibility}) => {
  return (
    <div key={'daily-transaction-' + dayID + '-' + i} className='transaction-table-row' id={`${dayID}-${i}`}>
      <div className='transaction-info' onClick={() => toggleRowButtonsVisibility(`${dayID}-${i}`, `${currKey}-edit-button`)}>
        <div><input disabled id={`${currKey}-balance`} className='transaction-balance' onChange={e => updateTransactionValues(e)} value={currency(currentMonthTransactions[currKey].balance).format(true)}></input></div>
        <div><input disabled id={`${currKey}-name`} className='transaction-name' onChange={e => updateTransactionValues(e)} value={currentMonthTransactions[currKey].name}></input></div>
        <div><input disabled id={`${currKey}-amount`} className='transaction-amount' onChange={e => updateTransactionValues(e)} value={currency(currentMonthTransactions[currKey].amount).value} type='number'></input></div>
        <div><input disabled id={`${currKey}-category`} className='transaction-category' onChange={e => updateTransactionValues(e)} value={currentMonthTransactions[currKey].category}></input></div>
        <div><input disabled id={`${currKey}-subCategory`} className='transaction-subcCategory' onChange={e => updateTransactionValues(e)} value={currentMonthTransactions[currKey].subCategory}></input></div>
      </div>
      <div key={`${dayID}-${i}-buttons`} id={`${dayID}-${i}-buttons`} className='transaction-buttons-container row-hidden'>
        <div className='income-radio radio-container'>
          <label htmlFor={currKey + '-radio-income'}><i class="far fa-money-bill-alt"></i></label>
          <input disabled id={`${currKey}-radio-income`}  type='radio' name={`${currKey}-transaction-type`} onChange={(e) => updateTransactionValues(e)} checked={currentMonthTransactions[currKey].transactionType === 'income'}></input>
        </div>
        <div className='expense-radio radio-container'>
          <label htmlFor={`${currKey}-radio-expense`}>Expense</label>
          <input disabled id={currKey + '-radio-expense'} type='radio' name={`${currKey}-transaction-type`} onChange={(e) => updateTransactionValues(e)} checked={currentMonthTransactions[currKey].transactionType === 'expense'}></input>
        </div>
        {editTransactionButton}
        {deleteTransactionButton}
      </div>
    </div>
  )
}

export default Loader(['currKey'])(TransactionContainer);