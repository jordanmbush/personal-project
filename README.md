# Monilibrium

## About
Monilibrium is a personal budgeting application using a full stack. This application allows for bill tracking, daily balance foresight, negative balance alerts, and more. Users add their budget (bill info, bill amounts, frequency, etc.), and Monilibrium pupulate on a monthly basis all of their bills, and their expected balance for every day of the month. Budgets can be edit or deleted along with income, and users can add, edit, and delete transactions as well. Categories, and sub-categories can be assigned to transactions also to allow for reporting. Monilibrium was a personally developed application.

## Technologies
- React
- Node
- Express - webframework used for created robust APIs
- Massive - Data access tool for the Postgres database
- axios - promise library for ajax calls
- chart.js - I use to show charting of user's transactions
- express-session - used for session management

## Additional Info
- Monilibrium was designed using the MVC pattern
- Authentication is handled by Auth0
  - Future versions will utilize bcrypt for secure authentication to allow for more flexibility