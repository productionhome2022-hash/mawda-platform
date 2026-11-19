import 'dart:io';

import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:record/record.dart';
import 'package:http/http.dart' as http;

class BiometricVerificationScreen extends StatefulWidget {
  const BiometricVerificationScreen({super.key});

  @override
  State<BiometricVerificationScreen> createState() => _BiometricVerificationScreenState();
}

class _BiometricVerificationScreenState extends State<BiometricVerificationScreen> {
  final AudioRecorder _recorder = AudioRecorder();
  final ImagePicker _picker = ImagePicker();
  String? _requestId;
  String? _phrase;
  String? _audioPath;
  XFile? _video;
  bool _recording = false;
  bool _busy = false;
  bool _consent = false;
  Map<String, dynamic>? _status;
  String? _message;

  @override
  void initState() {
    super.initState();
    _refreshStatus();
  }

  @override
  void dispose() {
    _recorder.dispose();
    super.dispose();
  }

  Future<void> _refreshStatus() async {
    try {
      final result = await FirebaseFunctions.instance
          .httpsCallable('getMyBiometricVerificationStatus').call();
      if (!mounted) return;
      setState(() {
        _status = Map<String, dynamic>.from(result.data as Map);
        _message = null;
      });
    } catch (_) {
      if (mounted) setState(() => _message = 'تعذر تحميل حالة التوثيق. تحقق من الاتصال ثم أعد المحاولة.');
    }
  }

  Future<void> _startRequest() async {
    if (!_consent || _busy || kIsWeb) return;
    setState(() { _busy = true; _message = null; });
    try {
      final result = await FirebaseFunctions.instance
          .httpsCallable('startBiometricVerificationRequest').call();
      final data = Map<String, dynamic>.from(result.data as Map);
      if (!mounted) return;
      setState(() {
        _requestId = data['requestId'] as String;
        _phrase = data['phraseText'] as String;
        _audioPath = null;
        _video = null;
        _message = 'اقرأ العبارة الظاهرة بصوت واضح، ثم سجّل مقطع فيديو حياً مدته من 3 إلى 5 ثوانٍ.';
      });
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _message = error.message ?? 'تعذر بدء طلب التوثيق.');
    } catch (_) {
      if (mounted) setState(() => _message = 'تعذر بدء طلب التوثيق.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _toggleAudio() async {
    if (_busy) return;
    try {
      if (_recording) {
        final path = await _recorder.stop();
        if (!mounted) return;
        setState(() { _recording = false; _audioPath = path; });
        return;
      }
      final allowed = await _recorder.hasPermission();
      if (!allowed) {
        setState(() => _message = 'يجب السماح باستخدام الميكروفون لإكمال التسجيل.');
        return;
      }
      final path = '${Directory.systemTemp.path}/mawdda-biometric-${DateTime.now().microsecondsSinceEpoch}.m4a';
      await _recorder.start(
        const RecordConfig(encoder: AudioEncoder.aacLc, sampleRate: 44100, bitRate: 128000),
        path: path,
      );
      if (mounted) setState(() { _recording = true; _audioPath = null; });
    } catch (_) {
      if (mounted) setState(() { _recording = false; _message = 'تعذر تسجيل الصوت. تحقق من إذن الميكروفون.'; });
    }
  }

  Future<void> _recordVideo() async {
    if (_busy) return;
    try {
      final file = await _picker.pickVideo(source: ImageSource.camera, maxDuration: const Duration(seconds: 5));
      if (file != null && mounted) setState(() => _video = file);
    } catch (_) {
      if (mounted) setState(() => _message = 'تعذر تشغيل الكاميرا أو تسجيل الفيديو.');
    }
  }

  Future<void> _uploadEvidence() async {
    if (_busy || _requestId == null || _audioPath == null || _video == null) return;
    setState(() { _busy = true; _message = null; });
    try {
      final access = await FirebaseFunctions.instance
          .httpsCallable('getMyBiometricVerificationUploadAccess')
          .call({'requestId': _requestId});
      final data = Map<String, dynamic>.from(access.data as Map);
      final audioBytes = await File(_audioPath!).readAsBytes();
      final videoBytes = await _video!.readAsBytes();
      final audioResponse = await http.put(
        Uri.parse(data['audioUploadUrl'] as String),
        headers: const {'Content-Type': 'audio/mp4'},
        body: audioBytes,
      );
      if (audioResponse.statusCode < 200 || audioResponse.statusCode >= 300) {
        throw Exception('AUDIO_UPLOAD_FAILED');
      }
      final videoResponse = await http.put(
        Uri.parse(data['videoUploadUrl'] as String),
        headers: const {'Content-Type': 'video/mp4'},
        body: videoBytes,
      );
      if (videoResponse.statusCode < 200 || videoResponse.statusCode >= 300) {
        throw Exception('VIDEO_UPLOAD_FAILED');
      }
      await _refreshStatus();
      if (mounted) {
        setState(() {
          _message = 'تم رفع الأدلة. سيظهر الطلب قيد المراجعة بعد اكتمال التحقق الخادمي من الملفين.';
          _requestId = null;
          _phrase = null;
          _audioPath = null;
          _video = null;
        });
      }
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _message = error.message ?? 'تعذر رفع أدلة التوثيق.');
    } catch (_) {
      if (mounted) setState(() => _message = 'تعذر رفع الأدلة أو فشل التحقق منها. يمكنك تحديث الحالة والمحاولة وفق الحالة المعروضة.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  String _statusLabel() {
    final status = _status?['requestStatus'];
    switch (status) {
      case 'uploading': return 'جارٍ رفع الأدلة';
      case 'pending_review': return 'طلب التوثيق قيد مراجعة Super Owner';
      case 'accepted': return 'تم قبول التوثيق البيومتري';
      case 'rejected': return 'لم يتم قبول الطلب';
      case 'locked': return 'التقديم متوقف مؤقتاً بعد استنفاد المحاولات';
      default: return _status?['verified'] == true ? 'التوثيق البيومتري ساري' : 'لا يوجد طلب توثيق نشط';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('التوثيق البيومتري')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('حالة حسابك', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              Text(_statusLabel()),
              if (_status?['expiresAtMs'] is num)
                Text('ينتهي التوثيق: ${DateTime.fromMillisecondsSinceEpoch((_status!['expiresAtMs'] as num).toInt()).toLocal()}'),
              Align(alignment: Alignment.centerRight, child: TextButton.icon(
                onPressed: _busy ? null : _refreshStatus,
                icon: const Icon(Icons.refresh), label: const Text('تحديث الحالة'),
              )),
            ]),
          )),
          const SizedBox(height: 12),
          const Card(child: Padding(
            padding: EdgeInsets.all(16),
            child: Text('التوثيق اختياري. ستُراجع الأدلة يدوياً من Super Owner. تُستخدم التسجيلات لهذا الطلب فقط، ولا تُنشأ منها بصمات صوتية أو قوالب وجه، ويبدأ حذف ملفات الأدلة بعد صدور القرار.'),
          )),
          if (kIsWeb)
            const Card(child: Padding(
              padding: EdgeInsets.all(16),
              child: Text('تسجيل الأدلة متاح حالياً من تطبيق Android أو iOS فقط.'),
            ))
          else ...[
            CheckboxListTile(
              value: _consent,
              onChanged: _busy ? null : (value) => setState(() => _consent = value == true),
              title: const Text('أوافق على تسجيل الصوت والفيديو واستخدامهما لمراجعة طلب التوثيق وفق سياسة الخصوصية الموضحة أعلاه.'),
              controlAffinity: ListTileControlAffinity.leading,
            ),
            FilledButton.icon(
              onPressed: _busy || !_consent || _requestId != null ? null : _startRequest,
              icon: const Icon(Icons.verified_user_outlined),
              label: const Text('بدء طلب التوثيق'),
            ),
            if (_phrase != null) ...[
              const SizedBox(height: 16),
              Card(child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('العبارة المطلوب قراءتها'),
                  const SizedBox(height: 8),
                  SelectableText(_phrase!, style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: _busy ? null : _toggleAudio,
                    icon: Icon(_recording ? Icons.stop_circle_outlined : Icons.mic_none),
                    label: Text(_recording ? 'إيقاف تسجيل الصوت' : _audioPath == null ? 'تسجيل العبارة الصوتية' : 'إعادة تسجيل الصوت'),
                  ),
                  if (_audioPath != null) const Text('تم تسجيل الصوت على الجهاز.'),
                  const SizedBox(height: 8),
                  OutlinedButton.icon(
                    onPressed: _busy ? null : _recordVideo,
                    icon: const Icon(Icons.videocam_outlined),
                    label: Text(_video == null ? 'تسجيل فيديو حي (3–5 ثوانٍ)' : 'إعادة تسجيل الفيديو'),
                  ),
                  if (_video != null) const Text('تم اختيار مقطع الفيديو.'),
                  const SizedBox(height: 12),
                  FilledButton.icon(
                    onPressed: _busy || _recording || _audioPath == null || _video == null ? null : _uploadEvidence,
                    icon: _busy ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.cloud_upload_outlined),
                    label: const Text('رفع الأدلة وإرسال الطلب'),
                  ),
                ]),
              )),
            ],
          ],
          if (_message != null) Padding(
            padding: const EdgeInsets.only(top: 12),
            child: Text(_message!, style: TextStyle(color: Theme.of(context).colorScheme.primary)),
          ),
        ],
      ),
    );
  }
}
