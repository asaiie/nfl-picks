-- Rename accounts in place; preserve account IDs, passwords, sessions and picks.
UPDATE users SET name = CASE id WHEN 1 THEN 'Amit' WHEN 2 THEN 'Supreet' WHEN 3 THEN 'Nikhil' WHEN 4 THEN 'Shahzad' WHEN 5 THEN 'Kartik' END WHERE id IN (1,2,3,4,5);
