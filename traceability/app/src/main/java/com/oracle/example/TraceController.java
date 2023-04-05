package com.oracle.example;

import javax.security.auth.login.LoginException;

import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Error;
import io.micronaut.http.annotation.Produces;
import io.micronaut.http.annotation.QueryValue;
import io.micronaut.http.hateoas.JsonError;
import io.micronaut.http.hateoas.Link;
import io.micronaut.web.router.exceptions.UnsatisfiedQueryValueRouteException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Controller("/trace")
public class TraceController {

  private static Logger log = LoggerFactory.getLogger(TraceController.class);

  GraphClient graphClient;

  public TraceController(GraphClient graphClient) {
    this.graphClient = graphClient;
  }

  @Get("/by_str")
  @Produces(MediaType.APPLICATION_JSON)
  public String getDirects(@QueryValue String str1, @QueryValue String str2) throws LoginException {
    String pgql = "SELECT e FROM MATCH ALL (p1) (-[r]->(p)){1,10} (p2) ONE ROW PER STEP ( v1, e, v2 ) ON trace_all ";
    if (str1.charAt(0) == 'P') {
      pgql = pgql + "WHERE p1.id = '" + str1 + "_" + str2 + "' LIMIT 1500";
    } else if (str1.charAt(0) == 'I') {
      pgql = pgql + "WHERE p2.id = '" + str1 + "_" + str2 + "' LIMIT 1500";
    }
    log.info("running {}", pgql);
    return graphClient.query(pgql);
  }

  @Get("/by_ids")
  @Produces(MediaType.APPLICATION_JSON)
  public String getNeighbors(@QueryValue String ids) throws LoginException {
    String[] id_array = ids.split(",")[0].split("[(|)]")[1].split("_"); // TRACE_BOM_NODE(P1112_0269322),TRACE_BOM_NODE(P1112_0269323),...
    String str1 = id_array[0]; // P1112
    String str2 = id_array[1]; // 0269322
    String pgql = "SELECT e FROM MATCH ALL (p1) (-[r]->(p)){1,10} (p2) ONE ROW PER STEP ( v1, e, v2 ) ON trace_all ";
    if (str1.charAt(0) == 'P') {
      pgql = pgql + "WHERE p1.id = '" + str1 + "_" + str2 + "' LIMIT 1500";
    } else if (str1.charAt(0) == 'I') {
      pgql = pgql + "WHERE p2.id = '" + str1 + "_" + str2 + "' LIMIT 1500";
    }
    log.info("running {}", pgql);
    return graphClient.query(pgql);
  }

  @Error(global = true)
  public HttpResponse<JsonError> error(HttpRequest request, Throwable e) {
    log.error("processing exception {}", e.getMessage(), e);
    JsonError error = new JsonError(e.getMessage()).link(Link.SELF, Link.of(request.getUri()));
    if (e.getClass() == IllegalArgumentException.class || e.getClass() == UnsatisfiedQueryValueRouteException.class) {
      return HttpResponse.<JsonError>badRequest().body(error);
    }
    return HttpResponse.<JsonError>serverError().body(error);
  }
}
