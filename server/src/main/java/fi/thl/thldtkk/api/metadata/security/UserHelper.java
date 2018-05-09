package fi.thl.thldtkk.api.metadata.security;

import fi.thl.thldtkk.api.metadata.domain.Organization;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class UserHelper {

  public boolean isCurrentUserLoggedIn() {
    return SecurityContextHolder.getContext().getAuthentication() != null ? true : false;
  }

  public boolean isCurrentUserAdmin() {
    return getUserRoles().contains(UserRoles.ADMIN);
  }

  public boolean isCurrentUserOrganizationAdmin() {
    return getUserRoles().contains(UserRoles.ORG_ADMIN);
  }

  public List<String> getUserRoles() {
    return SecurityContextHolder.getContext()
      .getAuthentication()
      .getAuthorities()
      .stream()
      .map(ga -> ga.getAuthority())
      .collect(Collectors.toList());
  }

  public Collection<Organization> getCurrentUserOrganizations() {
    Optional<UserWithProfile> user = getCurrentUser();
    return user.isPresent()
      ? user.get().getUserProfile().getOrganizations()
      : Collections.emptyList();
  }

  public Optional<UserWithProfile> getCurrentUser() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth instanceof AnonymousAuthenticationToken) {
      return Optional.empty();
    }
    else {
      return Optional.of((UserWithProfile) auth.getPrincipal());
    }
  }

}
