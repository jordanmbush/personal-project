INSERT INTO income (user_id, name, amount, frequency_type, start_date)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;