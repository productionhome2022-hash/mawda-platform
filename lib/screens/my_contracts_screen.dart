import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

class MyContractsScreen extends StatefulWidget {
  const MyContractsScreen({super.key});

  @override
  State<MyContractsScreen> createState() => _MyContractsScreenState();
}

class _MyContractsScreenState extends State<MyContractsScreen> {
  final FirebaseFunctions _functions = FirebaseFunctions.instance;
  List<Map<String, dynamic>> _contracts = [];
  bool _loading = true;
  bool _busy = false;
  String? _error;

  static const _statusLabels = <String, String>{
    'draft': 'مسودة',
    'legal_review': 'قيد المراجعة القانونية',
    'pending_owner_approval': 'بانتظار اعتماد الإدارة',
    'ready_to_send': 'جاهز للإرسال',
    'awaiting_counterparty_signature': 'بانتظار توقيعك',
    'awaiting_company_signature': 'وقعت — بانتظار توقيع الشركة',
    'signed': 'مكتمل التوقيع',
    'effective': 'نافذ',
    'suspended': 'معلق',
    'expired': 'منتهٍ',
    'renewal_or_amendment': 'قيد التجديد أو التعديل',
    'terminated': 'منتهٍ بقرار إنهاء',
    'cancelled': 'ملغى',
  };

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (mounted) setState(() { _loading = true; _error = null; });
    try {
      final response = await _functions.httpsCallable('listMyContracts').call();
      final data = Map<String, dynamic>.from(response.data as Map);
      final items = (data['contracts'] as List<dynamic>? ?? const [])
          .whereType<Map>()
          .map((item) => Map<String, dynamic>.from(item))
          .toList(growable: false);
      if (!mounted) return;
      setState(() => _contracts = items);
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحميل عقودك.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحميل عقودك. تحقق من الاتصال.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _showBody(Map<String, dynamic> contract) async {
    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text((contract['title'] as String?) ?? 'نص العقد'),
        content: SizedBox(
          width: 560,
          child: SingleChildScrollView(
            child: SelectableText((contract['body'] as String?) ?? 'لا يوجد نص محفوظ.'),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إغلاق')),
        ],
      ),
    );
  }

  Future<void> _sign(Map<String, dynamic> contract) async {
    if (_busy) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('الموافقة والتوقيع الإلكتروني'),
        content: const Text(
          'أؤكد أنني قرأت نص العقد وإصداره وبصمته الرقمية، '
          'وأوافق على الالتزامات الواردة فيه. يتطلب التوقيع بريداً متحققاً '
          'وإعادة تحقق حديثة من الحساب.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('مراجعة لاحقاً')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('أوافق وأوقع')),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    setState(() { _busy = true; _error = null; });
    try {
      await _functions.httpsCallable('signContractAsCounterparty').call({
        'contractId': contract['contractId'],
        'expectedVersion': contract['version'],
        'expectedContentHash': contract['contentHash'],
        'accept': true,
      });
      await _load();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم تسجيل توقيعك على النسخة المحددة.')),
        );
      }
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر توقيع العقد.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر توقيع العقد.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: const Text('عقودي واتفاقياتي'),
          actions: [
            IconButton(
              tooltip: 'تحديث',
              onPressed: _loading || _busy ? null : _load,
              icon: const Icon(Icons.refresh),
            ),
          ],
        ),
        body: _loading
            ? const Center(child: CircularProgressIndicator())
            : RefreshIndicator(
                onRefresh: _load,
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    const Text(
                      'تظهر هنا العقود الموجهة إلى حسابك. راجع النص والإصدار والبصمة قبل التوقيع.',
                    ),
                    if (_error != null) ...[
                      const SizedBox(height: 12),
                      Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                    ],
                    const SizedBox(height: 12),
                    if (_contracts.isEmpty)
                      const Card(
                        child: Padding(
                          padding: EdgeInsets.all(24),
                          child: Text('لا توجد عقود موجهة إلى حسابك حالياً.'),
                        ),
                      ),
                    for (final contract in _contracts)
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                (contract['title'] as String?) ?? 'عقد دون عنوان',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              const SizedBox(height: 6),
                              Text('الحالة: ${_statusLabels[contract['status']] ?? contract['status']}'),
                              Text('الإصدار: ${contract['version'] ?? '—'}'),
                              if (contract['commitmentMinor'] != null)
                                Text('القيمة بوحدات العملة الصغرى: ${contract['commitmentMinor']} ${contract['currency'] ?? ''}'),
                              const SizedBox(height: 6),
                              SelectableText(
                                'SHA-256: ${contract['contentHash'] ?? '—'}',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                              TextButton.icon(
                                onPressed: () => _showBody(contract),
                                icon: const Icon(Icons.description_outlined),
                                label: const Text('قراءة العقد كاملاً'),
                              ),
                              if (contract['status'] == 'awaiting_counterparty_signature')
                                SizedBox(
                                  width: double.infinity,
                                  child: FilledButton.icon(
                                    onPressed: _busy ? null : () => _sign(contract),
                                    icon: const Icon(Icons.draw_outlined),
                                    label: const Text('الموافقة والتوقيع الإلكتروني'),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
      );
}
