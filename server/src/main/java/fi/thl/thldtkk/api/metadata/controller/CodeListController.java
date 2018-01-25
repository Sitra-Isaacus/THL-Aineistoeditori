package fi.thl.thldtkk.api.metadata.controller;

import static org.springframework.http.HttpStatus.NO_CONTENT;
import static org.springframework.http.MediaType.APPLICATION_JSON_UTF8_VALUE;

import fi.thl.thldtkk.api.metadata.domain.CodeList;
import fi.thl.thldtkk.api.metadata.service.CodeListService;
import fi.thl.thldtkk.api.metadata.util.spring.annotation.GetJsonMapping;
import fi.thl.thldtkk.api.metadata.util.spring.annotation.PostJsonMapping;
import fi.thl.thldtkk.api.metadata.util.spring.exception.NotFoundException;
import java.util.List;
import java.util.UUID;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(API.PATH_WITH_VERSION + "/codeLists")
public class CodeListController {

  @Autowired
  private CodeListService codeListService;

  @GetJsonMapping("/{codeListId}")
  public CodeList getById(@PathVariable("codeListId") UUID codeListId) {
    return codeListService.get(codeListId).orElseThrow(NotFoundException::new);
  }

  @GetJsonMapping
  public List<CodeList> query(@RequestParam(value = "query", defaultValue = "") String query) {
    return codeListService.find(query, -1);
  }

  @PostJsonMapping(produces = APPLICATION_JSON_UTF8_VALUE)
  public CodeList save(@RequestBody @Valid CodeList codeList) {
    return codeListService.save(codeList);
  }

  @DeleteMapping("/{codeListId}")
  @ResponseStatus(NO_CONTENT)
  public void delete(@PathVariable("codeListId") UUID codeListId) {
    codeListService.delete(codeListId);
  }
}
