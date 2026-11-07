import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class AuthService {
  // تعريف مرجع فايربيس للمصادقة وقاعدة البيانات
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // الحصول على المستخدم الحالي
  User? get currentUser => _auth.currentUser;

  // 1. دالة تسجيل حساب جديد بريد وكلمة مرور وربطه ببروفايل قاعدة البيانات
  Future<String?> signUpWithEmail({
    required String email,
    required String password,
    required String fullName,
    required String gender,
  }) async {
    try {
      UserCredential credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      User? user = credential.user;

      if (user != null) {
        // إنشاء بروفايل أولي للمستخدم في قاعدة بيانات Firestore
        await _firestore.collection('users').doc(user.uid).set({
          'uid': user.uid,
          'fullName': fullName,
          'email': email,
          'gender': gender,
          'coins': 50, // هدية ترحيبية 50 كوينز عند التسجيل
          'isVip': false,
          'isOnline': true,
          'createdAt': FieldValue.serverTimestamp(),
        });

        return null; // تعني نجاح العملية بدون أخطاء
      }
      return "فشل إنشاء الحساب";
    } on FirebaseAuthException catch (e) {
      return e.message;
    } catch (e) {
      return e.toString();
    }
  }

  // 2. دالة تسجيل الدخول للحسابات الموجودة مسبقاً
  Future<String?> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      return null;
    } on FirebaseAuthException catch (e) {
      return e.message;
    } catch (e) {
      return e.toString();
    }
  }

  // 3. دالة تسجيل الخروج الآمن من المنصة
  Future<void> signOut() async {
    await _auth.signOut();
  }
}
