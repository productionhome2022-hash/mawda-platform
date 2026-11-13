import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mawda_app/services/local_biometric_service.dart';

class FakeBiometricAdapter implements LocalBiometricAdapter {
  bool authenticationResult = true;
  PlatformException? platformException;
  bool shouldThrow = false;
  int promptCalls = 0;

  @override
  Future<bool> authenticate() async {
    promptCalls += 1;
    if (platformException != null) throw platformException!;
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

  test('reports cancellation without treating it as success', () async {
    final adapter = FakeBiometricAdapter()..authenticationResult = false;
    final result = await LocalBiometricService(adapter: adapter).authenticate();

    expect(result.status, LocalBiometricStatus.cancelled);
    expect(result.succeeded, isFalse);
  });

  test('classifies missing biometric enrollment', () async {
    final adapter = FakeBiometricAdapter()
      ..platformException = PlatformException(code: 'NotEnrolled');
    final result = await LocalBiometricService(adapter: adapter).authenticate();

    expect(result.status, LocalBiometricStatus.notEnrolled);
  });

  test('classifies unavailable biometric hardware', () async {
    final adapter = FakeBiometricAdapter()
      ..platformException = PlatformException(code: 'NotAvailable');
    final result = await LocalBiometricService(adapter: adapter).authenticate();

    expect(result.status, LocalBiometricStatus.unavailable);
  });

  test('fails closed when the native plugin throws an unexpected error', () async {
    final adapter = FakeBiometricAdapter()..shouldThrow = true;
    final result = await LocalBiometricService(adapter: adapter).authenticate();

    expect(result.status, LocalBiometricStatus.failed);
    expect(result.succeeded, isFalse);
  });
}
