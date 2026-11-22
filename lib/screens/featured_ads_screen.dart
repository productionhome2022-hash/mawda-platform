import 'package:flutter/material.dart';

class FeaturedAdsScreen extends StatelessWidget {
  const FeaturedAdsScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: const Text('الإعلانات التجارية المميزة'),
          actions: [
            IconButton(
              tooltip: 'سجل مكافآت المشاهدة',
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => const FeaturedAdRewardsScreen(),
                ),
              ),
              icon: const Icon(Icons.card_giftcard_outlined),
            ),
          ],
        ),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Card(
              clipBehavior: Clip.antiAlias,
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
                      'اختر الإعلان المميز الذي تريد مشاهدته. ترتيب العرض والأولوية والتنوع تحددها خدمة المنصة الخادمية.',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'لا يوجد تصفح جغرافي في هذا القسم.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Card(
              child: Padding(
                padding: EdgeInsets.all(22),
                child: Column(
                  children: [
                    Icon(Icons.campaign_outlined, size: 40),
                    SizedBox(height: 10),
                    Text(
                      'لا توجد إعلانات مميزة متاحة للعرض حالياً.',
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 6),
                    Text(
                      'سيظهر الإعلان بعد ربط استعلام العرض الخادمي واعتماد الحملة ومادتها وجدولها وميزانيتها.',
                      textAlign: TextAlign.center,
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
          children: const [
            Card(
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
            SizedBox(height: 12),
            Card(
              child: Padding(
                padding: EdgeInsets.all(18),
                child: Text(
                  'سجل المكافآت سيعرض القيود المؤكدة من سجل المحفظة المركزي بعد ربط واجهة السجل الخادمية.',
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ],
        ),
      );
}
