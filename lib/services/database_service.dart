import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/app_models.dart';

class DatabaseService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Save the complete user model without dropping profile fields.
  Future<void> saveNewUser(UserModel user) async {
    final userData = user.toMap();
    userData['coins'] = user.coins == 0 ? 500 : user.coins;

    await _db.collection('users').doc(user.uid).set(userData);
  }

  // Award the biometric verification bonus once, using a transaction.
  Future<void> verifyUserBiometric(String uid, int currentCoins) async {
    final userRef = _db.collection('users').doc(uid);

    await _db.runTransaction((transaction) async {
      final snapshot = await transaction.get(userRef);
      if (!snapshot.exists) {
        throw StateError('Cannot verify a user that does not exist.');
      }

      final data = snapshot.data() ?? <String, dynamic>{};
      if (data['isBiometricVerified'] == true) {
        return;
      }

      final storedCoins = data['coins'];
      final balance = storedCoins is num ? storedCoins.toInt() : currentCoins;

      transaction.update(userRef, {
        'isBiometricVerified': true,
        'coins': balance + 1500,
        'updatedAt': DateTime.now().toIso8601String(),
      });
    });
  }

  // Fetch user data using the canonical application model.
  Future<UserModel?> getUserData(String uid) async {
    final doc = await _db.collection('users').doc(uid).get();
    final data = doc.data();
    if (!doc.exists || data == null) {
      return null;
    }
    return UserModel.fromMap(data);
  }
}
