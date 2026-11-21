import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

class SafetyReviewScreen extends StatefulWidget {
  const SafetyReviewScreen({super.key});

  @override
  State<SafetyReviewScreen> createState() => _SafetyReviewScreenState();
}

class _SafetyReviewScreenState extends State<SafetyReviewScreen> {
  bool _busy = false;
  late Future<Map<String, dynamic>> _queue;

  @override
  void initState() {
    super.initState();
    _queue = _load();
  }

  Future<Map<String, dynamic>> _load() async {
    final results = await Future.wait([
      FirebaseFunctions.instance.httpsCallable('listSafetyCases').call({'status': 'open', 'limit': 50}),
      FirebaseFunctions.instance.httpsCallable('listSafetyAppeals').call(),
    ]);
    return {
      'cases': (results[0].data as Map)['cases'] ?? const [],
      'appeals': (results[1].data as Map)['appeals'] ?? const [],
    };
  }

  void _refresh() => setState(() => _queue = _load());

  Future<String?> _decisionReason(String title) async {
    final controller = TextEditingController();
    final value = await showDialog<String>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(title),
        content: TextField(
          controller: controller,
          minLines: 3,
          maxLines: 6,
          maxLength: 1000,
          decoration: const InputDecoration(
            labelText: 'سبب القرار (10 أحرف على الأقل)',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('إلغاء')),
          FilledButton(
            onPressed: () {
              if (controller.text.trim().length >= 10) {
                Navigator.pop(dialogContext, controller.text.trim());
              }
            },
            child: const Text('تأكيد'),
          ),
        ],
      ),
    );
    controller.dispose();
    return value;
  }

  Future<void> _reviewCase(String caseId, String decision) async {
    final reason = await _decisionReason(decision == 'action_taken' ? 'تأكيد إجراء السلامة' : 'إغلاق البلاغ دون إجراء');
    if (reason == null || !mounted || _busy) return;
    setState(() => _busy = true);
    try {
      await FirebaseFunctions.instance.httpsCallable('reviewSafetyCase').call({
        'caseId': caseId, 'decision': decision, 'reason': reason,
      });
      if (!mounted) return;
      _refresh();
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم حفظ قرار البلاغ.')));
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.message ?? 'تعذر حفظ القرار.')));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _reviewAppeal(String appealId, String decision) async {
    final reason = await _decisionReason(decision == 'accepted' ? 'قبول الاستئناف' : 'رفض الاستئناف');
    if (reason == null || !mounted || _busy) return;
    setState(() => _busy = true);
    try {
      await FirebaseFunctions.instance.httpsCallable('reviewSafetyAppeal').call({
        'appealId': appealId, 'decision': decision, 'reason': reason,
      });
      if (!mounted) return;
      _refresh();
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم حفظ قرار الاستئناف.')));
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.message ?? 'تعذر حفظ قرار الاستئناف.')));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: const Text('مراجعة البلاغات والاستئنافات'),
          actions: [IconButton(onPressed: _refresh, icon: const Icon(Icons.refresh))],
        ),
        body: FutureBuilder<Map<String, dynamic>>(
          future: _queue,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              return Center(child: TextButton(onPressed: _refresh, child: const Text('تعذر تحميل طابور السلامة؛ أعد المحاولة')));
            }
            final cases = (snapshot.data?['cases'] as List<dynamic>? ?? const [])
                .whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
            final appeals = (snapshot.data?['appeals'] as List<dynamic>? ?? const [])
                .whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text('البلاغات المفتوحة', style: Theme.of(context).textTheme.titleLarge),
                for (final item in cases)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text('بلاغ: ${item['caseId']} • الفئة: ${item['category']}'),
                        Text('العضو موضوع البلاغ: ${item['subjectUid']}'),
                        Text('السياق: ${item['contextType']} / ${item['contextId'] ?? '—'}'),
                        Text(item['description'] as String? ?? ''),
                        Wrap(spacing: 8, children: [
                          OutlinedButton(
                            onPressed: _busy ? null : () => _reviewCase(item['caseId'] as String, 'dismissed'),
                            child: const Text('إغلاق دون إجراء'),
                          ),
                          FilledButton(
                            onPressed: _busy ? null : () => _reviewCase(item['caseId'] as String, 'action_taken'),
                            child: const Text('اتخاذ إجراء'),
                          ),
                        ]),
                      ]),
                    ),
                  ),
                const SizedBox(height: 20),
                Text('الاستئنافات المعلقة', style: Theme.of(context).textTheme.titleLarge),
                for (final item in appeals)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text('استئناف: ${item['appealId']} • البلاغ: ${item['caseId']}'),
                        Text('العضو: ${item['appellantUid']}'),
                        Text(item['reason'] as String? ?? ''),
                        Wrap(spacing: 8, children: [
                          OutlinedButton(
                            onPressed: _busy ? null : () => _reviewAppeal(item['appealId'] as String, 'rejected'),
                            child: const Text('رفض الاستئناف'),
                          ),
                          FilledButton(
                            onPressed: _busy ? null : () => _reviewAppeal(item['appealId'] as String, 'accepted'),
                            child: const Text('قبول الاستئناف'),
                          ),
                        ]),
                      ]),
                    ),
                  ),
                if (cases.isEmpty && appeals.isEmpty)
                  const Padding(padding: EdgeInsets.all(24), child: Text('لا توجد بلاغات أو استئنافات معلقة.')),
              ],
            );
          },
        ),
      );
}
