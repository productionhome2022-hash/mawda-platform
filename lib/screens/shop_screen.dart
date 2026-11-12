import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

class ShopScreen extends StatefulWidget {
  const ShopScreen({super.key, required this.userId});
  final String userId;

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  late Future<List<Map<String, dynamic>>> _catalogFuture;

  @override
  void initState() {
    super.initState();
    _catalogFuture = _loadCatalog();
  }

  Future<List<Map<String, dynamic>>> _loadCatalog() async {
    final response = await FirebaseFunctions.instance
        .httpsCallable('getStoreCatalog')
        .call();
    final data = Map<String, dynamic>.from(response.data as Map);
    return (data['items'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList(growable: false);
  }

  void _refresh() => setState(() => _catalogFuture = _loadCatalog());

  String _categoryLabel(String category) => switch (category) {
    'avatar' => 'إطارات وصور رمزية',
    'theme' => 'سمات وخلفيات',
    'title' => 'ألقاب وأوسمة',
    'vip' => 'عضوية VIP',
    'analytics' => 'تحليلات الملف',
    'discovery' => 'تعزيز الظهور',
    _ => 'ميزات خاصة',
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('متجر مودة'),
        actions: [
          IconButton(
            tooltip: 'تحديث الكتالوج',
            onPressed: _refresh,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _catalogFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.storefront_outlined, size: 48),
                    const SizedBox(height: 12),
                    const Text(
                      'تعذر تحميل كتالوج المتجر. لم يتم تنفيذ أي عملية شراء أو خصم.',
                      textAlign: TextAlign.center,
                    ),
                    TextButton(onPressed: _refresh, child: const Text('إعادة المحاولة')),
                  ],
                ),
              ),
            );
          }

          final items = snapshot.data ?? const [];
          if (items.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(28),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.shopping_bag_outlined, size: 56),
                    SizedBox(height: 16),
                    Text(
                      'يجري تجهيز متجر مودة.',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'ستظهر هنا العناصر التي يعتمدها مالك المنصة بعد نشر كتالوجها من الخادم.',
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            );
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(14),
                  child: Text(
                    'الأسعار المعروضة مصدرها كتالوج الخادم. الشراء والشحن غير مفعّلين حتى اكتمال التحقق المالي ومنح الاستحقاقات بأمان.',
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              ...items.map((item) {
                final name = item['name'] as String? ?? 'عنصر من مودة';
                final description = item['description'] as String? ?? '';
                final category = item['category'] as String? ?? 'feature';
                final price = (item['priceCoins'] as num?)?.toInt() ?? 0;
                final duration = (item['durationDays'] as num?)?.toInt();
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(name, style: Theme.of(context).textTheme.titleMedium),
                        const SizedBox(height: 5),
                        Text(_categoryLabel(category),
                          style: Theme.of(context).textTheme.labelMedium),
                        if (description.isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Text(description),
                        ],
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            const Icon(Icons.monetization_on_outlined),
                            const SizedBox(width: 6),
                            Text('$price كوين'),
                            if (duration != null) ...[
                              const SizedBox(width: 12),
                              Text('المدة: $duration يوماً'),
                            ],
                            const Spacer(),
                            const Text('الشراء غير متاح حالياً'),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ],
          );
        },
      ),
    );
  }
}
