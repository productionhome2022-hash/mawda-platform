import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

class EconomyPricingScreen extends StatefulWidget {
  const EconomyPricingScreen({super.key});
  @override
  State<EconomyPricingScreen> createState() => _EconomyPricingScreenState();
}
class _EconomyPricingScreenState extends State<EconomyPricingScreen> {
  final _functions = FirebaseFunctions.instance;
  List<Map<String, dynamic>> _packages = [];
  List<Map<String, dynamic>> _ads = [];
  bool _loading = true, _saving = false;
  bool _manualPurchasesEnabled = true;
  int _version = 0;
  String? _error;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final result = await _functions.httpsCallable('getOwnerEconomyPricing').call();
      final data = Map<String, dynamic>.from(result.data as Map);
      if (!mounted) return;
      setState(() {
        _packages = (data['coinPackages'] as List<dynamic>? ?? const [])
            .whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
        _ads = (data['adPrices'] as List<dynamic>? ?? const [])
            .whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
        _version = data['version'] as int? ?? 0;
        _manualPurchasesEnabled = data['manualCoinPurchasesEnabled'] != false;
      });
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _error = e.message ?? 'تعذر تحميل إعدادات الاقتصاد.');
    } finally { if (mounted) setState(() => _loading = false); }
  }

  Future<void> _save() async {
    if (_saving || _packages.isEmpty || _ads.isEmpty) return;
    setState(() { _saving = true; _error = null; });
    try {
      final result = await _functions.httpsCallable('setOwnerEconomyPricing').call({
        'coinPackages': _packages, 'adPrices': _ads,
        'manualCoinPurchasesEnabled': _manualPurchasesEnabled,
      });
      final data = Map<String, dynamic>.from(result.data as Map);
      if (!mounted) return;
      setState(() => _version = data['version'] as int? ?? _version);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('تم حفظ الأسعار. إصدار السياسة: $_version')),
      );
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _error = e.message ?? 'تعذر حفظ الأسعار.');
    } finally { if (mounted) setState(() => _saving = false); }
  }

  Widget _priceField({
    required String label, required int value, required ValueChanged<int> onChanged,
  }) => SizedBox(
    width: 125,
    child: TextFormField(
      key: ValueKey(label),
      initialValue: value.toString(),
      enabled: !_saving,
      keyboardType: TextInputType.number,
      decoration: InputDecoration(labelText: label, suffixText: 'سنت'),
      onChanged: (text) {
        final parsed = int.tryParse(text);
        if (parsed != null && parsed > 0 && parsed <= 100000000) onChanged(parsed);
      },
    ),
  );

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('اقتصاد مودة والأسعار')),
    body: _loading ? const Center(child: CircularProgressIndicator()) : ListView(
      padding: const EdgeInsets.all(16), children: [
        Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(
          crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('إعدادات قابلة للتعديل • الإصدار $_version',
              style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            const Text('الأسعار النقدية باليورو (السنت). هذه جداول تسعير فقط؛ الدفع النقدي وإصدار الكوينز مقابل الدفع معطلان حتى ربط مزود دفع مرخص واختباره.'),
          ]))),
        if (_error != null) Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
        Card(child: SwitchListTile(
          title: const Text('تفعيل طلبات شراء الكوينز اليدوية'),
          subtitle: const Text('عند الإيقاف لن يتمكن الأعضاء من إنشاء طلبات جديدة. لا يوجد دفع إلكتروني آلي؛ يبقى معطلاً دائماً.'),
          value: _manualPurchasesEnabled,
          onChanged: _saving ? null : (value) => setState(() => _manualPurchasesEnabled = value),
        )),
        Text('باقات الكوينز', style: Theme.of(context).textTheme.titleLarge),
        ..._packages.asMap().entries.map((entry) {
          final i = entry.key, item = entry.value;
          return Card(child: Padding(padding: const EdgeInsets.all(12), child: Row(
            children: [
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(item['name'] as String? ?? item['packageId'] as String? ?? 'باقة'),
                Text('${item['coins']} كوين • EUR'),
              ])),
              _priceField(label: 'السعر', value: item['priceMinor'] as int,
                onChanged: (v) => setState(() => _packages[i] = {...item, 'priceMinor': v})),
              Switch(value: item['active'] == true, onChanged: _saving ? null :
                (v) => setState(() => _packages[i] = {...item, 'active': v})),
            ],
          )));
        }),
        const SizedBox(height: 12),
        Text('أسعار الإعلانات', style: Theme.of(context).textTheme.titleLarge),
        ..._ads.asMap().entries.map((entry) {
          final i = entry.key, item = entry.value;
          return Card(child: Padding(padding: const EdgeInsets.all(12), child: Row(
            children: [
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(item['name'] as String? ?? item['placementId'] as String? ?? 'موضع إعلاني'),
                Text('نموذج الفوترة: ${item['billingModel']} • EUR'),
              ])),
              _priceField(label: 'السعر', value: item['priceMinor'] as int,
                onChanged: (v) => setState(() => _ads[i] = {...item, 'priceMinor': v})),
              Switch(value: item['active'] == true, onChanged: _saving ? null :
                (v) => setState(() => _ads[i] = {...item, 'active': v})),
            ],
          )));
        }),
        const SizedBox(height: 12),
        FilledButton.icon(onPressed: _saving ? null : _save,
          icon: const Icon(Icons.save_outlined), label: const Text('حفظ أسعار الاقتصاد')),
      ],
    ),
  );
}
