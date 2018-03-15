UPDATE transactions SET (name, amount, date, type, category, sub_category) = ($1, $2, $3, $4, $5, $6)
WHERE user_id =  $7 AND id = $8
RETURNING *;