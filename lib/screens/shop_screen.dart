import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

class ShopScreen extends StatefulWidget {
  const ShopScreen({super.key, required this.userId});
  final String userId;

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  late Future<List<Map<String, dynamic>>> _catalogFuture;
  String? _purchasingItemId;
  String _selectedStore = 'all';

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

  Future<void> _purchase(Map<String, dynamic> item) async {
    final itemId = item['itemId'] as String?;
    final name = item['name'] as String? ?? 'عنصر مودة';
    final price = (item['priceCoins'] as num?)?.toInt() ?? 0;
    if (itemId == null || itemId.isEmpty || price <= 0 || _purchasingItemId != null) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('تأكيد شراء العنصر'),
        content: Text('سيتم خصم $price كوين من محفظتك مقابل "$name"، ومنح الاستحقاق عبر الخادم.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('إلغاء'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('تأكيد الشراء'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    setState(() => _purchasingItemId = itemId);
    try {
      final response = await FirebaseFunctions.instance.httpsCallable('purchaseStoreItem').call({
        'itemId': itemId,
        'requestId': const Uuid().v4(),
        'expectedPriceCoins': price,
      });
      final result = Map<String, dynamic>.from(response.data as Map);
      if (!mounted) return;
      final balance = (result['newBalance'] as num?)?.toInt();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(
          balance == null
              ? 'تمت معالجة الشراء.'
              : 'تم الشراء بنجاح. رصيدك الجديد: $balance كوين.',
        )),
      );
      _refresh();
    } on FirebaseFunctionsException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر إتمام الشراء.')),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر إتمام الشراء؛ لم يتم تأكيد الخصم أو الاستحقاق.')),
      );
    } finally {
      if (mounted) setState(() => _purchasingItemId = null);
    }
  }

  String _categoryLabel(String category) => switch (category) {
    'avatar' || 'frame' => 'إطارات الصور',
    'username_style' => 'أنماط الأسماء',
    'theme' => 'الثيمات والخلفيات',
    'title' => 'متجر الألقاب',
    'badge' => 'متجر الأوسمة',
    'vip' => 'عضوية VIP',
    'analytics' => 'تحليلات الملف',
    'profile_layout' => 'تطوير الملف الشخصي',
    'boost' => 'تعزيز الظهور',
    'greeting' => 'ترحيب الزوار',
    'privacy' => 'الخصوصية - قيد التجهيز',
    _ => 'ميزات خاصة',
  };

  String _storeGroup(Map<String, dynamic> item) {
    final category = item['category'] as String? ?? 'feature';
    return switch (category) {
      'vip' => 'vip',
      'title' => 'titles',
      'badge' => 'badges',
      'privacy' => 'privacy',
      _ => 'features',
    };
  }

  String _storeGroupLabel(String group) => switch (group) {
    'all' => 'كل المتاجر',
    'features' => 'المميزات الخاصة',
    'badges' => 'الأوسمة',
    'titles' => 'الألقاب',
    'vip' => 'VIP',
    'privacy' => 'الخصوصية',
    _ => 'المتجر',
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

          final visibleItems = _selectedStore == 'all'
              ? items
              : items.where((item) => _storeGroup(item) == _selectedStore).toList(growable: false);

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  'all',
                  'features',
                  'badges',
                  'titles',
                  'vip',
                  'privacy',
                ].map((group) {
                  return ChoiceChip(
                    label: Text(_storeGroupLabel(group)),
                    selected: _selectedStore == group,
                    onSelected: (selected) {
                      if (selected) setState(() => _selectedStore = group);
                    },
                  );
                }).toList(growable: false),
              ),
              const SizedBox(height: 12),
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(14),
                  child: Text(
                    'العناصر وأسعارها مصدرها كتالوج الخادم. عند إتاحة الشراء، ينفّذ الخادم خصم الكوينز وتسجيل الإيصال وقيد المحفظة ومنح الاستحقاق في معاملة واحدة. العناصر غير الجاهزة تبقى غير قابلة للشراء.',
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              if (visibleItems.isEmpty)
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Text(
                    'لا توجد عناصر منشورة في ${_storeGroupLabel(_selectedStore)} حالياً.',
                    textAlign: TextAlign.center,
                  ),
                ),
              ...visibleItems.map((item) {
                final name = item['name'] as String? ?? 'عنصر من مودة';
                final description = item['description'] as String? ?? '';
                final category = item['category'] as String? ?? 'feature';
                final price = (item['priceCoins'] as num?)?.toInt() ?? 0;
                final duration = (item['durationDays'] as num?)?.toInt();
                final canPurchase = item['purchaseEnabled'] == true &&
                    item['fulfillmentReady'] == true;
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
                            FilledButton(
                              onPressed: canPurchase && _purchasingItemId == null
                                  ? () => _purchase(item)
                                  : null,
                              child: _purchasingItemId == item['itemId']
                                  ? const SizedBox(
                                      width: 18,
                                      height: 18,
                                      child: CircularProgressIndicator(strokeWidth: 2),
                                    )
                                  : Text(canPurchase ? 'شراء' : 'غير متاح بعد'),
                            ),
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
