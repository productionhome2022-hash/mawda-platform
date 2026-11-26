import 'dart:async';

import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/widgets.dart';

/// Records authenticated foreground activity for the server-side capacity meter.
/// The server applies its own heartbeat rate limit and supplies the timestamp.
class MemberActivityMeter extends StatefulWidget {
  const MemberActivityMeter({super.key, required this.child});

  final Widget child;

  @override
  State<MemberActivityMeter> createState() => _MemberActivityMeterState();
}

class _MemberActivityMeterState extends State<MemberActivityMeter>
    with WidgetsBindingObserver {
  Timer? _heartbeatTimer;
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _startForegroundMeter();
  }

  void _startForegroundMeter() {
    _heartbeatTimer?.cancel();
    _recordHeartbeat();
    _heartbeatTimer = Timer.periodic(
      const Duration(seconds: 60),
      (_) => _recordHeartbeat(),
    );
  }

  void _stopForegroundMeter() {
    _heartbeatTimer?.cancel();
    _heartbeatTimer = null;
  }

  Future<void> _recordHeartbeat() async {
    if (_sending || !mounted) return;
    _sending = true;
    try {
      await FirebaseFunctions.instance
          .httpsCallable('recordMemberActivity')
          .call();
    } on FirebaseFunctionsException {
      // Metering is observational; it must never block member navigation.
    } catch (_) {
      // Network and transient service failures leave the measurement unknown.
    } finally {
      _sending = false;
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _startForegroundMeter();
    } else {
      _stopForegroundMeter();
    }
  }

  @override
  void dispose() {
    _stopForegroundMeter();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
