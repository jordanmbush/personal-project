module.exports = {
  getTransactions: (req, res) => {
    // const { user_id } = req.session.user;
    const user_id = 'github|34669268'; //TESTING - REMOVE!!!!!!!!!!!!!!!!!!!!!!!!!
    const { month, year } = req.query;

    console.log('month: ', req.query);
    const db = req.app.get('db');
    db.get_transactions_by_month_and_year(user_id, month, year).then( transactions => {
      res.json(transactions);
    }).catch( err => {
      console.log('transaction_controller - get-transactions err: ', err);
      res.status(500).send();
    })
  }
}