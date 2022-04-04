OPTIONS (SKIP=1)
LOAD DATA
CHARACTERSET UTF8
INFILE '../data/transaction.csv'
TRUNCATE INTO TABLE transaction
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
(
  acc_id_src
, acc_id_dst
, txn_id
, datetime TIMESTAMP "YYYY-MM-DD HH24:MI:SS"
, amount
)
