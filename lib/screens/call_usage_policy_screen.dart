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
    super.dispose();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final response = await _functions.httpsCallable('getOwnerCallUsagePolicy').call();
      final data = Map<String, dynamic>.from(response.data as Map);
      final policy = data['policy'] is Map
          ? Map<String, dynamic>.from(data['policy'] as Map) : <String, dynamic>{};
      if (!mounted) return;
      setState(() {
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
