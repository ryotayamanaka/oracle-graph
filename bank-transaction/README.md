# Bank Transaction

Bank transaction simulation dataset for graph analytics.

- [Analyze Bank Transaction Data using Graph](https://medium.com/oracledevs/analyze-bank-transaction-data-using-graph-part-1-3-2088c6024f81)

## How to setup Oracle Graph

- [Oracle Cloud Always Free Services](https://apexapps.oracle.com/pls/apex/dbpm/r/livelabs/view-workshop?wid=686)
- [Build Oracle Graph on Docker](https://medium.com/oracledevs/build-oracle-graph-on-docker-part-1-2-5fcacaca430e)

## How to create dataset

### Pre-created dataset

Sample dataset is under `/data/scale-100/` directory.

    $ ls /data/scale-100/*.csv
    account.csv customer.csv transaction.csv

Copy the 3 CSV files under `/data/` for loading.

    $ cp ./data/scale-100/*.csv ./data/

### Larger dataset (optional)

For creating a graph with larger number of accounts (e.g. 10000), run this script.

    $ cd script/
    $ python3 create_graph.py 10000

This script creates 3 CSV files.

    $ ls *.csv
    account.csv customer.csv transaction.csv

Locate the CSV files under `/data/` directory.

    $ mv *.csv ../data/

## How to load dataset to tables

Check the service name of the PDB. `<connect-string>` below is `<ip-address>:1521/<service-name>`.

    $ lsnrctl status

Move to `script/` directory.

    $ cd script/

Create tables, `account`, `customer`, and `transaction`.

    $ sqlplus graphuser/<password>@<connect-string> @create-table.sql

Load the data from the CSV file.

    $ sqlldr graphuser/<password>@<connect-string> sqlldr_acc.ctl direct=true
    $ sqlldr graphuser/<password>@<connect-string> sqlldr_cst.ctl direct=true
    $ sqlldr graphuser/<password>@<connect-string> sqlldr_txn.ctl direct=true
