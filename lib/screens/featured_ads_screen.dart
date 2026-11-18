import 'dart:async';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

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
  late Future<List<Map<String, dynamic>>> _campaignsFuture;
  Map<String, dynamic>? _selectedCampaign;

  @override
  void initState() {
    super.initState();
    _campaignsFuture = _loadCampaigns(_selectedRegion);
  }

  Future<List<Map<String, dynamic>>> _loadCampaigns(String geography) async {
    final response = await FirebaseFunctions.instance
        .httpsCallable('getFeaturedAdShowcase')
        .call(<String, Object?>{'geography': geography});
    final data = Map<String, dynamic>.from(response.data as Map);
    final campaigns = data['campaigns'];
    if (campaigns is! List) {
      throw const FormatException('Invalid featured-ad response');
    }
    return campaigns
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList(growable: false);
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
              MaterialPageRoute<void>(
                builder: (_) => const FeaturedAdRewardsScreen(),
              ),
            ),
            icon: const Icon(Icons.card_giftcard_outlined),
          ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final wide = constraints.maxWidth >= 720;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                clipBehavior: Clip.antiAlias,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topRight,
                      end: Alignment.bottomLeft,
                      colors: [
                        theme.colorScheme.primaryContainer,
                        theme.colorScheme.surfaceContainerHighest,
                      ],
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.stars_rounded, size: 30),
                          SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'عروض مميزة من الشركات والمؤسسات',
                              style: TextStyle(fontSize: 19, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'اكتشف الحملات المؤهلة حسب نطاقها الجغرافي. قد تحصل على كوينز بعد إكمال مشاهدة مؤهلة والتحقق منها خادمياً.',
                      ),
                      const SizedBox(height: 12),
                      const Row(
                        children: [
                          Icon(Icons.verified_user_outlined, size: 18),
                          SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              'المعاينات وفتح الشاشة لا يمنحان مكافأة.',
                              style: TextStyle(fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 18),
              Text('الحملات المميزة', style: theme.textTheme.titleLarge),
              const SizedBox(height: 8),
              FutureBuilder<List<Map<String, dynamic>>>(
                future: _campaignsFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Card(
                      child: Padding(
                        padding: EdgeInsets.all(24),
                        child: Center(child: CircularProgressIndicator()),
                      ),
                    );
                  }
                  if (snapshot.hasError) {
                    return Card(
                      child: Padding(
                        padding: const EdgeInsets.all(18),
                        child: Column(
                          children: [
                            const Icon(Icons.cloud_off_outlined, size: 34),
                            const SizedBox(height: 8),
                            const Text('تعذر تحميل الحملات المميزة.'),
                            const SizedBox(height: 8),
                            TextButton.icon(
                              onPressed: () => setState(() {
                                _campaignsFuture = _loadCampaigns(_selectedRegion);
                              }),
                              icon: const Icon(Icons.refresh),
                              label: const Text('إعادة المحاولة'),
                            ),
                          ],
                        ),
                      ),
                    );
                  }
                  final campaigns = snapshot.data ?? const <Map<String, dynamic>>[];
                  if (campaigns.isEmpty) {
                    return const Card(
                      child: Padding(
                        padding: EdgeInsets.all(20),
                        child: Column(
                          children: [
                            Icon(Icons.campaign_outlined, size: 38),
                            SizedBox(height: 8),
                            Text('لا توجد حملات مميزة معتمدة في هذا النطاق حالياً.'),
                            SizedBox(height: 4),
                            Text(
                              'تظهر هنا الحملات المنشورة بعد اعتمادها والتحقق من الدفع والمادة الإعلانية.',
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    );
                  }
                  return Column(
                    children: campaigns.map((campaign) {
                      final title = campaign['title'] as String? ?? 'إعلان مميز';
                      final sponsor = campaign['sponsorLabel'] as String? ?? '';
                      final body = campaign['body'] as String? ?? '';
                      return Card(
                        child: ListTile(
                          leading: const Icon(Icons.campaign_outlined),
                          title: Text(title),
                          subtitle: Text(sponsor.isEmpty ? body : '$sponsor\\n$body'),
                          isThreeLine: true,
                          trailing: const Icon(Icons.play_circle_outline),
                          onTap: () => setState(() => _selectedCampaign = campaign),
                        ),
                      );
                    }).toList(growable: false),
                  );
                },
              ),
              if (_selectedCampaign != null) ...[
                const SizedBox(height: 18),
                _FeaturedAdViewingSurface(
                  campaign: _selectedCampaign!,
                  geography: _selectedRegion,
                  onClosed: () => setState(() => _selectedCampaign = null),
                ),
              ],
              const SizedBox(height: 18),
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
                  final selected = _selectedRegion == entry.key;
                  return ChoiceChip(
                    selected: selected,
                    label: SizedBox(
                      width: double.infinity,
                      child: Text(entry.value, textAlign: TextAlign.center),
                    ),
                    onSelected: (_) => setState(() { _selectedRegion = entry.key; _campaignsFuture = _loadCampaigns(entry.key); }),
                  );
                },
              ),
              const SizedBox(height: 12),
              Card(
                child: ListTile(
                  leading: const Icon(Icons.public),
                  title: Text(_featuredAdRegions[_selectedRegion]!),
                  subtitle: const Text(
                    'لا توجد إعلانات مؤهلة في هذا النطاق حالياً. لا نستخدم لغة الجهاز أو موقعه لتحديد الاستهداف.',
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}


class _FeaturedAdViewingSurface extends StatefulWidget {
  const _FeaturedAdViewingSurface({required this.campaign, required this.geography, required this.onClosed});
  final Map<String, dynamic> campaign;
  final String geography;
  final VoidCallback onClosed;
  @override
  State<_FeaturedAdViewingSurface> createState() => _FeaturedAdViewingSurfaceState();
}
class _FeaturedAdViewingSurfaceState extends State<_FeaturedAdViewingSurface> {
  String? _sessionId, _url, _contentType, _error;
  bool _loading = true, _completed = false;
  Timer? _heartbeatTimer;
  VideoPlayerController? _videoController;
  @override
  void initState() { super.initState(); _start(); }
  Future<void> _start() async {
    try {
      final result = await FirebaseFunctions.instance.httpsCallable('startFeaturedAdViewingSession').call({
        'campaignId': widget.campaign['campaignId'], 'geography': widget.geography,
      });
      final data = Map<String, dynamic>.from(result.data as Map);
      final sessionId = data['sessionId'] as String?;
      if (sessionId == null) throw StateError('جلسة الإعلان غير صالحة.');
      if (mounted) setState(() {
        _sessionId = sessionId; _url = data['url'] as String?;
        _contentType = data['contentType'] as String?; _loading = false;
      });
      _heartbeatTimer = Timer.periodic(const Duration(seconds: 5), (_) => _heartbeat());
      if (_contentType == 'video/mp4' && _url != null) {
        final controller = VideoPlayerController.networkUrl(Uri.parse(_url!));
        await controller.initialize();
        controller.addListener(_watchVideo);
        await controller.play();
        if (mounted) setState(() => _videoController = controller); else controller.dispose();
      }
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() { _loading = false; _error = error.message ?? 'تعذر بدء جلسة المشاهدة.'; });
    } catch (error) {
      if (mounted) setState(() { _loading = false; _error = error.toString(); });
    }
  }
  void _watchVideo() {
    final controller = _videoController;
    if (controller == null || !controller.value.isInitialized || _completed) return;
    final d = controller.value.duration.inMilliseconds;
    final p = controller.value.position.inMilliseconds;
    if (d > 0 && p * 100 >= d * 90) _complete();
    if (mounted) setState(() {});
  }
  Future<void> _heartbeat() async {
    final sessionId = _sessionId;
    if (sessionId == null || _completed) return;
    final controller = _videoController;
    double progress = 0;
    bool visible = mounted;
    if (controller != null && controller.value.isInitialized) {
      final d = controller.value.duration.inMilliseconds;
      final p = controller.value.position.inMilliseconds;
      progress = d > 0 ? (p * 100 / d).clamp(0, 100).toDouble() : 0;
      visible = mounted && !controller.value.isBuffering;
    }
    try {
      await FirebaseFunctions.instance.httpsCallable('heartbeatFeaturedAdViewingSession').call({
        'sessionId': sessionId, 'foregroundVisible': visible, 'progressPercent': progress,
      });
    } catch (_) {}
  }
  Future<void> _complete() async {
    final sessionId = _sessionId;
    if (sessionId == null || _completed) return;
    setState(() => _completed = true);
    try {
      final result = await FirebaseFunctions.instance.httpsCallable('completeFeaturedAdViewingSession').call({'sessionId': sessionId});
      final data = Map<String, dynamic>.from(result.data as Map);
      if (!mounted) return;
      final message = data['rewarded'] == true
          ? 'تمت المشاهدة المؤهلة: +' + (data['amountCoins'] ?? 0).toString() + ' كوين'
          : 'انتهت المشاهدة دون مكافأة: ' + (data['reason'] ?? 'غير مؤهل').toString();
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
    } catch (_) {
      if (mounted) setState(() => _completed = false);
    }
  }
  @override
  void dispose() {
    _heartbeatTimer?.cancel();
    _videoController?.removeListener(_watchVideo);
    _videoController?.dispose();
    super.dispose();
  }
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final title = widget.campaign['title'] as String? ?? 'إعلان مميز';
    final sponsor = widget.campaign['sponsorLabel'] as String? ?? '';
    return Card(
      clipBehavior: Clip.antiAlias,
      child: SizedBox(
        height: MediaQuery.sizeOf(context).height * 0.72,
        child: Column(children: [
          Expanded(
            flex: 6,
            child: Container(
              width: double.infinity, color: Colors.black,
              child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                  ? Center(child: Padding(padding: const EdgeInsets.all(20), child: Text(_error!, style: const TextStyle(color: Colors.white))))
                  : _videoController != null
                    ? Center(child: AspectRatio(aspectRatio: _videoController!.value.aspectRatio, child: VideoPlayer(_videoController!)))
                    : _url != null && (_contentType?.startsWith('image/') ?? false)
                      ? Image.network(_url!, fit: BoxFit.contain)
                      : Center(child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Text(widget.campaign['body'] as String? ?? '', style: const TextStyle(color: Colors.white, fontSize: 18), textAlign: TextAlign.center),
                        )),
            ),
          ),
          Expanded(
            flex: 4,
            child: Container(
              width: double.infinity, padding: const EdgeInsets.all(14),
              color: theme.colorScheme.surface,
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Expanded(child: Text(title, style: theme.textTheme.titleMedium)),
                  IconButton(onPressed: widget.onClosed, icon: const Icon(Icons.close)),
                ]),
                if (sponsor.isNotEmpty) Text(sponsor, style: theme.textTheme.labelLarge),
                const SizedBox(height: 6),
                Expanded(child: SingleChildScrollView(child: Text(widget.campaign['body'] as String? ?? ''))),
                Row(children: [
                  const Icon(Icons.verified_user_outlined, size: 16),
                  const SizedBox(width: 6),
                  const Expanded(child: Text('المكافأة تُحتسب خادمياً فقط بعد تحقق المشاهدة.')),
                  if (_sessionId != null && !_completed) TextButton(onPressed: _complete, child: const Text('إنهاء والتحقق')),
                ]),
              ]),
            ),
          ),
        ]),
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
  late Future<List<Map<String, dynamic>>> _future;
  @override
  void initState() { super.initState(); _future = _load(); }
  Future<List<Map<String, dynamic>>> _load() async {
    final response = await FirebaseFunctions.instance.httpsCallable('getMyFeaturedAdRewardHistory').call();
    final data = Map<String, dynamic>.from(response.data as Map);
    return (data['rewards'] as List<dynamic>? ?? const [])
      .whereType<Map>().map((item) => Map<String, dynamic>.from(item)).toList(growable: false);
  }
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('مكافآت مشاهدة الإعلانات')),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
          if (snapshot.hasError) return const Center(child: Text('تعذر تحميل سجل المكافآت.'));
          final rewards = snapshot.data ?? const <Map<String, dynamic>>[];
          return ListView(padding: const EdgeInsets.all(16), children: [
            Card(child: Padding(padding: const EdgeInsets.all(18), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('حدود التجربة الحالية', style: theme.textTheme.titleLarge),
              const SizedBox(height: 8),
              const Text('2 كوين لكل مشاهدة مؤهلة • حتى 10 مشاهدات / 20 كوين يومياً UTC • الحملة نفسها حتى 3 مرات خلال 24 ساعة متحركة.'),
              const SizedBox(height: 6),
              const Text('هذه قيم هندسية تجريبية قابلة للتعديل من المالك وليست وعداً بدخل أو سياسة إطلاق نهائية.', style: TextStyle(fontSize: 12)),
            ]))),
            const SizedBox(height: 12),
            Text('السجل', style: theme.textTheme.titleLarge),
            if (rewards.isEmpty) const Card(child: Padding(padding: EdgeInsets.all(18), child: Text('لا توجد مكافآت مؤهلة بعد.'))),
            ...rewards.map((reward) => Card(child: ListTile(
              leading: const Icon(Icons.monetization_on_outlined),
              title: Text('+' + (reward['amount'] ?? 0).toString() + ' كوين'),
              subtitle: Text('الحملة: ' + (reward['campaignId'] ?? '—').toString()),
            ))),
          ]);
        },
      ),
    );
  }
}


  const FeaturedAdRewardsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('مكافآت مشاهدة الإعلانات')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('كيف تحصل على المكافأة؟', style: theme.textTheme.titleLarge),
                  const SizedBox(height: 8),
                  const Text(
                    'تبدأ الأهلية عند اختيار إعلان مؤهل وبدء مشاهدته في المشغل المخصص. لا تمنح ضغطة الزر أو فتح الشاشة أو مشاهدة المعاينة أي كوينز.',
                  ),
                  const SizedBox(height: 12),
                  const ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Icon(Icons.play_circle_outline),
                    title: Text('الفيديو'),
                    subtitle: Text('إكمال 90% على الأقل من مدة المادة المعتمدة مع تحقق الظهور والتطبيق في المقدمة.'),
                  ),
                  const ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Icon(Icons.image_outlined),
                    title: Text('الصورة الثابتة'),
                    subtitle: Text('10 ثوانٍ متصلة مؤهلة وهي ظاهرة في مشغل الإعلان المختار.'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('سياسة مكافآت المشاهدة المعتمدة للتنفيذ', style: theme.textTheme.titleLarge),
                  const SizedBox(height: 8),
                  const Text('2 كوين لكل مشاهدة مؤهلة.'),
                  const Text('حتى 10 مشاهدات مكافأة و20 كويناً في يوم UTC الواحد.'),
                  const Text('الحملة نفسها: حتى 3 مكافآت لكل عضو خلال نافذة 24 ساعة متحركة.'),
                  const Text('هذه الحدود لا تُعد مفعّلة حتى يثبت تطبيقها واختبارها خادمياً.'),
                  const SizedBox(height: 8),
                  const Text(
                    'هذه قيم هندسية تجريبية قابلة للتعديل من المالك، وليست وعداً بدخل أو سياسة إطلاق نهائية.',
                    style: TextStyle(fontSize: 12),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          const Card(
            child: Padding(
              padding: EdgeInsets.all(18),
              child: Column(
                children: [
                  Icon(Icons.history, size: 34),
                  SizedBox(height: 8),
                  Text('سجل المكافآت'),
                  SizedBox(height: 4),
                  Text(
                    'سيظهر هنا سجل المشاهدات المؤهلة والكوينز بعد ربط واجهة السجل بخدمة المكافآت الخادمية. لا يتم عرض رصيد أو سجل تجريبي غير حقيقي.',
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute<void>(
                builder: (_) => const FeaturedAdsScreen(),
              ),
            ),
            icon: const Icon(Icons.play_arrow),
            label: const Text('الانتقال إلى الإعلانات المميزة'),
          ),
        ],
      ),
    );
  }
}
