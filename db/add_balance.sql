DELETE FROM balances WHERE user_id = $1;

INSERT INTO balances (user_id, date, amount)
VALUES ($1, $2, $3)
RETURNING *;