import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'owner_featured_ads_dashboard_screen.dart';

class OwnerAdvertisingIntakeScreen extends StatefulWidget {
  const OwnerAdvertisingIntakeScreen({super.key});

  @override
  State<OwnerAdvertisingIntakeScreen> createState() => _OwnerAdvertisingIntakeScreenState();
}

class _OwnerAdvertisingIntakeScreenState extends State<OwnerAdvertisingIntakeScreen> {
  final _functions = FirebaseFunctions.instance;
  List<Map<String, dynamic>> _requests = [];
  bool _loading = false;
  String? _error;
  String _kind = 'all';
  String _status = 'all';
  final Set<String> _busy = {};

  static const _statuses = <String, String>{
    'submitted_pending_review': 'بانتظار المراجعة',
    'under_review': 'قيد المراجعة',
    'correction_requested': 'مطلوب تصحيح',
    'accepted_pending_contract': 'مقبول مبدئياً — بانتظار العقد',
    'rejected': 'مرفوض',
    'closed': 'مغلق',
  };

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    if (_loading) return;
    setState(() { _loading = true; _error = null; });
    try {
      final response = await _functions.httpsCallable('listOwnerAdvertisingIntake').call({
        if (_kind != 'all') 'kind': _kind,
        if (_status != 'all') 'status': _status,
        'limit': 100,
      });
      final data = Map<String, dynamic>.from(response.data as Map);
      final items = (data['requests'] as List<dynamic>? ?? const [])
          .whereType<Map>().map((item) => Map<String, dynamic>.from(item)).toList();
      if (mounted) setState(() => _requests = items);
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحميل الطلبات.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحميل الطلبات.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _review(Map<String, dynamic> item, String nextStatus) async {
    final controller = TextEditingController();
    final note = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('تسجيل قرار المراجعة'),
        content: TextField(
          controller: controller,
          minLines: 3,
          maxLines: 6,
          decoration: const InputDecoration(labelText: 'ملاحظة أو سبب القرار (مطلوب)'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
          FilledButton(onPressed: () => Navigator.pop(context, controller.text.trim()), child: const Text('حفظ القرار')),
        ],
      ),
    );
    controller.dispose();
    if (note == null || note.trim().length < 5) return;
    final id = item['requestId'] as String?;
    if (id == null || _busy.contains(id)) return;
    setState(() { _busy.add(id); _error = null; });
    try {
      await _functions.httpsCallable('reviewOwnerAdvertisingIntake').call({
        'requestId': id,
        'expectedVersion': item['requestVersion'],
        'nextStatus': nextStatus,
        'note': note,
      });
      await _load();
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر حفظ القرار.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر حفظ القرار.');
    } finally {
      if (mounted) setState(() => _busy.remove(id));
    }
  }

  String _kindLabel(Object? kind) => kind == 'representative_application'
      ? 'طلب مندوب إعلانات' : 'طلب إعلان مباشر';

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('طلبات الإعلانات والمندوبين'),
      actions: [
        IconButton(onPressed: _loading ? null : _load, icon: const Icon(Icons.refresh)),
        IconButton(
          tooltip: 'لوحة الإعلانات المميزة',
          onPressed: () => Navigator.of(context).push(
            MaterialPageRoute<void>(builder: (_) => const OwnerFeaturedAdsDashboardScreen()),
          ),
          icon: const Icon(Icons.campaign_outlined),
        ),
      ],
    ),
    body: Column(children: [
      Padding(
        padding: const EdgeInsets.all(12),
        child: Column(children: [
          DropdownButtonFormField<String>(
            initialValue: _kind,
            decoration: const InputDecoration(labelText: 'نوع الطلب'),
            items: const [
              DropdownMenuItem(value: 'all', child: Text('كل الطلبات')),
              DropdownMenuItem(value: 'representative_application', child: Text('طلبات المندوبين')),
              DropdownMenuItem(value: 'direct_advertiser', child: Text('الإعلانات المباشرة')),
            ],
            onChanged: (value) { setState(() => _kind = value ?? 'all'); _load(); },
          ),
          DropdownButtonFormField<String>(
            initialValue: _status,
            decoration: const InputDecoration(labelText: 'الحالة'),
            items: [
              const DropdownMenuItem(value: 'all', child: Text('كل الحالات')),
              ..._statuses.entries.map((entry) => DropdownMenuItem(value: entry.key, child: Text(entry.value))),
            ],
            onChanged: (value) { setState(() => _status = value ?? 'all'); _load(); },
          ),
        ]),
      ),
      if (_error != null) Padding(padding: const EdgeInsets.all(12), child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error))),
      if (_loading) const LinearProgressIndicator(),
      Expanded(
        child: _requests.isEmpty
            ? const Center(child: Text('لا توجد طلبات مطابقة حالياً.'))
            : RefreshIndicator(
                onRefresh: _load,
                child: ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: _requests.length,
                  itemBuilder: (context, index) {
                    final item = _requests[index];
                    final id = item['requestId'] as String? ?? '';
                    final terminal = item['status'] == 'rejected' || item['status'] == 'closed';
                    return Card(
                      child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(_kindLabel(item['kind']), style: Theme.of(context).textTheme.titleMedium),
                          Text((item['displayName'] as String?) ?? '—'),
                          if (item['organizationName'] != null) Text('الجهة: ${item['organizationName']}'),
                          Text('التصنيف: ${item['category'] ?? '—'}'),
                          Text('النطاق: ${(item['targetGeographies'] as List<dynamic>? ?? const []).join('، ')}'),
                          Text('المدة المقترحة: ${item['proposedDuration'] ?? '—'}'),
                          Text('الحالة: ${_statuses[item['status']] ?? item['status']}'),
                          if (item['experience'] != null) Text('الخبرة: ${item['experience']}'),
                          if (item['portfolioUrl'] != null) SelectableText('الأعمال: ${item['portfolioUrl']}'),
                          if (item['reviewNote'] != null) Text('آخر ملاحظة: ${item['reviewNote']}'),
                          Text('المعرف: $id', style: Theme.of(context).textTheme.bodySmall),
                          if (!terminal) Wrap(spacing: 8, runSpacing: 4, children: [
                            TextButton(onPressed: _busy.contains(id) ? null : () => _review(item, 'under_review'), child: const Text('بدء المراجعة')),
                            TextButton(onPressed: _busy.contains(id) ? null : () => _review(item, 'correction_requested'), child: const Text('طلب تصحيح')),
                            TextButton(onPressed: _busy.contains(id) ? null : () => _review(item, 'accepted_pending_contract'), child: const Text('قبول مبدئي')),
                            TextButton(onPressed: _busy.contains(id) ? null : () => _review(item, 'rejected'), child: const Text('رفض')),
                            TextButton(onPressed: _busy.contains(id) ? null : () => _review(item, 'closed'), child: const Text('إغلاق')),
                          ]),
                          if (item['contractRequired'] == true)
                            const Text('لا يُفعّل دور ولا يُنشأ إعلان أو حجز أو نشر قبل العقد والاعتماد المنفصل.'),
                        ]),
                      ),
                    );
                  },
                ),
              ),
      ),
    ]),
  );
}
