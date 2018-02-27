module.exports = {
  addBills: (req, res) => {
    console.log('bill_controller - add_bills');

    // const { user_id } = req.session.user;
    const user_id = 'github|34669268'; //TESTING - REMOVE!!!!!!!!!!!!!!!!!!!!!!!!!

    if(req.body.bills.length) {
      
      const db = req.app.get('db');
      let issueRecords = req.body.bills.map( bill => {
        const { name, amount, frequencyType, frequencyValue, startDate, endDate, category } = bill;
        db.add_bill(user_id, name, amount, frequencyType, frequencyValue, startDate, endDate, category).then( response => {
        
        }).catch( err => {
          console.log('err adding record: ', err);
        });
      });

      res.status(200).send({recordsNotAdded: issueRecords}); 

    } else {
      res.status(500).send();
    }
    
  }
}