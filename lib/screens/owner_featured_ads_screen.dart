import 'dart:math';

import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

const _regions = <String, String>{
  'all_arab_countries': 'جميع الإعلانات العربية',
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

class OwnerFeaturedAdsScreen extends StatefulWidget {
  const OwnerFeaturedAdsScreen({super.key});

  @override
  State<OwnerFeaturedAdsScreen> createState() => _OwnerFeaturedAdsScreenState();
}

class _OwnerFeaturedAdsScreenState extends State<OwnerFeaturedAdsScreen> {
  final _functions = FirebaseFunctions.instance;
  final _title = TextEditingController();
  final _sponsor = TextEditingController();
  final _body = TextEditingController();
  final _maxViews = TextEditingController(text: '10');
  final _budget = TextEditingController(text: '100');
  final _priority = TextEditingController(text: '0');
  final _rewardCoins = TextEditingController(text: '0');
  final _dailyViews = TextEditingController(text: '0');
  final _dailyCoins = TextEditingController(text: '0');
  final _imageMs = TextEditingController(text: '10000');
  final _videoPercent = TextEditingController(text: '90');
  bool _rewardEnabled = false;
  int _rewardPolicyVersion = 0;
  List<Map<String, dynamic>> _campaigns = const [];
  List<Map<String, dynamic>> _assets = const [];
  String _region = 'all_arab_countries';
  String _placement = 'rotation';
  String? _mediaId;
  String? _editingId;
  int? _editingVersion;
  DateTime _starts = DateTime.now();
  DateTime _ends = DateTime.now().add(const Duration(days: 7));
  bool _loading = true;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _title.dispose();
    _sponsor.dispose();
    _body.dispose();
    _maxViews.dispose();
    _budget.dispose();
    _priority.dispose();
    _rewardCoins.dispose();
    _dailyViews.dispose();
    _dailyCoins.dispose();
    _imageMs.dispose();
    _videoPercent.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() { _loading = true; _error = null; });
    try {
      final results = await Future.wait([
        _functions.httpsCallable('getOwnerFeaturedAdCampaigns').call(),
        _functions.httpsCallable('listOwnerMediaAssets').call({
          'status': 'security_approved', 'uploaderType': 'all', 'limit': 50,
        }),
        _functions.httpsCallable('getOwnerFeaturedAdRewardPolicy').call(),
      ]);
      final campaignData = Map<String, dynamic>.from(results[0].data as Map);
      final mediaData = Map<String, dynamic>.from(results[1].data as Map);
      final rewardData = Map<String, dynamic>.from(results[2].data as Map);
      final rewardPolicy = Map<String, dynamic>.from(rewardData['policy'] as Map);
      final campaigns = (campaignData['campaigns'] as List<dynamic>? ?? const [])
          .whereType<Map>().map((item) => Map<String, dynamic>.from(item)).toList();
      final assets = (mediaData['assets'] as List<dynamic>? ?? const [])
          .whereType<Map>().map((item) => Map<String, dynamic>.from(item))
          .where((item) => item['mediaPurpose'] == 'advertisement' &&
              item['mediaCategory'] == 'image')
          .toList(growable: false);
      if (!mounted) return;
      setState(() {
        _campaigns = campaigns;
        _assets = assets;
        _rewardPolicyVersion = (rewardData['version'] as num?)?.toInt() ?? 0;
        _rewardEnabled = rewardPolicy['enabled'] == true;
        _rewardCoins.text = (rewardPolicy['rewardCoinsPerView'] ?? 0).toString();
        _dailyViews.text = (rewardPolicy['maxRewardedViewsPerUtcDay'] ?? 0).toString();
        _dailyCoins.text = (rewardPolicy['maxRewardCoinsPerUtcDay'] ?? 0).toString();
        _imageMs.text = (rewardPolicy['imageContinuousVisibleMs'] ?? 10000).toString();
        _videoPercent.text = (rewardPolicy['videoCompletionPercent'] ?? 90).toString();
        if (_mediaId != null && !assets.any((item) => item['mediaId'] == _mediaId)) {
          _mediaId = null;
        }
      });
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحميل الحملات المميزة.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحميل بيانات الإعلانات المميزة.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<DateTime?> _pickDate(DateTime initial) async {
    final selected = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime.now().subtract(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 730)),
    );
    if (selected == null) return null;
    return DateTime(selected.year, selected.month, selected.day, 12);
  }

  Future<void> _saveRewardPolicy() async {
    final coins = int.tryParse(_rewardCoins.text.trim());
    final views = int.tryParse(_dailyViews.text.trim());
    final dailyCoins = int.tryParse(_dailyCoins.text.trim());
    final imageMs = int.tryParse(_imageMs.text.trim());
    final videoPercent = int.tryParse(_videoPercent.text.trim());
    if (coins == null || views == null || dailyCoins == null || imageMs == null ||
        videoPercent == null || coins < 0 || views < 0 || dailyCoins < 0 ||
        imageMs < 1000 || videoPercent < 1 || videoPercent > 100 ||
        (_rewardEnabled && (coins < 1 || views < 1 || dailyCoins < coins))) {
      setState(() => _error = 'قيم سياسة المكافآت غير صالحة؛ عند التفعيل يجب أن تغطي الميزانية اليومية مكافأة واحدة على الأقل.');
      return;
    }
    setState(() { _saving = true; _error = null; });
    try {
      final response = await _functions.httpsCallable('setOwnerFeaturedAdRewardPolicy').call({
        'expectedVersion': _rewardPolicyVersion,
        'policy': {
          'enabled': _rewardEnabled,
          'rewardCoinsPerView': coins,
          'maxRewardedViewsPerUtcDay': views,
          'maxRewardCoinsPerUtcDay': dailyCoins,
          'imageContinuousVisibleMs': imageMs,
          'videoCompletionPercent': videoPercent,
        },
      });
      final data = Map<String, dynamic>.from(response.data as Map);
      if (mounted) setState(() => _rewardPolicyVersion = (data['version'] as num?)?.toInt() ?? _rewardPolicyVersion);
      await _load();
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر حفظ سياسة المكافآت.');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _save() async {
    final maxViews = int.tryParse(_maxViews.text.trim());
    final budget = int.tryParse(_budget.text.trim());
    final priority = int.tryParse(_priority.text.trim());
    if (_title.text.trim().length < 3 || _sponsor.text.trim().length < 2 ||
        _body.text.trim().length < 10 || maxViews == null || maxViews < 1 ||
        budget == null || budget < 1 || priority == null || priority < 0 ||
        _mediaId == null || !_ends.isAfter(_starts)) {
      setState(() => _error = 'أكمل العنوان والراعي والوصف والمادة الآمنة والميزانية والحدود والتواريخ.');
      return;
    }
    setState(() { _saving = true; _error = null; });
    try {
      await _functions.httpsCallable('saveFeaturedAdCampaign').call({
        if (_editingId != null) 'campaignId': _editingId,
        if (_editingId != null) 'expectedVersion': _editingVersion,
        'title': _title.text.trim(),
        'sponsorLabel': _sponsor.text.trim(),
        'body': _body.text.trim(),
        'startsAtMs': _starts.millisecondsSinceEpoch,
        'endsAtMs': _ends.millisecondsSinceEpoch,
        'maxRewardedViewsPerMember': maxViews,
        'rewardBudgetCoins': budget,
        'featuredPlacement': _placement,
        'priorityOrder': priority,
        'geographicTargets': [_region],
        'mediaId': _mediaId,
      });
      _resetForm();
      await _load();
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر حفظ الحملة.');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _resetForm() {
    _title.clear();
    _sponsor.clear();
    _body.clear();
    _editingId = null;
    _editingVersion = null;
    _mediaId = null;
    _placement = 'rotation';
    _maxViews.text = '10';
    _budget.text = '100';
    _priority.text = '0';
  }

  void _edit(Map<String, dynamic> item) {
    if (!['draft', 'paused'].contains(item['status'])) return;
    setState(() {
      _editingId = item['campaignId'] as String?;
      _editingVersion = (item['version'] as num?)?.toInt();
      _title.text = item['title']?.toString() ?? '';
      _sponsor.text = item['sponsorLabel']?.toString() ?? '';
      _body.text = item['body']?.toString() ?? '';
      _maxViews.text = (item['maxRewardedViewsPerMember'] ?? 1).toString();
      _budget.text = (item['rewardBudgetCoins'] ?? 1).toString();
      _priority.text = (item['priorityOrder'] ?? 0).toString();
      _placement = item['featuredPlacement'] == 'priority' ? 'priority' : 'rotation';
      _region = (item['geographicTargets'] as List?)?.first?.toString() ?? 'all_arab_countries';
      _mediaId = item['mediaId'] as String?;
      if (item['startsAtMs'] is num) {
        _starts = DateTime.fromMillisecondsSinceEpoch((item['startsAtMs'] as num).toInt());
      }
      if (item['endsAtMs'] is num) {
        _ends = DateTime.fromMillisecondsSinceEpoch((item['endsAtMs'] as num).toInt());
      }
    });
  }

  Future<void> _changeStatus(Map<String, dynamic> item, String status) async {
    final version = (item['version'] as num?)?.toInt();
    if (version == null) return;
    setState(() { _saving = true; _error = null; });
    try {
      await _functions.httpsCallable('setFeaturedAdCampaignStatus').call({
        'campaignId': item['campaignId'], 'status': status, 'expectedVersion': version,
      });
      await _load();
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تغيير حالة الحملة.');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  String _idempotencyKey() {
    final random = Random.secure();
    final suffix = List.generate(24, (_) => random.nextInt(16).toRadixString(16)).join();
    return 'owner_finance_$suffix';
  }

  Future<void> _financialAction(Map<String, dynamic> campaign, String action) async {
    final amount = TextEditingController();
    final currency = TextEditingController(text: 'USD');
    final external = TextEditingController();
    final evidence = TextEditingController();
    final note = TextEditingController(text: 'مراجعة مالية من المالك');
    String outcome = 'approved';
    final isReview = action == 'review_completed';
    final isRefund = action == 'refund_recorded';
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(builder: (context, setDialogState) => AlertDialog(
        title: Text(switch (action) {
          'payment_received' => 'تأكيد قبض فعلي',
          'refund_recorded' => 'تسجيل استرداد منفذ',
          'settlement_reconciled' => 'تسجيل التسوية المحاسبية',
          _ => 'إكمال المراجعة المالية',
        }),
        content: SingleChildScrollView(child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (!isReview) TextField(controller: amount, keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'المبلغ بأصغر وحدة للعملة (minor units)')),
            if (!isReview) TextField(controller: currency, textCapitalization: TextCapitalization.characters,
              decoration: const InputDecoration(labelText: 'رمز العملة ISO 4217')),
            TextField(controller: external,
              decoration: InputDecoration(labelText: isReview ? 'مرجع المراجعة / القضية' : 'مرجع العملية الخارجية')),
            if (isRefund || action == 'payment_received') TextField(controller: evidence,
              decoration: const InputDecoration(labelText: 'مرجع الإثبات الآمن')),
            if (isReview) DropdownButtonFormField<String>(
              value: outcome,
              items: const [
                DropdownMenuItem(value: 'approved', child: Text('مراجعة مقبولة')),
                DropdownMenuItem(value: 'needs_attention', child: Text('تحتاج متابعة')),
              ],
              onChanged: (value) => setDialogState(() => outcome = value ?? 'approved'),
            ),
            TextField(controller: note, minLines: 2, maxLines: 4,
              decoration: const InputDecoration(labelText: 'ملاحظة المراجعة')),
            const SizedBox(height: 8),
            const Text('هذا الإجراء يسجل حدثاً مالياً موثقاً فقط؛ لا ينفذ تحويلاً أو استرداداً نقدياً داخل التطبيق.'),
          ],
        )),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('إلغاء')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('تسجيل')),
        ],
      )),
    );
    if (confirmed != true) {
      amount.dispose(); currency.dispose(); external.dispose(); evidence.dispose(); note.dispose();
      return;
    }
    setState(() { _saving = true; _error = null; });
    try {
      await _functions.httpsCallable('recordFeaturedAdFinancialEvent').call({
        'campaignId': campaign['campaignId'],
        'action': action,
        'idempotencyKey': _idempotencyKey(),
        'amountMinor': isReview ? null : int.tryParse(amount.text.trim()),
        'currency': isReview ? null : currency.text.trim().toUpperCase(),
        'externalReference': isReview ? null : external.text.trim(),
        'evidenceReference': evidence.text.trim().isEmpty ? null : evidence.text.trim(),
        'note': note.text.trim(),
        'reviewOutcome': isReview ? outcome : null,
      });
      await _load();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم تسجيل الحدث المالي في السجل التدقيقي.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تسجيل الحدث المالي.');
    } finally {
      amount.dispose(); currency.dispose(); external.dispose(); evidence.dispose(); note.dispose();
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _showLedger(Map<String, dynamic> campaign) async {
    try {
      final response = await _functions.httpsCallable('getOwnerFeaturedAdFinancialEvents').call({
        'campaignId': campaign['campaignId'],
      });
      final data = Map<String, dynamic>.from(response.data as Map);
      final events = (data['events'] as List<dynamic>? ?? const [])
          .whereType<Map>().map((item) => Map<String, dynamic>.from(item)).toList();
      if (!mounted) return;
      await showDialog<void>(context: context, builder: (context) => AlertDialog(
        title: const Text('السجل المالي والتدقيقي'),
        content: SizedBox(width: 520, child: events.isEmpty
            ? const Text('لا توجد أحداث مالية مسجلة.')
            : ListView(shrinkWrap: true, children: events.map((event) => ListTile(
                title: Text(event['action']?.toString() ?? 'حدث مالي'),
                subtitle: Text('${event['amountMinor'] ?? '—'} ${event['currency'] ?? ''}\nمرجع: ${event['externalReference'] ?? '—'}'),
                trailing: const Icon(Icons.verified_user_outlined),
              )).toList())),
        actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('إغلاق'))],
      ));
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحميل السجل المالي.');
    }
  }

  String _status(Object? value) => switch (value) {
    'draft' => 'مسودة',
    'approved' => 'معتمدة',
    'published' => 'منشورة',
    'paused' => 'متوقفة',
    'withdrawn' => 'مسحوبة',
    'archived' => 'مؤرشفة',
    _ => 'غير معروفة',
  };

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('الإعلانات المميزة • إدارة المالك'),
        actions: [IconButton(onPressed: _loading ? null : _load, icon: const Icon(Icons.refresh))],
      ),
      body: _loading ? const Center(child: CircularProgressIndicator()) : ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (_error != null) Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Text(_error!, style: TextStyle(color: theme.colorScheme.error)),
          ),
          Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('سياسة مكافآت الإعلانات • الإصدار $_rewardPolicyVersion',
                  style: theme.textTheme.titleLarge),
              const Text('القيم الافتراضية صفرية ومتوقفة. تفعيل السياسة قرار مالك ولا يفعّل دفعاً نقدياً. الفيديو يبقى محظور النشر حتى اكتمال مشغله واختبارات الأجهزة.'),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('تفعيل مكافآت المشاهدة'),
                value: _rewardEnabled,
                onChanged: _saving ? null : (value) => setState(() => _rewardEnabled = value),
              ),
              TextField(controller: _rewardCoins, enabled: !_saving, keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'كوين لكل مشاهدة مؤهلة')),
              TextField(controller: _dailyViews, enabled: !_saving, keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'الحد اليومي للمشاهدات لكل عضو')),
              TextField(controller: _dailyCoins, enabled: !_saving, keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'الحد اليومي للكوينز لكل عضو')),
              TextField(controller: _imageMs, enabled: !_saving, keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'مدة ظهور الصورة بالميلي ثانية')),
              TextField(controller: _videoPercent, enabled: !_saving, keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'نسبة إكمال الفيديو (موقوف حتى جاهزية المشغل)')),
              const SizedBox(height: 8),
              FilledButton.icon(onPressed: _saving ? null : _saveRewardPolicy,
                  icon: const Icon(Icons.save_outlined), label: const Text('حفظ سياسة المكافآت')),
            ],
          ))),
          const SizedBox(height: 12),
          Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(_editingId == null ? 'إنشاء حملة مميزة' : 'تعديل الحملة $_editingId',
                  style: theme.textTheme.titleLarge),
              const SizedBox(height: 8),
              const Text('لا تصبح الحملة قابلة للنشر إلا بعد اعتماد المالك وتأكيد القبض الفعلي واعتماد المادة وسياسة المكافآت. لا توجد بوابة دفع أو تحويل مالي آلي في هذا المسار.'),
              TextField(controller: _title, enabled: !_saving,
                  decoration: const InputDecoration(labelText: 'عنوان الحملة')),
              TextField(controller: _sponsor, enabled: !_saving,
                  decoration: const InputDecoration(labelText: 'المعلن / الراعي')),
              TextField(controller: _body, enabled: !_saving, minLines: 2, maxLines: 4,
                  decoration: const InputDecoration(labelText: 'وصف الإعلان')),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _mediaId,
                decoration: const InputDecoration(labelText: 'المادة المعتمدة أمنياً'),
                items: _assets.map((asset) => DropdownMenuItem<String>(
                  value: asset['mediaId'] as String?,
                  child: Text('${asset['originalName'] ?? asset['mediaId']}'),
                )).toList(),
                onChanged: _saving ? null : (value) => setState(() => _mediaId = value),
              ),
              DropdownButtonFormField<String>(
                value: _region,
                decoration: const InputDecoration(labelText: 'النطاق الجغرافي'),
                items: _regions.entries.map((entry) => DropdownMenuItem(
                  value: entry.key, child: Text(entry.value),
                )).toList(),
                onChanged: _saving ? null : (value) => setState(() => _region = value ?? _region),
              ),
              DropdownButtonFormField<String>(
                value: _placement,
                decoration: const InputDecoration(labelText: 'طريقة العرض'),
                items: const [
                  DropdownMenuItem(value: 'rotation', child: Text('تدوير عشوائي')),
                  DropdownMenuItem(value: 'priority', child: Text('أولوية يحددها المالك')),
                ],
                onChanged: _saving ? null : (value) => setState(() => _placement = value ?? 'rotation'),
              ),
              TextField(controller: _priority, enabled: !_saving, keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'ترتيب الأولوية (الأقل أولاً)')),
              TextField(controller: _maxViews, enabled: !_saving, keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'الحد لكل عضو في الحملة')),
              TextField(controller: _budget, enabled: !_saving, keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'ميزانية مكافآت الكوينز للحملة')),
              const SizedBox(height: 8),
              Wrap(spacing: 8, children: [
                OutlinedButton(onPressed: _saving ? null : () async {
                  final value = await _pickDate(_starts);
                  if (value != null) setState(() => _starts = value);
                }, child: Text('البداية: ${_starts.toLocal().toString().split(' ').first}')),
                OutlinedButton(onPressed: _saving ? null : () async {
                  final value = await _pickDate(_ends);
                  if (value != null) setState(() => _ends = value);
                }, child: Text('النهاية: ${_ends.toLocal().toString().split(' ').first}')),
              ]),
              const SizedBox(height: 12),
              FilledButton.icon(
                onPressed: _saving ? null : _save,
                icon: const Icon(Icons.save_outlined),
                label: Text(_editingId == null ? 'حفظ كمسودة' : 'حفظ التعديلات'),
              ),
            ],
          ))),
          const SizedBox(height: 12),
          Text('الحملات وسجلها المالي', style: theme.textTheme.titleLarge),
          ..._campaigns.map((item) => Card(child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(item['title']?.toString() ?? 'حملة مميزة',
                  style: theme.textTheme.titleMedium),
              Text('الحالة: ${_status(item['status'])} • الإصدار ${item['version']}'),
              Text('القبض: ${item['financialSnapshot']?['paymentStatus'] ?? 'unpaid'} • المراجعة: ${item['financialSnapshot']?['reviewStatus'] ?? 'not_reviewed'}'),
              Wrap(spacing: 6, runSpacing: 4, children: [
                if (['draft', 'paused'].contains(item['status']))
                  TextButton(onPressed: _saving ? null : () => _edit(item), child: const Text('تعديل')),
                if (item['status'] == 'draft' || item['status'] == 'paused')
                  TextButton(onPressed: _saving ? null : () => _changeStatus(item, 'approved'), child: const Text('اعتماد المالك')),
                if ((item['status'] == 'approved' || item['status'] == 'paused') &&
                    item['paymentConfirmed'] == true &&
                    item['financialSnapshot']?['reviewStatus'] == 'reconciled')
                  TextButton(onPressed: _saving ? null : () => _changeStatus(item, 'published'), child: const Text('نشر')),
                if (item['status'] == 'published')
                  TextButton(onPressed: _saving ? null : () => _changeStatus(item, 'paused'), child: const Text('إيقاف')),
                if (!['withdrawn', 'archived'].contains(item['status']))
                  TextButton(onPressed: _saving ? null : () => _changeStatus(item, 'withdrawn'), child: const Text('سحب')),
                TextButton(onPressed: _saving ? null : () => _financialAction(item, 'payment_received'), child: const Text('تأكيد القبض')),
                TextButton(onPressed: _saving ? null : () => _financialAction(item, 'refund_recorded'), child: const Text('تسجيل استرداد')),
                TextButton(onPressed: _saving ? null : () => _financialAction(item, 'settlement_reconciled'), child: const Text('تسوية')),
                TextButton(onPressed: _saving ? null : () => _financialAction(item, 'review_completed'), child: const Text('مراجعة مالية')),
                TextButton(onPressed: _saving ? null : () => _showLedger(item), child: const Text('السجل')),
              ]),
            ]),
          ))),
        ],
      ),
    );
  }
}
