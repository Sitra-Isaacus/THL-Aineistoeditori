package fi.thl.thldtkk.api.metadata.controller;

import fi.thl.thldtkk.api.metadata.domain.InstanceVariable;
import fi.thl.thldtkk.api.metadata.domain.Variable;
import fi.thl.thldtkk.api.metadata.service.VariableService;
import fi.thl.thldtkk.api.metadata.util.spring.annotation.GetJsonMapping;
import fi.thl.thldtkk.api.metadata.util.spring.annotation.PostJsonMapping;
import fi.thl.thldtkk.api.metadata.util.spring.exception.NotFoundException;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import static java.util.stream.Collectors.toList;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import static org.springframework.http.HttpStatus.NO_CONTENT;
import static org.springframework.http.MediaType.APPLICATION_JSON_UTF8_VALUE;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Api(description = "API for variables")
@RestController
@RequestMapping("/api/v2/variables")
public class VariableController {

    @Autowired
    private VariableService variableService;

    @ApiOperation("List all variables")
    @GetJsonMapping
    public List<Variable> queryVariables(
            @RequestParam(value = "query", required = false, defaultValue = "") String query,
            @RequestParam(value = "max", required = false, defaultValue = "10") Integer maxResults) {
        return variableService.query(query, maxResults).collect(toList());
    }

    @ApiOperation("Get one variable by ID")
    @GetJsonMapping("/{variable}")
    public Variable getVariable(@PathVariable("variable") UUID variableId) {
        return variableService.get(variableId).orElseThrow(NotFoundException::new);
    }

    @ApiOperation("List all instances of given variable")
    @GetJsonMapping("/{variable}/instanceVariables")
    public List<InstanceVariable> getInstanceVariables(
            @PathVariable("variable") UUID variableId,
            @RequestParam(value = "max", required = false, defaultValue = "-1") Integer maxResults) {
        return variableService.getInstanceVariables(variableId, maxResults).collect(Collectors.toList());
    }

    @PostJsonMapping(produces = APPLICATION_JSON_UTF8_VALUE)
    public Variable postVariable(@RequestBody @Valid Variable variable) {
        return variableService.save(variable);
    }

    @DeleteMapping("/{variableId}")
    @ResponseStatus(NO_CONTENT)
    public void deleteDatasetInstanceVariable(
            @PathVariable("variableId") UUID variableId) {
        variableService.delete(variableId);
    }
}
