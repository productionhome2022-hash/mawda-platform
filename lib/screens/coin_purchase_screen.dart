import 'dart:math' as math;

import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import 'direct_chat_screen.dart';

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
  Map<String, dynamic>? _customCoinRequestBounds;
  bool _manualPurchasesEnabled = false;
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
        _manualPurchasesEnabled = catalogue['manualPurchasesEnabled'] == true;
        _customCoinRequestBounds = catalogue['customCoinRequestBounds'] is Map
            ? Map<String, dynamic>.from(catalogue['customCoinRequestBounds'] as Map)
            : null;
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
        'سُجل طلبك. سيتواصل معك مالك المنصة لتأكيد السعر وتعليمات الدفع. لم تُضف BetaCoins بعد.',
      )));
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _error = e.message ?? 'تعذر تسجيل الطلب.');
    } finally { if (mounted) setState(() => _sending = false); }
  }

  Future<void> _requestCustom() async {
    final coins = int.tryParse(_customCoins.text.trim());
    final bounds = _customCoinRequestBounds;
    final minimum = (bounds?['minCoins'] as num?)?.toInt();
    final maximum = (bounds?['maxCoins'] as num?)?.toInt();
    if (!_manualPurchasesEnabled || minimum == null || maximum == null ||
        coins == null || coins < minimum || coins > maximum) {
      setState(() => _error = 'طلبات الكمية المخصصة غير مفعلة أو أن الكمية خارج الحدود المحددة من المالك.');
      return;
    }
    await _submitRequest({'kind': 'custom', 'requestedCoins': coins});
  }

  Future<void> _reportPaymentSent(Map<String, dynamic> item) async {
    if (_sending) return;
    final requestId = item['requestId'] as String? ?? '';
    final version = (item['instructionsVersion'] as num?)?.toInt() ?? 0;
    if (requestId.isEmpty || version < 1) return;
    setState(() { _sending = true; _error = null; });
    try {
      await _functions.httpsCallable('requestCoinPurchasePaymentVerification').call({
        'requestId': requestId, 'expectedInstructionsVersion': version,
      });
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text(
        'تم إبلاغ المالك. هذا الإبلاغ ليس إثباتاً لوصول المبلغ، ولن تُضاف BetaCoins حتى يتحقق المالك ويعتمد الطلب.',
      )));
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر إبلاغ المالك.');
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  double _moneyValue(Map<String, dynamic> item, String amountKey) {
    final amount = (item[amountKey] as num?)?.toDouble() ?? 0;
    final exponent = (item['currencyExponent'] as num?)?.toInt() ?? 2;
    return amount / math.pow(10, exponent);
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
    'awaiting_payment_verification' => 'أبلغت المالك - بانتظار التحقق الفعلي',
    'approved' => 'تم الاعتماد وإضافة BetaCoins',
    'rejected' => 'مرفوض',
    'withdrawn' => 'مسحوب',
    _ => 'قيد المعالجة',
  };

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('شراء BetaCoins يدوياً'),
      actions: [IconButton(onPressed: _loading ? null : _load, icon: const Icon(Icons.refresh))]),
    body: _loading ? const Center(child: CircularProgressIndicator()) : ListView(
      padding: const EdgeInsets.all(16), children: [
        const Card(child: Padding(padding: EdgeInsets.all(14), child: Text(
          'تُنفذ الطلبات بالتواصل المباشر مع مالك مودة. لا يتم إصدار أي BetaCoins عند تقديم الطلب أو إرسال التعليمات؛ يضيفها الخادم فقط بعد تحقق المالك من وصول الدفعة الخارجية.',
        ))),
        if (_error != null) Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
        Text('الباقات المتاحة', style: Theme.of(context).textTheme.titleLarge),
        if (!_manualPurchasesEnabled) const Text('طلبات الشراء اليدوية متوقفة حالياً بقرار المالك.'),
        if (_manualPurchasesEnabled && _packages.isEmpty) const Text('لا توجد باقات منشورة حالياً.'),
        ..._packages.map((item) => Card(child: ListTile(
          title: Text(item['name'] as String? ?? 'باقة BetaCoins'),
          subtitle: Text((item['coins'] ?? 0).toString() + ' BetaCoins • ' +
              _moneyValue(item, 'priceMinor').toStringAsFixed((item['currencyExponent'] as num?)?.toInt() ?? 2) +
              ' ' + (item['currency'] as String? ?? '')),
          trailing: FilledButton(
            onPressed: _sending ? null : () => _submitRequest({
              'kind': 'package', 'packageId': item['packageId'],
            }),
            child: const Text('طلب الباقة'),
          ),
        ))),
        const Divider(height: 28),
        if (_manualPurchasesEnabled && _customCoinRequestBounds != null)
          Text('طلب كمية مخصصة', style: Theme.of(context).textTheme.titleLarge),
        if (_manualPurchasesEnabled && _customCoinRequestBounds != null)
        Row(children: [
          Expanded(child: TextField(controller: _customCoins, enabled: !_sending,
            keyboardType: TextInputType.number, decoration: const InputDecoration(
              labelText: 'عدد BetaCoins المطلوب', border: OutlineInputBorder(),
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
              Text('الكمية: ' + coins.toString() + ' BetaCoins'),
              if (item['giftRecipientUid'] is String)
                const Text('هذا الطلب لشراء باقة كهدية؛ ستصل BetaCoins إلى العضو المستلم بعد اعتماد المالك.'),
              Text(_status(status)),
              if (item['agreedPriceMinor'] is num)
                Text('السعر المتفق عليه: ' +
                    _moneyValue(item, 'agreedPriceMinor').toStringAsFixed((item['currencyExponent'] as num?)?.toInt() ?? 2) +
                    ' ' + (item['currency'] as String? ?? '')),
              if (item['paymentInstructions'] is String)
                SelectableText('تعليمات المالك: ' + (item['paymentInstructions'] as String)),
              if (item['chatId'] is String && FirebaseAuth.instance.currentUser?.uid != null)
                Align(alignment: Alignment.centerLeft, child: TextButton.icon(
                  onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => DirectChatScreen(
                      chatId: item['chatId'] as String,
                      currentUserId: FirebaseAuth.instance.currentUser!.uid,
                      peerName: 'إدارة منصة مودة',
                    ),
                  )),
                  icon: const Icon(Icons.chat_outlined),
                  label: const Text('فتح المحادثة مع مالك المنصة'),
                )),
              if (item['rejectionReason'] is String)
                Text('سبب الرفض: ' + (item['rejectionReason'] as String)),
              if (status == 'payment_instructions_sent')
                Align(alignment: Alignment.centerLeft, child: FilledButton.tonal(
                  onPressed: _sending ? null : () => _reportPaymentSent(item),
                  child: const Text('أبلغت المالك بإرسال الدفعة'),
                )),
              if (status == 'pending_owner_contact')
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
