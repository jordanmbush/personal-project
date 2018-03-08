SELECT * FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS categories;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL ,
  firstname TEXT NOT NULL,
  lastName TEXT NOT NULL,
  email TEXT NOT NULL
);

DROP TABLE IF EXISTS bills;
CREATE TABLE bills (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id),
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  frequency_type TEXT,
  frequency_value INTEGER,
  start_date DATE,
  end_date DATE,
  category TEXT
);

DROP TABLE IF EXISTS transactions;
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(user_id),
  name TEXT,
  amount NUMERIC,
  date DATE,
  category TEXT
);

DROP TABLE IF EXISTS bill_frequencies;
CREATE TABLE bill_frequencies (
  id SERIAL PRIMARY KEY,
  bill_id INTEGER NOT NULL REFERENCES bills(id),
  day_num INTEGER
);

DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT
);

DROP TABLE IF EXISTS income;
CREATE TABLE income (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id),
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  frequency_type TEXT,
  start_date DATE
);

DROP TABLE IF EXISTS income_frequencies;
CREATE TABLE income_frequencies (
  id SERIAL PRIMARY KEY,
  income_id INTEGER NOT NULL REFERENCES income(id),
  day_num INTEGER
);

DROP TABLE IF EXISTS balances;
CREATE TABLE balances (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(user_id),
  date DATE NOT NULL,
  amount NUMERIC NOT NULL
);

INSERT INTO balances (user_id, date, amount)
VALUES ('github|34669268', '2018-02-02', 500.50);

SELECT * FROM users;
SELECT * FROM balances;
SELECT * FROM bills;
SELECT * FROM bill_frequencies;
FULL JOIN bill_frequencies ON (bills.id = bill_frequencies.bill_id)
WHERE user_id = 'github|34669268';



SELECT * FROM bill_frequencies WHERE id LIKE '%%';





DELETE FROM bill_frequencies;
DELETE FROM bills;
