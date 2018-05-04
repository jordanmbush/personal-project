INSERT INTO users ( user_id, firstName, lastname, email, date_created )
VALUES ($1, $2, $3, $4, $5) RETURNING *;