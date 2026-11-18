import 'dart:async';

import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

const _featuredAdRegions = <String, String>{
  'all_arab_countries': 'جميع الإعلانات العربية',
  'syria': 'سوريا',
  'lebanon_palestine': 'لبنان وفلسطين',
  'iraq_jordan': 'العراق والأردن',
  'gcc': 'دول مجلس التعاون الخليجي',
  'egypt': 'مصر',
  'tunisia_libya_sudan': 'تونس وليبيا والسودان',
  'algeria_morocco': 'الجزائر والمغرب',
  'europe_turkey': 'أوروبا وتركيا',
  'asia_middle_east': 'آسيا والشرق الأوسط',
};

class FeaturedAdsScreen extends StatefulWidget {
  const FeaturedAdsScreen({super.key});

  @override
  State<FeaturedAdsScreen> createState() => _FeaturedAdsScreenState();
}

class _FeaturedAdsScreenState extends State<FeaturedAdsScreen> {
  String _selectedRegion = 'all_arab_countries';
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
      final response = await FirebaseFunctions.instance.httpsCallable('getFeaturedAdShowcase').call({
        'geography': _selectedRegion,
      });
      final data = Map<String, dynamic>.from(response.data as Map);
      final policy = Map<String, dynamic>.from(data['rewardPolicy'] as Map? ?? const {});
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
        _rewardsEnabled = policy['enabled'] == true;
        _rewardCoins = (policy['rewardCoinsPerView'] as num?)?.toInt() ?? 0;
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
      await FirebaseFunctions.instance.httpsCallable('cancelFeaturedAdSession').call({'sessionId': sessionId});
    } catch (_) {
      // The scheduled server cleanup releases the reservation if cancellation cannot reach the server.
    }
  }

  Future<void> _start(Map<String, dynamic> campaign) async {
    if (_starting) return;
    setState(() { _starting = true; _error = null; });
    String? sessionId;
    try {
      final started = await FirebaseFunctions.instance.httpsCallable('startFeaturedAdSession').call({
        'campaignId': campaign['campaignId'],
        'geography': _selectedRegion,
      });
      final session = Map<String, dynamic>.from(started.data as Map);
      sessionId = session['sessionId'] as String;
      final creativeResponse = await FirebaseFunctions.instance.httpsCallable('getFeaturedAdCreativeUrl').call({
        'campaignId': campaign['campaignId'],
        'sessionId': sessionId,
      });
      final creative = Map<String, dynamic>.from(creativeResponse.data as Map);
      final url = creative['url'] as String?;
      if (url == null || url.isEmpty) {
        await FirebaseFunctions.instance.httpsCallable('cancelFeaturedAdSession').call({'sessionId': sessionId});
        throw StateError('لا تتوفر مادة عرض آمنة لهذه الحملة.');
      }
      if (!mounted) return;
      await Navigator.of(context).push<bool>(MaterialPageRoute<bool>(
        builder: (_) => FeaturedAdPlayerScreen(
          campaignId: campaign['campaignId'] as String,
          sessionId: sessionId!,
          imageUrl: url,
          requiredVisibleMs: (session['requiredVisibleMs'] as num).toInt(),
          rewardCoins: (session['rewardCoins'] as num).toInt(),
        ),
      ));
      await _load();
    } on FirebaseFunctionsException catch (error) {
      if (sessionId != null) {
        await _cancelSessionQuietly(sessionId);
      }
      if (mounted) setState(() => _error = error.message ?? 'تعذر بدء مشاهدة الإعلان.');
    } catch (error) {
      if (sessionId != null) {
        await _cancelSessionQuietly(sessionId);
      }
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
        title: const Text('الإعلانات المميزة'),
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
              final wide = constraints.maxWidth >= 720;
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
                  Text('تصفح حسب النطاق الجغرافي', style: theme.textTheme.titleLarge),
                  const SizedBox(height: 8),
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _featuredAdRegions.length,
                    gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
                      maxCrossAxisExtent: wide ? 250 : 190,
                      mainAxisExtent: 64,
                      crossAxisSpacing: 8,
                      mainAxisSpacing: 8,
                    ),
                    itemBuilder: (context, index) {
                      final entry = _featuredAdRegions.entries.elementAt(index);
                      return ChoiceChip(
                        selected: _selectedRegion == entry.key,
                        label: SizedBox(width: double.infinity,
                            child: Text(entry.value, textAlign: TextAlign.center)),
                        onSelected: _starting ? null : (_) {
                          setState(() => _selectedRegion = entry.key);
                          _load();
                        },
                      );
                    },
                  ),
                  const SizedBox(height: 16),
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
                            Text('لا توجد حملات مميزة متاحة في هذا النطاق حالياً.'),
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
    required this.campaignId,
    required this.sessionId,
    required this.imageUrl,
    required this.requiredVisibleMs,
    required this.rewardCoins,
    super.key,
  });

  final String campaignId;
  final String sessionId;
  final String imageUrl;
  final int requiredVisibleMs;
  final int rewardCoins;

  @override
  State<FeaturedAdPlayerScreen> createState() => _FeaturedAdPlayerScreenState();
}

class _FeaturedAdPlayerScreenState extends State<FeaturedAdPlayerScreen>
    with WidgetsBindingObserver {
  Timer? _heartbeatTimer;
  int _sequence = 0;
  int _eligibleMs = 0;
  bool _foreground = true;
  bool _sending = false;
  bool _completing = false;
  bool _completed = false;
  bool _canExit = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _heartbeatTimer = Timer.periodic(const Duration(seconds: 5), (_) => _sendHeartbeat());
  }

  @override
  void dispose() {
    _heartbeatTimer?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    _foreground = state == AppLifecycleState.resumed;
    _sendHeartbeat();
  }

  Future<void> _sendHeartbeat() async {
    if (_sending || _completed || _canExit) return;
    _sending = true;
    final nextSequence = _sequence + 1;
    try {
      final response = await FirebaseFunctions.instance.httpsCallable('heartbeatFeaturedAdSession').call({
        'sessionId': widget.sessionId,
        'sequence': nextSequence,
        'foreground': _foreground,
        'visible': true,
      });
      final data = Map<String, dynamic>.from(response.data as Map);
      _sequence = nextSequence;
      if (!mounted) return;
      setState(() {
        _eligibleMs = (data['eligibleMs'] as num?)?.toInt() ?? _eligibleMs;
        if (data['cancelled'] == true) {
          _canExit = true;
          _error = 'انتهت صلاحية الحملة أو تغيرت؛ لم تُمنح مكافأة.';
        }
      });
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر التحقق من جلسة المشاهدة.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر إرسال تحقق المشاهدة؛ حاول مجدداً.');
    } finally {
      _sending = false;
    }
  }

  Future<void> _complete() async {
    if (_completing || _eligibleMs < widget.requiredVisibleMs || _canExit) return;
    setState(() { _completing = true; _error = null; });
    try {
      await FirebaseFunctions.instance.httpsCallable('completeFeaturedAdSession').call({
        'sessionId': widget.sessionId,
      });
      if (!mounted) return;
      setState(() { _completed = true; _canExit = true; });
      _heartbeatTimer?.cancel();
      Navigator.of(context).pop(true);
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'لم تُعتمد المشاهدة بعد.');
    } finally {
      if (mounted) setState(() => _completing = false);
    }
  }

  Future<void> _cancelAndExit() async {
    try {
      await FirebaseFunctions.instance.httpsCallable('cancelFeaturedAdSession').call({
        'sessionId': widget.sessionId,
      });
    } catch (_) {
      // Server expiry cleanup remains the fallback if the network is unavailable.
    }
    if (!mounted) return;
    setState(() => _canExit = true);
    Navigator.of(context).pop(false);
  }

  @override
  Widget build(BuildContext context) {
    final progress = widget.requiredVisibleMs <= 0
        ? 0.0
        : (_eligibleMs / widget.requiredVisibleMs).clamp(0.0, 1.0);
    return PopScope(
      canPop: _canExit,
      child: Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          title: const Text('مشاهدة الإعلان'),
          actions: const [],
        ),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                const Text('ابقَ في هذه الشاشة حتى يكتمل التحقق من المشاهدة.'),
                const SizedBox(height: 14),
                Expanded(
                  child: Center(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: Image.network(
                        widget.imageUrl,
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
                const SizedBox(height: 16),
                LinearProgressIndicator(value: progress, minHeight: 8),
                const SizedBox(height: 8),
                Text('التحقق: ${(_eligibleMs / 1000).toStringAsFixed(1)} / ${(widget.requiredVisibleMs / 1000).toStringAsFixed(0)} ثانية'),
                if (_error != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(_error!, textAlign: TextAlign.center,
                        style: TextStyle(color: Theme.of(context).colorScheme.error)),
                  ),
                const SizedBox(height: 12),
                if (_canExit)
                  FilledButton(onPressed: () => Navigator.pop(context), child: const Text('العودة'))
                else
                  FilledButton.icon(
                    onPressed: _eligibleMs >= widget.requiredVisibleMs && !_completing
                        ? _complete : null,
                    icon: _completing
                        ? const SizedBox(width: 18, height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.verified_outlined),
                    label: Text('اعتماد المشاهدة والحصول على ${widget.rewardCoins} كوين'),
                  ),
                TextButton(
                  onPressed: _canExit ? null : _cancelAndExit,
                  child: const Text('إلغاء المشاهدة دون مكافأة'),
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
      final response = await FirebaseFunctions.instance.httpsCallable('getFeaturedAdRewardHistory').call();
      final data = Map<String, dynamic>.from(response.data as Map);
      final claims = (data['claims'] as List<dynamic>? ?? const [])
          .whereType<Map>()
          .map((item) => Map<String, dynamic>.from(item))
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
      title: const Text('مكافآت مشاهدة الإعلانات'),
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
                  child: Text('تُمنح الكوينز فقط بعد جلسة مشاهدة صريحة والتحقق الخادمي من الظهور والمدة والميزانية والحدود. المعاينات لا تمنح مكافآت.'),
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
