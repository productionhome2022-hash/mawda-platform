import 'package:flutter/material.dart';

import 'reward_center_screen.dart';

class FeaturedAdsScreen extends StatelessWidget {
  const FeaturedAdsScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: const Text('الإعلانات التجارية المميزة'),
          actions: [
            IconButton(
              tooltip: 'أرشيف مكافآت المشاهدة',
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => const RewardCenterScreen(adType: 'featured', openHistoryOnLoad: true),
                ),
              ),
              icon: const Icon(Icons.history),
            ),
          ],
        ),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Icon(Icons.stars_rounded, size: 42),
                    const SizedBox(height: 12),
                    Text(
                      'إعلانات تجارية مميزة',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'ترتيب العرض والأولوية والتنوع تحددها خدمة المنصة الخادمية.',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'لا يوجد تصفح جغرافي في هذا القسم.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 16),
                    FilledButton.icon(
                      onPressed: () => Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (_) => const RewardCenterScreen(adType: 'featured'),
                        ),
                      ),
                      icon: const Icon(Icons.play_arrow),
                      label: const Text('عرض الإعلانات المميزة'),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
}

class FeaturedAdRewardsScreen extends StatelessWidget {
  const FeaturedAdRewardsScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('مكافآت الإعلانات المميزة')),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Card(
              child: Padding(
                padding: EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'استحقاق المشاهدة',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 10),
                    Text(
                      'تُحتسب المكافأة فقط بعد إكمال جلسة مؤهلة والتحقق منها خادمياً. فتح الشاشة أو معاينة الإعلان أو انتهاء المؤقت المحلي لا يمنح مكافأة.',
                    ),
                    SizedBox(height: 10),
                    Text(
                      'قيمة المكافأة والمدة والميزانية وحدود التكرار يحددها Super Owner من سياسة الحملة ذات الإصدار. لا تعرض هذه الشاشة سعراً افتراضياً.',
                    ),
                    SizedBox(height: 10),
                    Text(
                      'الحد الأعلى للمشاهدة المميزة: 10 مشاهدات مؤهلة لكل إعلان لكل عضو في اليوم. وقد يحدد المالك حداً أقل.',
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
                  children: [
                    const Text(
                      'سجل المكافآت مرتبط بدفتر المحفظة المركزي ولا ينشئ رصيداً مستقلاً.',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    FilledButton.icon(
                      onPressed: () => Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (_) => const RewardCenterScreen(adType: 'featured'),
                        ),
                      ),
                      icon: const Icon(Icons.history),
                      label: const Text('فتح أرشيف المكافآت'),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
}
