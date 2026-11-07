import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class SuperAdminScreen extends StatefulWidget {
  const SuperAdminScreen({Key? key}) : super(key: key);

  @override
  _SuperAdminScreenState createState() => _SuperAdminScreenState();
}

class _SuperAdminScreenState extends State<SuperAdminScreen> {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  bool _isGhostModeActive = true;
  int _selectedTab = 0;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_getAppBarTitle()),
        backgroundColor: Colors.black,
        actions: [
          IconButton(
            icon: Icon(
              _isGhostModeActive ? Icons.visibility_off : Icons.visibility,
              color: _isGhostModeActive ? Colors.redAccent : Colors.greenAccent,
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
                        ? 'تم تفعيل وضع التخفي الصامت'
                        : 'أنت ظاهر الآن للمستخدمين',
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: Row(
        children: [
          NavigationRail(
            selectedIndex: _selectedTab,
            onDestinationSelected: (int index) {
              setState(() {
                _selectedTab = index;
              });
            },
            backgroundColor: Colors.grey[900],
            selectedIconTheme: const IconThemeData(color: Colors.pinkAccent, size: 28),
            unselectedIconTheme: const IconThemeData(color: Colors.white54, size: 24),
            labelType: NavigationRailLabelType.all,
            destinations: const [
              NavigationRailDestination(icon: Icon(Icons.manage_accounts), label: Text('الأعضاء')),
              NavigationRailDestination(icon: Icon(Icons.security), label: Text('الحظر')),
              NavigationRailDestination(icon: Icon(Icons.campaign), label: Text('الإعلانات')),
              NavigationRailDestination(icon: Icon(Icons.chat_bubble_outline), label: Text('المحادثات')),
              NavigationRailDestination(icon: Icon(Icons.monetization_on), label: Text('المالية والباقات')),
            ],
          ),
          const VerticalDivider(thickness: 1, width: 1),
          Expanded(child: _buildSelectedSectionView()),
        ],
      ),
    );
  }

  String _getAppBarTitle() {
    switch (_selectedTab) {
      case 0: return 'إدارة وبحث الأعضاء (UID)';
      case 1: return 'إدارة الحظر والأمان المتقدم';
      case 2: return 'إدارة متجر الإعلانات ومكافآت المشاهدة';
      case 3: return 'مراقبة المحادثات الحية (مجهول / أدمن)';
      case 4: return 'القسم المالي: باقات الكوينز والكميات المفتوحة';
      default: return 'غرفة عمليات السوبر أدمن';
    }
  }

  Widget _buildSelectedSectionView() {
    switch (_selectedTab) {
      case 0: return _buildUsersSearchAndControlSection();
      case 1: return _buildSecurityAndBanSection();
      case 2: return _buildAdsStoreWithRewardsSection();
      case 3: return _buildLiveChatsSpySection();
      case 4: return _buildFinancialPackagesSection(); // القسم المالي المحدث
      default: return const Center(child: Text('قيد التحديث'));
    }
  }

  Widget _buildUsersSearchAndControlSection() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          TextField(
            controller: _searchController,
            decoration: InputDecoration(
              labelText: 'بحث برقم المعرف (UID) أو البريد الإلكتروني',
              prefixIcon: const Icon(Icons.search),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onChanged: (val) {
              setState(() {
                _searchQuery = val.trim().toLowerCase();
              });
            },
          ),
          const SizedBox(height: 10),
          Expanded(
            child: StreamBuilder<QuerySnapshot>(
              stream: _db.collection('users').snapshots(),
              builder: (context, snapshot) {
                if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
                var docs = snapshot.data!.docs.where((doc) {
                  var data = doc.data() as Map<String, dynamic>;
                  String name = (data['fullName'] ?? '').toLowerCase();
                  String email = (data['email'] ?? '').toLowerCase();
                  String uid = doc.id.toLowerCase();
                  if (_searchQuery.isEmpty) return true;
                  return name.contains(_searchQuery) || email.contains(_searchQuery) || uid.contains(_searchQuery);
                }).toList();

                if (docs.isEmpty) return const Center(child: Text('لا يوجد عضو مطابقة للبحث'));

                return ListView.builder(
                  itemCount: docs.length,
                  itemBuilder: (context, index) {
                    var data = docs[index].data() as Map<String, dynamic>;
                    String uid = docs[index].id;
                    return Card(
                      child: ListTile(
                        title: Text('${data['fullName'] ?? 'بدون اسم'} (UID: $uid)'),
                        subtitle: Text('البريد: ${data['email']}\nالرصيد: ${data['coinsBalance']} كوينز'),
                        isThreeLine: true,
                        trailing: ElevatedButton(
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.pink),
                          child: const Text('خيارات الأدمن', style: TextStyle(color: Colors.white)),
                          onPressed: () => _showFullAdminControlDialog(context, uid, data),
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

  void _showFullAdminControlDialog(BuildContext context, String uid, Map<String, dynamic> data) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('تحكم السوبر أدمن بالعضو: ${data['fullName']}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('رقم المعرف: $uid'),
            Text('البريد الإلكتروني: ${data['email']}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              _db.collection('users').doc(uid).update({'coinsBalance': FieldValue.increment(1000)});
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تمت إضافة 1000 كوينز للعضو')));
            },
            child: const Text('منح 1000 كوينز'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _showBanOptionsDialog(context, uid);
            },
            child: const Text('إصدار عقوبة حظر', style: TextStyle(color: Colors.red)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إغلاق'),
          ),
        ],
      ),
    );
  }

  void _showBanOptionsDialog(BuildContext context, String uid) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('اختر نوع الحظر والأمان'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('حظر لمدة 24 ساعة'),
              onTap: () {
                _applyBan(uid, '24_hours');
                Navigator.pop(context);
              },
            ),
            ListTile(
              title: const Text('حظر مؤقت لمدة 3 أيام'),
              onTap: () {
                _applyBan(uid, '3_days');
                Navigator.pop(context);
              },
            ),
            ListTile(
              title: const Text('حظر كامل وجذري للجهاز (Device Ban)', style: TextStyle(color: Colors.red)),
              onTap: () {
                _applyBan(uid, 'permanent_device_ban');
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _applyBan(String uid, String banType) {
    _db.collection('users').doc(uid).update({
      'isBanned': true,
      'banType': banType,
      'bannedAt': FieldValue.serverTimestamp(),
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('تم تطبيق العقوبة بنجاح: $banType')),
    );
  }

  Widget _buildSecurityAndBanSection() {
    return const Padding(
      padding: EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('سجل الحظر والأمان العام', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          SizedBox(height: 10),
          Text('اختر أي مستخدم من قسم الأعضاء لتطبيق الحظر المتدرج أو الجذري لجهاز المستخدم.', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildAdsStoreWithRewardsSection() {
    final TextEditingController adTitleController = TextEditingController();
    final TextEditingController adRewardController = TextEditingController();

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('إدارة متجر الإعلانات ومكافآت المشاهدة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 15),
          TextField(
            controller: adTitleController,
            decoration: const InputDecoration(labelText: 'عنوان الإعلان أو الرابط', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: adRewardController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'مكافأة الكوينز للمشاهد', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 15),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.pink),
            icon: const Icon(Icons.upload_file, color: Colors.white),
            label: const Text('نشر الإعلان وتحديد المكافأة', style: TextStyle(color: Colors.white)),
            onPressed: () {
              if (adTitleController.text.isNotEmpty) {
                _db.collection('ads_store').add({
                  'title': adTitleController.text,
                  'rewardCoins': int.tryParse(adRewardController.text) ?? 10,
                  'createdAt': FieldValue.serverTimestamp(),
                });
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم نشر الإعلان بنجاح')));
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildLiveChatsSpySection() {
    return const Padding(
      padding: EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('مراقبة المحادثات الحية', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          SizedBox(height: 10),
          Text('استعراض الغرف والمحادثات تحت وضع التخفي الصامت، أو الانضمام بصفة مجهول أو كـ سوبر أدمن.', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }

  // 5. القسم المالي المحدث: باقات الكوينز، الأسعار، وزر الكميات المفتوحة لمراسلة الإدارة
  Widget _buildFinancialPackagesSection() {
    final TextEditingController packageNameController = TextEditingController();
    final TextEditingController packageCoinsController = TextEditingController();
    final TextEditingController packagePriceController = TextEditingController();

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('القسم المالي: إدارة باقات الكوينز للبيع', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const Text('حدد الباقات والأسعار التي تظهر للأعضاء لشراء الكوينز داخل المنصة.', style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 15),
          TextField(
            controller: packageNameController,
            decoration: const InputDecoration(labelText: 'اسم الباقة (مثلاً: الباقة الذهبية)', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: packageCoinsController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'عدد الكوينز في الباقة', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: packagePriceController,
            decoration: const InputDecoration(labelText: 'السعر (مثلاً: \$10 أو 50,000 ليرة)', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 15),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
            icon: const Icon(Icons.add_box, color: Colors.white),
            label: const Text('إضافة وتفعيل الباقة في المتجر', style: TextStyle(color: Colors.white)),
            onPressed: () {
              if (packageNameController.text.isNotEmpty) {
                _db.collection('coin_packages').add({
                  'packageName': packageNameController.text,
                  'coins': int.tryParse(packageCoinsController.text) ?? 0,
                  'price': packagePriceController.text,
                  'createdAt': FieldValue.serverTimestamp(),
                });
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تمت إضافة الباقة المالية بنجاح')));
              }
            },
          ),
          const Divider(height: 40, thickness: 2),
          // زر خاص للكميات المفتوحة لمراسلة الإدارة
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.pink[50],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.pink, width: 1.5),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('إعدادات طلبات الكميات المفتوحة', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.pink)),
                const SizedBox(height: 5),
                const Text('يظهر للأعضاء في قسم متجر الكوينز زر خاص يتيح لهم طلب كميات مفتوحة ومخصصة عبر مراسلة الإدارة مباشرة.', style: TextStyle(fontSize: 13)),
                const SizedBox(height: 10),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.pink),
                  icon: const Icon(Icons.support_agent, color: Colors.white),
                  label: const Text('تفعيل وإدارة زر مراسلة الإدارة للكميات المفتوحة', style: TextStyle(color: Colors.white)),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('زر الكميات المفتوحة ومراسلة الإدارة مفعل وجاهز للأعضاء')),
                    );
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
