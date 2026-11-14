import 'dart:async';

import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

class RewardCenterScreen extends StatefulWidget {
  const RewardCenterScreen({super.key});
  @override
  State<RewardCenterScreen> createState() => _RewardCenterScreenState();
}

class _RewardCenterScreenState extends State<RewardCenterScreen> with WidgetsBindingObserver {
  final FirebaseFunctions _functions = FirebaseFunctions.instance;
  Map<String, dynamic> _policy = {};
  Map<String, dynamic> _claimed = {};
  List<Map<String, dynamic>> _campaigns = [];
  bool _loading = true, _busy = false, _foreground = true, _heartbeatBusy = false;
  Timer? _heartbeatTimer;
  Map<String, dynamic>? _activeSession;
  int _heartbeatSequence = 0, _eligibleMs = 0, _requiredMs = 0;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _load();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _heartbeatTimer?.cancel();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    _foreground = state == AppLifecycleState.resumed;
    if (_activeSession != null) unawaited(_sendHeartbeat(foreground: _foreground));
  }

  Future<void> _load() async {
    if (mounted) setState(() { _loading = true; _error = null; });
    try {
      final activeResponse = await _functions.httpsCallable('getActiveTimedAdSession').call();
      final activeData = Map<String, dynamic>.from(activeResponse.data as Map);
      final response = await _functions.httpsCallable('getRewardCenter').call();
      final data = Map<String, dynamic>.from(response.data as Map);
      if (!mounted) return;
      final restoredSession = activeData['active'] == true ? activeData : null;
      setState(() {
        _policy = Map<String, dynamic>.from(data['attendancePolicy'] as Map? ?? const {});
        _claimed = Map<String, dynamic>.from(data['attendanceClaimed'] as Map? ?? const {});
        _campaigns = (data['activeCampaigns'] as List<dynamic>? ?? const [])
            .whereType<Map>().map((item) => Map<String, dynamic>.from(item)).toList(growable: false);
        _activeSession = restoredSession;
        if (restoredSession != null) {
          _heartbeatSequence = (restoredSession['heartbeatSequence'] as num?)?.toInt() ?? 0;
          _eligibleMs = (restoredSession['eligibleMs'] as num?)?.toInt() ?? 0;
          _requiredMs = ((restoredSession['durationSeconds'] as num?)?.toInt() ?? 0) * 1000;
        }
      });
      if (restoredSession != null) {
        _heartbeatTimer?.cancel();
        _heartbeatTimer = Timer.periodic(const Duration(seconds: 5), (_) {
          if (_foreground) unawaited(_sendHeartbeat(foreground: true));
        });
      }
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحميل مركز المكافآت.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحميل مركز المكافآت. تحقق من الاتصال.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _claimAttendance(String type) async {
    if (_busy || _claimed[type] == true) return;
    setState(() { _busy = true; _error = null; });
    try {
      final response = await _functions.httpsCallable('claimAttendanceReward').call({'type': type});
      final data = Map<String, dynamic>.from(response.data as Map);
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(data['idempotentReplay'] == true
            ? 'تم تسجيل هذه المكافأة مسبقاً.'
            : 'أضيفت ${data['amountCoins'] ?? 0} كوين إلى محفظتك.'),
      ));
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذرت المطالبة بالمكافأة.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _startCampaign(Map<String, dynamic> campaign) async {
    if (_busy || _activeSession != null) return;
    setState(() { _busy = true; _error = null; });
    try {
      final response = await _functions.httpsCallable('startTimedAdvertisement').call({
        'campaignId': campaign['campaignId'],
      });
      final session = Map<String, dynamic>.from(response.data as Map);
      if (!mounted) return;
      setState(() {
        _activeSession = session;
        _heartbeatSequence = 0;
        _eligibleMs = 0;
        _requiredMs = ((session['durationSeconds'] as num?)?.toInt() ?? 0) * 1000;
      });
      _heartbeatTimer?.cancel();
      _heartbeatTimer = Timer.periodic(const Duration(seconds: 5), (_) {
        if (_foreground) unawaited(_sendHeartbeat(foreground: true));
      });
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر بدء مشاهدة الإعلان.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _sendHeartbeat({required bool foreground}) async {
    final session = _activeSession;
    if (session == null || _heartbeatBusy) return;
    _heartbeatBusy = true;
    final nextSequence = _heartbeatSequence + 1;
    try {
      final response = await _functions.httpsCallable('heartbeatTimedAdvertisement').call({
        'sessionId': session['sessionId'],
        'sequence': nextSequence,
        'foreground': foreground,
        'visible': true,
      });
      final data = Map<String, dynamic>.from(response.data as Map);
      if (!mounted || _activeSession == null) return;
      _heartbeatSequence = nextSequence;
      setState(() => _eligibleMs = (data['eligibleMs'] as num?)?.toInt() ?? _eligibleMs);
      final remaining = (data['remainingMs'] as num?)?.toInt() ?? 1;
      if (remaining <= 0) await _completeCampaign();
    } on FirebaseFunctionsException catch (error) {
      if (error.code == 'deadline-exceeded' || error.code == 'failed-precondition') {
        _heartbeatTimer?.cancel();
        if (!mounted) return;
        setState(() { _activeSession = null; _eligibleMs = 0; _requiredMs = 0; });
        await _load();
      }
    } catch (_) {
      // Reconcile sequence state if a response was lost after the server committed it.
      try {
        final status = await _functions.httpsCallable('getActiveTimedAdSession').call();
        final data = Map<String, dynamic>.from(status.data as Map);
        if (data['active'] == true && mounted) {
          _heartbeatSequence = (data['heartbeatSequence'] as num?)?.toInt() ?? _heartbeatSequence;
          _eligibleMs = (data['eligibleMs'] as num?)?.toInt() ?? _eligibleMs;
          setState(() {});
        }
      } catch (_) { /* Fail closed: no local progress is credited. */ }
    } finally {
      _heartbeatBusy = false;
    }
  }

  Future<void> _completeCampaign() async {
    final session = _activeSession;
    if (session == null || !mounted) return;
    try {
      final response = await _functions.httpsCallable('completeTimedAdvertisement').call({
        'sessionId': session['sessionId'],
      });
      final result = Map<String, dynamic>.from(response.data as Map);
      _heartbeatTimer?.cancel();
      if (!mounted) return;
      setState(() { _activeSession = null; _eligibleMs = 0; _requiredMs = 0; });
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(result['idempotentReplay'] == true
            ? 'تم تسجيل مشاهدة الإعلان مسبقاً.'
            : 'اكتملت المشاهدة وأضيفت ${result['amountCoins'] ?? 0} كوين إلى محفظتك.'),
      ));
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'لم يثبت الخادم اكتمال المشاهدة بعد.');
    }
  }

  Widget _attendanceCard(String type, String title, IconData icon) {
    final rule = Map<String, dynamic>.from(_policy[type] as Map? ?? const {});
    final enabled = rule['enabled'] == true && (rule['amountCoins'] as num? ?? 0) > 0;
    final claimed = _claimed[type] == true;
    return Card(child: ListTile(
      leading: Icon(icon),
      title: Text(title),
      subtitle: Text(enabled ? 'المكافأة: ${rule['amountCoins']} كوين' : 'المكافأة غير مفعّلة حالياً'),
      trailing: FilledButton(
        onPressed: !enabled || claimed || _busy || _activeSession != null
            ? null : () => _claimAttendance(type),
        child: Text(claimed ? 'تم الاستلام' : 'استلام'),
      ),
    ));
  }

  Widget _lockedAdView() {
    final progress = _requiredMs <= 0 ? 0.0 : (_eligibleMs / _requiredMs).clamp(0.0, 1.0).toDouble();
    final session = _activeSession!;
    return PopScope(
      canPop: false,
      child: Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          title: const Text('مشاهدة إعلان المكافأة'),
          actions: const [Padding(padding: EdgeInsets.symmetric(horizontal: 12), child: Icon(Icons.lock_outline))],
        ),
        body: Center(child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 520),
          child: Padding(padding: const EdgeInsets.all(24), child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(Icons.campaign_outlined, size: 56),
              const SizedBox(height: 16),
              Text(session['title'] as String? ?? 'إعلان مودة',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
              Text(session['sponsorLabel'] as String? ?? '', textAlign: TextAlign.center),
              const SizedBox(height: 12),
              Text(session['body'] as String? ?? '', textAlign: TextAlign.center),
              const SizedBox(height: 16),
              const Text('المشاهدة قيد التحقق', textAlign: TextAlign.center,
                style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Text('ابقَ في هذه الشاشة والتطبيق في المقدمة. يتوقف احتساب الوقت عند إخفاء الإعلان أو مغادرة التطبيق أو انقطاع نبضات التحقق.',
                textAlign: TextAlign.center),
              const SizedBox(height: 20),
              LinearProgressIndicator(value: progress),
              const SizedBox(height: 8),
              Text('${(_eligibleMs / 1000).floor()} / ${(_requiredMs / 1000).ceil()} ثانية معتمدة من الخادم',
                textAlign: TextAlign.center),
              const SizedBox(height: 12),
              Text('المكافأة: ${session['rewardCoins'] ?? 0} كوين', textAlign: TextAlign.center),
              const SizedBox(height: 8),
              const Text('لا يوجد زر تخطي أو مطالبة يدوية؛ يمنح الخادم المكافأة بعد التحقق من المدة.',
                textAlign: TextAlign.center, style: TextStyle(fontSize: 12)),
            ],
          )),
        )),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_activeSession != null) return _lockedAdView();
    return Scaffold(
      appBar: AppBar(
        title: const Text('مركز المكافآت'),
        actions: [IconButton(onPressed: _loading ? null : _load, icon: const Icon(Icons.refresh))],
      ),
      body: _loading ? const Center(child: CircularProgressIndicator()) : RefreshIndicator(
        onRefresh: _load,
        child: ListView(padding: const EdgeInsets.all(16), children: [
          if (_error != null) Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
          ),
          Text('مكافآت الحضور', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          const Text('تُحسب الفترات بتوقيت UTC من الخادم، ولا يمكن استلام المكافأة أكثر من مرة في الفترة نفسها.'),
          _attendanceCard('hourly', 'الحضور الساعي', Icons.schedule),
          _attendanceCard('daily', 'الحضور اليومي', Icons.today),
          _attendanceCard('weekly', 'الحضور الأسبوعي', Icons.calendar_view_week),
          const SizedBox(height: 16),
          Text('الإعلانات والمكافآت', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          if (_campaigns.isEmpty) const Card(child: Padding(
            padding: EdgeInsets.all(16), child: Text('لا توجد حملات إعلانية متاحة حالياً.'))),
          ..._campaigns.map((campaign) => Card(child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              Text(campaign['title'] as String? ?? 'إعلان',
                style: Theme.of(context).textTheme.titleMedium),
              Text('المعلن: ${campaign['sponsorLabel'] ?? '—'}'),
              const SizedBox(height: 8),
              Text(campaign['body'] as String? ?? ''),
              const SizedBox(height: 8),
              Text('المدة: ${campaign['durationSeconds'] ?? 0} ثانية • المكافأة: ${campaign['rewardCoins'] ?? 0} كوين'),
              const SizedBox(height: 12),
              FilledButton.icon(
                onPressed: _busy ? null : () => _startCampaign(campaign),
                icon: const Icon(Icons.play_arrow),
                label: const Text('ابدأ المشاهدة'),
              ),
            ]),
          ))),
        ]),
      ),
    );
  }
}
