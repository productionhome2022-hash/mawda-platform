import 'dart:async';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:just_audio/just_audio.dart';
import 'package:record/record.dart';
import 'package:uuid/uuid.dart';

import '../services/audio_wav_encoder.dart';
import '../services/member_media_upload_service.dart';

/// Shared in-app microphone capture for authenticated member chats.
/// The server remains authoritative for room/direct-chat membership and media policy.
class ChatAudioComposerButton extends StatefulWidget {
  const ChatAudioComposerButton({
    super.key,
    required this.scope,
    required this.onSent,
    required this.onBusyChanged,
    required this.onError,
    this.enabled = true,
    this.recipientUid,
    this.roomId,
  }) : assert(scope == 'direct' || scope == 'room');

  final String scope;
  final String? recipientUid;
  final String? roomId;
  final Future<void> Function() onSent;
  final ValueChanged<bool> onBusyChanged;
  final ValueChanged<String> onError;
  final bool enabled;

  @override
  State<ChatAudioComposerButton> createState() => _ChatAudioComposerButtonState();
}

class _ChatAudioComposerButtonState extends State<ChatAudioComposerButton> {
  final AudioRecorder _recorder = AudioRecorder();
  final BytesBuilder _pcm = BytesBuilder(copy: false);
  StreamSubscription<Uint8List>? _subscription;
  Timer? _limit;
  bool _recording = false;
  bool _uploading = false;
  bool _stopping = false;

  static const int _maxPcmBytes = 8 * 1024 * 1024;
  static const Duration _maxDuration = Duration(seconds: 120);

  @override
  void dispose() {
    _limit?.cancel();
    unawaited(_subscription?.cancel());
    unawaited(_recorder.dispose());
    super.dispose();
  }

  void _setBusy(bool value) {
    if (mounted) setState(() => _uploading = value);
    widget.onBusyChanged(value || _recording);
  }

  Future<void> _start() async {
    if (_recording || _uploading || _stopping) return;
    try {
      if (!await _recorder.hasPermission()) {
        widget.onError('لم يتم منح إذن الميكروفون. يمكنك تفعيله من إعدادات الجهاز.');
        return;
      }
      _pcm.clear();
      final stream = await _recorder.startStream(const RecordConfig(
        encoder: AudioEncoder.pcm16bits,
        sampleRate: 24000,
        numChannels: 1,
        autoGain: true,
        echoCancel: true,
        noiseSuppress: true,
      ));
      _subscription = stream.listen(
        (chunk) {
          _pcm.add(chunk);
          if (_pcm.length > _maxPcmBytes) {
            unawaited(_stop());
          }
        },
        onError: (Object error) {
          widget.onError('توقف تسجيل الصوت بسبب خطأ في الميكروفون: $error');
          unawaited(_stop());
        },
      );
      if (!mounted) return;
      setState(() => _recording = true);
      widget.onBusyChanged(true);
      _limit = Timer(_maxDuration, () => unawaited(_stop()));
    } catch (error) {
      widget.onError('تعذر بدء التسجيل الصوتي: $error');
      widget.onBusyChanged(false);
    }
  }

  Future<void> _stop() async {
    if (!_recording || _stopping) return;
    _stopping = true;
    _limit?.cancel();
    _limit = null;
    MemberMediaUploadService? media;
    try {
      await _recorder.stop();
      await _subscription?.cancel();
      _subscription = null;
      final pcmBytes = _pcm.takeBytes();
      if (mounted) setState(() => _recording = false);
      if (pcmBytes.lengthInBytes < 2048) {
        throw const FormatException('التسجيل قصير جداً أو لم يلتقط صوتاً واضحاً.');
      }
      if (pcmBytes.lengthInBytes > _maxPcmBytes) {
        throw const FormatException('تجاوز التسجيل الحد الأقصى المسموح به.');
      }
      _setBusy(true);
      final wav = encodePcm16MonoToWav(pcmBytes);
      final file = XFile.fromData(
        wav,
        name: 'voice_${DateTime.now().millisecondsSinceEpoch}.wav',
        mimeType: 'audio/wav',
      );
      media = MemberMediaUploadService();
      final mediaId = await media.uploadChatAttachment(file: file, scope: widget.scope);
      await media.sendChatMediaAttachment(
        scope: widget.scope,
        mediaId: mediaId,
        clientMessageId: const Uuid().v4(),
        recipientUid: widget.recipientUid,
        roomId: widget.roomId,
      );
      await widget.onSent();
    } catch (error) {
      widget.onError('تعذر إرسال الرسالة الصوتية: $error');
    } finally {
      media?.close();
      _pcm.clear();
      _stopping = false;
      if (mounted) setState(() {
        _recording = false;
        _uploading = false;
      });
      widget.onBusyChanged(false);
    }
  }

  @override
  Widget build(BuildContext context) => IconButton(
        tooltip: _recording ? 'إيقاف التسجيل وإرسال الرسالة' : 'تسجيل رسالة صوتية',
        onPressed: _uploading ? null : (_recording ? _stop : (widget.enabled ? _start : null)),
        icon: _uploading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : Icon(
                _recording ? Icons.stop_circle : Icons.mic_none,
                color: _recording ? Theme.of(context).colorScheme.error : null,
              ),
      );
}

/// In-app audio playback using the short-lived URL already authorized by the
/// parent chat screen. No public or permanent Storage URL is exposed.
class ChatAudioMessagePlayer extends StatefulWidget {
  const ChatAudioMessagePlayer({
    super.key,
    required this.url,
    required this.messageId,
  });

  final String url;
  final String messageId;

  @override
  State<ChatAudioMessagePlayer> createState() => _ChatAudioMessagePlayerState();
}

class _ChatAudioMessagePlayerState extends State<ChatAudioMessagePlayer> {
  final AudioPlayer _player = AudioPlayer();
  StreamSubscription<PlayerState>? _subscription;
  bool _loading = false;
  bool _loaded = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _subscription = _player.playerStateStream.listen((_) {
      if (mounted) setState(() {});
    });
  }

  @override
  void didUpdateWidget(covariant ChatAudioMessagePlayer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.url != widget.url) {
      _loaded = false;
      _error = null;
      unawaited(_player.stop());
    }
  }

  @override
  void dispose() {
    unawaited(_subscription?.cancel());
    unawaited(_player.dispose());
    super.dispose();
  }

  Future<void> _toggle() async {
    if (_loading) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      if (_player.playing) {
        await _player.pause();
      } else {
        if (!_loaded) {
          await _player.setUrl(widget.url);
          _loaded = true;
        } else if (_player.processingState == ProcessingState.completed) {
          await _player.seek(Duration.zero);
        }
        unawaited(_player.play());
      }
    } catch (error) {
      _error = 'تعذر تشغيل الرسالة الصوتية داخل التطبيق: $error';
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) => SizedBox(
        width: 260,
        child: Card(
          child: ListTile(
            leading: const Icon(Icons.audiotrack),
            title: const Text('رسالة صوتية'),
            subtitle: Text(_error ?? (_player.playing ? 'جارٍ تشغيل الصوت' : 'تشغيل الصوت داخل المحادثة')),
            trailing: IconButton(
              tooltip: _player.playing ? 'إيقاف مؤقت' : 'تشغيل',
              onPressed: _loading ? null : _toggle,
              icon: _loading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Icon(_player.playing ? Icons.pause_circle_filled : Icons.play_circle_fill),
            ),
            onTap: _loading ? null : _toggle,
          ),
        ),
      );
}
