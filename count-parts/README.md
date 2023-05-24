
# Count Parts

Create tables and load a dataset:

```
create table bom (
  parent varchar2(20)
, child  varchar2(20)
, cnt    number
);

insert into bom values ('G', 'K', 2);
insert into bom values ('X', 'A', 1);
insert into bom values ('X', 'B', 2);
insert into bom values ('X', 'C', 4);
insert into bom values ('A', 'D', 2);
insert into bom values ('A', 'E', 2);
insert into bom values ('B', 'E', 4);
insert into bom values ('C', 'F', 2);
insert into bom values ('C', 'G', 3);
insert into bom values ('D', 'H', 1);
insert into bom values ('D', 'I', 4);
insert into bom values ('E', 'J', 2);
insert into bom values ('E', 'K', 4);
insert into bom values ('G', 'L', 5);
insert into bom values ('G', 'M', 2);

commit;

create table bom_node as
select distinct id
from (
  select parent as id from bom
  union
  select child as id from bom
);

create table bom_edge as
select
  rownum as id
, t.*
from bom t;
```

Create a graph:

```
CREATE PROPERTY GRAPH bom_graph
  VERTEX TABLES (
    bom_node
      KEY (id)
      LABEL part
      NO PROPERTIES
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
  p1.id AS p1_id
, p2.id AS p2_id
, LISTAGG(LISTAGG(CAST(e.num AS INTEGER), '*'), ' + ')||' =' AS fomula
FROM MATCH (p1) (-[e IS has_part]->(p)){1,100} (p2) ON bom_graph
WHERE p1.id = 'X'
GROUP BY p1_id, p2_id
ORDER BY p2_id
;
```
```
+-------------------------------------------------+
| p1_id | p2_id | fomula                  | total |
+-------------------------------------------------+
| X     | A     | 1 =                     | 1     |
| X     | B     | 2 =                     | 2     |
| X     | C     | 4 =                     | 4     |
| X     | D     | 1*2 =                   | 2     |
| X     | E     | 1*2 + 2*4 =             | 10    |
| X     | F     | 4*2 =                   | 8     |
| X     | G     | 4*3 =                   | 12    |
| X     | H     | 1*2*1 =                 | 2     |
| X     | I     | 1*2*4 =                 | 8     |
| X     | J     | 1*2*2 + 2*4*2 =         | 20    |
| X     | K     | 1*2*4 + 2*4*4 + 4*3*2 = | 64    |
| X     | L     | 4*3*5 =                 | 60    |
| X     | M     | 4*3*2 =                 | 24    |
+-------------------------------------------------+
```
