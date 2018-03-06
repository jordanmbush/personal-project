module.exports = {
  getTransactionsByMonthAndYear: (req, res) => {
    // const { user_id } = req.session.user;
    const user_id = 'github|34669268'; //TESTING - REMOVE!!!!!!!!!!!!!!!!!!!!!!!!!
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
    // const { user_id } = req.session.user;
    const user_id = 'github|34669268'; //TESTING - REMOVE!!!!!!!!!!!!!!!!!!!!!!!!!

    const db = req.app.get('db');
    db.get_all_transactions(user_id).then( transactions => {
      res.json(transactions);
    }).catch( err => {
      console.log('transaction_controller - get_all_transactions err: ', err);
      res.status(500).send();
    })
  }
}