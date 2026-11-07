import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'profile_screen.dart';

class MainUserScreen extends StatefulWidget {
  final String userId; // معرف العضو الحالي المسجل

  const MainUserScreen({Key? key, required this.userId}) : super(key: key);

  @override
  _MainUserScreenState createState() => _MainUserScreenState();
}

class _MainUserScreenState extends State<MainUserScreen> {
  int _currentIndex = 0;
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  @override
  Widget build(BuildContext context) {
    final List<Widget> _userTabs = [
      _buildGeneralRoomsTab(),     // 0. الغرف العامة
      _buildPrivateRoomsTab(),     // 1. الغرف الخاصة (الاشتراك والاستئجار والبناء)
      _buildStoreAndFeaturesTab(), // 2. متجر الكوينز، المميزات، الألقاب، وزر الكميات المفتوحة
      UserProfileScreen(userId: widget.userId), // 3. الملف الشخصي وتعديل المعلومات
    ];

    return Scaffold(
      body: _userTabs[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        selectedItemColor: Colors.pink,
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.chat_bubble_outline),
            label: 'الغرف العامة',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.lock_outline),
            label: 'الغرف الخاصة',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.storefront),
            label: 'المتجر والميزات',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            label: 'الملف الشخصي',
          ),
        ],
      ),
    );
  }

  // 0. الغرف العامة
  Widget _buildGeneralRoomsTab() {
    return Scaffold(
      appBar: AppBar(
        title: const Text('منصة مودة - الغرف العامة'),
        backgroundColor: Colors.pink,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          const Text('اختر غرفة عامة وابدأ التواصل بكل أمان:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 15),
          Card(
            child: ListTile(
              leading: const Icon(Icons.chat, color: Colors.pink),
              title: const Text('غرفة التعارف والنقاش العام (1)'),
              subtitle: const Text('متواجد الآن: نشط'),
              trailing: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.pink),
                child: const Text('دخول', style: TextStyle(color: Colors.white)),
                onPressed: () {},
              ),
            ),
          ),
        ],
      ),
    );
  }

  // 1. الغرف الخاصة (استئجار وبناء الغرف الخاصة)
  Widget _buildPrivateRoomsTab() {
    return Scaffold(
      appBar: AppBar(
        title: const Text('إدارة الغرف الخاصة'),
        backgroundColor: Colors.pink,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.amber[800]),
              icon: const Icon(Icons.add_home, color: Colors.white),
              label: const Text('استئجار وبناء غرفة خاصة جديدة بالكوينز', style: TextStyle(color: Colors.white)),
              onPressed: () {
                _db.collection('users').doc(widget.userId).collection('private_rooms').add({
                  'roomName': 'غرفة خاصة جديدة',
                  'createdAt': FieldValue.serverTimestamp(),
                });
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم استئجار وبناء الغرفة الخاصة بنجاح')));
              },
            ),
            const SizedBox(height: 20),
            const Text('غرفك الخاصة:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Expanded(
              child: StreamBuilder<QuerySnapshot>(
                stream: _db.collection('users').doc(widget.userId).collection('private_rooms').snapshots(),
                builder: (context, snapshot) {
                  if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
                  var rooms = snapshot.data!.docs;
                  if (rooms.isEmpty) {
                    return const Center(child: Text('ليس لديك غرف خاصة مفعلة. يمكنك الاستئجار عبر الزر أعلاه.'));
                  }
                  return ListView.builder(
                    itemCount: rooms.length,
                    itemBuilder: (context, index) {
                      var room = rooms[index].data() as Map<String, dynamic>;
                      return Card(
                        child: ListTile(
                          leading: const Icon(Icons.lock, color: Colors.amber),
                          title: Text(room['roomName'] ?? 'غرفة خاصة'),
                          trailing: ElevatedButton(
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                            child: const Text('دخول الغرفة', style: TextStyle(color: Colors.white)),
                            onPressed: () {},
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
      ),
    );
  }

  // 2. متجر الكوينز، المميزات الخاصة، الألقاب، وزر الكميات المفتوحة
  Widget _buildStoreAndFeaturesTab() {
    return Scaffold(
      appBar: AppBar(
        title: const Text('متجر المنصة (المميزات، الألقاب، والكوينز)'),
        backgroundColor: Colors.pink,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // مكافأة الإعلانات
          Card(
            child: ListTile(
              leading: const Icon(Icons.play_circle_fill, color: Colors.pink, size: 36),
              title: const Text('مشاهدة إعلان ترويجي مكافئ'),
              subtitle: const Text('اكسب 10 كوينز مجانية فور المشاهدة'),
              trailing: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.pink),
                child: const Text('مشاهدة', style: TextStyle(color: Colors.white)),
                onPressed: () {
                  _db.collection('users').doc(widget.userId).update({'coinsBalance': FieldValue.increment(10)});
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تمت إضافة 10 كوينز لرصيدك')));
                },
              ),
            ),
          ),
          const Divider(height: 30),
          const Text('متجر المميزات الخاصة والألقاب والأوسمة:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.pink)),
          const SizedBox(height: 10),
          Card(
            child: ListTile(
              leading: const Icon(Icons.military_tech, color: Colors.blue),
              title: const Text('شراء لقب مميز / أو وسام خاص'),
              subtitle: const Text('تميّز بلقب خاص يظهر في بروفايلك وغرف الدردشة'),
              trailing: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
                child: const Text('شراء', style: TextStyle(color: Colors.white)),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم شراء اللقب المميز بنجاح')));
                },
              ),
            ),
          ),
          const Divider(height: 30),
          const Text('باقات الكوينز الجاهزة للشحن:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.green)),
          const SizedBox(height: 10),
          Card(
            child: ListTile(
              leading: const Icon(Icons.monetization_on, color: Colors.green),
              title: const Text('الباقة الذهبية (500 كوينز)'),
              subtitle: const Text('السعر المحدد في المتجر'),
              trailing: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                child: const Text('شحن الباقة', style: TextStyle(color: Colors.white)),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم إرسال طلب شحن الباقة')));
                },
              ),
            ),
          ),
          const SizedBox(height: 20),
          // زر الكميات المفتوحة لمراسلة الإدارة
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.pink[50],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.pink, width: 1.5),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('طلب كميات كوينز مفتوحة (خاص)', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.pink)),
                const SizedBox(height: 5),
                const Text('إذا كنت ترغب بطلب كمية ضخمة أو مخصصة من الكوينز غير متوفرة في الباقات، تواصل مع الإدارة مباشرة.', style: TextStyle(fontSize: 12)),
                const SizedBox(height: 10),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.pink),
                  icon: const Icon(Icons.support_agent, color: Colors.white),
                  label: const Text('مراسلة الإدارة لطلب كمية مفتوحة', style: TextStyle(color: Colors.white)),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم فتح نافذة مراسلة الإدارة لطلب الكمية المفتوحة')));
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
