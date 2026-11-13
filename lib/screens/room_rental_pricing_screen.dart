import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

class RoomRentalPricingScreen extends StatefulWidget {
  const RoomRentalPricingScreen({super.key});
  @override
  State<RoomRentalPricingScreen> createState() => _RoomRentalPricingScreenState();
}
class _RoomRentalPricingScreenState extends State<RoomRentalPricingScreen> {
  final _functions = FirebaseFunctions.instance;
  List<Map<String, dynamic>> _plans = [];
  bool _loading = true, _saving = false;
  int _version = 0;
  String? _error;
  @override
  void initState() { super.initState(); _load(); }
  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final result = await _functions.httpsCallable('getRoomRentalPlans').call();
      final data = Map<String, dynamic>.from(result.data as Map);
      if (!mounted) return;
      setState(() {
        _plans = (data['plans'] as List<dynamic>? ?? const []).whereType<Map>()
          .map((e) => Map<String, dynamic>.from(e)).toList();
        _version = data['version'] as int? ?? 0;
      });
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _error = e.message ?? 'تعذر تحميل الأسعار.');
    } finally { if (mounted) setState(() => _loading = false); }
  }
  Future<void> _edit([Map<String, dynamic>? current]) async {
    final id = TextEditingController(text: current?['planId'] as String? ?? '');
    final name = TextEditingController(text: current?['name'] as String? ?? '');
    final days = TextEditingController(text: '${current?['durationDays'] ?? 30}');
    final price = TextEditingController(text: '${current?['priceCoins'] ?? 1000}');
    bool active = current?['active'] != false;
    final value = await showDialog<Map<String, dynamic>>(context: context,
      builder: (ctx) => StatefulBuilder(builder: (ctx, update) => AlertDialog(
        title: Text(current == null ? 'إضافة باقة' : 'تعديل باقة'),
        content: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: id, enabled: current == null, decoration: const InputDecoration(labelText: 'معرف الباقة')),
          TextField(controller: name, decoration: const InputDecoration(labelText: 'اسم الباقة')),
          TextField(controller: days, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'المدة بالأيام')),
          TextField(controller: price, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'السعر بالكوينز')),
          SwitchListTile(value: active, title: const Text('متاحة للاستئجار'), onChanged: (v) => update(() => active = v)),
        ])),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
          FilledButton(onPressed: () {
            final d = int.tryParse(days.text), p = int.tryParse(price.text), key = id.text.trim();
            if (!RegExp(r'^[a-z0-9][a-z0-9_-]{2,40}$').hasMatch(key) ||
                name.text.trim().length < 3 || d == null || d < 1 || d > 3650 ||
                p == null || p < 1 || p > 100000000) return;
            Navigator.pop(ctx, {'planId': key, 'name': name.text.trim(),
              'durationDays': d, 'priceCoins': p, 'active': active});
          }, child: const Text('حفظ')),
        ],
      )));
    id.dispose(); name.dispose(); days.dispose(); price.dispose();
    if (value == null || !mounted) return;
    setState(() {
      final i = _plans.indexWhere((p) => p['planId'] == value['planId']);
      if (i < 0) { _plans = [..._plans, value]; } else { _plans = [..._plans]..[i] = value; }
    });
  }
  Future<void> _save() async {
    if (_saving || _plans.isEmpty) return;
    setState(() { _saving = true; _error = null; });
    try {
      final result = await _functions.httpsCallable('setRoomRentalPlans').call({'plans': _plans});
      final data = Map<String, dynamic>.from(result.data as Map);
      if (!mounted) return;
      setState(() => _version = data['version'] as int? ?? _version);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('تم الحفظ. إصدار السياسة: $_version')));
      await _load();
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _error = e.message ?? 'تعذر حفظ الأسعار.');
    } finally { if (mounted) setState(() => _saving = false); }
  }
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('تسعير استئجار الغرف'),
      actions: [IconButton(onPressed: _loading ? null : _load, icon: const Icon(Icons.refresh))]),
    body: _loading ? const Center(child: CircularProgressIndicator()) : ListView(
      padding: const EdgeInsets.all(16), children: [
        Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(
          crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('الأسعار قابلة للتعديل من لوحة المالك', style: Theme.of(context).textTheme.titleMedium),
            Text('إصدار السياسة: $_version'),
            const Text('الأسعار ابتدائية بالكوينز. تثبت الأسعار المتفق عليها داخل عمليات الاستئجار السابقة، ولا يغير تحديث القائمة المعاملات المنفذة.'),
          ]))),
        if (_error != null) Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
        ..._plans.map((p) => Card(child: ListTile(
          title: Text(p['name'] as String? ?? p['planId'] as String? ?? 'باقة'),
          subtitle: Text('${p['durationDays']} يوم • ${p['priceCoins']} كوين • ${p['active'] == true ? 'متاحة' : 'متوقفة'}'),
          trailing: IconButton(onPressed: _saving ? null : () => _edit(p), icon: const Icon(Icons.edit_outlined)),
        ))),
        OutlinedButton.icon(onPressed: _saving ? null : () => _edit(), icon: const Icon(Icons.add), label: const Text('إضافة باقة')),
        FilledButton.icon(onPressed: _saving ? null : _save, icon: const Icon(Icons.save_outlined), label: const Text('حفظ الأسعار في الخادم')),
      ],
    ),
  );
}
