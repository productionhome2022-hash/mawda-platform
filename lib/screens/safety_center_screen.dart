import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

class SafetyCenterScreen extends StatefulWidget {
  const SafetyCenterScreen({super.key, this.initialTargetUid});

  final String? initialTargetUid;

  @override
  State<SafetyCenterScreen> createState() => _SafetyCenterScreenState();
}

class _SafetyCenterScreenState extends State<SafetyCenterScreen> {
  final _targetUid = TextEditingController();
  final _contextId = TextEditingController();
  final _description = TextEditingController();
  String _category = 'harassment';
  String _contextType = 'member';
  bool _busy = false;
  late Future<Map<String, dynamic>> _cases;

  static const _categories = <String, String>{
    'harassment': 'مضايقة أو تحرش',
    'hate_or_threats': 'كراهية أو تهديد',
    'sexual_content': 'محتوى جنسي مخالف',
    'spam_or_scam': 'رسائل مزعجة أو احتيال',
    'impersonation': 'انتحال شخصية',
    'minor_safety': 'سلامة القاصرين',
    'privacy_violation': 'انتهاك الخصوصية',
    'other': 'سبب آخر',
  };

  @override
  void initState() {
    super.initState();
    _targetUid.text = widget.initialTargetUid ?? '';
    _cases = _loadCases();
  }

  @override
  void dispose() {
    _targetUid.dispose();
    _contextId.dispose();
    _description.dispose();
    super.dispose();
  }

  Future<Map<String, dynamic>> _loadCases() async {
    final result = await FirebaseFunctions.instance.httpsCallable('getMySafetyCases').call();
    return Map<String, dynamic>.from(result.data as Map);
  }

  void _refresh() => setState(() => _cases = _loadCases());

  Future<void> _submitReport() async {
    if (_busy) return;
    final targetUid = _targetUid.text.trim();
    final description = _description.text.trim();
    final contextId = _contextId.text.trim();
    if (targetUid.isEmpty || description.length < 10 ||
        (['direct_message', 'room_message', 'room'].contains(_contextType) && contextId.isEmpty)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('أدخل معرف العضو ووصفاً واضحاً، ومعرف السياق عند الحاجة.')),
      );
      return;
    }
    setState(() => _busy = true);
    try {
      final requestId = 'report_${DateTime.now().microsecondsSinceEpoch}';
      await FirebaseFunctions.instance.httpsCallable('submitSafetyReport').call({
        'targetUid': targetUid,
        'category': _category,
        'contextType': _contextType,
        'contextId': contextId.isEmpty ? null : contextId,
        'description': description,
        'requestId': requestId,
      });
      if (!mounted) return;
      _targetUid.clear();
      _contextId.clear();
      _description.clear();
      _refresh();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم استلام البلاغ بسرية وإحالته إلى مراجعة المنصة.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر إرسال البلاغ.')),
      );
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر إرسال البلاغ؛ لم يتم تأكيد نجاح العملية.')),
      );
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _appeal(String caseId) async {
    final controller = TextEditingController();
    final reason = await showDialog<String>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('استئناف قرار السلامة'),
        content: TextField(
          controller: controller,
          minLines: 3,
          maxLines: 6,
          maxLength: 2000,
          decoration: const InputDecoration(
            labelText: 'اشرح سبب الاستئناف (20 حرفاً على الأقل)',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('إلغاء')),
          FilledButton(
            onPressed: () {
              if (controller.text.trim().length >= 20) {
                Navigator.pop(dialogContext, controller.text.trim());
              }
            },
            child: const Text('إرسال الاستئناف'),
          ),
        ],
      ),
    );
    controller.dispose();
    if (reason == null || !mounted || _busy) return;
    setState(() => _busy = true);
    try {
      await FirebaseFunctions.instance.httpsCallable('submitSafetyAppeal').call({
        'caseId': caseId,
        'reason': reason,
        'requestId': 'appeal_${DateTime.now().microsecondsSinceEpoch}',
      });
      if (!mounted) return;
      _refresh();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم استلام الاستئناف لإعادة المراجعة.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر إرسال الاستئناف.')),
      );
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر إرسال الاستئناف؛ لم يتم تأكيد نجاح العملية.')),
      );
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Widget _caseCard(Map<String, dynamic> item, {required bool decision}) {
    final caseId = item['caseId'] as String? ?? '';
    final status = item['status'] as String? ?? 'unknown';
    final appealStatus = item['appealStatus'] as String? ?? 'not_available';
    final canAppeal = decision && status == 'action_taken' && appealStatus == 'available';
    return Card(
      child: ListTile(
        title: Text(decision ? 'قرار إداري على الحساب' : 'بلاغ مقدم من حسابك'),
        subtitle: Text(decision
            ? 'القرار: ${status == 'action_taken' ? 'إجراء اتُخذ' : status}\nالسبب: ${item['decisionReason'] ?? 'غير متاح'}'
            : 'الفئة: ${_categories[item['category']] ?? item['category']} • الحالة: $status'),
        isThreeLine: decision,
        trailing: canAppeal
            ? TextButton(
                onPressed: _busy ? null : () => _appeal(caseId),
                child: const Text('استئناف'),
              )
            : null,
      ),
    );
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('مركز الأمان والخصوصية')),
        body: FutureBuilder<Map<String, dynamic>>(
          future: _cases,
          builder: (context, snapshot) => RefreshIndicator(
            onRefresh: () async => _refresh(),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text('تقديم بلاغ', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 8),
                TextField(
                  controller: _targetUid,
                  decoration: const InputDecoration(
                    labelText: 'معرف العضو موضوع البلاغ',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  initialValue: _category,
                  decoration: const InputDecoration(labelText: 'نوع البلاغ'),
                  items: _categories.entries.map((entry) => DropdownMenuItem(
                    value: entry.key, child: Text(entry.value),
                  )).toList(),
                  onChanged: _busy ? null : (value) => setState(() => _category = value ?? 'other'),
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  initialValue: _contextType,
                  decoration: const InputDecoration(labelText: 'مكان الواقعة'),
                  items: const [
                    DropdownMenuItem(value: 'member', child: Text('الحساب')),
                    DropdownMenuItem(value: 'profile', child: Text('الملف الشخصي')),
                    DropdownMenuItem(value: 'direct_message', child: Text('محادثة خاصة')),
                    DropdownMenuItem(value: 'room', child: Text('غرفة')),
                    DropdownMenuItem(value: 'room_message', child: Text('رسالة داخل غرفة')),
                  ],
                  onChanged: _busy ? null : (value) => setState(() => _contextType = value ?? 'member'),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _contextId,
                  decoration: const InputDecoration(
                    labelText: 'معرف الرسالة أو الغرفة (إن وجد)',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _description,
                  minLines: 3,
                  maxLines: 6,
                  maxLength: 2000,
                  decoration: const InputDecoration(
                    labelText: 'اشرح ما حدث (10 أحرف على الأقل)',
                    border: OutlineInputBorder(),
                  ),
                ),
                FilledButton(
                  onPressed: _busy ? null : _submitReport,
                  child: _busy
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('إرسال البلاغ بسرية'),
                ),
                const SizedBox(height: 24),
                Text('بلاغاتي', style: Theme.of(context).textTheme.titleLarge),
                if (snapshot.connectionState == ConnectionState.waiting)
                  const Center(child: CircularProgressIndicator())
                else if (snapshot.hasError)
                  TextButton(onPressed: _refresh, child: const Text('تعذر تحميل السجل؛ أعد المحاولة'))
                else ...[
                  for (final item in (snapshot.data?['reports'] as List<dynamic>? ?? const [])
                      .whereType<Map>().map((value) => Map<String, dynamic>.from(value)))
                    _caseCard(item, decision: false),
                  const SizedBox(height: 16),
                  Text('قرارات قابلة للاستئناف', style: Theme.of(context).textTheme.titleLarge),
                  for (final item in (snapshot.data?['decisions'] as List<dynamic>? ?? const [])
                      .whereType<Map>().map((value) => Map<String, dynamic>.from(value)))
                    _caseCard(item, decision: true),
                ],
              ],
            ),
          ),
        ),
      );
}
