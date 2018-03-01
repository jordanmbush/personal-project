SELECT * FROM transactions WHERE
user_id = $1 AND
EXTRACT(MONTH FROM date) = $2 AND
EXTRACT(YEAR from date) = $3;