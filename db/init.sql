DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS categories;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  auth_sub TEXT NOT NULL,
  username TEXT
);

CREATE TABLE bills (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  frequency_type TEXT,
  frequency_value INTEGER,
  start_date DATE,
  end_date DATE,
  category TEXT
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  name TEXT,
  category TEXT,
  amount DECIMAL,
  username TEXT
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT
);
