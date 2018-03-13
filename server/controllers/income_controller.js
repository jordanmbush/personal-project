module.exports = {
  addIncome: (req, res) => {
    console.log('income_controller - add_income');
    const { user_id } = req.session.user;
    // const user_id = 'github|34669268'; //TESTING - REMOVE!!!!!!!!!!!!!!!!!!!!!!!!!

    if(req.body.income) {
      const db = req.app.get('db');
      const income = req.body.income;

      db.delete_all_user_income(user_id).then( response => {
        // ADD EACH INCOME ENTRY
        for(let incomeNum = 0; incomeNum < income.length; incomeNum++) {
          const { name, amount, frequencyType, startDate, frequencyDays } = income[incomeNum];
          db.add_income(user_id, name, amount, frequencyType, startDate).then( income => {
            console.log('add_income response: ', income);
            // ONCE THE INCOME IS ADDED, WELL RECEIVE THAT RECORD BACK WITH IT'S ID, AND WILL ADD FREQUENCY DAYS WITH THE income ID
            // AS TH FOREIGN KEY
            for(let day = 0; day < frequencyDays.length; day++) {
              db.add_income_frequencies(income[0].id, frequencyDays[day]).then( response => {

              }).catch( err => console.log('err adding income frequency: ', err));
            }
          }).catch( err => {
            console.log('err adding record: ', err);
          });
        }
        res.status(200).send({issues: true});
      }).catch(err => console.log('income_controller.js - delete income err: ', err));
    } else {
      res.status(500).send();
    }
  },
  getIncome: (req, res) => {
    const { user_id } = req.session.user;
    // const user_id = 'github|34669268'; //TESTING - REMOVE!!!!!!!!!!!!!!!!!!!!!!!!!
    const db = req.app.get('db');
    db.get_income(user_id).then( income => {
      console.log('income_controller - get_income received: ', income);
      res.json(income);
    }).catch( err => {
      console.log('income_controller - get_income err: ', err)
      res.status(500).send();
    });
  }
}