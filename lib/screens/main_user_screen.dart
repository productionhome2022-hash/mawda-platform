import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../services/auth_service.dart';

class MainUserScreen extends StatefulWidget {
  final String userId;
  const MainUserScreen({super.key, required this.userId});

  @override
  State<MainUserScreen> createState() => _MainUserScreenState();
}

class _MainUserScreenState extends State<MainUserScreen> {
  late Future<bool> _profileFuture;

  @override
  void initState() {
    super.initState();
    _profileFuture = _hasCompletedProfile();
  }

  Future<bool> _hasCompletedProfile() async {
    final snapshot = await FirebaseFirestore.instance.collection('users').doc(widget.userId).get();
    return snapshot.data()?['profileCompleted'] == true;
  }

  void _refreshProfile() {
    setState(() => _profileFuture = _hasCompletedProfile());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('مودة | MAWDA'),
        actions: [
          IconButton(
            tooltip: 'تسجيل الخروج',
            onPressed: () => AuthService().signOut(),
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: FutureBuilder<bool>(
        future: _profileFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return _MessagePanel(
              message: 'تعذر تحميل ملف العضوية. تحقق من الاتصال ثم أعد المحاولة.',
              actionLabel: 'إعادة المحاولة',
              onAction: _refreshProfile,
            );
          }
          if (snapshot.data == true) {
            return const _CompletedProfilePanel();
          }
          return _MemberProfileForm(onCompleted: _refreshProfile);
        },
      ),
    );
  }
}

class _MemberProfileForm extends StatefulWidget {
  const _MemberProfileForm({required this.onCompleted});
  final VoidCallback onCompleted;

  @override
  State<_MemberProfileForm> createState() => _MemberProfileFormState();
}

class _MemberProfileFormState extends State<_MemberProfileForm> {
  final _formKey = GlobalKey<FormState>();
  final _fullName = TextEditingController();
  final _username = TextEditingController();
  final _age = TextEditingController();
  final _profession = TextEditingController();
  final _country = TextEditingController();
  final _region = TextEditingController();
  final _bio = TextEditingController();
  final _interests = TextEditingController();
  final _goals = TextEditingController();
  String? _gender;
  String? _maritalStatus;
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _fullName.dispose();
    _username.dispose();
    _age.dispose();
    _profession.dispose();
    _country.dispose();
    _region.dispose();
    _bio.dispose();
    _interests.dispose();
    _goals.dispose();
    super.dispose();
  }

  String _required(String? value) {
    if (value == null || value.trim().isEmpty) return 'هذا الحقل مطلوب';
    return value.trim().length < 2 ? 'أدخل حرفين على الأقل' : '';
  }

  List<String> _splitList(String value) => value
      .split(',')
      .map((item) => item.trim())
      .where((item) => item.isNotEmpty)
      .toSet()
      .toList();

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_gender == null || _maritalStatus == null) {
      setState(() => _error = 'يرجى اختيار الجنس والحالة الاجتماعية.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final callable = FirebaseFunctions.instance.httpsCallable('completeMemberProfile');
      final result = await callable.call({
        'fullName': _fullName.text.trim(),
        'username': _username.text.trim(),
        'age': int.parse(_age.text.trim()),
        'profession': _profession.text.trim(),
        'country': _country.text.trim(),
        'region': _region.text.trim(),
        'gender': _gender,
        'maritalStatus': _maritalStatus,
        'bio': _bio.text.trim(),
        'interests': _splitList(_interests.text),
        'goals': _splitList(_goals.text),
      });
      if (!mounted) return;
      final data = Map<String, dynamic>.from(result.data as Map);
      if (data['rewardGranted'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('اكتمل ملفك! أضيفت 500 كوين إلى محفظتك.')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم العثور على عضويتك المكتملة.')),
        );
      }
      widget.onCompleted();
    } on FirebaseFunctionsException catch (e) {
      if (mounted) {
        setState(() => _error = e.message ?? 'تعذر إكمال التسجيل. حاول مرة أخرى.');
      }
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر إكمال التسجيل. راجع البيانات وحاول مجدداً.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Widget _field(String label, TextEditingController controller, {int maxLines = 1, TextInputType? keyboardType, String? Function(String?)? validator}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        maxLines: maxLines,
        keyboardType: keyboardType,
        validator: validator ?? (value) {
          final error = _required(value);
          return error.isEmpty ? null : error;
        },
        decoration: InputDecoration(
          labelText: label,
          border: const OutlineInputBorder(),
          alignLabelWithHint: maxLines > 1,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 560),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(Icons.favorite, size: 58, color: Color(0xFFE8A0B5)),
                const SizedBox(height: 12),
                const Text('أهلاً بك في مودة', textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                const Text('أكمل بيانات عضويتك للانتقال إلى المنصة. اسم المستخدم فريد ولا يمكن مشاركته مع عضو آخر.',
                  textAlign: TextAlign.center),
                const SizedBox(height: 20),
                _field('الاسم الكامل', _fullName),
                _field('اسم المستخدم (إنجليزي وأرقام و _)', _username,
                  validator: (value) {
                    final v = value?.trim() ?? '';
                    if (v.length < 3 || v.length > 20) return 'اسم المستخدم من 3 إلى 20 حرفاً';
                    if (!RegExp(r'^[A-Za-z0-9_]+$').hasMatch(v)) return 'استخدم الإنجليزية والأرقام والشرطة السفلية فقط';
                    return null;
                  }),
                _field('العمر', _age, keyboardType: TextInputType.number,
                  validator: (value) {
                    final age = int.tryParse(value ?? '');
                    return age == null || age < 1 || age > 120 ? 'أدخل عمراً صحيحاً' : null;
                  }),
                _field('المهنة', _profession),
                _field('الدولة', _country),
                _field('المحافظة / المنطقة', _region),
                DropdownButtonFormField<String>(
                  initialValue: _gender,
                  decoration: const InputDecoration(labelText: 'الجنس', border: OutlineInputBorder()),
                  items: const [
                    DropdownMenuItem(value: 'male', child: Text('ذكر')),
                    DropdownMenuItem(value: 'female', child: Text('أنثى')),
                  ],
                  onChanged: (value) => setState(() => _gender = value),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _maritalStatus,
                  decoration: const InputDecoration(labelText: 'الحالة الاجتماعية', border: OutlineInputBorder()),
                  items: const [
                    DropdownMenuItem(value: 'single', child: Text('أعزب / عزباء')),
                    DropdownMenuItem(value: 'married', child: Text('متزوج / متزوجة')),
                    DropdownMenuItem(value: 'divorced', child: Text('مطلق / مطلقة')),
                    DropdownMenuItem(value: 'widowed', child: Text('أرمل / أرملة')),
                  ],
                  onChanged: (value) => setState(() => _maritalStatus = value),
                ),
                const SizedBox(height: 12),
                _field('نبذة عنك (حتى 500 حرف)', _bio, maxLines: 4,
                  validator: (value) => (value?.length ?? 0) > 500 ? 'الحد الأقصى 500 حرف' : null),
                _field('الاهتمامات (افصل بينها بفواصل)', _interests),
                _field('أهداف الانضمام (افصل بينها بفواصل)', _goals),
                if (_error != null) ...[
                  const SizedBox(height: 8),
                  Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error),
                    textAlign: TextAlign.center),
                ],
                const SizedBox(height: 12),
                FilledButton(
                  onPressed: _busy ? null : _submit,
                  child: _busy
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('إكمال العضوية'),
                ),
                const SizedBox(height: 8),
                const Text('تُمنح مكافأة 500 كوين بعد نجاح التحقق وإكمال العضوية وفق سياسة العمر المعتمدة.',
                  textAlign: TextAlign.center, style: TextStyle(fontSize: 12)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _CompletedProfilePanel extends StatelessWidget {
  const _CompletedProfilePanel();

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 520),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.favorite, size: 72, color: Color(0xFFE8A0B5)),
              const SizedBox(height: 16),
              const Text('اكتملت عضويتك في مودة',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              Text(user?.email ?? '', textAlign: TextAlign.center),
              const SizedBox(height: 12),
              const Text('تم إنشاء ملفك من خلال الخادم الموثوق. ستُفتح بقية أقسام المنصة بعد اكتمال مراحلها الأمنية والتشغيلية.',
                textAlign: TextAlign.center),
            ],
          ),
        ),
      ),
    );
  }
}

class _MessagePanel extends StatelessWidget {
  const _MessagePanel({required this.message, required this.actionLabel, required this.onAction});
  final String message;
  final String actionLabel;
  final VoidCallback onAction;

  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(24),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Text(message, textAlign: TextAlign.center),
        const SizedBox(height: 16),
        FilledButton(onPressed: onAction, child: Text(actionLabel)),
      ]),
    ),
  );
}
