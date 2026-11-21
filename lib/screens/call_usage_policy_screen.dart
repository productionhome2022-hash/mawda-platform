import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

class CallUsagePolicyScreen extends StatefulWidget {
  const CallUsagePolicyScreen({super.key});

  @override
  State<CallUsagePolicyScreen> createState() => _CallUsagePolicyScreenState();
}

class _CallUsagePolicyScreenState extends State<CallUsagePolicyScreen> {
  final _functions = FirebaseFunctions.instance;
  final _windowHours = TextEditingController();
  final _audioLimit = TextEditingController();
  final _videoLimit = TextEditingController();
  final _maxDurationMinutes = TextEditingController();
  final _groupAudioCoins = TextEditingController();
  final _groupVideoCoins = TextEditingController();
  bool _groupPricingActive = false;
  bool _groupPricingConfigured = false;
  int _groupPricingVersion = 0;
  bool _active = false;
  bool _loading = true;
  bool _saving = false;
  bool _configured = false;
  int _version = 0;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _windowHours.dispose();
    _audioLimit.dispose();
    _videoLimit.dispose();
    _maxDurationMinutes.dispose();
    _groupAudioCoins.dispose();
    _groupVideoCoins.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final response = await _functions.httpsCallable('getOwnerCallUsagePolicy').call();
      final data = Map<String, dynamic>.from(response.data as Map);
      final policy = data['policy'] is Map
          ? Map<String, dynamic>.from(data['policy'] as Map) : <String, dynamic>{};
      final groupPricingResponse = await _functions
          .httpsCallable('getOwnerGroupCallPricingPolicy').call();
      final groupPricingData = Map<String, dynamic>.from(groupPricingResponse.data as Map);
      final groupPricing = groupPricingData['policy'] is Map
          ? Map<String, dynamic>.from(groupPricingData['policy'] as Map)
          : <String, dynamic>{};
      if (!mounted) return;
      setState(() {
        _groupPricingConfigured = groupPricingData['configured'] == true;
        _groupPricingVersion = (groupPricingData['version'] as num?)?.toInt() ?? 0;
        _groupPricingActive = groupPricing['active'] == true;
        _groupAudioCoins.text = groupPricing['audioCoinsPerMinute']?.toString() ?? '';
        _groupVideoCoins.text = groupPricing['videoCoinsPerMinute']?.toString() ?? '';
        _configured = data['configured'] == true;
        _version = (data['version'] as num?)?.toInt() ?? 0;
        _active = policy['active'] == true;
        final window = (policy['quotaWindowMs'] as num?)?.toInt();
        _windowHours.text = window == null ? '' : (window / 3600000).toString();
        _audioLimit.text = policy['audioCallsPerWindow']?.toString() ?? '';
        _videoLimit.text = policy['videoCallsPerWindow']?.toString() ?? '';
        final duration = (policy['maxCallDurationMs'] as num?)?.toInt();
        _maxDurationMinutes.text = duration == null ? '' : (duration / 60000).toString();
      });
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحميل سياسة المكالمات.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _save() async {
    if (_saving) return;
    final hours = double.tryParse(_windowHours.text.trim());
    final audio = _audioLimit.text.trim().isEmpty ? null : int.tryParse(_audioLimit.text.trim());
    final video = _videoLimit.text.trim().isEmpty ? null : int.tryParse(_videoLimit.text.trim());
    final durationMinutes = _maxDurationMinutes.text.trim().isEmpty
        ? null : int.tryParse(_maxDurationMinutes.text.trim());
    if (hours == null || hours < (1 / 60) || hours > 8760 ||
        (audio == null && _audioLimit.text.trim().isNotEmpty) ||
        (video == null && _videoLimit.text.trim().isNotEmpty) ||
        (durationMinutes == null && _maxDurationMinutes.text.trim().isNotEmpty) ||
        (audio != null && (audio < 0 || audio > 1000000)) ||
        (video != null && (video < 0 || video > 1000000)) ||
        (durationMinutes != null && (durationMinutes < 1 || durationMinutes > 1440))) {
      setState(() => _error = 'راجع نافذة الحصة والحدود؛ اترك الحد فارغاً ليكون غير محدود، أو أدخل صفراً لتعطيل نمط المكالمة.');
      return;
    }
    setState(() { _saving = true; _error = null; });
    try {
      final response = await _functions.httpsCallable('setOwnerCallUsagePolicy').call({
        'policy': {
          'active': _active,
          'quotaWindowMs': (hours * 3600000).round(),
          'audioCallsPerWindow': audio,
          'videoCallsPerWindow': video,
          'maxCallDurationMs': durationMinutes == null ? null : durationMinutes * 60000,
        },
      });
      final data = Map<String, dynamic>.from(response.data as Map);
      if (!mounted) return;
      setState(() => _version = (data['version'] as num?)?.toInt() ?? _version);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('تم حفظ سياسة المكالمات. الإصدار: $_version')),
      );
      await _load();
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر حفظ سياسة المكالمات.');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _saveGroupCallPricing() async {
    if (_saving) return;
    final audio = int.tryParse(_groupAudioCoins.text.trim());
    final video = int.tryParse(_groupVideoCoins.text.trim());
    if (audio == null || video == null || audio < 0 || video < 0 ||
        audio > 1000000000 || video > 1000000000 ||
        (_groupPricingActive && audio == 0 && video == 0)) {
      setState(() => _error =
          'أدخل سعراً صحيحاً لكل نمط؛ الصفر يعطّل فوترة ذلك النمط، ولا يمكن تفعيل السياسة والسعران صفر.');
      return;
    }
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('تأكيد سياسة تسعير المكالمات الجماعية'),
        content: Text(
          'سيتم حفظ إصدار جديد من سياسة المالك. الصوت: $audio كوين/دقيقة إجمالاً، '
          'الفيديو: $video كوين/دقيقة إجمالاً. الحالة: '
          '${_groupPricingActive ? "مفعّلة" : "متوقفة"}. '
          'لن تتغير السياسات المحفوظة للمكالمات السابقة.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('مراجعة لاحقاً')),
          FilledButton(onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('تأكيد وحفظ الإصدار')),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    setState(() { _saving = true; _error = null; });
    try {
      final response = await _functions.httpsCallable('setGroupCallPricingPolicy').call({
        'audioCoinsPerMinute': audio,
        'videoCoinsPerMinute': video,
        'active': _groupPricingActive,
      });
      final result = Map<String, dynamic>.from(response.data as Map);
      if (!mounted) return;
      setState(() {
        _groupPricingConfigured = true;
        _groupPricingVersion = (result['version'] as num?)?.toInt() ?? _groupPricingVersion;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('تم حفظ سياسة تسعير المكالمات الجماعية. الإصدار: $_groupPricingVersion')),
      );
      await _load();
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر حفظ سياسة تسعير المكالمات الجماعية.');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('سياسة استخدام المكالمات'),
      actions: [IconButton(onPressed: _loading || _saving ? null : _load,
        icon: const Icon(Icons.refresh))],
    ),
    body: _loading ? const Center(child: CircularProgressIndicator()) : ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(_configured ? 'إصدار السياسة: $_version' : 'لم تُهيأ سياسة مكالمات بعد',
              style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            const Text('لا توجد حصص أو مدد افتراضية. يحدد المالك القيم بنفسه، وتُحفظ نسخة السياسة التي بدأت بها كل مكالمة.'),
            const SizedBox(height: 8),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              value: _active,
              onChanged: _saving ? null : (value) => setState(() => _active = value),
              title: const Text('تفعيل المكالمات وفق هذه السياسة'),
            ),
          ],
        ))),
        TextField(controller: _windowHours, enabled: !_saving,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: const InputDecoration(
            labelText: 'نافذة الحصة بالساعات',
            helperText: 'يحدد المالك المدة التي تُحسب ضمنها محاولات المكالمات.',
          )),
        const SizedBox(height: 12),
        TextField(controller: _audioLimit, enabled: !_saving, keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: 'حد المكالمات الصوتية داخل النافذة',
            helperText: 'فارغ = غير محدود، صفر = تعطيل الصوت.',
          )),
        const SizedBox(height: 12),
        TextField(controller: _videoLimit, enabled: !_saving, keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: 'حد المكالمات المرئية داخل النافذة',
            helperText: 'فارغ = غير محدود، صفر = تعطيل الفيديو.',
          )),
        const SizedBox(height: 12),
        TextField(controller: _maxDurationMinutes, enabled: !_saving, keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: 'أقصى مدة للمكالمة بالدقائق',
            helperText: 'فارغ = لا يفرض حد زمني من هذه السياسة.',
          )),
        const Divider(height: 36),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('تسعير المكالمات الجماعية',
                  style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                Text(_groupPricingConfigured
                    ? 'إصدار التسعير الحالي: $_groupPricingVersion'
                    : 'لا توجد سياسة تسعير جماعي مهيأة. لن تُستخدم أسعار افتراضية.'),
                const SizedBox(height: 8),
                const Text(
                  'يحدد المالك السعر الإجمالي لكل دقيقة. يُقسّم المبلغ بالتساوي على المشاركين الفعليين وفق السياسة المحفوظة للمكالمة. حفظ التعديل ينشئ إصداراً جديداً ولا يغيّر المكالمات السابقة.',
                ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  value: _groupPricingActive,
                  onChanged: _saving ? null : (value) =>
                      setState(() => _groupPricingActive = value),
                  title: const Text('تفعيل سياسة تسعير المكالمات الجماعية'),
                ),
                TextField(
                  controller: _groupAudioCoins,
                  enabled: !_saving,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'الصوت — كوينز لكل دقيقة إجمالاً',
                    helperText: 'أدخل السعر الذي يعتمده المالك؛ الصفر يعطّل فوترة الصوت.',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _groupVideoCoins,
                  enabled: !_saving,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'الفيديو — كوينز لكل دقيقة إجمالاً',
                    helperText: 'أدخل السعر الذي يعتمده المالك؛ الصفر يعطّل فوترة الفيديو.',
                  ),
                ),
                const SizedBox(height: 12),
                FilledButton.icon(
                  onPressed: _saving ? null : _saveGroupCallPricing,
                  icon: const Icon(Icons.price_change_outlined),
                  label: Text(_saving ? 'جارٍ الحفظ…' : 'حفظ إصدار تسعير المكالمات'),
                ),
              ],
            ),
          ),
        ),
        if (_error != null) Padding(
          padding: const EdgeInsets.only(top: 12),
          child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
        ),
        const SizedBox(height: 16),
        FilledButton.icon(
          onPressed: _saving ? null : _save,
          icon: const Icon(Icons.save_outlined),
          label: Text(_saving ? 'جارٍ الحفظ…' : 'حفظ سياسة المالك'),
        ),
      ],
    ),
  );
}
