SELECT * FROM income
FULL JOIN income_frequencies ON (income.id = income_frequencies.income_id)
WHERE user_id = $1;