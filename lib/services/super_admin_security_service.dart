import 'package:cloud_functions/cloud_functions.dart';

class SuperAdminSecurityService {
  final FirebaseFunctions _functions = FirebaseFunctions.instance;

  Future<Map<String, dynamic>> getOperationsOverview() async {
    final result = await _functions.httpsCallable('getOwnerOperationsOverview').call();
    return Map<String, dynamic>.from(result.data as Map);
  }

  Future<Map<String, dynamic>> setTransferCommission({
    required int commissionBps,
    required bool enabled,
  }) async {
    final result = await _functions.httpsCallable('setTransferCommission').call({
      'commissionBps': commissionBps,
      'enabled': enabled,
    });
    return Map<String, dynamic>.from(result.data as Map);
  }

  Future<Map<String, dynamic>> createRoom({
    required String name,
    required String kind,
    required int capacity,
  }) async {
    final result = await _functions.httpsCallable('createRoom').call({
      'name': name.trim(),
      'kind': kind,
      'capacity': capacity,
    });
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

  Future<List<Map<String, dynamic>>> getRoomMessages(String roomId) async {
    final result = await _functions.httpsCallable('getRoomMessages').call({
      'roomId': roomId,
    });
    final data = Map<String, dynamic>.from(result.data as Map);
    final messages = data['messages'] as List<dynamic>? ?? const [];
    return messages
        .map((message) => Map<String, dynamic>.from(message as Map))
        .toList(growable: false);
  }

  Future<void> sendRoomMessage({
    required String roomId,
    required String content,
    required String clientMessageId,
  }) async {
    await _functions.httpsCallable('sendRoomMessage').call({
      'roomId': roomId,
      'content': content,
      'clientMessageId': clientMessageId,
    });
  }

  Future<void> deleteRoomMessage({
    required String roomId,
    required String messageId,
  }) async {
    await _functions.httpsCallable('deleteRoomMessage').call({
      'roomId': roomId,
      'messageId': messageId,
    });
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
