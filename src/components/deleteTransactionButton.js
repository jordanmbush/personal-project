import React from 'react';

const DeleteTransactionButton = ({id, formattedTransactionKey, currKey}) => {
  return (
    <button
      data-is-transaction={id || false}
      data-index={formattedTransactionKey}
      id={`${currKey}-delete-button`}
      onClick={e => this.deleteTransaction(e.currentTarget)}
      className="delete-button"
    >
      <i className="fas fa-trash-alt" />
    </button>
  )
}