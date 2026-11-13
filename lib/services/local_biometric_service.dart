import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/services.dart';
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

abstract interface class LocalBiometricAdapter {
  Future<bool> authenticate();
}

class LocalBiometricService {
  LocalBiometricService({LocalBiometricAdapter? adapter})
      : _adapter = adapter ?? _LocalAuthAdapter();

  final LocalBiometricAdapter _adapter;

  /// Runs the native biometric prompt only. No biometric material or
  /// success assertion is uploaded, persisted, or treated as server proof.
  ///
  /// Do not preflight with getAvailableBiometrics: some Android releases
  /// cannot enumerate every biometric modality (for example, face unlock).
  /// Let the OS decide whether an enrolled biometric can authenticate.
  Future<LocalBiometricResult> authenticate() async {
    if (kIsWeb) {
      return const LocalBiometricResult(LocalBiometricStatus.unavailable);
    }

    try {
      final authenticated = await _adapter.authenticate();
      return LocalBiometricResult(
        authenticated
            ? LocalBiometricStatus.authenticated
            : LocalBiometricStatus.cancelled,
      );
    } on PlatformException catch (error) {
      final code = error.code.toLowerCase();
      if (code.contains('notenrolled') || code.contains('no_biometrics_enrolled')) {
        return const LocalBiometricResult(LocalBiometricStatus.notEnrolled);
      }
      if (code.contains('notavailable') || code.contains('nohardware') ||
          code.contains('no_biometric_hardware')) {
        return const LocalBiometricResult(LocalBiometricStatus.unavailable);
      }
      if (code.contains('cancel')) {
        return const LocalBiometricResult(LocalBiometricStatus.cancelled);
      }
      return const LocalBiometricResult(LocalBiometricStatus.failed);
    } catch (_) {
      return const LocalBiometricResult(LocalBiometricStatus.failed);
    }
  }
}

class _LocalAuthAdapter implements LocalBiometricAdapter {
  _LocalAuthAdapter() : _auth = LocalAuthentication();

  final LocalAuthentication _auth;

  @override
  Future<bool> authenticate() => _auth.authenticate(
        localizedReason: 'أكد المصادقة البيومترية محلياً للمتابعة في مودة.',
        options: const AuthenticationOptions(
          biometricOnly: true,
          stickyAuth: true,
        ),
      );
}
