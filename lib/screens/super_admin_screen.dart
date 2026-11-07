import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class SuperAdminScreen extends StatefulWidget {
  const SuperAdminScreen({Key? key}) : super(key: key);

  @override
  _SuperAdminScreenState createState() => _SuperAdminScreenState();
}

class _SuperAdminScreenState extends State<SuperAdminScreen> {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  bool _isGhostModeActive = true; // وضع التخفي الافتراضي للسوبر أدمن
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
          // زر وضع التخفي والمراقبة بصمت
          IconButton(
            icon: Icon(
              _isGhostModeActive ? Icons.visibility_off : Icons.visibility,
              color: _isGhostModeActive ? Colors.redAccent : Colors.greenAccent,
            ),
            tooltip: 'وضع التخفي (Ghost Mode / مراقبة صامتة)',
            onPressed: () {
              setState(() {
                _isGhostModeActive = !_isGhostModeActive;
              });
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    _isGhostModeActive
                        ? 'تم تفعيل وضع التخفي الصامت (أنت غير مرئي نهائياً للأعضاء)'
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
              NavigationRailDestination(icon: Icon(Icons.manage_accounts), label: Text('الأعضاء والبحث')),
              NavigationRailDestination(icon: Icon(Icons.security), label: Text('الحظر والأمان')),
              NavigationRailDestination(icon: Icon(Icons.campaign), label: Text('متجر الإعلانات')),
              NavigationRailDestination(icon: Icon(Icons.chat_bubble_outline), label: Text('مراقبة المحادثات')),
              NavigationRailDestination(icon: Icon(Icons.admin_panel_settings), label: Text('المشرفون (10)')),
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
      case 0: return 'غرفة العمليات - إدارة وبحث الأعضاء (UID)';
      case 1: return 'إدارة الحظر المتقدم (24س، 3أيام، جهاز)';
      case 2: return 'إدارة متجر الإعلانات ومكافآت المشاهدة';
      case 3: return 'المراقبة الحية والسابقة والمحادثة كـ مجهول';
      case 4: return 'إدارة فريق الإشراف المساعد';
      default: return 'غرفة عمليات السوبر أدمن';
    }
  }

  Widget _buildSelectedSectionView() {
    switch (_selectedTab) {
      case 0: return _buildUsersSearchAndControlSection();
      case 1: return _buildSecurityAndBanSection();
      case 2: return _buildAdsStoreWithRewardsSection();
      case 3: return _buildLiveChatsSpySection();
      case 4: return _buildModeratorsTeamSection();
      default: return const Center(child: Text('قيد التحديث'));
    }
  }

  // 1. قسم البحث برقم المعرف UID والتحكم الكامل بالملف
  Widget _buildUsersSearchAndControlSection() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          TextField(
            controller: _searchController,
            decoration: InputDecoration(
              labelText: 'بحث برقم المعرف (UID) أو البريد الإلكتروني أو الاسم',
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
                        subtitle: Text('البريد: ${data['email']}\nالرصيد: ${data['coinsBalance']} كوينز | الحظر: ${data['isBanned'] ?? false ? "حظر نشط" : "غير حظر"}'),
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

  // نافذة السيطرة الكاملة على العضو (منح كوينز، تعديل، مراقبة، حظر)
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
            const SizedBox(height: 10),
            const Text('الإجراءات المتاحة:', style: TextStyle(fontWeight: FontWeight.bold)),
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

  // 2. قسم الحظر والأمان المتقدم (24 ساعة، 3 أيام، حظر جذري للجهاز Device Ban)
  void _showBanOptionsDialog(BuildContext context, String uid) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('اختر نوع الحظر والأمان'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('إنذار / حظر لمدة 24 ساعة'),
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
          Text('يمكنك من خلال قائمة الأعضاء أعلاه اختيار أي مستخدم وتطبيق الحظر المتدرج (24 ساعة، 3 أيام، أو الحظر الجذري للجهاز لمنعه من الدخول نهائياً).', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }

  // 3. متجر الإعلانات (رفع الملفات من جهازك وتحديد مكافآت المشاهدة للزوار)
  Widget _buildAdsStoreWithRewardsSection() {
    final TextEditingController adTitleController = TextEditingController();
    final TextEditingController adRewardController = TextEditingController();

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('إدارة متجر الإعلانات ومكافآت المشاهدة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const Text('هذا القسم تحت إدارتك وحدك؛ ارفع الإعلانات من جهازك وحدد مكافأة الكوينز لمن يشاهدها من الزوار.', style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 15),
          TextField(
            controller: adTitleController,
            decoration: const InputDecoration(labelText: 'عنوان الإعلان التجاري أو الرابط', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: adRewardController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'مكافأة الكوينز للمشاهد (مثلاً: 50 كوينز)', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 15),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.pink),
            icon: const Icon(Icons.upload_file, color: Colors.white),
            label: const Text('رفع الإعلان من جهازي ونشره مع المكافأة', style: TextStyle(color: Colors.white)),
            onPressed: () {
              if (adTitleController.text.isNotEmpty) {
                _db.collection('ads_store').add({
                  'title': adTitleController.text,
                  'rewardCoins': int.tryParse(adRewardController.text) ?? 10,
                  'createdAt': FieldValue.serverTimestamp(),
                  'publisher': 'SuperAdmin',
                });
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم نشر الإعلان وربط مكافأة المشاهدة بنجاح')));
              }
            },
          ),
        ],
      ),
    );
  }

  // 4. مراقبة المحادثات الحية والسابقة والدخول كـ مجهول أو سوبر أدمن
  Widget _buildLiveChatsSpySection() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('غرفة مراقبة المحادثات الحية والسابقة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const Text('استعرض المحادثات بسرية تامة تحت وضع التخفي الصامت، أو تدخل كـ "سوبر أدمن" أو "مجهول" وقتما تشاء.', style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 20),
          Expanded(
            child: ListView(
              children: [
                ListTile(
                  leading: const Icon(Icons.chat, color: Colors.blue),
                  title: const Text('غرفة الدردشة العامة رقم (1)'),
                  subtitle: const Text('عدد المتواجدين: 14 عضوًا | الوضع: مراقبة صامتة مفعلة'),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.grey[800]),
                        child: const Text('دخول كمجهول', style: TextStyle(fontSize: 12, color: Colors.white)),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم دخول الغرفة كشخص مجهول بصمت')));
                        },
                      ),
                      const SizedBox(width: 5),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.pink),
                        child: const Text('دخول كسوبر أدمن', style: TextStyle(fontSize: 12, color: Colors.white)),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم كشف هويتك والدخول بصفتك السوبر أدمن')));
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 5. إدارة المشرفين (حتى 10 مشرفين)
  Widget _buildModeratorsTeamSection() {
    return const Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('فريق الإشراف (الحد الأقصى 10 مشرفين)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          SizedBox(height: 10),
          Text('قم بتعيين الصلاحيات وتوزيعهم على الغرف لمساعدتك، مع احتفاظك بكامل السيطرة المطلقة كمالك للمنصة.', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}
