package fi.thl.thldtkk.api.metadata.service.v3.termed;

import static fi.thl.thldtkk.api.metadata.domain.query.KeyValueCriteria.keyValue;
import static java.util.stream.Collectors.toList;

import fi.thl.thldtkk.api.metadata.domain.Organization;
import fi.thl.thldtkk.api.metadata.domain.termed.Node;
import fi.thl.thldtkk.api.metadata.domain.termed.NodeId;
import fi.thl.thldtkk.api.metadata.service.v3.OrganizationService;
import fi.thl.thldtkk.api.metadata.service.v3.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class OrganizationServiceImpl implements OrganizationService {

  private Repository<NodeId, Node> nodes;

  public OrganizationServiceImpl(Repository<NodeId, Node> nodes) {
    this.nodes = nodes;
  }

  @Override
  public List<Organization> findAll() {
    return nodes.query(keyValue("type.id", "Organization"))
        .map(Organization::new)
        .collect(toList());
  }

  @Override
  public List<Organization> find(String query, int max) {
    return findAll();
  }

  @Override
  public Optional<Organization> get(UUID id) {
    return nodes.get(new NodeId(id, "Organization")).map(Organization::new);
  }

}
