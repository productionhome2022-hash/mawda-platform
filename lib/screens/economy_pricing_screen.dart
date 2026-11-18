import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

class EconomyPricingScreen extends StatefulWidget {
  const EconomyPricingScreen({super.key});

  @override
  State<EconomyPricingScreen> createState() => _EconomyPricingScreenState();
}

class _EconomyPricingScreenState extends State<EconomyPricingScreen> {
  final _functions = FirebaseFunctions.instance;
  final _audioCallTariff = TextEditingController();
  final _videoCallTariff = TextEditingController();
  final _emailRewardCoins = TextEditingController(text: '0');
  final _emailRewardCycleDays = TextEditingController(text: '90');
  bool _emailRewardEnabled = false;
  List<Map<String, dynamic>> _packages = [];
  List<Map<String, dynamic>> _ads = [];
  bool _loading = true;
  bool _saving = false;
  bool _manualPurchasesEnabled = false;
  bool _manualFeaturedAdsEnabled = false;
  bool _manualPublicAdsEnabled = false;
  bool _manualInfluencerServicesEnabled = false;
  bool _manualStoreEntitlementsEnabled = false;
  int _version = 0;
  String? _error;

  @override
  void dispose() {
    _audioCallTariff.dispose();
    _videoCallTariff.dispose();
    _emailRewardCoins.dispose();
    _emailRewardCycleDays.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() { _loading = true; _error = null; });
    try {
      final result = await _functions.httpsCallable('getOwnerEconomyPricing').call();
      final data = Map<String, dynamic>.from(result.data as Map);
      if (!mounted) return;
      setState(() {
        _packages = (data['coinPackages'] as List<dynamic>? ?? const [])
            .whereType<Map>().map((item) => Map<String, dynamic>.from(item)).toList();
        _ads = (data['adPrices'] as List<dynamic>? ?? const [])
            .whereType<Map>().map((item) => Map<String, dynamic>.from(item)).toList();
        _version = (data['version'] as num?)?.toInt() ?? 0;
        _manualPurchasesEnabled = data['manualCoinPurchasesEnabled'] == true;
        _manualFeaturedAdsEnabled = data['manualFeaturedAdsEnabled'] == true;
        final paymentPolicy = Map<String, dynamic>.from(data['paymentPolicy'] as Map? ?? const {});
        final publicAds = Map<String, dynamic>.from(paymentPolicy['public_ads'] as Map? ?? const {});
        final influencers = Map<String, dynamic>.from(paymentPolicy['influencer_services'] as Map? ?? const {});
        final store = Map<String, dynamic>.from(paymentPolicy['store_entitlements'] as Map? ?? const {});
        _manualPublicAdsEnabled = false;
        _manualInfluencerServicesEnabled = false;
        _manualStoreEntitlementsEnabled = false;
        final tariffs = Map<String, dynamic>.from(data['callTariffs'] as Map? ?? const {});
        _audioCallTariff.text = tariffs['audioTotalCoinsPerMinute']?.toString() ?? '';
        _videoCallTariff.text = tariffs['videoTotalCoinsPerMinute']?.toString() ?? '';
        final emailReward = Map<String, dynamic>.from(data['emailVerificationReward'] as Map? ?? const {});
        _emailRewardEnabled = emailReward['enabled'] == true;
        _emailRewardCoins.text = emailReward['rewardCoins']?.toString() ?? '0';
        _emailRewardCycleDays.text = emailReward['cycleDays']?.toString() ?? '90';
      });
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحميل إعدادات الاقتصاد.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحميل إعدادات الاقتصاد.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _save() async {
    if (_saving) return;
    final audioTariff = _audioCallTariff.text.trim().isEmpty ? null : int.tryParse(_audioCallTariff.text.trim());
    final videoTariff = _videoCallTariff.text.trim().isEmpty ? null : int.tryParse(_videoCallTariff.text.trim());
    final audioInputValid = _audioCallTariff.text.trim().isEmpty || (audioTariff != null && audioTariff > 0 && audioTariff.isEven);
    final videoInputValid = _videoCallTariff.text.trim().isEmpty || (videoTariff != null && videoTariff > 0 && videoTariff.isEven);
    final emailReward = int.tryParse(_emailRewardCoins.text.trim());
    final emailCycleDays = int.tryParse(_emailRewardCycleDays.text.trim());
    if (!audioInputValid || !videoInputValid || emailReward == null || emailReward < 0 || emailReward > 1000000 ||
        emailCycleDays == null || emailCycleDays < 1 || emailCycleDays > 3650 ||
        (_emailRewardEnabled && emailReward < 1)) {
      setState(() => _error = 'تعرفة المكالمة يجب أن تكون رقماً صحيحاً موجباً يقبل القسمة على 2 دون باقٍ، أو اتركها فارغة لإيقاف التعرفة.');
      return;
    }
    setState(() { _saving = true; _error = null; });
    try {
      final result = await _functions.httpsCallable('setOwnerEconomyPricing').call({
        'coinPackages': _packages,
        'adPrices': _ads,
        'callTariffs': {
          'audioTotalCoinsPerMinute': audioTariff,
          'videoTotalCoinsPerMinute': videoTariff,
        },
        'emailVerificationReward': {
          'enabled': _emailRewardEnabled,
          'rewardCoins': emailReward,
          'cycleDays': emailCycleDays,
        },
        'manualCoinPurchasesEnabled': _manualPurchasesEnabled,
        'manualFeaturedAdsEnabled': _manualFeaturedAdsEnabled,
        'paymentPolicy': {
          'coin_purchases': {'manualEnabled': _manualPurchasesEnabled, 'automatedEnabled': false},
          'featured_ads': {'manualEnabled': _manualFeaturedAdsEnabled, 'automatedEnabled': false},
          'public_ads': {'manualEnabled': false, 'automatedEnabled': false},
          'influencer_services': {'manualEnabled': false, 'automatedEnabled': false},
          'store_entitlements': {'manualEnabled': false, 'automatedEnabled': false},
        },
        'expectedVersion': _version,
      });
      final data = Map<String, dynamic>.from(result.data as Map);
      if (!mounted) return;
      setState(() => _version = (data['version'] as num?)?.toInt() ?? _version);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('تم حفظ الأسعار. إصدار السياسة: $_version')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (!mounted) return;
      setState(() => _error = error.message ?? 'تعذر حفظ الأسعار.');
      if (error.code == 'aborted') {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تغيرت إعدادات الاقتصاد. حدّث البيانات قبل إعادة الحفظ.')),
        );
      }
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر حفظ إعدادات الاقتصاد.');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _addPackage() async {
    final id = TextEditingController();
    final name = TextEditingController();
    final coins = TextEditingController();
    final price = TextEditingController();
    final currency = TextEditingController();
    try {
      final accepted = await showDialog<bool>(
        context: context,
        builder: (dialogContext) => AlertDialog(
          title: const Text('إضافة باقة BetaCoins'),
          content: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              TextField(controller: id, decoration: const InputDecoration(labelText: 'معرف الباقة')),
              TextField(controller: name, decoration: const InputDecoration(labelText: 'اسم الباقة')),
              TextField(controller: coins, keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'عدد BetaCoins')),
              TextField(controller: price, keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'السعر بوحدة العملة الصغرى')),
              TextField(controller: currency, textCapitalization: TextCapitalization.characters,
                decoration: const InputDecoration(labelText: 'رمز العملة ISO 4217 (3 أحرف)')),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('إلغاء')),
            FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('إضافة')),
          ],
        ),
      );
      if (accepted != true || !mounted) return;
      final packageId = id.text.trim();
      final packageName = name.text.trim();
      final amount = int.tryParse(coins.text.trim());
      final priceMinor = int.tryParse(price.text.trim());
      final currencyCode = currency.text.trim().toUpperCase();
      if (!RegExp(r'^[A-Z]{3}
          packageName.length < 3 || packageName.length > 80 ||
          amount == null || amount < 1 || amount > 1000000000 ||
          priceMinor == null || priceMinor < 1 || priceMinor > 100000000) {
        setState(() => _error = 'بيانات الباقة غير صالحة. أدخل معرفاً واسمًا وكمية وسعراً صحيحاً.');
      } else if (_packages.length >= 30) {
        setState(() => _error = 'الحد الأقصى لعدد الباقات هو 30.');
      } else if (_packages.any((item) => item['packageId'] == packageId)) {
        setState(() => _error = 'معرف الباقة مستخدم بالفعل.');
      } else {
        setState(() {
          _packages.add({
            'packageId': packageId, 'name': packageName, 'coins': amount,
            'priceMinor': priceMinor, 'currency': currencyCode, 'active': true,
          });
          _error = null;
        });
      }
    } finally {
      id.dispose(); name.dispose(); coins.dispose(); price.dispose(); currency.dispose();
    }
  }

  Future<void> _addAdPrice() async {
    final id = TextEditingController();
    final name = TextEditingController();
    final price = TextEditingController();
    final currency = TextEditingController();
    var billingModel = 'cpm';
    try {
      final accepted = await showDialog<bool>(
        context: context,
        builder: (dialogContext) => StatefulBuilder(
          builder: (dialogContext, setDialogState) => AlertDialog(
            title: const Text('إضافة سعر موضع إعلاني'),
            content: SingleChildScrollView(
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                TextField(controller: id, decoration: const InputDecoration(labelText: 'معرف الموضع')),
                TextField(controller: name, decoration: const InputDecoration(labelText: 'اسم الموضع')),
                DropdownButtonFormField<String>(
                  initialValue: billingModel,
                  decoration: const InputDecoration(labelText: 'نموذج الفوترة'),
                  items: const [
                    DropdownMenuItem(value: 'cpm', child: Text('CPM')),
                    DropdownMenuItem(value: 'cpc', child: Text('CPC')),
                    DropdownMenuItem(value: 'daily', child: Text('يومي')),
                  ],
                  onChanged: (value) => setDialogState(() => billingModel = value ?? billingModel),
                ),
                TextField(controller: price, keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'السعر بوحدة العملة الصغرى')),
                TextField(controller: currency, textCapitalization: TextCapitalization.characters,
                  decoration: const InputDecoration(labelText: 'رمز العملة ISO 4217 (3 أحرف)')),
              ]),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('إلغاء')),
              FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('إضافة')),
            ],
          ),
        ),
      );
      if (accepted != true || !mounted) return;
      final placementId = id.text.trim();
      final placementName = name.text.trim();
      final priceMinor = int.tryParse(price.text.trim());
      final currencyCode = currency.text.trim().toUpperCase();
      if (!RegExp(r'^[A-Z]{3}
          placementName.length < 3 || placementName.length > 80 ||
          priceMinor == null || priceMinor < 1 || priceMinor > 100000000) {
        setState(() => _error = 'بيانات السعر الإعلاني غير صالحة.');
      } else if (_ads.length >= 30) {
        setState(() => _error = 'الحد الأقصى لعدد أسعار الإعلانات هو 30.');
      } else if (_ads.any((item) => item['placementId'] == placementId)) {
        setState(() => _error = 'معرف الموضع الإعلاني مستخدم بالفعل.');
      } else {
        setState(() {
          _ads.add({
            'placementId': placementId, 'name': placementName,
            'billingModel': billingModel, 'priceMinor': priceMinor,
            'currency': currencyCode, 'active': true,
          });
          _error = null;
        });
      }
    } finally {
      id.dispose(); name.dispose(); price.dispose(); currency.dispose();
    }
  }

  Widget _priceField({
    required String label,
    required int value,
    required ValueChanged<int> onChanged,
  }) => SizedBox(
    width: 125,
    child: TextFormField(
      key: ValueKey(label),
      initialValue: value.toString(),
      enabled: !_saving,
      keyboardType: TextInputType.number,
      decoration: InputDecoration(labelText: label, suffixText: 'وحدة صغرى'),
      onChanged: (text) {
        final parsed = int.tryParse(text);
        if (parsed != null && parsed > 0 && parsed <= 100000000) onChanged(parsed);
      },
    ),
  );

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('اقتصاد مودة والأسعار'),
      actions: [
        IconButton(
          tooltip: 'تحديث الأسعار',
          onPressed: _loading || _saving ? null : _load,
          icon: const Icon(Icons.refresh),
        ),
      ],
    ),
    body: _loading
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('إعدادات قابلة للتعديل • الإصدار $_version',
                        style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 8),
                      const Text('الأسعار النقدية باليورو (السنت). هذه جداول تسعير فقط؛ الدفع النقدي وإصدار الكوينز مقابل الدفع معطلان حتى ربط مزود دفع مرخص واختباره.'),
                    ],
                  ),
                ),
              ),
              if (_error != null)
                Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('تعرفة المكالمات الثنائية', style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 6),
                      const Text('أدخل السعر الإجمالي للدقيقة الواحدة. يقسمه الخادم تلقائياً بالتساوي بين الطرفين. اترك الحقل فارغاً لإبقاء التعرفة غير مهيأة. لا يتم تحصيل أي رسوم حتى اكتمال نظام الحصص والتسوية الذرية.'),
                      TextField(
                        controller: _audioCallTariff,
                        enabled: !_saving,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'الصوت — إجمالي BetaCoins للدقيقة'),
                      ),
                      TextField(
                        controller: _videoCallTariff,
                        enabled: !_saving,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'المرئي — إجمالي BetaCoins للدقيقة'),
                      ),
                      const SizedBox(height: 6),
                      const Text('شرط الحفظ: عدد صحيح موجب زوجي فقط؛ لا تقريب ولا كسور ولا توزيع للباقي.'),
                    ],
                  ),
                ),
              ),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('مكافأة التحقق من البريد', style: Theme.of(context).textTheme.titleMedium),
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('تفعيل مكافأة البريد'),
                      subtitle: const Text('لا تُمنح أي كوينز تلقائياً ما لم يفعّل المالك المكافأة ويحدد قيمتها.'),
                      value: _emailRewardEnabled,
                      onChanged: _saving ? null : (value) => setState(() => _emailRewardEnabled = value),
                    ),
                    TextField(controller: _emailRewardCoins, enabled: !_saving, keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'مبلغ المكافأة بالكوينز')),
                    TextField(controller: _emailRewardCycleDays, enabled: !_saving, keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'مدة دورة التحقق بالأيام')),
                  ]),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('تفعيل طلبات شراء الكوينز اليدوية'),
                  subtitle: const Text('عند الإيقاف لن يتمكن الأعضاء من إنشاء طلبات جديدة. الدفع الإلكتروني الآلي غير متاح حالياً حتى اعتماد مزود وربطه خادمياً.'),
                  value: _manualPurchasesEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualPurchasesEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('تفعيل الدفع اليدوي الخارجي للإعلانات المميزة'),
                  subtitle: const Text('يتفاوض المالك مع المعلن خارج المنصة، ويتحقق من وصول المبلغ بنفسه، ثم يسجل الحركة من لوحة الإعلانات. إعدادات الطلبات الجديدة لا تغير لقطة الدفع للحملات القائمة.'),
                  value: _manualFeaturedAdsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualFeaturedAdsEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي للإعلانات العامة'),
                  subtitle: const Text('غير متاح حالياً: يلزم استكمال دورة الطلب والمراجعة والتحصيل والتدقيق قبل التفعيل.'),
                  value: _manualPublicAdsEnabled,
                  onChanged: null,
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي لخدمات المؤثرين'),
                  subtitle: const Text('غير متاح حالياً: يلزم ربط الطلبات بالعقود والموافقات والتحقق المالي والتدقيق.'),
                  value: _manualInfluencerServicesEnabled,
                  onChanged: null,
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي لاستحقاقات المتجر'),
                  subtitle: const Text('غير متاح حالياً: يلزم استكمال طلب الشراء النقدي وإثبات الدفع ومنح الاستحقاق ذرياً.'),
                  value: _manualStoreEntitlementsEnabled,
                  onChanged: null,
                ),
              ),
              const Card(
                child: ListTile(
                  leading: Icon(Icons.lock_outline),
                  title: Text('الدفع الإلكتروني الآلي — مغلق'),
                  subtitle: Text('مغلق لجميع الخدمات حتى اختيار مزود، ودمج إنشاء جلسة الدفع والتحقق من توقيع Webhook والمبلغ والعملة والطلب، ثم الاختبار وموافقة المالك. لا يمكن تفعيله من هذه اللوحة حالياً.'),
                ),
              ),
              Text('باقات BetaCoins', style: Theme.of(context).textTheme.titleLarge),
              Align(
                alignment: Alignment.centerLeft,
                child: OutlinedButton.icon(
                  onPressed: _saving ? null : _addPackage,
                  icon: const Icon(Icons.add),
                  label: const Text('إضافة باقة يحددها المالك'),
                ),
              ),
              if (_packages.isEmpty)
                const Text('لم يحدد المالك أي باقات بعد. لن تظهر باقات شراء للأعضاء قبل إضافتها وحفظها.'),
              ..._packages.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item['name'] as String? ?? item['packageId'] as String? ?? 'باقة'),
                              Text('${item['coins']} كوين • ${item['priceMinor']} ${item['currency']}'),
                            ],
                          ),
                        ),
                        _priceField(
                          label: 'السعر',
                          value: (item['priceMinor'] as num?)?.toInt() ?? 1,
                          onChanged: (value) => setState(() =>
                              _packages[index] = {...item, 'priceMinor': value}),
                        ),
                        Switch(
                          value: item['active'] == true,
                          onChanged: _saving ? null : (value) => setState(() =>
                              _packages[index] = {...item, 'active': value}),
                        ),
                        IconButton(
                          tooltip: 'حذف الباقة',
                          onPressed: _saving ? null : () =>
                              setState(() => _packages.removeAt(index)),
                          icon: const Icon(Icons.delete_outline),
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 12),
              Text('أسعار الإعلانات', style: Theme.of(context).textTheme.titleLarge),
              Align(
                alignment: Alignment.centerLeft,
                child: OutlinedButton.icon(
                  onPressed: _saving ? null : _addAdPrice,
                  icon: const Icon(Icons.add),
                  label: const Text('إضافة موضع إعلاني وسعره'),
                ),
              ),
              if (_ads.isEmpty)
                const Text('لم يحدد المالك أسعار مواضع الإعلانات بعد.'),
              ..._ads.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item['name'] as String? ?? item['placementId'] as String? ?? 'موضع إعلاني'),
                              Text('نموذج الفوترة: ${item['billingModel']} • ${item['priceMinor']} ${item['currency']}'),
                            ],
                          ),
                        ),
                        _priceField(
                          label: 'السعر',
                          value: (item['priceMinor'] as num?)?.toInt() ?? 1,
                          onChanged: (value) => setState(() =>
                              _ads[index] = {...item, 'priceMinor': value}),
                        ),
                        Switch(
                          value: item['active'] == true,
                          onChanged: _saving ? null : (value) => setState(() =>
                              _ads[index] = {...item, 'active': value}),
                        ),
                        IconButton(
                          tooltip: 'حذف السعر',
                          onPressed: _saving ? null : () =>
                              setState(() => _ads.removeAt(index)),
                          icon: const Icon(Icons.delete_outline),
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 12),
              FilledButton.icon(
                onPressed: _saving ? null : _save,
                icon: _saving
                    ? const SizedBox(width: 18, height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.save_outlined),
                label: const Text('حفظ أسعار الاقتصاد'),
              ),
            ],
          ),
  );
}
).hasMatch(currencyCode) ||
          !RegExp(r'^[a-z0-9][a-z0-9_-]{2,40}
          packageName.length < 3 || packageName.length > 80 ||
          amount == null || amount < 1 || amount > 1000000000 ||
          priceMinor == null || priceMinor < 1 || priceMinor > 100000000) {
        setState(() => _error = 'بيانات الباقة غير صالحة. أدخل معرفاً واسمًا وكمية وسعراً صحيحاً.');
      } else if (_packages.length >= 30) {
        setState(() => _error = 'الحد الأقصى لعدد الباقات هو 30.');
      } else if (_packages.any((item) => item['packageId'] == packageId)) {
        setState(() => _error = 'معرف الباقة مستخدم بالفعل.');
      } else {
        setState(() {
          _packages.add({
            'packageId': packageId, 'name': packageName, 'coins': amount,
            'priceMinor': priceMinor, 'currency': 'EUR', 'active': true,
          });
          _error = null;
        });
      }
    } finally {
      id.dispose(); name.dispose(); coins.dispose(); price.dispose();
    }
  }

  Future<void> _addAdPrice() async {
    final id = TextEditingController();
    final name = TextEditingController();
    final price = TextEditingController();
    var billingModel = 'cpm';
    try {
      final accepted = await showDialog<bool>(
        context: context,
        builder: (dialogContext) => StatefulBuilder(
          builder: (dialogContext, setDialogState) => AlertDialog(
            title: const Text('إضافة سعر موضع إعلاني'),
            content: SingleChildScrollView(
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                TextField(controller: id, decoration: const InputDecoration(labelText: 'معرف الموضع')),
                TextField(controller: name, decoration: const InputDecoration(labelText: 'اسم الموضع')),
                DropdownButtonFormField<String>(
                  initialValue: billingModel,
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
              ]),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('إلغاء')),
              FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('إضافة')),
            ],
          ),
        ),
      );
      if (accepted != true || !mounted) return;
      final placementId = id.text.trim();
      final placementName = name.text.trim();
      final priceMinor = int.tryParse(price.text.trim());
      if (!RegExp(r'^[a-z0-9][a-z0-9_-]{2,40}$').hasMatch(placementId) ||
          placementName.length < 3 || placementName.length > 80 ||
          priceMinor == null || priceMinor < 1 || priceMinor > 100000000) {
        setState(() => _error = 'بيانات السعر الإعلاني غير صالحة.');
      } else if (_ads.length >= 30) {
        setState(() => _error = 'الحد الأقصى لعدد أسعار الإعلانات هو 30.');
      } else if (_ads.any((item) => item['placementId'] == placementId)) {
        setState(() => _error = 'معرف الموضع الإعلاني مستخدم بالفعل.');
      } else {
        setState(() {
          _ads.add({
            'placementId': placementId, 'name': placementName,
            'billingModel': billingModel, 'priceMinor': priceMinor,
            'currency': 'EUR', 'active': true,
          });
          _error = null;
        });
      }
    } finally {
      id.dispose(); name.dispose(); price.dispose();
    }
  }

  Widget _priceField({
    required String label,
    required int value,
    required ValueChanged<int> onChanged,
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
    appBar: AppBar(
      title: const Text('اقتصاد مودة والأسعار'),
      actions: [
        IconButton(
          tooltip: 'تحديث الأسعار',
          onPressed: _loading || _saving ? null : _load,
          icon: const Icon(Icons.refresh),
        ),
      ],
    ),
    body: _loading
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('إعدادات قابلة للتعديل • الإصدار $_version',
                        style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 8),
                      const Text('الأسعار النقدية باليورو (السنت). هذه جداول تسعير فقط؛ الدفع النقدي وإصدار الكوينز مقابل الدفع معطلان حتى ربط مزود دفع مرخص واختباره.'),
                    ],
                  ),
                ),
              ),
              if (_error != null)
                Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('تعرفة المكالمات الثنائية', style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 6),
                      const Text('أدخل السعر الإجمالي للدقيقة الواحدة. يقسمه الخادم تلقائياً بالتساوي بين الطرفين. اترك الحقل فارغاً لإبقاء التعرفة غير مهيأة. لا يتم تحصيل أي رسوم حتى اكتمال نظام الحصص والتسوية الذرية.'),
                      TextField(
                        controller: _audioCallTariff,
                        enabled: !_saving,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'الصوت — إجمالي BetaCoins للدقيقة'),
                      ),
                      TextField(
                        controller: _videoCallTariff,
                        enabled: !_saving,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'المرئي — إجمالي BetaCoins للدقيقة'),
                      ),
                      const SizedBox(height: 6),
                      const Text('شرط الحفظ: عدد صحيح موجب زوجي فقط؛ لا تقريب ولا كسور ولا توزيع للباقي.'),
                    ],
                  ),
                ),
              ),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('مكافأة التحقق من البريد', style: Theme.of(context).textTheme.titleMedium),
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('تفعيل مكافأة البريد'),
                      subtitle: const Text('لا تُمنح أي كوينز تلقائياً ما لم يفعّل المالك المكافأة ويحدد قيمتها.'),
                      value: _emailRewardEnabled,
                      onChanged: _saving ? null : (value) => setState(() => _emailRewardEnabled = value),
                    ),
                    TextField(controller: _emailRewardCoins, enabled: !_saving, keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'مبلغ المكافأة بالكوينز')),
                    TextField(controller: _emailRewardCycleDays, enabled: !_saving, keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'مدة دورة التحقق بالأيام')),
                  ]),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('تفعيل طلبات شراء الكوينز اليدوية'),
                  subtitle: const Text('عند الإيقاف لن يتمكن الأعضاء من إنشاء طلبات جديدة. الدفع الإلكتروني الآلي غير متاح حالياً حتى اعتماد مزود وربطه خادمياً.'),
                  value: _manualPurchasesEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualPurchasesEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('تفعيل الدفع اليدوي الخارجي للإعلانات المميزة'),
                  subtitle: const Text('يتفاوض المالك مع المعلن خارج المنصة، ويتحقق من وصول المبلغ بنفسه، ثم يسجل الحركة من لوحة الإعلانات. إعدادات الطلبات الجديدة لا تغير لقطة الدفع للحملات القائمة.'),
                  value: _manualFeaturedAdsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualFeaturedAdsEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي للإعلانات العامة'),
                  subtitle: const Text('تفعيل استقبال الطلبات اليدوية لهذه الخدمة فقط؛ لا يفعّل النشر أو التحصيل تلقائياً.'),
                  value: _manualPublicAdsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualPublicAdsEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي لخدمات المؤثرين'),
                  subtitle: const Text('تفعيل مسار الطلب والتفاوض اليدوي لهذه الخدمة فقط؛ العقود والموافقات تبقى إلزامية.'),
                  value: _manualInfluencerServicesEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualInfluencerServicesEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي لاستحقاقات المتجر'),
                  subtitle: const Text('إعداد مستقل للطلبات النقدية؛ مشتريات الكوينز الداخلية لا تتأثر بهذا الخيار.'),
                  value: _manualStoreEntitlementsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualStoreEntitlementsEnabled = value),
                ),
              ),
              const Card(
                child: ListTile(
                  leading: Icon(Icons.lock_outline),
                  title: Text('الدفع الإلكتروني الآلي — مغلق'),
                  subtitle: Text('مغلق لجميع الخدمات حتى اختيار مزود، ودمج إنشاء جلسة الدفع والتحقق من توقيع Webhook والمبلغ والعملة والطلب، ثم الاختبار وموافقة المالك. لا يمكن تفعيله من هذه اللوحة حالياً.'),
                ),
              ),
              Text('باقات BetaCoins', style: Theme.of(context).textTheme.titleLarge),
              Align(
                alignment: Alignment.centerLeft,
                child: OutlinedButton.icon(
                  onPressed: _saving ? null : _addPackage,
                  icon: const Icon(Icons.add),
                  label: const Text('إضافة باقة يحددها المالك'),
                ),
              ),
              if (_packages.isEmpty)
                const Text('لم يحدد المالك أي باقات بعد. لن تظهر باقات شراء للأعضاء قبل إضافتها وحفظها.'),
              ..._packages.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item['name'] as String? ?? item['packageId'] as String? ?? 'باقة'),
                              Text('${item['coins']} كوين • EUR'),
                            ],
                          ),
                        ),
                        _priceField(
                          label: 'السعر',
                          value: (item['priceMinor'] as num?)?.toInt() ?? 1,
                          onChanged: (value) => setState(() =>
                              _packages[index] = {...item, 'priceMinor': value}),
                        ),
                        Switch(
                          value: item['active'] == true,
                          onChanged: _saving ? null : (value) => setState(() =>
                              _packages[index] = {...item, 'active': value}),
                        ),
                        IconButton(
                          tooltip: 'حذف الباقة',
                          onPressed: _saving ? null : () =>
                              setState(() => _packages.removeAt(index)),
                          icon: const Icon(Icons.delete_outline),
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 12),
              Text('أسعار الإعلانات', style: Theme.of(context).textTheme.titleLarge),
              Align(
                alignment: Alignment.centerLeft,
                child: OutlinedButton.icon(
                  onPressed: _saving ? null : _addAdPrice,
                  icon: const Icon(Icons.add),
                  label: const Text('إضافة موضع إعلاني وسعره'),
                ),
              ),
              if (_ads.isEmpty)
                const Text('لم يحدد المالك أسعار مواضع الإعلانات بعد.'),
              ..._ads.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item['name'] as String? ?? item['placementId'] as String? ?? 'موضع إعلاني'),
                              Text('نموذج الفوترة: ${item['billingModel']} • EUR'),
                            ],
                          ),
                        ),
                        _priceField(
                          label: 'السعر',
                          value: (item['priceMinor'] as num?)?.toInt() ?? 1,
                          onChanged: (value) => setState(() =>
                              _ads[index] = {...item, 'priceMinor': value}),
                        ),
                        Switch(
                          value: item['active'] == true,
                          onChanged: _saving ? null : (value) => setState(() =>
                              _ads[index] = {...item, 'active': value}),
                        ),
                        IconButton(
                          tooltip: 'حذف السعر',
                          onPressed: _saving ? null : () =>
                              setState(() => _ads.removeAt(index)),
                          icon: const Icon(Icons.delete_outline),
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 12),
              FilledButton.icon(
                onPressed: _saving ? null : _save,
                icon: _saving
                    ? const SizedBox(width: 18, height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.save_outlined),
                label: const Text('حفظ أسعار الاقتصاد'),
              ),
            ],
          ),
  );
}
).hasMatch(packageId) ||
          packageName.length < 3 || packageName.length > 80 ||
          amount == null || amount < 1 || amount > 1000000000 ||
          priceMinor == null || priceMinor < 1 || priceMinor > 100000000) {
        setState(() => _error = 'بيانات الباقة غير صالحة. أدخل معرفاً واسمًا وكمية وسعراً صحيحاً.');
      } else if (_packages.length >= 30) {
        setState(() => _error = 'الحد الأقصى لعدد الباقات هو 30.');
      } else if (_packages.any((item) => item['packageId'] == packageId)) {
        setState(() => _error = 'معرف الباقة مستخدم بالفعل.');
      } else {
        setState(() {
          _packages.add({
            'packageId': packageId, 'name': packageName, 'coins': amount,
            'priceMinor': priceMinor, 'currency': 'EUR', 'active': true,
          });
          _error = null;
        });
      }
    } finally {
      id.dispose(); name.dispose(); coins.dispose(); price.dispose();
    }
  }

  Future<void> _addAdPrice() async {
    final id = TextEditingController();
    final name = TextEditingController();
    final price = TextEditingController();
    var billingModel = 'cpm';
    try {
      final accepted = await showDialog<bool>(
        context: context,
        builder: (dialogContext) => StatefulBuilder(
          builder: (dialogContext, setDialogState) => AlertDialog(
            title: const Text('إضافة سعر موضع إعلاني'),
            content: SingleChildScrollView(
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                TextField(controller: id, decoration: const InputDecoration(labelText: 'معرف الموضع')),
                TextField(controller: name, decoration: const InputDecoration(labelText: 'اسم الموضع')),
                DropdownButtonFormField<String>(
                  initialValue: billingModel,
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
              ]),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('إلغاء')),
              FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('إضافة')),
            ],
          ),
        ),
      );
      if (accepted != true || !mounted) return;
      final placementId = id.text.trim();
      final placementName = name.text.trim();
      final priceMinor = int.tryParse(price.text.trim());
      if (!RegExp(r'^[a-z0-9][a-z0-9_-]{2,40}$').hasMatch(placementId) ||
          placementName.length < 3 || placementName.length > 80 ||
          priceMinor == null || priceMinor < 1 || priceMinor > 100000000) {
        setState(() => _error = 'بيانات السعر الإعلاني غير صالحة.');
      } else if (_ads.length >= 30) {
        setState(() => _error = 'الحد الأقصى لعدد أسعار الإعلانات هو 30.');
      } else if (_ads.any((item) => item['placementId'] == placementId)) {
        setState(() => _error = 'معرف الموضع الإعلاني مستخدم بالفعل.');
      } else {
        setState(() {
          _ads.add({
            'placementId': placementId, 'name': placementName,
            'billingModel': billingModel, 'priceMinor': priceMinor,
            'currency': 'EUR', 'active': true,
          });
          _error = null;
        });
      }
    } finally {
      id.dispose(); name.dispose(); price.dispose();
    }
  }

  Widget _priceField({
    required String label,
    required int value,
    required ValueChanged<int> onChanged,
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
    appBar: AppBar(
      title: const Text('اقتصاد مودة والأسعار'),
      actions: [
        IconButton(
          tooltip: 'تحديث الأسعار',
          onPressed: _loading || _saving ? null : _load,
          icon: const Icon(Icons.refresh),
        ),
      ],
    ),
    body: _loading
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('إعدادات قابلة للتعديل • الإصدار $_version',
                        style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 8),
                      const Text('الأسعار النقدية باليورو (السنت). هذه جداول تسعير فقط؛ الدفع النقدي وإصدار الكوينز مقابل الدفع معطلان حتى ربط مزود دفع مرخص واختباره.'),
                    ],
                  ),
                ),
              ),
              if (_error != null)
                Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('تعرفة المكالمات الثنائية', style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 6),
                      const Text('أدخل السعر الإجمالي للدقيقة الواحدة. يقسمه الخادم تلقائياً بالتساوي بين الطرفين. اترك الحقل فارغاً لإبقاء التعرفة غير مهيأة. لا يتم تحصيل أي رسوم حتى اكتمال نظام الحصص والتسوية الذرية.'),
                      TextField(
                        controller: _audioCallTariff,
                        enabled: !_saving,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'الصوت — إجمالي BetaCoins للدقيقة'),
                      ),
                      TextField(
                        controller: _videoCallTariff,
                        enabled: !_saving,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'المرئي — إجمالي BetaCoins للدقيقة'),
                      ),
                      const SizedBox(height: 6),
                      const Text('شرط الحفظ: عدد صحيح موجب زوجي فقط؛ لا تقريب ولا كسور ولا توزيع للباقي.'),
                    ],
                  ),
                ),
              ),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('مكافأة التحقق من البريد', style: Theme.of(context).textTheme.titleMedium),
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('تفعيل مكافأة البريد'),
                      subtitle: const Text('لا تُمنح أي كوينز تلقائياً ما لم يفعّل المالك المكافأة ويحدد قيمتها.'),
                      value: _emailRewardEnabled,
                      onChanged: _saving ? null : (value) => setState(() => _emailRewardEnabled = value),
                    ),
                    TextField(controller: _emailRewardCoins, enabled: !_saving, keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'مبلغ المكافأة بالكوينز')),
                    TextField(controller: _emailRewardCycleDays, enabled: !_saving, keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'مدة دورة التحقق بالأيام')),
                  ]),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('تفعيل طلبات شراء الكوينز اليدوية'),
                  subtitle: const Text('عند الإيقاف لن يتمكن الأعضاء من إنشاء طلبات جديدة. الدفع الإلكتروني الآلي غير متاح حالياً حتى اعتماد مزود وربطه خادمياً.'),
                  value: _manualPurchasesEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualPurchasesEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('تفعيل الدفع اليدوي الخارجي للإعلانات المميزة'),
                  subtitle: const Text('يتفاوض المالك مع المعلن خارج المنصة، ويتحقق من وصول المبلغ بنفسه، ثم يسجل الحركة من لوحة الإعلانات. إعدادات الطلبات الجديدة لا تغير لقطة الدفع للحملات القائمة.'),
                  value: _manualFeaturedAdsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualFeaturedAdsEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي للإعلانات العامة'),
                  subtitle: const Text('تفعيل استقبال الطلبات اليدوية لهذه الخدمة فقط؛ لا يفعّل النشر أو التحصيل تلقائياً.'),
                  value: _manualPublicAdsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualPublicAdsEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي لخدمات المؤثرين'),
                  subtitle: const Text('تفعيل مسار الطلب والتفاوض اليدوي لهذه الخدمة فقط؛ العقود والموافقات تبقى إلزامية.'),
                  value: _manualInfluencerServicesEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualInfluencerServicesEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي لاستحقاقات المتجر'),
                  subtitle: const Text('إعداد مستقل للطلبات النقدية؛ مشتريات الكوينز الداخلية لا تتأثر بهذا الخيار.'),
                  value: _manualStoreEntitlementsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualStoreEntitlementsEnabled = value),
                ),
              ),
              const Card(
                child: ListTile(
                  leading: Icon(Icons.lock_outline),
                  title: Text('الدفع الإلكتروني الآلي — مغلق'),
                  subtitle: Text('مغلق لجميع الخدمات حتى اختيار مزود، ودمج إنشاء جلسة الدفع والتحقق من توقيع Webhook والمبلغ والعملة والطلب، ثم الاختبار وموافقة المالك. لا يمكن تفعيله من هذه اللوحة حالياً.'),
                ),
              ),
              Text('باقات BetaCoins', style: Theme.of(context).textTheme.titleLarge),
              Align(
                alignment: Alignment.centerLeft,
                child: OutlinedButton.icon(
                  onPressed: _saving ? null : _addPackage,
                  icon: const Icon(Icons.add),
                  label: const Text('إضافة باقة يحددها المالك'),
                ),
              ),
              if (_packages.isEmpty)
                const Text('لم يحدد المالك أي باقات بعد. لن تظهر باقات شراء للأعضاء قبل إضافتها وحفظها.'),
              ..._packages.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item['name'] as String? ?? item['packageId'] as String? ?? 'باقة'),
                              Text('${item['coins']} كوين • EUR'),
                            ],
                          ),
                        ),
                        _priceField(
                          label: 'السعر',
                          value: (item['priceMinor'] as num?)?.toInt() ?? 1,
                          onChanged: (value) => setState(() =>
                              _packages[index] = {...item, 'priceMinor': value}),
                        ),
                        Switch(
                          value: item['active'] == true,
                          onChanged: _saving ? null : (value) => setState(() =>
                              _packages[index] = {...item, 'active': value}),
                        ),
                        IconButton(
                          tooltip: 'حذف الباقة',
                          onPressed: _saving ? null : () =>
                              setState(() => _packages.removeAt(index)),
                          icon: const Icon(Icons.delete_outline),
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 12),
              Text('أسعار الإعلانات', style: Theme.of(context).textTheme.titleLarge),
              Align(
                alignment: Alignment.centerLeft,
                child: OutlinedButton.icon(
                  onPressed: _saving ? null : _addAdPrice,
                  icon: const Icon(Icons.add),
                  label: const Text('إضافة موضع إعلاني وسعره'),
                ),
              ),
              if (_ads.isEmpty)
                const Text('لم يحدد المالك أسعار مواضع الإعلانات بعد.'),
              ..._ads.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item['name'] as String? ?? item['placementId'] as String? ?? 'موضع إعلاني'),
                              Text('نموذج الفوترة: ${item['billingModel']} • EUR'),
                            ],
                          ),
                        ),
                        _priceField(
                          label: 'السعر',
                          value: (item['priceMinor'] as num?)?.toInt() ?? 1,
                          onChanged: (value) => setState(() =>
                              _ads[index] = {...item, 'priceMinor': value}),
                        ),
                        Switch(
                          value: item['active'] == true,
                          onChanged: _saving ? null : (value) => setState(() =>
                              _ads[index] = {...item, 'active': value}),
                        ),
                        IconButton(
                          tooltip: 'حذف السعر',
                          onPressed: _saving ? null : () =>
                              setState(() => _ads.removeAt(index)),
                          icon: const Icon(Icons.delete_outline),
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 12),
              FilledButton.icon(
                onPressed: _saving ? null : _save,
                icon: _saving
                    ? const SizedBox(width: 18, height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.save_outlined),
                label: const Text('حفظ أسعار الاقتصاد'),
              ),
            ],
          ),
  );
}
).hasMatch(currencyCode) ||
          !RegExp(r'^[a-z0-9][a-z0-9_-]{2,40}
          placementName.length < 3 || placementName.length > 80 ||
          priceMinor == null || priceMinor < 1 || priceMinor > 100000000) {
        setState(() => _error = 'بيانات السعر الإعلاني غير صالحة.');
      } else if (_ads.length >= 30) {
        setState(() => _error = 'الحد الأقصى لعدد أسعار الإعلانات هو 30.');
      } else if (_ads.any((item) => item['placementId'] == placementId)) {
        setState(() => _error = 'معرف الموضع الإعلاني مستخدم بالفعل.');
      } else {
        setState(() {
          _ads.add({
            'placementId': placementId, 'name': placementName,
            'billingModel': billingModel, 'priceMinor': priceMinor,
            'currency': 'EUR', 'active': true,
          });
          _error = null;
        });
      }
    } finally {
      id.dispose(); name.dispose(); price.dispose();
    }
  }

  Widget _priceField({
    required String label,
    required int value,
    required ValueChanged<int> onChanged,
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
    appBar: AppBar(
      title: const Text('اقتصاد مودة والأسعار'),
      actions: [
        IconButton(
          tooltip: 'تحديث الأسعار',
          onPressed: _loading || _saving ? null : _load,
          icon: const Icon(Icons.refresh),
        ),
      ],
    ),
    body: _loading
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('إعدادات قابلة للتعديل • الإصدار $_version',
                        style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 8),
                      const Text('الأسعار النقدية باليورو (السنت). هذه جداول تسعير فقط؛ الدفع النقدي وإصدار الكوينز مقابل الدفع معطلان حتى ربط مزود دفع مرخص واختباره.'),
                    ],
                  ),
                ),
              ),
              if (_error != null)
                Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('تعرفة المكالمات الثنائية', style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 6),
                      const Text('أدخل السعر الإجمالي للدقيقة الواحدة. يقسمه الخادم تلقائياً بالتساوي بين الطرفين. اترك الحقل فارغاً لإبقاء التعرفة غير مهيأة. لا يتم تحصيل أي رسوم حتى اكتمال نظام الحصص والتسوية الذرية.'),
                      TextField(
                        controller: _audioCallTariff,
                        enabled: !_saving,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'الصوت — إجمالي BetaCoins للدقيقة'),
                      ),
                      TextField(
                        controller: _videoCallTariff,
                        enabled: !_saving,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'المرئي — إجمالي BetaCoins للدقيقة'),
                      ),
                      const SizedBox(height: 6),
                      const Text('شرط الحفظ: عدد صحيح موجب زوجي فقط؛ لا تقريب ولا كسور ولا توزيع للباقي.'),
                    ],
                  ),
                ),
              ),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('مكافأة التحقق من البريد', style: Theme.of(context).textTheme.titleMedium),
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('تفعيل مكافأة البريد'),
                      subtitle: const Text('لا تُمنح أي كوينز تلقائياً ما لم يفعّل المالك المكافأة ويحدد قيمتها.'),
                      value: _emailRewardEnabled,
                      onChanged: _saving ? null : (value) => setState(() => _emailRewardEnabled = value),
                    ),
                    TextField(controller: _emailRewardCoins, enabled: !_saving, keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'مبلغ المكافأة بالكوينز')),
                    TextField(controller: _emailRewardCycleDays, enabled: !_saving, keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'مدة دورة التحقق بالأيام')),
                  ]),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('تفعيل طلبات شراء الكوينز اليدوية'),
                  subtitle: const Text('عند الإيقاف لن يتمكن الأعضاء من إنشاء طلبات جديدة. الدفع الإلكتروني الآلي غير متاح حالياً حتى اعتماد مزود وربطه خادمياً.'),
                  value: _manualPurchasesEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualPurchasesEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('تفعيل الدفع اليدوي الخارجي للإعلانات المميزة'),
                  subtitle: const Text('يتفاوض المالك مع المعلن خارج المنصة، ويتحقق من وصول المبلغ بنفسه، ثم يسجل الحركة من لوحة الإعلانات. إعدادات الطلبات الجديدة لا تغير لقطة الدفع للحملات القائمة.'),
                  value: _manualFeaturedAdsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualFeaturedAdsEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي للإعلانات العامة'),
                  subtitle: const Text('تفعيل استقبال الطلبات اليدوية لهذه الخدمة فقط؛ لا يفعّل النشر أو التحصيل تلقائياً.'),
                  value: _manualPublicAdsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualPublicAdsEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي لخدمات المؤثرين'),
                  subtitle: const Text('تفعيل مسار الطلب والتفاوض اليدوي لهذه الخدمة فقط؛ العقود والموافقات تبقى إلزامية.'),
                  value: _manualInfluencerServicesEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualInfluencerServicesEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي لاستحقاقات المتجر'),
                  subtitle: const Text('إعداد مستقل للطلبات النقدية؛ مشتريات الكوينز الداخلية لا تتأثر بهذا الخيار.'),
                  value: _manualStoreEntitlementsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualStoreEntitlementsEnabled = value),
                ),
              ),
              const Card(
                child: ListTile(
                  leading: Icon(Icons.lock_outline),
                  title: Text('الدفع الإلكتروني الآلي — مغلق'),
                  subtitle: Text('مغلق لجميع الخدمات حتى اختيار مزود، ودمج إنشاء جلسة الدفع والتحقق من توقيع Webhook والمبلغ والعملة والطلب، ثم الاختبار وموافقة المالك. لا يمكن تفعيله من هذه اللوحة حالياً.'),
                ),
              ),
              Text('باقات BetaCoins', style: Theme.of(context).textTheme.titleLarge),
              Align(
                alignment: Alignment.centerLeft,
                child: OutlinedButton.icon(
                  onPressed: _saving ? null : _addPackage,
                  icon: const Icon(Icons.add),
                  label: const Text('إضافة باقة يحددها المالك'),
                ),
              ),
              if (_packages.isEmpty)
                const Text('لم يحدد المالك أي باقات بعد. لن تظهر باقات شراء للأعضاء قبل إضافتها وحفظها.'),
              ..._packages.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item['name'] as String? ?? item['packageId'] as String? ?? 'باقة'),
                              Text('${item['coins']} كوين • EUR'),
                            ],
                          ),
                        ),
                        _priceField(
                          label: 'السعر',
                          value: (item['priceMinor'] as num?)?.toInt() ?? 1,
                          onChanged: (value) => setState(() =>
                              _packages[index] = {...item, 'priceMinor': value}),
                        ),
                        Switch(
                          value: item['active'] == true,
                          onChanged: _saving ? null : (value) => setState(() =>
                              _packages[index] = {...item, 'active': value}),
                        ),
                        IconButton(
                          tooltip: 'حذف الباقة',
                          onPressed: _saving ? null : () =>
                              setState(() => _packages.removeAt(index)),
                          icon: const Icon(Icons.delete_outline),
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 12),
              Text('أسعار الإعلانات', style: Theme.of(context).textTheme.titleLarge),
              Align(
                alignment: Alignment.centerLeft,
                child: OutlinedButton.icon(
                  onPressed: _saving ? null : _addAdPrice,
                  icon: const Icon(Icons.add),
                  label: const Text('إضافة موضع إعلاني وسعره'),
                ),
              ),
              if (_ads.isEmpty)
                const Text('لم يحدد المالك أسعار مواضع الإعلانات بعد.'),
              ..._ads.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item['name'] as String? ?? item['placementId'] as String? ?? 'موضع إعلاني'),
                              Text('نموذج الفوترة: ${item['billingModel']} • EUR'),
                            ],
                          ),
                        ),
                        _priceField(
                          label: 'السعر',
                          value: (item['priceMinor'] as num?)?.toInt() ?? 1,
                          onChanged: (value) => setState(() =>
                              _ads[index] = {...item, 'priceMinor': value}),
                        ),
                        Switch(
                          value: item['active'] == true,
                          onChanged: _saving ? null : (value) => setState(() =>
                              _ads[index] = {...item, 'active': value}),
                        ),
                        IconButton(
                          tooltip: 'حذف السعر',
                          onPressed: _saving ? null : () =>
                              setState(() => _ads.removeAt(index)),
                          icon: const Icon(Icons.delete_outline),
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 12),
              FilledButton.icon(
                onPressed: _saving ? null : _save,
                icon: _saving
                    ? const SizedBox(width: 18, height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.save_outlined),
                label: const Text('حفظ أسعار الاقتصاد'),
              ),
            ],
          ),
  );
}
).hasMatch(currencyCode) ||
          !RegExp(r'^[a-z0-9][a-z0-9_-]{2,40}
          packageName.length < 3 || packageName.length > 80 ||
          amount == null || amount < 1 || amount > 1000000000 ||
          priceMinor == null || priceMinor < 1 || priceMinor > 100000000) {
        setState(() => _error = 'بيانات الباقة غير صالحة. أدخل معرفاً واسمًا وكمية وسعراً صحيحاً.');
      } else if (_packages.length >= 30) {
        setState(() => _error = 'الحد الأقصى لعدد الباقات هو 30.');
      } else if (_packages.any((item) => item['packageId'] == packageId)) {
        setState(() => _error = 'معرف الباقة مستخدم بالفعل.');
      } else {
        setState(() {
          _packages.add({
            'packageId': packageId, 'name': packageName, 'coins': amount,
            'priceMinor': priceMinor, 'currency': 'EUR', 'active': true,
          });
          _error = null;
        });
      }
    } finally {
      id.dispose(); name.dispose(); coins.dispose(); price.dispose();
    }
  }

  Future<void> _addAdPrice() async {
    final id = TextEditingController();
    final name = TextEditingController();
    final price = TextEditingController();
    var billingModel = 'cpm';
    try {
      final accepted = await showDialog<bool>(
        context: context,
        builder: (dialogContext) => StatefulBuilder(
          builder: (dialogContext, setDialogState) => AlertDialog(
            title: const Text('إضافة سعر موضع إعلاني'),
            content: SingleChildScrollView(
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                TextField(controller: id, decoration: const InputDecoration(labelText: 'معرف الموضع')),
                TextField(controller: name, decoration: const InputDecoration(labelText: 'اسم الموضع')),
                DropdownButtonFormField<String>(
                  initialValue: billingModel,
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
              ]),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('إلغاء')),
              FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('إضافة')),
            ],
          ),
        ),
      );
      if (accepted != true || !mounted) return;
      final placementId = id.text.trim();
      final placementName = name.text.trim();
      final priceMinor = int.tryParse(price.text.trim());
      if (!RegExp(r'^[a-z0-9][a-z0-9_-]{2,40}$').hasMatch(placementId) ||
          placementName.length < 3 || placementName.length > 80 ||
          priceMinor == null || priceMinor < 1 || priceMinor > 100000000) {
        setState(() => _error = 'بيانات السعر الإعلاني غير صالحة.');
      } else if (_ads.length >= 30) {
        setState(() => _error = 'الحد الأقصى لعدد أسعار الإعلانات هو 30.');
      } else if (_ads.any((item) => item['placementId'] == placementId)) {
        setState(() => _error = 'معرف الموضع الإعلاني مستخدم بالفعل.');
      } else {
        setState(() {
          _ads.add({
            'placementId': placementId, 'name': placementName,
            'billingModel': billingModel, 'priceMinor': priceMinor,
            'currency': 'EUR', 'active': true,
          });
          _error = null;
        });
      }
    } finally {
      id.dispose(); name.dispose(); price.dispose();
    }
  }

  Widget _priceField({
    required String label,
    required int value,
    required ValueChanged<int> onChanged,
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
    appBar: AppBar(
      title: const Text('اقتصاد مودة والأسعار'),
      actions: [
        IconButton(
          tooltip: 'تحديث الأسعار',
          onPressed: _loading || _saving ? null : _load,
          icon: const Icon(Icons.refresh),
        ),
      ],
    ),
    body: _loading
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('إعدادات قابلة للتعديل • الإصدار $_version',
                        style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 8),
                      const Text('الأسعار النقدية باليورو (السنت). هذه جداول تسعير فقط؛ الدفع النقدي وإصدار الكوينز مقابل الدفع معطلان حتى ربط مزود دفع مرخص واختباره.'),
                    ],
                  ),
                ),
              ),
              if (_error != null)
                Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('تعرفة المكالمات الثنائية', style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 6),
                      const Text('أدخل السعر الإجمالي للدقيقة الواحدة. يقسمه الخادم تلقائياً بالتساوي بين الطرفين. اترك الحقل فارغاً لإبقاء التعرفة غير مهيأة. لا يتم تحصيل أي رسوم حتى اكتمال نظام الحصص والتسوية الذرية.'),
                      TextField(
                        controller: _audioCallTariff,
                        enabled: !_saving,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'الصوت — إجمالي BetaCoins للدقيقة'),
                      ),
                      TextField(
                        controller: _videoCallTariff,
                        enabled: !_saving,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'المرئي — إجمالي BetaCoins للدقيقة'),
                      ),
                      const SizedBox(height: 6),
                      const Text('شرط الحفظ: عدد صحيح موجب زوجي فقط؛ لا تقريب ولا كسور ولا توزيع للباقي.'),
                    ],
                  ),
                ),
              ),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('مكافأة التحقق من البريد', style: Theme.of(context).textTheme.titleMedium),
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('تفعيل مكافأة البريد'),
                      subtitle: const Text('لا تُمنح أي كوينز تلقائياً ما لم يفعّل المالك المكافأة ويحدد قيمتها.'),
                      value: _emailRewardEnabled,
                      onChanged: _saving ? null : (value) => setState(() => _emailRewardEnabled = value),
                    ),
                    TextField(controller: _emailRewardCoins, enabled: !_saving, keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'مبلغ المكافأة بالكوينز')),
                    TextField(controller: _emailRewardCycleDays, enabled: !_saving, keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'مدة دورة التحقق بالأيام')),
                  ]),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('تفعيل طلبات شراء الكوينز اليدوية'),
                  subtitle: const Text('عند الإيقاف لن يتمكن الأعضاء من إنشاء طلبات جديدة. الدفع الإلكتروني الآلي غير متاح حالياً حتى اعتماد مزود وربطه خادمياً.'),
                  value: _manualPurchasesEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualPurchasesEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('تفعيل الدفع اليدوي الخارجي للإعلانات المميزة'),
                  subtitle: const Text('يتفاوض المالك مع المعلن خارج المنصة، ويتحقق من وصول المبلغ بنفسه، ثم يسجل الحركة من لوحة الإعلانات. إعدادات الطلبات الجديدة لا تغير لقطة الدفع للحملات القائمة.'),
                  value: _manualFeaturedAdsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualFeaturedAdsEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي للإعلانات العامة'),
                  subtitle: const Text('تفعيل استقبال الطلبات اليدوية لهذه الخدمة فقط؛ لا يفعّل النشر أو التحصيل تلقائياً.'),
                  value: _manualPublicAdsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualPublicAdsEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي لخدمات المؤثرين'),
                  subtitle: const Text('تفعيل مسار الطلب والتفاوض اليدوي لهذه الخدمة فقط؛ العقود والموافقات تبقى إلزامية.'),
                  value: _manualInfluencerServicesEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualInfluencerServicesEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي لاستحقاقات المتجر'),
                  subtitle: const Text('إعداد مستقل للطلبات النقدية؛ مشتريات الكوينز الداخلية لا تتأثر بهذا الخيار.'),
                  value: _manualStoreEntitlementsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualStoreEntitlementsEnabled = value),
                ),
              ),
              const Card(
                child: ListTile(
                  leading: Icon(Icons.lock_outline),
                  title: Text('الدفع الإلكتروني الآلي — مغلق'),
                  subtitle: Text('مغلق لجميع الخدمات حتى اختيار مزود، ودمج إنشاء جلسة الدفع والتحقق من توقيع Webhook والمبلغ والعملة والطلب، ثم الاختبار وموافقة المالك. لا يمكن تفعيله من هذه اللوحة حالياً.'),
                ),
              ),
              Text('باقات BetaCoins', style: Theme.of(context).textTheme.titleLarge),
              Align(
                alignment: Alignment.centerLeft,
                child: OutlinedButton.icon(
                  onPressed: _saving ? null : _addPackage,
                  icon: const Icon(Icons.add),
                  label: const Text('إضافة باقة يحددها المالك'),
                ),
              ),
              if (_packages.isEmpty)
                const Text('لم يحدد المالك أي باقات بعد. لن تظهر باقات شراء للأعضاء قبل إضافتها وحفظها.'),
              ..._packages.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item['name'] as String? ?? item['packageId'] as String? ?? 'باقة'),
                              Text('${item['coins']} كوين • EUR'),
                            ],
                          ),
                        ),
                        _priceField(
                          label: 'السعر',
                          value: (item['priceMinor'] as num?)?.toInt() ?? 1,
                          onChanged: (value) => setState(() =>
                              _packages[index] = {...item, 'priceMinor': value}),
                        ),
                        Switch(
                          value: item['active'] == true,
                          onChanged: _saving ? null : (value) => setState(() =>
                              _packages[index] = {...item, 'active': value}),
                        ),
                        IconButton(
                          tooltip: 'حذف الباقة',
                          onPressed: _saving ? null : () =>
                              setState(() => _packages.removeAt(index)),
                          icon: const Icon(Icons.delete_outline),
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 12),
              Text('أسعار الإعلانات', style: Theme.of(context).textTheme.titleLarge),
              Align(
                alignment: Alignment.centerLeft,
                child: OutlinedButton.icon(
                  onPressed: _saving ? null : _addAdPrice,
                  icon: const Icon(Icons.add),
                  label: const Text('إضافة موضع إعلاني وسعره'),
                ),
              ),
              if (_ads.isEmpty)
                const Text('لم يحدد المالك أسعار مواضع الإعلانات بعد.'),
              ..._ads.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item['name'] as String? ?? item['placementId'] as String? ?? 'موضع إعلاني'),
                              Text('نموذج الفوترة: ${item['billingModel']} • EUR'),
                            ],
                          ),
                        ),
                        _priceField(
                          label: 'السعر',
                          value: (item['priceMinor'] as num?)?.toInt() ?? 1,
                          onChanged: (value) => setState(() =>
                              _ads[index] = {...item, 'priceMinor': value}),
                        ),
                        Switch(
                          value: item['active'] == true,
                          onChanged: _saving ? null : (value) => setState(() =>
                              _ads[index] = {...item, 'active': value}),
                        ),
                        IconButton(
                          tooltip: 'حذف السعر',
                          onPressed: _saving ? null : () =>
                              setState(() => _ads.removeAt(index)),
                          icon: const Icon(Icons.delete_outline),
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 12),
              FilledButton.icon(
                onPressed: _saving ? null : _save,
                icon: _saving
                    ? const SizedBox(width: 18, height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.save_outlined),
                label: const Text('حفظ أسعار الاقتصاد'),
              ),
            ],
          ),
  );
}
).hasMatch(packageId) ||
          packageName.length < 3 || packageName.length > 80 ||
          amount == null || amount < 1 || amount > 1000000000 ||
          priceMinor == null || priceMinor < 1 || priceMinor > 100000000) {
        setState(() => _error = 'بيانات الباقة غير صالحة. أدخل معرفاً واسمًا وكمية وسعراً صحيحاً.');
      } else if (_packages.length >= 30) {
        setState(() => _error = 'الحد الأقصى لعدد الباقات هو 30.');
      } else if (_packages.any((item) => item['packageId'] == packageId)) {
        setState(() => _error = 'معرف الباقة مستخدم بالفعل.');
      } else {
        setState(() {
          _packages.add({
            'packageId': packageId, 'name': packageName, 'coins': amount,
            'priceMinor': priceMinor, 'currency': 'EUR', 'active': true,
          });
          _error = null;
        });
      }
    } finally {
      id.dispose(); name.dispose(); coins.dispose(); price.dispose();
    }
  }

  Future<void> _addAdPrice() async {
    final id = TextEditingController();
    final name = TextEditingController();
    final price = TextEditingController();
    var billingModel = 'cpm';
    try {
      final accepted = await showDialog<bool>(
        context: context,
        builder: (dialogContext) => StatefulBuilder(
          builder: (dialogContext, setDialogState) => AlertDialog(
            title: const Text('إضافة سعر موضع إعلاني'),
            content: SingleChildScrollView(
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                TextField(controller: id, decoration: const InputDecoration(labelText: 'معرف الموضع')),
                TextField(controller: name, decoration: const InputDecoration(labelText: 'اسم الموضع')),
                DropdownButtonFormField<String>(
                  initialValue: billingModel,
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
              ]),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('إلغاء')),
              FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('إضافة')),
            ],
          ),
        ),
      );
      if (accepted != true || !mounted) return;
      final placementId = id.text.trim();
      final placementName = name.text.trim();
      final priceMinor = int.tryParse(price.text.trim());
      if (!RegExp(r'^[a-z0-9][a-z0-9_-]{2,40}$').hasMatch(placementId) ||
          placementName.length < 3 || placementName.length > 80 ||
          priceMinor == null || priceMinor < 1 || priceMinor > 100000000) {
        setState(() => _error = 'بيانات السعر الإعلاني غير صالحة.');
      } else if (_ads.length >= 30) {
        setState(() => _error = 'الحد الأقصى لعدد أسعار الإعلانات هو 30.');
      } else if (_ads.any((item) => item['placementId'] == placementId)) {
        setState(() => _error = 'معرف الموضع الإعلاني مستخدم بالفعل.');
      } else {
        setState(() {
          _ads.add({
            'placementId': placementId, 'name': placementName,
            'billingModel': billingModel, 'priceMinor': priceMinor,
            'currency': 'EUR', 'active': true,
          });
          _error = null;
        });
      }
    } finally {
      id.dispose(); name.dispose(); price.dispose();
    }
  }

  Widget _priceField({
    required String label,
    required int value,
    required ValueChanged<int> onChanged,
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
    appBar: AppBar(
      title: const Text('اقتصاد مودة والأسعار'),
      actions: [
        IconButton(
          tooltip: 'تحديث الأسعار',
          onPressed: _loading || _saving ? null : _load,
          icon: const Icon(Icons.refresh),
        ),
      ],
    ),
    body: _loading
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('إعدادات قابلة للتعديل • الإصدار $_version',
                        style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 8),
                      const Text('الأسعار النقدية باليورو (السنت). هذه جداول تسعير فقط؛ الدفع النقدي وإصدار الكوينز مقابل الدفع معطلان حتى ربط مزود دفع مرخص واختباره.'),
                    ],
                  ),
                ),
              ),
              if (_error != null)
                Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('تعرفة المكالمات الثنائية', style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 6),
                      const Text('أدخل السعر الإجمالي للدقيقة الواحدة. يقسمه الخادم تلقائياً بالتساوي بين الطرفين. اترك الحقل فارغاً لإبقاء التعرفة غير مهيأة. لا يتم تحصيل أي رسوم حتى اكتمال نظام الحصص والتسوية الذرية.'),
                      TextField(
                        controller: _audioCallTariff,
                        enabled: !_saving,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'الصوت — إجمالي BetaCoins للدقيقة'),
                      ),
                      TextField(
                        controller: _videoCallTariff,
                        enabled: !_saving,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'المرئي — إجمالي BetaCoins للدقيقة'),
                      ),
                      const SizedBox(height: 6),
                      const Text('شرط الحفظ: عدد صحيح موجب زوجي فقط؛ لا تقريب ولا كسور ولا توزيع للباقي.'),
                    ],
                  ),
                ),
              ),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('مكافأة التحقق من البريد', style: Theme.of(context).textTheme.titleMedium),
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('تفعيل مكافأة البريد'),
                      subtitle: const Text('لا تُمنح أي كوينز تلقائياً ما لم يفعّل المالك المكافأة ويحدد قيمتها.'),
                      value: _emailRewardEnabled,
                      onChanged: _saving ? null : (value) => setState(() => _emailRewardEnabled = value),
                    ),
                    TextField(controller: _emailRewardCoins, enabled: !_saving, keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'مبلغ المكافأة بالكوينز')),
                    TextField(controller: _emailRewardCycleDays, enabled: !_saving, keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'مدة دورة التحقق بالأيام')),
                  ]),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('تفعيل طلبات شراء الكوينز اليدوية'),
                  subtitle: const Text('عند الإيقاف لن يتمكن الأعضاء من إنشاء طلبات جديدة. الدفع الإلكتروني الآلي غير متاح حالياً حتى اعتماد مزود وربطه خادمياً.'),
                  value: _manualPurchasesEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualPurchasesEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('تفعيل الدفع اليدوي الخارجي للإعلانات المميزة'),
                  subtitle: const Text('يتفاوض المالك مع المعلن خارج المنصة، ويتحقق من وصول المبلغ بنفسه، ثم يسجل الحركة من لوحة الإعلانات. إعدادات الطلبات الجديدة لا تغير لقطة الدفع للحملات القائمة.'),
                  value: _manualFeaturedAdsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualFeaturedAdsEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي للإعلانات العامة'),
                  subtitle: const Text('تفعيل استقبال الطلبات اليدوية لهذه الخدمة فقط؛ لا يفعّل النشر أو التحصيل تلقائياً.'),
                  value: _manualPublicAdsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualPublicAdsEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي لخدمات المؤثرين'),
                  subtitle: const Text('تفعيل مسار الطلب والتفاوض اليدوي لهذه الخدمة فقط؛ العقود والموافقات تبقى إلزامية.'),
                  value: _manualInfluencerServicesEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualInfluencerServicesEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي لاستحقاقات المتجر'),
                  subtitle: const Text('إعداد مستقل للطلبات النقدية؛ مشتريات الكوينز الداخلية لا تتأثر بهذا الخيار.'),
                  value: _manualStoreEntitlementsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualStoreEntitlementsEnabled = value),
                ),
              ),
              const Card(
                child: ListTile(
                  leading: Icon(Icons.lock_outline),
                  title: Text('الدفع الإلكتروني الآلي — مغلق'),
                  subtitle: Text('مغلق لجميع الخدمات حتى اختيار مزود، ودمج إنشاء جلسة الدفع والتحقق من توقيع Webhook والمبلغ والعملة والطلب، ثم الاختبار وموافقة المالك. لا يمكن تفعيله من هذه اللوحة حالياً.'),
                ),
              ),
              Text('باقات BetaCoins', style: Theme.of(context).textTheme.titleLarge),
              Align(
                alignment: Alignment.centerLeft,
                child: OutlinedButton.icon(
                  onPressed: _saving ? null : _addPackage,
                  icon: const Icon(Icons.add),
                  label: const Text('إضافة باقة يحددها المالك'),
                ),
              ),
              if (_packages.isEmpty)
                const Text('لم يحدد المالك أي باقات بعد. لن تظهر باقات شراء للأعضاء قبل إضافتها وحفظها.'),
              ..._packages.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item['name'] as String? ?? item['packageId'] as String? ?? 'باقة'),
                              Text('${item['coins']} كوين • EUR'),
                            ],
                          ),
                        ),
                        _priceField(
                          label: 'السعر',
                          value: (item['priceMinor'] as num?)?.toInt() ?? 1,
                          onChanged: (value) => setState(() =>
                              _packages[index] = {...item, 'priceMinor': value}),
                        ),
                        Switch(
                          value: item['active'] == true,
                          onChanged: _saving ? null : (value) => setState(() =>
                              _packages[index] = {...item, 'active': value}),
                        ),
                        IconButton(
                          tooltip: 'حذف الباقة',
                          onPressed: _saving ? null : () =>
                              setState(() => _packages.removeAt(index)),
                          icon: const Icon(Icons.delete_outline),
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 12),
              Text('أسعار الإعلانات', style: Theme.of(context).textTheme.titleLarge),
              Align(
                alignment: Alignment.centerLeft,
                child: OutlinedButton.icon(
                  onPressed: _saving ? null : _addAdPrice,
                  icon: const Icon(Icons.add),
                  label: const Text('إضافة موضع إعلاني وسعره'),
                ),
              ),
              if (_ads.isEmpty)
                const Text('لم يحدد المالك أسعار مواضع الإعلانات بعد.'),
              ..._ads.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item['name'] as String? ?? item['placementId'] as String? ?? 'موضع إعلاني'),
                              Text('نموذج الفوترة: ${item['billingModel']} • EUR'),
                            ],
                          ),
                        ),
                        _priceField(
                          label: 'السعر',
                          value: (item['priceMinor'] as num?)?.toInt() ?? 1,
                          onChanged: (value) => setState(() =>
                              _ads[index] = {...item, 'priceMinor': value}),
                        ),
                        Switch(
                          value: item['active'] == true,
                          onChanged: _saving ? null : (value) => setState(() =>
                              _ads[index] = {...item, 'active': value}),
                        ),
                        IconButton(
                          tooltip: 'حذف السعر',
                          onPressed: _saving ? null : () =>
                              setState(() => _ads.removeAt(index)),
                          icon: const Icon(Icons.delete_outline),
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 12),
              FilledButton.icon(
                onPressed: _saving ? null : _save,
                icon: _saving
                    ? const SizedBox(width: 18, height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.save_outlined),
                label: const Text('حفظ أسعار الاقتصاد'),
              ),
            ],
          ),
  );
}
).hasMatch(placementId) ||
          placementName.length < 3 || placementName.length > 80 ||
          priceMinor == null || priceMinor < 1 || priceMinor > 100000000) {
        setState(() => _error = 'بيانات السعر الإعلاني غير صالحة.');
      } else if (_ads.length >= 30) {
        setState(() => _error = 'الحد الأقصى لعدد أسعار الإعلانات هو 30.');
      } else if (_ads.any((item) => item['placementId'] == placementId)) {
        setState(() => _error = 'معرف الموضع الإعلاني مستخدم بالفعل.');
      } else {
        setState(() {
          _ads.add({
            'placementId': placementId, 'name': placementName,
            'billingModel': billingModel, 'priceMinor': priceMinor,
            'currency': 'EUR', 'active': true,
          });
          _error = null;
        });
      }
    } finally {
      id.dispose(); name.dispose(); price.dispose();
    }
  }

  Widget _priceField({
    required String label,
    required int value,
    required ValueChanged<int> onChanged,
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
    appBar: AppBar(
      title: const Text('اقتصاد مودة والأسعار'),
      actions: [
        IconButton(
          tooltip: 'تحديث الأسعار',
          onPressed: _loading || _saving ? null : _load,
          icon: const Icon(Icons.refresh),
        ),
      ],
    ),
    body: _loading
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('إعدادات قابلة للتعديل • الإصدار $_version',
                        style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 8),
                      const Text('الأسعار النقدية باليورو (السنت). هذه جداول تسعير فقط؛ الدفع النقدي وإصدار الكوينز مقابل الدفع معطلان حتى ربط مزود دفع مرخص واختباره.'),
                    ],
                  ),
                ),
              ),
              if (_error != null)
                Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('تعرفة المكالمات الثنائية', style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 6),
                      const Text('أدخل السعر الإجمالي للدقيقة الواحدة. يقسمه الخادم تلقائياً بالتساوي بين الطرفين. اترك الحقل فارغاً لإبقاء التعرفة غير مهيأة. لا يتم تحصيل أي رسوم حتى اكتمال نظام الحصص والتسوية الذرية.'),
                      TextField(
                        controller: _audioCallTariff,
                        enabled: !_saving,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'الصوت — إجمالي BetaCoins للدقيقة'),
                      ),
                      TextField(
                        controller: _videoCallTariff,
                        enabled: !_saving,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'المرئي — إجمالي BetaCoins للدقيقة'),
                      ),
                      const SizedBox(height: 6),
                      const Text('شرط الحفظ: عدد صحيح موجب زوجي فقط؛ لا تقريب ولا كسور ولا توزيع للباقي.'),
                    ],
                  ),
                ),
              ),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('مكافأة التحقق من البريد', style: Theme.of(context).textTheme.titleMedium),
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('تفعيل مكافأة البريد'),
                      subtitle: const Text('لا تُمنح أي كوينز تلقائياً ما لم يفعّل المالك المكافأة ويحدد قيمتها.'),
                      value: _emailRewardEnabled,
                      onChanged: _saving ? null : (value) => setState(() => _emailRewardEnabled = value),
                    ),
                    TextField(controller: _emailRewardCoins, enabled: !_saving, keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'مبلغ المكافأة بالكوينز')),
                    TextField(controller: _emailRewardCycleDays, enabled: !_saving, keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'مدة دورة التحقق بالأيام')),
                  ]),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('تفعيل طلبات شراء الكوينز اليدوية'),
                  subtitle: const Text('عند الإيقاف لن يتمكن الأعضاء من إنشاء طلبات جديدة. الدفع الإلكتروني الآلي غير متاح حالياً حتى اعتماد مزود وربطه خادمياً.'),
                  value: _manualPurchasesEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualPurchasesEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('تفعيل الدفع اليدوي الخارجي للإعلانات المميزة'),
                  subtitle: const Text('يتفاوض المالك مع المعلن خارج المنصة، ويتحقق من وصول المبلغ بنفسه، ثم يسجل الحركة من لوحة الإعلانات. إعدادات الطلبات الجديدة لا تغير لقطة الدفع للحملات القائمة.'),
                  value: _manualFeaturedAdsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualFeaturedAdsEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي للإعلانات العامة'),
                  subtitle: const Text('تفعيل استقبال الطلبات اليدوية لهذه الخدمة فقط؛ لا يفعّل النشر أو التحصيل تلقائياً.'),
                  value: _manualPublicAdsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualPublicAdsEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي لخدمات المؤثرين'),
                  subtitle: const Text('تفعيل مسار الطلب والتفاوض اليدوي لهذه الخدمة فقط؛ العقود والموافقات تبقى إلزامية.'),
                  value: _manualInfluencerServicesEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualInfluencerServicesEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي لاستحقاقات المتجر'),
                  subtitle: const Text('إعداد مستقل للطلبات النقدية؛ مشتريات الكوينز الداخلية لا تتأثر بهذا الخيار.'),
                  value: _manualStoreEntitlementsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualStoreEntitlementsEnabled = value),
                ),
              ),
              const Card(
                child: ListTile(
                  leading: Icon(Icons.lock_outline),
                  title: Text('الدفع الإلكتروني الآلي — مغلق'),
                  subtitle: Text('مغلق لجميع الخدمات حتى اختيار مزود، ودمج إنشاء جلسة الدفع والتحقق من توقيع Webhook والمبلغ والعملة والطلب، ثم الاختبار وموافقة المالك. لا يمكن تفعيله من هذه اللوحة حالياً.'),
                ),
              ),
              Text('باقات BetaCoins', style: Theme.of(context).textTheme.titleLarge),
              Align(
                alignment: Alignment.centerLeft,
                child: OutlinedButton.icon(
                  onPressed: _saving ? null : _addPackage,
                  icon: const Icon(Icons.add),
                  label: const Text('إضافة باقة يحددها المالك'),
                ),
              ),
              if (_packages.isEmpty)
                const Text('لم يحدد المالك أي باقات بعد. لن تظهر باقات شراء للأعضاء قبل إضافتها وحفظها.'),
              ..._packages.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item['name'] as String? ?? item['packageId'] as String? ?? 'باقة'),
                              Text('${item['coins']} كوين • EUR'),
                            ],
                          ),
                        ),
                        _priceField(
                          label: 'السعر',
                          value: (item['priceMinor'] as num?)?.toInt() ?? 1,
                          onChanged: (value) => setState(() =>
                              _packages[index] = {...item, 'priceMinor': value}),
                        ),
                        Switch(
                          value: item['active'] == true,
                          onChanged: _saving ? null : (value) => setState(() =>
                              _packages[index] = {...item, 'active': value}),
                        ),
                        IconButton(
                          tooltip: 'حذف الباقة',
                          onPressed: _saving ? null : () =>
                              setState(() => _packages.removeAt(index)),
                          icon: const Icon(Icons.delete_outline),
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 12),
              Text('أسعار الإعلانات', style: Theme.of(context).textTheme.titleLarge),
              Align(
                alignment: Alignment.centerLeft,
                child: OutlinedButton.icon(
                  onPressed: _saving ? null : _addAdPrice,
                  icon: const Icon(Icons.add),
                  label: const Text('إضافة موضع إعلاني وسعره'),
                ),
              ),
              if (_ads.isEmpty)
                const Text('لم يحدد المالك أسعار مواضع الإعلانات بعد.'),
              ..._ads.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item['name'] as String? ?? item['placementId'] as String? ?? 'موضع إعلاني'),
                              Text('نموذج الفوترة: ${item['billingModel']} • EUR'),
                            ],
                          ),
                        ),
                        _priceField(
                          label: 'السعر',
                          value: (item['priceMinor'] as num?)?.toInt() ?? 1,
                          onChanged: (value) => setState(() =>
                              _ads[index] = {...item, 'priceMinor': value}),
                        ),
                        Switch(
                          value: item['active'] == true,
                          onChanged: _saving ? null : (value) => setState(() =>
                              _ads[index] = {...item, 'active': value}),
                        ),
                        IconButton(
                          tooltip: 'حذف السعر',
                          onPressed: _saving ? null : () =>
                              setState(() => _ads.removeAt(index)),
                          icon: const Icon(Icons.delete_outline),
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 12),
              FilledButton.icon(
                onPressed: _saving ? null : _save,
                icon: _saving
                    ? const SizedBox(width: 18, height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.save_outlined),
                label: const Text('حفظ أسعار الاقتصاد'),
              ),
            ],
          ),
  );
}
).hasMatch(currencyCode) ||
          !RegExp(r'^[a-z0-9][a-z0-9_-]{2,40}
          packageName.length < 3 || packageName.length > 80 ||
          amount == null || amount < 1 || amount > 1000000000 ||
          priceMinor == null || priceMinor < 1 || priceMinor > 100000000) {
        setState(() => _error = 'بيانات الباقة غير صالحة. أدخل معرفاً واسمًا وكمية وسعراً صحيحاً.');
      } else if (_packages.length >= 30) {
        setState(() => _error = 'الحد الأقصى لعدد الباقات هو 30.');
      } else if (_packages.any((item) => item['packageId'] == packageId)) {
        setState(() => _error = 'معرف الباقة مستخدم بالفعل.');
      } else {
        setState(() {
          _packages.add({
            'packageId': packageId, 'name': packageName, 'coins': amount,
            'priceMinor': priceMinor, 'currency': 'EUR', 'active': true,
          });
          _error = null;
        });
      }
    } finally {
      id.dispose(); name.dispose(); coins.dispose(); price.dispose();
    }
  }

  Future<void> _addAdPrice() async {
    final id = TextEditingController();
    final name = TextEditingController();
    final price = TextEditingController();
    var billingModel = 'cpm';
    try {
      final accepted = await showDialog<bool>(
        context: context,
        builder: (dialogContext) => StatefulBuilder(
          builder: (dialogContext, setDialogState) => AlertDialog(
            title: const Text('إضافة سعر موضع إعلاني'),
            content: SingleChildScrollView(
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                TextField(controller: id, decoration: const InputDecoration(labelText: 'معرف الموضع')),
                TextField(controller: name, decoration: const InputDecoration(labelText: 'اسم الموضع')),
                DropdownButtonFormField<String>(
                  initialValue: billingModel,
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
              ]),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('إلغاء')),
              FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('إضافة')),
            ],
          ),
        ),
      );
      if (accepted != true || !mounted) return;
      final placementId = id.text.trim();
      final placementName = name.text.trim();
      final priceMinor = int.tryParse(price.text.trim());
      if (!RegExp(r'^[a-z0-9][a-z0-9_-]{2,40}$').hasMatch(placementId) ||
          placementName.length < 3 || placementName.length > 80 ||
          priceMinor == null || priceMinor < 1 || priceMinor > 100000000) {
        setState(() => _error = 'بيانات السعر الإعلاني غير صالحة.');
      } else if (_ads.length >= 30) {
        setState(() => _error = 'الحد الأقصى لعدد أسعار الإعلانات هو 30.');
      } else if (_ads.any((item) => item['placementId'] == placementId)) {
        setState(() => _error = 'معرف الموضع الإعلاني مستخدم بالفعل.');
      } else {
        setState(() {
          _ads.add({
            'placementId': placementId, 'name': placementName,
            'billingModel': billingModel, 'priceMinor': priceMinor,
            'currency': 'EUR', 'active': true,
          });
          _error = null;
        });
      }
    } finally {
      id.dispose(); name.dispose(); price.dispose();
    }
  }

  Widget _priceField({
    required String label,
    required int value,
    required ValueChanged<int> onChanged,
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
    appBar: AppBar(
      title: const Text('اقتصاد مودة والأسعار'),
      actions: [
        IconButton(
          tooltip: 'تحديث الأسعار',
          onPressed: _loading || _saving ? null : _load,
          icon: const Icon(Icons.refresh),
        ),
      ],
    ),
    body: _loading
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('إعدادات قابلة للتعديل • الإصدار $_version',
                        style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 8),
                      const Text('الأسعار النقدية باليورو (السنت). هذه جداول تسعير فقط؛ الدفع النقدي وإصدار الكوينز مقابل الدفع معطلان حتى ربط مزود دفع مرخص واختباره.'),
                    ],
                  ),
                ),
              ),
              if (_error != null)
                Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('تعرفة المكالمات الثنائية', style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 6),
                      const Text('أدخل السعر الإجمالي للدقيقة الواحدة. يقسمه الخادم تلقائياً بالتساوي بين الطرفين. اترك الحقل فارغاً لإبقاء التعرفة غير مهيأة. لا يتم تحصيل أي رسوم حتى اكتمال نظام الحصص والتسوية الذرية.'),
                      TextField(
                        controller: _audioCallTariff,
                        enabled: !_saving,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'الصوت — إجمالي BetaCoins للدقيقة'),
                      ),
                      TextField(
                        controller: _videoCallTariff,
                        enabled: !_saving,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'المرئي — إجمالي BetaCoins للدقيقة'),
                      ),
                      const SizedBox(height: 6),
                      const Text('شرط الحفظ: عدد صحيح موجب زوجي فقط؛ لا تقريب ولا كسور ولا توزيع للباقي.'),
                    ],
                  ),
                ),
              ),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('مكافأة التحقق من البريد', style: Theme.of(context).textTheme.titleMedium),
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('تفعيل مكافأة البريد'),
                      subtitle: const Text('لا تُمنح أي كوينز تلقائياً ما لم يفعّل المالك المكافأة ويحدد قيمتها.'),
                      value: _emailRewardEnabled,
                      onChanged: _saving ? null : (value) => setState(() => _emailRewardEnabled = value),
                    ),
                    TextField(controller: _emailRewardCoins, enabled: !_saving, keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'مبلغ المكافأة بالكوينز')),
                    TextField(controller: _emailRewardCycleDays, enabled: !_saving, keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'مدة دورة التحقق بالأيام')),
                  ]),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('تفعيل طلبات شراء الكوينز اليدوية'),
                  subtitle: const Text('عند الإيقاف لن يتمكن الأعضاء من إنشاء طلبات جديدة. الدفع الإلكتروني الآلي غير متاح حالياً حتى اعتماد مزود وربطه خادمياً.'),
                  value: _manualPurchasesEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualPurchasesEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('تفعيل الدفع اليدوي الخارجي للإعلانات المميزة'),
                  subtitle: const Text('يتفاوض المالك مع المعلن خارج المنصة، ويتحقق من وصول المبلغ بنفسه، ثم يسجل الحركة من لوحة الإعلانات. إعدادات الطلبات الجديدة لا تغير لقطة الدفع للحملات القائمة.'),
                  value: _manualFeaturedAdsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualFeaturedAdsEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي للإعلانات العامة'),
                  subtitle: const Text('تفعيل استقبال الطلبات اليدوية لهذه الخدمة فقط؛ لا يفعّل النشر أو التحصيل تلقائياً.'),
                  value: _manualPublicAdsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualPublicAdsEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي لخدمات المؤثرين'),
                  subtitle: const Text('تفعيل مسار الطلب والتفاوض اليدوي لهذه الخدمة فقط؛ العقود والموافقات تبقى إلزامية.'),
                  value: _manualInfluencerServicesEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualInfluencerServicesEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي لاستحقاقات المتجر'),
                  subtitle: const Text('إعداد مستقل للطلبات النقدية؛ مشتريات الكوينز الداخلية لا تتأثر بهذا الخيار.'),
                  value: _manualStoreEntitlementsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualStoreEntitlementsEnabled = value),
                ),
              ),
              const Card(
                child: ListTile(
                  leading: Icon(Icons.lock_outline),
                  title: Text('الدفع الإلكتروني الآلي — مغلق'),
                  subtitle: Text('مغلق لجميع الخدمات حتى اختيار مزود، ودمج إنشاء جلسة الدفع والتحقق من توقيع Webhook والمبلغ والعملة والطلب، ثم الاختبار وموافقة المالك. لا يمكن تفعيله من هذه اللوحة حالياً.'),
                ),
              ),
              Text('باقات BetaCoins', style: Theme.of(context).textTheme.titleLarge),
              Align(
                alignment: Alignment.centerLeft,
                child: OutlinedButton.icon(
                  onPressed: _saving ? null : _addPackage,
                  icon: const Icon(Icons.add),
                  label: const Text('إضافة باقة يحددها المالك'),
                ),
              ),
              if (_packages.isEmpty)
                const Text('لم يحدد المالك أي باقات بعد. لن تظهر باقات شراء للأعضاء قبل إضافتها وحفظها.'),
              ..._packages.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item['name'] as String? ?? item['packageId'] as String? ?? 'باقة'),
                              Text('${item['coins']} كوين • EUR'),
                            ],
                          ),
                        ),
                        _priceField(
                          label: 'السعر',
                          value: (item['priceMinor'] as num?)?.toInt() ?? 1,
                          onChanged: (value) => setState(() =>
                              _packages[index] = {...item, 'priceMinor': value}),
                        ),
                        Switch(
                          value: item['active'] == true,
                          onChanged: _saving ? null : (value) => setState(() =>
                              _packages[index] = {...item, 'active': value}),
                        ),
                        IconButton(
                          tooltip: 'حذف الباقة',
                          onPressed: _saving ? null : () =>
                              setState(() => _packages.removeAt(index)),
                          icon: const Icon(Icons.delete_outline),
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 12),
              Text('أسعار الإعلانات', style: Theme.of(context).textTheme.titleLarge),
              Align(
                alignment: Alignment.centerLeft,
                child: OutlinedButton.icon(
                  onPressed: _saving ? null : _addAdPrice,
                  icon: const Icon(Icons.add),
                  label: const Text('إضافة موضع إعلاني وسعره'),
                ),
              ),
              if (_ads.isEmpty)
                const Text('لم يحدد المالك أسعار مواضع الإعلانات بعد.'),
              ..._ads.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item['name'] as String? ?? item['placementId'] as String? ?? 'موضع إعلاني'),
                              Text('نموذج الفوترة: ${item['billingModel']} • EUR'),
                            ],
                          ),
                        ),
                        _priceField(
                          label: 'السعر',
                          value: (item['priceMinor'] as num?)?.toInt() ?? 1,
                          onChanged: (value) => setState(() =>
                              _ads[index] = {...item, 'priceMinor': value}),
                        ),
                        Switch(
                          value: item['active'] == true,
                          onChanged: _saving ? null : (value) => setState(() =>
                              _ads[index] = {...item, 'active': value}),
                        ),
                        IconButton(
                          tooltip: 'حذف السعر',
                          onPressed: _saving ? null : () =>
                              setState(() => _ads.removeAt(index)),
                          icon: const Icon(Icons.delete_outline),
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 12),
              FilledButton.icon(
                onPressed: _saving ? null : _save,
                icon: _saving
                    ? const SizedBox(width: 18, height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.save_outlined),
                label: const Text('حفظ أسعار الاقتصاد'),
              ),
            ],
          ),
  );
}
).hasMatch(packageId) ||
          packageName.length < 3 || packageName.length > 80 ||
          amount == null || amount < 1 || amount > 1000000000 ||
          priceMinor == null || priceMinor < 1 || priceMinor > 100000000) {
        setState(() => _error = 'بيانات الباقة غير صالحة. أدخل معرفاً واسمًا وكمية وسعراً صحيحاً.');
      } else if (_packages.length >= 30) {
        setState(() => _error = 'الحد الأقصى لعدد الباقات هو 30.');
      } else if (_packages.any((item) => item['packageId'] == packageId)) {
        setState(() => _error = 'معرف الباقة مستخدم بالفعل.');
      } else {
        setState(() {
          _packages.add({
            'packageId': packageId, 'name': packageName, 'coins': amount,
            'priceMinor': priceMinor, 'currency': 'EUR', 'active': true,
          });
          _error = null;
        });
      }
    } finally {
      id.dispose(); name.dispose(); coins.dispose(); price.dispose();
    }
  }

  Future<void> _addAdPrice() async {
    final id = TextEditingController();
    final name = TextEditingController();
    final price = TextEditingController();
    var billingModel = 'cpm';
    try {
      final accepted = await showDialog<bool>(
        context: context,
        builder: (dialogContext) => StatefulBuilder(
          builder: (dialogContext, setDialogState) => AlertDialog(
            title: const Text('إضافة سعر موضع إعلاني'),
            content: SingleChildScrollView(
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                TextField(controller: id, decoration: const InputDecoration(labelText: 'معرف الموضع')),
                TextField(controller: name, decoration: const InputDecoration(labelText: 'اسم الموضع')),
                DropdownButtonFormField<String>(
                  initialValue: billingModel,
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
              ]),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('إلغاء')),
              FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('إضافة')),
            ],
          ),
        ),
      );
      if (accepted != true || !mounted) return;
      final placementId = id.text.trim();
      final placementName = name.text.trim();
      final priceMinor = int.tryParse(price.text.trim());
      if (!RegExp(r'^[a-z0-9][a-z0-9_-]{2,40}$').hasMatch(placementId) ||
          placementName.length < 3 || placementName.length > 80 ||
          priceMinor == null || priceMinor < 1 || priceMinor > 100000000) {
        setState(() => _error = 'بيانات السعر الإعلاني غير صالحة.');
      } else if (_ads.length >= 30) {
        setState(() => _error = 'الحد الأقصى لعدد أسعار الإعلانات هو 30.');
      } else if (_ads.any((item) => item['placementId'] == placementId)) {
        setState(() => _error = 'معرف الموضع الإعلاني مستخدم بالفعل.');
      } else {
        setState(() {
          _ads.add({
            'placementId': placementId, 'name': placementName,
            'billingModel': billingModel, 'priceMinor': priceMinor,
            'currency': 'EUR', 'active': true,
          });
          _error = null;
        });
      }
    } finally {
      id.dispose(); name.dispose(); price.dispose();
    }
  }

  Widget _priceField({
    required String label,
    required int value,
    required ValueChanged<int> onChanged,
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
    appBar: AppBar(
      title: const Text('اقتصاد مودة والأسعار'),
      actions: [
        IconButton(
          tooltip: 'تحديث الأسعار',
          onPressed: _loading || _saving ? null : _load,
          icon: const Icon(Icons.refresh),
        ),
      ],
    ),
    body: _loading
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('إعدادات قابلة للتعديل • الإصدار $_version',
                        style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 8),
                      const Text('الأسعار النقدية باليورو (السنت). هذه جداول تسعير فقط؛ الدفع النقدي وإصدار الكوينز مقابل الدفع معطلان حتى ربط مزود دفع مرخص واختباره.'),
                    ],
                  ),
                ),
              ),
              if (_error != null)
                Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('تعرفة المكالمات الثنائية', style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 6),
                      const Text('أدخل السعر الإجمالي للدقيقة الواحدة. يقسمه الخادم تلقائياً بالتساوي بين الطرفين. اترك الحقل فارغاً لإبقاء التعرفة غير مهيأة. لا يتم تحصيل أي رسوم حتى اكتمال نظام الحصص والتسوية الذرية.'),
                      TextField(
                        controller: _audioCallTariff,
                        enabled: !_saving,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'الصوت — إجمالي BetaCoins للدقيقة'),
                      ),
                      TextField(
                        controller: _videoCallTariff,
                        enabled: !_saving,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'المرئي — إجمالي BetaCoins للدقيقة'),
                      ),
                      const SizedBox(height: 6),
                      const Text('شرط الحفظ: عدد صحيح موجب زوجي فقط؛ لا تقريب ولا كسور ولا توزيع للباقي.'),
                    ],
                  ),
                ),
              ),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('مكافأة التحقق من البريد', style: Theme.of(context).textTheme.titleMedium),
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('تفعيل مكافأة البريد'),
                      subtitle: const Text('لا تُمنح أي كوينز تلقائياً ما لم يفعّل المالك المكافأة ويحدد قيمتها.'),
                      value: _emailRewardEnabled,
                      onChanged: _saving ? null : (value) => setState(() => _emailRewardEnabled = value),
                    ),
                    TextField(controller: _emailRewardCoins, enabled: !_saving, keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'مبلغ المكافأة بالكوينز')),
                    TextField(controller: _emailRewardCycleDays, enabled: !_saving, keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'مدة دورة التحقق بالأيام')),
                  ]),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('تفعيل طلبات شراء الكوينز اليدوية'),
                  subtitle: const Text('عند الإيقاف لن يتمكن الأعضاء من إنشاء طلبات جديدة. الدفع الإلكتروني الآلي غير متاح حالياً حتى اعتماد مزود وربطه خادمياً.'),
                  value: _manualPurchasesEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualPurchasesEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('تفعيل الدفع اليدوي الخارجي للإعلانات المميزة'),
                  subtitle: const Text('يتفاوض المالك مع المعلن خارج المنصة، ويتحقق من وصول المبلغ بنفسه، ثم يسجل الحركة من لوحة الإعلانات. إعدادات الطلبات الجديدة لا تغير لقطة الدفع للحملات القائمة.'),
                  value: _manualFeaturedAdsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualFeaturedAdsEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي للإعلانات العامة'),
                  subtitle: const Text('تفعيل استقبال الطلبات اليدوية لهذه الخدمة فقط؛ لا يفعّل النشر أو التحصيل تلقائياً.'),
                  value: _manualPublicAdsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualPublicAdsEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي لخدمات المؤثرين'),
                  subtitle: const Text('تفعيل مسار الطلب والتفاوض اليدوي لهذه الخدمة فقط؛ العقود والموافقات تبقى إلزامية.'),
                  value: _manualInfluencerServicesEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualInfluencerServicesEnabled = value),
                ),
              ),
              Card(
                child: SwitchListTile(
                  title: const Text('الدفع اليدوي الخارجي لاستحقاقات المتجر'),
                  subtitle: const Text('إعداد مستقل للطلبات النقدية؛ مشتريات الكوينز الداخلية لا تتأثر بهذا الخيار.'),
                  value: _manualStoreEntitlementsEnabled,
                  onChanged: _saving ? null : (value) => setState(() => _manualStoreEntitlementsEnabled = value),
                ),
              ),
              const Card(
                child: ListTile(
                  leading: Icon(Icons.lock_outline),
                  title: Text('الدفع الإلكتروني الآلي — مغلق'),
                  subtitle: Text('مغلق لجميع الخدمات حتى اختيار مزود، ودمج إنشاء جلسة الدفع والتحقق من توقيع Webhook والمبلغ والعملة والطلب، ثم الاختبار وموافقة المالك. لا يمكن تفعيله من هذه اللوحة حالياً.'),
                ),
              ),
              Text('باقات BetaCoins', style: Theme.of(context).textTheme.titleLarge),
              Align(
                alignment: Alignment.centerLeft,
                child: OutlinedButton.icon(
                  onPressed: _saving ? null : _addPackage,
                  icon: const Icon(Icons.add),
                  label: const Text('إضافة باقة يحددها المالك'),
                ),
              ),
              if (_packages.isEmpty)
                const Text('لم يحدد المالك أي باقات بعد. لن تظهر باقات شراء للأعضاء قبل إضافتها وحفظها.'),
              ..._packages.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item['name'] as String? ?? item['packageId'] as String? ?? 'باقة'),
                              Text('${item['coins']} كوين • EUR'),
                            ],
                          ),
                        ),
                        _priceField(
                          label: 'السعر',
                          value: (item['priceMinor'] as num?)?.toInt() ?? 1,
                          onChanged: (value) => setState(() =>
                              _packages[index] = {...item, 'priceMinor': value}),
                        ),
                        Switch(
                          value: item['active'] == true,
                          onChanged: _saving ? null : (value) => setState(() =>
                              _packages[index] = {...item, 'active': value}),
                        ),
                        IconButton(
                          tooltip: 'حذف الباقة',
                          onPressed: _saving ? null : () =>
                              setState(() => _packages.removeAt(index)),
                          icon: const Icon(Icons.delete_outline),
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 12),
              Text('أسعار الإعلانات', style: Theme.of(context).textTheme.titleLarge),
              Align(
                alignment: Alignment.centerLeft,
                child: OutlinedButton.icon(
                  onPressed: _saving ? null : _addAdPrice,
                  icon: const Icon(Icons.add),
                  label: const Text('إضافة موضع إعلاني وسعره'),
                ),
              ),
              if (_ads.isEmpty)
                const Text('لم يحدد المالك أسعار مواضع الإعلانات بعد.'),
              ..._ads.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item['name'] as String? ?? item['placementId'] as String? ?? 'موضع إعلاني'),
                              Text('نموذج الفوترة: ${item['billingModel']} • EUR'),
                            ],
                          ),
                        ),
                        _priceField(
                          label: 'السعر',
                          value: (item['priceMinor'] as num?)?.toInt() ?? 1,
                          onChanged: (value) => setState(() =>
                              _ads[index] = {...item, 'priceMinor': value}),
                        ),
                        Switch(
                          value: item['active'] == true,
                          onChanged: _saving ? null : (value) => setState(() =>
                              _ads[index] = {...item, 'active': value}),
                        ),
                        IconButton(
                          tooltip: 'حذف السعر',
                          onPressed: _saving ? null : () =>
                              setState(() => _ads.removeAt(index)),
                          icon: const Icon(Icons.delete_outline),
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 12),
              FilledButton.icon(
                onPressed: _saving ? null : _save,
                icon: _saving
                    ? const SizedBox(width: 18, height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.save_outlined),
                label: const Text('حفظ أسعار الاقتصاد'),
              ),
            ],
          ),
  );
}
