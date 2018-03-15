INSERT INTO bills (user_id, name, amount, frequency_type, start_date, end_date, category, sub_category)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;