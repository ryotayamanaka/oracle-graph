OPTIONS (SKIP=1)
LOAD DATA
CHARACTERSET UTF8
INFILE '../data/account.csv'
TRUNCATE INTO TABLE account
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
(
  acc_id
, cst_id
)
