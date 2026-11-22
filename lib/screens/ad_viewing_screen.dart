import 'package:flutter/material.dart';

import 'featured_ads_screen.dart';
import 'reward_center_screen.dart';

class AdViewingScreen extends StatelessWidget {
  const AdViewingScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('مشاهدة الإعلانات')),
        body: LayoutBuilder(
          builder: (context, constraints) {
            final horizontal = constraints.maxWidth >= 520;
            final cards = [
              _AdSectionCard(
                title: 'الإعلانات التجارية العادية',
                subtitle: 'تصفح الإعلانات حسب البلد والمنطقة.',
                icon: Icons.public,
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const StandardCommercialAdsScreen(),
                  ),
                ),
              ),
              _AdSectionCard(
                title: 'الإعلانات التجارية المميزة',
                subtitle: 'اكتشف الإعلانات المميزة المختارة.',
                icon: Icons.stars_rounded,
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const FeaturedAdsScreen(),
                  ),
                ),
              ),
            ];
            return Padding(
              padding: const EdgeInsets.all(16),
              child: horizontal
                  ? Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(child: cards[0]),
                        const SizedBox(width: 12),
                        Expanded(child: cards[1]),
                      ],
                    )
                  : Column(children: [
                      cards[0],
                      const SizedBox(height: 12),
                      cards[1],
                    ]),
            );
          },
        ),
      );
}

class _AdSectionCard extends StatelessWidget {
  const _AdSectionCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Card(
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Icon(icon, size: 42),
                const SizedBox(height: 12),
                Text(title,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                Text(subtitle, textAlign: TextAlign.center),
                const SizedBox(height: 12),
                const Align(
                  alignment: Alignment.center,
                  child: Icon(Icons.arrow_forward_rounded),
                ),
              ],
            ),
          ),
        ),
      );
}

class StandardCommercialAdsScreen extends StatelessWidget {
  const StandardCommercialAdsScreen({super.key});

  static const _regions = <(String, String)>[
    ('all_arab_countries', 'جميع البلدان العربية'),
    ('syria', 'سوريا'),
    ('lebanon_palestine', 'لبنان وفلسطين'),
    ('iraq_jordan', 'العراق والأردن'),
    ('gcc', 'دول مجلس التعاون الخليجي'),
    ('egypt', 'مصر'),
    ('tunisia_libya_sudan', 'تونس وليبيا والسودان'),
    ('algeria_morocco', 'الجزائر والمغرب'),
    ('europe_turkey', 'أوروبا وتركيا'),
    ('asia_middle_east', 'آسيا والشرق الأوسط'),
  ];

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('الإعلانات التجارية العادية')),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text('اختر النطاق الجغرافي',
                style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _regions.length,
              gridDelegate:
                  const SliverGridDelegateWithMaxCrossAxisExtent(
                maxCrossAxisExtent: 220,
                mainAxisExtent: 104,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
              ),
              itemBuilder: (context, index) {
                final region = _regions[index];
                return Card(
                  clipBehavior: Clip.antiAlias,
                  child: InkWell(
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute<void>(
                        builder: (_) => RewardCenterScreen(
                          adType: 'standard',
                          geographicTarget: region.$1,
                        ),
                      ),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.public, size: 28),
                          const SizedBox(height: 8),
                          Text(region.$2, textAlign: TextAlign.center),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 12),
            const Card(
              child: Padding(
                padding: EdgeInsets.all(14),
                child: Text(
                  'بعد اختيار البلد أو المنطقة، يجلب المشغل الحملات المؤهلة من الخادم ويتحقق من أهلية الحساب قبل بدء جلسة المشاهدة.',
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ],
        ),
      );
}
