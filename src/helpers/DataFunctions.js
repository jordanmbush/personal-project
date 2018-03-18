import axios from 'axios';
import currency from 'currency.js';

const DAY = 'DAY';
const WEEK = 'WEEK';
const MONTH = 'MONTH';
const YEAR = 'YEAR';
const EOW = 'EOW';
const XDAYS = 'XDAYS';

export function getTransactionsFromDB() {
  // PULL IN TEMPLATE BILLS AND ALL ACTUAL TRANSACTIONS
  axios.get('/api/user-data').then( () => {
    axios.get('/api/balance').then( balanceInfo => {
      axios.get(`/api/transactions`).then( transactions => {
        axios.get('/api/bills').then( bills => {
          axios.get('/api/income').then( incomeSources => {
            let parsedBills = bills.data.map( bill => {
              bill.amount = Math.abs(currency(bill.amount).value) * -1;
              return bill;
            })
            let parsedIncome = incomeSources.data.map( income => {
              income.amount = Math.abs(currency(income.amount).value);
              return income;
            })
            let parsedTransactions = transactions.data.map( transaction => {
              let multiplier = transaction.type === 'income' ? 1 : -1;
              transaction.amount = Math.abs(currency(transaction.amount).value) * multiplier;
              return transaction;
            })
            console.log('received transactions: ', transactions.data);
            this.setState({
              bills: parsedBills,
              incomeSources: parsedIncome,
              transactions: parsedTransactions,
              balanceInfo: balanceInfo.data,
            }, () => this.putTransactionsInState())
          }).catch( err => console.log('addtransactionsview - get income err: ', err));
        }).catch( err => console.log('addtransactionsview - get bills err: ', err));
      }).catch( err => console.log('addtransactionsview - get transactions err: ', err));
    }).catch( err => console.log('addtransactionview - get balance err: ', err));
  }).catch( err => {
    console.log('user not logged in.');
    this.props.history.push('/');
  })
}
// =============================== PARSE TEMPLATES INTO TRANSACTIONS ===============================
export function getWeeklyTransactionsFromTemplate(template, dayFrom, dayThrough) {
  let transactions = [];
  let transactionType = template.hasOwnProperty('category') ? 'expense' : 'income';
  
  for(let day = new Date(dayFrom); day <= dayThrough; day.setDate(day.getDate() + 1)) {
    if(day.getDay() === template.day_num && day >= new Date(template.start_date)) {
      transactions.push({ transactionType, name: template.name, amount: currency(template.amount).value, category: template.category, subCategory: template.sub_category, day: new Date(day) });
    }
  }
  return transactions;
}
export function getMonthlyTransactionsFromTemplate(template, dayFrom, dayThrough) {
  let transactions = [];
  let transactionType = template.hasOwnProperty('category') ? 'expense' : 'income';
  let dayIsLastDayOfMonth = false;
  
  for(let day = new Date(dayFrom); day <= dayThrough; day.setDate(day.getDate() + 1)) {
    dayIsLastDayOfMonth = day.getDate() === (new Date(day.getFullYear(), day.getMonth() + 1 , 0)).getDate();
    if(template.day_num > day.getDate() && dayIsLastDayOfMonth && day >= new Date(template.start_date)){
      transactions.push({ transactionType, name: template.name, amount: currency(template.amount).value, category: template.category, subCategory: template.sub_category, day: new Date(day) });
    }
    if(day.getDate() === template.day_num && day >= new Date(template.start_date)) {
      transactions.push({ transactionType, name: template.name, amount: currency(template.amount).value, category: template.category, subCategory: template.sub_category, day: new Date(day) });
    }
  }
  return transactions;
}
export function getEOWTransactionsFromTemplate(template, dayFrom, dayThrough) {
  let transactions = [];
  let transactionType = template.hasOwnProperty('category') ? 'expense' : 'income';
  let startDate = new Date(template.start_date);

  for(let day = new Date(dayFrom); day <= dayThrough; day.setDate(day.getDate() + 1)) {
    let timeDiff = Math.abs(day.getTime() - startDate.getTime());
    let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
    if(diffDays % 14 === 0 && day >= new Date(template.start_date)) {
      transactions.push({ transactionType, name: template.name, amount: currency(template.amount).value, category: template.category, subCategory: template.sub_category, day: new Date(day) });
    }
  }
  return transactions;
}
export function getXDAYSTransactionsFromTemplate(template, dayFrom, dayThrough) {
  let transactions = [];
  let transactionType = template.hasOwnProperty('category') ? 'expense' : 'income';
  let startDate = new Date(template.start_date);

  for(let day = new Date(dayFrom); day <= dayThrough; day.setDate(day.getDate() + 1)) {
    let timeDiff = Math.abs(day.getTime() - startDate.getTime());
    let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
    if(diffDays % template.day_num === 0 && day >= new Date(template.start_date)) {
      transactions.push({ transactionType, name: template.name, amount: currency(template.amount).value, category: template.category, subCategory: template.sub_category, day: new Date(day) });
    }
  }
  return transactions;
}
// ==========================================================================================
export function getTemplateTransactions(dayFrom, dayThrough) {
  let bills = this.state.bills.slice();
  let income = this.state.incomeSources.slice();
  let budgetTempate = bills.concat(income);
  let templateTransactions = [];

  for(let i = 0; i < budgetTempate.length; i++) {
    switch(budgetTempate[i].frequency_type) {
      case WEEK: templateTransactions =  templateTransactions.concat(getWeeklyTransactionsFromTemplate(budgetTempate[i], dayFrom, dayThrough));
        break;
      case MONTH: templateTransactions = templateTransactions.concat(getMonthlyTransactionsFromTemplate(budgetTempate[i], dayFrom, dayThrough));
        break;
      case EOW: templateTransactions = templateTransactions.concat(getEOWTransactionsFromTemplate(budgetTempate[i], dayFrom, dayThrough));
        break;
      case XDAYS: templateTransactions = templateTransactions.concat(getXDAYSTransactionsFromTemplate(budgetTempate[i], dayFrom, dayThrough));
        break;
      default: break;
    }
  }
  return templateTransactions;
}
export function initializeTransactions(transactionsInput = []) {
  let transactions = transactionsInput.length ? transactionsInput : this.state.transactions.slice();
  let balanceDate = new Date(this.state.balanceInfo.date);
  let balanceAmount = this.state.balanceInfo.amount ? currency(this.state.balanceInfo.amount) : 0;
  let startDate = new Date(balanceDate.getFullYear(), balanceDate.getMonth(), 1);
  // IF THERE ARE NO TRANSACTIONS YET, SET lastTransactionDate TO TODAY;
  let lastTransactionDate = transactions.length ? new Date(transactions[transactions.length -1].date) : new Date();
  let lastDayOfSelectedMonth = new Date(this.state.selectedYear, this.state.selectedMonth + 1, 0);
  // END DATE WILL EQUAL LAST TRANSACTION DATE OR LAST DAY OF SELECTED MONTH - WHICHEVER IS GREATER
  let endDate = lastTransactionDate >= lastDayOfSelectedMonth ? new Date(lastTransactionDate) : new Date(lastDayOfSelectedMonth);
  let months = [];

  
  // GET EVERY MONTH INBETWEEN THE TWO DATES INTO AN ARRAY
  for(let day = new Date(startDate); day <= endDate; day.setDate(day.getDate() + 1)) {
    if(months.length) {
      if(months.findIndex( month => month.monthNum === day.getMonth() && month.yearNum === day.getFullYear()) === -1) {
        months.push({ monthNum: day.getMonth(), yearNum: day.getFullYear() });
      }
    } else {
      months.push({ monthNum: day.getMonth(), yearNum: day.getFullYear() });
    }
  }

  let formattedTransactions = [];
  let month = null;
  let year = null;
  let firstDayOfCurrentMonth = null;
  let lastDayOfCurrentMonth = null;
  // FOR EVERY MONTH - CHECK IF THERE IS A TRANSACTION OR NOT
  for(let i = 0; i < months.length; i++) {
    month = months[i].monthNum;
    year = months[i].yearNum;
    let index = transactions.findIndex( transaction => { 
      return  new Date(transaction.date).getMonth() === month &&
        new Date(transaction.date).getFullYear() === year;
    });
    // IF THERE IS A TRANSACTION FOR THE MONTH
    if(index !== -1) {
      firstDayOfCurrentMonth = new Date(year, month, 1);
      lastDayOfCurrentMonth = new Date(year, month + 1, 0);
      for(let day = new Date(year, month, 1); day <= lastDayOfCurrentMonth; day.setDate(day.getDate() + 1)) {
        for(let j = 0; j < transactions.length; j ++) {
          const { name, amount, date, type, category, subCategory, id } = transactions[j];
          if(new Date(date).isSameDateAs(day)) {
            balanceAmount = currency(balanceAmount).add(amount).value;
            formattedTransactions.push({ id, transactionType: type, balance: balanceAmount, name, amount: currency(amount).value, category, subCategory, day: new Date(date)  });
          }
        }
      }
    } else { // GET budgetTemplate FOR MONTH
      let budgetTemplate = this.getTemplateTrans(new Date(year, month ,1), new Date(year, month + 1, 0));
      budgetTemplate.sort( (firstItem, secondItem) => {
        return firstItem.day - secondItem.day;
      })
      for(let i = 0; i < budgetTemplate.length; i++) {
        balanceAmount = currency(balanceAmount).add(budgetTemplate[i].amount).value;
        budgetTemplate[i].balance = balanceAmount;
      }
      formattedTransactions = formattedTransactions.concat(budgetTemplate);
    }
  }
  // ADD A KEY WHICH CORRESPONDS THE THE TRANSACTIONS INDEX. WHEN OTHER ARRAYS ARE MADE FROM THIS ARRAY
  // AND THEN FILTERED - THEY WILL HAVE A REFERENCE TO THIS ARRAY, WHICH WILL BE IN STATE.
  formattedTransactions.map( (transaction, i) => transaction.formattedTransactionKey = i );
  let firstDayOfSelectedMonth = new Date(this.state.selectedYear, this.state.selectedMonth, 1 );
  let currentMonthTransactions = formattedTransactions.filter( transaction => {
    return transaction.day >= firstDayOfSelectedMonth && transaction.day <= lastDayOfSelectedMonth;
  })
  currentMonthTransactions = currentMonthTransactions.map((transaction, i) => {
    transaction.currentMonthTransactionKey = i;
    return transaction;
  });
  
  this.setState({
    fullTransactionSet: formattedTransactions,
    currentMonthTransactions: currentMonthTransactions,
  });
}
