module.exports = {
  addBills: (req, res) => {
    const { user_id } = req.session.user;
    // const user_id = 'github|34669268'; //TESTING - REMOVE!!!!!!!!!!!!!!!!!!!!!!!!!

    if(req.body.bills) {
      const db = req.app.get('db');
      const bills = req.body.bills;
      // DELETE ALL OF THE BILLS FIRST. WHEN BILLS ARE EDITED, THEY ARE ALL SENT BACK, SO IF THE USER DIDN'T DELETE THEM
      // THEY WILL ALL BE ADDED BACK WITH ANY CHANGES MADE
      db.delete_all_user_bills(user_id).then( response => {
        // ADD EACH BILL
        for(let billNum = 0; billNum < bills.length; billNum++) {
          const { name, amount, frequencyType, startDate, endDate, category, frequencyDays } = bills[billNum];
          db.add_bill(user_id, name, amount, frequencyType, startDate, endDate, category).then( bill => {
            // ONCE THE BILL IS ADDED, WELL RECEIVE THAT RECORD BACK WITH IT'S ID, AND WILL ADD FREQUENCY DAYS WITH THE BILL ID
            // AS TH FOREIGN KEY
            for(let day = 0; day < frequencyDays.length; day++) {
              db.add_bill_frequencies(bill[0].id, frequencyDays[day]).then( response => {
  
              }).catch( err => console.log('err adding bill frequency: ', err));
            }
          }).catch( err => console.log('err adding record: ', err));
        }
        res.status(200).send({issues: true}); 
      }).catch( err => console.log('err deleting bills: ', err));
    } else { //NO BILLS CAME OVER IN REQ.BODY
      res.status(500).send();
    }
  },
  //===================================================================================================================
  getBills: (req, res) => {
    const { user_id } = req.session.user;
    // const user_id = 'github|34669268'; //TESTING - REMOVE!!!!!!!!!!!!!!!!!!!!!!!!!
    const db = req.app.get('db');
    db.get_bills(user_id).then( bills => {
      res.json(bills);
    }).catch( err => {
      res.status(500).send();
    });
  }
}