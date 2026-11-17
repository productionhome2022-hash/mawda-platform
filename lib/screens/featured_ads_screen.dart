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
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(20),
                  child: Column(
                    children: [
                      Icon(Icons.campaign_outlined, size: 38),
                      SizedBox(height: 8),
                      Text('لا توجد حملات مميزة متاحة للعرض حالياً.'),
                      SizedBox(height: 4),
                      Text(
                        'سيتم عرض الحملات بعد اكتمال ربط خدمة الاستهداف والعرض واعتمادها من الإدارة.',
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
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
                    onSelected: (_) => setState(() => _selectedRegion = entry.key),
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

class FeaturedAdRewardsScreen extends StatelessWidget {
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
