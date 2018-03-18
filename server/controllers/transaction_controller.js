module.exports = {
  getTransactionsByMonthAndYear: (req, res) => {
    const { user_id } = req.session.user;
    // const user_id = 'github|34669268'; //TESTING - REMOVE!!!!!!!!!!!!!!!!!!!!!!!!!
    const { month, year } = req.query;

    console.log('month: ', req.query);
    const db = req.app.get('db');
    db.get_transactions_by_month_and_year(user_id, month, year).then( transactions => {
      res.json(transactions);
    }).catch( err => {
      console.log('transaction_controller - get_transactions_by_month_and_year err: ', err);
      res.status(500).send();
    })
  },
  getAllTransactions: (req, res) => {
    const { user_id } = req.session.user;
    // const user_id = 'github|34669268'; //TESTING - REMOVE!!!!!!!!!!!!!!!!!!!!!!!!!

    const db = req.app.get('db');
    db.get_all_transactions(user_id).then( transactions => {
      res.json(transactions);
    }).catch( err => {
      console.log('transaction_controller - get_all_transactions err: ', err);
      res.status(500).send();
    })
  },
  addTransaction: (req, res) => {
    const { user_id } = req.session.user;
    // const user_id = 'github|34669268'; //TESTING - REMOVE!!!!!!!!!!!!!!!!!!!!!!!!!
    const { name, amount, date, category, subCategory, transactionType } = req.body;
    console.log('req.body: ', req.body);
    const db = req.app.get('db');
    db.add_transaction(user_id, name, amount, date, category, subCategory, transactionType).then( transaction => {
      res.json(transaction);
    }).catch( err => {
      console.log('transaction_controller.js - addTransaction err: ', err);
      res.status(500).send();
    });
  },
  addTransactions: (req, res) => { 
    const { user_id } = req.session.user;
    // const user_id = 'github|34669268'; //TESTING - REMOVE!!!!!!!!!!!!!!!!!!!!!!!!!
    let transactions = req.body.transactionsArray;
    let addedTransactions = [];
    const db = req.app.get('db');
    for(let i = 0; i < transactions.length; i++) {
      const { name, amount, day, category, subCategory, transactionType } = transactions[i];
      
      db.add_transaction([user_id, name, amount, day, category, subCategory, transactionType]).then( transaction => {
        addedTransactions = addedTransactions.concat(transaction);
      }).catch( err => {
        console.log('transaction_controller.js - addTransaction err: ', err);
        res.status(500).send();
      });
    }

    res.status(200).send();
  },
  deleteTransaction: (req, res) => {
    const { user_id } = req.session.user;
    // const user_id = 'github|34669268'; //TESTING - REMOVE!!!!!!!!!!!!!!!!!!!!!!!!!
    const id = req.params.id;

    const db = req.app.get('db');
    db.delete_transaction(user_id, id).then( transaction => {
      res.status(200).send();
    }).catch( err => {
      console.log('transaction_controller.js - deleteTransaction err: ', err);
      res.status(500).send();
    });
  },
  updateTransaction: (req, res) => {
    const { user_id } = req.session.user;
    // const user_id = 'github|34669268'; //TESTING - REMOVE!!!!!!!!!!!!!!!!!!!!!!!!!
    const { id, name, amount, date, category, subCategory, type } = req.body;
    
    const db = req.app.get('db');
    db.update_transaction([name, amount, date, type, category, subCategory, user_id, id]).then( updatedTransaction => {
      res.json(updatedTransaction[0]);
    }).catch( err => {
      console.log('transaction_controller.js - updateTransaction err: ', err);
      res.status(500).send();
    });
  },
}