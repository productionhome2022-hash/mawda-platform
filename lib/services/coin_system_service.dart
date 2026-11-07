import 'package:cloud_firestore/cloud_firestore.dart';

class CoinSystemService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // جلب رصيد الكوينز الحالي للمستخدم
  Future<int> getUserCoins(String userId) async {
    try {
      DocumentSnapshot userDoc = await _firestore.collection('users').doc(userId).get();
      if (userDoc.exists && userDoc.data() != null) {
        Map<String, dynamic> data = userDoc.data() as Map<String, dynamic>;
        return data['coins'] ?? 0;
      }
    } catch (e) {
      print("خطأ في جلب رصيد الكوينز: $e");
    }
    return 0;
  }

  // منح مكافأة مشاهدة إعلان معين بناءً على القيمة التي حددها السوبر أدمن لهذا الإعلان بالذات
  Future<bool> rewardUserForSpecificAd(String userId, String adId) async {
    try {
      // 1. جلب تفاصيل الإعلان المحدد لمعرفة قيمة المكافأة الخاصة به
      DocumentSnapshot adDoc = await _firestore.collection('ads').doc(adId).get();
      int specificAdReward = 10; // قيمة افتراضية احتياطية

      if (adDoc.exists && adDoc.data() != null) {
        Map<String, dynamic> adData = adDoc.data() as Map<String, dynamic>;
        specificAdReward = adData['reward_amount'] ?? 10; // القيمة التي حددها الأدمن عند إنشاء الإعلان
      }

      // 2. تحديث رصيد المستخدم وإضافة المكافأة الخاصة بالإعلان لحظياً
      DocumentReference userRef = _firestore.collection('users').doc(userId);
      
      await _firestore.runTransaction((transaction) async {
        DocumentSnapshot snapshot = await transaction.get(userRef);
        if (!snapshot.exists) return;

        int currentCoins = (snapshot.data() as Map<String, dynamic>)['coins'] ?? 0;
        int newCoins = currentCoins + specificAdReward;

        transaction.update(userRef, {'coins': newCoins});
      });
      return true;
    } catch (e) {
      print("خطأ في منح مكافأة الإعلان المخصص: $e");
      return false;
    }
  }

  // خصم كوينز عند الشراء أو استئجار الغرف
  Future<bool> purchaseItem(String userId, int itemCost) async {
    try {
      DocumentReference userRef = _firestore.collection('users').doc(userId);
      
      bool success = false;
      await _firestore.runTransaction((transaction) async {
        DocumentSnapshot snapshot = await transaction.get(userRef);
        if (!snapshot.exists) return;

        int currentCoins = (snapshot.data() as Map<String, dynamic>)['coins'] ?? 0;
        
        if (currentCoins >= itemCost) {
          int newCoins = currentCoins - itemCost;
          transaction.update(userRef, {'coins': newCoins});
          success = true;
        }
      });
      return success;
    } catch (e) {
      print("خطأ في عملية الشراء: $e");
      return false;
    }
  }
}
