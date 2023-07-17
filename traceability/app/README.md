# Traceability Demo Application 

An example Java web application based on [Micronaut](https://docs.micronaut.io/) which embeds Oracle's Graph Visualization library. The server queries the graph data from an Oracle Database using [PGQL](https://pgql-lang.org/).

The key source files to look at are

* `src/main/resources/public/index.html`: the HTML file served in the browser embedding the visualization library
* `src/main/java/com/oracle/example/TraceController.java`: implements the REST endpoints called by `index.html` 
* `src/main/java/com/oracle/example/GraphClient.java`: wraps the graph server APIs, called by HRController

## Pre-requisites

1. Oracle JDK 11 (or OpenJDK 11)
2. A running Oracle Graph Server. Download from [oracle.com](https://www.oracle.com/database/technologies/spatialandgraph/property-graph-features/graph-server-and-client/graph-server-and-client-downloads.html) and install [as per documentation](https://docs.oracle.com/en/database/oracle/property-graph/23.1/spgdg/using-rpm-installation.html#GUID-EF1C77D2-86B5-4F16-AA43-3B37BE5FE4B9).
3. A running Oracle Database (e.g. [Autonomous Database](https://www.oracle.com/autonomous-database/))
4. This example uses the [sample dataset](https://objectstorage.ap-tokyo-1.oraclecloud.com/n/nr92jg8wdcil/b/public/o/traceability.zip) explained in the [article](https://medium.com/oracledevs/d65521510975). Import this dataset into your database.
5. Create a graph out of the dataset using the following statement:

```
CREATE PROPERTY GRAPH trace_all
  VERTEX TABLES (
    trace_bom_node
      KEY (id)
      LABEL part
      PROPERTIES (id, part_id, lot)
  , trace_scn_node
      KEY (id)
      LABEL place
      PROPERTIES (id, place_id, lot)
  )
  EDGE TABLES (
    trace_bom_edge
      KEY (id)
      SOURCE KEY(child_id) REFERENCES trace_bom_node (id)
      DESTINATION KEY(parent_id) REFERENCES trace_bom_node (id)
      LABEL part_of
      NO PROPERTIES
  , trace_scn_edge
      KEY (id)
      SOURCE KEY(src_id) REFERENCES trace_scn_node (id)
      DESTINATION KEY(dst_id) REFERENCES trace_scn_node (id)
      LABEL supplied_to
      NO PROPERTIES
  , trace_b2s_edge
      KEY (id)
      SOURCE KEY(part_id) REFERENCES trace_bom_node (id)
      DESTINATION KEY(place_id) REFERENCES trace_scn_node (id)
      LABEL produced_at
      NO PROPERTIES
  )
```

## Usage

1. Clone this repository 
2. Download the "Oracle Graph Visualization library" [from oracle.com](https://www.oracle.com/database/technologies/spatialandgraph/property-graph-features/graph-server-and-client/graph-server-and-client-downloads.html)
3. Unzip the library into the `src/main/resources/public` directory. For example:

```
unzip oracle-graph-visualization-library-<version>.zip -d src/main/resources/public/
```

4. Create `src/main/resources/application.yml` and set login information
  * `<pgxUrl>` being the URL of the Graph Server, e.g. `https://myhost:7007`
  * `<jdbcUrl>` being the JDBC URL of the Oracle Database the Graph Server should connect to, e.g. `jdbc:oracle:thin:@myhost:1521/orcl` 
  * `<username>` being the Oracle Database username to authenticate the example application with the Graph Server, e.g. `graphuser`
  * `<password>` being the Oracle Database password to authenticate the example application with the Graph Server, e.g. `password123`

5. Run the following command to start the example app locally:

```
./gradlew run
```

Then open your browser at `http://localhost:8080`.

When you click on the <em>Query</em> button, a request is made to `/trace/by_str`, which fetches the tree starting from the given part (by default `P1112`) from the TRACE_ALL graph using a PGQL query. 

![](screenshot-1.png)

When you right-click on one of the resulting nodes and then select <em>Expand</em>, a request to `/trace/by_ids` is being made, which fetches the tree from the selected node via another PGQL query.

![](screenshot-2.png)
![](screenshot-3.png)

## Troubleshooting

If you get any errors, 
* check the log output from the server on the terminal where the Gradle command is running
* use browser debug tools (e.g. Chrome Developer Tools) to inspect request/response and console logs
