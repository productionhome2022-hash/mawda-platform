import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../services/member_media_upload_service.dart';

class BiometricVerificationScreen extends StatefulWidget {
  const BiometricVerificationScreen({super.key});

  @override
  State<BiometricVerificationScreen> createState() => _BiometricVerificationScreenState();
}

class _BiometricVerificationScreenState extends State<BiometricVerificationScreen> {
  final MemberMediaUploadService _service = MemberMediaUploadService();
  final ImagePicker _picker = ImagePicker();
  Map<String, dynamic>? _status;
  Map<String, dynamic>? _request;
  bool _loading = false;
  bool _consent = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _refreshStatus();
  }

  @override
  void dispose() {
    _service.close();
    super.dispose();
  }

  Future<void> _refreshStatus() async {
    try {
      final value = await _service.getMyBiometricVerificationStatus();
      if (mounted) setState(() => _status = value);
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحميل حالة التوثيق من الخادم.');
    }
  }

  Future<void> _runSubmission() async {
    if (_loading || !_consent) return;
    setState(() { _loading = true; _error = null; });
    try {
      final request = await _service.startBiometricVerificationRequest();
      if (!mounted) return;
      setState(() => _request = request);

      final audio = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: const ['m4a'],
        withData: false,
      );
      if (audio == null || audio.files.single.path == null) {
        throw StateError('لم يتم اختيار تسجيل صوتي بصيغة M4A.');
      }
      await _service.uploadBiometricAudio(
        file: XFile(audio.files.single.path!, name: audio.files.single.name, mimeType: 'audio/mp4'),
        requestId: request['requestId'] as String,
      );

      final video = await _picker.pickVideo(
        source: ImageSource.camera,
        maxDuration: const Duration(seconds: 5),
      );
      if (video == null) throw StateError('لم يتم تسجيل فيديو التحقق.');
      await _service.uploadBiometricVideo(file: video, requestId: request['requestId'] as String);

      await _service.submitBiometricVerificationRequest(requestId: request['requestId'] as String);
      await _refreshStatus();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم إرسال الأدلة الآمنة إلى Super Owner للمراجعة.')),
      );
    } catch (error) {
      if (mounted) setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _statusLabel() {
    switch (_status?['status']) {
      case 'verified': return 'موثّق حالياً';
      case 'pending': return 'بانتظار مراجعة Super Owner';
      case 'rejected': return 'تم رفض المحاولة';
      case 'closed': return 'أُغلق الملف بعد ثلاث حالات رفض';
      case 'uploading': return 'جارٍ تجهيز الأدلة';
      case 'upload_rejected': return 'لم تُقبل ملفات الرفع؛ يمكنك إعادة المحاولة';
      default: return 'لم يُرسل طلب توثيق';
    }
  }

  @override
  Widget build(BuildContext context) {
    final closed = _status?['permanentlyClosed'] == true;
    final pending = ['uploading', 'pending'].contains(_status?['status']);
    return Scaffold(
      appBar: AppBar(title: const Text('التوثيق البيومتري')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('حالة طلبك: ${_statusLabel()}', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              const Text('القبول يقرره Super Owner بعد الاستماع إلى التسجيل ومراجعة الفيديو. لا يوجد قبول آلي ولا يلزم إثبات تشفيري من الجهاز.'),
              if (_status?['expiresAtMs'] is num) ...[
                const SizedBox(height: 8),
                Text('انتهاء التوثيق: ${DateTime.fromMillisecondsSinceEpoch((_status!['expiresAtMs'] as num).toInt()).toLocal()}'),
              ],
              if (closed) const Text('لا توجد محاولة رابعة.', style: TextStyle(color: Colors.red)),
              if (pending) const Text('لديك طلب مفتوح بالفعل؛ لا تنشئ طلباً مكرراً.'),
            ]),
          )),
          Card(child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('العبارة المعتمدة', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              const SelectableText('أنا أريد الانضمام إلى مرحلة التوثيق البيومتري لأحصل على مكافأة ألف وخمسمائة بيتكوينز. الرجاء قبول التوثيق.'),
              const SizedBox(height: 8),
              const Text('سجّل صوتك وأنت تقرأ العبارة كاملة، ثم سجّل فيديو مدته من 3 إلى 5 ثوانٍ. الحد الأعلى للصوت 60 ثانية و5 MiB، وللفيديو 25 MiB.'),
            ]),
          )),
          CheckboxListTile(
            value: _consent,
            onChanged: _loading ? null : (value) => setState(() => _consent = value == true),
            title: const Text('أوافق على إرسال التسجيل الصوتي والفيديو الخاصين بي إلى Super Owner لمراجعة طلب التوثيق.'),
            subtitle: const Text('تظل الأدلة خاصة، ويُسجل الوصول والقرار، وتحذف الأدلة بعد القرار ما لم يوجد حجز قانوني نافذ.'),
            controlAffinity: ListTileControlAffinity.leading,
          ),
          if (_error != null) Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
          ),
          FilledButton.icon(
            onPressed: _loading || !_consent || closed || pending || _status?['status'] == 'verified'
                ? null : _runSubmission,
            icon: _loading
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.verified_user_outlined),
            label: Text(_loading ? 'جارٍ رفع الأدلة وفحصها...' : 'بدء طلب التوثيق وإرسال الأدلة'),
          ),
          TextButton.icon(
            onPressed: _loading ? null : _refreshStatus,
            icon: const Icon(Icons.refresh),
            label: const Text('تحديث الحالة'),
          ),
          const ListTile(
            leading: Icon(Icons.card_giftcard),
            title: Text('مكافأة القبول: 1,500 BetaCoins'),
            subtitle: Text('تُضاف تلقائياً بعد موافقة Super Owner فقط، مرة واحدة لكل دورة توثيق مقبولة.'),
          ),
        ],
      ),
    );
  }
}
