package fi.thl.thldtkk.api.metadata.util;

public final class RegularExpressions {

  public static final String ALL = "(?s)^.*$";

  public static final String CODE = "[A-Za-z0-9_\\-]+";

  public static final String UUID =
      "[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}";

  public static final String URN_UUID =
      "urn:uuid:" + UUID;

  public static final String ISO_8601_DATE =
      "\\d{4}(-\\d{2}(-\\d{2}(T\\d{2}:\\d{2}(:\\d{2})?(\\.\\d+)?(([+-]\\d{2}:\\d{2})|Z)?)?)?)?";

  private RegularExpressions() {
  }

}
