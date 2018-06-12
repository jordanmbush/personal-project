import React, { Component } from 'react';

class AddTransactionFields extends Component {


  render() {
    const { dayID, setNewTransactionValue, transAmount, transCategory, transName, transSubCategory, categories, subCategories } = this.props;

    return <div className="data-fields entry-row">
        <div className="entry-field">
          <input 
            id={dayID + "-entry-name"}
            value={transName}
            placeholder="name - e.g. 'Water'"
            onChange={e => setNewTransactionValue(e.target)} 
          />
        </div>
        <div className="entry-field">
          <input 
            id={dayID + "-entry-amount"}
            value={transAmount}
            placeholder="amount"
            type="number"
            onChange={e => setNewTransactionValue(e.target)} 
          />
        </div>
        <div className="entry-field">
          <select id={dayID + "-entry-category"} value={transCategory} onChange={e => setNewTransactionValue(e.target)}>
            <option selected> --category-- </option>
            {categories}
          </select>
        </div>
        <div className="entry-field">
          <select id={dayID + "-entry-subCategory"} value={transSubCategory} onChange={e => setNewTransactionValue(e.target)}>
            <option selected> --subcategory-- </option>
            {subCategories}
          </select>
        </div>
      </div>;
  }
}

export default AddTransactionFields;