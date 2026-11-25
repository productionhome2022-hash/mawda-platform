import 'dart:async';

import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

class FeaturedAdsScreen extends StatefulWidget {
  const FeaturedAdsScreen({super.key});

  @override
  State<FeaturedAdsScreen> createState() => _FeaturedAdsScreenState();
}

class _FeaturedAdsScreenState extends State<FeaturedAdsScreen> {
  final PageController _showcaseController = PageController();
  Timer? _rotationTimer;
  int _rotationIntervalMs = 1000;
  int _showcaseIndex = 0;
  String _showcaseMode = 'empty';
  List<Map<String, dynamic>> _campaigns = const [];
  bool _loading = true;
  bool _starting = false;
  bool _rewardsEnabled = false;
  int _rewardCoins = 0;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _rotationTimer?.cancel();
    _showcaseController.dispose();
    super.dispose();
  }

  void _startRotation() {
    _rotationTimer?.cancel();
    if (_campaigns.length < 2) return;
    _rotationTimer = Timer.periodic(Duration(milliseconds: _rotationIntervalMs), (_) {
      if (!_showcaseController.hasClients || !mounted) return;
      final next = (_showcaseIndex + 1) % _campaigns.length;
      _showcaseController.animateToPage(
        next,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeInOut,
      );
    });
  }

  Future<void> _load() async {
    if (!mounted) return;
    _rotationTimer?.cancel();
    setState(() { _loading = true; _error = null; });
    try {
      final response = await FirebaseFunctions.instance.httpsCallable('getFeaturedAdShowcase').call();
      final data = Map<String, dynamic>.from(response.data as Map);
      final campaigns = (data['campaigns'] as List<dynamic>? ?? const [])
          .whereType<Map>()
          .map((item) => Map<String, dynamic>.from(item))
          .toList(growable: false);
      if (!mounted) return;
      setState(() {
        _campaigns = campaigns;
        _showcaseMode = data['mode']?.toString() ?? 'empty';
        _rotationIntervalMs = ((data['rotationIntervalMs'] as num?)?.toInt() ?? 1000)
            .clamp(250, 60 * 1000).toInt();
        _showcaseIndex = 0;
        _rewardsEnabled = data['rewardEligible'] == true;
        _rewardCoins = (data['rewardCoinsPerView'] as num?)?.toInt() ?? 0;
      });
      if (_showcaseController.hasClients) _showcaseController.jumpToPage(0);
      _startRotation();
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحميل الإعلانات المميزة.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحميل الإعلانات المميزة حالياً.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _cancelSessionQuietly(String sessionId) async {
    try {
      await FirebaseFunctions.instance.httpsCallable('endFeaturedAdViewingSession').call({'sessionId': sessionId});
    } catch (_) {
      // Server-side expiry remains the fallback if the network is unavailable.
    }
  }

  Future<void> _start(Map<String, dynamic> campaign) async {
    if (_starting) return;
    setState(() { _starting = true; _error = null; });
    String? sessionId;
    try {
      final started = await FirebaseFunctions.instance.httpsCallable('startFeaturedAdViewingSession').call({
        'campaignId': campaign['campaignId'],
      });
      final session = Map<String, dynamic>.from(started.data as Map);
      sessionId = session['sessionId'] as String?;
      final url = session['url'] as String?;
      if (sessionId == null || sessionId.isEmpty || url == null || url.isEmpty) {
        if (sessionId != null) await _cancelSessionQuietly(sessionId);
        throw StateError('لا تتوفر مادة عرض آمنة لهذه الحملة.');
      }
      if (!mounted) return;
      await Navigator.of(context).push<void>(MaterialPageRoute<void>(
        builder: (_) => FeaturedAdPlayerScreen(
          sessionId: sessionId!,
          mediaUrl: url,
          creativeType: session['creativeType']?.toString() ?? 'image',
        ),
      ));
      await _load();
    } on FirebaseFunctionsException catch (error) {
      if (sessionId != null) await _cancelSessionQuietly(sessionId);
      if (mounted) setState(() => _error = error.message ?? 'تعذر بدء مشاهدة الإعلان.');
    } catch (error) {
      if (sessionId != null) await _cancelSessionQuietly(sessionId);
      if (mounted) setState(() => _error = error.toString().replaceFirst('Bad state: ', ''));
    } finally {
      if (mounted) setState(() => _starting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('الإعلانات التجارية المميزة'),
        actions: [
          IconButton(
            tooltip: 'مكافآت المشاهدة',
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute<void>(builder: (_) => const FeaturedAdRewardsScreen()),
            ),
            icon: const Icon(Icons.card_giftcard_outlined),
          ),
          IconButton(onPressed: _loading ? null : _load, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : LayoutBuilder(builder: (context, constraints) {
              return ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(18),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('عروض مميزة من الشركات والمؤسسات',
                              style: theme.textTheme.titleLarge),
                          const SizedBox(height: 8),
                          const Text('المعاينة لا تمنح كوينز. تبدأ جلسة المكافأة فقط عند اختيار الإعلان وبدء مشاهدته في المشغل المخصص.'),
                          const SizedBox(height: 8),
                          Text(_rewardsEnabled && _rewardCoins > 0
                              ? 'المكافأة الحالية المعتمدة خادمياً: $_rewardCoins كوين للمشاهدة المؤهلة.'
                              : 'مكافآت المشاهدة متوقفة حالياً؛ لا تُمنح كوينز حتى يعتمد المالك سياسة فعالة.'),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text('ترتيب العرض والأولوية والتنوع', style: theme.textTheme.titleLarge),
                  const SizedBox(height: 8),
                  const Text('لا يوجد تصفح جغرافي في هذا القسم.'),
                  const SizedBox(height: 16),
                  Text('عرض الإعلانات المميزة', style: theme.textTheme.titleLarge),
                  const SizedBox(height: 8),
                  Text('الحملات المتاحة', style: theme.textTheme.titleLarge),
                  if (_error != null)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      child: Text(_error!, style: TextStyle(color: theme.colorScheme.error)),
                    ),
                  if (_campaigns.isEmpty)
                    const Card(
                      child: Padding(
                        padding: EdgeInsets.all(22),
                        child: Column(
                          children: [
                            Icon(Icons.campaign_outlined, size: 38),
                            SizedBox(height: 8),
                            Text('لا توجد حملات مميزة متاحة حالياً.'),
                          ],
                        ),
                      ),
                    ),
                  if (_campaigns.isNotEmpty) ...[
                    Text(_showcaseMode == 'priority'
                        ? 'عرض الحملات ذات الأولوية المعتمدة'
                        : 'تدوير الحملات المؤهلة'),
                    const SizedBox(height: 8),
                    SizedBox(
                      height: 250,
                      child: PageView.builder(
                        controller: _showcaseController,
                        itemCount: _campaigns.length,
                        onPageChanged: (index) => setState(() => _showcaseIndex = index),
                        itemBuilder: (context, index) {
                          final campaign = _campaigns[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Icon(Icons.campaign_outlined, size: 28),
                                  const SizedBox(height: 8),
                                  Text(campaign['title']?.toString() ?? 'حملة مميزة',
                                      style: theme.textTheme.titleMedium),
                                  Text(campaign['sponsorLabel']?.toString() ?? ''),
                                  const SizedBox(height: 6),
                                  Expanded(child: SingleChildScrollView(
                                    child: Text(campaign['body']?.toString() ?? ''),
                                  )),
                                  SizedBox(
                                    width: double.infinity,
                                    child: FilledButton(
                                      onPressed: _starting ? null : () => _start(campaign),
                                      child: _starting
                                          ? const SizedBox(width: 18, height: 18,
                                              child: CircularProgressIndicator(strokeWidth: 2))
                                          : const Text('ابدأ المشاهدة'),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 6),
                    Center(child: Text('${_showcaseIndex + 1} / ${_campaigns.length}')),
                  ],
                ],
              );
            }),
    );
  }
}

class FeaturedAdPlayerScreen extends StatefulWidget {
  const FeaturedAdPlayerScreen({
    required this.sessionId,
    required this.mediaUrl,
    required this.creativeType,
    super.key,
  });

  final String sessionId;
  final String mediaUrl;
  final String creativeType;

  @override
  State<FeaturedAdPlayerScreen> createState() => _FeaturedAdPlayerScreenState();
}

class _FeaturedAdPlayerScreenState extends State<FeaturedAdPlayerScreen>
    with WidgetsBindingObserver {
  Timer? _heartbeatTimer;
  VideoPlayerController? _videoController;
  int _visibleMs = 0;
  bool _foreground = true;
  bool _sending = false;
  bool _canExit = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    if (widget.creativeType == 'video') {
      final controller = VideoPlayerController.networkUrl(Uri.parse(widget.mediaUrl));
      _videoController = controller;
      controller.initialize().then((_) {
        if (!mounted) return;
        controller.setLooping(true);
        controller.play();
        setState(() {});
      }).catchError((Object error) {
        if (mounted) setState(() => _error = 'تعذر تحميل فيديو الإعلان الآمن.');
      });
    }
    _heartbeatTimer = Timer.periodic(const Duration(seconds: 5), (_) => _sendHeartbeat());
  }

  @override
  void dispose() {
    _heartbeatTimer?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    _videoController?.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    _foreground = state == AppLifecycleState.resumed;
    if (!_foreground) _videoController?.pause();
    else if (_videoController?.value.isInitialized == true) _videoController?.play();
    _sendHeartbeat();
  }

  Future<void> _sendHeartbeat() async {
    if (_sending || _canExit) return;
    _sending = true;
    var progressPercent = 0.0;
    final video = _videoController?.value;
    if (video != null && video.isInitialized && video.duration.inMilliseconds > 0) {
      progressPercent = (video.position.inMilliseconds / video.duration.inMilliseconds * 100)
          .clamp(0.0, 100.0);
    }
    try {
      final response = await FirebaseFunctions.instance
          .httpsCallable('heartbeatFeaturedAdViewingSession').call({
        'sessionId': widget.sessionId,
        'foregroundVisible': _foreground,
        'progressPercent': progressPercent,
      });
      final data = Map<String, dynamic>.from(response.data as Map);
      if (!mounted) return;
      setState(() {
        _visibleMs = (data['visibleMs'] as num?)?.toInt() ?? _visibleMs;
        if (data['expired'] == true || data['revoked'] == true) {
          _canExit = true;
          _error = 'انتهت صلاحية الحملة أو لم تعد مؤهلة للعرض.';
        }
      });
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحديث جلسة العرض.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحديث جلسة العرض حالياً.');
    } finally {
      _sending = false;
    }
  }

  Future<void> _endAndExit() async {
    try {
      await FirebaseFunctions.instance.httpsCallable('endFeaturedAdViewingSession').call({
        'sessionId': widget.sessionId,
      });
    } catch (_) {
      // The server expires abandoned sessions; no client-side reward is issued.
    }
    if (!mounted) return;
    setState(() => _canExit = true);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final video = _videoController;
    final isVideo = widget.creativeType == 'video';
    return PopScope(
      canPop: _canExit,
      child: Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          title: const Text('عرض الإعلان المميز'),
        ),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                const Text(
                  'هذه جلسة عرض ومعاينة. مكافآت المشاهدة غير مفعلة حتى يكتمل التحقق الخادمي المستقل من الظهور والتشغيل.',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 14),
                Expanded(
                  child: Center(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: isVideo
                          ? (video != null && video.value.isInitialized
                              ? AspectRatio(
                                  aspectRatio: video.value.aspectRatio,
                                  child: VideoPlayer(video),
                                )
                              : const CircularProgressIndicator())
                          : Image.network(
                              widget.mediaUrl,
                              fit: BoxFit.contain,
                              width: double.infinity,
                              loadingBuilder: (context, child, progress) => progress == null
                                  ? child
                                  : const Center(child: CircularProgressIndicator()),
                              errorBuilder: (context, error, stack) => const Center(
                                child: Text('تعذر تحميل مادة الإعلان الآمنة.'),
                              ),
                            ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text('وقت الظهور المسجل للجلسة: ${(_visibleMs / 1000).toStringAsFixed(1)} ثانية'),
                if (_error != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(_error!, textAlign: TextAlign.center,
                        style: TextStyle(color: Theme.of(context).colorScheme.error)),
                  ),
                const SizedBox(height: 12),
                FilledButton(
                  onPressed: _canExit ? () => Navigator.pop(context) : _endAndExit,
                  child: Text(_canExit ? 'العودة' : 'إنهاء العرض'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class FeaturedAdRewardsScreen extends StatefulWidget {
  const FeaturedAdRewardsScreen({super.key});

  @override
  State<FeaturedAdRewardsScreen> createState() => _FeaturedAdRewardsScreenState();
}

class _FeaturedAdRewardsScreenState extends State<FeaturedAdRewardsScreen> {
  List<Map<String, dynamic>> _claims = const [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final response = await FirebaseFunctions.instance.httpsCallable('getMyFeaturedAdRewardHistory').call();
      final data = Map<String, dynamic>.from(response.data as Map);
      final claims = (data['rewards'] as List<dynamic>? ?? const [])
          .whereType<Map>()
          .map((item) {
            final reward = Map<String, dynamic>.from(item);
            return {...reward, 'amountCoins': reward['amount'] ?? reward['amountCoins'] ?? 0};
          })
          .toList(growable: false);
      if (mounted) setState(() { _claims = claims; _error = null; });
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحميل سجل المكافآت.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحميل سجل المكافآت.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('استحقاق المشاهدة'),
      actions: [IconButton(onPressed: _loading ? null : _load, icon: const Icon(Icons.refresh))],
    ),
    body: _loading
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.all(16),
            children: [
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(18),
                  child: Text('فتح الشاشة أو معاينة الإعلان أو انتهاء المؤقت المحلي لا يمنح مكافأة. قيمة المكافأة والمدة والميزانية وحدود التكرار يحددها المالك وتتحقق منها الخدمة خادمياً. الحد الأقصى 10 مشاهدات مؤهلة لكل عضو لكل إعلان في يوم UTC. كل مكافأة معتمدة تسجل في سجل المحفظة المركزي.'),
                ),
              ),
              if (_error != null) Text(_error!),
              if (_claims.isEmpty)
                const Card(child: Padding(
                  padding: EdgeInsets.all(20),
                  child: Text('لا توجد مكافآت مشاهدة مسجلة حتى الآن.', textAlign: TextAlign.center),
                )),
              ..._claims.map((claim) => Card(
                child: ListTile(
                  leading: const Icon(Icons.stars_outlined),
                  title: Text('+ ${claim['amountCoins'] ?? 0} كوين'),
                  subtitle: Text('حملة: ${claim['campaignId'] ?? '—'}'),
                ),
              )),
            ],
          ),
  );
}
