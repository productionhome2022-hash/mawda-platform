import 'package:cloud_firestore/cloud_firestore.dart';

class CoinSystemService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // خصم كوينز من رصيد المستخدم
  Future<bool> deductUserCoins(String userId, int amount) async {
    try {
      DocumentReference userRef = _firestore.collection('users').doc(userId);
      DocumentSnapshot snapshot = await userRef.get();
      
      if (snapshot.exists) {
        int currentCoins = snapshot.get('coins') ?? 0;
        if (currentCoins >= amount) {
          await userRef.update({'coins': currentCoins - amount});
          return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  // إضافة كوينز إلى رصيد المستخدم (مكافآت وشحن)
  Future<bool> addUserCoins(String userId, int amount) async {
    try {
      DocumentReference userRef = _firestore.collection('users').doc(userId);
      DocumentSnapshot snapshot = await userRef.get();
      
      if (snapshot.exists) {
        int currentCoins = snapshot.get('coins') ?? 0;
        await userRef.update({'coins': currentCoins + amount});
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}
