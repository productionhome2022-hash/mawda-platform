import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

class OwnerFeaturedAdsDashboardScreen extends StatefulWidget {
  const OwnerFeaturedAdsDashboardScreen({super.key});
  @override
  State<OwnerFeaturedAdsDashboardScreen> createState() => _OwnerFeaturedAdsDashboardScreenState();
}

class _OwnerFeaturedAdsDashboardScreenState extends State<OwnerFeaturedAdsDashboardScreen> {
  final _functions = FirebaseFunctions.instance;
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
  void initState() { super.initState(); _load(); }

  @override
  void dispose() {
    _title.dispose(); _sponsor.dispose(); _body.dispose();
    _budget.dispose(); _reward.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final results = await Future.wait([
        _functions.httpsCallable('getOwnerFeaturedAdCampaigns').call(),
        _functions.httpsCallable('listOwnerMediaAssets').call({'status': 'security_approved', 'limit': 100}),
      ]);
      final data = Map<String, dynamic>.from(results[0].data as Map);
      final mediaData = Map<String, dynamic>.from(results[1].data as Map);
      final items = (data['campaigns'] as List<dynamic>? ?? const [])
          .whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      final media = (mediaData['assets'] as List<dynamic>? ?? const [])
          .whereType<Map>().map((e) => Map<String, dynamic>.from(e))
          .where((e) => e['mediaPurpose'] == 'advertisement' && e['status'] == 'security_approved')
          .toList();
      if (mounted) setState(() { _campaigns = items; _approvedMedia = media; });
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _error = e.message ?? 'تعذر تحميل الحملات.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحميل الحملات.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _save() async {
    final title = _title.text.trim();
    final sponsor = _sponsor.text.trim();
    final body = _body.text.trim();
    final budget = int.tryParse(_budget.text.trim());
    final reward = int.tryParse(_reward.text.trim());
    if (title.length < 3 || sponsor.length < 2 || body.length < 10 ||
        budget == null || reward == null || budget < reward || reward < 0) {
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
        'startsAtMs': DateTime.now().millisecondsSinceEpoch,
        'endsAtMs': DateTime.now().add(const Duration(days: 7)).millisecondsSinceEpoch,
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
    setState(() { _editingId = null; _mediaId = null; });
  }

  void _edit(Map<String, dynamic> item) {
    if (!['draft', 'paused'].contains(item['status'])) return;
    setState(() {
      _editingId = item['campaignId'] as String?;
      _title.text = item['title'] as String? ?? '';
      _sponsor.text = item['sponsorLabel'] as String? ?? '';
      _body.text = item['body'] as String? ?? '';
      _budget.text = (item['rewardBudgetCoins'] ?? 20).toString();
      _reward.text = (item['rewardCoinsPerView'] ?? 2).toString();
      _placement = item['featuredPlacement'] == 'priority' ? 'priority' : 'rotation';
      final targets = item['geographicTargets'];
      _geography = targets is List && targets.isNotEmpty ? targets.first.toString() : 'all_arab_countries';
      _mediaId = item['mediaId'] as String?;
    });
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
                Expanded(child: TextField(controller: _budget, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'ميزانية مكافآت تجريبية'))),
                const SizedBox(width: 12),
                Expanded(child: TextField(controller: _reward, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'كوين/مشاهدة'))),
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
              const Text('المادة الآمنة تُرفع وتُفحص في مخزن Mawdda الآمن قبل اعتمادها. لا يوجد نشر لمادة غير security_approved.'); بعد اجتياز الفحص الأمني. لا يوجد اعتماد أو نشر لمادة غير آمنة.'),
              const SizedBox(height: 12),
              Row(children: [
                Expanded(child: FilledButton(onPressed: _saving ? null : _save, child: const Text('حفظ كمسودة'))),
                const SizedBox(width: 8),
                if (_editingId != null) OutlinedButton(onPressed: _saving ? null : _clear, child: const Text('إلغاء')),
              ]),
            ],
          ))),
          const SizedBox(height: 16),
          Text('الحملات', style: Theme.of(context).textTheme.titleLarge),
          ..._campaigns.map((item) {
            final id = item['campaignId'] as String? ?? '';
            final status = item['status'];
            return Card(child: ListTile(
              title: Text(item['title'] as String? ?? id),
              subtitle: Text('\${item['status']} • \${item['featuredPlacement']} • ميزانية \${item['rewardBudgetCoins'] ?? 0} • مستخدم \${item['spentRewardCoins'] ?? 0}'),
              isThreeLine: true,
              trailing: PopupMenuButton<String>(
                enabled: !_saving,
                onSelected: (value) async {
                  if (value == 'edit') _edit(item);
                  if (value == 'approve') await _status(id, 'approved', paymentConfirmed: true);
                  if (value == 'publish') await _status(id, 'published');
                  if (value == 'pause') await _status(id, 'paused');
                  if (value == 'withdraw') await _status(id, 'withdrawn');
                },
                itemBuilder: (_) => [
                  if (status == 'draft' || status == 'paused') const PopupMenuItem(value: 'edit', child: Text('تعديل')),
                  if (status == 'draft' || status == 'paused') const PopupMenuItem(value: 'approve', child: Text('اعتماد + تأكيد الدفع')),
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
