import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../services/coin_system_service.dart';

class ShopScreen extends StatefulWidget {
  final String userId; // معرف المستخدم الحالي

  const ShopScreen({Key? key, required this.userId}) : super(key: key);

  @override
  _ShopScreenState createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final CoinSystemService _coinService = CoinSystemService();

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2, // تبويبين: الأول للإعلانات والمكافآت، والثاني لشراء الألقاب والميزات
      child: Scaffold(
        appBar: AppBar(
          title: const Text('متجر المنصة والكوينز'),
          backgroundColor: Colors.black,
          bottom: const TabBar(
            indicatorColor: Colors.pinkAccent,
            labelColor: Colors.pinkAccent,
            unselectedLabelColor: Colors.white70,
            tabs: [
              Tab(icon: Icon(Icons.campaign), text: 'مكافآت الإعلانات'),
              Tab(icon: Icon(Icons.military_tech), text: 'متجر الألقاب والميزات'),
            ],
          ),
        ),
        body: Column(
          children: [
            // شريط عرض رصيد الكوينز الحالي للمستخدم (دائم الظهور في الأعلى)
            StreamBuilder<DocumentSnapshot>(
              stream: _db.collection('users').doc(widget.userId).snapshots(),
              builder: (context, snapshot) {
                int currentCoins = 0;
                if (snapshot.hasData && snapshot.data!.exists) {
                  var data = snapshot.data!.data() as Map<String, dynamic>;
                  currentCoins = data['coins'] ?? 0;
                }
                return Container(
                  padding: const EdgeInsets.all(16),
                  margin: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.pink[50],
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.pinkAccent, width: 1.5),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('رصيدك الحالي من الكوينز:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      Row(
                        children: [
                          const Icon(Icons.monetization_on, color: Colors.amber, size: 28),
                          const SizedBox(width: 8),
                          Text('$currentCoins كوينز', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.pink)),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
            // المحتوى التفاعلي للتبويبات
            Expanded(
              child: TabBarView(
                children: [
                  _buildAdsRewardsTab(),
                  _buildTitlesAndFeaturesTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // 1. تبويب الإعلانات ومكافآت المشاهدة
  Widget _buildAdsRewardsTab() {
    return StreamBuilder<QuerySnapshot>(
      stream: _db.collection('ads').snapshots(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
        var adsDocs = snapshot.data!.docs;

        if (adsDocs.isEmpty) {
          return const Center(child: Text('لا توجد إعلانات متاحة للمشاهدة حالياً'));
        }

        return ListView.builder(
          itemCount: adsDocs.length,
          itemBuilder: (context, index) {
            var adData = adsDocs[index].data() as Map<String, dynamic>;
            String adId = adsDocs[index].id;
            String adTitle = adData['adTitle'] ?? 'إعلان تجاري';
            int rewardAmount = adData['reward_amount'] ?? 10;

            return Card(
              margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              child: ListTile(
                leading: const CircleAvatar(
                  backgroundColor: Colors.pinkAccent,
                  child: Icon(Icons.campaign, color: Colors.white),
                ),
                title: Text(adTitle, style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text('المكافأة عند المشاهدة: $rewardAmount كوينز'),
                trailing: ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.pink),
                  child: const Text('مشاهدة وكسب', style: TextStyle(color: Colors.white)),
                  onPressed: () async {
                    bool success = await _coinService.rewardUserForSpecificAd(widget.userId, adId);
                    if (success) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('مبروك! تم إضافة $rewardAmount كوينز إلى رصيدك بنجاح')),
                      );
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('حدث خطأ أثناء منح المكافأة، حاول مرة أخرى')),
                      );
                    }
                  },
                ),
              ),
            );
          },
        );
      },
    );
  }

  // 2. تبويب متجر شراء الألقاب والميزات الخاصة بالكوينز
  Widget _buildTitlesAndFeaturesTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        const Text('الألقاب والأوسمة المتاحة للشراء:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.blue)),
        const SizedBox(height: 8),
        // استعراض الألقاب التي صنعها السوبر أدمن
        StreamBuilder<QuerySnapshot>(
          stream: _db.collection('platform_titles').snapshots(),
          builder: (context, snapshot) {
            if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
            var titleDocs = snapshot.data!.docs;

            if (titleDocs.isEmpty) {
              return const Padding(
                padding: EdgeInsets.all(8.0),
                child: Text('لا توجد ألقاب معروضة حالياً من الإدارة', style: TextStyle(color: Colors.grey)),
              );
            }

            return Column(
              children: titleDocs.map((doc) {
                var data = doc.data() as Map<String, dynamic>;
                String titleName = data['titleName'] ?? 'لقب مميز';
                String duration = data['duration'] ?? 'دائم';
                int price = data['price'] ?? 100;

                return Card(
                  child: ListTile(
                    leading: const Icon(Icons.military_tech, color: Colors.amber, size: 30),
                    title: Text(titleName, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('المدة: $duration\nالسعر: $price كوينز'),
                    isThreeLine: true,
                    trailing: ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
                      child: const Text('شراء', style: TextStyle(color: Colors.white)),
                      onPressed: () async {
                        // عملية خصم الكوينز ومنح اللقب للمستخدم
                        bool purchased = await _purchaseItem(price, 'شراء لقب: $titleName');
                        if (purchased) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('مبروك! تم شراء اللقب ($titleName) بنجاح')),
                          );
                        }
                      },
                    ),
                  ),
                );
              }).toList(),
            );
          },
        ),
        const Divider(height: 30, thickness: 2),
        const Text('الميزات الخاصة المتاحة للشراء:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.pink)),
        const SizedBox(height: 8),
        // استعراض الميزات الخاصة التي حددها السوبر أدمن
        StreamBuilder<QuerySnapshot>(
          stream: _db.collection('platform_features').snapshots(),
          builder: (context, snapshot) {
            if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
            var featureDocs = snapshot.data!.docs;

            if (featureDocs.isEmpty) {
              return const Padding(
                padding: EdgeInsets.all(8.0),
                child: Text('لا توجد ميزات معروضة حالياً من الإدارة', style: TextStyle(color: Colors.grey)),
              );
            }

            return Column(
              children: featureDocs.map((doc) {
                var data = doc.data() as Map<String, dynamic>;
                String featureName = data['featureName'] ?? 'ميزة خاصة';
                int priceCoins = data['priceCoins'] ?? 50;

                return Card(
                  child: ListTile(
                    leading: const Icon(Icons.star, color: Colors.pinkAccent, size: 30),
                    title: Text(featureName, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('السعر: $priceCoins كوينز'),
                    trailing: ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.pink),
                      child: const Text('اقتناء', style: TextStyle(color: Colors.white)),
                      onPressed: () async {
                        bool purchased = await _purchaseItem(priceCoins, 'شراء ميزة: $featureName');
                        if (purchased) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('مبروك! تم تفعيل واقتناء ميزة ($featureName)')),
                          );
                        }
                      },
                    ),
                  ),
                );
              }).toList(),
            );
          },
        ),
      ],
    );
  }

  // دالة مسؤولة عن التحقق من الرصيد وخصم الكوينز عند الشراء
  Future<bool> _purchaseItem(int cost, String description) async {
    try {
      DocumentReference userRef = _db.collection('users').doc(widget.userId);
      var userDoc = await userRef.get();
      if (!userDoc.exists) return false;

      var userData = userDoc.data() as Map<String, dynamic>;
      int currentCoins = userData['coins'] ?? 0;

      if (currentCoins < cost) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('رصيدك غير كافٍ لإتمام عملية الشراء!')),
        );
        return false;
      }

      // خصم الكوينز وتوثيق العملية في سجل المعاملات
      await _db.runTransaction((transaction) async {
        transaction.update(userRef, {'coins': currentCoins - cost});
        transaction.set(_db.collection('transactions').doc(), {
          'userId': widget.userId,
          'type': 'purchase',
          'description': description,
          'cost': cost,
          'timestamp': FieldValue.serverTimestamp(),
        });
      });

      return true;
    } catch (e) {
      return false;
    }
  }
}
