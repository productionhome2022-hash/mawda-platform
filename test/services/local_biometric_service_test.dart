import 'package:flutter_test/flutter_test.dart';
import 'package:mawda_app/services/local_biometric_service.dart';

class FakeBiometricAdapter implements LocalBiometricAdapter {
  bool supported = true;
  bool canCheck = true;
  List<String> enrolled = <String>['fingerprint'];
  bool authenticationResult = true;
  bool shouldThrow = false;
  int promptCalls = 0;

  @override
  Future<bool> isDeviceSupported() async => supported;

  @override
  Future<bool> canCheckBiometrics() async => canCheck;

  @override
  Future<List<String>> getAvailableBiometrics() async => enrolled;

  @override
  Future<bool> authenticate() async {
    promptCalls += 1;
    if (shouldThrow) throw StateError('native prompt failed');
    return authenticationResult;
  }
}

void main() {
  test('reports success only after the native prompt succeeds', () async {
    final adapter = FakeBiometricAdapter();
    final result = await LocalBiometricService(adapter: adapter).authenticate();

    expect(result.status, LocalBiometricStatus.authenticated);
    expect(result.succeeded, isTrue);
    expect(adapter.promptCalls, 1);
  });

  test('does not show a prompt when the device lacks biometric support', () async {
    final adapter = FakeBiometricAdapter()..supported = false;
    final result = await LocalBiometricService(adapter: adapter).authenticate();

    expect(result.status, LocalBiometricStatus.unavailable);
    expect(adapter.promptCalls, 0);
  });

  test('does not show a prompt when biometrics are not enrolled', () async {
    final adapter = FakeBiometricAdapter()..enrolled = <String>[];
    final result = await LocalBiometricService(adapter: adapter).authenticate();

    expect(result.status, LocalBiometricStatus.notEnrolled);
    expect(adapter.promptCalls, 0);
  });

  test('reports user cancellation without treating it as success', () async {
    final adapter = FakeBiometricAdapter()..authenticationResult = false;
    final result = await LocalBiometricService(adapter: adapter).authenticate();

    expect(result.status, LocalBiometricStatus.cancelled);
    expect(result.succeeded, isFalse);
  });

  test('fails closed when the native plugin throws', () async {
    final adapter = FakeBiometricAdapter()..shouldThrow = true;
    final result = await LocalBiometricService(adapter: adapter).authenticate();

    expect(result.status, LocalBiometricStatus.failed);
    expect(result.succeeded, isFalse);
  });
}
