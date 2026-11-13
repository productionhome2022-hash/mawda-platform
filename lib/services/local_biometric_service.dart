import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:local_auth/local_auth.dart';

enum LocalBiometricStatus {
  authenticated,
  unavailable,
  notEnrolled,
  cancelled,
  failed,
}

class LocalBiometricResult {
  const LocalBiometricResult(this.status);

  final LocalBiometricStatus status;

  bool get succeeded => status == LocalBiometricStatus.authenticated;
}

/// Adapter keeps the native plugin replaceable and makes the decision logic testable.
abstract interface class LocalBiometricAdapter {
  Future<bool> isDeviceSupported();
  Future<bool> canCheckBiometrics();
  Future<List<String>> getAvailableBiometrics();
  Future<bool> authenticate();
}

class LocalBiometricService {
  LocalBiometricService({LocalBiometricAdapter? adapter})
      : _adapter = adapter ?? _LocalAuthAdapter();

  final LocalBiometricAdapter _adapter;

  /// Runs a device-local biometric prompt only. No biometric material or
  /// success assertion is uploaded, persisted, or treated as server proof.
  Future<LocalBiometricResult> authenticate() async {
    if (kIsWeb) {
      return const LocalBiometricResult(LocalBiometricStatus.unavailable);
    }
    try {
      if (!await _adapter.isDeviceSupported() ||
          !await _adapter.canCheckBiometrics()) {
        return const LocalBiometricResult(LocalBiometricStatus.unavailable);
      }

      final enrolled = await _adapter.getAvailableBiometrics();
      if (enrolled.isEmpty) {
        return const LocalBiometricResult(LocalBiometricStatus.notEnrolled);
      }

      final authenticated = await _adapter.authenticate();
      return LocalBiometricResult(
        authenticated
            ? LocalBiometricStatus.authenticated
            : LocalBiometricStatus.cancelled,
      );
    } catch (_) {
      return const LocalBiometricResult(LocalBiometricStatus.failed);
    }
  }
}

class _LocalAuthAdapter implements LocalBiometricAdapter {
  _LocalAuthAdapter() : _auth = LocalAuthentication();

  final LocalAuthentication _auth;

  @override
  Future<bool> isDeviceSupported() => _auth.isDeviceSupported();

  @override
  Future<bool> canCheckBiometrics() => _auth.canCheckBiometrics;

  @override
  Future<List<String>> getAvailableBiometrics() async =>
      (await _auth.getAvailableBiometrics())
          .map((type) => type.name)
          .toList(growable: false);

  @override
  Future<bool> authenticate() => _auth.authenticate(
        localizedReason: 'أكد المصادقة البيومترية محلياً للمتابعة في مودة.',
        options: const AuthenticationOptions(
          biometricOnly: true,
          stickyAuth: true,
        ),
      );
}
