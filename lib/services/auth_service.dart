import 'package:firebase_auth/firebase_auth.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // الحصول على المستخدم الحالي
  User? get currentUser => _auth.currentUser;

  // تسجيل الدخول بالبريد وكلمة المرور
  Future<User?> signInWithEmail(String email, String password) async {
    try {
      UserCredential result = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      return result.user;
    } catch (e) {
      print('خطأ في تسجيل الدخول: $e');
      return null;
    }
  }

  // إنشاء حساب جديد بالبريد وكلمة المرور
  Future<User?> signUpWithEmail(String email, String password) async {
    try {
      UserCredential result = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      return result.user;
    } catch (e) {
      print('خطأ في إنشاء الحساب: $e');
      return null;
    }
  }

  // تسجيل الخروج
  Future<void> signOut() async {
    await _auth.signOut();
  }
}
