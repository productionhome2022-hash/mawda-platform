import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../privacy_policy.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _auth = AuthService();
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _register = false;
  bool _busy = false;
  bool _obscure = true;
  String? _message;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<bool?> _confirmPrivacyBeforeRegistration() async {
    var accepted = false;
    return showDialog<bool>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('إشعار خصوصية مودة'),
          content: SizedBox(
            width: 520,
            height: MediaQuery.sizeOf(context).height * 0.58,
            child: Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    child: SelectableText(
                      'الإصدار $mawdaPrivacyPolicyVersion\\n\\n$mawdaPrivacyNoticeArabic',
                    ),
                  ),
                ),
                CheckboxListTile(
                  contentPadding: EdgeInsets.zero,
                  value: accepted,
                  onChanged: (value) => setDialogState(() => accepted = value == true),
                  controlAffinity: ListTileControlAffinity.leading,
                  title: const Text('قرأت إشعار الخصوصية وأقر بالاطلاع على هذا الإصدار.'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: const Text('رفض وإلغاء التسجيل'),
            ),
            FilledButton(
              onPressed: accepted ? () => Navigator.pop(dialogContext, true) : null,
              child: const Text('أوافق وأتابع'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _busy) return;
    if (_register) {
      final accepted = await _confirmPrivacyBeforeRegistration();
      if (accepted != true || !mounted) return;
    }
    setState(() { _busy = true; _message = null; });
    try {
      if (_register) {
        final result = await _auth.signUpWithEmail(email: _email.text, password: _password.text);
        await result.user?.sendEmailVerification();
        try {
          final locale = Localizations.localeOf(context).languageCode;
          await FirebaseFunctions.instance
              .httpsCallable('recordPrivacyAcknowledgement')
              .call({
            'policyVersion': mawdaPrivacyPolicyVersion,
            'policyHash': mawdaPrivacyPolicyHash,
            'locale': ['ar', 'en', 'fr', 'es'].contains(locale) ? locale : 'ar',
            'actorType': 'member',
            'appVersion': mawdaAppVersion,
          });
        } catch (_) {
          await _auth.signOut();
          if (mounted) setState(() {
            _register = false;
            _message = 'أنشأنا حساب الدخول وأرسلنا رسالة التحقق، لكن تعذر حفظ إقرار الخصوصية. بعد تأكيد البريد سجّل الدخول لإكمال الإقرار قبل فتح المحتوى.';
          });
          return;
        }
        await _auth.signOut();
        if (mounted) setState(() {
          _register = false;
          _message = 'تم إنشاء حساب الدخول وحفظ إقرار الخصوصية. أرسلنا رسالة تحقق إلى بريدك؛ افتحها ثم سجّل الدخول.';
        });
      } else {
        final result = await _auth.signInWithEmail(email: _email.text, password: _password.text);
        await result.user?.reload();
        if (result.user == null || !result.user!.emailVerified) {
          await _auth.signOut();
          if (mounted) setState(() => _message = 'يجب تأكيد بريدك الإلكتروني أولاً. افتح رسالة التحقق ثم حاول مجدداً.');
        }
      }
    } on FirebaseAuthException catch (e) {
      if (mounted) setState(() => _message = _friendlyError(e));
    } catch (_) {
      if (mounted) setState(() => _message = 'تعذر إكمال العملية. تحقق من الاتصال وحاول مجدداً.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  String _friendlyError(FirebaseAuthException e) {
    switch (e.code) {
      case 'email-already-in-use': return 'هذا البريد مرتبط بحساب موجود.';
      case 'invalid-email': return 'صيغة البريد الإلكتروني غير صحيحة.';
      case 'weak-password': return 'كلمة المرور ضعيفة. استخدم 8 أحرف على الأقل.';
      case 'user-not-found':
      case 'wrong-password':
      case 'invalid-credential': return 'بيانات الدخول غير صحيحة.';
      case 'too-many-requests': return 'محاولات كثيرة. انتظر قليلاً ثم حاول.';
      case 'network-request-failed': return 'تعذر الاتصال. تحقق من الإنترنت.';
      default: return 'تعذر إكمال العملية (' + e.code + ').';
    }
  }

  Future<void> _resetPassword() async {
    final email = _email.text.trim();
    if (!email.contains('@')) {
      setState(() => _message = 'اكتب بريدك الإلكتروني أولاً.');
      return;
    }
    setState(() { _busy = true; _message = null; });
    try {
      await _auth.sendPasswordResetEmail(email);
      if (mounted) setState(() => _message = 'إذا كان البريد مسجلاً، فستصلك رسالة لإعادة تعيين كلمة المرور.');
    } on FirebaseAuthException catch (e) {
      if (mounted) setState(() => _message = _friendlyError(e));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF160D1B),
      body: SafeArea(child: Center(child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 440),
          child: Card(color: const Color(0xFF281A2D), child: Padding(
            padding: const EdgeInsets.all(24),
            child: Form(key: _formKey, child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              const Icon(Icons.favorite, color: Color(0xFFE8A0B5), size: 64),
              const SizedBox(height: 12),
              const Text('مودة | MAWDA', textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text(_register ? 'إنشاء حساب دخول' : 'تسجيل الدخول',
                textAlign: TextAlign.center, style: const TextStyle(color: Colors.white70, fontSize: 18)),
              const SizedBox(height: 24),
              TextFormField(controller: _email, keyboardType: TextInputType.emailAddress,
                autofillHints: const [AutofillHints.email], style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'البريد الإلكتروني', border: OutlineInputBorder()),
                validator: (v) {
                  final value = v?.trim() ?? '';
                  return value.contains('@') && !value.startsWith('@') && !value.endsWith('@')
                      ? null : 'أدخل بريداً إلكترونياً صحيحاً';
                }),
              const SizedBox(height: 16),
              TextFormField(controller: _password, obscureText: _obscure,
                autofillHints: _register ? const [AutofillHints.newPassword] : const [AutofillHints.password],
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(labelText: 'كلمة المرور', border: const OutlineInputBorder(),
                  suffixIcon: IconButton(onPressed: () => setState(() => _obscure = !_obscure),
                    icon: Icon(_obscure ? Icons.visibility : Icons.visibility_off))),
                validator: (v) {
                  final value = v ?? '';
                  if (_register && value.length < 8) return 'استخدم 8 أحرف على الأقل';
                  return value.isEmpty ? 'أدخل كلمة المرور' : null;
                }),
              if (!_register) Align(alignment: Alignment.centerLeft,
                child: TextButton(onPressed: _busy ? null : _resetPassword, child: const Text('نسيت كلمة المرور؟'))),
              if (_message != null) ...[
                const SizedBox(height: 12),
                Text(_message!, style: const TextStyle(color: Color(0xFFFFD6A5))),
              ],
              const SizedBox(height: 20),
              FilledButton(onPressed: _busy ? null : _submit,
                child: _busy ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                    : Text(_register ? 'إنشاء الحساب وإرسال التحقق' : 'دخول آمن')),
              TextButton(onPressed: _busy ? null : () => setState(() { _register = !_register; _message = null; }),
                child: Text(_register ? 'لديك حساب؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب')),
              const SizedBox(height: 8),
              const Text('إنشاء حساب الدخول لا يعني اكتمال الملف الشخصي؛ ستأتي خطوة استكمال بيانات العضوية لاحقاً.',
                textAlign: TextAlign.center, style: TextStyle(color: Colors.white54, fontSize: 12)),
            ])),
          )),
        ),
      ))),
    );
  }
}
