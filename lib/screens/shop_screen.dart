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
    return Scaffold(
      appBar: AppBar(
        title: const Text('متجر المنصة ومكافآت الإعلانات'),
        backgroundColor: Colors.black,
      ),
      body: Column(
        children: [
          // شريط عرض رصيد الكوينز الحالي للمستخدم
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
          const Divider(),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Align(
              alignment: Alignment.centerRight,
              child: Text('الإعلانات المتاحة للمشاهدة والمكافأة:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ),
          // قائمة الإعلانات المتاحة التي نشرها السوبر أدمن
          Expanded(
            child: StreamBuilder<QuerySnapshot>(
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
                    int rewardAmount = adData['reward_amount'] ?? 10; // القيمة المخصصة من السوبر أدمن

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
                            // تنفيذ مكافأة المشاهدة فوراً عبر الخدمة البرمجية
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
            ),
          ),
        ],
      ),
    );
  }
}
