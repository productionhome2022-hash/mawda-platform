import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'push_notification_service.dart';

class AuthService {
  AuthService({FirebaseAuth? auth}) : _auth = auth ?? FirebaseAuth.instance;
  final FirebaseAuth _auth;

  User? get currentUser => _auth.currentUser;
  Stream<User?> get authStateChanges => _auth.userChanges();

  Future<UserCredential> signInWithEmail({required String email, required String password}) =>
      _auth.signInWithEmailAndPassword(email: email.trim(), password: password);

  Future<UserCredential> signUpWithEmail({required String email, required String password}) =>
      _auth.createUserWithEmailAndPassword(email: email.trim(), password: password);

  Future<UserCredential> signInAsGuest() => _auth.signInAnonymously();

  Future<UserCredential> linkGuestWithEmail({required String email, required String password}) async {
    final user = _auth.currentUser;
    if (user == null || !user.isAnonymous) {
      throw FirebaseAuthException(code: 'not-a-guest', message: 'لا توجد جلسة ضيف قابلة للترقية.');
    }
    final credential = EmailAuthProvider.credential(email: email.trim(), password: password);
    return user.linkWithCredential(credential);
  }

  Future<void> sendEmailVerification() async {
    final user = _auth.currentUser;
    if (user == null) {
      throw FirebaseAuthException(code: 'no-current-user', message: 'لا يوجد حساب مسجل حالياً.');
    }
    if (!user.emailVerified) await user.sendEmailVerification();
  }

  Future<void> reloadCurrentUser() async {
    await _auth.currentUser?.reload();
  }
  Future<void> sendPasswordResetEmail(String email) =>
      _auth.sendPasswordResetEmail(email: email.trim());
  Future<void> endGuestSession() async {
    final user = _auth.currentUser;
    if (user == null || !user.isAnonymous) {
      throw FirebaseAuthException(
        code: 'not-a-guest',
        message: 'لا توجد جلسة ضيف نشطة لإنهائها.',
      );
    }
    // Preserve the anonymous UID so ending and reopening the app cannot reset
    // the server-side 24-hour guest cooldown by creating a fresh anonymous UID.
    await FirebaseFunctions.instance.httpsCallable('endGuestSession').call();
  }

  Future<void> signOut() async {
    // Deactivate this device's server-side FCM token before invalidating auth.
    await PushNotificationService().unregister();
    await _auth.signOut();
  }
}
