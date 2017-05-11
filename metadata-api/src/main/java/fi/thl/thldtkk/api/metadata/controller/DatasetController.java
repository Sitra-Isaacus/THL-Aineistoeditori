package fi.thl.thldtkk.api.metadata.controller;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import fi.thl.thldtkk.api.metadata.util.spring.annotation.GetJsonMapping;
import fi.thl.thldtkk.api.metadata.util.spring.annotation.PostJsonMapping;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import static org.springframework.http.HttpStatus.NO_CONTENT;
import static org.springframework.http.MediaType.APPLICATION_JSON_UTF8_VALUE;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import static org.springframework.web.util.UriComponentsBuilder.fromPath;

@RestController
@RequestMapping("/datasets")
public class DatasetController {

    @Autowired
    private RestTemplate restTemplate;

    private String datasetsPath = "/types/DataSet/nodes";

    @GetJsonMapping
    public JsonArray query(
            @RequestParam(name = "query", defaultValue = "", required = false) String query,
            @RequestParam(name = "max", defaultValue = "", required = false) Integer max) {

        String url = fromPath(datasetsPath)
                .queryParam("query", query)
                .queryParam("max", max)
                .queryParam("sort", "properties.prefLabel.fi.sortable")
                .toUriString();

        return restTemplate.getForObject(url, JsonArray.class);
    }

    @GetJsonMapping("/{id}")
    public JsonObject get(@PathVariable("id") UUID id) {
        String url = fromPath(datasetsPath).path("/" + id.toString()).toUriString();

        return restTemplate.getForObject(url, JsonObject.class);
    }

    @GetJsonMapping("/{id}/owners")
    public JsonArray getDatasetOwners(@PathVariable("id") UUID id) {
        String url = fromPath(datasetsPath)
                .path("/" + id.toString())
                .path("/references/owner")
                .toUriString();

        return restTemplate.getForObject(url, JsonArray.class);
    }

    @GetJsonMapping("/{id}/instanceVariables")
    public JsonArray getDatasetInstanceVariables(@PathVariable("id") UUID id) {
        String url = fromPath(datasetsPath)
                .path("/" + id.toString())
                .path("/references/instanceVariable")
                .toUriString();

        return restTemplate.getForObject(url, JsonArray.class);
    }

    @GetJsonMapping("/{id}/populations")
    public JsonArray getDatasetPopulations(@PathVariable("id") UUID id) {
        String url = fromPath(datasetsPath)
                .path("/" + id.toString())
                .path("/references/population")
                .toUriString();

        return restTemplate.getForObject(url, JsonArray.class);
    }

    @GetJsonMapping("/{id}/usageConditions")
    public JsonArray getDatasetUsageConditions(@PathVariable("id") UUID id) {
        String url = fromPath(datasetsPath)
                .path("/")
                .path(id.toString())
                .path("/references/usageCondition")
                .toUriString();

        return restTemplate.getForObject(url, JsonArray.class);
    }

    @GetJsonMapping("/{id}/ownerOrganizationUnits")
    public JsonArray getDatasetOrganizationUnits(@PathVariable("id") UUID id) {
        String url = fromPath(datasetsPath)
                .path("/")
                .path(id.toString())
                .path("/references/ownerOrganizationUnit")
                .toUriString();

        return restTemplate.getForObject(url, JsonArray.class);
    }

    @GetJsonMapping("/{id}/personsInRoles")
    public JsonArray getDatasetPersonsInRoles(@PathVariable("id") UUID id) {
        String url = fromPath(datasetsPath)
                .path("/")
                .path(id.toString())
                .path("/references/personInRole")
                .toUriString();

        return restTemplate.getForObject(url, JsonArray.class);
    }

    @PostJsonMapping(produces = APPLICATION_JSON_UTF8_VALUE)
    public JsonObject post(@RequestBody JsonObject dataset) {
        String url = fromPath(datasetsPath).toUriString();

        return restTemplate.postForObject(url, dataset, JsonObject.class);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(NO_CONTENT)
    public void delete(@PathVariable("id") UUID id) {
        String url = fromPath(datasetsPath).path("/" + id.toString()).toUriString();

        restTemplate.delete(url);
    }

    @GetJsonMapping("/{id}/lifecyclePhases")
    public JsonArray getLifecyclePhases(@PathVariable("id") UUID id) {
        String url = fromPath(datasetsPath)
                .path("/" + id.toString())
                .path("/references/lifecyclePhase")
                .toUriString();

        return restTemplate.getForObject(url, JsonArray.class);
    }

}
