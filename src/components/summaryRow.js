import React from 'react';
import currency from 'currency.js';
import DateFunctions from '../helpers/DateFunctions';

const SummaryRow = ({
  bandedWeekClass,
  dayID,
  day,
  dayBalanceStyle,
  billsForDay,
  billName,
  balance,
  dailyTotal,
  toggleTableRowVisibility
}) => {
  return (
    <div className={`transaction-table-daily-header-row ${bandedWeekClass}`} id={`${dayID}-header-row`} onClick={e => toggleTableRowVisibility(e.currentTarget)}>
      <div className='transaction-table-date-column'>{DateFunctions.simpleDateFormat(day)}</div>
      <div className='transaction-table-week-day-column'>{day.toString().split(' ')[0]}</div>
      <div style={dayBalanceStyle} className='transaction-table-balance-column'>{currency(balance).format(true)}</div>
      <div className='transaction-table-name-column'>{billsForDay.length > 1 && 'Multiple Transactions...' || billName}</div>
      <div className='transaction-table-amount-column'>{currency(dailyTotal).format(true)}</div>
    </div>
  )
}

export default SummaryRow;