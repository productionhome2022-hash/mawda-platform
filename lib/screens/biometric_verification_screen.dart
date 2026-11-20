import 'dart:async';
import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:record/record.dart';

import '../services/member_media_upload_service.dart';

class BiometricVerificationScreen extends StatefulWidget {
  const BiometricVerificationScreen({super.key});

  @override
  State<BiometricVerificationScreen> createState() => _BiometricVerificationScreenState();
}

class _BiometricVerificationScreenState extends State<BiometricVerificationScreen> {
  final MemberMediaUploadService _service = MemberMediaUploadService();
  final ImagePicker _picker = ImagePicker();
  final AudioRecorder _recorder = AudioRecorder();
  Timer? _recordingTimer;
  bool _recording = false;
  XFile? _recordedAudio;
  Map<String, dynamic>? _status;
  Map<String, dynamic>? _request;
  bool _loading = false;
  bool _consent = false;
  String? _audioMediaId;
  String? _videoMediaId;
  String? _error;

  @override
  void initState() {
    super.initState();
    _refreshStatus();
  }

  @override
  void dispose() {
    _recordingTimer?.cancel();
    if (_recording) _recorder.stop();
    _recorder.dispose();
    _service.close();
    super.dispose();
  }

  Future<void> _refreshStatus() async {
    try {
      final value = await _service.getMyBiometricVerificationStatus();
      if (mounted) setState(() {
        _status = value;
        if (value['status'] == 'uploading' && value['requestId'] is String) {
          _request = {'requestId': value['requestId'], 'phrase': value['phrase'], 'uploadPurpose': 'biometric'};
          _audioMediaId = value['audioMediaId'] as String?;
          _videoMediaId = value['videoMediaId'] as String?;
        }
      });
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحميل حالة التوثيق من الخادم.');
    }
  }

  Future<void> _startRecording() async {
    if (_recording || _loading) return;
    try {
      if (!await _recorder.hasPermission()) throw StateError('لم يتم منح إذن الميكروفون.');
      final directory = await Directory.systemTemp.createTemp('mawdda-biometric-');
      final path = '${directory.path}/spoken-phrase.m4a';
      await _recorder.start(
        const RecordConfig(encoder: AudioEncoder.aacLc, bitRate: 128000, sampleRate: 44100, numChannels: 1),
        path: path,
      );
      if (!mounted) return;
      setState(() { _recording = true; _recordedAudio = null; });
      _recordingTimer?.cancel();
      _recordingTimer = Timer(const Duration(seconds: 60), _stopRecording);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    }
  }

  Future<void> _stopRecording() async {
    _recordingTimer?.cancel();
    try {
      final path = await _recorder.stop();
      if (mounted) {
        setState(() {
          _recording = false;
          _recordedAudio = path == null ? null : XFile(path, name: 'spoken-phrase.m4a', mimeType: 'audio/mp4');
        });
      }
      if (path == null && mounted) setState(() => _error = 'لم يُحفظ التسجيل الصوتي.');
    } catch (error) {
      if (mounted) setState(() { _recording = false; _error = error.toString(); });
    }
  }

  Future<XFile?> _pickAudio() async {
    if (_recordedAudio != null) return _recordedAudio;
    final picked = await FilePicker.platform.pickFiles(
      type: FileType.custom, allowedExtensions: const ['m4a'], withData: false,
    );
    final file = picked?.files.single;
    if (file == null || file.path == null) return null;
    return XFile(file.path!, name: file.name, mimeType: 'audio/mp4');
  }

  Future<XFile?> _pickVideo() => _picker.pickVideo(
    source: ImageSource.camera, maxDuration: const Duration(seconds: 5),
  );

  Future<void> _runSubmission() async {
    if (_loading || !_consent) return;
    setState(() { _loading = true; _error = null; });
    try {
      XFile? audioFile;
      XFile? videoFile;
      if (_request == null) {
        audioFile = await _pickAudio();
        if (audioFile == null) throw StateError('لم يتم اختيار تسجيل M4A.');
        videoFile = await _pickVideo();
        if (videoFile == null) throw StateError('لم يتم تسجيل فيديو التحقق.');
        final request = await _service.startBiometricVerificationRequest();
        if (!mounted) return;
        setState(() => _request = request);
      } else {
        if (_audioMediaId == null) {
          audioFile = await _pickAudio();
          if (audioFile == null) throw StateError('اختر تسجيل M4A لاستكمال الطلب المفتوح.');
        }
        if (_videoMediaId == null) {
          videoFile = await _pickVideo();
          if (videoFile == null) throw StateError('سجّل فيديو لاستكمال الطلب المفتوح.');
        }
      }
      final requestId = _request!['requestId'] as String;
      if (_audioMediaId == null && audioFile != null) {
        final mediaId = await _service.uploadBiometricAudio(file: audioFile, requestId: requestId);
        if (mounted) setState(() => _audioMediaId = mediaId);
      } else if (_audioMediaId != null) {
        await _service.waitForSafeAttachmentApproval(_audioMediaId!);
      }
      if (_videoMediaId == null && videoFile != null) {
        final mediaId = await _service.uploadBiometricVideo(file: videoFile, requestId: requestId);
        if (mounted) setState(() => _videoMediaId = mediaId);
      } else if (_videoMediaId != null) {
        await _service.waitForSafeAttachmentApproval(_videoMediaId!);
      }
      await _service.submitBiometricVerificationRequest(requestId: requestId);
      final recordedPath = _recordedAudio?.path;
      if (recordedPath != null) await File(recordedPath).delete().catchError((_) => File(recordedPath));
      if (mounted) setState(() { _request = null; _audioMediaId = null; _videoMediaId = null; _recordedAudio = null; });
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
      case 'expired': return 'انتهت صلاحية التوثيق ويمكنك التجديد';
      case 'uploading': return 'طلب مفتوح؛ يمكنك استكمال رفع الأدلة';
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
          if (_status?['status'] == 'uploading') const Text('استكمال الطلب المفتوح: ستُرفع الأدلة الناقصة فقط، ولن يبدأ طلب أو محاولة جديدة.'),
              if (pending) const Text('لديك طلب مفتوح بالفعل؛ لا تنشئ طلباً مكرراً.'),
            ]),
          )),
          Card(child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('التسجيل الصوتي', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              Text(_recording
                  ? 'التسجيل جارٍ الآن. اقرأ العبارة بوضوح؛ سيتوقف تلقائياً عند 60 ثانية.'
                  : _recordedAudio != null
                      ? 'تم تجهيز تسجيلك الصوتي. يمكنك إعادة تسجيله إذا رغبت.'
                      : 'سجّل العبارة داخل التطبيق، أو اختر ملف M4A جاهزاً عند بدء الطلب.'),
              const SizedBox(height: 8),
              Wrap(spacing: 8, children: [
                FilledButton.icon(
                  onPressed: _loading ? null : (_recording ? _stopRecording : _startRecording),
                  icon: Icon(_recording ? Icons.stop_circle_outlined : Icons.mic_none),
                  label: Text(_recording ? 'إيقاف التسجيل' : 'تسجيل العبارة (حتى 60 ثانية)'),
                ),
                if (_recordedAudio != null && !_recording)
                  TextButton.icon(
                    onPressed: _loading ? null : () => setState(() => _recordedAudio = null),
                    icon: const Icon(Icons.refresh),
                    label: const Text('إعادة التسجيل'),
                  ),
              ]),
            ]),
          )),
          Card(child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('العبارة المعتمدة', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              SelectableText((_request?['phrase'] as String?) ?? 'أنا أريد الانضمام إلى مرحلة التوثيق البيومتري لأحصل على مكافأة ألف وخمسمائة بيتكوينز. الرجاء قبول التوثيق.'),
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
