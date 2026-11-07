import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class SuperAdminScreen extends StatefulWidget {
  const SuperAdminScreen({Key? key}) : super(key: key);

  @override
  _SuperAdminScreenState createState() => _SuperAdminScreenState();
}

class _SuperAdminScreenState extends State<SuperAdminScreen> {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  bool _isGhostModeActive = false; // حالة وضع التخفي للسوبر أدمن

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('غرفة عمليات السوبر أدمن - مودة'),
        backgroundColor: Colors.black87,
        actions: [
          // زر تفعيل وضع التخفي
          IconButton(
            icon: Icon(
              _isGhostModeActive ? Icons.visibility_off : Icons.visibility,
              color: _isGhostModeActive ? Colors.redAccent : Colors.white,
            ),
            tooltip: 'وضع التخفي (Ghost Mode)',
            onPressed: () {
              setState(() {
                _isGhostModeActive = !_isGhostModeActive;
              });
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    _isGhostModeActive
                        ? 'تم تفعيل وضع التخفي (أنت غير مرئي للأعضاء)'
                        : 'تم إيقاف وضع التخفي',
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // شريط المؤشرات والتحكم السريع
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.grey[200],
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatCard('إجمالي الأعضاء', 'قراءة مباشرة', Colors.pink),
                _buildStatCard('الغرف النشطة', 'عامة وخاصة', Colors.blue),
              ],
            ),
          ),
          const Padding(
            padding: EdgeInsets.all(12.0),
            child: Text(
              'قائمة الأعضاء وإدارة الصلاحيات والتوثيق',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
          // عرض جلب الأعضاء من قاعدة البيانات لحظياً
          Expanded(
            child: StreamBuilder<QuerySnapshot>(
              stream: _db.collection('users').snapshots(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                  return const Center(child: Text('لا يوجد أعضاء مسجلين حتى الآن'));
                }

                var userDocs = snapshot.data!.docs;

                return ListView.builder(
                  itemCount: userDocs.length,
                  itemBuilder: (context, index) {
                    var userData = userDocs[index].data() as Map<String, dynamic>;
                    String userId = userDocs[index].id;

                    return Card(
                      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Colors.pink[100],
                          child: const Icon(Icons.person, color: Colors.pink),
                        ),
                        title: Text(userData['fullName'] ?? 'بدون اسم'),
                        subtitle: Text('البريد: ${userData['email']}\nالكوينز: ${userData['coinsBalance'] ?? 0}'),
                        isThreeLine: true,
                        trailing: IconButton(
                          icon: const Icon(Icons.settings_accessibility, color: Colors.blueAccent),
                          tooltip: 'إدارة العضو',
                          onPressed: () {
                            // نافذة مصغرة للتحكم برصيد العضو أو حظره أو منحه وساماً
                            _showAdminOptions(context, userId, userData['fullName'] ?? '');
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

  Widget _buildStatCard(String title, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color, width: 1.5),
      ),
      child: Column(
        children: [
          Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
          const SizedBox(height: 5),
          Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }

  void _showAdminOptions(BuildContext context, String userId, String userName) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('إدارة العضو: $userName'),
        content: const Text('اختر الإجراء الإداري المطلوب تنفيذه بحق هذا العضو:'),
        actions: [
          TextButton(
            onPressed: () {
              // منح هدية كوينز أو وسام
              _db.collection('users').doc(userId).update({
                'coinsBalance': FieldValue.increment(500),
              });
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('تم إضافة 500 كوينز هدية للعضو بنجاح')),
              );
            },
            child: const Text('منح 500 كوينز هدية'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إغلاق', style: TextStyle(color: Colors.grey)),
          ),
        ],
      ),
    );
  }
}
