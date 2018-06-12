import React, { Component, Fragment } from 'react';

const ADD_BUTTON = 'ADD_BUTTON';
const CANCEL_CUTTON = 'CANCEL_BUTTON';

class AddTransactionContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: props.date,
      buttonState: ADD_BUTTON
    }
  }
  render() {

    return (
      <Fragment>
        <div className='show-entry-fields-button-container'>
          <button id={dayID + '-toggle-entry-row-button'} className='show-fields' onClick={() => this.toggleInputFields()}>
              {this.state.buttonState === ADD_BUTTON ? '+ Add Transactions' : 'Cancel'}
          </button>
        </div>
        <div className='transaction-table-entry-container row-hidden' id={dayID + '-entry-row'}>
          <AddTransactionFields
            dayID={dayID}
            setNewTransactionValue={this.setNewTransactionValue}

            transName={this.getNewTransaction(dayID).name || ''}
            transAmount={this.getNewTransaction(dayID).amount || ''}
            transCategory={this.getNewTransaction(dayID).category || ''}
            transSubCategory={this.getNewTransaction(dayID).subCategory || ''}
            categories={this.getCategories()}
            subCategories={this.getSubCategories(this.getNewTransaction(dayID) && this.getNewTransaction(dayID).category)}
          />
          <AddTransactionButtons
            dayID={dayID}
            isIncomeChecked={this.getNewTransaction(dayID) && this.getNewTransaction(dayID).transactionType === 'income'}
            isExpenseChecked={this.getNewTransaction(dayID) && this.getNewTransaction(dayID).transactionType === 'expense'}
            setNewTransactionValue={this.setNewTransactionValue}
            addTransaction={this.addTransaction}
          />
        </div>
      </Fragment>
    )
  }
}

export default AddTransactionContainer;