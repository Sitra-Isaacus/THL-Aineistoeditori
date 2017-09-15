package fi.thl.thldtkk.api.metadata.service.v3;

import fi.thl.thldtkk.api.metadata.domain.Dataset;

import java.util.UUID;

public interface DatasetPublishingService {

  Dataset publish(UUID datasetId);

  Dataset withdraw(UUID datasetId);

}
