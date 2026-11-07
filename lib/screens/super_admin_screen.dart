import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class SuperAdminScreen extends StatefulWidget {
  const SuperAdminScreen({Key? key}) : super(key: key);

  @override
  _SuperAdminScreenState createState() => _SuperAdminScreenState();
}

class _SuperAdminScreenState extends State<SuperAdminScreen> {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  bool _isGhostModeActive = false; // وضع التخفي المطلق للسوبر أدمن
  int _selectedTab = 0; // التنقل بين أقسام غرفة العمليات

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_getAppBarTitle()),
        backgroundColor: Colors.black87,
        actions: [
          // زر وضع التخفي (غرفة عمليات الطائرة)
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
                        ? 'تم تفعيل وضع التخفي: أنت متخفٍ بالكامل ولا يعلم الأعضاء بوجودك'
                        : 'تم إيقاف وضع التخفي',
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: Row(
        children: [
          // شريط التنقل الجانبي لأقسام السوبر أدمن
          NavigationRail(
            selectedIndex: _selectedTab,
            onDestinationSelected: (int index) {
              setState(() {
                _selectedTab = index;
              });
            },
            backgroundColor: Colors.grey[100],
            selectedIconTheme: const IconThemeData(color: Colors.pink, size: 28),
            unselectedIconTheme: const IconThemeData(color: Colors.grey, size: 24),
            labelType: NavigationRailLabelType.all,
            destinations: const [
              NavigationRailDestination(
                icon: Icon(Icons.people),
                label: Text('الأعضاء'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.meeting_room),
                label: Text('الغرف'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.campaign),
                label: Text('الإعلانات'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.security),
                label: Text('المشرفون'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.monetization_on),
                label: Text('المالية'),
              ),
            ],
          ),
          const VerticalDivider(thickness: 1, width: 1),
          // محتوى القسم النشط في لوحة التحكم
          Expanded(
            child: _buildSelectedSectionView(),
          ),
        ],
      ),
    );
  }

  String _getAppBarTitle() {
    switch (_selectedTab) {
      case 0: return 'غرفة العمليات - إدارة الأعضاء والتوثيق';
      case 1: return 'إدارة الغرف العامة والخاصة المستأجرة';
      case 2: return 'إدارة متجر الإعلانات (خاص بالأدمن)';
      case 3: return 'إدارة طاقم الإشراف (حتى 10 مشرفين)';
      case 4: return 'القسم المالي، الكوينز والباقات';
      default: return 'غرفة عمليات السوبر أدمن';
    }
  }

  Widget _buildSelectedSectionView() {
    switch (_selectedTab) {
      case 0:
        return _buildUsersManagementSection();
      case 1:
        return _buildRoomsManagementSection();
      case 2:
        return _buildAdsManagementSection();
      case 3:
        return _buildModeratorsManagementSection();
      case 4:
        return _buildFinancialSection();
      default:
        return const Center(child: Text('قسم قيد التطوير'));
    }
  }

  // 1. قسم إدارة الأعضاء والتوثيق والاطلاع والتجسس/المراقبة
  Widget _buildUsersManagementSection() {
    return StreamBuilder<QuerySnapshot>(
      stream: _db.collection('users').snapshots(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
        var docs = snapshot.data!.docs;

        return ListView.builder(
          itemCount: docs.length,
          itemBuilder: (context, index) {
            var data = docs[index].data() as Map<String, dynamic>;
            String uid = docs[index].id;
            return Card(
              margin: const EdgeInsets.all(8),
              child: ListTile(
                leading: const CircleAvatar(backgroundColor: Colors.pink, child: Icon(Icons.person, color: Colors.white)),
                title: Text(data['fullName'] ?? 'بدون اسم'),
                subtitle: Text('البريد: ${data['email']}\nالكوينز: ${data['coinsBalance']} | موثق: ${data['isBiometricVerified'] ? "نعم (بيومتري)" : "لا"}'),
                isThreeLine: true,
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.remove_red_eye, color: Colors.blue),
                      tooltip: 'مراقبة البروفايل والمحادثات الحية',
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('جاري فتح ملف ومحادثات العضو تحت وضع التخفي: ${data['fullName']}')),
                        );
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.edit, color: Colors.green),
                      tooltip: 'إدارة الرصيد والأوسمة',
                      onPressed: () => _showAdminOptions(context, uid, data['fullName']),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  // 2. قسم إدارة الغرف العامة والغرف الخاصة المستأجرة
  Widget _buildRoomsManagementSection() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('السيطرة على الغرف', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          Expanded(
            child: ListView(
              children: [
                ListTile(
                  leading: const Icon(Icons.public, color: Colors.blue),
                  title: const Text('الغرف العامة الرسمية'),
                  subtitle: const Text('مفتوحة للجميع وتحت الرقابة المباشرة'),
                  trailing: Switch(value: true, onChanged: (v) {}),
                ),
                ListTile(
                  leading: const Icon(Icons.vpn_key, color: Colors.orange),
                  title: const Text('الغرف الخاصة المستأجرة'),
                  subtitle: const Text('إدارة العقود والأجور اليومية للغرف الخاصة'),
                  trailing: Switch(value: true, onChanged: (v) {}),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 3. قسم متجر الإعلانات (بإدارة الأدمن حصرياً)
  Widget _buildAdsManagementSection() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('إدارة متجر الإعلانات المبوبة والتجارية', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const Text('هذا القسم تحت إدارتك المطلقة؛ لا يمكن لأي عضو النشر هنا سوى الأدمن.', style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.pink),
            icon: const Icon(Icons.add, color: Colors.white),
            label: const Text('نشر إعلان جديد في المتجر', style: TextStyle(color: Colors.white)),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('نافذة إضافة إعلان جديد بواسطة السوبر أدمن')),
              );
            },
          ),
        ],
      ),
    );
  }

  // 4. قسم إدارة المشرفين (حتى 10 مشرفين)
  Widget _buildModeratorsManagementSection() {
    return const Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('فريق الإشراف والمراقبة (الحد الأقصى 10 مشرفين)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          SizedBox(height: 10),
          Text('يمكنك هنا تعيين حتى 10 مشرفين مساعدين لمراقبة الغرف العامة والخاصة ومعالجة بلاغات الأعضاء مع احتفاظك بالسيطرة المطلقة.', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }

  // 5. القسم المالي، الكوينز والباقات وأجور التشغيل
  Widget _buildFinancialSection() {
    return const Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('القسم المالي والتشغيلي', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          SizedBox(height: 10),
          Text('متابعة أرباح الكوينز، أسعار الشحن، باقات المتاجر، وأجور التشغيل والإدارة.', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }

  void _showAdminOptions(BuildContext context, String userId, String userName) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('إدارة العضو: $userName'),
        content: const Text('اختر الإجراء الإداري المطلوب:'),
        actions: [
          TextButton(
            onPressed: () {
              _db.collection('users').doc(userId).update({
                'coinsBalance': FieldValue.increment(500),
              });
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('تم منح 500 كوينز هدية بنجاح')),
              );
            },
            child: const Text('منح 500 كوينز'),
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
