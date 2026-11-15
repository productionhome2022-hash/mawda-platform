import 'dart:async';
import 'dart:typed_data';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'package:record/record.dart';
import 'package:image_picker/image_picker.dart';
import '../services/member_media_upload_service.dart';
import '../services/audio_wav_encoder.dart';

class GuestRoomChatScreen extends StatefulWidget {
  const GuestRoomChatScreen({super.key, required this.roomId, required this.roomName});
  final String roomId;
  final String roomName;
  @override
  State<GuestRoomChatScreen> createState() => _GuestRoomChatScreenState();
}

class _GuestRoomChatScreenState extends State<GuestRoomChatScreen> {
  final _functions = FirebaseFunctions.instance;
  final _media = MemberMediaUploadService();
  final _message = TextEditingController();
  final _recorder = AudioRecorder();
  final _audioPlayer = AudioPlayer();
  StreamSubscription<Uint8List>? _recordingSubscription;
  StreamSubscription<PlayerState>? _playerStateSubscription;
  final BytesBuilder _recordedPcm = BytesBuilder(copy: false);
  Timer? _recordingLimit;
  bool _recording = false;
  bool _stoppingRecording = false;
  String? _playingMessageId;
  static const int _maxRecordingBytes = 8 * 1024 * 1024;
  List<Map<String, dynamic>> _messages = [];
  bool _loading = true, _busy = false;
  String? _error;
  Timer? _messagePoller;

  @override
  void initState() {
    super.initState();
    _load();
    _playerStateSubscription = _audioPlayer.playerStateStream.listen((state) {
      if (!mounted) return;
      if (state.processingState == ProcessingState.completed) {
        setState(() => _playingMessageId = null);
      }
    });
    _messagePoller = Timer.periodic(const Duration(seconds: 4), (_) {
      if (mounted && !_busy) _load(showLoading: false);
    });
  }
  @override
  void dispose() {
    _messagePoller?.cancel();
    _recordingLimit?.cancel();
    _recordingSubscription?.cancel();
    _playerStateSubscription?.cancel();
    unawaited(_recorder.dispose());
    unawaited(_audioPlayer.dispose());
    _message.dispose(); _media.close(); super.dispose();
  }

  Future<void> _load({bool showLoading = true}) async {
    if (mounted) setState(() { if (showLoading) _loading = true; _error = null; });
    try {
      final response = await _functions.httpsCallable('getRoomMessages').call({'roomId': widget.roomId});
      final data = Map<String, dynamic>.from(response.data as Map);
      final messages = (data['messages'] as List<dynamic>? ?? const [])
          .whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      if (mounted) setState(() { _messages = messages; _loading = false; });
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() { _error = e.message ?? 'تعذر تحميل الرسائل.'; _loading = false; });
    } catch (_) {
      if (mounted) setState(() { _error = 'تعذر تحميل الرسائل. ربما انتهت جلسة الزائر.'; _loading = false; });
    }
  }

  Future<void> _sendText() async {
    final content = _message.text.trim();
    if (content.isEmpty || _busy) return;
    setState(() => _busy = true);
    try {
      await _functions.httpsCallable('sendRoomMessage').call({
        'roomId': widget.roomId, 'content': content,
        'clientMessageId': 'guest_${DateTime.now().microsecondsSinceEpoch}',
      });
      _message.clear(); await _load(showLoading: false);
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _error = e.message ?? 'تعذر إرسال الرسالة النصية.');
    } finally { if (mounted) setState(() => _busy = false); }
  }

  Future<void> _startMicrophoneRecording() async {
    if (_busy || _recording) return;
    try {
      final permitted = await _recorder.hasPermission();
      if (!permitted) {
        if (mounted) setState(() => _error = 'لم تمنح إذن استخدام الميكروفون. يمكنك تفعيله من إعدادات الجهاز.');
        return;
      }
      _recordedPcm.clear();
      final stream = await _recorder.startStream(const RecordConfig(
        encoder: AudioEncoder.pcm16bits,
        sampleRate: 24000,
        numChannels: 1,
        autoGain: true,
        echoCancel: true,
        noiseSuppress: true,
      ));
      _recordingSubscription = stream.listen((chunk) {
        _recordedPcm.add(chunk);
        if (_recordedPcm.length > _maxRecordingBytes) {
          unawaited(_stopMicrophoneRecording());
        }
      }, onError: (Object error) {
        if (mounted) setState(() => _error = 'توقف تسجيل الصوت بسبب خطأ في الميكروفون: $error');
      });
      if (mounted) {
        setState(() { _recording = true; _error = null; });
        _recordingLimit = Timer(const Duration(seconds: 60), () {
          unawaited(_stopMicrophoneRecording());
        });
      }
    } catch (e) {
      if (mounted) setState(() => _error = 'تعذر بدء التسجيل الصوتي: $e');
    }
  }

  Future<void> _stopMicrophoneRecording() async {
    if (!_recording || _stoppingRecording) return;
    _stoppingRecording = true;
    _recordingLimit?.cancel();
    _recordingLimit = null;
    try {
      await _recorder.stop();
      await _recordingSubscription?.cancel();
      _recordingSubscription = null;
      final pcm = _recordedPcm.takeBytes();
      if (pcm.lengthInBytes < 2048) {
        if (mounted) setState(() { _recording = false; _error = 'التسجيل قصير جداً أو لم يلتقط صوتاً واضحاً.'; });
        return;
      }
      if (pcm.lengthInBytes > _maxRecordingBytes) {
        if (mounted) setState(() { _recording = false; _error = 'تجاوز التسجيل الحد الأقصى المسموح به.'; });
        return;
      }
      if (mounted) setState(() { _recording = false; _busy = true; _error = null; });
      final wav = encodePcm16MonoToWav(pcm);
      final file = XFile.fromData(
        wav,
        name: 'voice_${DateTime.now().millisecondsSinceEpoch}.wav',
        mimeType: 'audio/wav',
      );
      final mediaId = await _media.uploadChatAttachment(file: file, scope: 'room');
      await _media.sendChatMediaAttachment(
        scope: 'room', roomId: widget.roomId, mediaId: mediaId,
        clientMessageId: 'guest_mic_${DateTime.now().microsecondsSinceEpoch}',
      );
      await _load(showLoading: false);
    } catch (e) {
      if (mounted) setState(() => _error = 'تعذر إرسال التسجيل الصوتي: $e');
    } finally {
      _recordedPcm.clear();
      _stoppingRecording = false;
      if (mounted) setState(() { _recording = false; _busy = false; });
    }
  }

  Future<void> _openAudio(Map<String, dynamic> item) async {
    final messageId = item['messageId'] as String?;
    if (messageId == null) return;
    try {
      if (_playingMessageId == messageId && _audioPlayer.playing) {
        await _audioPlayer.pause();
        if (mounted) setState(() {});
        return;
      }
      if (_playingMessageId == messageId && _audioPlayer.processingState != ProcessingState.idle) {
        await _audioPlayer.play();
        return;
      }
      final url = await _media.getChatMediaAttachmentUrl(
        scope: 'room', roomId: widget.roomId,
        mediaId: item['mediaId'] as String, messageId: messageId,
      );
      await _audioPlayer.setUrl(url);
      if (mounted) setState(() => _playingMessageId = messageId);
      await _audioPlayer.play();
    } catch (e) {
      if (mounted) setState(() {
        _playingMessageId = null;
        _error = 'تعذر تشغيل الرسالة الصوتية داخل التطبيق: $e';
      });
    }
  }

  Future<void> _pickAudioFile() async {
    if (_busy || _recording) return;
    final picked = await FilePicker.platform.pickFiles(
      type: FileType.custom, allowedExtensions: const ['mp3', 'm4a', 'ogg', 'wav'],
      allowMultiple: false, withData: true,
    );
    if (picked == null || picked.files.isEmpty || !mounted) return;
    final selected = picked.files.single;
    final XFile? file = selected.path != null && selected.path!.isNotEmpty
        ? XFile(selected.path!, name: selected.name)
        : selected.bytes != null ? XFile.fromData(selected.bytes!, name: selected.name) : null;
    if (file == null) { setState(() => _error = 'تعذر قراءة الملف الصوتي.'); return; }
    setState(() { _busy = true; _error = null; });
    try {
      final mediaId = await _media.uploadChatAttachment(file: file, scope: 'room');
      await _media.sendChatMediaAttachment(
        scope: 'room', roomId: widget.roomId, mediaId: mediaId,
        clientMessageId: 'guest_audio_${DateTime.now().microsecondsSinceEpoch}',
      );
      await _load(showLoading: false);
    } catch (e) {
      if (mounted) setState(() => _error = 'تعذر إرسال الملف الصوتي: $e');
    } finally { if (mounted) setState(() => _busy = false); }
  }

  Widget _tile(Map<String, dynamic> item) {
    final sender = item['senderDisplayName'] as String? ?? 'عضو';
    if (item['type'] == 'attachment' && item['mediaCategory'] == 'audio' && item['mediaId'] is String) {
      return Card(child: ListTile(
        leading: const Icon(Icons.audiotrack), title: Text('رسالة صوتية • $sender'),
        subtitle: const Text('تشغيل الصوت داخل التطبيق'),
        trailing: IconButton(
          tooltip: _playingMessageId == item['messageId'] && _audioPlayer.playing ? 'إيقاف مؤقت' : 'تشغيل',
          onPressed: () => _openAudio(item),
          icon: Icon(_playingMessageId == item['messageId'] && _audioPlayer.playing
              ? Icons.pause_circle_filled : Icons.play_circle_fill),
        ),
        onTap: () => _openAudio(item),
      ));
    }
    return Card(child: Padding(
      padding: const EdgeInsets.all(12),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(sender, style: Theme.of(context).textTheme.labelSmall),
        const SizedBox(height: 4), SelectableText(item['content'] as String? ?? ''),
      ]),
    ));
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text(widget.roomName),
      actions: [IconButton(onPressed: _busy ? null : _load, icon: const Icon(Icons.refresh))]),
    body: Column(children: [
      const Padding(padding: EdgeInsets.all(10),
        child: Text('الغرفة العامة: النص والرسائل الصوتية فقط للزائر.')),
      if (_error != null) Padding(padding: const EdgeInsets.symmetric(horizontal: 12),
        child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error))),
      Expanded(child: _loading ? const Center(child: CircularProgressIndicator())
        : _messages.isEmpty ? const Center(child: Text('لا توجد رسائل بعد. ابدأ الحديث.'))
        : ListView.builder(padding: const EdgeInsets.all(12), itemCount: _messages.length,
            itemBuilder: (_, i) => _tile(_messages[i]))),
      SafeArea(child: Padding(
        padding: const EdgeInsets.fromLTRB(10, 6, 10, 10),
        child: Row(children: [
          IconButton(
            tooltip: _recording ? 'إيقاف التسجيل وإرساله' : 'تسجيل رسالة صوتية',
            onPressed: _busy ? null : (_recording ? _stopMicrophoneRecording : _startMicrophoneRecording),
            icon: Icon(_recording ? Icons.stop_circle : Icons.mic_none,
              color: _recording ? Theme.of(context).colorScheme.error : null),
          ),
          IconButton(tooltip: 'اختيار ملف صوتي', onPressed: (_busy || _recording) ? null : _pickAudioFile,
            icon: const Icon(Icons.audio_file)),
          Expanded(child: TextField(controller: _message, minLines: 1, maxLines: 4,
            textInputAction: TextInputAction.send, onSubmitted: (_) => _sendText(),
            decoration: const InputDecoration(hintText: 'اكتب رسالة', border: OutlineInputBorder()))),
          const SizedBox(width: 6),
          IconButton(onPressed: (_busy || _recording) ? null : _sendText,
            icon: _busy ? const SizedBox(width: 20, height: 20,
              child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.send)),
        ]),
      )),
    ]),
  );
}
