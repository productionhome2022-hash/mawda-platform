/// Allow-list policy for public Android APK download URLs.
///
/// The official Mawdda website should be the primary configured URL. Other
/// distribution hosts may be added explicitly as approved mirrors. Exact host
/// matching is intentional: wildcards and arbitrary HTTPS destinations are
/// not accepted.
bool isApprovedAndroidDownloadUrl(String value, String allowedHostsConfig) {
  final uri = Uri.tryParse(value.trim());
  if (uri == null ||
      uri.scheme.toLowerCase() != 'https' ||
      uri.host.isEmpty ||
      uri.userInfo.isNotEmpty ||
      (uri.hasPort && uri.port != 443)) {
    return false;
  }

  final allowedHosts = allowedHostsConfig
      .split(',')
      .map((host) => host.trim().toLowerCase())
      .where((host) =>
          host.isNotEmpty &&
          !host.contains('*') &&
          !host.contains('/') &&
          !host.contains(':') &&
          !host.contains(' '))
      .toSet();

  return allowedHosts.contains(uri.host.toLowerCase());
}
