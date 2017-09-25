package fi.thl.thldtkk.api.metadata.security.annotation;

import fi.thl.thldtkk.api.metadata.security.UserRoles;
import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * Entity parameter of the target method must be named <code>entity</code> or denoted with <code>@P("entity")</code>.
 */
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("#entity.id == null ? hasAuthority('" + UserRoles.USER + "') : hasAuthority('" + UserRoles.ADMIN + "')")
public @interface UserCanCreateAdminCanUpdate {
}
