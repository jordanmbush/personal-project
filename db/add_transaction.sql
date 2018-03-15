INSERT INTO transactions (user_id, name, amount, date, category, sub_category, type)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;