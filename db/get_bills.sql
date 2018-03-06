SELECT * FROM bills
FULL JOIN bill_frequencies ON (bills.id = bill_frequencies.bill_id)
WHERE user_id = $1;