package fi.thl.thldtkk.api.metadata.service;

import fi.thl.thldtkk.api.metadata.domain.UserProfile;

import java.util.Optional;
import java.util.UUID;

public interface UserProfileService extends Service<UUID, UserProfile> {
  Optional<UserProfile> getByExternalId(String externalId);
}
