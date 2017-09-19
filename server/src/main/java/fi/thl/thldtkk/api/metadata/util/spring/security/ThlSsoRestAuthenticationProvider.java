package fi.thl.thldtkk.api.metadata.util.spring.security;

import fi.thl.thldtkk.api.metadata.util.EncryptionUtils;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Objects;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

public class ThlSsoRestAuthenticationProvider implements AuthenticationProvider {

  private final String url;
  private final String application;
  private final String secretKey;

  private final RestTemplate restTemplate;

  public ThlSsoRestAuthenticationProvider(String url, String application, String secretKey) {
    this.url = url.endsWith("/") ? url : url + "/";
    this.application = application;
    this.secretKey = secretKey;
    this.restTemplate = new RestTemplate();
  }

  @Override
  public boolean supports(Class<?> cls) {
    return Objects.equals(cls, UsernamePasswordAuthenticationToken.class);
  }

  @Override
  public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    if (authentication instanceof UsernamePasswordAuthenticationToken) {
      UsernamePasswordAuthenticationToken usernameAndPassword =
          ((UsernamePasswordAuthenticationToken) authentication);

      if (authenticate(
          usernameAndPassword.getPrincipal().toString(),
          usernameAndPassword.getCredentials().toString())) {

        return new UsernamePasswordAuthenticationToken(
            usernameAndPassword.getPrincipal(),
            usernameAndPassword.getCredentials(),
            Collections.emptyList());
      }
    }
    return null;
  }

  private boolean authenticate(String username, String password) {
    MultiValueMap<String, String> request = new LinkedMultiValueMap<>();
    String[] signatureAndIv = getSignatureAndIv(application, secretKey);
    request.add("application", application);
    request.add("signature", signatureAndIv[0]);
    request.add("iv", signatureAndIv[1]);
    request.add("username", username);
    request.add("password", password);
    try {
      return restTemplate.postForEntity(url + "authenticate", request, String.class)
          .getStatusCode().is2xxSuccessful();
    } catch (HttpClientErrorException e) {
      throw new BadCredentialsException("", e);
    }
  }

  private String[] getSignatureAndIv(String application, String secretKey) {
    try {
      return EncryptionUtils.encrypt(application + System.currentTimeMillis(), secretKey);
    } catch (GeneralSecurityException e) {
      throw new RuntimeException(e);
    }
  }

}
