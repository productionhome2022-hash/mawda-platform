import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

class OwnerContractCenterScreen extends StatefulWidget {
  const OwnerContractCenterScreen({super.key});

  @override
  State<OwnerContractCenterScreen> createState() => _OwnerContractCenterScreenState();
}

class _OwnerContractCenterScreenState extends State<OwnerContractCenterScreen> {
  final FirebaseFunctions _functions = FirebaseFunctions.instance;
  List<Map<String, dynamic>> _contracts = [];
  bool _loading = true;
  bool _busy = false;
  String? _error;

  static const _types = <String, String>{
    'creator_membership': 'عضوية صُنّاع مودة',
    'production_supervisor': 'تكليف مشرف إنتاج',
    'production_general_supervisor': 'تكليف المشرف العام للإنتاج',
    'advertising_general_supervisor': 'تكليف المشرف العام للإعلانات',
    'ad_representative_commission': 'اتفاقية مندوب إعلانات',
    'influencer_framework': 'الاتفاقية العامة للمؤثر',
    'influencer_campaign': 'عقد عمل مؤثر مستقل',
    'direct_advertiser': 'عقد إعلان مباشر',
    'legal_administrative_supervisor': 'تكليف مشرف قانوني وإداري',
    'signing_delegation': 'تفويض مستقل بالتوقيع',
  };

  static const _statuses = <String, String>{
    'draft': 'مسودة',
    'legal_review': 'قيد المراجعة القانونية',
    'pending_owner_approval': 'بانتظار اعتماد المالك',
    'ready_to_send': 'جاهز للإرسال',
    'awaiting_counterparty_signature': 'بانتظار توقيع الطرف الآخر',
    'awaiting_company_signature': 'بانتظار توقيع الشركة',
    'signed': 'مكتمل التوقيع',
    'effective': 'نافذ',
    'suspended': 'معلق',
    'expired': 'منتهٍ',
    'renewal_or_amendment': 'قيد التجديد أو التعديل',
    'terminated': 'منتهٍ بقرار إنهاء',
    'cancelled': 'ملغى',
  };

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (mounted) setState(() { _loading = true; _error = null; });
    try {
      final response = await _functions.httpsCallable('listOwnerContracts').call({
        'limit': 100,
      });
      final data = Map<String, dynamic>.from(response.data as Map);
      final contracts = (data['contracts'] as List<dynamic>? ?? const [])
          .whereType<Map>()
          .map((item) => Map<String, dynamic>.from(item))
          .toList(growable: false);
      if (!mounted) return;
      setState(() {
        _contracts = contracts;
        _contracts.sort((a, b) =>
          ((b['recordVersion'] as num?)?.toInt() ?? 0)
              .compareTo((a['recordVersion'] as num?)?.toInt() ?? 0));
      });
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحميل مركز العقود.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحميل مركز العقود. تحقق من الاتصال.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _createDraft() async {
    final input = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (_) => const _CreateContractDialog(),
    );
    if (input == null || !mounted) return;
    setState(() { _busy = true; _error = null; });
    try {
      final response = await _functions.httpsCallable('createOwnerContractDraft').call({
        ...input,
        'idempotencyKey': const Uuid().v4().replaceAll('-', ''),
      });
      final data = Map<String, dynamic>.from(response.data as Map);
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('أُنشئت المسودة: ${data['contractId']}'),
      ));
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر إنشاء مسودة العقد.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر إنشاء مسودة العقد.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _transition(Map<String, dynamic> contract, String nextStatus) async {
    if (_busy) return;
    String? reason;
    if (['cancelled', 'suspended', 'terminated'].contains(nextStatus)) {
      final controller = TextEditingController();
      reason = await showDialog<String>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('سبب الإجراء'),
          content: TextField(
            controller: controller,
            minLines: 3,
            maxLines: 5,
            decoration: const InputDecoration(
              labelText: 'سبب الإلغاء أو التعليق أو الإنهاء',
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
            FilledButton(
              onPressed: () => Navigator.pop(context, controller.text.trim()),
              child: const Text('متابعة'),
            ),
          ],
        ),
      );
      controller.dispose();
      if (reason == null || reason.trim().length < 10) {
        if (mounted && reason != null) {
          setState(() => _error = 'يجب كتابة سبب واضح لا يقل عن 10 أحرف.');
        }
        return;
      }
    }
    setState(() { _busy = true; _error = null; });
    try {
      await _functions.httpsCallable('transitionOwnerContract').call({
        'contractId': contract['contractId'],
        'nextStatus': nextStatus,
        'expectedRecordVersion': contract['recordVersion'],
        'reason': reason,
      });
      await _load();
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحديث حالة العقد.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحديث حالة العقد.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _signForCompany(Map<String, dynamic> contract) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('توقيع الشركة'),
        content: const Text(
          'سيُثبت توقيع الشركة على الإصدار والبصمة المعروضين. '
          'يتطلب الإجراء جلسة مالك موثقة وMFA وبريداً إلكترونياً متحققاً وإعادة تحقق حديثة.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('إلغاء')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('تأكيد التوقيع')),
        ],
      ),
    );
    if (confirmed != true || !mounted || _busy) return;
    setState(() { _busy = true; _error = null; });
    try {
      await _functions.httpsCallable('signContractForCompany').call({
        'contractId': contract['contractId'],
        'expectedVersion': contract['version'],
        'expectedContentHash': contract['contentHash'],
        'accept': true,
      });
      await _load();
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر توقيع العقد.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر توقيع العقد.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _showBody(Map<String, dynamic> contract) async {
    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text((contract['title'] as String?) ?? 'نص العقد'),
        content: SizedBox(
          width: 560,
          child: SingleChildScrollView(
            child: SelectableText((contract['body'] as String?) ?? 'لا يوجد نص محفوظ.'),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إغلاق')),
        ],
      ),
    );
  }

  List<Widget> _actionsFor(Map<String, dynamic> contract) {
    final status = contract['status'] as String? ?? '';
    final actions = <Widget>[];
    void add(String next, String label) {
      actions.add(OutlinedButton(
        onPressed: _busy ? null : () => _transition(contract, next),
        child: Text(label),
      ));
    }
    switch (status) {
      case 'draft':
        add('legal_review', 'إرسال للمراجعة القانونية');
        break;
      case 'legal_review':
        add('pending_owner_approval', 'اعتماد المراجعة');
        break;
      case 'pending_owner_approval':
        add('ready_to_send', 'اعتماد النسخة للإرسال');
        break;
      case 'ready_to_send':
        add('awaiting_counterparty_signature', 'إتاحة العقد للطرف للتوقيع داخل Mawdda');
        break;
      case 'awaiting_company_signature':
        actions.add(FilledButton(
          onPressed: _busy ? null : () => _signForCompany(contract),
          child: const Text('توقيع الشركة'),
        ));
        break;
      case 'signed':
        add('effective', 'اعتماد النفاذ');
        break;
      case 'effective':
        add('suspended', 'تعليق العقد');
        add('terminated', 'إنهاء العقد');
        break;
      case 'suspended':
        add('effective', 'إعادة النفاذ');
        add('terminated', 'إنهاء العقد');
        break;
      case 'expired':
        add('renewal_or_amendment', 'بدء التجديد أو التعديل');
        break;
      default:
        break;
    }
    if (!['cancelled', 'terminated', 'expired', 'renewal_or_amendment'].contains(status) &&
        status != 'effective' && status != 'suspended') {
      add('cancelled', 'إلغاء المسودة/الإجراء');
    }
    return actions;
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: const Text('مركز العقود والاتفاقيات'),
          actions: [
            IconButton(
              tooltip: 'تحديث',
              onPressed: _loading || _busy ? null : _load,
              icon: const Icon(Icons.refresh),
            ),
          ],
        ),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: _busy ? null : _createDraft,
          icon: const Icon(Icons.add),
          label: const Text('إنشاء عقد'),
        ),
        body: _loading
            ? const Center(child: CircularProgressIndicator())
            : RefreshIndicator(
                onRefresh: _load,
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
                  children: [
                    const Text(
                      'إدارة مركزية للعقود والإصدارات والتوقيعات. '
                      'لا يصبح العقد نافذاً قبل اكتمال التوقيعات واعتماد النفاذ.',
                    ),
                    if (_error != null) ...[
                      const SizedBox(height: 12),
                      Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                    ],
                    const SizedBox(height: 12),
                    if (_contracts.isEmpty)
                      const Card(
                        child: Padding(
                          padding: EdgeInsets.all(24),
                          child: Text('لا توجد عقود مسجلة حالياً.'),
                        ),
                      ),
                    for (final contract in _contracts) ...[
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                (contract['title'] as String?) ?? 'عقد دون عنوان',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              const SizedBox(height: 6),
                              Text('النوع: ${_types[contract['contractType']] ?? contract['contractType']}'),
                              Text('الطرف الآخر: ${contract['counterpartyName'] ?? '—'}'),
                              Text('الحالة: ${_statuses[contract['status']] ?? contract['status']}'),
                              Text('الإصدار: ${contract['version'] ?? '—'} • سجل: ${contract['recordVersion'] ?? '—'}'),
                              if (contract['commitmentMinor'] != null)
                                Text('القيمة بوحدات العملة الصغرى: ${contract['commitmentMinor']} ${contract['currency'] ?? ''}'),
                              const SizedBox(height: 6),
                              SelectableText(
                                'SHA-256: ${contract['contentHash'] ?? '—'}',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                              Align(
                                alignment: AlignmentDirectional.centerStart,
                                child: TextButton.icon(
                                  onPressed: () => _showBody(contract),
                                  icon: const Icon(Icons.description_outlined),
                                  label: const Text('عرض نص العقد'),
                                ),
                              ),
                              if (_actionsFor(contract).isNotEmpty)
                                Wrap(spacing: 8, runSpacing: 8, children: _actionsFor(contract)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
      );
}

class _CreateContractDialog extends StatefulWidget {
  const _CreateContractDialog();

  @override
  State<_CreateContractDialog> createState() => _CreateContractDialogState();
}

class _CreateContractDialogState extends State<_CreateContractDialog> {
  final _formKey = GlobalKey<FormState>();
  final _title = TextEditingController();
  final _uid = TextEditingController();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _body = TextEditingController();
  final _currency = TextEditingController(text: 'EUR');
  final _amount = TextEditingController(text: '0');
  final _country = TextEditingController();
  final _law = TextEditingController();
  final _forum = TextEditingController();
  final _companyName = TextEditingController();
  final _representative = TextEditingController();
  final _capacity = TextEditingController();
  final _registration = TextEditingController();
  String _type = 'creator_membership';

  @override
  void dispose() {
    for (final controller in [
      _title, _uid, _name, _email, _body, _currency, _amount, _country,
      _law, _forum, _companyName, _representative, _capacity, _registration,
    ]) {
      controller.dispose();
    }
    super.dispose();
  }

  String? _required(String? value) =>
      value == null || value.trim().isEmpty ? 'هذا الحقل مطلوب' : null;

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    final amount = int.tryParse(_amount.text.trim());
    if (amount == null || amount < 0) return;
    Navigator.pop(context, <String, dynamic>{
      'contractType': _type,
      'title': _title.text.trim(),
      'counterpartyUid': _uid.text.trim(),
      'counterpartyName': _name.text.trim(),
      'counterpartyEmail': _email.text.trim(),
      'body': _body.text.trim(),
      'currency': _currency.text.trim().toUpperCase(),
      'commitmentMinor': amount,
      'termsVersion': 1,
      'startsAtMs': null,
      'endsAtMs': null,
      'jurisdictionCountry': _country.text.trim().isEmpty ? null : _country.text.trim(),
      'governingLaw': _law.text.trim().isEmpty ? null : _law.text.trim(),
      'disputeForum': _forum.text.trim().isEmpty ? null : _forum.text.trim(),
      'companyLegalName': _companyName.text.trim().isEmpty ? null : _companyName.text.trim(),
      'companyRepresentativeName': _representative.text.trim().isEmpty ? null : _representative.text.trim(),
      'companyRepresentativeCapacity': _capacity.text.trim().isEmpty ? null : _capacity.text.trim(),
      'companyRegistrationReference': _registration.text.trim().isEmpty ? null : _registration.text.trim(),
      'parentContractId': null,
    });
  }

  @override
  Widget build(BuildContext context) => AlertDialog(
        title: const Text('إنشاء مسودة عقد'),
        content: SizedBox(
          width: 600,
          child: Form(
            key: _formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  DropdownButtonFormField<String>(
                    initialValue: _type,
                    decoration: const InputDecoration(labelText: 'نوع العقد'),
                    items: _OwnerContractCenterScreenState._types.entries
                        .map((entry) => DropdownMenuItem(value: entry.key, child: Text(entry.value)))
                        .toList(),
                    onChanged: (value) => setState(() => _type = value ?? _type),
                  ),
                  TextFormField(controller: _title, decoration: const InputDecoration(labelText: 'عنوان العقد'), validator: _required),
                  TextFormField(controller: _uid, decoration: const InputDecoration(labelText: 'UID للطرف الآخر'), validator: _required),
                  TextFormField(controller: _name, decoration: const InputDecoration(labelText: 'اسم الطرف الآخر'), validator: _required),
                  TextFormField(controller: _email, decoration: const InputDecoration(labelText: 'البريد الإلكتروني الموثق للطرف الآخر'), keyboardType: TextInputType.emailAddress, validator: _required),
                  TextFormField(controller: _body, decoration: const InputDecoration(labelText: 'النص الكامل للعقد'), minLines: 5, maxLines: 10, validator: (value) => (value?.trim().length ?? 0) < 100 ? 'يجب ألا يقل النص عن 100 حرف.' : null),
                  Row(children: [
                    Expanded(child: TextFormField(controller: _currency, decoration: const InputDecoration(labelText: 'العملة (3 أحرف)'), validator: _required)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextFormField(
                        controller: _amount,
                        decoration: const InputDecoration(labelText: 'القيمة بالوحدة الصغرى'),
                        keyboardType: TextInputType.number,
                        validator: (value) {
                          final amount = int.tryParse(value?.trim() ?? '');
                          return amount != null && amount >= 0
                              ? null : 'أدخل قيمة صحيحة غير سالبة.';
                        },
                      ),
                    ),
                  ]),
                  const Divider(height: 24),
                  const Align(alignment: AlignmentDirectional.centerStart, child: Text('بيانات قانونية — تظل المسودة غير قابلة للإرسال حتى اكتمالها')),
                  TextFormField(controller: _companyName, decoration: const InputDecoration(labelText: 'الاسم القانوني المثبت للشركة')),
                  TextFormField(controller: _registration, decoration: const InputDecoration(labelText: 'مرجع التسجيل القانوني للشركة')),
                  TextFormField(controller: _representative, decoration: const InputDecoration(labelText: 'اسم ممثل الشركة المخول')),
                  TextFormField(controller: _capacity, decoration: const InputDecoration(labelText: 'صفة وسند تمثيل الشركة')),
                  TextFormField(controller: _country, decoration: const InputDecoration(labelText: 'دولة الاختصاص')),
                  TextFormField(controller: _law, decoration: const InputDecoration(labelText: 'القانون الواجب التطبيق')),
                  TextFormField(controller: _forum, decoration: const InputDecoration(labelText: 'المحكمة أو جهة فض النزاع')),
                ],
              ),
            ),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
          FilledButton(onPressed: _submit, child: const Text('حفظ المسودة')),
        ],
      );
}
