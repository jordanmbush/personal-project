import React, { Fragment } from 'react';
import { Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateBudgetView from './components/CreateBudgetView';
import AddTransactionsView from './components/AddTransactionsView';

export default <Fragment>
  <Route exact path='/' component={Login} />
  <Route path='/dashboard' component={Dashboard} />
  <Route path='/create-budget' component={CreateBudgetView} />
  <Route path='/add-transactions' component={AddTransactionsView} />
</Fragment>