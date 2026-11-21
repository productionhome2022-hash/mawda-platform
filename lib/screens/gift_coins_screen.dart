import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

import '../services/coin_system_service.dart';

/// Two explicit gift rails:
/// - a configured package is a manual purchase request and is credited only
///   after owner verification;
/// - a custom amount is transferred from the sender's existing wallet balance.
class GiftCoinsScreen extends StatefulWidget {
  const GiftCoinsScreen({super.key});

  @override
  State<GiftCoinsScreen> createState() => _GiftCoinsScreenState();
}

class _GiftCoinsScreenState extends State<GiftCoinsScreen> {
  final _functions = FirebaseFunctions.instance;
  final _coinService = CoinSystemService();
  final _recipient = TextEditingController();
  final _amount = TextEditingController();
  List<Map<String, dynamic>> _packages = const [];
  bool _loading = true;
  bool _busy = false;
  String? _error;
  String? _requestId;
  String? _requestIdentity;

  String _requestFor(String identity) {
    if (_requestId == null || _requestIdentity != identity) {
      _requestId = const Uuid().v4().replaceAll('-', '_');
      _requestIdentity = identity;
    }
    return _requestId!;
  }

  void _clearRequest() {
    _requestId = null;
    _requestIdentity = null;
  }

  @override
  void initState() {
    super.initState();
    _loadPackages();
  }

  @override
  void dispose() {
    _recipient.dispose();
    _amount.dispose();
    super.dispose();
  }

  Future<void> _loadPackages() async {
    setState(() { _loading = true; _error = null; });
    try {
      final response = await _functions.httpsCallable('getAvailableCoinPackages').call();
      final data = Map<String, dynamic>.from(response.data as Map);
      final packages = (data['packages'] as List<dynamic>? ?? const [])
          .whereType<Map>()
          .map((value) => Map<String, dynamic>.from(value))
          .toList(growable: false);
      if (mounted) setState(() => _packages = packages);
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحميل الباقات.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String? _recipientUid() {
    final value = _recipient.text.trim();
    if (value.isEmpty || value.length > 128 || value.contains('/')) return null;
    return value;
  }

  Future<void> _giftPackage(Map<String, dynamic> package) async {
    final recipientUid = _recipientUid();
    if (recipientUid == null) {
      setState(() => _error = 'أدخل معرف حساب المستلم بصورة صحيحة.');
      return;
    }
    if (_busy) return;
    final requestId = _requestFor('package:$recipientUid:${package['packageId']}');
    setState(() { _busy = true; _error = null; });
    try {
      await _functions.httpsCallable('createCoinPurchaseRequest').call({
        'kind': 'package',
        'packageId': package['packageId'],
        'giftRecipientUid': recipientUid,
        'requestId': requestId,
      });
      _clearRequest();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('سُجل طلب إهداء الباقة. لن تصل الكوينز إلا بعد تحقق المالك من الدفع واعتماده.'),
      ));
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تسجيل طلب إهداء الباقة.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _giftFromBalance() async {
    final recipientUid = _recipientUid();
    final amount = int.tryParse(_amount.text.trim());
    if (recipientUid == null) {
      setState(() => _error = 'أدخل معرف حساب المستلم بصورة صحيحة.');
      return;
    }
    if (amount == null || amount < 1 || amount > 1000000000) {
      setState(() => _error = 'أدخل كمية صحيحة من 1 إلى 1,000,000,000 BetaCoins.');
      return;
    }
    if (_busy) return;
    setState(() { _busy = true; _error = null; });
    try {
      final quote = await _coinService.getTransferQuote(amount);
      if (!mounted) return;
      final confirmed = await showDialog<bool>(
        context: context,
        builder: (dialogContext) => AlertDialog(
          title: const Text('تأكيد إهداء BetaCoins من رصيدك'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('المستلم: $recipientUid'),
              Text('المبلغ المخصوم من رصيدك: ${quote.grossAmount} BetaCoins'),
              Text('عمولة المنصة المعتمدة: ${quote.commissionAmount} BetaCoins'),
              Text('الصافي الذي سيصل للمستلم: ${quote.netAmount} BetaCoins'),
              const SizedBox(height: 8),
              const Text('سيتم تنفيذ الخصم والإضافة والسجلات المالية خادمياً في معاملة واحدة.'),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('إلغاء')),
            FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('تأكيد الإهداء')),
          ],
        ),
      );
      if (confirmed != true || !mounted) return;
      final requestId = _requestFor('balance:$recipientUid:$amount');
      final receipt = await _coinService.transferCoins(
        recipientUid: recipientUid,
        amount: amount,
        requestId: requestId,
        expectedCommissionBps: quote.commissionBps,
      );
      _clearRequest();
      _amount.clear();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('تم الإهداء. وصل للمستلم ${receipt.netAmount} BetaCoins.'),
      ));
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر إتمام الإهداء.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر إتمام الإهداء. تحقق من الاتصال ثم أعد المحاولة.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('إهداء BetaCoins')),
    body: _loading
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.all(16),
            children: [
              const Text(
                'أدخل معرف العضو المستلم. يجب أن يكون حساباً مسجلاً ونشطاً؛ حسابات الزوار غير مؤهلة.',
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _recipient,
                enabled: !_busy,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'معرف حساب المستلم (UID)',
                  border: OutlineInputBorder(),
                ),
              ),
              if (_error != null) ...[
                const SizedBox(height: 12),
                Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
              ],
              const SizedBox(height: 20),
              Text('إهداء باقة مشتراة', style: Theme.of(context).textTheme.titleLarge),
              const Text(
                'اختر باقة من الباقات التي حددها المالك. هذا ينشئ طلب شراء يدوي، ولا يضيف رصيداً قبل تحقق المالك من الدفع واعتماده.',
              ),
              if (_packages.isEmpty) const Padding(
                padding: EdgeInsets.symmetric(vertical: 12),
                child: Text('لا توجد باقات متاحة حالياً.'),
              ),
              ..._packages.map((item) {
                final coins = (item['coins'] as num?)?.toInt() ?? 0;
                final priceMinor = (item['priceMinor'] as num?)?.toInt() ?? 0;
                final currency = item['currency'] as String? ?? 'EUR';
                return Card(
                  child: ListTile(
                    title: Text(item['name'] as String? ?? 'باقة BetaCoins'),
                    subtitle: Text('$coins BetaCoins • ${(priceMinor / 100).toStringAsFixed(2)} $currency'),
                    trailing: FilledButton(
                      onPressed: _busy ? null : () => _giftPackage(item),
                      child: const Text('إهداء الباقة'),
                    ),
                  ),
                );
              }),
              const Divider(height: 32),
              Text('إهداء كمية من رصيدك', style: Theme.of(context).textTheme.titleLarge),
              const Text(
                'يُخصم المبلغ من محفظتك الحالية. تظهر العمولة والصافي قبل التأكيد، ويُنفذ التحويل خادمياً.',
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _amount,
                enabled: !_busy,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'الكمية المراد إهداؤها',
                  suffixText: 'BetaCoins',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              FilledButton.icon(
                onPressed: _busy ? null : _giftFromBalance,
                icon: const Icon(Icons.card_giftcard),
                label: Text(_busy ? 'جارٍ التنفيذ...' : 'مراجعة وإهداء من رصيدي'),
              ),
              if (_busy) const Padding(
                padding: EdgeInsets.only(top: 12),
                child: LinearProgressIndicator(),
              ),
            ],
          ),
  );
}
