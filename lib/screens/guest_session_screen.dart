import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class GuestSessionScreen extends StatefulWidget {
  const GuestSessionScreen({super.key});

  @override
  State<GuestSessionScreen> createState() => _GuestSessionScreenState();
}

class _GuestSessionScreenState extends State<GuestSessionScreen> {
  final _auth = AuthService();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _busy = false;
  String? _message;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _upgrade() async {
    if (_busy || !_email.text.trim().contains('@') || _password.text.length < 8) {
      setState(() => _message = 'أدخل بريداً صحيحاً وكلمة مرور من 8 أحرف على الأقل.');
      return;
    }
    setState(() { _busy = true; _message = null; });
    try {
      final result = await _auth.linkGuestWithEmail(
        email: _email.text,
        password: _password.text,
      );
      await result.user?.sendEmailVerification();
      if (mounted) setState(() => _message =
        'تم ربط جلسة الضيف بحساب بريد. افتح رسالة التحقق؛ سيطلب منك التطبيق إقرار سياسة العضوية قبل فتح ميزات الأعضاء.');
    } on FirebaseAuthException catch (error) {
      if (mounted) setState(() => _message = error.message ?? 'تعذر ترقية جلسة الضيف.');
    } catch (_) {
      if (mounted) setState(() => _message = 'تعذر ترقية جلسة الضيف. لم يتم حذف بيانات الجلسة.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _endGuestSession() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('إنهاء جلسة الضيف؟'),
        content: const Text(
          'سيُحذف حساب Firebase المجهول لهذه الجلسة ويُسجّل خروجك. '
          'لن يؤثر ذلك على إقرار الخصوصية المحفوظ كسجل تدقيق.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('متابعة كضيف'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('إنهاء الجلسة'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    setState(() { _busy = true; _message = null; });
    try {
      await _auth.endGuestSession();
    } on FirebaseAuthException catch (error) {
      if (mounted) setState(() => _message = error.message ?? 'تعذر إنهاء جلسة الضيف.');
    } catch (_) {
      if (mounted) setState(() => _message = 'تعذر إنهاء الجلسة. حاول مجدداً.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: const Text('جلسة ضيف مودة'),
          actions: [
            IconButton(
              tooltip: 'إنهاء جلسة الضيف',
              onPressed: _busy ? null : _endGuestSession,
              icon: const Icon(Icons.logout),
            ),
          ],
        ),
        body: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const Icon(Icons.person_outline, size: 64),
            const SizedBox(height: 12),
            Text('أنت تستخدم مودة كضيف', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 8),
            const Text(
              'هذه جلسة ضيف مرتبطة بمعرف Firebase مجهول. لا تمنحك صلاحيات العضو أو الوصول إلى المحادثات الخاصة أو المحفظة أو المتجر. لا تُعد الجلسة عضوية مكتملة.',
            ),
            const SizedBox(height: 24),
            Text('ترقية جلسة الضيف إلى عضوية', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            TextField(
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(labelText: 'البريد الإلكتروني', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _password,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'كلمة مرور جديدة (8 أحرف على الأقل)', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: _busy ? null : _upgrade,
              child: _busy
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Text('ربط الجلسة بالبريد والتحقق'),
            ),
            if (_message != null) ...[
              const SizedBox(height: 12),
              Text(_message!),
            ],
            const SizedBox(height: 18),
            OutlinedButton.icon(
              onPressed: _busy ? null : _endGuestSession,
              icon: const Icon(Icons.logout),
              label: const Text('إنهاء جلسة الضيف وحذف الحساب المجهول'),
            ),
          ],
        ),
      );
}
