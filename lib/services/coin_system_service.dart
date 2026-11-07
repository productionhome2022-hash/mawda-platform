// File: lib/services/coin_system_service.dart
// Production Home 2022 - Mawda Platform Coin System
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class CoinSystemService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  Future<int> getUserCoins() async {
    try {
      User? user = _auth.currentUser;
      if (user == null) return 0;

      DocumentSnapshot doc = await _firestore.collection('users').doc(user.uid).get();
      if (doc.exists && doc.data() != null) {
        Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
        return data['coins'] ?? data['coinsBalance'] ?? 0;
      }
    } catch (e) {
      print('خطأ في جلب الأرصدة: $e');
    }
    return 0;
  }

  Future<void> updateCoins(int newBalance) async {
    try {
      User? user = _auth.currentUser;
      if (user == null) return;

      await _firestore.collection('users').doc(user.uid).update({
        'coins': newBalance,
      });
    } catch (e) {
      print('خطأ في تحديث الأرصدة: $e');
    }
  }
}
