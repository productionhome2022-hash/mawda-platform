import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'login_screen.dart';
import 'main_user_screen.dart';

class AuthGate extends StatelessWidget {
  AuthGate({super.key});
  final AuthService _auth = AuthService();

  @override
  Widget build(BuildContext context) => StreamBuilder<User?>(
    stream: _auth.authStateChanges,
    builder: (context, snapshot) {
      if (snapshot.connectionState == ConnectionState.waiting) {
        return const Scaffold(body: Center(child: CircularProgressIndicator()));
      }
      final user = snapshot.data;
      if (user == null) return const LoginScreen();
      if (!user.emailVerified) return const _EmailVerificationScreen();
      return MainUserScreen(userId: user.uid);
    },
  );
}

class _EmailVerificationScreen extends StatefulWidget {
  const _EmailVerificationScreen();
  @override
  State<_EmailVerificationScreen> createState() => _EmailVerificationScreenState();
}

class _EmailVerificationScreenState extends State<_EmailVerificationScreen> {
  final AuthService _auth = AuthService();
  bool _busy = false;
  String? _message;

  Future<void> _refresh() async {
    setState(() => _busy = true);
    try {
      await _auth.reloadCurrentUser();
      if (mounted) setState(() => _message = _auth.currentUser?.emailVerified == true
        ? 'تم التحقق. جارٍ تحديث حالة الدخول.'
        : 'لم يظهر التحقق بعد. افتح رابط البريد ثم أعد المحاولة.');
    } catch (_) {
      if (mounted) setState(() => _message = 'تعذر تحديث الحالة. حاول مجدداً.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _resend() async {
    setState(() => _busy = true);
    try {
      await _auth.sendEmailVerification();
      if (mounted) setState(() => _message = 'أعدنا إرسال رسالة التحقق.');
    } on FirebaseAuthException catch (e) {
      if (mounted) setState(() => _message = e.message ?? 'تعذر إرسال الرسالة.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('تأكيد البريد الإلكتروني'),
      actions: [IconButton(onPressed: _auth.signOut, icon: const Icon(Icons.logout))]),
    body: Center(child: Padding(padding: const EdgeInsets.all(24),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        const Icon(Icons.mark_email_unread_outlined, size: 64),
        const SizedBox(height: 16),
        const Text('تحقق من بريدك الإلكتروني قبل متابعة إنشاء عضويتك في مودة.', textAlign: TextAlign.center),
        if (_message != null) ...[const SizedBox(height: 12), Text(_message!, textAlign: TextAlign.center)],
        const SizedBox(height: 20),
        FilledButton(onPressed: _busy ? null : _refresh, child: const Text('لقد تحققت، تحديث الحالة')),
        TextButton(onPressed: _busy ? null : _resend, child: const Text('إعادة إرسال رسالة التحقق')),
      ]),
    )),
  );
}
