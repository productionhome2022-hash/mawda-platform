import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user_model.dart';

class DatabaseService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // حفظ بيانات المستخدم الجديد مع منح مكافأة المرحلة الأولى (500 كوينز لتوقيع البريد)
  Future<void> saveNewUser(UserModel user) async {
    final userWithBonus = UserModel(
      uid: user.uid,
      email: user.email,
      fullName: user.fullName,
      gender: user.gender,
      bio: user.bio,
      profileImageUrl: user.profileImageUrl,
      isEmailVerified: true,
      coinsBalance: 500, // مكافأة المرحلة الأولى
      activeTitle: 'عضو مؤسس',
      role: 'user',
    );

    await _db.collection('users').doc(user.uid).set(userWithBonus.toMap());
  }

  // تحديث حالة التوثيق البيومتري ومنح المرحلة الثانية (1500 كوينز إضافية ليصبح المجموع 2000)
  Future<void> verifyUserBiometric(String uid, int currentCoins) async {
    await _db.collection('users').doc(uid).update({
      'isBiometricVerified': true,
      'coinsBalance': currentCoins + 1500, // مكافأة المرحلة الثانية
    });
  }

  // جلب بيانات المستخدم
  Future<UserModel?> getUserData(String uid) async {
    DocumentSnapshot doc = await _db.collection('users').doc(uid).get();
    if (doc.exists) {
      return UserModel.fromMap(doc.data() as Map<String, dynamic>, doc.id);
    }
    return null;
  }
}
