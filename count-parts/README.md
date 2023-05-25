
# Count Parts

Create tables and load a dataset:

```
create table bom_node (
  id    varchar2(1)
, price number
);

create table bom_edge (
  id     number
, parent varchar2(1)
, child  varchar2(1)
, cnt    number
);

insert into bom_node values ('X', null);
insert into bom_node values ('A', null);
insert into bom_node values ('B', null);
insert into bom_node values ('C', null);
insert into bom_node values ('D', null);
insert into bom_node values ('E', null);
insert into bom_node values ('F', 200);
insert into bom_node values ('G', null);
insert into bom_node values ('H', 150);
insert into bom_node values ('I', 120);
insert into bom_node values ('J', 50);
insert into bom_node values ('K', 20);
insert into bom_node values ('L', 30);
insert into bom_node values ('M', 70);

insert into bom_edge values (1, 'G', 'K', 2);
insert into bom_edge values (2, 'X', 'A', 1);
insert into bom_edge values (3, 'X', 'B', 2);
insert into bom_edge values (4, 'X', 'C', 4);
insert into bom_edge values (5, 'A', 'D', 2);
insert into bom_edge values (6, 'A', 'E', 2);
insert into bom_edge values (7, 'B', 'E', 4);
insert into bom_edge values (8, 'C', 'F', 2);
insert into bom_edge values (9, 'C', 'G', 3);
insert into bom_edge values (10, 'D', 'H', 1);
insert into bom_edge values (11, 'D', 'I', 4);
insert into bom_edge values (12, 'E', 'J', 2);
insert into bom_edge values (13, 'E', 'K', 4);
insert into bom_edge values (14, 'G', 'L', 5);
insert into bom_edge values (15, 'G', 'M', 2);

commit;
```

Create a graph:

```
CREATE PROPERTY GRAPH bom_graph
  VERTEX TABLES (
    bom_node
      KEY (id)
      LABEL part
      PROPERTIES (id, price)
  )
  EDGE TABLES (
    bom_edge
      KEY (id)
      SOURCE KEY(parent) REFERENCES bom_node (id)
      DESTINATION KEY(child) REFERENCES bom_node (id)
      LABEL has_part
      PROPERTIES (cnt)
  )
;
```

Run a PGQL query to count parts:

```
SELECT
  p2.id AS id
, LISTAGG(LISTAGG(CAST(e.cnt AS INTEGER), '*'), ' + ')||' =' AS fomula
, SUM(my.product(LISTAGG(CAST(e.cnt AS INTEGER), ','))) AS total_cnt
FROM MATCH ALL (p1) -[e:has_part]->{1,100} (p2) ON bom_graph
WHERE p1.id = 'X'
GROUP BY p2.id
ORDER BY p2.id
```
```
+------------------------------------------+
| id | fomula                  | total_cnt |
+------------------------------------------+
| A  | 1 =                     | 1         |
| B  | 2 =                     | 2         |
| C  | 4 =                     | 4         |
| D  | 1*2 =                   | 2         |
| E  | 1*2 + 2*4 =             | 10        |
| F  | 4*2 =                   | 8         |
| G  | 4*3 =                   | 12        |
| H  | 1*2*1 =                 | 2         |
| I  | 1*2*4 =                 | 8         |
| J  | 1*2*2 + 2*4*2 =         | 20        |
| K  | 1*2*4 + 2*4*4 + 4*3*2 = | 64        |
| L  | 4*3*5 =                 | 60        |
| M  | 4*3*2 =                 | 24        |
+------------------------------------------+
```

Also, for total price:

```
SELECT
  p2.id AS id
, LISTAGG(LISTAGG(CAST(e.cnt AS INTEGER), '*'), ' + ')||' =' AS fomula
, SUM(my.product(LISTAGG(CAST(e.cnt AS INTEGER), ','))) AS total_cnt
, p2.price AS unit_price
, SUM(my.product(LISTAGG(CAST(e.cnt AS INTEGER), ','))) * p2.price AS total_price
FROM MATCH ALL (p1) -[e:has_part]->{1,100} (p2) ON bom_graph
WHERE p1.id = 'X'
GROUP BY p2.id, p2.price
ORDER BY p2.id
```
```
+---------------------------------------------------------------------+
| id | fomula                  | total_cnt | unit_price | total_price |
+---------------------------------------------------------------------+
| A  | 1 =                     | 1         | 0.0        | 0.0         |
| B  | 2 =                     | 2         | 0.0        | 0.0         |
| C  | 4 =                     | 4         | 0.0        | 0.0         |
| D  | 1*2 =                   | 2         | 0.0        | 0.0         |
| E  | 1*2 + 2*4 =             | 10        | 0.0        | 0.0         |
| F  | 4*2 =                   | 8         | 200.0      | 1600.0      |
| G  | 4*3 =                   | 12        | 0.0        | 0.0         |
| H  | 1*2*1 =                 | 2         | 150.0      | 300.0       |
| I  | 1*2*4 =                 | 8         | 120.0      | 960.0       |
| J  | 1*2*2 + 2*4*2 =         | 20        | 50.0       | 1000.0      |
| K  | 1*2*4 + 2*4*4 + 4*3*2 = | 64        | 20.0       | 1280.0      |
| L  | 4*3*5 =                 | 60        | 30.0       | 1800.0      |
| M  | 4*3*2 =                 | 24        | 70.0       | 1680.0      |
+---------------------------------------------------------------------+
```
