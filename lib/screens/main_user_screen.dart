import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../services/auth_service.dart';
import '../services/push_notification_service.dart';
import 'profile_screen.dart';
import 'shop_screen.dart';
import 'wallet_screen.dart';
import 'rooms_screen.dart';
import 'super_admin_screen.dart';
import 'safety_center_screen.dart';
import 'notification_center_screen.dart';

class MainUserScreen extends StatefulWidget {
  final String userId;
  const MainUserScreen({super.key, required this.userId});

  @override
  State<MainUserScreen> createState() => _MainUserScreenState();
}

class _MainUserScreenState extends State<MainUserScreen> {
  late Future<bool> _profileFuture;
  bool _signingOut = false;
  final PushNotificationService _pushNotifications = PushNotificationService();

  @override
  void initState() {
    super.initState();
    _profileFuture = _hasCompletedProfile();
    _initializePushNotifications();
  }

  Future<void> _initializePushNotifications() async {
    await _pushNotifications.initialize(onForegroundMessage: (message) {
      if (!mounted) return;
      final title = message.notification?.title ?? 'إشعار جديد من مودة';
      final body = message.notification?.body ?? 'لديك تحديث جديد.';
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$title — $body')));
    });
  }

  Future<void> _signOut() async {
    if (_signingOut) return;
    setState(() => _signingOut = true);
    try {
      // Push-token cleanup is best-effort: a network failure must never keep
      // an authenticated member or owner signed in.
      try {
        await _pushNotifications.unregister();
      } catch (_) {
        // Firebase Auth sign-out remains mandatory even when token cleanup fails.
      }
      await AuthService().signOut();
      // AuthGate observes FirebaseAuth state and returns to the entry screen.
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر إنهاء جلسة الدخول. تحقق من الاتصال ثم أعد المحاولة.')),
      );
    } finally {
      if (mounted) setState(() => _signingOut = false);
    }
  }

  @override
  void dispose() {
    unawaited(_pushNotifications.dispose());
    super.dispose();
  }

  Future<bool> _hasCompletedProfile() async {
    final snapshot = await FirebaseFirestore.instance.collection('users').doc(widget.userId).get();
    return snapshot.data()?['profileCompleted'] == true;
  }

  void _refreshProfile() {
    setState(() => _profileFuture = _hasCompletedProfile());
    unawaited(_initializePushNotifications());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('مودة | MAWDA'),
        actions: [
          IconButton(
            tooltip: 'الإشعارات',
            onPressed: () => Navigator.of(context).push(MaterialPageRoute(
              builder: (_) => const NotificationCenterScreen(),
            )),
            icon: const Icon(Icons.notifications_outlined),
          ),
          IconButton(
            tooltip: 'مركز الأمان والخصوصية',
            onPressed: () => Navigator.of(context).push(MaterialPageRoute(
              builder: (_) => const SafetyCenterScreen(),
            )),
            icon: const Icon(Icons.shield_outlined),
          ),
          IconButton(
            tooltip: 'تسجيل الخروج',
            onPressed: _signingOut ? null : _signOut,
            icon: _signingOut
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.logout),
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
            return _CompletedProfilePanel(userId: widget.userId);
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
  final Set<String> _selectedGoals = <String>{};
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
    super.dispose();
  }

  String? _required(String? value) {
    if (value == null || value.trim().isEmpty) return 'هذا الحقل مطلوب';
    if (value.trim().length < 2) return 'أدخل حرفين على الأقل';
    return null;
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
        'goals': _selectedGoals.toList(),
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
        validator: validator ?? _required,
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
                    return age == null || age < 16 || age > 120 ? 'يجب أن يكون العمر 16 عاماً على الأقل' : null;
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
                const Align(
                  alignment: Alignment.centerRight,
                  child: Text('أهداف الانضمام', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 4,
                  children: [
                    FilterChip(
                      label: const Text('الصداقة'),
                      selected: _selectedGoals.contains('friendship'),
                      onSelected: (selected) => setState(() {
                        selected ? _selectedGoals.add('friendship') : _selectedGoals.remove('friendship');
                      }),
                    ),
                    FilterChip(
                      label: const Text('التواصل الاجتماعي'),
                      selected: _selectedGoals.contains('social_connection'),
                      onSelected: (selected) => setState(() {
                        selected ? _selectedGoals.add('social_connection') : _selectedGoals.remove('social_connection');
                      }),
                    ),
                    FilterChip(
                      label: const Text('التعارف العاطفي (18 عاماً فأكثر)'),
                      selected: _selectedGoals.contains('romantic_dating'),
                      onSelected: (selected) {
                        final age = int.tryParse(_age.text.trim()) ?? 0;
                        if (selected && age < 18) {
                          setState(() => _error = 'التعارف العاطفي متاح للأعضاء بعمر 18 عاماً فأكثر.');
                          return;
                        }
                        setState(() {
                          _error = null;
                          selected ? _selectedGoals.add('romantic_dating') : _selectedGoals.remove('romantic_dating');
                        });
                      },
                    ),
                    FilterChip(
                      label: const Text('نية الزواج (18 عاماً فأكثر)'),
                      selected: _selectedGoals.contains('marriage'),
                      onSelected: (selected) {
                        final age = int.tryParse(_age.text.trim()) ?? 0;
                        if (selected && age < 18) {
                          setState(() => _error = 'نية الزواج متاحة للأعضاء بعمر 18 عاماً فأكثر.');
                          return;
                        }
                        setState(() {
                          _error = null;
                          selected ? _selectedGoals.add('marriage') : _selectedGoals.remove('marriage');
                        });
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                const Text('الصداقة والتواصل الاجتماعي غير الرومانسي متاحان من 16 عاماً، أما التعارف العاطفي ونية الزواج فمن 18 عاماً.', textAlign: TextAlign.center, style: TextStyle(fontSize: 12)),
                const SizedBox(height: 12),
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
  const _CompletedProfilePanel({required this.userId});
  final String userId;

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
              const SizedBox(height: 20),
              if (user != null)
                Wrap(
                  alignment: WrapAlignment.center,
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    OutlinedButton.icon(
                      icon: const Icon(Icons.person_outline),
                      label: const Text('ملفي الشخصي'),
                      onPressed: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => ProfileScreen(
                            profileUserId: user.uid,
                            currentUserId: user.uid,
                          ),
                        ),
                      ),
                    ),
                    OutlinedButton.icon(
                      icon: const Icon(Icons.account_balance_wallet_outlined),
                      label: const Text('المحفظة'),
                      onPressed: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => WalletScreen(userId: user.uid),
                        ),
                      ),
                    ),
                    OutlinedButton.icon(
                      icon: const Icon(Icons.meeting_room_outlined),
                      label: const Text('الغرف والمجتمعات'),
                      onPressed: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => RoomsScreen(userId: userId),
                        ),
                      ),
                    ),
                    FutureBuilder<IdTokenResult>(
                      future: user.getIdTokenResult(),
                      builder: (context, tokenSnapshot) {
                        if (tokenSnapshot.data?.claims?['platformOwner'] != true) {
                          return const SizedBox.shrink();
                        }
                        return OutlinedButton.icon(
                          icon: const Icon(Icons.admin_panel_settings_outlined),
                          label: const Text('لوحة السوبر أدمن'),
                          onPressed: () => Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => const SuperAdminScreen()),
                          ),
                        );
                      },
                    ),
                    OutlinedButton.icon(
                      icon: const Icon(Icons.storefront_outlined),
                      label: const Text('المتجر'),
                      onPressed: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => ShopScreen(userId: user.uid),
                        ),
                      ),
                    ),
                  ],
                ),
              const SizedBox(height: 16),
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
