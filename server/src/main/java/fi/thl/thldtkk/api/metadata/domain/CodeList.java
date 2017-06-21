package fi.thl.thldtkk.api.metadata.domain;

import fi.thl.thldtkk.api.metadata.domain.termed.Node;
import fi.thl.thldtkk.api.metadata.domain.termed.PropertyMappings;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import static com.google.common.base.Preconditions.checkArgument;
import static fi.thl.thldtkk.api.metadata.domain.termed.PropertyMappings.toLangValueMap;
import static fi.thl.thldtkk.api.metadata.domain.termed.PropertyMappings.toPropertyValue;
import static fi.thl.thldtkk.api.metadata.domain.termed.PropertyMappings.toPropertyValues;
import static java.util.Objects.requireNonNull;

public class CodeList {

  public static final String CODE_LIST_TYPE_EXTERNAL = "external";
  public static final String CODE_LIST_TYPE_INTERNAL = "internal";
  private static final String TERMED_NODE_CLASS = "CodeList";

  private UUID id;
  private String codeListType;
  private String referenceId;
  private Map<String, String> prefLabel = new LinkedHashMap<>();
  private Map<String, String> description = new LinkedHashMap<>();
  private Map<String, String> owner = new LinkedHashMap<>();
  private List<CodeItem> codeItems = new ArrayList<>();

  public CodeList(UUID id) {
    this.id = requireNonNull(id);
  }

  public CodeList(Node node) {
    this(node.getId());
    checkArgument(Objects.equals(node.getTypeId(), TERMED_NODE_CLASS));
    this.codeListType = PropertyMappings.toString(node.getProperties("codeListType"));
    this.referenceId = PropertyMappings.toString(node.getProperties("referenceId"));
    this.prefLabel = toLangValueMap(node.getProperties("prefLabel"));
    this.description = toLangValueMap(node.getProperties("description"));
    this.owner = toLangValueMap(node.getProperties("owner"));
    node.getReferences("codeItems")
      .forEach(ci -> this.codeItems.add(new CodeItem(ci)));
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public Optional<String> getCodeListType() {
    return Optional.ofNullable(codeListType);
  }

  public Optional<String> getReferenceId() {
    return Optional.ofNullable(referenceId);
  }

  public void setReferenceId(String referenceId) {
    this.referenceId = referenceId;
  }

  public Map<String, String> getPrefLabel() {
    return prefLabel;
  }

  public Map<String, String> getDescription() {
    return description;
  }

  public Map<String, String> getOwner() {
    return owner;
  }


  public List<CodeItem> getCodeItems() {
    return codeItems;
  }

  public Node toNode() {
    Node node = new Node(id, TERMED_NODE_CLASS);
    getCodeListType().ifPresent(clt -> node.getProperties().put("codeListType", toPropertyValue(clt)));
    getReferenceId().ifPresent(rid -> node.getProperties().put("referenceId", toPropertyValue(rid)));
    node.addProperties("prefLabel", toPropertyValues(prefLabel));
    node.addProperties("description", toPropertyValues(description));
    node.addProperties("owner", toPropertyValues(owner));
    getCodeItems().forEach(ci -> node.addReference("codeItems", ci.toNode()));
    return node;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    CodeList that = (CodeList) o;
    return Objects.equals(id, that.id)
      && Objects.equals(codeListType, that.codeListType)
      && Objects.equals(referenceId, that.referenceId)
      && Objects.equals(prefLabel, that.prefLabel)
      && Objects.equals(description, that.description)
      && Objects.equals(owner, that.owner)
      && Objects.equals(codeItems, that.codeItems);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, referenceId, codeListType, prefLabel, description, owner, codeItems);
  }

}
