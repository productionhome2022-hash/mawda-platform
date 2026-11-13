import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

class CoinPurchaseScreen extends StatefulWidget {
  const CoinPurchaseScreen({super.key});
  @override
  State<CoinPurchaseScreen> createState() => _CoinPurchaseScreenState();
}

class _CoinPurchaseScreenState extends State<CoinPurchaseScreen> {
  final _functions = FirebaseFunctions.instance;
  final _customCoins = TextEditingController();
  List<Map<String, dynamic>> _packages = [];
  List<Map<String, dynamic>> _requests = [];
  bool _loading = true, _sending = false;
  String? _error;

  @override
  void initState() { super.initState(); _load(); }
  @override
  void dispose() { _customCoins.dispose(); super.dispose(); }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final results = await Future.wait([
        _functions.httpsCallable('getAvailableCoinPackages').call(),
        _functions.httpsCallable('getMyCoinPurchaseRequests').call(),
      ]);
      final catalogue = Map<String, dynamic>.from(results[0].data as Map);
      final requests = Map<String, dynamic>.from(results[1].data as Map);
      if (!mounted) return;
      setState(() {
        _packages = (catalogue['packages'] as List<dynamic>? ?? const [])
            .whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
        _requests = (requests['requests'] as List<dynamic>? ?? const [])
            .whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      });
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _error = e.message ?? 'تعذر تحميل طلبات الشراء.');
    } finally { if (mounted) setState(() => _loading = false); }
  }

  Future<void> _submitRequest(Map<String, dynamic> details) async {
    if (_sending) return;
    setState(() { _sending = true; _error = null; });
    try {
      await _functions.httpsCallable('createCoinPurchaseRequest').call({
        ...details, 'requestId': const Uuid().v4().replaceAll('-', '_'),
      });
      _customCoins.clear();
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text(
        'سُجل طلبك. سيتواصل معك مالك المنصة لتأكيد السعر وتعليمات الدفع. لم تُضف كوينز بعد.',
      )));
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _error = e.message ?? 'تعذر تسجيل الطلب.');
    } finally { if (mounted) setState(() => _sending = false); }
  }

  Future<void> _requestCustom() async {
    final coins = int.tryParse(_customCoins.text.trim());
    if (coins == null || coins < 1 || coins > 1000000000) {
      setState(() => _error = 'أدخل كمية كوينز صحيحة بين 1 و1,000,000,000.');
      return;
    }
    await _submitRequest({'kind': 'custom', 'requestedCoins': coins});
  }

  Future<void> _withdraw(String requestId) async {
    try {
      await _functions.httpsCallable('withdrawCoinPurchaseRequest').call({'requestId': requestId});
      await _load();
    } on FirebaseFunctionsException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.message ?? 'تعذر سحب الطلب.')),
      );
    }
  }

  String _status(String? value) => switch (value) {
    'pending_owner_contact' => 'بانتظار تواصل المالك',
    'payment_instructions_sent' => 'أُرسلت تعليمات الدفع - بانتظار التحقق',
    'approved' => 'تم الاعتماد وإضافة الكوينز',
    'rejected' => 'مرفوض',
    'withdrawn' => 'مسحوب',
    _ => 'قيد المعالجة',
  };

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('شراء الكوينز يدوياً'),
      actions: [IconButton(onPressed: _loading ? null : _load, icon: const Icon(Icons.refresh))]),
    body: _loading ? const Center(child: CircularProgressIndicator()) : ListView(
      padding: const EdgeInsets.all(16), children: [
        const Card(child: Padding(padding: EdgeInsets.all(14), child: Text(
          'تُنفذ الطلبات بالتواصل المباشر مع مالك مودة. لا يتم إصدار أي كوينز عند تقديم الطلب أو إرسال التعليمات؛ يضيفها الخادم فقط بعد تحقق المالك من وصول الدفعة الخارجية.',
        ))),
        if (_error != null) Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
        Text('الباقات المتاحة', style: Theme.of(context).textTheme.titleLarge),
        if (_packages.isEmpty) const Text('لا توجد باقات متاحة حالياً. يمكنك إرسال طلب كمية مخصصة.'),
        ..._packages.map((item) => Card(child: ListTile(
          title: Text(item['name'] as String? ?? 'باقة كوينز'),
          subtitle: Text((item['coins'] ?? 0).toString() + ' كوين • ' +
              (((item['priceMinor'] as num?) ?? 0).toDouble() / 100).toStringAsFixed(2) + ' EUR'),
          trailing: FilledButton(
            onPressed: _sending ? null : () => _submitRequest({
              'kind': 'package', 'packageId': item['packageId'],
            }),
            child: const Text('طلب الباقة'),
          ),
        ))),
        const Divider(height: 28),
        Text('طلب كمية مخصصة', style: Theme.of(context).textTheme.titleLarge),
        Row(children: [
          Expanded(child: TextField(controller: _customCoins, enabled: !_sending,
            keyboardType: TextInputType.number, decoration: const InputDecoration(
              labelText: 'عدد الكوينز المطلوب', border: OutlineInputBorder(),
            ))),
          const SizedBox(width: 10),
          FilledButton(onPressed: _sending ? null : _requestCustom, child: const Text('إرسال الطلب')),
        ]),
        const Divider(height: 28),
        Text('طلباتي السابقة', style: Theme.of(context).textTheme.titleLarge),
        if (_requests.isEmpty) const Text('لا توجد طلبات سابقة.'),
        ..._requests.map((item) {
          final status = item['status'] as String?;
          final id = item['requestId'] as String? ?? '';
          final coins = item['agreedCoins'] ?? item['requestedCoins'] ??
              (item['packageSnapshot'] is Map ? item['packageSnapshot']['coins'] : null) ?? 'قيد التحديد';
          return Card(child: Padding(padding: const EdgeInsets.all(12), child: Column(
            crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('الكمية: ' + coins.toString() + ' كوين'),
              Text(_status(status)),
              if (item['agreedPriceMinor'] is num)
                Text('السعر المتفق عليه: ' +
                    (((item['agreedPriceMinor'] as num).toDouble() / 100).toStringAsFixed(2)) + ' EUR'),
              if (item['paymentInstructions'] is String)
                SelectableText('تعليمات المالك: ' + (item['paymentInstructions'] as String)),
              if (item['rejectionReason'] is String)
                Text('سبب الرفض: ' + (item['rejectionReason'] as String)),
              if (status == 'pending_owner_contact' || status == 'payment_instructions_sent')
                Align(alignment: Alignment.centerLeft, child: TextButton(
                  onPressed: _sending ? null : () => _withdraw(id), child: const Text('سحب الطلب'),
                )),
            ],
          )));
        }),
      ],
    ),
  );
}
