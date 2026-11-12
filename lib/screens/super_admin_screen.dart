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
  final TextEditingController _commissionPercentController = TextEditingController();
  Map<String, dynamic>? _overview;
  Map<String, dynamic>? _member;
  bool _loadingOverview = false;
  bool _searching = false;
  bool _updatingStatus = false;
  bool _registrationEnabled = false;
  bool _savingRegistrationPolicy = false;
  bool _transferEnabled = false;
  bool _savingTransferSettings = false;
  bool _creatingRoom = false;
  bool _loadingCatalog = false;
  bool _savingCatalogItem = false;
  List<Map<String, dynamic>> _catalogItems = [];
  int _minimumAge = 16;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadOverview();
    _loadCatalog();
  }

  @override
  void dispose() {
    _memberUidController.dispose();
    _commissionPercentController.dispose();
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
        final transfer = result['transferSettings'] as Map<String, dynamic>? ?? {};
        _transferEnabled = transfer['enabled'] == true;
        final commissionBps = transfer['commissionBps'];
        _commissionPercentController.text = commissionBps is num
            ? (commissionBps.toDouble() / 100).toStringAsFixed(2)
            : '0.00';
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

  Future<void> _loadCatalog() async {
    if (_loadingCatalog) return;
    setState(() => _loadingCatalog = true);
    try {
      final items = await _service.getOwnerStoreCatalog();
      if (mounted) setState(() => _catalogItems = items);
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحميل كتالوج المتجر.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحميل كتالوج المتجر.');
    } finally {
      if (mounted) setState(() => _loadingCatalog = false);
    }
  }

  Future<void> _editStoreItem([Map<String, dynamic>? existing]) async {
    if (_savingCatalogItem) return;
    final itemIdController = TextEditingController(text: existing?['itemId'] as String? ?? '');
    final nameController = TextEditingController(text: existing?['name'] as String? ?? '');
    final descriptionController = TextEditingController(text: existing?['description'] as String? ?? '');
    final priceController = TextEditingController(
      text: existing?['priceCoins']?.toString() ?? '1000',
    );
    final durationController = TextEditingController(
      text: existing?['durationDays']?.toString() ?? '',
    );
    final sortController = TextEditingController(
      text: existing?['sortOrder']?.toString() ?? '1000',
    );
    const categories = ['feature', 'avatar', 'theme', 'title', 'vip', 'analytics', 'discovery'];
    var category = categories.contains(existing?['category'])
        ? existing!['category'] as String
        : 'feature';
    var active = existing?['active'] != false;
    final values = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) => AlertDialog(
          title: Text(existing == null ? 'إضافة عنصر للمتجر' : 'تعديل عنصر المتجر'),
          content: SizedBox(
            width: 460,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: itemIdController,
                    enabled: existing == null,
                    maxLength: 64,
                    decoration: const InputDecoration(
                      labelText: 'معرف العنصر (بالإنجليزية)',
                      hintText: 'vip-month',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  TextField(
                    controller: nameController,
                    maxLength: 80,
                    decoration: const InputDecoration(
                      labelText: 'اسم العنصر',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: descriptionController,
                    maxLength: 500,
                    minLines: 2,
                    maxLines: 4,
                    decoration: const InputDecoration(
                      labelText: 'الوصف',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    initialValue: category,
                    decoration: const InputDecoration(
                      labelText: 'التصنيف',
                      border: OutlineInputBorder(),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'feature', child: Text('ميزة')),
                      DropdownMenuItem(value: 'avatar', child: Text('إطار وصورة رمزية')),
                      DropdownMenuItem(value: 'theme', child: Text('سمة وخلفية')),
                      DropdownMenuItem(value: 'title', child: Text('لقب ووسام')),
                      DropdownMenuItem(value: 'vip', child: Text('عضوية VIP')),
                      DropdownMenuItem(value: 'analytics', child: Text('تحليلات الملف')),
                      DropdownMenuItem(value: 'discovery', child: Text('تعزيز الظهور')),
                    ],
                    onChanged: (value) {
                      if (value != null) setDialogState(() => category = value);
                    },
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: priceController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'السعر بالكويـنز',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: durationController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'المدة بالأيام (اتركها فارغة للاستحقاق الدائم)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: sortController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'ترتيب العرض',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('نشر العنصر وإتاحته للشراء'),
                    value: active,
                    onChanged: (value) => setDialogState(() => active = value),
                  ),
                  const Text(
                    'تعديل السعر يؤثر على المشتريات الجديدة فقط. إلغاء النشر يمنع الشراء الجديد ولا يسحب الاستحقاقات القائمة.',
                    style: TextStyle(fontSize: 12),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('إلغاء'),
            ),
            FilledButton(
              onPressed: () {
                final itemId = itemIdController.text.trim();
                final name = nameController.text.trim();
                final price = int.tryParse(priceController.text.trim());
                final durationText = durationController.text.trim();
                final duration = durationText.isEmpty ? null : int.tryParse(durationText);
                final sortOrder = int.tryParse(sortController.text.trim());
                if (itemId.length >= 3 && name.length >= 2 &&
                    price != null && price > 0 &&
                    (durationText.isEmpty || (duration != null && duration > 0)) &&
                    sortOrder != null) {
                  Navigator.pop(dialogContext, {
                    'itemId': itemId,
                    'name': name,
                    'description': descriptionController.text.trim(),
                    'category': category,
                    'priceCoins': price,
                    'durationDays': duration,
                    'sortOrder': sortOrder,
                    'active': active,
                  });
                }
              },
              child: const Text('حفظ العنصر'),
            ),
          ],
        ),
      ),
    );
    itemIdController.dispose();
    nameController.dispose();
    descriptionController.dispose();
    priceController.dispose();
    durationController.dispose();
    sortController.dispose();
    if (values == null || !mounted) return;

    setState(() => _savingCatalogItem = true);
    try {
      await _service.setStoreCatalogItem(
        itemId: values['itemId'] as String,
        name: values['name'] as String,
        description: values['description'] as String,
        category: values['category'] as String,
        priceCoins: values['priceCoins'] as int,
        durationDays: values['durationDays'] as int?,
        sortOrder: values['sortOrder'] as int,
        active: values['active'] as bool,
      );
      await _loadCatalog();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم حفظ عنصر المتجر وتسجيل التغيير في سجل التدقيق.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر حفظ عنصر المتجر.')),
      );
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر حفظ عنصر المتجر؛ لم يتم تأكيد العملية.')),
      );
    } finally {
      if (mounted) setState(() => _savingCatalogItem = false);
    }
  }

  Future<void> _createRoom() async {
    if (_creatingRoom) return;
    final nameController = TextEditingController();
    final capacityController = TextEditingController(text: '50');
    var kind = 'public';
    final values = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) => AlertDialog(
          title: const Text('إنشاء غرفة مودة'),
          content: SizedBox(
            width: 420,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameController,
                  maxLength: 60,
                  decoration: const InputDecoration(
                    labelText: 'اسم الغرفة',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: kind,
                  decoration: const InputDecoration(
                    labelText: 'نوع الغرفة',
                    border: OutlineInputBorder(),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'public', child: Text('عامة')),
                    DropdownMenuItem(value: 'private', child: Text('خاصة بالدعوات')),
                  ],
                  onChanged: (value) {
                    if (value != null) setDialogState(() => kind = value);
                  },
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: capacityController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'السعة القصوى (5–1000)',
                    border: OutlineInputBorder(),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('إلغاء'),
            ),
            FilledButton(
              onPressed: () {
                final name = nameController.text.trim();
                final capacity = int.tryParse(capacityController.text.trim());
                if (name.length >= 3 && name.length <= 60 &&
                    capacity != null && capacity >= 5 && capacity <= 1000) {
                  Navigator.pop(dialogContext, {
                    'name': name,
                    'kind': kind,
                    'capacity': capacity,
                  });
                }
              },
              child: const Text('إنشاء'),
            ),
          ],
        ),
      ),
    );
    nameController.dispose();
    capacityController.dispose();
    if (values == null || !mounted) return;

    setState(() => _creatingRoom = true);
    try {
      final result = await _service.createRoom(
        name: values['name'] as String,
        kind: values['kind'] as String,
        capacity: values['capacity'] as int,
      );
      await _loadOverview();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('تم إنشاء الغرفة. المعرف: ${result['roomId']}')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر إنشاء الغرفة.')),
      );
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر إنشاء الغرفة؛ لم يتم تأكيد نجاح العملية.')),
      );
    } finally {
      if (mounted) setState(() => _creatingRoom = false);
    }
  }

  Future<void> _saveTransferSettings() async {
    if (_savingTransferSettings) return;
    final percent = double.tryParse(_commissionPercentController.text.trim());
    if (percent == null || !percent.isFinite || percent < 0 || percent >= 100) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('أدخل عمولة صحيحة من 0% إلى أقل من 100%.')),
      );
      return;
    }
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('تأكيد إعدادات تحويل الكوينز'),
        content: Text(
          'الحالة الجديدة: ${_transferEnabled ? 'التحويلات مفعّلة' : 'التحويلات متوقفة'}\n'
          'عمولة المنصة: ${percent.toStringAsFixed(2)}%.\n'
          'سيُطبق الإعداد على التحويلات الجديدة فقط، وسيُسجل التغيير في سجل التدقيق.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('مراجعة لاحقاً'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('تأكيد وحفظ'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    setState(() => _savingTransferSettings = true);
    try {
      await _service.setTransferCommission(
        commissionBps: (percent * 100).round(),
        enabled: _transferEnabled,
      );
      await _loadOverview();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم حفظ إعدادات تحويل الكوينز وتسجيلها في سجل التدقيق.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر حفظ إعدادات التحويل.')),
      );
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر حفظ إعدادات التحويل؛ لم يتم تأكيد نجاح العملية.')),
      );
    } finally {
      if (mounted) setState(() => _savingTransferSettings = false);
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
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('إدارة الغرف والمجتمعات', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                const Text('إنشاء الغرف العامة والخاصة يتم من الخادم بعد التحقق من جلسة المالك وMFA، مع فصل الجمهور العمري وتسجيل المالك وسعة الغرفة.'),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: _creatingRoom ? null : _createRoom,
                    icon: _creatingRoom
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.add_home_work_outlined),
                    label: const Text('إنشاء غرفة جديدة'),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.cloud_sync_outlined, color: Theme.of(context).colorScheme.primary),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'مركز إدارة السحابة ودورة حياة البيانات',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                    ),
                    const Chip(label: Text('قيد البناء')),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  'المركز السيادي المعتمد لصيانة مودة وتنظيف البيانات والوسائط السحابية ضمن نطاقات محددة. '
                  'لن تُفعّل عمليات الحذف الجماعي قبل اكتمال المعاينة الخادمية، وتأكيد MFA، '
                  'والنسخ الاحتياطي القابل للاستعادة، وسجل التدقيق واختبارات الحماية.',
                ),
                const SizedBox(height: 12),
                const ListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(Icons.forum_outlined),
                  title: Text('تنظيف الدردشات والرسائل'),
                  subtitle: Text('حسب المحادثة أو الغرفة أو النطاق الزمني، دون المساس بالحسابات أو السجلات المالية والأمنية.'),
                ),
                const ListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(Icons.perm_media_outlined),
                  title: Text('تنظيف الوسائط السحابية'),
                  subtitle: Text('الصور والفيديوهات والصوتيات والملفات المؤقتة والنسخ المشتقة والملفات اليتيمة.'),
                ),
                const ListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(Icons.campaign_outlined),
                  title: Text('أرشفة الإعلانات القديمة'),
                  subtitle: Text('حماية الحملات النشطة وسجلات الفوترة والاحتفاظ القانوني.'),
                ),
                const ListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(Icons.health_and_safety_outlined),
                  title: Text('صيانة المنصة وإعادة التهيئة'),
                  subtitle: Text('فحص الصحة، ومزامنة التخزين، وإعادة بناء الفهارس والذاكرة المشتقة، ومعالجة المهام المتعثرة.'),
                ),
                const Text(
                  'الحالة الحالية: مواصفة معتمدة ومسجلة في دستور مودة؛ لا توجد بعد أزرار حذف أو تنظيف فعّالة في هذه الشاشة.',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text('إدارة كتالوج المتجر', style: Theme.of(context).textTheme.titleMedium),
                    ),
                    IconButton(
                      tooltip: 'تحديث الكتالوج',
                      onPressed: _loadingCatalog ? null : _loadCatalog,
                      icon: const Icon(Icons.refresh),
                    ),
                  ],
                ),
                const Text('إضافة العناصر ونشرها أو إلغاء نشرها. لا يُمنح أي استحقاق إلا عبر معاملة شراء خادمية ذرية.'),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: _savingCatalogItem ? null : () => _editStoreItem(),
                    icon: const Icon(Icons.add_shopping_cart),
                    label: const Text('إضافة عنصر جديد'),
                  ),
                ),
                if (_loadingCatalog) const LinearProgressIndicator(),
                if (!_loadingCatalog && _catalogItems.isEmpty)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Text('لا توجد عناصر مسجلة في الكتالوج بعد.'),
                  ),
                ..._catalogItems.map((item) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(item['name'] as String? ?? item['itemId'] as String? ?? 'عنصر'),
                  subtitle: Text(
                    '${item['priceCoins'] ?? 0} كوين • '
                    '${item['active'] == true ? 'منشور' : 'غير منشور'}',
                  ),
                  trailing: IconButton(
                    tooltip: 'تعديل',
                    onPressed: _savingCatalogItem ? null : () => _editStoreItem(item),
                    icon: const Icon(Icons.edit_outlined),
                  ),
                )),
              ],
            ),
          ),
        ),
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
                Text('الحد الأدنى لعمر التسجيل: $_minimumAge سنة'),
                Slider(
                  value: _minimumAge.toDouble(),
                  min: 16,
                  max: 120,
                  divisions: 104,
                  label: '$_minimumAge',
                  onChanged: _savingRegistrationPolicy ? null : (value) {
                    setState(() => _minimumAge = value.round());
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
        Text('التحكم المالي وتحويل الكوينز', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('السماح بتحويل الكوينز'),
                  subtitle: const Text('إيقاف التحويلات الجديدة من الخادم فور حفظ الإعداد.'),
                  value: _transferEnabled,
                  onChanged: _savingTransferSettings ? null : (value) {
                    setState(() => _transferEnabled = value);
                  },
                ),
                TextField(
                  controller: _commissionPercentController,
                  enabled: !_savingTransferSettings,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(
                    labelText: 'عمولة المنصة (%)',
                    helperText: 'تُحفظ بوحدات basis points وبحساب صحيح دقيق.',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: _savingTransferSettings ? null : _saveTransferSettings,
                    icon: _savingTransferSettings
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.save_outlined),
                    label: const Text('حفظ إعدادات التحويل'),
                  ),
                ),
                const Text(
                  'هذا التحكم يخص تحويلات الأعضاء فقط. شحن الكوينز والمشتريات والاسترداد لا تُعرض كعمليات فعّالة قبل بناء وربط بواباتها الموثوقة.',
                  style: TextStyle(fontSize: 12),
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
