import React, { Fragment } from 'react';
import { Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateBudgetView from './components/CreateBudgetView';

export default <Fragment>
  <Route exact path='/' component={Login} />
  <Route path='/dashboard' component={Dashboard} />
  <Route path='/create-budget' component={CreateBudgetView} />
</Fragment>