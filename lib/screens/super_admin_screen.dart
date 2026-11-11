import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import '../services/super_admin_security_service.dart';

class SuperAdminScreen extends StatefulWidget {
  const SuperAdminScreen({super.key});

  @override
  State<SuperAdminScreen> createState() => _SuperAdminScreenState();
}

class _SuperAdminScreenState extends State<SuperAdminScreen> {
  final SuperAdminSecurityService _service = SuperAdminSecurityService();
  final TextEditingController _memberUidController = TextEditingController();
  Map<String, dynamic>? _overview;
  Map<String, dynamic>? _member;
  bool _loadingOverview = false;
  bool _searching = false;
  bool _updatingStatus = false;
  bool _registrationEnabled = false;
  bool _savingRegistrationPolicy = false;
  int _minimumAge = 16;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadOverview();
  }

  @override
  void dispose() {
    _memberUidController.dispose();
    super.dispose();
  }

  Future<void> _loadOverview() async {
    setState(() => _loadingOverview = true);
    try {
      final result = await _service.getOperationsOverview();
      if (mounted) setState(() {
        _overview = result;
        final policy = result['registrationPolicy'] as Map<String, dynamic>? ?? {};
        _registrationEnabled = policy['enabled'] == true;
        final configuredAge = policy['minimumAge'];
        _minimumAge = configuredAge is num && configuredAge.toInt() >= 16 && configuredAge.toInt() <= 120
            ? configuredAge.toInt()
            : 16;
        _error = null;
      });
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحميل غرفة العمليات.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر الاتصال بغرفة العمليات.');
    } finally {
      if (mounted) setState(() => _loadingOverview = false);
    }
  }

  Future<void> _searchMember() async {
    final uid = _memberUidController.text.trim();
    if (uid.isEmpty) return;
    setState(() {
      _searching = true;
      _member = null;
    });
    try {
      final result = await _service.getMemberSummary(uid);
      if (mounted) setState(() {
        _member = result;
        _error = null;
      });
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر العثور على العضو.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر البحث عن العضو.');
    } finally {
      if (mounted) setState(() => _searching = false);
    }
  }

  Future<void> _changeMemberStatus(String status) async {
    final member = _member;
    if (member == null || _updatingStatus) return;
    final reasonController = TextEditingController();
    final reason = await showDialog<String>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(status == 'active' ? 'إعادة تفعيل الحساب' : status == 'banned' ? 'حظر الحساب' : 'تعليق الحساب'),
        content: TextField(
          controller: reasonController,
          minLines: 2,
          maxLines: 4,
          maxLength: 500,
          decoration: const InputDecoration(
            labelText: 'سبب الإجراء (مطلوب)',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('إلغاء'),
          ),
          FilledButton(
            onPressed: () {
              final value = reasonController.text.trim();
              if (value.length >= 5) Navigator.pop(dialogContext, value);
            },
            child: const Text('تأكيد'),
          ),
        ],
      ),
    );
    reasonController.dispose();
    if (reason == null || !mounted) return;

    setState(() => _updatingStatus = true);
    try {
      await _service.setMemberAccessStatus(
        memberUid: member['uid'] as String,
        status: status,
        reason: reason,
      );
      await _searchMember();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم تنفيذ إجراء الحساب من الخادم وإبطال جلساته.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر تنفيذ الإجراء.')),
      );
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر تنفيذ الإجراء. لم يتم تأكيد نجاحه.')),
      );
    } finally {
      if (mounted) setState(() => _updatingStatus = false);
    }
  }

  Future<void> _saveRegistrationPolicy() async {
    if (_savingRegistrationPolicy) return;
    setState(() => _savingRegistrationPolicy = true);
    try {
      await _service.setRegistrationPolicy(
        enabled: _registrationEnabled,
        minimumAge: _minimumAge,
      );
      await _loadOverview();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم حفظ سياسة التسجيل وتوثيق التغيير في سجل التدقيق.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر حفظ سياسة التسجيل.')),
      );
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر حفظ السياسة؛ لم يتم تأكيد نجاح العملية.')),
      );
    } finally {
      if (mounted) setState(() => _savingRegistrationPolicy = false);
    }
  }

  Widget _metric(String label, Object? value, IconData icon) => Card(
    child: ListTile(
      leading: Icon(icon, color: Theme.of(context).colorScheme.primary),
      title: Text('$value', style: Theme.of(context).textTheme.headlineSmall),
      subtitle: Text(label),
    ),
  );

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('غرفة عمليات مالك مودة'),
      actions: [
        IconButton(
          tooltip: 'تحديث المؤشرات',
          onPressed: _loadingOverview ? null : _loadOverview,
          icon: const Icon(Icons.refresh),
        ),
      ],
    ),
    body: ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('مركز القيادة والتحكم', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 8),
                const Text(
                  'هذه العمليات لا تُنفذ إلا إذا تحقّق الخادم من صلاحية platformOwner. '
                  'لا تمنح الواجهة نفسها أي صلاحية، وكل إجراء حساس يسجل في سجل التدقيق.',
                ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        Text('مؤشرات المنصة', style: Theme.of(context).textTheme.titleMedium),
        if (_loadingOverview && _overview == null)
          const Center(child: Padding(
            padding: EdgeInsets.all(20),
            child: CircularProgressIndicator(),
          ))
        else if (_overview != null) ...[
          _metric('الأعضاء المسجلون', _overview!['memberCount'], Icons.people_outline),
          _metric('الغرف', _overview!['roomCount'], Icons.forum_outlined),
          _metric('عمليات تحويل الكوينز', _overview!['transferCount'], Icons.account_balance_wallet_outlined),
        ],
        const Divider(height: 32),
        Text('سياسة التسجيل والأهلية', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('فتح تسجيل الأعضاء الجدد'),
                  subtitle: const Text('يبقى التسجيل مغلقاً ما لم يفعّله المالك صراحةً.'),
                  value: _registrationEnabled,
                  onChanged: _savingRegistrationPolicy ? null : (value) {
                    setState(() => _registrationEnabled = value);
                  },
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<int>(
                  value: _minimumAge,
                  decoration: const InputDecoration(
                    labelText: 'الحد الأدنى لعمر التسجيل',
                    border: OutlineInputBorder(),
                  ),
                  items: List.generate(15, (index) => index + 16)
                      .map((age) => DropdownMenuItem<int>(
                        value: age,
                        child: Text('$age سنة'),
                      )).toList(),
                  onChanged: _savingRegistrationPolicy ? null : (value) {
                    if (value != null) setState(() => _minimumAge = value);
                  },
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: _savingRegistrationPolicy ? null : _saveRegistrationPolicy,
                    icon: _savingRegistrationPolicy
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.save_outlined),
                    label: const Text('حفظ سياسة التسجيل'),
                  ),
                ),
                const Text(
                  'لا يسمح النظام بحد أدنى أقل من 16 عاماً. ويظل التحقق العمري الأقوى وضوابط حماية القاصرين شرطاً قبل الإطلاق.',
                ),
              ],
            ),
          ),
        ),
        const Divider(height: 32),
        Text('إدارة وصول الأعضاء', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        TextField(
          controller: _memberUidController,
          decoration: InputDecoration(
            labelText: 'معرّف العضو UID',
            border: const OutlineInputBorder(),
            suffixIcon: IconButton(
              onPressed: _searching ? null : _searchMember,
              icon: const Icon(Icons.search),
            ),
          ),
          onSubmitted: (_) => _searchMember(),
        ),
        if (_searching) const LinearProgressIndicator(),
        if (_member != null) ...[
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(_member!['displayName'] as String? ?? 'عضو مودة',
                    style: Theme.of(context).textTheme.titleLarge),
                  Text('@${_member!['username'] ?? ''}'),
                  SelectableText('UID: ${_member!['uid']}'),
                  const SizedBox(height: 8),
                  Text('حالة الحساب: ${_member!['accountStatus'] ?? 'active'}'),
                  Text('البريد موثق: ${_member!['emailVerified'] == true ? 'نعم' : 'لا'}'),
                  Text('دخول Firebase معطل: ${_member!['authDisabled'] == true ? 'نعم' : 'لا'}'),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      OutlinedButton(
                        onPressed: _updatingStatus ? null : () => _changeMemberStatus('active'),
                        child: const Text('إعادة التفعيل'),
                      ),
                      OutlinedButton(
                        onPressed: _updatingStatus ? null : () => _changeMemberStatus('suspended'),
                        child: const Text('تعليق'),
                      ),
                      FilledButton.tonal(
                        onPressed: _updatingStatus ? null : () => _changeMemberStatus('banned'),
                        child: const Text('حظر'),
                      ),
                    ],
                  ),
                  if (_updatingStatus) const Padding(
                    padding: EdgeInsets.only(top: 12),
                    child: LinearProgressIndicator(),
                  ),
                ],
              ),
            ),
          ),
        ],
        const Divider(height: 32),
        Text('ضوابط المالك', style: Theme.of(context).textTheme.titleMedium),
        const ListTile(
          leading: Icon(Icons.verified_user_outlined),
          title: Text('الصلاحية خادمية وليست واجهة'),
          subtitle: Text('يُشترط تحقق MFA وهوية مالك المنصة وcustom claim في كل عملية إدارية.'),
        ),
        const ListTile(
          leading: Icon(Icons.password_outlined),
          title: Text('استعادة الحسابات دون كشف كلمات المرور'),
          subtitle: Text('لا يمكن قراءة كلمة المرور القديمة؛ تستخدم إجراءات إعادة تعيين آمنة.'),
        ),
        const ListTile(
          leading: Icon(Icons.policy_outlined),
          title: Text('صلاحيات المشرفين محدودة بالغرف'),
          subtitle: Text('لا يستطيع مشرف الغرفة منح نفسه صلاحيات مالك المنصة أو إدارة أقسامها.'),
        ),
      ],
    ),
  );
}
