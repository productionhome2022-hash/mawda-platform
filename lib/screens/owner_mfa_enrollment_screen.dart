import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../services/auth_service.dart';

class OwnerMfaEnrollmentScreen extends StatefulWidget {
  const OwnerMfaEnrollmentScreen({super.key});

  @override
  State<OwnerMfaEnrollmentScreen> createState() => _OwnerMfaEnrollmentScreenState();
}

class _OwnerMfaEnrollmentScreenState extends State<OwnerMfaEnrollmentScreen> {
  final _password = TextEditingController();
  final _code = TextEditingController();
  bool _busy = false;
  TotpSecret? _secret;
  String? _qrCodeUrl;
  String? _message;

  @override
  void dispose() {
    _password.dispose();
    _code.dispose();
    super.dispose();
  }

  Future<void> _beginEnrollment() async {
    if (_busy || _password.text.isEmpty) return;
    setState(() {
      _busy = true;
      _message = null;
    });
    try {
      final user = FirebaseAuth.instance.currentUser;
      final email = user?.email;
      if (user == null || email == null || user.isAnonymous || !user.emailVerified) {
        throw FirebaseAuthException(
          code: 'owner-mfa-account-invalid',
          message: 'يجب تسجيل الدخول ببريد مالك موثق قبل إعداد MFA.',
        );
      }

      await user.reauthenticateWithCredential(
        EmailAuthProvider.credential(email: email, password: _password.text),
      );
      final session = await user.multiFactor.getSession();
      final secret = await TotpMultiFactorGenerator.generateSecret(session);
      final qrUrl = await secret.generateQrCodeUrl(
        accountName: email,
        issuer: 'Mawdda Platform 2026',
      );
      if (!mounted) return;
      setState(() {
        _secret = secret;
        _qrCodeUrl = qrUrl;
        _message = 'أضف المفتاح إلى تطبيق مصادقة موثوق، ثم أدخل الرمز الحالي لإتمام التسجيل.';
        _password.clear();
      });
    } on FirebaseAuthException catch (error) {
      if (mounted) setState(() => _message = error.message ?? 'تعذر بدء إعداد MFA.');
    } catch (_) {
      if (mounted) setState(() => _message =
          'تعذر إنشاء سر TOTP. تحقق من تفعيل مزود TOTP في Firebase Authentication with Identity Platform.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _confirmEnrollment() async {
    final secret = _secret;
    final code = _code.text.trim();
    if (_busy || secret == null || code.length != 6 || int.tryParse(code) == null) {
      return;
    }
    setState(() {
      _busy = true;
      _message = null;
    });
    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) throw FirebaseAuthException(code: 'no-current-user');
      final assertion = await TotpMultiFactorGenerator.getAssertionForEnrollment(
        secret,
        code,
      );
      await user.multiFactor.enroll(
        assertion,
        displayName: 'Mawdda Owner Authenticator',
      );
      if (!mounted) return;
      await showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (dialogContext) => AlertDialog(
          title: const Text('تم تسجيل العامل الثاني'),
          content: const Text(
            'تم ربط تطبيق المصادقة بحساب المالك. سننهي الجلسة الحالية الآن؛ سجّل الدخول مرة أخرى بكلمة المرور ورمز TOTP حتى يصدر Firebase جلسة دخول متعددة العوامل.',
          ),
          actions: [
            FilledButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('متابعة إلى تسجيل الدخول'),
            ),
          ],
        ),
      );
      await AuthService().signOut();
    } on FirebaseAuthException catch (error) {
      if (mounted) setState(() => _message = error.message ?? 'تعذر اعتماد رمز TOTP.');
    } catch (_) {
      if (mounted) setState(() => _message = 'تعذر إكمال تسجيل العامل الثاني. لم يتم فتح لوحة المالك.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final secret = _secret;
    return Scaffold(
      appBar: AppBar(
        title: const Text('تأمين حساب مالك المنصة'),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            tooltip: 'تسجيل الخروج',
            onPressed: _busy ? null : () => AuthService().signOut(),
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 560),
          child: ListView(
            padding: const EdgeInsets.all(24),
            shrinkWrap: true,
            children: [
              const Icon(Icons.admin_panel_settings_outlined, size: 64),
              const SizedBox(height: 16),
              const Text(
                'يجب حماية حساب المالك بعامل ثانٍ قبل فتح أدوات Super Admin. نستخدم TOTP عبر تطبيق مصادقة؛ لا نرسل سر المصادقة إلى قاعدة بيانات مودة.',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              if (secret == null) ...[
                TextField(
                  controller: _password,
                  obscureText: true,
                  autofillHints: const [AutofillHints.password],
                  decoration: const InputDecoration(
                    labelText: 'أعد إدخال كلمة مرور المالك',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                FilledButton.icon(
                  onPressed: _busy ? null : _beginEnrollment,
                  icon: const Icon(Icons.security),
                  label: const Text('إنشاء إعداد TOTP'),
                ),
              ] else ...[
                const Text(
                  'امسح رابط الإعداد داخل تطبيق المصادقة إن كان يدعم فتح روابط otpauth، أو أدخل المفتاح السري يدوياً. لا تشارك هذا المفتاح مع أي شخص.',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                const Text('المفتاح السري'),
                SelectableText(
                  secret.secretKey,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                const Text('رابط إعداد التطبيق'),
                SelectableText(_qrCodeUrl ?? ''),
                const SizedBox(height: 16),
                TextField(
                  controller: _code,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  decoration: const InputDecoration(
                    labelText: 'رمز TOTP الحالي',
                    border: OutlineInputBorder(),
                  ),
                ),
                FilledButton.icon(
                  onPressed: _busy ? null : _confirmEnrollment,
                  icon: const Icon(Icons.verified_user_outlined),
                  label: const Text('اعتماد العامل الثاني'),
                ),
                TextButton(
                  onPressed: _busy
                      ? null
                      : () => setState(() {
                            _secret = null;
                            _qrCodeUrl = null;
                            _code.clear();
                            _message = null;
                          }),
                  child: const Text('إلغاء وإعادة البدء'),
                ),
              ],
              if (_message != null) ...[
                const SizedBox(height: 16),
                Text(_message!, textAlign: TextAlign.center),
              ],
              if (_busy) ...[
                const SizedBox(height: 16),
                const Center(child: CircularProgressIndicator()),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
