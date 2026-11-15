import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

class OwnerEntitlementGrantsScreen extends StatefulWidget {
  const OwnerEntitlementGrantsScreen({super.key});

  @override
  State<OwnerEntitlementGrantsScreen> createState() =>
      _OwnerEntitlementGrantsScreenState();
}

class _OwnerEntitlementGrantsScreenState
    extends State<OwnerEntitlementGrantsScreen> {
  final TextEditingController _memberUidsController = TextEditingController();
  final TextEditingController _reasonController = TextEditingController();
  final Uuid _uuid = const Uuid();

  List<Map<String, dynamic>> _catalogItems = [];
  String? _selectedItemId;
  int _durationHours = 24;
  bool _loadingCatalog = false;
  bool _submitting = false;
  String? _pendingRequestId;
  String? _resultSummary;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadCatalog();
  }

  @override
  void dispose() {
    _memberUidsController.dispose();
    _reasonController.dispose();
    super.dispose();
  }

  Future<void> _loadCatalog() async {
    setState(() {
      _loadingCatalog = true;
      _error = null;
    });
    try {
      final result = await FirebaseFunctions.instance
          .httpsCallable('getOwnerStoreCatalog')
          .call();
      final data = Map<String, dynamic>.from(result.data as Map);
      final raw = data['items'] as List? ?? const [];
      final items = raw
          .whereType<Map>()
          .map((item) => Map<String, dynamic>.from(item))
          .where((item) =>
              item['active'] == true && item['fulfillmentReady'] == true)
          .toList();
      if (!mounted) return;
      setState(() {
        _catalogItems = items;
        if (_selectedItemId == null ||
            !items.any((item) => item['itemId'] == _selectedItemId)) {
          _selectedItemId =
              items.isEmpty ? null : items.first['itemId'] as String;
        }
      });
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحميل كتالوج الاستحقاقات.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحميل كتالوج الاستحقاقات.');
    } finally {
      if (mounted) setState(() => _loadingCatalog = false);
    }
  }

  List<String> _parseMemberUids() {
    final values = _memberUidsController.text
        .split(RegExp(r'[\s,;]+'))
        .map((value) => value.trim())
        .where((value) => value.isNotEmpty);
    return values.toSet().toList(growable: false);
  }

  String _durationLabel(int hours) {
    switch (hours) {
      case 24:
        return '24 ساعة';
      case 168:
        return '7 أيام';
      case 720:
        return '30 يوماً';
      default:
        return '$hours ساعة';
    }
  }

  Future<void> _previewAndSubmit() async {
    if (_submitting) return;
    final targets = _parseMemberUids();
    final reason = _reasonController.text.trim();
    final selected = _catalogItems.firstWhere(
      (item) => item['itemId'] == _selectedItemId,
      orElse: () => <String, dynamic>{},
    );
    if (targets.isEmpty || selected.isEmpty || reason.length < 5) {
      setState(() => _error = 'أدخل معرف عضو واحداً على الأقل، واختر استحقاقاً، واكتب سبباً واضحاً.');
      return;
    }

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('مراجعة المنح قبل التنفيذ'),
        content: Text(
          'عدد الأعضاء: ${targets.length}\n'
          'الاستحقاق: ${selected['name']}\n'
          'المدة: ${_durationLabel(_durationHours)}\n'
          'الدفعات التقنية: ${(targets.length / 500).ceil()}\n'
          'السبب: $reason\n\n'
          'المنح مجاني ولا يخصم كوينز. إذا كان الاستحقاق فعالاً، تضاف المدة الجديدة إلى تاريخ انتهائه الحالي.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('مراجعة لاحقاً'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('تأكيد المنح'),
          ),
        ],
      ),
    );
    if (confirmed == true && mounted) await _executeGrant(targets, reason);
  }

  Future<void> _executeGrant(List<String> targets, String reason) async {
    final itemId = _selectedItemId;
    if (itemId == null) return;
    final requestId = _pendingRequestId ?? _uuid.v4();
    setState(() {
      _submitting = true;
      _pendingRequestId = requestId;
      _error = null;
      _resultSummary = null;
    });

    var newlyGranted = 0;
    var failed = 0;
    var replayed = 0;
    try {
      for (var offset = 0; offset < targets.length; offset += 500) {
        final chunk = targets.skip(offset).take(500).toList(growable: false);
        final response = await FirebaseFunctions.instance
            .httpsCallable('bulkGrantStoreEntitlements')
            .call({
          'targetUids': chunk,
          'itemId': itemId,
          'durationHours': _durationHours,
          'requestId': requestId,
          'reason': reason,
        });
        final result = Map<String, dynamic>.from(response.data as Map);
        final successful = (result['granted'] as num?)?.toInt() ?? 0;
        final replayedInChunk = (result['replayed'] as num?)?.toInt() ?? 0;
        final newCount = successful - replayedInChunk;
        newlyGranted += newCount < 0 ? 0 : newCount;
        failed += (result['failed'] as num?)?.toInt() ?? 0;
        replayed += replayedInChunk;
      }
      if (!mounted) return;
      setState(() {
        _resultSummary =
            'اكتملت المعالجة: $newlyGranted منح جديد، $replayed إعادة آمنة لطلبات سابقة، $failed تعذر يحتاج مراجعة.';
        if (failed == 0) _pendingRequestId = null;
      });
    } on FirebaseFunctionsException catch (error) {
      if (mounted) {
        setState(() => _error =
            'توقف التنفيذ عند دفعة غير مكتملة. أعد المحاولة بنفس الطلب لتُستكمل العناصر الناجحة دون تكرارها. ${error.message ?? ''}');
      }
    } catch (_) {
      if (mounted) {
        setState(() => _error =
            'تعذر إكمال جميع الدفعات. أعد المحاولة؛ سيحمي معرف الطلب العمليات التي نجحت سابقاً من التكرار.');
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final selected = _catalogItems.firstWhere(
      (item) => item['itemId'] == _selectedItemId,
      orElse: () => <String, dynamic>{},
    );
    return Scaffold(
      appBar: AppBar(title: const Text('مركز منح الاستحقاقات')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('منح فردي أو جماعي',
                        style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 8),
                    const Text(
                      'يمكنك منح الاستحقاق لأي عضو موجود، وتكرار المنح متى شئت. '
                      'لا يوجد سقف تجاري لعدد المنح؛ تُقسّم الطلبات الكبيرة تلقائياً إلى دفعات تقنية آمنة.',
                    ),
                    const SizedBox(height: 12),
                    if (_loadingCatalog)
                      const LinearProgressIndicator()
                    else if (_catalogItems.isEmpty)
                      const Text('لا توجد استحقاقات منشورة ومكتملة التنفيذ للمنح حالياً.')
                    else
                      DropdownButtonFormField<String>(
                        initialValue: _selectedItemId,
                        decoration: const InputDecoration(labelText: 'الاستحقاق'),
                        items: _catalogItems.map((item) {
                          return DropdownMenuItem<String>(
                            value: item['itemId'] as String,
                            child: Text(item['name'] as String? ?? item['itemId'] as String),
                          );
                        }).toList(),
                        onChanged: _submitting
                            ? null
                            : (value) => setState(() {
                                  _selectedItemId = value;
                                  _pendingRequestId = null;
                                }),
                      ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<int>(
                      initialValue: _durationHours,
                      decoration: const InputDecoration(labelText: 'مدة المنح'),
                      items: const [
                        DropdownMenuItem(value: 24, child: Text('24 ساعة')),
                        DropdownMenuItem(value: 168, child: Text('7 أيام')),
                        DropdownMenuItem(value: 720, child: Text('30 يوماً')),
                      ],
                      onChanged: _submitting
                          ? null
                          : (value) => setState(() {
                                _durationHours = value ?? 24;
                                _pendingRequestId = null;
                              }),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _memberUidsController,
                      onChanged: (_) { if (_pendingRequestId != null) setState(() => _pendingRequestId = null); },
                      minLines: 3,
                      maxLines: 8,
                      enabled: !_submitting,
                      decoration: const InputDecoration(
                        labelText: 'معرفات الأعضاء (UID)',
                        hintText: 'ضع UID واحداً في كل سطر أو افصل بينها بفواصل',
                        alignLabelWithHint: true,
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _reasonController,
                      onChanged: (_) { if (_pendingRequestId != null) setState(() => _pendingRequestId = null); },
                      minLines: 2,
                      maxLines: 4,
                      enabled: !_submitting,
                      decoration: const InputDecoration(
                        labelText: 'سبب المنح (إلزامي للتدقيق)',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    if (selected.isNotEmpty)
                      Text('سيتم منح ${selected['name']} مجاناً دون خصم أي كوينز.'),
                    const SizedBox(height: 12),
                    FilledButton.icon(
                      onPressed: _submitting || _loadingCatalog || _catalogItems.isEmpty
                          ? null
                          : _previewAndSubmit,
                      icon: _submitting
                          ? const SizedBox(
                              width: 18, height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.card_giftcard_outlined),
                      label: Text(_submitting ? 'جارٍ تنفيذ المنح...' : 'مراجعة ثم تنفيذ المنح'),
                    ),
                    if (_submitting) ...[
                      const SizedBox(height: 10),
                      const LinearProgressIndicator(),
                    ],
                    if (_pendingRequestId != null) ...[
                      const SizedBox(height: 10),
                      const Text(
                        'يوجد طلب سابق غير مكتمل. إعادة المحاولة ستستخدم نفس المعرف لمنع تكرار المنح الناجح.',
                        style: TextStyle(fontSize: 12),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ],
            if (_resultSummary != null) ...[
              const SizedBox(height: 12),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text(_resultSummary!),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
