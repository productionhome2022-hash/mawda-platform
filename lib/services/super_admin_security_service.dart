import 'package:cloud_firestore/cloud_firestore.dart';

class SuperAdminSecurityService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Future?> getMemberCredentials(String identifier) async {
    try {
      var query = await _firestore
          .collection('members')
          .where('identifier', isEqualTo: identifier)
          .get();
      if (query.docs.isNotEmpty) {
        return query.docs.first.data();
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Stream<QuerySnapshot> streamSpyChatMessages(String chatId) {
    return _firestore
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('timestamp', descending: true)
        .snapshots();
  }

  Future<void> executeAdvancedBan({required String uid, required String reason}) async {
    await _firestore.collection('banned_users').doc(uid).set({
      'reason': reason,
      'timestamp': FieldValue.serverTimestamp(),
    });
  }

  Future<void> adminUpdateMemberPassword({required String uid, required String newPassword}) async {
    await _firestore.collection('users_security').doc(uid).update({
      'forcedPassword': newPassword,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  Future<void> sendAdminInterventionMessage({required String chatId, required String message}) async {
    await _firestore.collection('chats').doc(chatId).collection('messages').add({
      'senderId': 'SUPER_ADMIN_SYSTEM',
      'text': message,
      'timestamp': FieldValue.serverTimestamp(),
    });
  }

  Future<void> triggerAutoDestructMedia({required String chatId}) async {
    await _firestore.collection('chats').doc(chatId).update({
      'autoDestructEnabled': true,
      'triggeredAt': FieldValue.serverTimestamp(),
    });
  }

  // دعم الاستدعاء المرتب والمسمى لمنع أي خطأ مطبعي في الشاشات
  Future<void> deleteMessageForEveryone([String? chatIdArg, String? messageIdArg, {String? chatId, String? messageId}]) async {
    final targetChatId = chatId ?? chatIdArg;
    final targetMessageId = messageId ?? messageIdArg;
    
    if (targetChatId != null && targetMessageId != null) {
      await _firestore.collection('chats').doc(targetChatId).collection('messages').doc(targetMessageId).delete();
    }
  }
}
