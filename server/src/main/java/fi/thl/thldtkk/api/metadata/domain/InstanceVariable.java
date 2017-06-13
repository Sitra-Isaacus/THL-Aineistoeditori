package fi.thl.thldtkk.api.metadata.domain;

import static com.google.common.base.Preconditions.checkArgument;
import com.google.common.collect.LinkedHashMultimap;
import com.google.common.collect.Multimap;
import fi.thl.thldtkk.api.metadata.domain.termed.Node;
import fi.thl.thldtkk.api.metadata.domain.termed.PropertyMappings;
import static fi.thl.thldtkk.api.metadata.domain.termed.PropertyMappings.toLangValueMap;
import static fi.thl.thldtkk.api.metadata.domain.termed.PropertyMappings.toLocalDate;
import static fi.thl.thldtkk.api.metadata.domain.termed.PropertyMappings.toPropertyValue;
import static fi.thl.thldtkk.api.metadata.domain.termed.PropertyMappings.toPropertyValues;
import fi.thl.thldtkk.api.metadata.domain.termed.StrictLangValue;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import static java.util.Objects.requireNonNull;
import java.util.Optional;
import java.util.UUID;

public class InstanceVariable {

    public static final String VALUE_DOMAIN_TYPE_DESCRIBED = "described";
    public static final String VALUE_DOMAIN_TYPE_ENUMERATED = "enumerated";

    private UUID id;
    private Map<String, String> prefLabel = new LinkedHashMap<>();
    private Map<String, String> description = new LinkedHashMap<>();
    private Map<String, String> freeConcepts = new LinkedHashMap<>();
    private LocalDate referencePeriodStart;
    private LocalDate referencePeriodEnd;
    private String technicalName;
    private String valueDomainType;
    private Quantity quantity;
    private Unit unit;
    private List<Concept> conceptsFromScheme = new ArrayList<>();

    public InstanceVariable() {

    }

    public InstanceVariable(UUID id) {
        this.id = requireNonNull(id);
    }

    public InstanceVariable(Node node) {
        this(node.getId());
        checkArgument(Objects.equals(node.getTypeId(), "InstanceVariable"));
        this.prefLabel = toLangValueMap(node.getProperties("prefLabel"));
        this.description = toLangValueMap(node.getProperties("description"));
        this.freeConcepts = toLangValueMap(node.getProperties("freeConcepts"));
        this.referencePeriodStart = toLocalDate(node.getProperties("referencePeriodStart"), null);
        this.referencePeriodEnd = toLocalDate(node.getProperties("referencePeriodEnd"), null);
        this.technicalName = PropertyMappings.toString(node.getProperties("technicalName"));
        this.valueDomainType = PropertyMappings.toString(node.getProperties("valueDomainType"));
        node.getReferences("quantity")
          .stream().findFirst().ifPresent(quantity -> this.quantity = new Quantity(quantity));
        node.getReferences("unit")
          .stream().findFirst().ifPresent(unit -> this.unit = new Unit(unit));
        node.getReferences("conceptsFromScheme")
          .forEach(c -> this.conceptsFromScheme.add(new Concept(c)));
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Map<String, String> getPrefLabel() {
        return prefLabel;
    }

    public Map<String, String> getDescription() {
        return description;
    }

    public Optional<LocalDate> getReferencePeriodStart() {
        return Optional.ofNullable(referencePeriodStart);
    }

    public Optional<LocalDate> getReferencePeriodEnd() {
        return Optional.ofNullable(referencePeriodEnd);
    }

    public Optional<String> getTechnicalName() {
        return Optional.ofNullable(technicalName);
    }

    public Optional<String> getValueDomainType() {
        return Optional.ofNullable(valueDomainType );
    }

    public void setValueDomainType(String valueDomainType) {
      this.valueDomainType = valueDomainType;
    }

    public Optional<Quantity> getQuantity() {
        return Optional.ofNullable(quantity);
    }

    public void setQuantity(Quantity quantity) {
      this.quantity = quantity;
    }

    public Optional<Unit> getUnit() {
        return Optional.ofNullable(unit);
    }

    public void setUnit(Unit unit) {
      this.unit = unit;
    }

    public List<Concept> getConceptsFromScheme() {
      return conceptsFromScheme;
    }

    public Map<String, String> getFreeConcepts() {
      return freeConcepts;
    }

    public Node toNode() {
        Multimap<String, StrictLangValue> props = LinkedHashMultimap.create();
        props.putAll("prefLabel", toPropertyValues(prefLabel));
        props.putAll("description", toPropertyValues(description));
        props.putAll("freeConcepts", toPropertyValues(freeConcepts));

        getReferencePeriodStart().ifPresent(v -> props.put("referencePeriodStart", toPropertyValue(v)));
        getReferencePeriodEnd().ifPresent(v -> props.put("referencePeriodEnd", toPropertyValue(v)));
        getTechnicalName().ifPresent((v -> props.put("technicalName", toPropertyValue(v))));
        getValueDomainType().ifPresent((v -> props.put("valueDomainType", toPropertyValue(v))));

        Multimap<String, Node> refs = LinkedHashMultimap.create();
        getQuantity().ifPresent(quantity -> refs.put("quantity", quantity.toNode()));
        getUnit().ifPresent(unit -> refs.put("unit", unit.toNode()));
        getConceptsFromScheme().forEach(c -> refs.put("conceptsFromScheme", c.toNode()));

        return new Node(id, "InstanceVariable", props, refs);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        InstanceVariable that = (InstanceVariable) o;
        return Objects.equals(id, that.id)
                && Objects.equals(prefLabel, that.prefLabel)
                && Objects.equals(description, that.description)
                && Objects.equals(referencePeriodStart, that.referencePeriodStart)
                && Objects.equals(referencePeriodEnd, that.referencePeriodEnd)
                && Objects.equals(technicalName, that.technicalName)
                && Objects.equals(valueDomainType, that.valueDomainType)
                && Objects.equals(quantity, that.quantity)
                && Objects.equals(unit, that.unit)
                && Objects.equals(conceptsFromScheme, that.conceptsFromScheme)
                && Objects.equals(freeConcepts, freeConcepts);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, prefLabel, description, referencePeriodStart,
          referencePeriodEnd, technicalName, valueDomainType, quantity, unit,
          conceptsFromScheme, freeConcepts);
    }

}
