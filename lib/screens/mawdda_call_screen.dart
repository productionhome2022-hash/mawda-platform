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
  final Map<String, RTCVideoRenderer> _remoteRenderers = {};
  final Map<String, RTCPeerConnection> _peers = {};
  final Map<String, int> _nextSequences = {};
  final Map<String, Future<void>> _signalQueues = {};
  final Map<String, List<RTCIceCandidate>> _pendingCandidates = {};
  final Set<String> _seenSignals = {};
  final Set<String> _remoteDescriptionsReady = {};
  MediaStream? _localStream;
  Timer? _pollTimer;
  Timer? _iceRefreshTimer;
  List<String> _remoteUids = [];
  List<Map<String, dynamic>> _iceServers = [];
  bool _initializing = true;
  bool _ending = false;
  bool _mediaReleased = false;
  bool _muted = false;
  bool _cameraEnabled = true;
  bool _turnConfigured = false;
  String? _lastSignalCursor;
  bool _polling = false;
  bool _connectedReportSent = false;
  String _status = 'جارٍ تجهيز الاتصال...';
  String? _failure;

  @override
  void initState() {
    super.initState();
    unawaited(_initializeCall());
  }

  Future<void> _initializeCall() async {
    try {
      await _localRenderer.initialize();
      if (widget.outgoing) {
        final started = await _functions.httpsCallable('startCall').call({
          'callId': widget.callId,
          'scope': widget.scope,
          'targetId': widget.targetId,
          'mode': widget.mode,
        });
        final data = Map<String, dynamic>.from(started.data as Map);
        _remoteUids = (data['participantUids'] as List<dynamic>? ?? const [])
            .whereType<String>()
            .where((uid) => uid != widget.currentUserId)
            .toList(growable: false);
      } else {
        final active = await _functions.httpsCallable('getActiveCall').call();
        final data = Map<String, dynamic>.from(active.data as Map);
        if (data['active'] != true || data['callId'] != widget.callId) {
          throw StateError('المكالمة لم تعد نشطة.');
        }
        final callerUid = data['callerUid'];
        if (callerUid is! String || callerUid.isEmpty) {
          throw StateError('تعذر تحديد صاحب المكالمة.');
        }
        _remoteUids = [callerUid];
        await _functions.httpsCallable('respondToCall').call({
          'callId': widget.callId,
          'response': 'accept',
        });
      }
      if (_remoteUids.isEmpty) throw StateError('لا يوجد طرف آخر متاح للمكالمة.');

      final iceResponse = await _functions.httpsCallable('getCallIceConfiguration')
          .call({'callId': widget.callId});
      final iceData = Map<String, dynamic>.from(iceResponse.data as Map);
      _turnConfigured = iceData['turnConfigured'] == true;
      _iceServers = (iceData['iceServers'] as List<dynamic>? ?? const [])
          .whereType<Map>()
          .map((server) => Map<String, dynamic>.from(server))
          .toList(growable: false);
      _localStream = await navigator.mediaDevices.getUserMedia({
        'audio': true,
        'video': widget.mode == 'video'
            ? <String, dynamic>{'facingMode': 'user', 'width': 640, 'height': 480, 'frameRate': 24}
            : false,
      });
      _localRenderer.srcObject = _localStream;

      for (final remoteUid in _remoteUids) {
        final peer = await _createPeer(remoteUid, _iceServers);
        if (widget.outgoing) {
          final offer = await peer.createOffer(<String, dynamic>{
            'offerToReceiveAudio': true,
            'offerToReceiveVideo': widget.mode == 'video',
          });
          await peer.setLocalDescription(offer);
          await _queueSignal(remoteUid, 'offer', offer.toMap());
        }
      }

      if (!mounted) return;
      setState(() {
        _initializing = false;
        _status = widget.outgoing ? 'بانتظار انضمام الطرف الآخر...' : 'تم قبول المكالمة؛ جارٍ الاتصال...';
      });
      _pollTimer = Timer.periodic(const Duration(milliseconds: 900), (_) {
        unawaited(_pollSignals());
      });
      _iceRefreshTimer = Timer.periodic(const Duration(minutes: 10), (_) {
        unawaited(_refreshIceConfiguration());
      });
      await _pollSignals();
    } catch (error) {
      _pollTimer?.cancel();
      try {
        await _functions.httpsCallable('endCall').call({'callId': widget.callId});
      } catch (_) {}
      await _releaseMedia();
      if (!mounted) return;
      setState(() {
        _initializing = false;
        _failure = error.toString();
        _status = 'تعذر بدء المكالمة';
      });
    }
  }

  Future<RTCPeerConnection> _createPeer(
    String remoteUid,
    List<Map<String, dynamic>> iceServers,
  ) async {
    final existing = _peers[remoteUid];
    if (existing != null) return existing;
    final peer = await createPeerConnection({
      'iceServers': iceServers,
      'sdpSemantics': 'unified-plan',
      'bundlePolicy': 'max-bundle',
      'rtcpMuxPolicy': 'require',
    });
    _peers[remoteUid] = peer;
    for (final track in _localStream?.getTracks() ?? <MediaStreamTrack>[]) {
      await peer.addTrack(track, _localStream!);
    }
    peer.onTrack = (event) {
      if (event.streams.isEmpty) return;
      unawaited(_attachRemoteStream(remoteUid, event.streams.first));
    };
    peer.onIceCandidate = (candidate) {
      if (candidate.candidate == null || candidate.candidate!.isEmpty) return;
      unawaited(_queueSignal(remoteUid, 'ice', candidate.toMap()));
    };
    peer.onConnectionState = (state) {
      if (!mounted) return;
      if (state == RTCPeerConnectionState.RTCPeerConnectionStateConnected &&
          !_connectedReportSent) {
        _connectedReportSent = true;
        unawaited(_confirmServerConnected());
      }
      setState(() {
        if (state == RTCPeerConnectionState.RTCPeerConnectionStateConnected) {
          _status = 'تم اتصال الشبكة؛ جارٍ تثبيت بدء المدة من الخادم...';
        } else if (state == RTCPeerConnectionState.RTCPeerConnectionStateConnecting) {
          _status = 'جارٍ إنشاء الاتصال...';
        } else if (state == RTCPeerConnectionState.RTCPeerConnectionStateDisconnected) {
          _status = 'انقطع الاتصال مؤقتاً؛ جارٍ محاولة الاستعادة';
        } else if (state == RTCPeerConnectionState.RTCPeerConnectionStateFailed) {
          _status = 'تعذر إنشاء الاتصال؛ تحقق من الشبكة وإعدادات TURN';
        } else if (state == RTCPeerConnectionState.RTCPeerConnectionStateClosed) {
          _status = 'انتهى الاتصال';
        }
      });
    };
    return peer;
  }

  Future<void> _confirmServerConnected() async {
    try {
      final response = await _functions.httpsCallable('markCallConnected').call({
        'callId': widget.callId,
      });
      final data = Map<String, dynamic>.from(response.data as Map);
      if (!mounted) return;
      setState(() {
        _status = data['connected'] == true
            ? 'المكالمة متصلة — الحد الأقصى 5 دقائق'
            : 'تم تأكيد طرف واحد؛ بانتظار تأكيد اتصال الطرف الآخر';
      });
    } catch (error) {
      _connectedReportSent = false;
      if (mounted && !_ending) {
        setState(() => _failure = 'تعذر تثبيت بدء مدة المكالمة من الخادم: $error');
      }
    }
  }

  Future<void> _attachRemoteStream(String uid, MediaStream stream) async {
    final renderer = _remoteRenderers.putIfAbsent(uid, RTCVideoRenderer.new);
    await renderer.initialize();
    renderer.srcObject = stream;
    if (mounted) setState(() {});
  }

  Future<void> _queueSignal(String toUid, String kind, Map<String, dynamic> payload) {
    final previous = _signalQueues[toUid] ?? Future<void>.value();
    final next = previous.then((_) async {
      final sequence = _nextSequences[toUid] ?? 0;
      await _functions.httpsCallable('sendCallSignal').call({
        'callId': widget.callId,
        'toUid': toUid,
        'signal': {
          'kind': kind,
          'payload': jsonEncode(payload),
          'sequence': sequence,
        },
      });
      _nextSequences[toUid] = sequence + 1;
    });
    _signalQueues[toUid] = next.catchError((Object error) {
      if (mounted) setState(() => _failure = 'تعذر إرسال إشارة الاتصال: $error');
    });
    return _signalQueues[toUid]!;
  }


  Future<void> _refreshIceConfiguration() async {
    if (_ending || _peers.isEmpty) return;
    try {
      final response = await _functions.httpsCallable('getCallIceConfiguration')
          .call({'callId': widget.callId});
      final data = Map<String, dynamic>.from(response.data as Map);
      final servers = (data['iceServers'] as List<dynamic>? ?? const [])
          .whereType<Map>()
          .map((server) => Map<String, dynamic>.from(server))
          .toList(growable: false);
      _iceServers = servers;
      for (final peer in _peers.values) {
        await peer.setConfiguration({
          'iceServers': _iceServers,
          'sdpSemantics': 'unified-plan',
          'bundlePolicy': 'max-bundle',
          'rtcpMuxPolicy': 'require',
        });
      }
    } catch (error) {
      if (mounted && !_ending) {
        setState(() => _failure = 'تعذر تحديث بيانات خادم الاتصال: $error');
      }
    }
  }

  Future<void> _pollSignals() async {
    if (_ending || _peers.isEmpty || _polling) return;
    if (!_connectedReportSent && _peers.values.any((peer) =>
        peer.connectionState == RTCPeerConnectionState.RTCPeerConnectionStateConnected)) {
      _connectedReportSent = true;
      unawaited(_confirmServerConnected());
    }
    _polling = true;
    try {
      final response = await _functions.httpsCallable('getCallSignals').call({
        'callId': widget.callId,
        'afterSequence': -1,
        if (_lastSignalCursor != null) 'afterSignalId': _lastSignalCursor,
      });
      final data = Map<String, dynamic>.from(response.data as Map);
      final signals = (data['signals'] as List<dynamic>? ?? const []).whereType<Map>();
      for (final raw in signals) {
        final signal = Map<String, dynamic>.from(raw);
        final signalId = signal['signalId'] as String? ?? '';
        final senderUid = signal['senderUid'] as String? ?? '';
        final kind = signal['kind'];
        final payloadText = signal['payload'];
        if (signalId.isEmpty || senderUid.isEmpty || !_seenSignals.add(signalId) ||
            payloadText is! String || !_remoteUids.contains(senderUid)) continue;
        final payload = Map<String, dynamic>.from(jsonDecode(payloadText) as Map);
        final peer = _peers[senderUid] ?? await _createPeer(senderUid, _iceServers);
        if (kind == 'offer' && !widget.outgoing && !_remoteDescriptionsReady.contains(senderUid)) {
          await peer.setRemoteDescription(RTCSessionDescription(
            payload['sdp'] as String?, payload['type'] as String?,
          ));
          _remoteDescriptionsReady.add(senderUid);
          await _flushCandidates(senderUid, peer);
          final answer = await peer.createAnswer(<String, dynamic>{
            'offerToReceiveAudio': true,
            'offerToReceiveVideo': widget.mode == 'video',
          });
          await peer.setLocalDescription(answer);
          await _queueSignal(senderUid, 'answer', answer.toMap());
        } else if (kind == 'answer' && widget.outgoing &&
            !_remoteDescriptionsReady.contains(senderUid)) {
          await peer.setRemoteDescription(RTCSessionDescription(
            payload['sdp'] as String?, payload['type'] as String?,
          ));
          _remoteDescriptionsReady.add(senderUid);
          await _flushCandidates(senderUid, peer);
        } else if (kind == 'ice') {
          final candidate = RTCIceCandidate(
            payload['candidate'] as String?,
            payload['sdpMid'] as String?,
            (payload['sdpMLineIndex'] as num?)?.toInt(),
          );
          if (_remoteDescriptionsReady.contains(senderUid)) {
            await peer.addCandidate(candidate);
          } else {
            (_pendingCandidates[senderUid] ??= []).add(candidate);
          }
        }
      }
      final nextCursor = data['nextCursor'];
      if (nextCursor is String && nextCursor.isNotEmpty) _lastSignalCursor = nextCursor;
      if (data['status'] == 'ended' || data['status'] == 'cancelled' ||
          data['status'] == 'missed' || data['status'] == 'rejected') {
        await _finish(notifyServer: false);
      }
    } catch (error) {
      if (mounted && !_ending) setState(() => _failure = 'تعذر مزامنة إشارات الاتصال: $error');
    } finally {
      _polling = false;
    }
  }

  Future<void> _flushCandidates(String uid, RTCPeerConnection peer) async {
    final pending = List<RTCIceCandidate>.from(_pendingCandidates.remove(uid) ?? const []);
    for (final candidate in pending) {
      await peer.addCandidate(candidate);
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

  Future<void> _releaseMedia() async {
    if (_mediaReleased) return;
    _mediaReleased = true;
    for (final track in _localStream?.getTracks() ?? <MediaStreamTrack>[]) {
      try { await track.stop(); } catch (_) {}
    }
    try { await _localStream?.dispose(); } catch (_) {}
    for (final peer in _peers.values) {
      try { await peer.close(); } catch (_) {}
      try { await peer.dispose(); } catch (_) {}
    }
    for (final renderer in _remoteRenderers.values) {
      try { renderer.srcObject = null; } catch (_) {}
      try { await renderer.dispose(); } catch (_) {}
    }
    _remoteRenderers.clear();
    try { _localRenderer.srcObject = null; } catch (_) {}
    try { await _localRenderer.dispose(); } catch (_) {}
  }

  Future<void> _finish({bool notifyServer = true}) async {
    if (_ending) return;
    _ending = true;
    _pollTimer?.cancel();
    _iceRefreshTimer?.cancel();
    if (notifyServer) {
      try {
        await _functions.httpsCallable('endCall').call({'callId': widget.callId});
      } catch (_) {
        // Local media must be released even if the signaling service is offline.
      }
    }
    await _releaseMedia();
    if (mounted) Navigator.of(context).pop();
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _iceRefreshTimer?.cancel();
    if (!_ending) {
      _ending = true;
      unawaited(() async {
        try {
          await _functions.httpsCallable('endCall').call({'callId': widget.callId});
        } catch (_) {}
      }());
      unawaited(_releaseMedia());
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isVideo = widget.mode == 'video';
    final renderers = _remoteRenderers.values.toList(growable: false);
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
          if (isVideo && renderers.isNotEmpty)
            GridView.count(
              crossAxisCount: renderers.length == 1 ? 1 : 2,
              children: renderers.map((renderer) => RTCVideoView(
                renderer,
                objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover,
              )).toList(),
            )
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
                child: RTCVideoView(_localRenderer, mirror: true,
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
                if (!_turnConfigured)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      'خادم TURN غير مهيأ بعد؛ قد لا ينجح الاتصال عبر بعض الشبكات.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Theme.of(context).colorScheme.error),
                    ),
                  ),
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
          if (_initializing) const Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }
}
