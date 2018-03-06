module.exports = {
  getBalance: (req, res) => {
    // const { user_id } = req.session.user;
    const user_id = 'github|34669268'; //TESTING - REMOVE!!!!!!!!!!!!!!!!!!!!!!!!!

    const db = req.app.get('db');
    db.get_user_balance_info(user_id).then( balances => {
      res.json(balances[0]);
    }).catch( err => {
      console.log('balance_controller - get_user_balance_info err: ', err);
      res.status(500).send();
    })
  }
}