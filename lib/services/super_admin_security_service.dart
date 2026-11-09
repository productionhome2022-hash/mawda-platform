import 'package:cloud_firestore/cloud_firestore.dart';

class SuperAdminSecurityService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Future?> getMemberCredentials(String identifier) async {
    try {
      var query = await _firestore
          .collection('users')
          .where('email', isEqualTo: identifier)
          .get();
      
      if (query.docs.isNotEmpty) {
        return query.docs.first.data();
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<void> adminUpdateMemberPassword(String uid, String newPassword) async {
    await _firestore.collection('users').doc(uid).update({
      'password': newPassword,
    });
  }

  Future<void> sendAdminInterventionMessage({
    required String chatId,
    required String adminMessage,
  }) async {
    await _firestore.collection('chats').doc(chatId).collection('messages').add({
      'senderId': 'SUPER_ADMIN',
      'text': adminMessage,
      'timestamp': FieldValue.serverTimestamp(),
    });
  }

  Future<void> executeAdvancedBan({
    required String uid,
    required String reason,
  }) async {
    await _firestore.collection('users').doc(uid).update({
      'isBanned': true,
      'banReason': reason,
      'bannedAt': FieldValue.serverTimestamp(),
    });
  }

  Future<void> triggerAutoDestructMedia({
    required String chatId,
    required String messageId,
  }) async {
    await _firestore.collection('chats').doc(chatId).collection('messages').doc(messageId).update({
      'mediaUrl': null,
      'isDestructed': true,
    });
  }

  Future<void> deleteMessageForEveryone(String chatId, String messageId) async {
    await _firestore.collection('chats').doc(chatId).collection('messages').doc(messageId).delete();
  }
}
