UPDATE transactions SET (name, amount, date, type, category) = ($1, $2, $3, $4, $5)
WHERE user_id =  $6 and id = $7
RETURNING *;