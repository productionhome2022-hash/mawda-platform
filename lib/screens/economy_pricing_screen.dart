import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

class EconomyPricingScreen extends StatefulWidget {
  const EconomyPricingScreen({super.key});
  @override
  State<EconomyPricingScreen> createState() => _EconomyPricingScreenState();
}

class _EconomyPricingScreenState extends State<EconomyPricingScreen> {
  final _functions = FirebaseFunctions.instance;
  final _customMin = TextEditingController();
  final _customMax = TextEditingController();
  List<Map<String, dynamic>> _packages = [];
  List<Map<String, dynamic>> _ads = [];
  bool _loading = true, _saving = false, _manualPurchasesEnabled = false,
      _manualFeaturedAdsEnabled = false, _configured = false;
  int _version = 0;
  String? _error;

  @override
  void initState() { super.initState(); _load(); }

  @override
  void dispose() { _customMin.dispose(); _customMax.dispose(); super.dispose(); }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final result = await _functions.httpsCallable('getOwnerEconomyPricing').call();
      final data = Map<String, dynamic>.from(result.data as Map);
      final bounds = data['customCoinRequestBounds'] is Map
          ? Map<String, dynamic>.from(data['customCoinRequestBounds'] as Map)
          : <String, dynamic>{};
      if (!mounted) return;
      setState(() {
        _configured = data['configured'] == true;
        _packages = (data['coinPackages'] as List<dynamic>? ?? const [])
            .whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
        _ads = (data['adPrices'] as List<dynamic>? ?? const [])
            .whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
        _version = (data['version'] as num?)?.toInt() ?? 0;
        _manualPurchasesEnabled = data['manualCoinPurchasesEnabled'] == true;
        final paymentPolicy = data['paymentPolicy'] is Map
            ? Map<String, dynamic>.from(data['paymentPolicy'] as Map) : <String, dynamic>{};
        final featuredAds = paymentPolicy['featured_ads'] is Map
            ? Map<String, dynamic>.from(paymentPolicy['featured_ads'] as Map) : <String, dynamic>{};
        _manualFeaturedAdsEnabled = featuredAds['manualEnabled'] == true;
        _customMin.text = bounds['minCoins']?.toString() ?? '';
        _customMax.text = bounds['maxCoins']?.toString() ?? '';
      });
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحميل إعدادات الاقتصاد.');
    } finally { if (mounted) setState(() => _loading = false); }
  }

  Future<void> _editPackage({Map<String, dynamic>? existing, int? index}) async {
    final id = TextEditingController(text: existing?['packageId']?.toString() ?? '');
    final name = TextEditingController(text: existing?['name']?.toString() ?? '');
    final coins = TextEditingController(text: existing?['coins']?.toString() ?? '');
    final price = TextEditingController(text: existing?['priceMinor']?.toString() ?? '');
    final currency = TextEditingController(text: existing?['currency']?.toString() ?? '');
    bool active = existing?['active'] == true;
    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(builder: (context, refresh) => AlertDialog(
        title: Text(existing == null ? 'إضافة باقة BetaCoins' : 'تعديل باقة BetaCoins'),
        content: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: id, decoration: const InputDecoration(labelText: 'معرف الباقة (إنجليزي صغير)')),
          TextField(controller: name, decoration: const InputDecoration(labelText: 'اسم الباقة')),
          TextField(controller: coins, keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'كمية BetaCoins')),
          TextField(controller: price, keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'السعر بأصغر وحدة للعملة')),
          TextField(controller: currency, textCapitalization: TextCapitalization.characters,
            decoration: const InputDecoration(labelText: 'رمز العملة (ISO 4217)',
              helperText: 'تُحدد دقة الكسور تلقائياً وفق العملة.')),
          SwitchListTile(contentPadding: EdgeInsets.zero, value: active,
            onChanged: (value) => refresh(() => active = value),
            title: const Text('تفعيل عرض هذه الباقة')),
        ])),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('إلغاء')),
          FilledButton(onPressed: () => Navigator.pop(dialogContext, {
            'packageId': id.text.trim().toLowerCase(), 'name': name.text.trim(),
            'coins': int.tryParse(coins.text.trim()), 'priceMinor': int.tryParse(price.text.trim()),
            'currency': currency.text.trim().toUpperCase(), 'active': active,
          }), child: const Text('حفظ')),
        ],
      )),
    );
    id.dispose(); name.dispose(); coins.dispose(); price.dispose(); currency.dispose();
    if (result == null || !mounted) return;
    final packageId = result['packageId'] as String;
    final packageName = result['name'] as String;
    final coinAmount = result['coins'] as int?;
    final priceMinor = result['priceMinor'] as int?;
    final currencyCode = result['currency'] as String;
    if (!RegExp(r'^[a-z0-9][a-z0-9_-]{2,40}$').hasMatch(packageId) ||
        packageName.length < 3 || coinAmount == null || coinAmount < 1 ||
        priceMinor == null || priceMinor < 1 ||
        !RegExp(r'^[A-Z]{3}$').hasMatch(currencyCode)) {
      setState(() => _error = 'بيانات الباقة غير مكتملة أو غير صالحة. لم تُحفظ.');
      return;
    }
    setState(() {
      final value = {...result};
      if (index == null) {
        if (_packages.any((item) => item['packageId'] == packageId)) {
          _error = 'معرف الباقة مستخدم بالفعل.';
        } else { _packages = [..._packages, value]; }
      } else { _packages = [..._packages]..[index] = value; }
    });
  }

  Future<void> _editAd({Map<String, dynamic>? existing, int? index}) async {
    final id = TextEditingController(text: existing?['placementId']?.toString() ?? '');
    final name = TextEditingController(text: existing?['name']?.toString() ?? '');
    final price = TextEditingController(text: existing?['priceMinor']?.toString() ?? '');
    final currency = TextEditingController(text: existing?['currency']?.toString() ?? '');
    String billingModel = existing?['billingModel']?.toString() ?? 'daily';
    bool active = existing?['active'] == true;
    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(builder: (context, refresh) => AlertDialog(
        title: Text(existing == null ? 'إضافة موضع إعلاني' : 'تعديل موضع إعلاني'),
        content: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: id, decoration: const InputDecoration(labelText: 'معرف الموضع (إنجليزي صغير)')),
          TextField(controller: name, decoration: const InputDecoration(labelText: 'اسم الموضع')),
          DropdownButtonFormField<String>(
            initialValue: billingModel,
            decoration: const InputDecoration(labelText: 'نموذج الفوترة'),
            items: const [
              DropdownMenuItem(value: 'daily', child: Text('يومي')),
              DropdownMenuItem(value: 'cpm', child: Text('لكل ألف ظهور')),
              DropdownMenuItem(value: 'cpc', child: Text('لكل نقرة')),
            ],
            onChanged: (value) => refresh(() => billingModel = value ?? 'daily'),
          ),
          TextField(controller: price, keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'السعر بأصغر وحدة للعملة')),
          TextField(controller: currency, textCapitalization: TextCapitalization.characters,
            decoration: const InputDecoration(labelText: 'رمز العملة (ISO 4217)')),
          SwitchListTile(contentPadding: EdgeInsets.zero, value: active,
            onChanged: (value) => refresh(() => active = value),
            title: const Text('تفعيل نموذج التسعير')),
        ])),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('إلغاء')),
          FilledButton(onPressed: () => Navigator.pop(dialogContext, {
            'placementId': id.text.trim().toLowerCase(), 'name': name.text.trim(),
            'billingModel': billingModel, 'priceMinor': int.tryParse(price.text.trim()),
            'currency': currency.text.trim().toUpperCase(), 'active': active,
          }), child: const Text('حفظ')),
        ],
      )),
    );
    id.dispose(); name.dispose(); price.dispose(); currency.dispose();
    if (result == null || !mounted) return;
    final placementId = result['placementId'] as String;
    final adName = result['name'] as String;
    final priceMinor = result['priceMinor'] as int?;
    final currencyCode = result['currency'] as String;
    if (!RegExp(r'^[a-z0-9][a-z0-9_-]{2,40}$').hasMatch(placementId) ||
        adName.length < 3 || priceMinor == null || priceMinor < 1 ||
        !RegExp(r'^[A-Z]{3}$').hasMatch(currencyCode)) {
      setState(() => _error = 'بيانات الموضع الإعلاني غير مكتملة أو غير صالحة. لم تُحفظ.');
      return;
    }
    setState(() {
      final value = {...result};
      if (index == null) {
        if (_ads.any((item) => item['placementId'] == placementId)) {
          _error = 'معرف الموضع الإعلاني مستخدم بالفعل.';
        } else { _ads = [..._ads, value]; }
      } else { _ads = [..._ads]..[index] = value; }
    });
  }

  Future<void> _save() async {
    if (_saving) return;
    final minText = _customMin.text.trim(), maxText = _customMax.text.trim();
    Map<String, int>? bounds;
    if (minText.isNotEmpty || maxText.isNotEmpty) {
      final minimum = int.tryParse(minText), maximum = int.tryParse(maxText);
      if (minimum == null || maximum == null || minimum < 1 || maximum < minimum) {
        setState(() => _error = 'أدخل الحد الأدنى والأقصى للكمية المخصصة معاً، أو اتركهما فارغين لتعطيلها.');
        return;
      }
      bounds = {'minCoins': minimum, 'maxCoins': maximum};
    }
    setState(() { _saving = true; _error = null; });
    try {
      final result = await _functions.httpsCallable('setOwnerEconomyPricing').call({
        'coinPackages': _packages, 'adPrices': _ads,
        'manualCoinPurchasesEnabled': _manualPurchasesEnabled,
        'paymentPolicy': {
          'coin_purchases': {'manualEnabled': _manualPurchasesEnabled, 'automatedEnabled': false},
          'featured_ads': {'manualEnabled': _manualFeaturedAdsEnabled, 'automatedEnabled': false},
          'public_ads': {'manualEnabled': false, 'automatedEnabled': false},
          'influencer_services': {'manualEnabled': false, 'automatedEnabled': false},
          'store_entitlements': {'manualEnabled': false, 'automatedEnabled': false},
        },
        'customCoinRequestBounds': bounds,
      });
      final data = Map<String, dynamic>.from(result.data as Map);
      if (!mounted) return;
      setState(() => _version = (data['version'] as num?)?.toInt() ?? _version);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('تم حفظ سياسة الاقتصاد. الإصدار: $_version')),
      );
      await _load();
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر حفظ سياسة الاقتصاد.');
    } finally { if (mounted) setState(() => _saving = false); }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('اقتصاد مودة والأسعار'),
      actions: [IconButton(onPressed: _loading || _saving ? null : _load, icon: const Icon(Icons.refresh))]),
    body: _loading ? const Center(child: CircularProgressIndicator()) : ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(
          crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(_configured ? 'إصدار السياسة: $_version' : 'لم تُهيأ سياسة اقتصادية بعد',
              style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            const Text('لا توجد أسعار أو كميات أو حدود افتراضية. يحدد المالك كل القيم بنفسه، ولا يبدأ الشراء عند غياب سياسة صالحة.'),
          ],
        ))),
        if (_error != null) Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
        Card(child: SwitchListTile(
          title: const Text('تفعيل طلبات شراء BetaCoins اليدوية'),
          subtitle: const Text('الإيقاف يمنع إنشاء طلبات جديدة. الدفع الإلكتروني الآلي غير مفعّل.'),
          value: _manualPurchasesEnabled,
          onChanged: _saving ? null : (value) => setState(() => _manualPurchasesEnabled = value),
        )),
        Card(child: SwitchListTile(
          title: const Text('استقبال دفعات الإعلانات اليدوية'),
          subtitle: const Text('يسمح للمالك بتسجيل دفعات المعلنين ومراجعتها. لا يفعّل الإعلان أو يطلقه تلقائياً.'),
          value: _manualFeaturedAdsEnabled,
          onChanged: _saving ? null : (value) => setState(() => _manualFeaturedAdsEnabled = value),
        )),
        const ListTile(
          dense: true,
          title: Text('الإعلانات العامة، خدمات المؤثرين، واستحقاقات المتجر'),
          subtitle: Text('تبقى وسائل الدفع اليدوية لهذه الخدمات متوقفة حتى اكتمال دوراتها. جميع وسائل الدفع الآلي متوقفة.'),
        ),
        Text('حدود طلب الكمية المخصصة', style: Theme.of(context).textTheme.titleLarge),
        TextField(controller: _customMin, enabled: !_saving, keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: 'الحد الأدنى لـ BetaCoins')),
        TextField(controller: _customMax, enabled: !_saving, keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: 'الحد الأقصى لـ BetaCoins',
            helperText: 'اترك الحقلين فارغين لتعطيل الطلبات المخصصة.')),
        const SizedBox(height: 16),
        Row(children: [
          Expanded(child: Text('باقات BetaCoins', style: Theme.of(context).textTheme.titleLarge)),
          IconButton(onPressed: _saving ? null : () => _editPackage(), icon: const Icon(Icons.add_circle_outline)),
        ]),
        if (_packages.isEmpty) const Text('لا توجد باقات محددة.'),
        ..._packages.asMap().entries.map((entry) {
          final index = entry.key, item = entry.value;
          return Card(child: ListTile(
            title: Text(item['name']?.toString() ?? item['packageId']?.toString() ?? 'باقة'),
            subtitle: Text('${item['coins']} BetaCoins • ${item['priceMinor']} ${item['currency']} (وحدات صغرى) • ${item['active'] == true ? 'مفعلة' : 'متوقفة'}'),
            trailing: Wrap(children: [
              IconButton(onPressed: _saving ? null : () => _editPackage(existing: item, index: index), icon: const Icon(Icons.edit_outlined)),
              IconButton(onPressed: _saving ? null : () => setState(() => _packages.removeAt(index)), icon: const Icon(Icons.delete_outline)),
            ]),
          ));
        }),
        const SizedBox(height: 16),
        Row(children: [
          Expanded(child: Text('تسعير المواضع الإعلانية', style: Theme.of(context).textTheme.titleLarge)),
          IconButton(onPressed: _saving ? null : () => _editAd(), icon: const Icon(Icons.add_circle_outline)),
        ]),
        if (_ads.isEmpty) const Text('لا توجد مواضع إعلانية مسعّرة.'),
        ..._ads.asMap().entries.map((entry) {
          final index = entry.key, item = entry.value;
          return Card(child: ListTile(
            title: Text(item['name']?.toString() ?? item['placementId']?.toString() ?? 'موضع إعلاني'),
            subtitle: Text('${item['billingModel']} • ${item['priceMinor']} ${item['currency']} (وحدات صغرى) • ${item['active'] == true ? 'مفعل' : 'متوقف'}'),
            trailing: Wrap(children: [
              IconButton(onPressed: _saving ? null : () => _editAd(existing: item, index: index), icon: const Icon(Icons.edit_outlined)),
              IconButton(onPressed: _saving ? null : () => setState(() => _ads.removeAt(index)), icon: const Icon(Icons.delete_outline)),
            ]),
          ));
        }),
        const SizedBox(height: 16),
        FilledButton.icon(onPressed: _saving ? null : _save,
          icon: const Icon(Icons.save_outlined),
          label: Text(_saving ? 'جارٍ الحفظ…' : 'حفظ سياسة الاقتصاد')),
      ],
    ),
  );
}
