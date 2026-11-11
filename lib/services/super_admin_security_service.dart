import 'package:cloud_firestore/cloud_firestore.dart';

class SuperAdminSecurityService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Future<Map<String, dynamic>?> getMemberCredentials(String identifier) async {
    try {
      final query = await _firestore
          .collection('members')
          .where('identifier', isEqualTo: identifier)
          .limit(1)
          .get();
      if (query.docs.isNotEmpty) {
        return query.docs.first.data();
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Stream<QuerySnapshot<Map<String, dynamic>>> streamSpyChatMessages(String chatId) {
    return _firestore
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('timestamp', descending: true)
        .snapshots();
  }

  Future<void> executeAdvancedBan({
    required String uid,
    required String reason,
    String deviceFingerprint = '',
    String banDurationType = '24h',
  }) async {
    await _firestore.collection('banned_users').doc(uid).set({
      'reason': reason,
      'deviceFingerprint': deviceFingerprint,
      'banDurationType': banDurationType,
      'timestamp': FieldValue.serverTimestamp(),
    });
  }

  Future<void> adminUpdateMemberPassword({
    required String uid,
    required String newPassword,
  }) async {
    // Passwords must be changed through Firebase Authentication/Admin SDK,
    // never stored as readable Firestore fields.
    throw UnsupportedError(
      'Password changes must be performed by a trusted server using Firebase Auth.',
    );
  }

  Future<void> sendAdminInterventionMessage({
    required String chatId,
    required String message,
  }) async {
    await _firestore
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .add({
      'senderId': 'SUPER_ADMIN_SYSTEM',
      'text': message,
      'timestamp': FieldValue.serverTimestamp(),
    });
  }

  // This records a platform-level cleanup request; a trusted scheduled
  // backend must perform actual media deletion.
  Future<void> triggerAutoDestructMedia({String? chatId}) async {
    final request = {
      'enabled': true,
      'requestedAt': FieldValue.serverTimestamp(),
      'status': 'pending_backend_cleanup',
    };

    if (chatId == null || chatId.isEmpty) {
      await _firestore
          .collection('platform_settings')
          .doc('media_auto_destruct')
          .set(request, SetOptions(merge: true));
      return;
    }

    await _firestore.collection('chats').doc(chatId).set({
      'autoDestruct': request,
    }, SetOptions(merge: true));
  }

  Future<void> deleteMessageForEveryone(String chatId, String messageId) async {
    await _firestore
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .doc(messageId)
        .delete();
  }
}
