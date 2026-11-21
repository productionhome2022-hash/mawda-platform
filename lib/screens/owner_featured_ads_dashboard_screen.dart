import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/member_media_upload_service.dart';

class OwnerFeaturedAdsDashboardScreen extends StatefulWidget {
  const OwnerFeaturedAdsDashboardScreen({super.key});
  @override
  State<OwnerFeaturedAdsDashboardScreen> createState() => _OwnerFeaturedAdsDashboardScreenState();
}

class _OwnerFeaturedAdsDashboardScreenState extends State<OwnerFeaturedAdsDashboardScreen> {
  final _functions = FirebaseFunctions.instance;
  final _mediaUpload = MemberMediaUploadService();
  final _picker = ImagePicker();
  final _policyReward = TextEditingController(text: '2');
  final _policyDailyViews = TextEditingController(text: '10');
  final _policyDailyCoins = TextEditingController(text: '20');
  final _policyCampaignCap = TextEditingController(text: '3');
  bool _uploadingMedia = false;
  bool _savingPolicy = false;
  bool _rewardEnabled = true;
  final _title = TextEditingController();
  final _sponsor = TextEditingController();
  final _body = TextEditingController();
  final _budget = TextEditingController(text: '20');
  final _reward = TextEditingController(text: '2');
  String _placement = 'rotation';
  String _geography = 'all_arab_countries';
  String? _mediaId;
  List<Map<String, dynamic>> _campaigns = const [];
  List<Map<String, dynamic>> _approvedMedia = const [];
  bool _loading = true;
  bool _saving = false;
  String? _editingId;
  String? _error;
  late DateTime _startsAt;
  late DateTime _endsAt;

  static const _geographies = <String, String>{
    'all_arab_countries': 'جميع الدول العربية',
    'syria': 'سوريا',
    'lebanon_palestine': 'لبنان وفلسطين',
    'iraq_jordan': 'العراق والأردن',
    'gcc': 'دول الخليج',
    'egypt': 'مصر',
    'tunisia_libya_sudan': 'تونس وليبيا والسودان',
    'algeria_morocco': 'الجزائر والمغرب',
    'europe_turkey': 'أوروبا وتركيا',
    'asia_middle_east': 'آسيا والشرق الأوسط',
  };

  @override
  void initState() {
    super.initState();
    _startsAt = DateTime.now();
    _endsAt = _startsAt.add(const Duration(days: 7));
    _load();
  }

  @override
  void dispose() {
    _title.dispose(); _sponsor.dispose(); _body.dispose();
    _budget.dispose(); _reward.dispose();
    _policyReward.dispose(); _policyDailyViews.dispose();
    _policyDailyCoins.dispose(); _policyCampaignCap.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final results = await Future.wait([
        _functions.httpsCallable('getOwnerFeaturedAdCampaigns').call(),
        _functions.httpsCallable('listOwnerMediaAssets').call({'status': 'security_approved', 'limit': 50}),
        _functions.httpsCallable('getOwnerFeaturedAdRewardPolicy').call(),
      ]);
      final data = Map<String, dynamic>.from(results[0].data as Map);
      final mediaData = Map<String, dynamic>.from(results[1].data as Map);
      final policyData = Map<String, dynamic>.from(results[2].data as Map);
      final policy = Map<String, dynamic>.from(policyData['policy'] as Map);
      final items = (data['campaigns'] as List<dynamic>? ?? const [])
          .whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      final media = (mediaData['assets'] as List<dynamic>? ?? const [])
          .whereType<Map>().map((e) => Map<String, dynamic>.from(e))
          .where((e) => e['mediaPurpose'] == 'advertisement' && e['status'] == 'security_approved')
          .toList();
      if (mounted) setState(() {
        _campaigns = items; _approvedMedia = media;
        _rewardEnabled = policy['enabled'] == true;
        _policyReward.text = (policy['rewardCoinsPerView'] ?? 2).toString();
        _policyDailyViews.text = (policy['maxRewardedViewsPerUtcDay'] ?? 10).toString();
        _policyDailyCoins.text = (policy['maxRewardCoinsPerUtcDay'] ?? 20).toString();
        _policyCampaignCap.text = (policy['maxRewardsPerCampaignRolling24h'] ?? 3).toString();
        _reward.text = (policy['rewardCoinsPerView'] ?? 2).toString();
      });
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _error = e.message ?? 'تعذر تحميل الحملات.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحميل الحملات.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _uploadCreative() async {
    try {
      final file = await _picker.pickMedia();
      if (file == null) return;
      setState(() { _uploadingMedia = true; _error = null; });
      final mediaId = await _mediaUpload.uploadAdvertisementCreative(file: file);
      if (!mounted) return;
      setState(() => _mediaId = mediaId);
      await _load();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('اكتمل الرفع والفحص الأمني للمادة الإعلانية.')),
      );
    } catch (error) {
      if (mounted) setState(() => _error = 'تعذر رفع المادة أو اعتماد مشتقها الآمن: $error');
    } finally {
      if (mounted) setState(() => _uploadingMedia = false);
    }
  }

  Future<void> _saveRewardPolicy() async {
    final reward = int.tryParse(_policyReward.text.trim());
    final views = int.tryParse(_policyDailyViews.text.trim());
    final coins = int.tryParse(_policyDailyCoins.text.trim());
    final campaignCap = int.tryParse(_policyCampaignCap.text.trim());
    if (reward == null || views == null || coins == null || campaignCap == null ||
        reward < 0 || views < 0 || coins < reward || campaignCap < 1 ||
        (_rewardEnabled && (reward < 1 || views < 1))) {
      setState(() => _error = 'قيم سياسة المكافآت غير صالحة؛ يجب أن يغطي الحد اليومي مكافأة مشاهدة واحدة على الأقل.');
      return;
    }
    setState(() { _savingPolicy = true; _error = null; });
    try {
      final current = await _functions.httpsCallable('getOwnerFeaturedAdRewardPolicy').call();
      final envelope = Map<String, dynamic>.from(current.data as Map);
      final policy = Map<String, dynamic>.from(envelope['policy'] as Map);
      policy.addAll({
        'enabled': _rewardEnabled,
        'rewardCoinsPerView': reward,
        'maxRewardedViewsPerUtcDay': views,
        'maxRewardCoinsPerUtcDay': coins,
        'maxRewardsPerCampaignRolling24h': campaignCap,
      });
      await _functions.httpsCallable('setOwnerFeaturedAdRewardPolicy').call({'policy': policy});
      _reward.text = reward.toString();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم حفظ سياسة المكافآت التجريبية بإصدار جديد.')),
      );
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _error = e.message ?? 'تعذر حفظ سياسة المكافآت.');
    } finally {
      if (mounted) setState(() => _savingPolicy = false);
    }
  }

  Future<DateTime?> _pickDateTime(DateTime initial) async {
    final now = DateTime.now();
    final date = await showDatePicker(
      context: context,
      initialDate: initial.isBefore(now) ? now : initial,
      firstDate: DateTime(now.year, now.month, now.day),
      lastDate: DateTime(now.year + 2),
    );
    if (date == null || !mounted) return null;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(initial),
    );
    if (time == null) return null;
    return DateTime(date.year, date.month, date.day, time.hour, time.minute);
  }

  Future<void> _save() async {
    final title = _title.text.trim();
    final sponsor = _sponsor.text.trim();
    final body = _body.text.trim();
    final budget = int.tryParse(_budget.text.trim());
    final reward = int.tryParse(_reward.text.trim());
    if (title.length < 3 || sponsor.length < 2 || body.length < 10 ||
        budget == null || reward == null || budget < reward || reward < 0 ||
        !_endsAt.isAfter(_startsAt) || _endsAt.isBefore(DateTime.now())) {
      setState(() => _error = 'راجع بيانات الحملة والميزانية والمكافأة.');
      return;
    }
    setState(() { _saving = true; _error = null; });
    try {
      await _functions.httpsCallable('setOwnerFeaturedAdCampaign').call({
        if (_editingId != null) 'campaignId': _editingId,
        'title': title, 'sponsorLabel': sponsor, 'body': body,
        'geographicTargets': [_geography],
        'featuredPlacement': _placement,
        'startsAtMs': _startsAt.millisecondsSinceEpoch,
        'endsAtMs': _endsAt.millisecondsSinceEpoch,
        'rewardBudgetCoins': budget, 'rewardCoinsPerView': reward,
        if (_mediaId != null) 'mediaId': _mediaId,
      });
      _clear();
      await _load();
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _error = e.message ?? 'تعذر حفظ الحملة.');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _clear() {
    _title.clear(); _sponsor.clear(); _body.clear();
    _budget.text = '20'; _reward.text = '2';
    setState(() {
      _editingId = null; _mediaId = null;
      _startsAt = DateTime.now();
      _endsAt = _startsAt.add(const Duration(days: 7));
    });
  }

  void _edit(Map<String, dynamic> item) {
    if (!['draft', 'paused'].contains(item['status'])) return;
    setState(() {
      _editingId = item['campaignId'] as String?;
      _title.text = item['title'] as String? ?? '';
      _sponsor.text = item['sponsorLabel'] as String? ?? '';
      _body.text = item['body'] as String? ?? '';
      _budget.text = (item['rewardBudgetCoins'] ?? 20).toString();
      _reward.text = _policyReward.text;
      _placement = item['featuredPlacement'] == 'priority' ? 'priority' : 'rotation';
      final targets = item['geographicTargets'];
      _geography = targets is List && targets.isNotEmpty ? targets.first.toString() : 'all_arab_countries';
      _mediaId = item['mediaId'] as String?;
      final starts = item['startsAtMs'];
      final ends = item['endsAtMs'];
      _startsAt = starts is num ? DateTime.fromMillisecondsSinceEpoch(starts.toInt()) : DateTime.now();
      _endsAt = ends is num ? DateTime.fromMillisecondsSinceEpoch(ends.toInt()) : _startsAt.add(const Duration(days: 7));
    });
  }

  Future<String?> _askCreativeReviewNote() async {
    final controller = TextEditingController();
    final note = await showDialog<String>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('سبب رفض المادة الإعلانية'),
        content: TextField(
          controller: controller,
          minLines: 2,
          maxLines: 4,
          decoration: const InputDecoration(hintText: 'اكتب ملاحظة واضحة لصاحب الحملة'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('إلغاء')),
          FilledButton(onPressed: () => Navigator.pop(dialogContext, controller.text.trim()), child: const Text('تأكيد الرفض')),
        ],
      ),
    );
    controller.dispose();
    return note;
  }

  Future<void> _reviewCreative(String id, {required bool approved}) async {
    String? note;
    if (!approved) {
      note = await _askCreativeReviewNote();
      if (note == null) return;
      if (note.trim().length < 5) {
        setState(() => _error = 'اكتب سبباً واضحاً للرفض لا يقل عن خمسة أحرف.');
        return;
      }
    }
    setState(() { _saving = true; _error = null; });
    try {
      await _functions.httpsCallable('reviewFeaturedAdCreative').call({
        'campaignId': id,
        'approved': approved,
        if (note != null) 'reviewNote': note,
      });
      await _load();
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _error = e.message ?? 'تعذرت مراجعة المادة الإعلانية.');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _status(String id, String status, {bool paymentConfirmed = false}) async {
    setState(() { _saving = true; _error = null; });
    try {
      await _functions.httpsCallable('setFeaturedAdCampaignStatus').call({
        'campaignId': id, 'status': status, 'paymentConfirmed': paymentConfirmed,
      });
      await _load();
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _error = e.message ?? 'تعذر تغيير حالة الحملة.');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('لوحة الإعلانات المميزة')),
      body: _loading ? const Center(child: CircularProgressIndicator()) : ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (_error != null) Padding(padding: const EdgeInsets.only(bottom: 12), child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error))),
          Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(_editingId == null ? 'إنشاء حملة' : 'تعديل الحملة', style: Theme.of(context).textTheme.titleLarge),
              TextField(controller: _title, decoration: const InputDecoration(labelText: 'العنوان')),
              TextField(controller: _sponsor, decoration: const InputDecoration(labelText: 'المعلن / الراعي')),
              TextField(controller: _body, minLines: 3, maxLines: 6, decoration: const InputDecoration(labelText: 'المحتوى')),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                initialValue: _geography,
                decoration: const InputDecoration(labelText: 'النطاق الجغرافي'),
                items: _geographies.entries.map((e) => DropdownMenuItem(value: e.key, child: Text(e.value))).toList(),
                onChanged: _saving ? null : (v) => setState(() => _geography = v ?? _geography),
              ),
              DropdownButtonFormField<String>(
                initialValue: _placement,
                decoration: const InputDecoration(labelText: 'الموضع المميز'),
                items: const [
                  DropdownMenuItem(value: 'rotation', child: Text('دوران تلقائي')),
                  DropdownMenuItem(value: 'priority', child: Text('أولوية مميزة')),
                ],
                onChanged: _saving ? null : (v) => setState(() => _placement = v ?? 'rotation'),
              ),
              Row(children: [
                Expanded(child: OutlinedButton.icon(
                  onPressed: _saving ? null : () async {
                    final value = await _pickDateTime(_startsAt);
                    if (value != null) setState(() => _startsAt = value);
                  },
                  icon: const Icon(Icons.event_available),
                  label: Text('البداية: ' + _startsAt.toLocal().toString().substring(0, 16)),
                )),
                const SizedBox(width: 8),
                Expanded(child: OutlinedButton.icon(
                  onPressed: _saving ? null : () async {
                    final value = await _pickDateTime(_endsAt);
                    if (value != null) setState(() => _endsAt = value);
                  },
                  icon: const Icon(Icons.event_busy),
                  label: Text('النهاية: ' + _endsAt.toLocal().toString().substring(0, 16)),
                )),
              ]),
              const SizedBox(height: 8),
              Row(children: [
                Expanded(child: TextField(controller: _budget, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'ميزانية مكافآت الحملة'))),
                const SizedBox(width: 12),
                Expanded(child: InputDecorator(
                  decoration: const InputDecoration(labelText: 'كوين/مشاهدة — السياسة العامة'),
                  child: Text(_reward.text),
                )),
              ]),
              const SizedBox(height: 8),
              Row(children: [
                Expanded(child: OutlinedButton.icon(
                  onPressed: _uploadingMedia || _saving ? null : _uploadCreative,
                  icon: _uploadingMedia
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.upload_file),
                  label: Text(_uploadingMedia ? 'جارٍ الرفع والفحص...' : 'رفع مادة إعلانية آمنة'),
                )),
              ]),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                initialValue: _mediaId,
                decoration: const InputDecoration(labelText: 'المادة الإعلانية الآمنة'),
                items: [
                  const DropdownMenuItem<String>(value: null, child: Text('بدون مادة — لا يمكن النشر حتى ربط مادة آمنة')),
                  ..._approvedMedia.map((item) => DropdownMenuItem<String>(
                    value: item['mediaId'] as String,
                    child: Text((item['originalName'] ?? item['mediaId']).toString()),
                  )),
                ],
                onChanged: _saving ? null : (v) => setState(() => _mediaId = v),
              ),
              const SizedBox(height: 8),
              const Text('المادة تُرفع إلى مخزن Mawdda الآمن، وتبقى غير قابلة للنشر حتى اجتياز الفحص واعتماد المشتق الآمن.'),
              const SizedBox(height: 12),
              Row(children: [
                Expanded(child: FilledButton(onPressed: _saving ? null : _save, child: const Text('حفظ كمسودة'))),
                const SizedBox(width: 8),
                if (_editingId != null) OutlinedButton(onPressed: _saving ? null : _clear, child: const Text('إلغاء')),
              ]),
            ],
          ))),
          const SizedBox(height: 16),
          Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('سياسة المكافآت التجريبية العامة', style: Theme.of(context).textTheme.titleLarge),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('تفعيل مكافآت الإعلانات المميزة'),
                value: _rewardEnabled,
                onChanged: _savingPolicy ? null : (v) => setState(() => _rewardEnabled = v),
              ),
              Row(children: [
                Expanded(child: TextField(controller: _policyReward, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'كوين لكل مشاهدة'))),
                const SizedBox(width: 10),
                Expanded(child: TextField(controller: _policyDailyViews, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'مشاهدات يومية UTC'))),
              ]),
              Row(children: [
                Expanded(child: TextField(controller: _policyDailyCoins, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'كوين يومياً UTC'))),
                const SizedBox(width: 10),
                Expanded(child: TextField(controller: _policyCampaignCap, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'للحملة/24 ساعة'))),
              ]),
              const SizedBox(height: 10),
              SizedBox(width: double.infinity, child: FilledButton(
                onPressed: _savingPolicy ? null : _saveRewardPolicy,
                child: Text(_savingPolicy ? 'جارٍ الحفظ...' : 'حفظ سياسة المكافآت'),
              )),
              const SizedBox(height: 4),
              const Text('تُطبق السياسة خادمياً وبشكل ذري. القيم الافتراضية تجريبية ولا تمثل أسعاراً تجارية أو التزاماً دائماً.', style: TextStyle(fontSize: 12)),
            ],
          ))),
          const SizedBox(height: 16),
          Text('الحملات', style: Theme.of(context).textTheme.titleLarge),
          ..._campaigns.map((item) {
            final id = item['campaignId'] as String? ?? '';
            final status = item['status'];
            return Card(child: ListTile(
              title: Text(item['title'] as String? ?? id),
              subtitle: Text('${item['status']} • ${item['featuredPlacement']} • ميزانية ${item['rewardBudgetCoins'] ?? 0} • مستخدم ${item['spentRewardCoins'] ?? 0}'),
              isThreeLine: true,
              trailing: PopupMenuButton<String>(
                enabled: !_saving,
                onSelected: (value) async {
                  if (value == 'edit') _edit(item);
                  if (value == 'approveCreative') await _reviewCreative(id, approved: true);
                  if (value == 'rejectCreative') await _reviewCreative(id, approved: false);
                  if (value == 'approve') await _status(id, 'approved', paymentConfirmed: true);
                  if (value == 'publish') await _status(id, 'published');
                  if (value == 'pause') await _status(id, 'paused');
                  if (value == 'withdraw') await _status(id, 'withdrawn');
                },
                itemBuilder: (_) => [
                  if (status == 'draft' || status == 'paused') const PopupMenuItem(value: 'edit', child: Text('تعديل')),
                  if ((status == 'draft' || status == 'paused') && item['mediaId'] != null)
                    const PopupMenuItem(value: 'approveCreative', child: Text('اعتماد المادة الإعلانية')),
                  if ((status == 'draft' || status == 'paused') && item['mediaId'] != null)
                    const PopupMenuItem(value: 'rejectCreative', child: Text('رفض المادة الإعلانية')),
                  if (status == 'draft' || status == 'paused') const PopupMenuItem(value: 'approve', child: Text('اعتماد الحملة + تأكيد الدفع')),
                  if (status == 'approved' || status == 'paused') const PopupMenuItem(value: 'publish', child: Text('نشر')),
                  if (status == 'published') const PopupMenuItem(value: 'pause', child: Text('إيقاف مؤقت')),
                  if (status != 'withdrawn') const PopupMenuItem(value: 'withdraw', child: Text('سحب فوري')),
                ],
              ),
            ));
          }),
        ],
      ),
    );
  }
}
