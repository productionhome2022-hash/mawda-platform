import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'guest_room_chat_screen.dart';

class GuestSessionScreen extends StatefulWidget {
  const GuestSessionScreen({super.key});
  @override
  State<GuestSessionScreen> createState() => _GuestSessionScreenState();
}

class _GuestSessionScreenState extends State<GuestSessionScreen> {
  final _functions = FirebaseFunctions.instance;
  final _auth = AuthService();
  final _username = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  static const _countries = <String, String>{
    'CH': 'سويسرا', 'DE': 'ألمانيا', 'FR': 'فرنسا', 'GB': 'المملكة المتحدة',
    'US': 'الولايات المتحدة', 'CA': 'كندا', 'EG': 'مصر', 'SA': 'السعودية',
    'AE': 'الإمارات', 'TR': 'تركيا', 'MA': 'المغرب', 'JO': 'الأردن',
    'IQ': 'العراق', 'LB': 'لبنان', 'TN': 'تونس', 'DZ': 'الجزائر',
  };
  String _country = 'CH';
  String _gender = 'male';
  bool _busy = false, _loading = true;
  Map<String, dynamic> _status = {};
  List<Map<String, dynamic>> _rooms = [];
  String? _message;

  @override
  void initState() { super.initState(); _loadStatus(); }

  @override
  void dispose() {
    _username.dispose(); _email.dispose(); _password.dispose(); super.dispose();
  }

  Future<void> _loadStatus() async {
    if (mounted) setState(() { _loading = true; _message = null; });
    try {
      final response = await _functions.httpsCallable('getGuestSessionStatus').call();
      final status = Map<String, dynamic>.from(response.data as Map);
      List<Map<String, dynamic>> rooms = [];
      if (status['active'] == true) {
        final result = await _functions.httpsCallable('listGuestPublicRooms').call();
        final data = Map<String, dynamic>.from(result.data as Map);
        rooms = (data['rooms'] as List<dynamic>? ?? const [])
            .whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      }
      if (mounted) setState(() { _status = status; _rooms = rooms; _loading = false; });
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() { _message = e.message ?? 'تعذر تحميل حالة جلسة الزائر.'; _loading = false; });
    } catch (_) {
      if (mounted) setState(() { _message = 'تعذر تحميل جلسة الزائر. تحقق من الاتصال.'; _loading = false; });
    }
  }

  Future<void> _start() async {
    if (_busy) return;
    setState(() { _busy = true; _message = null; });
    try {
      final response = await _functions.httpsCallable('startGuestSession').call({
        'username': _username.text.trim(), 'country': _country, 'gender': _gender,
      });
      if ((response.data as Map)['active'] != true) throw StateError('Guest session not active');
      await _loadStatus();
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _message = e.message ?? 'تعذر بدء جلسة الزائر.');
    } catch (_) {
      if (mounted) setState(() => _message = 'تعذر بدء الجلسة. راجع البيانات وحاول مجدداً.');
    } finally { if (mounted) setState(() => _busy = false); }
  }

  Future<void> _endSession() async {
    final confirmed = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('إنهاء جلسة الزائر؟'),
      content: const Text('سيُغلق الوصول إلى الغرف الآن، وتظل نافذة الـ24 ساعة محسوبة من وقت بدء الجلسة. لن يُحذف حسابك المجهول أو سجل الخصوصية.'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('إلغاء')),
        FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('إنهاء الجلسة')),
      ],
    ));
    if (confirmed != true || !mounted) return;
    setState(() => _busy = true);
    try { await _functions.httpsCallable('endGuestSession').call(); await _loadStatus(); }
    on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _message = e.message ?? 'تعذر إنهاء الجلسة.');
    } finally { if (mounted) setState(() => _busy = false); }
  }

  Future<void> _upgrade() async {
    if (_busy || !_email.text.trim().contains('@') || _password.text.length < 8) {
      setState(() => _message = 'أدخل بريداً صحيحاً وكلمة مرور من 8 أحرف على الأقل.'); return;
    }
    setState(() { _busy = true; _message = null; });
    try {
      final result = await _auth.linkGuestWithEmail(email: _email.text, password: _password.text);
      await result.user?.sendEmailVerification();
      if (mounted) setState(() => _message = 'تم ربط الجلسة بحساب العضوية. تحقق من بريدك، ثم أكمل بيانات العضو والتوثيق.');
    } on FirebaseAuthException catch (e) {
      if (mounted) setState(() => _message = e.message ?? 'تعذر ترقية جلسة الضيف.');
    } catch (_) {
      if (mounted) setState(() => _message = 'تعذر ترقية الجلسة. لم تُحذف بياناتك.');
    } finally { if (mounted) setState(() => _busy = false); }
  }

  String _expiryText() {
    final value = _status['expiresAt'];
    if (value is! num) return 'جلسة الزائر غير نشطة';
    final remaining = DateTime.fromMillisecondsSinceEpoch(value.toInt()).difference(DateTime.now());
    if (remaining.isNegative || remaining.inSeconds <= 0) return 'انتهت جلسة الزائر';
    return 'الوقت المتبقي: ${remaining.inMinutes} دقيقة و${remaining.inSeconds.remainder(60)} ثانية';
  }

  Widget _profileForm() => Card(child: Padding(
    padding: const EdgeInsets.all(16),
    child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      Text('بيانات الدخول كزائر', style: Theme.of(context).textTheme.titleLarge),
      const SizedBox(height: 8),
      const Text('اسم المستخدم والدولة والجنس فقط. لا يوجد حقل للعمر ولا نطلب بريداً أو توثيقاً.'),
      const SizedBox(height: 12),
      TextField(controller: _username, maxLength: 24,
        decoration: const InputDecoration(labelText: 'اسم المستخدم', border: OutlineInputBorder())),
      const SizedBox(height: 8),
      DropdownButtonFormField<String>(
        initialValue: _country,
        decoration: const InputDecoration(labelText: 'الدولة', border: OutlineInputBorder()),
        items: _countries.entries.map((e) => DropdownMenuItem(value: e.key, child: Text(e.value))).toList(),
        onChanged: _busy ? null : (v) { if (v != null) setState(() => _country = v); },
      ),
      const SizedBox(height: 8),
      InputDecorator(
        decoration: const InputDecoration(labelText: 'الجنس', border: OutlineInputBorder()),
        child: SegmentedButton<String>(
          segments: const [
            ButtonSegment(value: 'male', label: Text('ذكر'), icon: Icon(Icons.male)),
            ButtonSegment(value: 'female', label: Text('أنثى'), icon: Icon(Icons.female)),
          ],
          selected: {_gender},
          onSelectionChanged: _busy ? null : (v) => setState(() => _gender = v.first),
        ),
      ),
      const SizedBox(height: 12),
      FilledButton(onPressed: _busy ? null : _start,
        child: _busy ? const CircularProgressIndicator() : const Text('دخول الغرف العامة')),
    ]),
  ));

  Widget _upgradeCard() => Card(child: Padding(
    padding: const EdgeInsets.all(16),
    child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      Text('الانضمام إلى عضوية مودة', style: Theme.of(context).textTheme.titleLarge),
      const SizedBox(height: 8),
      const Text('عند اختيار العضوية تبدأ خطوات التسجيل المعتادة، بما فيها بيانات العضو والعمر والتحقق والملف الشخصي. لا نضيف عمراً إلى سجل الزائر.'),
      const SizedBox(height: 12),
      TextField(controller: _email, keyboardType: TextInputType.emailAddress,
        decoration: const InputDecoration(labelText: 'البريد الإلكتروني', border: OutlineInputBorder())),
      const SizedBox(height: 8),
      TextField(controller: _password, obscureText: true,
        decoration: const InputDecoration(labelText: 'كلمة مرور جديدة (8 أحرف على الأقل)', border: OutlineInputBorder())),
      const SizedBox(height: 8),
      OutlinedButton(onPressed: _busy ? null : _upgrade, child: const Text('متابعة الانضمام للعضوية')),
    ]),
  ));

  @override
  Widget build(BuildContext context) {
    final active = _status['active'] == true;
    final hasProfile = _status['hasProfile'] == true;
    return Scaffold(
      appBar: AppBar(title: const Text('بوابة زائر مودة'),
        actions: [IconButton(onPressed: _loading ? null : _loadStatus, icon: const Icon(Icons.refresh))]),
      body: _loading ? const Center(child: CircularProgressIndicator()) : ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Card(child: Padding(
            padding: EdgeInsets.all(14),
            child: Text('الزائر يدخل الغرف العامة المؤهلة فقط، ويرسل ويستقبل النص والصوت فقط. لا رسائل خاصة أو محفظة أو متجر أو هدايا أو مشتريات أو غرف خاصة.'),
          )),
          if (_message != null) Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Text(_message!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
          ),
          if (!hasProfile) _profileForm(),
          if (hasProfile && active) ...[
            Card(child: ListTile(
              leading: const Icon(Icons.timer_outlined), title: Text(_expiryText()),
              subtitle: Text('مرحباً ${(_status['profile'] as Map?)?['username'] ?? 'بزائر مودة'}'),
              trailing: IconButton(onPressed: _busy ? null : _endSession, icon: const Icon(Icons.logout)),
            )),
            Text('الغرف العامة المتاحة للزوار', style: Theme.of(context).textTheme.titleLarge),
            if (_rooms.isEmpty) const Card(child: Padding(
              padding: EdgeInsets.all(16),
              child: Text('لا توجد حالياً غرف عامة مصنفة لجميع الأعمار. لن نعرض غرفاً عمرية أو خاصة للزوار.'),
            )),
            ..._rooms.map((room) => Card(child: ListTile(
              leading: const Icon(Icons.forum_outlined),
              title: Text(room['name'] as String? ?? 'غرفة عامة'),
              subtitle: Text('الأعضاء: ${room['memberCount'] ?? 0} / ${room['capacity'] ?? 0} • نص وصوت'),
              trailing: FilledButton(
                onPressed: _busy ? null : () async {
                  setState(() => _busy = true);
                  try {
                    await _functions.httpsCallable('joinRoom').call({'roomId': room['roomId']});
                    if (!mounted) return;
                    await Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => GuestRoomChatScreen(
                        roomId: room['roomId'] as String,
                        roomName: room['name'] as String? ?? 'غرفة عامة',
                      ),
                    ));
                    await _loadStatus();
                  } on FirebaseFunctionsException catch (e) {
                    if (mounted) setState(() => _message = e.message ?? 'تعذر دخول الغرفة.');
                  } finally { if (mounted) setState(() => _busy = false); }
                },
                child: const Text('انضمام'),
              ),
            ))),
          ],
          if (hasProfile && !active) Card(child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              const Text('لا توجد جلسة زائر نشطة. يُحسب موعد العودة على الخادم ولا يمكن إعادة ضبطه بتغيير ساعة الجهاز.'),
              if (_status['nextEligibleAt'] is num)
                Text('موعد السماح التالي: ${DateTime.fromMillisecondsSinceEpoch((_status['nextEligibleAt'] as num).toInt()).toLocal()}'),
              FilledButton(onPressed: _busy ? null : _start, child: const Text('بدء جلسة زائر جديدة')),
            ]),
          )),
          const SizedBox(height: 16),
          _upgradeCard(),
        ],
      ),
    );
  }
}
