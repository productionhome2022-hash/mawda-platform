import 'dart:async';

import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/push_notification_service.dart';
import 'login_screen.dart';
import 'main_user_screen.dart';
import 'guest_session_screen.dart';
import 'notification_center_screen.dart';
import 'privacy_acknowledgement_screen.dart';
import '../privacy_policy.dart';

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
      if (user.isAnonymous) {
        return _PrivacyAcknowledgementGate(userId: user.uid, actorType: 'guest');
      }
      if (!user.emailVerified) return const _EmailVerificationScreen();
      return _PrivacyAcknowledgementGate(userId: user.uid, actorType: 'member');
    },
  );
}

class _PrivacyAcknowledgementGate extends StatefulWidget {
  const _PrivacyAcknowledgementGate({required this.userId, required this.actorType});
  final String userId;
  final String actorType;

  @override
  State<_PrivacyAcknowledgementGate> createState() =>
      _PrivacyAcknowledgementGateState();
}

class _PrivacyAcknowledgementGateState
    extends State<_PrivacyAcknowledgementGate> {
  late Future<bool> _status;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _status = _loadStatus();
  }

  Future<bool> _loadStatus() async {
    final response = await FirebaseFunctions.instance
        .httpsCallable('getPrivacyAcknowledgementStatus')
        .call();
    final data = Map<String, dynamic>.from(response.data as Map);
    return data['acknowledged'] == true &&
        data['policyVersion'] == mawdaPrivacyPolicyVersion &&
        data['policyHash'] == mawdaPrivacyPolicyHash;
  }

  Future<void> _accept() async {
    if (_saving) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final locale = Localizations.localeOf(context).languageCode;
      await FirebaseFunctions.instance
          .httpsCallable('recordPrivacyAcknowledgement')
          .call({
        'policyVersion': mawdaPrivacyPolicyVersion,
        'policyHash': mawdaPrivacyPolicyHash,
        'locale': ['ar', 'en', 'fr', 'es'].contains(locale) ? locale : 'ar',
        'actorType': widget.actorType,
        'appVersion': mawdaAppVersion,
      });
      if (!mounted) return;
      setState(() => _status = Future<bool>.value(true));
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر حفظ الإقرار.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر حفظ الإقرار. تحقق من الاتصال وحاول مجدداً.');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) => FutureBuilder<bool>(
        future: _status,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }
          if (snapshot.hasError) {
            return Scaffold(
              body: Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('تعذر التحقق من إقرار الخصوصية. لن يُفتح المحتوى المحمي حتى نجاح التحقق.'),
                      const SizedBox(height: 12),
                      FilledButton(
                        onPressed: () => setState(() => _status = _loadStatus()),
                        child: const Text('إعادة المحاولة'),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }
          if (snapshot.data == true) {
            return widget.actorType == 'guest'
                ? const GuestSessionScreen()
                : _MemberPushBootstrap(
                    child: MainUserScreen(userId: widget.userId),
                  );
          }
          return PrivacyAcknowledgementScreen(
            busy: _saving,
            error: _error,
            onAccepted: _accept,
          );
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


/// Starts FCM registration only after the member has passed authentication
/// and the current privacy acknowledgement gate. Guest sessions never register
/// member push tokens. Token refresh and deactivation are delegated to the
/// server-owned token registry.
class _MemberPushBootstrap extends StatefulWidget {
  const _MemberPushBootstrap({required this.child});
  final Widget child;

  @override
  State<_MemberPushBootstrap> createState() => _MemberPushBootstrapState();
}

class _MemberPushBootstrapState extends State<_MemberPushBootstrap> {
  final PushNotificationService _push = PushNotificationService();

  @override
  void initState() {
    super.initState();
    unawaited(_push.initialize(
      onForegroundMessage: (message) {
        final title = message.notification?.title ?? 'إشعار من مودة';
        final body = message.notification?.body ?? 'لديك تحديث جديد.';
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('$title — $body'),
            action: SnackBarAction(
              label: 'عرض',
              onPressed: _openNotifications,
            ),
          ),
        );
      },
      onOpenedMessage: (_) => _openNotifications(),
    ));
  }

  void _openNotifications() {
    if (!mounted) return;
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => const NotificationCenterScreen(),
      ),
    );
  }

  @override
  void dispose() {
    unawaited(_push.dispose());
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
