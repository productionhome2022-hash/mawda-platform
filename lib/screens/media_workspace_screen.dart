import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

class MediaWorkspaceScreen extends StatelessWidget {
  const MediaWorkspaceScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Media Workspace')),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text(
              'مساحة مستقلة لطلبات التعاون والتواصل الإعلاني مع إدارة Mawdda.',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            _WorkspaceEntry(
              icon: Icons.handshake_outlined,
              title: 'طلبات التعاون والانضمام إلى فريق Mawdda',
              subtitle: 'قيد الاستكمال الهندسي',
            ),
            _WorkspaceEntry(
              icon: Icons.support_agent_outlined,
              title: 'مراسلة المشرفين العامين',
              subtitle: 'ستظهر أسماء المشرفين الفعليين النشطين بعد ربط سجل التكليفات والصلاحيات',
            ),
            _WorkspaceEntry(
              icon: Icons.admin_panel_settings_outlined,
              title: 'مراسلة الإدارة العامة',
              subtitle: 'قيد الاستكمال الهندسي',
            ),
            _WorkspaceEntry(
              icon: Icons.campaign_outlined,
              title: 'الإعلان المباشر',
              subtitle: 'قيد الاستكمال الهندسي',
            ),
            Card(
              child: ListTile(
                leading: const Icon(Icons.video_library_outlined),
                title: const Text('عرض محتوى المؤثرين وصنّاع المحتوى'),
                subtitle: const Text('تقديم قناة أو محتوى أو مقترح تعاون إلى الإدارة العامة'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const CreatorProposalScreen(),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'المسارات غير المفعّلة لا تستقبل طلبات حالياً. لا تُعرض أسماء أو صلاحيات افتراضية.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white70),
            ),
          ],
        ),
      );
}

class _WorkspaceEntry extends StatelessWidget {
  const _WorkspaceEntry({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) => Card(
        child: ListTile(
          leading: Icon(icon),
          title: Text(title),
          subtitle: Text(subtitle),
          enabled: false,
        ),
      );
}

class CreatorProposalScreen extends StatefulWidget {
  const CreatorProposalScreen({super.key});

  @override
  State<CreatorProposalScreen> createState() => _CreatorProposalScreenState();
}

class _CreatorProposalScreenState extends State<CreatorProposalScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _category = TextEditingController();
  final _platform = TextEditingController();
  final _url = TextEditingController();
  final _title = TextEditingController();
  final _description = TextEditingController();
  final _audience = TextEditingController();
  final _duration = TextEditingController();
  final _budget = TextEditingController();
  final _currency = TextEditingController();
  final Set<String> _geographies = <String>{};
  String _sourceType = 'external_url';
  bool _quoteRequested = true;
  bool _rightsConfirmed = false;
  bool _submitting = false;
  bool _submitted = false;
  String? _error;
  String? _requestId;
  String? _idempotencyKey;

  static const _geographyOptions = <String, String>{
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

  @override
  void dispose() {
    _name.dispose();
    _category.dispose();
    _platform.dispose();
    _url.dispose();
    _title.dispose();
    _description.dispose();
    _audience.dispose();
    _duration.dispose();
    _budget.dispose();
    _currency.dispose();
    super.dispose();
  }

  String? _required(String? value) =>
      value == null || value.trim().isEmpty ? 'هذا الحقل مطلوب' : null;

  Future<void> _submit() async {
    if (_submitted || _submitting) return;
    if (!_formKey.currentState!.validate()) return;
    if (_geographies.isEmpty) {
      setState(() => _error = 'اختر نطاقاً جغرافياً واحداً على الأقل.');
      return;
    }
    if (!_rightsConfirmed) {
      setState(() => _error = 'يجب تأكيد امتلاك الحقوق أو الأذونات اللازمة.');
      return;
    }
    final budgetAmount = _quoteRequested ? null : _budget.text.trim();
    if (!_quoteRequested && (budgetAmount == null || !RegExp(r'^(?:0|[1-9]\\d{0,11})(?:\\.\\d{1,4})?
      setState(() => _error = 'أدخل ميزانية صحيحة ورمز عملة من ثلاثة أحرف كبيرة.');
      return;
    }

    setState(() {
      _submitting = true;
      _error = null;
    });
    _idempotencyKey ??= const Uuid().v4().replaceAll('-', '');
    try {
      final callable = FirebaseFunctions.instance.httpsCallable('submitCreatorProposal');
      final result = await callable.call({
        'creatorDisplayName': _name.text.trim(),
        'creatorCategory': _category.text.trim(),
        'platformName': _sourceType == 'external_url' ? _platform.text.trim() : null,
        'sourceType': _sourceType,
        'contentUrl': _sourceType == 'external_url' ? _url.text.trim() : null,
        'proposalTitle': _title.text.trim(),
        'proposalDescription': _description.text.trim(),
        'audienceDescription': _audience.text.trim().isEmpty ? null : _audience.text.trim(),
        'proposedDuration': _duration.text.trim(),
        'targetGeographies': _geographies.toList()..sort(),
        'quoteRequested': _quoteRequested,
        'proposedBudgetAmount': budgetAmount,
        'currency': _quoteRequested ? null : _currency.text.trim(),
        'rightsConfirmed': _rightsConfirmed,
        'idempotencyKey': _idempotencyKey,
      });
      final data = Map<String, dynamic>.from(result.data as Map);
      if (!mounted) return;
      setState(() {
        _requestId = data['requestId'] as String?;
        _submitted = true;
      });
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر إرسال الطلب. حاول مجدداً.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر إرسال الطلب بسبب مشكلة اتصال. حاول مجدداً.');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_submitted) {
      return Scaffold(
        appBar: AppBar(title: const Text('طلب عرض محتوى')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.check_circle_outline, size: 56),
                const SizedBox(height: 12),
                const Text('تم استلام طلبك وإرساله للمراجعة الإدارية.'),
                const SizedBox(height: 8),
                SelectableText('رقم الطلب: ${_requestId ?? "—"}'),
                const SizedBox(height: 12),
                const Text('هذا الاستلام لا يعني الموافقة أو الحجز أو النشر.'),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('عرض محتوى المؤثرين وصنّاع المحتوى')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text('قدّم قناتك أو محتواك أو مقترح تعاونك إلى الإدارة العامة.'),
            const SizedBox(height: 16),
            TextFormField(controller: _name, decoration: const InputDecoration(labelText: 'الاسم المهني أو اسم العرض'), validator: _required),
            TextFormField(controller: _category, decoration: const InputDecoration(labelText: 'صفة مقدم الطلب / نوع صانع المحتوى'), validator: _required),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _sourceType,
              decoration: const InputDecoration(labelText: 'طريقة تقديم المحتوى'),
              items: const [
                DropdownMenuItem(value: 'external_url', child: Text('رابط قناة أو منشور عام')),
                DropdownMenuItem(value: 'written_proposal', child: Text('مقترح مكتوب')),
              ],
              onChanged: (value) => setState(() { _idempotencyKey = null; _sourceType = value ?? 'external_url'; }),
            ),
            if (_sourceType == 'external_url') ...[
              TextFormField(controller: _platform, decoration: const InputDecoration(labelText: 'اسم المنصة (مثل YouTube أو Instagram)'), validator: _required),
              TextFormField(controller: _url, decoration: const InputDecoration(labelText: 'الرابط العام HTTPS'), keyboardType: TextInputType.url, validator: _required),
            ],
            TextFormField(controller: _title, decoration: const InputDecoration(labelText: 'عنوان المقترح'), validator: _required),
            TextFormField(controller: _description, decoration: const InputDecoration(labelText: 'وصف المحتوى أو التعاون'), minLines: 3, maxLines: 6, validator: _required),
            TextFormField(controller: _audience, decoration: const InputDecoration(labelText: 'وصف الجمهور ونوع المحتوى (اختياري)'), minLines: 2, maxLines: 4),
            TextFormField(controller: _duration, decoration: const InputDecoration(labelText: 'المدة المقترحة'), validator: _required),
            const SizedBox(height: 12),
            const Text('النطاق الجغرافي المستهدف'),
            Wrap(
              spacing: 8,
              children: _geographyOptions.entries.map((entry) => FilterChip(
                label: Text(entry.value),
                selected: _geographies.contains(entry.key),
                onSelected: (selected) => setState(() {
                  _idempotencyKey = null;
                  if (selected) {
                    _geographies.add(entry.key);
                  } else {
                    _geographies.remove(entry.key);
                  }
                }),
              )).toList(),
            ),
            const SizedBox(height: 12),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('أطلب عرض سعر من الإدارة'),
              value: _quoteRequested,
              onChanged: (value) => setState(() { _idempotencyKey = null; _quoteRequested = value; }),
            ),
            if (!_quoteRequested) ...[
              TextFormField(controller: _budget, decoration: const InputDecoration(labelText: 'الميزانية المقترحة (اكتب المبلغ كما هو)'), keyboardType: const TextInputType.numberWithOptions(decimal: true)),
              TextFormField(controller: _currency, decoration: const InputDecoration(labelText: 'رمز العملة (3 أحرف كبيرة)'), textCapitalization: TextCapitalization.characters),
            ],
            CheckboxListTile(
              contentPadding: EdgeInsets.zero,
              value: _rightsConfirmed,
              onChanged: (value) => setState(() { _idempotencyKey = null; _rightsConfirmed = value == true; }),
              title: const Text('أؤكد أن لدي الحقوق أو الأذونات اللازمة لتقديم هذا المحتوى وطلب استخدامه المقترح.'),
              controlAffinity: ListTileControlAffinity.leading,
            ),
            const Text('لن يؤدي تقديم الطلب إلى إنشاء حملة أو حجز مساحة أو نشر المحتوى تلقائياً.'),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ],
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: _submitting ? null : _submit,
              icon: _submitting ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.send_outlined),
              label: Text(_submitting ? 'جارٍ الإرسال...' : 'إرسال المقترح للمراجعة'),
            ),
          ],
        ),
      ),
    );
  }
}
).hasMatch(budgetAmount) || double.tryParse(budgetAmount) == null || double.parse(budgetAmount) <= 0 || !RegExp(r'^[A-Z]{3}
      setState(() => _error = 'أدخل ميزانية صحيحة ورمز عملة من ثلاثة أحرف كبيرة.');
      return;
    }

    setState(() {
      _submitting = true;
      _error = null;
    });
    _idempotencyKey ??= const Uuid().v4().replaceAll('-', '');
    try {
      final callable = FirebaseFunctions.instance.httpsCallable('submitCreatorProposal');
      final result = await callable.call({
        'creatorDisplayName': _name.text.trim(),
        'creatorCategory': _category.text.trim(),
        'platformName': _sourceType == 'external_url' ? _platform.text.trim() : null,
        'sourceType': _sourceType,
        'contentUrl': _sourceType == 'external_url' ? _url.text.trim() : null,
        'proposalTitle': _title.text.trim(),
        'proposalDescription': _description.text.trim(),
        'audienceDescription': _audience.text.trim().isEmpty ? null : _audience.text.trim(),
        'proposedDuration': _duration.text.trim(),
        'targetGeographies': _geographies.toList()..sort(),
        'quoteRequested': _quoteRequested,
        'proposedBudgetMinor': budgetMinor,
        'currency': _quoteRequested ? null : _currency.text.trim(),
        'rightsConfirmed': _rightsConfirmed,
        'idempotencyKey': _idempotencyKey,
      });
      final data = Map<String, dynamic>.from(result.data as Map);
      if (!mounted) return;
      setState(() {
        _requestId = data['requestId'] as String?;
        _submitted = true;
      });
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر إرسال الطلب. حاول مجدداً.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر إرسال الطلب بسبب مشكلة اتصال. حاول مجدداً.');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_submitted) {
      return Scaffold(
        appBar: AppBar(title: const Text('طلب عرض محتوى')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.check_circle_outline, size: 56),
                const SizedBox(height: 12),
                const Text('تم استلام طلبك وإرساله للمراجعة الإدارية.'),
                const SizedBox(height: 8),
                SelectableText('رقم الطلب: ${_requestId ?? "—"}'),
                const SizedBox(height: 12),
                const Text('هذا الاستلام لا يعني الموافقة أو الحجز أو النشر.'),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('عرض محتوى المؤثرين وصنّاع المحتوى')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text('قدّم قناتك أو محتواك أو مقترح تعاونك إلى الإدارة العامة.'),
            const SizedBox(height: 16),
            TextFormField(controller: _name, decoration: const InputDecoration(labelText: 'الاسم المهني أو اسم العرض'), validator: _required),
            TextFormField(controller: _category, decoration: const InputDecoration(labelText: 'صفة مقدم الطلب / نوع صانع المحتوى'), validator: _required),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _sourceType,
              decoration: const InputDecoration(labelText: 'طريقة تقديم المحتوى'),
              items: const [
                DropdownMenuItem(value: 'external_url', child: Text('رابط قناة أو منشور عام')),
                DropdownMenuItem(value: 'written_proposal', child: Text('مقترح مكتوب')),
              ],
              onChanged: (value) => setState(() => _sourceType = value ?? 'external_url'),
            ),
            if (_sourceType == 'external_url') ...[
              TextFormField(controller: _platform, decoration: const InputDecoration(labelText: 'اسم المنصة (مثل YouTube أو Instagram)'), validator: _required),
              TextFormField(controller: _url, decoration: const InputDecoration(labelText: 'الرابط العام HTTPS'), keyboardType: TextInputType.url, validator: _required),
            ],
            TextFormField(controller: _title, decoration: const InputDecoration(labelText: 'عنوان المقترح'), validator: _required),
            TextFormField(controller: _description, decoration: const InputDecoration(labelText: 'وصف المحتوى أو التعاون'), minLines: 3, maxLines: 6, validator: _required),
            TextFormField(controller: _audience, decoration: const InputDecoration(labelText: 'وصف الجمهور ونوع المحتوى (اختياري)'), minLines: 2, maxLines: 4),
            TextFormField(controller: _duration, decoration: const InputDecoration(labelText: 'المدة المقترحة'), validator: _required),
            const SizedBox(height: 12),
            const Text('النطاق الجغرافي المستهدف'),
            Wrap(
              spacing: 8,
              children: _geographyOptions.entries.map((entry) => FilterChip(
                label: Text(entry.value),
                selected: _geographies.contains(entry.key),
                onSelected: (selected) => setState(() {
                  if (selected) {
                    _geographies.add(entry.key);
                  } else {
                    _geographies.remove(entry.key);
                  }
                }),
              )).toList(),
            ),
            const SizedBox(height: 12),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('أطلب عرض سعر من الإدارة'),
              value: _quoteRequested,
              onChanged: (value) => setState(() => _quoteRequested = value),
            ),
            if (!_quoteRequested) ...[
              TextFormField(controller: _budget, decoration: const InputDecoration(labelText: 'الميزانية المقترحة'), keyboardType: const TextInputType.numberWithOptions(decimal: true)),
              TextFormField(controller: _currency, decoration: const InputDecoration(labelText: 'رمز العملة (3 أحرف كبيرة)'), textCapitalization: TextCapitalization.characters),
            ],
            CheckboxListTile(
              contentPadding: EdgeInsets.zero,
              value: _rightsConfirmed,
              onChanged: (value) => setState(() => _rightsConfirmed = value == true),
              title: const Text('أؤكد أن لدي الحقوق أو الأذونات اللازمة لتقديم هذا المحتوى وطلب استخدامه المقترح.'),
              controlAffinity: ListTileControlAffinity.leading,
            ),
            const Text('لن يؤدي تقديم الطلب إلى إنشاء حملة أو حجز مساحة أو نشر المحتوى تلقائياً.'),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ],
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: _submitting ? null : _submit,
              icon: _submitting ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.send_outlined),
              label: Text(_submitting ? 'جارٍ الإرسال...' : 'إرسال المقترح للمراجعة'),
            ),
          ],
        ),
      ),
    );
  }
}
).hasMatch(_currency.text.trim()))) {
      setState(() => _error = 'أدخل ميزانية صحيحة ورمز عملة من ثلاثة أحرف كبيرة.');
      return;
    }

    setState(() {
      _submitting = true;
      _error = null;
    });
    _idempotencyKey ??= const Uuid().v4().replaceAll('-', '');
    try {
      final callable = FirebaseFunctions.instance.httpsCallable('submitCreatorProposal');
      final result = await callable.call({
        'creatorDisplayName': _name.text.trim(),
        'creatorCategory': _category.text.trim(),
        'platformName': _sourceType == 'external_url' ? _platform.text.trim() : null,
        'sourceType': _sourceType,
        'contentUrl': _sourceType == 'external_url' ? _url.text.trim() : null,
        'proposalTitle': _title.text.trim(),
        'proposalDescription': _description.text.trim(),
        'audienceDescription': _audience.text.trim().isEmpty ? null : _audience.text.trim(),
        'proposedDuration': _duration.text.trim(),
        'targetGeographies': _geographies.toList()..sort(),
        'quoteRequested': _quoteRequested,
        'proposedBudgetMinor': budgetMinor,
        'currency': _quoteRequested ? null : _currency.text.trim(),
        'rightsConfirmed': _rightsConfirmed,
        'idempotencyKey': _idempotencyKey,
      });
      final data = Map<String, dynamic>.from(result.data as Map);
      if (!mounted) return;
      setState(() {
        _requestId = data['requestId'] as String?;
        _submitted = true;
      });
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر إرسال الطلب. حاول مجدداً.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر إرسال الطلب بسبب مشكلة اتصال. حاول مجدداً.');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_submitted) {
      return Scaffold(
        appBar: AppBar(title: const Text('طلب عرض محتوى')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.check_circle_outline, size: 56),
                const SizedBox(height: 12),
                const Text('تم استلام طلبك وإرساله للمراجعة الإدارية.'),
                const SizedBox(height: 8),
                SelectableText('رقم الطلب: ${_requestId ?? "—"}'),
                const SizedBox(height: 12),
                const Text('هذا الاستلام لا يعني الموافقة أو الحجز أو النشر.'),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('عرض محتوى المؤثرين وصنّاع المحتوى')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text('قدّم قناتك أو محتواك أو مقترح تعاونك إلى الإدارة العامة.'),
            const SizedBox(height: 16),
            TextFormField(controller: _name, decoration: const InputDecoration(labelText: 'الاسم المهني أو اسم العرض'), validator: _required),
            TextFormField(controller: _category, decoration: const InputDecoration(labelText: 'صفة مقدم الطلب / نوع صانع المحتوى'), validator: _required),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _sourceType,
              decoration: const InputDecoration(labelText: 'طريقة تقديم المحتوى'),
              items: const [
                DropdownMenuItem(value: 'external_url', child: Text('رابط قناة أو منشور عام')),
                DropdownMenuItem(value: 'written_proposal', child: Text('مقترح مكتوب')),
              ],
              onChanged: (value) => setState(() => _sourceType = value ?? 'external_url'),
            ),
            if (_sourceType == 'external_url') ...[
              TextFormField(controller: _platform, decoration: const InputDecoration(labelText: 'اسم المنصة (مثل YouTube أو Instagram)'), validator: _required),
              TextFormField(controller: _url, decoration: const InputDecoration(labelText: 'الرابط العام HTTPS'), keyboardType: TextInputType.url, validator: _required),
            ],
            TextFormField(controller: _title, decoration: const InputDecoration(labelText: 'عنوان المقترح'), validator: _required),
            TextFormField(controller: _description, decoration: const InputDecoration(labelText: 'وصف المحتوى أو التعاون'), minLines: 3, maxLines: 6, validator: _required),
            TextFormField(controller: _audience, decoration: const InputDecoration(labelText: 'وصف الجمهور ونوع المحتوى (اختياري)'), minLines: 2, maxLines: 4),
            TextFormField(controller: _duration, decoration: const InputDecoration(labelText: 'المدة المقترحة'), validator: _required),
            const SizedBox(height: 12),
            const Text('النطاق الجغرافي المستهدف'),
            Wrap(
              spacing: 8,
              children: _geographyOptions.entries.map((entry) => FilterChip(
                label: Text(entry.value),
                selected: _geographies.contains(entry.key),
                onSelected: (selected) => setState(() {
                  if (selected) {
                    _geographies.add(entry.key);
                  } else {
                    _geographies.remove(entry.key);
                  }
                }),
              )).toList(),
            ),
            const SizedBox(height: 12),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('أطلب عرض سعر من الإدارة'),
              value: _quoteRequested,
              onChanged: (value) => setState(() => _quoteRequested = value),
            ),
            if (!_quoteRequested) ...[
              TextFormField(controller: _budget, decoration: const InputDecoration(labelText: 'الميزانية المقترحة'), keyboardType: const TextInputType.numberWithOptions(decimal: true)),
              TextFormField(controller: _currency, decoration: const InputDecoration(labelText: 'رمز العملة (3 أحرف كبيرة)'), textCapitalization: TextCapitalization.characters),
            ],
            CheckboxListTile(
              contentPadding: EdgeInsets.zero,
              value: _rightsConfirmed,
              onChanged: (value) => setState(() => _rightsConfirmed = value == true),
              title: const Text('أؤكد أن لدي الحقوق أو الأذونات اللازمة لتقديم هذا المحتوى وطلب استخدامه المقترح.'),
              controlAffinity: ListTileControlAffinity.leading,
            ),
            const Text('لن يؤدي تقديم الطلب إلى إنشاء حملة أو حجز مساحة أو نشر المحتوى تلقائياً.'),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ],
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: _submitting ? null : _submit,
              icon: _submitting ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.send_outlined),
              label: Text(_submitting ? 'جارٍ الإرسال...' : 'إرسال المقترح للمراجعة'),
            ),
          ],
        ),
      ),
    );
  }
}
