import 'dart:async';
import 'dart:convert';

import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';

class MawddaCallScreen extends StatefulWidget {
  const MawddaCallScreen({
    super.key,
    required this.callId,
    required this.scope,
    required this.targetId,
    required this.mode,
    required this.currentUserId,
    required this.outgoing,
  });

  final String callId;
  final String scope;
  final String targetId;
  final String mode;
  final String currentUserId;
  final bool outgoing;

  @override
  State<MawddaCallScreen> createState() => _MawddaCallScreenState();
}

class _MawddaCallScreenState extends State<MawddaCallScreen> {
  final FirebaseFunctions _functions = FirebaseFunctions.instance;
  final RTCVideoRenderer _localRenderer = RTCVideoRenderer();
  final RTCVideoRenderer _remoteRenderer = RTCVideoRenderer();
  final Set<String> _seenSignals = <String>{};
  final List<RTCIceCandidate> _pendingCandidates = <RTCIceCandidate>[];
  RTCPeerConnection? _peer;
  MediaStream? _localStream;
  Timer? _pollTimer;
  Future<void> _signalQueue = Future<void>.value();
  int _nextSignalSequence = 0;
  bool _remoteDescriptionReady = false;
  bool _answerCreated = false;
  bool _initializing = true;
  bool _ending = false;
  bool _muted = false;
  bool _cameraEnabled = true;
  String _status = 'جارٍ تجهيز الاتصال...';
  String? _failure;

  @override
  void initState() {
    super.initState();
    unawaited(_initializeCall());
  }

  Future<void> _initializeCall() async {
    try {
      await Future.wait([_localRenderer.initialize(), _remoteRenderer.initialize()]);
      final iceResponse = await _functions.httpsCallable('getCallIceConfiguration')
          .call({'callId': widget.callId});
      final iceData = Map<String, dynamic>.from(iceResponse.data as Map);
      final iceServers = (iceData['iceServers'] as List<dynamic>? ?? const [])
          .whereType<Map>()
          .map((server) => Map<String, dynamic>.from(server))
          .toList(growable: false);
      _peer = await createPeerConnection({
        'iceServers': iceServers,
        'sdpSemantics': 'unified-plan',
        'bundlePolicy': 'max-bundle',
        'rtcpMuxPolicy': 'require',
      });
      _localStream = await navigator.mediaDevices.getUserMedia({
        'audio': true,
        'video': widget.mode == 'video'
            ? <String, dynamic>{'facingMode': 'user', 'width': 640, 'height': 480, 'frameRate': 24}
            : false,
      });
      _localRenderer.srcObject = _localStream;
      for (final track in _localStream!.getTracks()) {
        await _peer!.addTrack(track, _localStream!);
      }
      _peer!.onTrack = (event) {
        if (event.streams.isNotEmpty) {
          _remoteRenderer.srcObject = event.streams.first;
          if (mounted) setState(() => _status = 'تم إنشاء مسار الوسائط');
        }
      };
      _peer!.onIceCandidate = (candidate) {
        if (candidate.candidate == null || candidate.candidate!.isEmpty) return;
        unawaited(_queueSignal('ice', candidate.toMap()));
      };
      _peer!.onConnectionState = (state) {
        if (!mounted) return;
        setState(() {
          switch (state) {
            case RTCPeerConnectionState.RTCPeerConnectionStateConnected:
              _status = 'المكالمة متصلة';
              break;
            case RTCPeerConnectionState.RTCPeerConnectionStateConnecting:
              _status = 'جارٍ إنشاء الاتصال...';
              break;
            case RTCPeerConnectionState.RTCPeerConnectionStateDisconnected:
              _status = 'انقطع الاتصال مؤقتاً؛ جارٍ محاولة الاستعادة';
              break;
            case RTCPeerConnectionState.RTCPeerConnectionStateFailed:
              _status = 'تعذر إنشاء الاتصال؛ تحقق من الشبكة وإعدادات TURN';
              break;
            case RTCPeerConnectionState.RTCPeerConnectionStateClosed:
              _status = 'انتهت المكالمة';
              break;
            default:
              break;
          }
        });
      };

      if (widget.outgoing) {
        await _functions.httpsCallable('startCall').call({
          'callId': widget.callId,
          'scope': widget.scope,
          'targetId': widget.targetId,
          'mode': widget.mode,
        });
        final offer = await _peer!.createOffer(<String, dynamic>{
          'offerToReceiveAudio': true,
          'offerToReceiveVideo': widget.mode == 'video',
        });
        await _peer!.setLocalDescription(offer);
        await _queueSignal('offer', offer.toMap());
      } else {
        await _functions.httpsCallable('respondToCall').call({
          'callId': widget.callId,
          'response': 'accept',
        });
      }
      if (!mounted) return;
      setState(() {
        _initializing = false;
        _status = widget.outgoing ? 'بانتظار رد الطرف الآخر...' : 'تم قبول المكالمة؛ جارٍ الاتصال...';
      });
      _pollTimer = Timer.periodic(const Duration(milliseconds: 900), (_) {
        unawaited(_pollSignals());
      });
      await _pollSignals();
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _initializing = false;
        _failure = error.toString();
        _status = 'تعذر بدء المكالمة';
      });
    }
  }

  Future<void> _queueSignal(String kind, Map<String, dynamic> payload) {
    final completer = Completer<void>();
    _signalQueue = _signalQueue.then((_) async {
      final sequence = _nextSignalSequence;
      await _functions.httpsCallable('sendCallSignal').call({
        'callId': widget.callId,
        'signal': {
          'kind': kind,
          'payload': jsonEncode(payload),
          'sequence': sequence,
        },
      });
      _nextSignalSequence += 1;
      completer.complete();
    }).catchError((Object error) {
      if (!completer.isCompleted) completer.completeError(error);
    });
    return completer.future;
  }

  Future<void> _pollSignals() async {
    if (_ending || _peer == null) return;
    try {
      final response = await _functions.httpsCallable('getCallSignals').call({
        'callId': widget.callId,
        'afterSequence': -1,
      });
      final data = Map<String, dynamic>.from(response.data as Map);
      final signals = (data['signals'] as List<dynamic>? ?? const []).whereType<Map>();
      for (final raw in signals) {
        final signal = Map<String, dynamic>.from(raw);
        final signalId = signal['signalId'] as String? ?? '';
        if (signalId.isEmpty || !_seenSignals.add(signalId)) continue;
        final kind = signal['kind'];
        final payloadText = signal['payload'];
        if (payloadText is! String) continue;
        final payload = Map<String, dynamic>.from(jsonDecode(payloadText) as Map);
        if (kind == 'offer' && !widget.outgoing && !_answerCreated) {
          await _peer!.setRemoteDescription(RTCSessionDescription(
            payload['sdp'] as String?, payload['type'] as String?,
          ));
          _remoteDescriptionReady = true;
          await _flushCandidates();
          final answer = await _peer!.createAnswer(<String, dynamic>{
            'offerToReceiveAudio': true,
            'offerToReceiveVideo': widget.mode == 'video',
          });
          await _peer!.setLocalDescription(answer);
          await _queueSignal('answer', answer.toMap());
          _answerCreated = true;
        } else if (kind == 'answer' && widget.outgoing && !_remoteDescriptionReady) {
          await _peer!.setRemoteDescription(RTCSessionDescription(
            payload['sdp'] as String?, payload['type'] as String?,
          ));
          _remoteDescriptionReady = true;
          await _flushCandidates();
        } else if (kind == 'ice') {
          final candidate = RTCIceCandidate(
            payload['candidate'] as String?,
            payload['sdpMid'] as String?,
            (payload['sdpMLineIndex'] as num?)?.toInt(),
          );
          if (_remoteDescriptionReady) {
            await _peer!.addCandidate(candidate);
          } else {
            _pendingCandidates.add(candidate);
          }
        }
      }
      final status = data['status'];
      if (status == 'rejected' || status == 'cancelled' || status == 'missed' || status == 'ended') {
        await _finish(notifyServer: false);
      }
    } catch (error) {
      if (mounted && !_ending) setState(() => _failure = 'تعذر مزامنة إشارات الاتصال: $error');
    }
  }

  Future<void> _flushCandidates() async {
    final pending = List<RTCIceCandidate>.from(_pendingCandidates);
    _pendingCandidates.clear();
    for (final candidate in pending) {
      await _peer?.addCandidate(candidate);
    }
  }

  Future<void> _toggleMicrophone() async {
    final tracks = _localStream?.getAudioTracks() ?? const <MediaStreamTrack>[];
    if (tracks.isEmpty) return;
    final next = !_muted;
    for (final track in tracks) {
      track.enabled = !next;
    }
    if (mounted) setState(() => _muted = next);
  }

  Future<void> _toggleCamera() async {
    final tracks = _localStream?.getVideoTracks() ?? const <MediaStreamTrack>[];
    if (tracks.isEmpty) return;
    final next = !_cameraEnabled;
    for (final track in tracks) {
      track.enabled = next;
    }
    if (mounted) setState(() => _cameraEnabled = next);
  }

  Future<void> _finish({bool notifyServer = true}) async {
    if (_ending) return;
    _ending = true;
    _pollTimer?.cancel();
    if (notifyServer) {
      try {
        await _functions.httpsCallable('endCall').call({'callId': widget.callId});
      } catch (_) {
        // Local media is always released even if the server is temporarily unreachable.
      }
    }
    for (final track in _localStream?.getTracks() ?? <MediaStreamTrack>[]) {
      await track.stop();
    }
    await _localStream?.dispose();
    await _peer?.close();
    await _peer?.dispose();
    _localRenderer.srcObject = null;
    _remoteRenderer.srcObject = null;
    await _localRenderer.dispose();
    await _remoteRenderer.dispose();
    if (mounted) Navigator.of(context).pop();
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    if (!_ending) {
      _ending = true;
      unawaited(_functions.httpsCallable('endCall').call({'callId': widget.callId})
          .catchError((Object _) => null));
      unawaited(_releaseMedia());
    }
    super.dispose();
  }

  Future<void> _releaseMedia() async {
    for (final track in _localStream?.getTracks() ?? <MediaStreamTrack>[]) {
      await track.stop();
    }
    await _localStream?.dispose();
    await _peer?.close();
    await _peer?.dispose();
    _localRenderer.srcObject = null;
    _remoteRenderer.srcObject = null;
    await _localRenderer.dispose();
    await _remoteRenderer.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isVideo = widget.mode == 'video';
    return Scaffold(
      appBar: AppBar(
        title: Text(isVideo ? 'مكالمة مرئية' : 'مكالمة صوتية'),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            tooltip: _muted ? 'تشغيل الميكروفون' : 'كتم الميكروفون',
            onPressed: _initializing ? null : _toggleMicrophone,
            icon: Icon(_muted ? Icons.mic_off : Icons.mic),
          ),
          if (isVideo)
            IconButton(
              tooltip: _cameraEnabled ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا',
              onPressed: _initializing ? null : _toggleCamera,
              icon: Icon(_cameraEnabled ? Icons.videocam : Icons.videocam_off),
            ),
        ],
      ),
      body: Stack(
        fit: StackFit.expand,
        children: [
          if (isVideo && _remoteRenderer.srcObject != null)
            RTCVideoView(_remoteRenderer, objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover)
          else
            Container(
              color: Theme.of(context).colorScheme.surfaceContainerHighest,
              child: Center(
                child: Icon(isVideo ? Icons.videocam : Icons.call,
                    size: 84, color: Theme.of(context).colorScheme.primary),
              ),
            ),
          if (isVideo && _localRenderer.srcObject != null)
            Positioned(
              top: 16, right: 16, width: 112, height: 160,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: RTCVideoView(_localRenderer,
                  mirror: true,
                  objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover),
              ),
            ),
          Positioned(
            left: 20, right: 20, bottom: 36,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(_status, textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.titleMedium),
                if (_failure != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(_failure!, textAlign: TextAlign.center,
                      style: TextStyle(color: Theme.of(context).colorScheme.error)),
                  ),
                const SizedBox(height: 24),
                FilledButton.icon(
                  style: FilledButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.error,
                    foregroundColor: Theme.of(context).colorScheme.onError,
                  ),
                  onPressed: _ending ? null : () => _finish(),
                  icon: const Icon(Icons.call_end),
                  label: const Text('إنهاء المكالمة'),
                ),
              ],
            ),
          ),
          if (_initializing)
            const Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }
}
