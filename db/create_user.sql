INSERT INTO users ( user_id, firstName, lastname, email )
VALUES ($1, $2, $3, $4) RETURNING *;