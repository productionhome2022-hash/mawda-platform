import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

class AdvertisingIntakeScreen extends StatefulWidget {
  const AdvertisingIntakeScreen({super.key, required this.kind});
  final String kind;

  @override
  State<AdvertisingIntakeScreen> createState() => _AdvertisingIntakeScreenState();
}

class _AdvertisingIntakeScreenState extends State<AdvertisingIntakeScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _organization = TextEditingController();
  final _phone = TextEditingController();
  final _category = TextEditingController();
  final _description = TextEditingController();
  final _experience = TextEditingController();
  final _portfolio = TextEditingController();
  final _duration = TextEditingController();
  final _budget = TextEditingController();
  final _currency = TextEditingController();
  final Set<String> _regions = {};
  bool _quoteRequested = true;
  bool _rightsConfirmed = false;
  bool _submitting = false;
  String? _error;
  String? _requestId;
  String? _idempotencyKey;

  static const _geographies = <String, String>{
    'all_arab_countries': 'جميع البلدان العربية',
    'syria': 'سوريا',
    'lebanon_palestine': 'لبنان وفلسطين',
    'iraq_jordan': 'العراق والأردن',
    'gcc': 'دول مجلس التعاون الخليجي',
    'egypt': 'مصر',
    'tunisia_libya_sudan': 'تونس وليبيا والسودان',
    'algeria_morocco': 'الجزائر والمغرب',
    'europe_turkey': 'أوروبا وتركيا',
    'asia_middle_east': 'آسيا والشرق الأوسط',
  };

  bool get _representative => widget.kind == 'representative_application';
  String get _title => _representative ? 'طلب اعتماد مندوب إعلانات' : 'طلب إعلان مباشر';

  @override
  void dispose() {
    for (final controller in [
      _name, _organization, _phone, _category, _description,
      _experience, _portfolio, _duration, _budget, _currency,
    ]) {
      controller.dispose();
    }
    super.dispose();
  }

  void _invalidate() => _idempotencyKey = null;
  String? _required(String? value) =>
      value == null || value.trim().isEmpty ? 'هذا الحقل مطلوب.' : null;

  String? _budgetValidator(String? value) {
    if (_quoteRequested) return null;
    final raw = value?.trim() ?? '';
    final amount = double.tryParse(raw);
    return amount != null && amount > 0 && RegExp(r'^(?:0|[1-9]\d{0,11})(?:\.\d{1,4})?$').hasMatch(raw)
        ? null : 'أدخل ميزانية موجبة صحيحة.';
  }

  Future<void> _submit() async {
    if (_submitting || !_formKey.currentState!.validate()) return;
    if (_regions.isEmpty) {
      setState(() => _error = 'اختر منطقة جغرافية واحدة على الأقل.');
      return;
    }
    if (!_rightsConfirmed) {
      setState(() => _error = 'يجب تأكيد صحة البيانات والحقوق اللازمة.');
      return;
    }
    setState(() { _submitting = true; _error = null; });
    _idempotencyKey ??= const Uuid().v4().replaceAll('-', '');
    try {
      final response = await FirebaseFunctions.instance
          .httpsCallable('submitAdvertisingIntake')
          .call({
        'kind': widget.kind,
        'displayName': _name.text.trim(),
        'organizationName': _organization.text.trim().isEmpty ? null : _organization.text.trim(),
        'contactPhone': _phone.text.trim().isEmpty ? null : _phone.text.trim(),
        'category': _category.text.trim(),
        'description': _description.text.trim(),
        'experience': _representative ? _experience.text.trim() : null,
        'portfolioUrl': _portfolio.text.trim().isEmpty ? null : _portfolio.text.trim(),
        'targetGeographies': _regions.toList()..sort(),
        'proposedDuration': _duration.text.trim(),
        'quoteRequested': _quoteRequested,
        'proposedBudgetAmount': _quoteRequested ? null : _budget.text.trim(),
        'currency': _quoteRequested ? null : _currency.text.trim().toUpperCase(),
        'rightsConfirmed': _rightsConfirmed,
        'idempotencyKey': _idempotencyKey,
      });
      final data = Map<String, dynamic>.from(response.data as Map);
      if (!mounted) return;
      setState(() => _requestId = data['requestId'] as String?);
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر إرسال الطلب.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر إرسال الطلب. تحقق من الاتصال وحاول مجدداً.');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_requestId != null) {
      return Scaffold(
        appBar: AppBar(title: Text(_title)),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              const Icon(Icons.check_circle_outline, size: 56),
              const SizedBox(height: 12),
              const Text('استلمت الإدارة طلبك للمراجعة. هذا الاستلام لا يعني اعتماداً أو عقداً أو حجزاً أو نشراً.'),
              const SizedBox(height: 12),
              SelectableText('رقم الطلب: $_requestId'),
            ]),
          ),
        ),
      );
    }
    return Scaffold(
      appBar: AppBar(title: Text(_title)),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(_representative
                ? 'قدّم بياناتك وخبرتك وملف أعمالك. لا يصبح اعتماد المندوب نافذاً إلا بعد مراجعة الإدارة وتوقيع الاتفاقية.'
                : 'قدّم طلب الحملة ومواصفاتها. لا ينشأ حجز أو نشر أو استحقاق مالي قبل العقد والاعتماد واستكمال شروط التسوية.'),
            const SizedBox(height: 16),
            TextFormField(controller: _name, decoration: const InputDecoration(labelText: 'الاسم الكامل أو الاسم المهني'), validator: _required, onChanged: (_) => _invalidate()),
            TextFormField(controller: _organization, decoration: const InputDecoration(labelText: 'اسم الشركة أو الجهة (اختياري)'), onChanged: (_) => _invalidate()),
            TextFormField(controller: _phone, decoration: const InputDecoration(labelText: 'رقم التواصل (اختياري حالياً)'), keyboardType: TextInputType.phone, onChanged: (_) => _invalidate()),
            TextFormField(controller: _category, decoration: InputDecoration(labelText: _representative ? 'مجالات العمل الإعلاني' : 'تصنيف الإعلان أو النشاط'), validator: _required, onChanged: (_) => _invalidate()),
            TextFormField(controller: _description, minLines: 4, maxLines: 8, decoration: const InputDecoration(labelText: 'الوصف والتفاصيل'), validator: (v) => (v?.trim().length ?? 0) >= 30 ? null : 'اكتب وصفاً لا يقل عن 30 حرفاً.', onChanged: (_) => _invalidate()),
            if (_representative) ...[
              TextFormField(controller: _experience, minLines: 3, maxLines: 6, decoration: const InputDecoration(labelText: 'الخبرة وسجل العمل'), validator: _required, onChanged: (_) => _invalidate()),
              TextFormField(controller: _portfolio, decoration: const InputDecoration(labelText: 'رابط ملف الأعمال العام HTTPS'), validator: _required, keyboardType: TextInputType.url, onChanged: (_) => _invalidate()),
            ] else
              TextFormField(controller: _portfolio, decoration: const InputDecoration(labelText: 'رابط مادة الإعلان أو موقع الجهة (اختياري)'), keyboardType: TextInputType.url, onChanged: (_) => _invalidate()),
            TextFormField(controller: _duration, decoration: const InputDecoration(labelText: 'المدة المقترحة'), validator: _required, onChanged: (_) => _invalidate()),
            const SizedBox(height: 12),
            Text('النطاق الجغرافي المستهدف', style: Theme.of(context).textTheme.titleMedium),
            for (final entry in _geographies.entries)
              CheckboxListTile(
                contentPadding: EdgeInsets.zero,
                value: _regions.contains(entry.key),
                title: Text(entry.value),
                onChanged: (value) => setState(() { _invalidate(); value == true ? _regions.add(entry.key) : _regions.remove(entry.key); }),
              ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              value: _quoteRequested,
              title: const Text('أطلب عرض سعر من الإدارة'),
              onChanged: (value) => setState(() { _invalidate(); _quoteRequested = value; }),
            ),
            if (!_quoteRequested) ...[
              TextFormField(controller: _budget, decoration: const InputDecoration(labelText: 'الميزانية المقترحة'), keyboardType: const TextInputType.numberWithOptions(decimal: true), validator: _budgetValidator, onChanged: (_) => _invalidate()),
              TextFormField(controller: _currency, decoration: const InputDecoration(labelText: 'رمز العملة (3 أحرف)'), textCapitalization: TextCapitalization.characters, validator: (v) => RegExp(r'^[A-Za-z]{3}$').hasMatch(v?.trim() ?? '') ? null : 'أدخل رمز عملة من 3 أحرف.', onChanged: (_) => _invalidate()),
            ],
            CheckboxListTile(
              contentPadding: EdgeInsets.zero,
              value: _rightsConfirmed,
              title: const Text('أؤكد صحة البيانات وامتلاكي الحقوق أو الأذونات اللازمة للمواد المقدمة.'),
              onChanged: (value) => setState(() => _rightsConfirmed = value == true),
            ),
            if (_error != null) Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: _submitting ? null : _submit,
              icon: _submitting ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.send),
              label: Text(_submitting ? 'جارٍ الإرسال...' : 'إرسال الطلب للمراجعة'),
            ),
          ],
        ),
      ),
    );
  }
}
