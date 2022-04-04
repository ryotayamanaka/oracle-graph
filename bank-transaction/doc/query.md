## Visualize graph

If the graph is already published, other sessions can view it using Graph Visualization app.

- Graph Visualization: https://<ip-address>:7007/ui/

If the graph is not published, get the session ID to login with the same session and view the graph.

    >>> session
    PgxSession(id: 54935993-1d06-41a6-bf8e-efeab1aaf144, name: python_pgx_client)

Save [highlights.json](../highlights.json) and upload onto Graph Visualization UI.

## Run PGQL queries

- [Simple entity relationships](#simple-entity-relationships)
- [Cyclic transfers](#cyclic-transfers)
- [Path finding](#path-finding)
- [Aggregation and sort](#aggregation-and-sort)

### Simple entity relationships

A customer (ID=10) and the owned account
```sql
SELECT *
FROM MATCH (c:customer)-[e:owns]->(a:account)
WHERE c.cst_id = 10
```

One-hop the money transferred to
```sql
SELECT *
FROM MATCH (c:customer)-[e:owns]->(a:account)-[t:transferred_to]->(a1:account)
WHERE c.cst_id = 10
```

Transferred to the same account via different accounts
```sql
SELECT *
FROM MATCH (c:customer)-[o1:owns]->(a1:account)-[t1:transferred_to]->(a:account)
   , MATCH (c:customer)-[o2:owns]->(a2:account)-[t2:transferred_to]->(a:account)
WHERE c.cst_id = 10 AND a1 != a2
```

2-hops transfer
```sql
SELECT *
FROM MATCH (a1)-[t1:transferred_to]->(a2)-[t2:transferred_to]->(a3)
WHERE a1.acc_id = 10
```

### Cyclic transfers

2-hops cycle
```sql
SELECT *
FROM MATCH (a1)-[t1:transferred_to]->(a2)-[t2:transferred_to]->(a1)
WHERE a1.acc_id = 10
```

2-hops cycle considering amount and datetime
```sql
SELECT *
FROM MATCH (a1)-[t1:transferred_to]->(a2)-[t2:transferred_to]->(a1)
WHERE a1.acc_id = 10
AND t1.amount > 500 AND t2.amount > 500 AND t1.datetime < t2.datetime
```

3-hops cycles considering amount and datetime
```sql
SELECT *
FROM MATCH (a1)-[t1:transferred_to]->(a2)-[t2:transferred_to]->(a3)
   , MATCH (a3)-[t3:transferred_to]->(a1)
WHERE a1.acc_id = 10
  AND t1.amount > 500 AND t2.amount > 500 AND t3.amount > 500
  AND t1.datetime < t2.datetime AND t2.datetime < t3.datetime
```

4-hops cycles considering amount and datetime
```sql
SELECT *
FROM MATCH (a1)-[t1:transferred_to]->(a2)-[t2:transferred_to]->(a3)
   , MATCH (a3)-[t3:transferred_to]->(a4)-[t4:transferred_to]->(a1)
WHERE a1.acc_id = 10 AND ALL_DIFFERENT(a1, a2, a3, a4)
  AND t1.amount > 500 AND t2.amount > 500 AND t3.amount > 500 AND t4.amount > 500
  AND t1.datetime < t2.datetime AND t2.datetime < t3.datetime AND t3.datetime < t4.datetime
```

Using [PATH pattern macro](https://pgql-lang.org/spec/1.3/#path-pattern-macros)
```sql
PATH p AS ()-[:transferred_to]->(a) WHERE a.acc_id != 10
SELECT *
FROM MATCH (a1)-/:p{2,3}/->(a)-[t:transferred_to]->(a1)
WHERE a1.acc_id = 10
```

Using PATH pattern macro with conditions
```sql
PATH p AS ()-[t:transferred_to]->(a) WHERE a.acc_id != 10 AND t.amount > 500
SELECT *
FROM MATCH (a1)-/:p{2,3}/->(a)-[t:transferred_to]->(a1)
WHERE a1.acc_id = 10 AND t.amount > 500
```

Using [TOP K SHORTEST match](https://pgql-lang.org/spec/1.3/#top-k-shortest-path)
```sql
SELECT ARRAY_AGG(a.acc_id) AS list_of_accounts
     , ARRAY_AGG(ID(t))    AS list_of_transactions
     , ARRAY_AGG(t.amount) AS list_of_amounts
FROM MATCH TOP 100 SHORTEST ((a1) (-[t:transferred_to]->(a))* (a1))
WHERE a1.acc_id = 10
  AND COUNT(a) = COUNT(DISTINCT a)
```

Show the cycle, giving a list of transfers
```sql
SELECT *
FROM MATCH (a1)-[t]->(a2)
WHERE ID(t) IN (164, 1887, 1111)
```

```sql
SELECT ARRAY_AGG(a.acc_id) AS list_of_accounts
     , ARRAY_AGG(ID(t))    AS list_of_transactions
     , ARRAY_AGG(t.amount) AS list_of_amounts
FROM MATCH TOP 100 SHORTEST ((a1) (-[t:transferred_to]->(a) WHERE t.amount > 500)* (a1))
WHERE a1.acc_id = 10
  AND COUNT(a) = COUNT(DISTINCT a)
```

```sql
SELECT *
FROM MATCH (a1)-[t]->(a2)
WHERE ID(t) IN (174, 2391, 351, 1870)
```

### Path finding

If there is 2-hops transfers between account 10 and 20
```sql
SELECT *
FROM MATCH (a1)-[t1:transferred_to]-(a)-[t2:transferred_to]->(a2)
WHERE a1.acc_id = 10 AND a2.acc_id = 20
```

Multi-hops paths between account 10 and 20, whose minimum amount is high
```sql
SELECT ARRAY_AGG(a.acc_id) AS list_of_accounts
     , ARRAY_AGG(ID(t))    AS list_of_transactions
     , MIN(t.amount)       AS min_amount_on_path
FROM MATCH TOP 100 SHORTEST ((a1) (-[t:transferred_to]->(a))* (a2))
WHERE a1.acc_id = 10 AND a2.acc_id = 20
ORDER BY MIN(t.amount) DESC
```

```sql
SELECT *
FROM MATCH (a1)-[t:transferred_to]->(a2)
WHERE ID(t) IN (163, 1895, 1400)
```

### Aggregation and sort

Multiple remitters to single beneficiary with small amounts (<= 500.00) over a period of time.

List the beneficiaries who have received the top 10 most transfers.

```sql
SELECT a2.acc_id AS beneficiary_id, COUNT(a2) AS num_of_remitters
FROM MATCH (a1)-[t:transferred_to]->(a2)
WHERE t.datetime >= TIMESTAMP '2020-10-01 00:00:00'
  AND t.datetime < TIMESTAMP '2020-12-01 00:00:00'
  AND t.amount < 500.00
GROUP BY a2 ORDER BY num_of_remitters DESC LIMIT 10
```

Visualize the top beneficiary and the transfers.

```sql
SELECT *
FROM MATCH (a1)-[t:transferred_to]->(a2)<-[o:owns]-(c)
WHERE t.datetime >= TIMESTAMP '2020-10-01 00:00:00'
  AND t.datetime < TIMESTAMP '2020-12-01 00:00:00'
  AND t.amount < 500.00
  AND a2.acc_id = 23
```

### Appendix

Possible extension (not yet supported)

```sql
SELECT ARRAY_AGG(a2.acc_id) AS list_of_accounts
     , ARRAY_AGG(ID(t1))    AS list_of_transactions
     , ARRAY_AGG(t1.amount) AS list_of_amounts
FROM MATCH TOP 100 SHORTEST (
        (a) (
            (a1)-[t1:transferred_to]->(a2)-[t2:transferred_to]->(a3)
            WHERE a1.acc_id != a3.acc_id
              AND t1.datetime < t2.datetime
              AND t1.amount >= 500 AND t2.amount >= 500
        )* (a)
    )
WHERE a.acc_id = 100

Not yet supported: multiple edge patterns in SHORTEST or CHEAPEST
```
