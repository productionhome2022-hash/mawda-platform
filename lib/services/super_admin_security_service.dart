import 'package:cloud_functions/cloud_functions.dart';

class SuperAdminSecurityService {
  final FirebaseFunctions _functions = FirebaseFunctions.instance;

  Future<Map<String, dynamic>> getOperationsOverview() async {
    final result = await _functions.httpsCallable('getOwnerOperationsOverview').call();
    return Map<String, dynamic>.from(result.data as Map);
  }

  Future<Map<String, dynamic>> setRegistrationPolicy({
    required bool enabled,
    required int minimumAge,
  }) async {
    final result = await _functions.httpsCallable('setRegistrationPolicy').call({
      'enabled': enabled,
      'minimumAge': minimumAge,
    });
    return Map<String, dynamic>.from(result.data as Map);
  }

  Future<Map<String, dynamic>> getMemberSummary(String memberUid) async {
    final result = await _functions.httpsCallable('getOwnerMemberSummary').call({
      'memberUid': memberUid.trim(),
    });
    return Map<String, dynamic>.from(result.data as Map);
  }

  Future<void> setMemberAccessStatus({
    required String memberUid,
    required String status,
    required String reason,
  }) async {
    await _functions.httpsCallable('setMemberAccessStatus').call({
      'memberUid': memberUid.trim(),
      'status': status,
      'reason': reason.trim(),
    });
  }
}
