package fi.thl.thldtkk.api.metadata.controller;

import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.module.mockmvc.RestAssuredMockMvc;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.web.context.WebApplicationContext;

import static com.jayway.restassured.module.mockmvc.RestAssuredMockMvc.given;
import static org.hamcrest.Matchers.containsString;

@RunWith(SpringRunner.class)
@SpringBootTest
public class UsageConditionControllerTest {
  @Autowired
  private WebApplicationContext context;
  @Autowired
  private UsageConditionController controller;

  @Before
  public void initializeWebAppContext() {
    RestAssuredMockMvc.webAppContextSetup(context);
  }

  @After
  public void resetWebAppContext() {
    RestAssuredMockMvc.reset();
  }

  @Test
  public void shouldQueryAllUsageConditions() {
    given()
        .standaloneSetup(controller)
        .when()
        .get("/usageconditions?max=-1")
        .then()
        .statusCode(HttpStatus.OK.value())
        .contentType(ContentType.JSON)
        .body(containsString("(A)"));
  }
}
