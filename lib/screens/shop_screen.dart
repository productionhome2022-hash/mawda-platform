import 'package:flutter/material.dart';

class ShopScreen extends StatefulWidget {
  final String userId;
  const ShopScreen({Key? key, required this.userId}) : super(key: key);

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _customCoinController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _customCoinController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mawda Master Store 🛍️'),
        backgroundColor: Colors.deepPurple,
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Features', icon: Icon(Icons.star)),
            Tab(text: 'Badges & Titles', icon: Icon(Icons.military_tech)),
            Tab(text: 'Coin Top-Up', icon: Icon(Icons.monetization_on)),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // 1. متجر المميزات الخاصة
          ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildShopItemCard(
                title: 'Story & Media Boost',
                description: 'Unlock 24h stories and priority media sharing.',
                price: '500 Coins',
                onBuy: () => _purchaseFeature('story_feature', 500),
              ),
              _buildShopItemCard(
                title: 'Profile Background Theme',
                description: 'Custom cinematic themes and audio player.',
                price: '1000 Coins',
                onBuy: () => _purchaseFeature('theme_feature', 1000),
              ),
              _buildShopItemCard(
                title: 'Ghost Spy Mode',
                description: 'Browse profiles and chats completely invisibly.',
                price: '2000 Coins',
                onBuy: () => _purchaseFeature('ghost_mode', 2000),
              ),
            ],
          ),

          // 2. متجر الأوسمة والألقاب
          GridView.count(
            crossAxisCount: 2,
            padding: const EdgeInsets.all(16),
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            children: [
              _buildBadgeCard('Crystal Crown 👑', '1500 Coins', 1500, 'crown_badge'),
              _buildBadgeCard('Royal Diamond 💎', '3000 Coins', 3000, 'diamond_badge'),
              _buildBadgeCard('Sovereign Star ⭐', '1000 Coins', 1000, 'star_badge'),
              _buildBadgeCard('Golden Phoenix 🔥', '2500 Coins', 2500, 'phoenix_badge'),
            ],
          ),

          // 3. متجر الكوينز وزر الشحن المرن المفتوح
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Flexible Coin Top-Up Station 🪙',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 15),
                TextField(
                  controller: _customCoinController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Enter Custom Coin Amount',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.add_circle, color: Colors.amber),
                  ),
                ),
                const SizedBox(height: 15),
                ElevatedButton.styleFrom(
                  backgroundColor: Colors.amber[700],
                ).wrap(
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.amber[700]),
                    onPressed: () {
                      int? amount = int.tryParse(_customCoinController.text.trim());
                      if (amount != null && amount > 0) {
                        _topUpCoins(amount);
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Please enter a valid coin amount')),
                        );
                      }
                    },
                    child: const Text('Top-Up Custom Amount Now', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                  ),
                ),
                const Divider(height: 40),
                const Text('Quick Packages:', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildQuickPackageBtn('1,000 Coins', 1000),
                    _buildQuickPackageBtn('5,000 Coins', 5000),
                    _buildQuickPackageBtn('10,000 Coins', 10000),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShopItemCard({required String title, required String description, required String price, required VoidCallback onBuy}) {
    return Card(
      elevation: 3,
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(description),
        trailing: ElevatedButton(
          onPressed: onBuy,
          child: Text(price),
        ),
      ),
    );
  }

  Widget _buildBadgeCard(String title, String priceText, int cost, String badgeId) {
    return Card(
      elevation: 4,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
          const SizedBox(height: 10),
          Text(priceText, style: const TextStyle(color: Colors.grey)),
          const SizedBox(height: 15),
          ElevatedButton(
            onPressed: () => _purchaseFeature(badgeId, cost),
            child: const Text('Buy Badge'),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickPackageBtn(String label, int amount) {
    return OutlinedButton(
      onPressed: () => _topUpCoins(amount),
      child: Text(label),
    );
  }

  void _purchaseFeature(String featureId, int cost) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'شراء $featureId غير مفعّل بعد. لن يتم خصم أي كوينز قبل ربط كتالوج المتجر والتحقق الخادمي من السعر.',
        ),
      ),
    );
  }

  void _topUpCoins(int amount) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'طلب شحن $amount كوين يحتاج إلى ربط بوابة دفع والتحقق من الدفع. لم تتم إضافة أي كوينز إلى رصيدك.',
        ),
      ),
    );
  }
}

extension on ButtonStyle {
  Widget wrap(Widget child) => child;
}
