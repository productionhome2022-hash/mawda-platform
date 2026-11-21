import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

class GroupCallPricingScreen extends StatefulWidget {
  const GroupCallPricingScreen({super.key});
  @override
  State<GroupCallPricingScreen> createState() => _GroupCallPricingScreenState();
}

class _GroupCallPricingScreenState extends State<GroupCallPricingScreen> {
  final _functions = FirebaseFunctions.instance;
  final _audioRate = TextEditingController();
  final _videoRate = TextEditingController();
  bool _active = false, _configured = false, _loading = true, _saving = false;
  int _version = 0;
  String? _error;

  @override
  void initState() { super.initState(); _load(); }
  @override
  void dispose() { _audioRate.dispose(); _videoRate.dispose(); super.dispose(); }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final response = await _functions.httpsCallable('getOwnerGroupCallPricingPolicy').call();
      final data = Map<String, dynamic>.from(response.data as Map);
      final policy = data['policy'] is Map
          ? Map<String, dynamic>.from(data['policy'] as Map) : <String, dynamic>{};
      if (!mounted) return;
      setState(() {
        _configured = data['configured'] == true;
        _audioRate.text = policy['audioCoinsPerMinute']?.toString() ?? '';
        _videoRate.text = policy['videoCoinsPerMinute']?.toString() ?? '';
        _active = policy['active'] == true;
        _version = (policy['version'] as num?)?.toInt() ?? 0;
        if (data['billingEnabled'] != false) {
          _error = 'حالة التحصيل غير متوقعة؛ أوقفنا عرض إعدادات الأسعار.';
        }
      });
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحميل أسعار المكالمات التجريبية.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحميل أسعار المكالمات التجريبية.');
    } finally { if (mounted) setState(() => _loading = false); }
  }

  Future<void> _save() async {
    final audio = int.tryParse(_audioRate.text.trim());
    final video = int.tryParse(_videoRate.text.trim());
    if (audio == null || video == null || audio < 0 || video < 0 ||
        (_active && audio == 0 && video == 0)) {
      setState(() => _error = 'أدخل أسعاراً صحيحة بالأعداد الصحيحة، أو أوقف السياسة التجريبية.');
      return;
    }
    setState(() { _saving = true; _error = null; });
    try {
      final response = await _functions.httpsCallable('setOwnerGroupCallPricingPolicy').call({
        'audioCoinsPerMinute': audio, 'videoCoinsPerMinute': video, 'active': _active,
      });
      final data = Map<String, dynamic>.from(response.data as Map);
      final policy = Map<String, dynamic>.from(data['policy'] as Map);
      if (!mounted) return;
      setState(() { _configured = true; _version = (policy['version'] as num?)?.toInt() ?? _version; });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('حُفظت أسعار الاختبار. إصدار السياسة: $_version. التحصيل المالي مغلق.')),
      );
      await _load();
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر حفظ أسعار المكالمات.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر حفظ أسعار المكالمات.');
    } finally { if (mounted) setState(() => _saving = false); }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('أسعار المكالمات التجريبية'),
      actions: [IconButton(onPressed: _loading ? null : _load, icon: const Icon(Icons.refresh))],
    ),
    body: _loading ? const Center(child: CircularProgressIndicator()) : ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('إعدادات اختبار فقط', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            const Text(
              'تُدار القيم من لوحة السوبر أونر وتُحفظ بإصدارات وسجل تدقيق. '
              'هذه الأسعار لا تخصم BetaCoins ولا تنشئ حجوزات أو تسويات مالية. '
              'التحصيل يبقى مغلقاً حتى اعتماد سياسة الإطلاق وتنفيذ دورة التسوية الآمنة.',
            ),
            const SizedBox(height: 16),
            TextField(controller: _audioRate, keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'سعر الصوت التجريبي لكل دقيقة (BetaCoins)')),
            const SizedBox(height: 12),
            TextField(controller: _videoRate, keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'سعر الفيديو التجريبي لكل دقيقة (BetaCoins)')),
            SwitchListTile(contentPadding: EdgeInsets.zero, value: _active,
              onChanged: _saving ? null : (value) => setState(() => _active = value),
              title: const Text('تفعيل سياسة الأسعار للاختبار')),
            Text('الإصدار الحالي: $_version' + (_configured ? '' : ' — لم تُضبط الأسعار بعد')),
            const SizedBox(height: 12),
            if (_error != null) Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            const SizedBox(height: 8),
            SizedBox(width: double.infinity, child: FilledButton.icon(
              onPressed: _saving ? null : _save,
              icon: _saving
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.save_outlined),
              label: const Text('حفظ أسعار الاختبار'),
            )),
          ],
        ))),
      ],
    ),
  );
}
