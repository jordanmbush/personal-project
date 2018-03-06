DELETE FROM income_frequencies
WHERE income_id IN (SELECT id FROM income WHERE user_id = $1);

DELETE FROM income WHERE user_id = $1;