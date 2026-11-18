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
  bool _manualPurchasesEnabled = false;
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
        _manualPurchasesEnabled = data['manualCoinPurchasesEnabled'] == true;
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
        'expectedVersion': _version,
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

  Future<void> _addPackage() async {
    final id = TextEditingController();
    final name = TextEditingController();
    final coins = TextEditingController();
    final price = TextEditingController();
    final accepted = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('إضافة باقة BetaCoins'),
        content: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: id, decoration: const InputDecoration(labelText: 'معرف الباقة')),
          TextField(controller: name, decoration: const InputDecoration(labelText: 'اسم الباقة')),
          TextField(controller: coins, keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'عدد BetaCoins')),
          TextField(controller: price, keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'السعر بالسنت EUR')),
        ])),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('إلغاء')),
          FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('إضافة')),
        ],
      ),
    );
    final packageId = id.text.trim();
    final amount = int.tryParse(coins.text.trim());
    final priceMinor = int.tryParse(price.text.trim());
    if (accepted == true && mounted) {
      if (!RegExp(r'^[a-z0-9][a-z0-9_-]{2,40}
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
        Text('باقات BetaCoins', style: Theme.of(context).textTheme.titleLarge),
        Align(alignment: Alignment.centerLeft, child: OutlinedButton.icon(
          onPressed: _saving ? null : _addPackage,
          icon: const Icon(Icons.add), label: const Text('إضافة باقة يحددها المالك'),
        )),
        if (_packages.isEmpty) const Text('لم يحدد المالك أي باقات بعد. لن تظهر باقات شراء للأعضاء قبل إضافتها وحفظها.'),
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
              IconButton(
                tooltip: 'حذف الباقة',
                onPressed: _saving ? null : () => setState(() => _packages.removeAt(i)),
                icon: const Icon(Icons.delete_outline),
              ),
            ],
          )));
        }),
        const SizedBox(height: 12),
        Text('أسعار الإعلانات', style: Theme.of(context).textTheme.titleLarge),
        Align(alignment: Alignment.centerLeft, child: OutlinedButton.icon(
          onPressed: _saving ? null : _addAdPrice,
          icon: const Icon(Icons.add), label: const Text('إضافة موضع إعلاني وسعره'),
        )),
        if (_ads.isEmpty) const Text('لم يحدد المالك أسعار مواضع الإعلانات بعد.'),
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
              IconButton(
                tooltip: 'حذف السعر',
                onPressed: _saving ? null : () => setState(() => _ads.removeAt(i)),
                icon: const Icon(Icons.delete_outline),
              ),
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
).hasMatch(packageId) ||
          name.text.trim().length < 3 || amount == null || amount < 1 ||
          amount > 1000000000 || priceMinor == null || priceMinor < 1) {
        setState(() => _error = 'بيانات الباقة غير صالحة. أدخل معرفاً واسمًا وكمية وسعراً صحيحاً.');
      } else if (_packages.any((item) => item['packageId'] == packageId)) {
        setState(() => _error = 'معرف الباقة مستخدم بالفعل.');
      } else {
        setState(() {
          _packages.add({
            'packageId': packageId, 'name': name.text.trim(),
            'coins': amount, 'priceMinor': priceMinor,
            'currency': 'EUR', 'active': true,
          });
          _error = null;
        });
      }
    }
    id.dispose(); name.dispose(); coins.dispose(); price.dispose();
  }

  Future<void> _addAdPrice() async {
    final id = TextEditingController();
    final name = TextEditingController();
    final price = TextEditingController();
    var billingModel = 'cpm';
    final accepted = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) => AlertDialog(
          title: const Text('إضافة سعر موضع إعلاني'),
          content: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, children: [
            TextField(controller: id, decoration: const InputDecoration(labelText: 'معرف الموضع')),
            TextField(controller: name, decoration: const InputDecoration(labelText: 'اسم الموضع')),
            DropdownButtonFormField<String>(
              value: billingModel,
              decoration: const InputDecoration(labelText: 'نموذج الفوترة'),
              items: const [
                DropdownMenuItem(value: 'cpm', child: Text('CPM')),
                DropdownMenuItem(value: 'cpc', child: Text('CPC')),
                DropdownMenuItem(value: 'daily', child: Text('يومي')),
              ],
              onChanged: (value) => setDialogState(() => billingModel = value ?? billingModel),
            ),
            TextField(controller: price, keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'السعر بالسنت EUR')),
          ])),
          actions: [
            TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('إلغاء')),
            FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('إضافة')),
          ],
        ),
      ),
    );
    final placementId = id.text.trim();
    final priceMinor = int.tryParse(price.text.trim());
    if (accepted == true && mounted) {
      if (!RegExp(r'^[a-z0-9][a-z0-9_-]{2,40}
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
).hasMatch(placementId) ||
          name.text.trim().length < 3 || priceMinor == null || priceMinor < 1) {
        setState(() => _error = 'بيانات السعر الإعلاني غير صالحة.');
      } else if (_ads.any((item) => item['placementId'] == placementId)) {
        setState(() => _error = 'معرف الموضع الإعلاني مستخدم بالفعل.');
      } else {
        setState(() {
          _ads.add({
            'placementId': placementId, 'name': name.text.trim(),
            'billingModel': billingModel, 'priceMinor': priceMinor,
            'currency': 'EUR', 'active': true,
          });
          _error = null;
        });
      }
    }
    id.dispose(); name.dispose(); price.dispose();
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
