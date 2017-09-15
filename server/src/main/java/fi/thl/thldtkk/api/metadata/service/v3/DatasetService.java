package fi.thl.thldtkk.api.metadata.service.v3;

import fi.thl.thldtkk.api.metadata.domain.Dataset;
import fi.thl.thldtkk.api.metadata.domain.InstanceVariable;
import java.util.List;
import java.util.UUID;

public interface DatasetService extends Service<UUID, Dataset> {

  List<Dataset> find(UUID organizationId, UUID datasetTypeId, String query, int max);

  List<Dataset> find(UUID organizationId, UUID datasetTypeId, String query, int max, String sort);

  Dataset saveNotUpdatingInstanceVariables(Dataset dataset);

  InstanceVariable saveDatasetInstanceVariable(UUID datasetId, InstanceVariable instanceVariable);

  void deleteDatasetInstanceVariable(UUID datasetId, UUID instanceVariableId);

  List<Dataset> getDatasetsByUnitType(UUID unitTypeId);

}
