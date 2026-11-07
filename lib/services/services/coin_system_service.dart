import 'package:cloud_firestore/cloud_firestore.dart';

/// خدمة إدارة نظام الكوينز والمكافآت ومتجر مودة
class CoinSystemService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  /// 1. جلب رصيد الكوينز الحالي للمستخدم
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

  /// 2. منح مكافأة مشاهدة الإعلان بناءً على القيمة المحددة من السوبر أدمن
  Future<bool> rewardUserForAd(String userId) async {
    try {
      // جلب قيمة المكافأة من إعدادات السوبر أدمن العامة (admin_settings/global_config)
      DocumentSnapshot settingsDoc = await _firestore.collection('admin_settings').doc('global_config').get();
      int adRewardAmount = 10; // قيمة افتراضية في حال عدم التحديد

      if (settingsDoc.exists && settingsDoc.data() != null) {
        Map<String, dynamic> settingsData = settingsDoc.data() as Map<String, dynamic>;
        adRewardAmount = settingsData['ad_reward_amount'] ?? 10;
      }

      // تحديث رصيد المستخدم بنجاح عبر عملية Transaction لضمان الدقة
      DocumentReference userRef = _firestore.collection('users').doc(userId);
      
      await _firestore.runTransaction((transaction) async {
        DocumentSnapshot snapshot = await transaction.get(userRef);
        if (!snapshot.exists) return;

        int currentCoins = (snapshot.data() as Map<String, dynamic>)['coins'] ?? 0;
        int newCoins = currentCoins + adRewardAmount;

        transaction.update(userRef, {'coins': newCoins});
      });
      return true;
    } catch (e) {
      print("خطأ في منح مكافأة الإعلان: $e");
      return false;
    }
  }

  /// 3. خصم كوينز عند شراء الألقاب، الأوسمة، أو استئجار الغرف الخاصة
  Future<bool> purchaseItem(String userId, int itemCost) async {
    try {
      DocumentReference userRef = _firestore.collection('users').doc(userId);
      
      bool success = false;
      await _firestore.runTransaction((transaction) async {
        DocumentSnapshot snapshot = await transaction.get(userRef);
        if (!snapshot.exists) return;

        int currentCoins = (snapshot.data() as Map<String, dynamic>)['coins'] ?? 0;
        
        // التحقق من كفاية الرصيد قبل عملية الخصم
        if (currentCoins >= itemCost) {
          int newCoins = currentCoins - itemCost;
          transaction.update(userRef, {'coins': newCoins});
          success = true;
        }
      });
      return success;
    } catch (e) {
      print("خطأ في عملية الشراء أو الاستئجار: $e");
      return false;
    }
  }

  /// 4. دالة مخصصة للسوبر أدمن لتحديث قيمة مكافأة الإعلان ديناميكياً
  Future<bool> updateAdRewardAmountByAdmin(int newRewardAmount) async {
    try {
      await _firestore.collection('admin_settings').doc('global_config').set({
        'ad_reward_amount': newRewardAmount,
        'updated_at': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));
      return true;
    } catch (e) {
      print("خطأ في تحديث إعدادات المكافأة بواسطة الأدمن: $e");
      return false;
    }
  }
}
