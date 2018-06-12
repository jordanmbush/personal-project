import React, { Component, Fragment } from 'react';
import TransactionContainer from './transactionContainer';
import DateFunctions from '../helpers/DateFunctions';

class DailyRowContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: props.date,
      day: props.date,
      dailyBalance: props.dailyBalance,
      dailyTotal: props.dailyTotal,
      transactions: props.transactions,
      showTransactions: false,
    }
  }

  getTransactions = () => {
    if(this.state.transactions.length) {
      const transactionsForToday = this.state.transactions.slice();
      const transactionContainers = transactionsForToday.map((transaction, i) => {
        return (
          <TransactionContainer
            key={`${this.state.date}-${transaction.name}-${transaction.amount}`}
            transaction={transaction}
            isVisible={this.state.showTransactions}
            toggleVisibility={this.toggleVisibility}
          />
        )
      })
    } else {
      return null;
    }
  }

  render() {
    const subTransactionHeader = (
      <div className='transaction-table-row-header'>
        <div className='sub-transaction-header-title'>Bal</div>
        <div className='sub-transaction-header-title'>Name</div>
        <div className='sub-transaction-header-title'>Amt</div>
        <div className='sub-transaction-header-title'>Ctg</div>
        <div className='sub-transaction-header-title'>SubCtg</div>
      </div>
    );
    const transactions = this.getTransactions();
    return (
      <Fragment>
        <div className={`transaction-table-daily-header-row ${bandedWeekClass}`} id={`${dayID}-header-row`} onClick={e => toggleTableRowVisibility(e.currentTarget)}>
          <div className='transaction-table-date-column'>{DateFunctions.simpleDateFormat(day)}</div>
          <div className='transaction-table-week-day-column'>{day.toString().split(' ')[0]}</div>
          <div style={dayBalanceStyle} className='transaction-table-balance-column'>{currency(balance).format(true)}</div>
          <div className='transaction-table-name-column'>{this.state.transactions.length > 1 ? 'Multiple Transactions...' : this.state.transactions[0] && this.state.transactions[0].name}</div>
          <div className='transaction-table-amount-column'>{currency(dailyTotal).format(true)}</div>
        </div>
        {this.state.transactions.length && subTransactionHeader}
        {transactions}
      </Fragment>
    )
  }
}