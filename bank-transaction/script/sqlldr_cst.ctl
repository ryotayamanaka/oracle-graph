OPTIONS (SKIP=1)
LOAD DATA
CHARACTERSET UTF8
INFILE '../data/customer.csv'
TRUNCATE INTO TABLE customer
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
(
  cst_id
, first_name
, last_name
)
