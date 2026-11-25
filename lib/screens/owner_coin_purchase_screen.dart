import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'owner_chat_participation_screen.dart';

class OwnerCoinPurchaseScreen extends StatefulWidget {
  const OwnerCoinPurchaseScreen({super.key});
  @override
  State<OwnerCoinPurchaseScreen> createState() => _OwnerCoinPurchaseScreenState();
}

class _OwnerCoinPurchaseScreenState extends State<OwnerCoinPurchaseScreen> {
  final _functions = FirebaseFunctions.instance;
  List<Map<String, dynamic>> _requests = [];
  bool _loading = true, _busy = false;
  String? _error;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final result = await _functions.httpsCallable('listOwnerCoinPurchaseRequests').call();
      final data = Map<String, dynamic>.from(result.data as Map);
      if (mounted) setState(() => _requests = (data['requests'] as List<dynamic>? ?? const [])
          .whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList());
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _error = e.message ?? 'تعذر تحميل طلبات BetaCoins.');
    } finally { if (mounted) setState(() => _loading = false); }
  }

  Future<void> _instructions(Map<String, dynamic> item) async {
    final uid = item['requesterUid'] as String? ?? '';
    final id = item['requestId'] as String? ?? '';
    final requested = (item['requestedCoins'] as num?)?.toInt() ??
        ((item['packageSnapshot'] is Map) ? ((item['packageSnapshot']['coins'] as num?)?.toInt() ?? 0) : 0);
    final coins = TextEditingController(text: requested > 0 ? requested.toString() : '');
    final price = TextEditingController(text: item['packageSnapshot'] is Map
        ? ((item['packageSnapshot']['priceMinor'] ?? '').toString()) : '');
    final currency = TextEditingController(text: item['currency'] as String? ??
        (item['packageSnapshot'] is Map ? item['packageSnapshot']['currency'] as String? ?? '' : ''));
    final instructions = TextEditingController();
    final accepted = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('تعليمات الدفع والاتفاق'),
      content: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Text('العضو: ' + uid),
        TextField(controller: coins, keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: 'الكمية المتفق عليها')),
        TextField(controller: price, keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: 'السعر بوحدات العملة الصغرى')),
        TextField(controller: currency, textCapitalization: TextCapitalization.characters,
          decoration: const InputDecoration(labelText: 'رمز العملة (ISO 4217)')),
        TextField(controller: instructions, minLines: 2, maxLines: 5,
          decoration: const InputDecoration(labelText: 'تعليمات الدفع اليدوي')),
      ])),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('إلغاء')),
        FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('إرسال التعليمات')),
      ],
    ));
    if (accepted != true || !mounted) {
      coins.dispose(); price.dispose(); currency.dispose(); instructions.dispose(); return;
    }
    final coinAmount = int.tryParse(coins.text.trim());
    final priceMinor = int.tryParse(price.text.trim());
    final currencyCode = currency.text.trim().toUpperCase();
    final validCurrency = currencyCode.length == 3 &&
        currencyCode.codeUnits.every((unit) => unit >= 65 && unit <= 90);
    if (coinAmount == null || priceMinor == null || !validCurrency ||
        instructions.text.trim().length < 5) {
      setState(() => _error = 'أدخل كمية وسعراً ورمز عملة وتعليمات صحيحة.');
      coins.dispose(); price.dispose(); currency.dispose(); instructions.dispose(); return;
    }
    await _runAction(() => _functions.httpsCallable('setCoinPurchasePaymentInstructions').call({
      'requesterUid': uid, 'requestId': id, 'agreedCoins': coinAmount,
      'agreedPriceMinor': priceMinor, 'currency': currencyCode,
      'expectedInstructionsVersion': (item['instructionsVersion'] as num?)?.toInt() ?? 0,
      'instructions': instructions.text.trim(),
    }));
    coins.dispose(); price.dispose(); currency.dispose(); instructions.dispose();
  }

  Future<void> _approve(Map<String, dynamic> item) async {
    final uid = item['requesterUid'] as String? ?? '';
    final id = item['requestId'] as String? ?? '';
    final reference = TextEditingController();
    final note = TextEditingController();
    bool confirmed = false;
    final accepted = await showDialog<bool>(context: context, builder: (ctx) => StatefulBuilder(
      builder: (ctx, setDialog) => AlertDialog(
        title: const Text('تأكيد استلام الدفعة الخارجية'),
        content: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Text('لا تعتمد الطلب إلا بعد التحقق بنفسك من وصول المبلغ فعلياً إلى حساب الاستلام الخارجي.'),
          TextField(controller: reference, decoration: const InputDecoration(labelText: 'مرجع التحويل/الإيصال')),
          TextField(controller: note, minLines: 2, maxLines: 4,
            decoration: const InputDecoration(labelText: 'ملاحظة التحقق')),
          CheckboxListTile(value: confirmed, onChanged: (v) => setDialog(() => confirmed = v == true),
            title: const Text('أؤكد أنني تحققت بنفسي من وصول المبلغ'), controlAffinity: ListTileControlAffinity.leading),
        ])),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('إلغاء')),
          FilledButton(onPressed: confirmed && reference.text.trim().length >= 3 &&
              note.text.trim().length >= 5 ? () => Navigator.pop(ctx, true) : null,
            child: const Text('اعتماد وإضافة BetaCoins')),
        ],
      ),
    ));
    if (accepted == true && mounted) {
      await _runAction(() => _functions.httpsCallable('approveCoinPurchaseRequest').call({
        'requesterUid': uid, 'requestId': id, 'externalPaymentVerified': true,
        'externalPaymentReference': reference.text.trim(), 'verificationNote': note.text.trim(),
      }));
    }
    reference.dispose(); note.dispose();
  }

  Future<void> _reject(Map<String, dynamic> item) async {
    final reason = TextEditingController();
    final accepted = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('رفض طلب الشراء'),
      content: TextField(controller: reason, minLines: 2, maxLines: 4,
        decoration: const InputDecoration(labelText: 'سبب الرفض')),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('إلغاء')),
        FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('تأكيد الرفض')),
      ],
    ));
    if (accepted == true && mounted && reason.text.trim().length >= 5) {
      await _runAction(() => _functions.httpsCallable('rejectCoinPurchaseRequest').call({
        'requesterUid': item['requesterUid'], 'requestId': item['requestId'],
        'reason': reason.text.trim(),
      }));
    }
    reason.dispose();
  }

  Future<void> _runAction(Future<dynamic> Function() action) async {
    if (_busy) return;
    setState(() { _busy = true; _error = null; });
    try { await action(); await _load(); }
    on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _error = e.message ?? 'تعذر تنفيذ العملية.');
    } finally { if (mounted) setState(() => _busy = false); }
  }

  String _formatMinor(int amount, int exponent, String currency) {
    final scale = exponent == 0 ? 1 : exponent == 1 ? 10 : exponent == 2 ? 100 : 1000;
    return (amount / scale).toStringAsFixed(exponent) + ' ' + currency;
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('طلبات شراء وإهداء BetaCoins اليدوية'),
      actions: [IconButton(onPressed: _loading || _busy ? null : _load,
        icon: const Icon(Icons.refresh))]),
    body: _loading ? const Center(child: CircularProgressIndicator()) : ListView(
      padding: const EdgeInsets.all(16), children: [
        const Card(child: Padding(padding: EdgeInsets.all(12), child: Text(
          'المسار يدوي فقط. لا تستخدم الاعتماد إلا بعد فحص وصول الدفعة خارج مودة. كل اعتماد يضيف BetaCoins وسجل المحفظة وسجل التدقيق في معاملة خادمية واحدة.',
        ))),
        if (_error != null) Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
        if (_requests.isEmpty) const Text('لا توجد طلبات شراء حالياً.'),
        ..._requests.map((item) {
          final status = item['status'] as String? ?? '';
          final id = item['requestId'] as String? ?? '';
          final amount = item['requestedCoins'] ?? item['agreedCoins'] ??
              ((item['packageSnapshot'] is Map) ? item['packageSnapshot']['coins'] : null) ?? 'غير محدد';
          final currency = item['agreedCurrency'] as String? ??
              item['currency'] as String? ??
              ((item['packageSnapshot'] is Map) ? item['packageSnapshot']['currency'] as String? ?? '—' : '—');
          final exponent = (item['agreedCurrencyExponent'] as num?)?.toInt() ??
              ((item['packageSnapshot'] is Map)
                ? (item['packageSnapshot']['currencyExponent'] as num?)?.toInt() ?? 2 : 2);
          return Card(child: Padding(padding: const EdgeInsets.all(12), child: Column(
            crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('صاحب الطلب: ' + (item['requesterUid'] as String? ?? '')),
              if (item['giftRecipientUid'] is String)
                Text('مستلم الهدية: ' + (item['giftRecipientUid'] as String)),
              Text('الطلب: ' + id),
              Text('الكمية: ' + amount.toString() + ' BetaCoins'),
              if (item['agreedPriceMinor'] is num)
                Text('السعر المتفق عليه: ' + _formatMinor(
                  (item['agreedPriceMinor'] as num).toInt(), exponent, currency)),
              Text('الحالة: ' + status),
              if (item['paymentInstructions'] is String)
                SelectableText('التعليمات الحالية: ' + (item['paymentInstructions'] as String)),
              if (item['chatId'] is String)
                Align(alignment: Alignment.centerLeft, child: TextButton.icon(
                  onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => OwnerChatParticipationScreen(chatId: item['chatId'] as String),
                  )),
                  icon: const Icon(Icons.chat_outlined),
                  label: const Text('فتح المحادثة الثنائية مع العضو'),
                )),
              if (status == 'pending_owner_contact' || status == 'payment_instructions_sent' || status == 'awaiting_payment_verification')
                Wrap(spacing: 8, children: [
                  if (status == 'pending_owner_contact')
                    OutlinedButton(onPressed: _busy ? null : () => _instructions(item),
                      child: const Text('إرسال تعليمات الدفع')),
                  if (status == 'payment_instructions_sent' || status == 'awaiting_payment_verification')
                    FilledButton(onPressed: _busy ? null : () => _approve(item),
                      child: const Text('تحقق واعتمد')),
                  TextButton(onPressed: _busy ? null : () => _reject(item),
                    child: const Text('رفض')),
                ]),
            ],
          )));
        }),
      ],
    ),
  );
}