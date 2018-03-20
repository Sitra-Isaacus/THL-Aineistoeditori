package fi.thl.thldtkk.api.metadata.service;

import fi.thl.thldtkk.api.metadata.domain.Variable;

import java.util.Optional;
import java.util.UUID;

public interface VariableService extends Service<UUID, Variable> {

    Optional<Variable> findByPrefLabel(String prefLabel);
}
