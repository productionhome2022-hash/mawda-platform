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
  List<Map<String, dynamic>> _packages = [];
  List<Map<String, dynamic>> _ads = [];
  bool _loading = true, _saving = false;
  bool _manualPurchasesEnabled = false, _manualFeaturedAdsEnabled = false;
  bool _emailRewardEnabled = false;
  int _version = 0;
  String? _error;

  @override
  void initState() { super.initState(); _load(); }

  @override
  void dispose() {
    _audioCallTariff.dispose();
    _videoCallTariff.dispose();
    _emailRewardCoins.dispose();
    _emailRewardCycleDays.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() { _loading = true; _error = null; });
    try {
      final response = await _functions.httpsCallable('getOwnerEconomyPricing').call();
      final data = Map<String, dynamic>.from(response.data as Map);
      final tariffs = Map<String, dynamic>.from(data['callTariffs'] as Map? ?? const {});
      final email = Map<String, dynamic>.from(data['emailVerificationReward'] as Map? ?? const {});
      if (!mounted) return;
      setState(() {
        _packages = (data['coinPackages'] as List<dynamic>? ?? const [])
            .whereType<Map>().map((v) => Map<String, dynamic>.from(v)).toList();
        _ads = (data['adPrices'] as List<dynamic>? ?? const [])
            .whereType<Map>().map((v) => Map<String, dynamic>.from(v)).toList();
        _version = (data['version'] as num?)?.toInt() ?? 0;
        _manualPurchasesEnabled = data['manualCoinPurchasesEnabled'] == true;
        _manualFeaturedAdsEnabled = data['manualFeaturedAdsEnabled'] == true;
        _audioCallTariff.text = tariffs['audioTotalCoinsPerMinute']?.toString() ?? '';
        _videoCallTariff.text = tariffs['videoTotalCoinsPerMinute']?.toString() ?? '';
        _emailRewardEnabled = email['enabled'] == true;
        _emailRewardCoins.text = email['rewardCoins']?.toString() ?? '0';
        _emailRewardCycleDays.text = email['cycleDays']?.toString() ?? '90';
      });
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _error = e.message ?? 'تعذر تحميل إعدادات الاقتصاد.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحميل إعدادات الاقتصاد.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _save() async {
    if (_saving) return;
    final audioText = _audioCallTariff.text.trim();
    final videoText = _videoCallTariff.text.trim();
    final audio = audioText.isEmpty ? null : int.tryParse(audioText);
    final video = videoText.isEmpty ? null : int.tryParse(videoText);
    final reward = int.tryParse(_emailRewardCoins.text.trim());
    final cycleDays = int.tryParse(_emailRewardCycleDays.text.trim());
    if ((audioText.isNotEmpty && (audio == null || audio <= 0 || audio.isOdd)) ||
        (videoText.isNotEmpty && (video == null || video <= 0 || video.isOdd)) ||
        reward == null || reward < 0 || reward > 1000000 ||
        cycleDays == null || cycleDays < 1 || cycleDays > 3650 ||
        (_emailRewardEnabled && reward < 1)) {
      setState(() => _error = 'راجع تعرفة المكالمات ومكافأة البريد ومدتها؛ التعرفة الثنائية يجب أن تكون عدداً زوجياً موجباً.');
      return;
    }
    setState(() { _saving = true; _error = null; });
    try {
      final response = await _functions.httpsCallable('setOwnerEconomyPricing').call({
        'coinPackages': _packages,
        'adPrices': _ads,
        'callTariffs': {
          'audioTotalCoinsPerMinute': audio,
          'videoTotalCoinsPerMinute': video,
        },
        'emailVerificationReward': {
          'enabled': _emailRewardEnabled,
          'rewardCoins': reward,
          'cycleDays': cycleDays,
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
      final saved = Map<String, dynamic>.from(response.data as Map);
      if (!mounted) return;
      setState(() => _version = (saved['version'] as num?)?.toInt() ?? _version);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('تم حفظ إعدادات الاقتصاد • الإصدار $_version')),
      );
    } on FirebaseFunctionsException catch (e) {
      if (!mounted) return;
      setState(() => _error = e.message ?? 'تعذر حفظ إعدادات الاقتصاد.');
      if (e.code == 'aborted') {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('تغيرت الإعدادات. حدّث البيانات قبل إعادة الحفظ.'),
        ));
      }
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر حفظ إعدادات الاقتصاد.');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _addPackage() async {
    final id = TextEditingController(), name = TextEditingController();
    final coins = TextEditingController(), price = TextEditingController();
    final currency = TextEditingController();
    try {
      final accepted = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
        title: const Text('إضافة باقة BetaCoins'),
        content: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: id, decoration: const InputDecoration(labelText: 'معرف الباقة')),
          TextField(controller: name, decoration: const InputDecoration(labelText: 'اسم الباقة')),
          TextField(controller: coins, keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'عدد BetaCoins')),
          TextField(controller: price, keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'السعر بوحدة العملة الصغرى')),
          TextField(controller: currency, maxLength: 3,
            textCapitalization: TextCapitalization.characters,
            decoration: const InputDecoration(labelText: 'رمز العملة ISO المدعوم')),
        ])),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('إلغاء')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('إضافة')),
        ],
      ));
      if (accepted != true || !mounted) return;
      final packageId = id.text.trim(), packageName = name.text.trim();
      final amount = int.tryParse(coins.text.trim()), priceMinor = int.tryParse(price.text.trim());
      final currencyCode = currency.text.trim().toUpperCase();
      if (!RegExp(r'^[a-z0-9][a-z0-9_-]{2,40}$').hasMatch(packageId) ||
          packageName.length < 3 || packageName.length > 80 ||
          amount == null || amount < 1 || amount > 1000000000 ||
          priceMinor == null || priceMinor < 1 || priceMinor > 100000000 ||
          !RegExp(r'^[A-Z]{3}$').hasMatch(currencyCode)) {
        setState(() => _error = 'بيانات الباقة غير صالحة.');
      } else if (_packages.length >= 30 || _packages.any((v) => v['packageId'] == packageId)) {
        setState(() => _error = 'تجاوزت الحد الأقصى أو أن معرف الباقة مستخدم.');
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
    final id = TextEditingController(), name = TextEditingController();
    final price = TextEditingController(), currency = TextEditingController();
    var model = 'cpm';
    try {
      final accepted = await showDialog<bool>(context: context, builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialog) => AlertDialog(
          title: const Text('إضافة سعر موضع إعلاني'),
          content: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, children: [
            TextField(controller: id, decoration: const InputDecoration(labelText: 'معرف الموضع')),
            TextField(controller: name, decoration: const InputDecoration(labelText: 'اسم الموضع')),
            DropdownButtonFormField<String>(
              initialValue: model,
              decoration: const InputDecoration(labelText: 'نموذج الفوترة'),
              items: const [
                DropdownMenuItem(value: 'cpm', child: Text('CPM')),
                DropdownMenuItem(value: 'cpc', child: Text('CPC')),
                DropdownMenuItem(value: 'daily', child: Text('يومي')),
              ],
              onChanged: (v) => setDialog(() => model = v ?? model),
            ),
            TextField(controller: price, keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'السعر بوحدة العملة الصغرى')),
            TextField(controller: currency, maxLength: 3,
              textCapitalization: TextCapitalization.characters,
              decoration: const InputDecoration(labelText: 'رمز العملة ISO المدعوم')),
          ])),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('إلغاء')),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('إضافة')),
          ],
        ),
      ));
      if (accepted != true || !mounted) return;
      final placementId = id.text.trim(), placementName = name.text.trim();
      final priceMinor = int.tryParse(price.text.trim());
      final currencyCode = currency.text.trim().toUpperCase();
      if (!RegExp(r'^[a-z0-9][a-z0-9_-]{2,40}$').hasMatch(placementId) ||
          placementName.length < 3 || placementName.length > 80 ||
          priceMinor == null || priceMinor < 1 || priceMinor > 100000000 ||
          !RegExp(r'^[A-Z]{3}$').hasMatch(currencyCode)) {
        setState(() => _error = 'بيانات السعر الإعلاني غير صالحة.');
      } else if (_ads.length >= 30 || _ads.any((v) => v['placementId'] == placementId)) {
        setState(() => _error = 'تجاوزت الحد الأقصى أو أن معرف الموضع مستخدم.');
      } else {
        setState(() {
          _ads.add({
            'placementId': placementId, 'name': placementName,
            'billingModel': model, 'priceMinor': priceMinor,
            'currency': currencyCode, 'active': true,
          });
          _error = null;
        });
      }
    } finally {
      id.dispose(); name.dispose(); price.dispose(); currency.dispose();
    }
  }

  int? _currencyExponent(String currency) {
    const zero = {'JPY', 'KRW', 'VND'};
    const three = {'BHD', 'IQD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND'};
    const two = {'AED', 'AUD', 'CAD', 'CHF', 'DZD', 'EGP', 'EUR', 'GBP',
      'LBP', 'MAD', 'NZD', 'QAR', 'SAR', 'SDG', 'SYP', 'TRY', 'USD'};
    if (zero.contains(currency)) return 0;
    if (three.contains(currency)) return 3;
    if (two.contains(currency)) return 2;
    return null;
  }

  String _formatMinor(int amount, int exponent, String currency) {
    final scale = exponent == 0 ? 1 : exponent == 1 ? 10 : exponent == 2 ? 100 : 1000;
    return (amount / scale).toStringAsFixed(exponent) + ' ' + currency;
  }

  Widget _priceField({
    required int value,
    required ValueChanged<int> onChanged,
  }) => SizedBox(
    width: 130,
    child: TextFormField(
      key: ValueKey(value),
      initialValue: value.toString(),
      enabled: !_saving,
      keyboardType: TextInputType.number,
      decoration: const InputDecoration(labelText: 'السعر • وحدة صغرى'),
      onChanged: (text) {
        final parsed = int.tryParse(text);
        if (parsed != null && parsed > 0 && parsed <= 100000000) onChanged(parsed);
      },
    ),
  );

  Widget _currencyField({
    required String value,
    required ValueChanged<String> onChanged,
  }) => SizedBox(
    width: 90,
    child: TextFormField(
      key: ValueKey(value),
      initialValue: value,
      enabled: !_saving,
      maxLength: 3,
      textCapitalization: TextCapitalization.characters,
      decoration: const InputDecoration(labelText: 'العملة'),
      onChanged: (text) {
        final code = text.trim().toUpperCase();
        final exponent = _currencyExponent(code);
        onChanged(code);
        if (exponent != null) {
          // Keep the preview aligned with the ISO minor-unit exponent that
          // the server derives and persists when the policy is saved.
        }
      },
    ),
  );

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('اقتصاد مودة والأسعار'),
      actions: [IconButton(
        tooltip: 'تحديث الأسعار',
        onPressed: _loading || _saving ? null : _load,
        icon: const Icon(Icons.refresh),
      )],
    ),
    body: _loading ? const Center(child: CircularProgressIndicator()) : ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(
          crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('إعدادات قابلة للتعديل • الإصدار $_version',
              style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            const Text('المالك يحدد العملة لكل باقة وموضع إعلاني. السعر يحفظ بوحدة العملة الصغرى وفق دقة رمز ISO المدعوم. الدفع الآلي مغلق حتى ربط مزود موثوق والتحقق الخادمي واختباره.'),
          ],
        ))),
        if (_error != null) Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
        Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(
          crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('تعرفة المكالمات الثنائية', style: Theme.of(context).textTheme.titleMedium),
            const Text('السعر الإجمالي للدقيقة الواحدة، ويقسمه الخادم بالتساوي بين الطرفين. اترك الحقل فارغاً لإبقاء التعرفة غير مهيأة. التحصيل غير مفعل حتى اكتمال الحصص والتسوية الذرية.'),
            TextField(controller: _audioCallTariff, enabled: !_saving, keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'الصوت • إجمالي BetaCoins للدقيقة')),
            TextField(controller: _videoCallTariff, enabled: !_saving, keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'المرئي • إجمالي BetaCoins للدقيقة')),
            const Text('عدد صحيح موجب زوجي فقط؛ لا تقريب ولا كسور ولا توزيع للباقي.'),
          ],
        ))),
        Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(
          crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('مكافأة التحقق من البريد', style: Theme.of(context).textTheme.titleMedium),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('تفعيل مكافأة البريد'),
              subtitle: const Text('لا تمنح المنصة كوينز تلقائياً ما لم يفعّل المالك المكافأة ويحدد قيمتها.'),
              value: _emailRewardEnabled,
              onChanged: _saving ? null : (v) => setState(() => _emailRewardEnabled = v),
            ),
            TextField(controller: _emailRewardCoins, enabled: !_saving, keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'مبلغ المكافأة بالكوينز')),
            TextField(controller: _emailRewardCycleDays, enabled: !_saving, keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'مدة دورة التحقق بالأيام')),
          ],
        ))),
        Card(child: SwitchListTile(
          title: const Text('طلبات شراء BetaCoins اليدوية'),
          subtitle: const Text('لا تضاف العملات عند الطلب أو الإبلاغ عن الدفع؛ الاعتماد بعد تحقق المالك من وصول الدفعة فقط.'),
          value: _manualPurchasesEnabled,
          onChanged: _saving ? null : (v) => setState(() => _manualPurchasesEnabled = v),
        )),
        Card(child: SwitchListTile(
          title: const Text('الدفع اليدوي للإعلانات المميزة'),
          subtitle: const Text('يتحقق المالك من وصول الدفعة الخارجية ويسجل الحدث المالي من لوحة الإعلانات.'),
          value: _manualFeaturedAdsEnabled,
          onChanged: _saving ? null : (v) => setState(() => _manualFeaturedAdsEnabled = v),
        )),
        const Card(child: ListTile(
          leading: Icon(Icons.lock_outline),
          title: Text('مسارات الدفع الأخرى غير متاحة'),
          subtitle: Text('الإعلانات العامة وخدمات المؤثرين واستحقاقات المتجر لا يمكن تفعيلها قبل استكمال الطلب والعقد والتحصيل والتسوية والتدقيق.'),
        )),
        const Card(child: ListTile(
          leading: Icon(Icons.lock_outline),
          title: Text('الدفع الإلكتروني الآلي مغلق'),
          subtitle: Text('يتطلب مزوداً موثوقاً والتحقق الخادمي من توقيع Webhook والمبلغ والعملة والطلب، ثم الاختبار وموافقة المالك.'),
        )),
        Text('باقات BetaCoins', style: Theme.of(context).textTheme.titleLarge),
        Align(alignment: Alignment.centerLeft, child: OutlinedButton.icon(
          onPressed: _saving ? null : _addPackage,
          icon: const Icon(Icons.add), label: const Text('إضافة باقة يحددها المالك'),
        )),
        if (_packages.isEmpty) const Text('لم يحدد المالك أي باقات بعد.'),
        ..._packages.asMap().entries.map((entry) {
          final i = entry.key, item = entry.value;
          return Card(child: Padding(padding: const EdgeInsets.all(12), child: Wrap(
            spacing: 10, runSpacing: 8, crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              SizedBox(width: 145, child: Text(item['name'] as String? ?? item['packageId'] as String? ?? 'باقة')),
              Text('\${item['coins']} كوين • ' + _formatMinor(
                (item['priceMinor'] as num?)?.toInt() ?? 0,
                (item['currencyExponent'] as num?)?.toInt() ?? 2,
                item['currency'] as String? ?? '—',
              )),
              _priceField(value: (item['priceMinor'] as num?)?.toInt() ?? 1,
                onChanged: (v) => setState(() => _packages[i] = {...item, 'priceMinor': v})),
              _currencyField(value: item['currency'] as String? ?? '',
                onChanged: (v) => setState(() => _packages[i] = {
                  ...item, 'currency': v,
                  if (_currencyExponent(v) != null) 'currencyExponent': _currencyExponent(v),
                })),
              Switch(value: item['active'] == true,
                onChanged: _saving ? null : (v) => setState(() => _packages[i] = {...item, 'active': v})),
              IconButton(onPressed: _saving ? null : () => setState(() => _packages.removeAt(i)),
                icon: const Icon(Icons.delete_outline)),
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
          return Card(child: Padding(padding: const EdgeInsets.all(12), child: Wrap(
            spacing: 10, runSpacing: 8, crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              SizedBox(width: 145, child: Text(item['name'] as String? ?? item['placementId'] as String? ?? 'موضع إعلاني')),
              Text('\${item['billingModel']} • ' + _formatMinor(
                (item['priceMinor'] as num?)?.toInt() ?? 0,
                (item['currencyExponent'] as num?)?.toInt() ?? 2,
                item['currency'] as String? ?? '—',
              )),
              _priceField(value: (item['priceMinor'] as num?)?.toInt() ?? 1,
                onChanged: (v) => setState(() => _ads[i] = {...item, 'priceMinor': v})),
              _currencyField(value: item['currency'] as String? ?? '',
                onChanged: (v) => setState(() => _ads[i] = {
                  ...item, 'currency': v,
                  if (_currencyExponent(v) != null) 'currencyExponent': _currencyExponent(v),
                })),
              Switch(value: item['active'] == true,
                onChanged: _saving ? null : (v) => setState(() => _ads[i] = {...item, 'active': v})),
              IconButton(onPressed: _saving ? null : () => setState(() => _ads.removeAt(i)),
                icon: const Icon(Icons.delete_outline)),
            ],
          )));
        }),
        const SizedBox(height: 12),
        FilledButton.icon(
          onPressed: _saving ? null : _save,
          icon: _saving
              ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
              : const Icon(Icons.save_outlined),
          label: const Text('حفظ إعدادات الاقتصاد'),
        ),
      ],
    ),
  );
}
