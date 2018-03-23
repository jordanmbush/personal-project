import React, { Component } from'react';
import axios from 'axios';

export default class Login extends Component {
  constructor() {
    super();
    this.state = {

    }
    this.login = this.login.bind(this);
  }

  componentDidMount() {
    axios.get(`/api/user-data`).then( users => {
      console.log('dashboard.js - received user data: ', users.data);
      window.location = '/dashboard';
    }).catch( err => {
      // ADD CODE HERE
      console.log('dashboard.js - api get error: ', err);
    })
  }
  
  login() {
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
    const scope = encodeURIComponent('openid profile email');
    const link = `https://${process.env.REACT_APP_AUTH_DOMAIN}/login?client=${process.env.REACT_APP_AUTH_CLIENT_ID}&scope=${scope}&redirect_uri=${redirectUri}`
    console.log('Login.js link: ', link);
    window.location = link;
  }


  render() {
    return (
      <div className='login-component'>
        <h1>Monilibrium</h1>
        <div className='hero-panel'>
          <div className='welcome-container'>
            <h2>Welcome</h2>
          </div>
          <div className='login-blur-box'>
          </div>
          <div className='login-button-container'>
            <div className='color-strip-container'>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <div className='login-container-message'>
              <span>Go ahead and click that blue button right there. It's easy.</span>
            </div>
            <button onClick={this.login}>Login / Register</button>
          </div>
        </div>
        <div id='panel-1' className='panel'>
          <div className='panel-content'>
            <h2>50% of Americans have less than one month's income saved!</h2>
            <div className='panel-main-info'>
              <img src='https://ak3.picdn.net/shutterstock/videos/9802973/thumb/1.jpg' alt='Savings Jar with a few coins'></img>
              <p>Top personal finance advisors will tell you - and especially drawing from lessons in the economic crisis to have at least six months income saved, just in case.</p>
            </div>
            <aside><a href='https://www.businessinsider.com/a-dozen-shocking-personal-finance-statistics-2011-5'>www.businessinsider.com</a></aside>
          </div>
        </div>
        <div id='panel-2' className='panel'>
          <div className='panel-content'>
            <h2>Alarming statistics regarding Millennials and their Finances</h2>
            <div className='panel-main-info'>
              <img src='https://c1.staticflickr.com/3/2268/3537904106_57fe05b12b_b.jpg' alt='Millennial stressed with credit card in hand'></img>
              <div>
                <h3>'Mellennials Show Alarming Gap Between Financial Confidence and Knowledge' according to Nefe.org</h3>
                <ul>
                  <li>-53% of Millennials feel they have too much debt</li>
                  <li>-When asked if they could come up with $2,000 if an unexpected need arose within 30 days, nearly half (48 percent) said they probably or certainly could not come up with the funds</li>
                  <li>-Less than one-third (32 percent) have set aside funds to cover three months of household expenses</li>
                  <li>-Nearly 30 percent of those with bank accounts had overdrawn their account in the prior 12 months</li>
                  <li>-Only 24 percent of respondents showed basic financial literacy in the study, with just 8 percent showing a high level of knowledge. Yet, 69 percent gave themselves a high self-assessment of financial knowledge</li>
                </ul>
              </div>
            </div>
            <aside><a href='https://www.businessinsider.com/a-dozen-shocking-personal-finance-statistics-2011-5'>www.businessinsider.com</a></aside>
          </div>
        </div>
        <div id='panel-3' className='panel'>
          <div className='panel-content'>
            <h2>The number of people who actually budget is shocking!</h2>
            <div className='panel-main-info'>
              <img src='https://www.moneymanagement.org/~/media/budgeting.jpg' alt='Hand written budget'></img>
              <ul>
                <li>Only 30% of Americans have a long-term financial plan that includes savings and investment goals</li>
                <li>You’re mostly likely to budget if you make at least $75,000 per year</li>
              </ul>
            </div>
            <aside><a href='https://www.gallup.com/poll/162872/one-three-americans-prepare-detailed-household-budget.aspx'>news.gallup.com</a></aside>
          </div>
        </div>
        <div id='panel-4' className='panel'>
          <div className='panel-content'>
            <h2>50% of Americans have less than one month's income saved!</h2>
            <div className='panel-main-info'>
              <img src='https://ak3.picdn.net/shutterstock/videos/9802973/thumb/1.jpg' alt='Savings Jar with a few coins'></img>
              <p>Top personal finance advisors will tell you - and especially drawing from lessons in the economic crisis to have at least six months income saved, just in case.</p>
            </div>
            <aside><a href='https://www.businessinsider.com/a-dozen-shocking-personal-finance-statistics-2011-5'>www.businessinsider.com</a></aside>
          </div>
        </div>
      </div>
    )
  }
}