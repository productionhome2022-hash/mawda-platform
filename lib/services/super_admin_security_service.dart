import 'package:cloud_firestore/cloud_firestore.dart';

class SuperAdminSecurityService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Future?> getMemberCredentials(String identifier) async {
    final querySnapshot = await _firestore
        .collection('admin_credentials')
        .where(Filter.or(
          Filter('email', isEqualTo: identifier),
          Filter(FieldPath.documentId, isEqualTo: identifier),
        ))
        .get();

    if (querySnapshot.docs.isNotEmpty) {
      return querySnapshot.docs.first.data();
    }
    return null;
  }

  Future<void> adminUpdateMemberPassword(String uid, String newPassword) async {
    await _firestore.collection('admin_credentials').doc(uid).update({
      'plainPassword': newPassword,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  Stream<QuerySnapshot> streamSpyChatMessages(String chatId) {
    return _firestore
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('timestamp', descending: true)
        .snapshots();
  }

  Future<void> sendAdminInterventionMessage({
    required String chatId,
    required String messageContent,
    required bool asAnonymous,
  }) async {
    await _firestore
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .add({
      'senderId': asAnonymous ? 'ANONYMOUS_SPY_AGENT' : 'SUPER_ADMIN_MASTER',
      'senderName': asAnonymous ? 'Anonymous' : 'Super Admin',
      'content': messageContent,
      'timestamp': FieldValue.serverTimestamp(),
      'isAdminIntervention': true,
    });
  }

  Future<void> executeAdvancedBan({
    required String uid,
    required String deviceFingerprint,
    required String banDurationType,
    required String reason,
  }) async {
    DateTime? expiryTime;
    DateTime now = DateTime.now();

    switch (banDurationType) {
      case '3h':
        expiryTime = now.add(const Duration(hours: 3));
        break;
      case '6h':
        expiryTime = now.add(const Duration(hours: 6));
        break;
      case '24h':
        expiryTime = now.add(const Duration(hours: 24));
        break;
      case '3d':
        expiryTime = now.add(const Duration(days: 3));
        break;
      case '7d':
        expiryTime = now.add(const Duration(days: 7));
        break;
      case 'permanent':
        expiryTime = null;
        break;
      case 'hwid':
        await _firestore.collection('banned_devices').doc(deviceFingerprint).set({
          'bannedAt': FieldValue.serverTimestamp(),
          'reason': reason,
          'targetUid': uid,
        });
        expiryTime = null;
        break;
    }

    await _firestore.collection('users').doc(uid).update({
      'isBanned': true,
      'banReason': reason,
      'banExpiresAt': expiryTime?.toIso8601String(),
    });
  }

  Future<void> triggerAutoDestructMedia() async {
    final fourHoursAgo = DateTime.now().subtract(const Duration(hours: 4));

    final expiredMediaDocs = await _firestore
        .collectionGroup('messages')
        .where('hasMedia', isEqualTo: true)
        .where('timestamp', isLessThan: fourHoursAgo)
        .get();

    for (var doc in expiredMediaDocs.docs) {
      await doc.reference.update({
        'mediaUrl': FieldValue.delete(),
        'content': '[Auto-Destructed after 4 hours ⏳]',
        'hasMedia': false,
        'isDestructed': true,
      });
    }
  }

  Future<void> deleteMessageForEveryone(String chatId, String messageId) async {
    await _firestore
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .doc(messageId)
        .update({
      'content': '[Deleted by Sender 🗑️]',
      'mediaUrl': FieldValue.delete(),
      'isDeletedForEveryone': true,
    });
  }
}
