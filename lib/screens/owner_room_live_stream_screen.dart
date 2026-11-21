import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

class OwnerRoomLiveStreamScreen extends StatefulWidget {
  const OwnerRoomLiveStreamScreen({super.key});
  @override
  State<OwnerRoomLiveStreamScreen> createState() => _OwnerRoomLiveStreamScreenState();
}

class _OwnerRoomLiveStreamScreenState extends State<OwnerRoomLiveStreamScreen> {
  final _roomId = TextEditingController();
  final _url = TextEditingController();
  final _title = TextEditingController();
  final _description = TextEditingController();
  bool _sending = false;
  String? _error;

  @override
  void dispose() {
    _roomId.dispose(); _url.dispose(); _title.dispose(); _description.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final roomId = _roomId.text.trim();
    final url = _url.text.trim();
    if (roomId.isEmpty || roomId.length > 128 || !url.startsWith('https://') ||
        url.length > 2048 || _title.text.trim().length > 120 ||
        _description.text.trim().length > 500) {
      setState(() => _error = 'أدخل معرف غرفة صحيحاً ورابط HTTPS وعنواناً ووصفاً ضمن الحدود.');
      return;
    }
    setState(() { _sending = true; _error = null; });
    try {
      await FirebaseFunctions.instance.httpsCallable('sendOwnerLiveStream').call({
        'requestId': const Uuid().v4().replaceAll('-', '_'),
        'scope': 'room', 'targetId': roomId, 'url': url,
        'title': _title.text.trim(), 'description': _description.text.trim(),
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم إرسال البث إلى الغرفة النشطة.')),
      );
      _url.clear(); _title.clear(); _description.clear();
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _error = e.message ?? 'تعذر إرسال البث. تحقق من نشاط الغرفة وصلاحيتها.');
    } finally { if (mounted) setState(() => _sending = false); }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('بث المالك إلى الغرف')),
    body: ListView(padding: const EdgeInsets.all(16), children: [
      const Card(child: Padding(padding: EdgeInsets.all(12), child: Text(
        'يستطيع مالك مودة إرسال رابط بث إلى غرفة عامة نشطة أو غرفة خاصة مستأجرة ما زالت ضمن مدة الاستئجار. لا يشترط انضمام المالك كعضو. تُرفض الغرف المغلقة والمنتهية.',
      ))),
      TextField(controller: _roomId, enabled: !_sending,
        decoration: const InputDecoration(labelText: 'معرف الغرفة', border: OutlineInputBorder())),
      const SizedBox(height: 12),
      TextField(controller: _url, enabled: !_sending, keyboardType: TextInputType.url,
        decoration: const InputDecoration(labelText: 'رابط البث HTTPS', border: OutlineInputBorder())),
      const SizedBox(height: 12),
      TextField(controller: _title, enabled: !_sending, maxLength: 120,
        decoration: const InputDecoration(labelText: 'عنوان اختياري')),
      TextField(controller: _description, enabled: !_sending, maxLength: 500, maxLines: 3,
        decoration: const InputDecoration(labelText: 'وصف اختياري')),
      if (_error != null) Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
      const SizedBox(height: 12),
      FilledButton.icon(onPressed: _sending ? null : _send,
        icon: _sending ? const SizedBox(width: 18,height: 18,child: CircularProgressIndicator(strokeWidth: 2))
          : const Icon(Icons.live_tv_outlined),
        label: const Text('إرسال البث إلى الغرفة')),
      const SizedBox(height: 12),
      const Text('تُقبل روابط HTTPS الآمنة فقط. لا يتم تجاوز قيود DRM أو تسجيل الدخول أو الحجب الجغرافي أو قيود التضمين. عند عدم دعم التضمين يُفتح المصدر الأصلي.'),
    ]),
  );
}
