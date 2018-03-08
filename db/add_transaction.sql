INSERT INTO transactions (user_id, name, amount, date, category, type)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;