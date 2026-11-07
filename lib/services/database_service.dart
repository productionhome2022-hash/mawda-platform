import 'package:cloud_firestore/cloud_firestore.dart';

class DatabaseService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // 1. جلب بيانات مستخدم محدد عبر الـ UID الخاص به
  Future?> getUserProfile(String uid) async {
    try {
      DocumentSnapshot doc = await _firestore.collection('users').doc(uid).get();
      if (doc.exists) {
        return doc.data() as Map<String, dynamic>?;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // 2. تحديث بيانات البروفايل
  Future<bool> updateUserProfile(String uid, Map<String, dynamic> dataToUpdate) async {
    try {
      await _firestore.collection('users').doc(uid).update(dataToUpdate);
      return true;
    } catch (e) {
      return false;
    }
  }

  // 3. جلب قائمة الإعلانات التجارية (التي يتحكم بها الأدمن حصرياً)
  Stream<QuerySnapshot> getAdminAds() {
    return _firestore
        .collection('admin_ads')
        .orderBy('createdAt', descending: true)
        .snapshots();
  }

  // 4. دالة مخصصة للأدمن لإضافة إعلان تجاري جديد للمنصة
  Future<bool> postAdminAd({
    required String title,
    required String imageUrl,
    required String targetUrl,
  }) async {
    try {
      await _firestore.collection('admin_ads').add({
        'title': title,
        'imageUrl': imageUrl,
        'targetUrl': targetUrl,
        'createdAt': FieldValue.serverTimestamp(),
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}
