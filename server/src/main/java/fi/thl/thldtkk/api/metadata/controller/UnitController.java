package fi.thl.thldtkk.api.metadata.controller;

import static org.springframework.http.MediaType.APPLICATION_JSON_UTF8_VALUE;

import fi.thl.thldtkk.api.metadata.domain.Unit;
import fi.thl.thldtkk.api.metadata.service.UnitService;
import fi.thl.thldtkk.api.metadata.util.spring.annotation.GetJsonMapping;
import fi.thl.thldtkk.api.metadata.util.spring.annotation.PostJsonMapping;
import fi.thl.thldtkk.api.metadata.util.spring.exception.NotFoundException;
import java.util.List;
import java.util.UUID;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(API.PATH_WITH_VERSION + "/units")
public class UnitController {

  @Autowired
  private UnitService unitService;

  @GetJsonMapping("/{unitId}")
  public Unit getById(@PathVariable("unitId") UUID unitId) {
    return unitService.get(unitId).orElseThrow(NotFoundException::new);
  }

  @GetJsonMapping
  public List<Unit> query(@RequestParam(value = "query", defaultValue = "") String query) {
    return unitService.find(query, -1);
  }

  @PostJsonMapping(produces = APPLICATION_JSON_UTF8_VALUE)
  public Unit save(@RequestBody @Valid Unit unit) {
    return unitService.save(unit);
  }

}
