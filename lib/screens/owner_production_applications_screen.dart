import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

class OwnerProductionApplicationsScreen extends StatefulWidget {
  const OwnerProductionApplicationsScreen({super.key});

  @override
  State<OwnerProductionApplicationsScreen> createState() => _OwnerProductionApplicationsScreenState();
}

class _OwnerProductionApplicationsScreenState extends State<OwnerProductionApplicationsScreen> {
  final _functions = FirebaseFunctions.instance;
  List<Map<String, dynamic>> _items = [];
  bool _loading = false;
  String? _error;
  final Set<String> _busy = {};

  static const _statusLabels = <String, String>{
    'submitted_pending_review': 'بانتظار المراجعة',
    'under_review': 'قيد المراجعة',
    'correction_requested': 'مطلوب استكمال',
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
      final result = await _functions.httpsCallable('listOwnerProductionApplications').call({'limit': 100});
      final data = Map<String, dynamic>.from(result.data as Map);
      final rows = (data['applications'] as List<dynamic>? ?? const [])
          .whereType<Map>().map((v) => Map<String, dynamic>.from(v)).toList();
      if (mounted) setState(() => _items = rows);
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _error = e.message ?? 'تعذر تحميل الطلبات.');
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
        title: const Text('قرار مراجعة طلب صُنّاع مودة'),
        content: TextField(
          controller: controller,
          minLines: 3,
          maxLines: 6,
          decoration: const InputDecoration(labelText: 'الملاحظة أو سبب القرار (مطلوب)'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
          FilledButton(onPressed: () => Navigator.pop(context, controller.text.trim()), child: const Text('حفظ')),
        ],
      ),
    );
    controller.dispose();
    if (note == null || note.length < 5) return;
    final id = item['applicationId'] as String? ?? '';
    if (id.isEmpty || _busy.contains(id)) return;
    setState(() { _busy.add(id); _error = null; });
    try {
      await _functions.httpsCallable('reviewOwnerProductionApplication').call({
        'applicationId': id,
        'expectedVersion': item['applicationVersion'],
        'nextStatus': nextStatus,
        'note': note,
      });
      await _load();
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _error = e.message ?? 'تعذر حفظ القرار.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر حفظ القرار.');
    } finally {
      if (mounted) setState(() => _busy.remove(id));
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('طلبات صُنّاع مودة'),
      actions: [IconButton(onPressed: _loading ? null : _load, icon: const Icon(Icons.refresh))],
    ),
    body: Column(children: [
      if (_error != null) Padding(padding: const EdgeInsets.all(12), child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error))),
      if (_loading) const LinearProgressIndicator(),
      Expanded(
        child: _items.isEmpty
            ? const Center(child: Text('لا توجد طلبات حالياً.'))
            : RefreshIndicator(
                onRefresh: _load,
                child: ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: _items.length,
                  itemBuilder: (context, index) {
                    final item = _items[index];
                    final id = item['applicationId'] as String? ?? '';
                    final status = item['status'] as String? ?? '';
                    final terminal = status == 'rejected' || status == 'closed';
                    final specialties = (item['specialties'] as List<dynamic>? ?? const []).join('، ');
                    return Card(
                      child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(item['applicantName'] as String? ?? '—', style: Theme.of(context).textTheme.titleMedium),
                          Text(item['requestedTrack'] == 'production_supervisor_candidate' ? 'عضو إنتاج — مرشح للإشراف' : 'طلب عضوية إنتاج'),
                          Text('التخصصات: $specialties'),
                          Text('الخبرة: ${item['experience'] ?? '—'}'),
                          Text('الأدوات: ${item['tools'] ?? '—'}'),
                          Text('المشاريع السابقة: ${item['previousProjects'] ?? '—'}'),
                          if (item['collaboratingCompanies'] != null) Text('الشركات: ${item['collaboratingCompanies']}'),
                          if (item['achievements'] != null) Text('الإنجازات: ${item['achievements']}'),
                          if (item['cvUrl'] != null) SelectableText('السيرة: ${item['cvUrl']}'),
                          for (final url in (item['portfolioUrls'] as List<dynamic>? ?? const []))
                            SelectableText('ملف أعمال: $url'),
                          Text('الدور: ${item['roleDescription'] ?? '—'}'),
                          Text('إجابات المقابلة: ${item['interviewAnswers'] ?? '—'}'),
                          Text('الحالة: ${_statusLabels[status] ?? status}'),
                          if (item['reviewNote'] != null) Text('آخر ملاحظة: ${item['reviewNote']}'),
                          if (!terminal) Wrap(spacing: 6, children: [
                            TextButton(onPressed: _busy.contains(id) ? null : () => _review(item, 'under_review'), child: const Text('بدء المراجعة')),
                            TextButton(onPressed: _busy.contains(id) ? null : () => _review(item, 'correction_requested'), child: const Text('طلب استكمال')),
                            TextButton(onPressed: _busy.contains(id) ? null : () => _review(item, 'accepted_pending_contract'), child: const Text('قبول مبدئي')),
                            TextButton(onPressed: _busy.contains(id) ? null : () => _review(item, 'rejected'), child: const Text('رفض')),
                            TextButton(onPressed: _busy.contains(id) ? null : () => _review(item, 'closed'), child: const Text('إغلاق')),
                          ]),
                          const Text('القبول المبدئي لا ينشئ عضوية أو صلاحية أو غرفة؛ العقد ومنح الدور والصلاحيات إجراءات مستقلة.'),
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
