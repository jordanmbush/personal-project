DELETE FROM bill_frequencies
WHERE bill_id IN (SELECT id FROM bills WHERE user_id = $1);

DELETE FROM bills WHERE user_id = $1;