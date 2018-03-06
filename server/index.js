const express = require('express');
const massive = require('massive');
// CONTROLLERS
const auth_controller = require('./controllers/auth_controller');
const user_controller = require('./controllers/user_controller');
const bill_controller = require('./controllers/bill_controller');
const transaction_controller = require('./controllers/transaction_controller');
const income_controller = require('./controllers/income_controller');
const balance_controller = require('./controllers/balance_controller');
// MIDDLEWARES
const session = require('express-session');
const bodyParser = require('body-parser');
const checkSession = require('./middlewares/checkSession');

require('dotenv').config();

massive(process.env.CONNECTION_STRING).then(db => {
  app.set('db', db);
});

const app = express();
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
  cookie: {
    // 1 WEEK
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));
app.use(express.static(`${__dirname}/../build`));

// ENDPOINTS
app.get('/auth/callback', auth_controller.connect);
app.get('/api/user-data', checkSession, user_controller.getUser);
// app.post('/api/bills', checkSession, bill_controller.addBills)
app.post('/api/bills', bill_controller.addBills);
app.get('/api/bills', bill_controller.getBills);
app.post('/api/income', income_controller.addIncome);
app.get('/api/income', income_controller.getIncome);
// app.get('/api/transactions', transaction_controller.getTransactions);
app.get('/api/transactions', transaction_controller.getAllTransactions);
app.get('/api/balance', balance_controller.getBalance);

app.post('/api/logout', user_controller.logout);

const PORT = 4000;
app.listen( PORT, console.log(`Listening on port ${PORT}.`));
