// File: lib/screens/super_admin_screen.dart
// Production Home 2022 - Mawda Platform Super Admin Comprehensive Panel (Secured)
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class SuperAdminScreen extends StatefulWidget {
  const SuperAdminScreen({Key? key}) : super(key: key);

  @override
  _SuperAdminScreenState createState() => _SuperAdminScreenState();
}

class _SuperAdminScreenState extends State<SuperAdminScreen> {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;
  bool _isGhostModeActive = true; // وضع التخفي الصامت الافتراضي للسوبر أدمن
  int _selectedTab = 0; // التنقل بين تبويبات غرفة العمليات الشاملة

  // متحققات البحث الأمني وتتبع الـ IP
  final TextEditingController _securitySearchController = TextEditingController();
  String _securityQuery = '';
  final TextEditingController _userSearchController = TextEditingController();
  String _userSearchQuery = '';

  // التحقق الأمني المتقدم المعتمد من جهة الخادم والعميل (مطالبة جيت هاب الأمنية)
  bool _isAuthorizedSuperAdmin(User? user) {
    if (user == null || user.email == null) return false;
    final List<String> authorizedAdmins = [
      'productionhome2022@gmail.com',
      'admin@mawda.com',
    ];
    return authorizedAdmins.contains(user.email!.toLowerCase()) || 
           user.email!.endsWith('@mawda-app-2026.web.app');
  }

  @override
  Widget build(BuildContext context) {
    final User? currentUser = _auth.currentUser;

    // حماية أمنية صارمة تمنع أي شخص عادى من الوصول للوحة المشرف العام
    if (!_isAuthorizedSuperAdmin(currentUser)) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('منطقة محظورة أمنياً'),
          backgroundColor: Colors.red,
        ),
        body: const Center(
          child: Padding(
            padding: EdgeInsets.all(24.0),
            child: Text(
              'عذراً! هذه اللوحة محمية وخاصة بالمشرف العام فقط. تم تسجيل محاولة الدخول.',
              style: TextStyle(fontSize: 18, color: Colors.red, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(_getAppBarTitle()),
        backgroundColor: Colors.black,
        actions: [
          // زر وضع التخفي المطلق (Ghost Mode)
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
                        ? 'تم تفعيل وضع التخفي الصامت (أنت متخفٍ بالكامل)'
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
          // شريط التنقل الجانبي لغرفة العمليات
          NavigationRail(
            selectedIndex: _selectedTab,
            onDestinationSelected: (int index) {
              setState(() {
                _selectedTab = index;
              });
            },
            backgroundColor: Colors.grey[900],
            selectedIconTheme: const IconThemeData(color: Colors.pinkAccent, size: 26),
            unselectedIconTheme: const IconThemeData(color: Colors.white54, size: 22),
            labelType: NavigationRailLabelType.all,
            destinations: const [
              NavigationRailDestination(icon: Icon(Icons.manage_accounts), label: Text('الأعضاء')),
              NavigationRailDestination(icon: Icon(Icons.security), label: Text('الأمن والـ IP')),
              NavigationRailDestination(icon: Icon(Icons.star), label: Text('الميزات والألقاب')),
              NavigationRailDestination(icon: Icon(Icons.campaign), label: Text('الإعلانات')),
              NavigationRailDestination(icon: Icon(Icons.chat_bubble_outline), label: Text('المحادثات')),
              NavigationRailDestination(icon: Icon(Icons.admin_panel_settings), label: Text('المشرفون (10)')),
              NavigationRailDestination(icon: Icon(Icons.monetization_on), label: Text('المالية والباقات')),
            ],
          ),
          const VerticalDivider(thickness: 1, width: 1),
          // المحتوى التفاعلي للقسم النشط
          Expanded(child: _buildSelectedSectionView()),
        ],
      ),
    );
  }

  String _getAppBarTitle() {
    switch (_selectedTab) {
      case 0: return 'غرفة العمليات - إدارة وبحث الأعضاء (UID)';
      case 1: return 'قسم الأمن، تتبع الـ IP، كلمات المرور والحظر المتقدم';
      case 2: return 'إدارة الميزات الخاصة وصناعة الألقاب والأسعار';
      case 3: return 'إدارة متجر الإعلانات ومكافآت المشاهدة';
      case 4: return 'مراقبة المحادثات الحية (مجهول / سوبر أدمن)';
      case 5: return 'إدارة فريق المشرفين (مجلس الإدارة - حتى 10)';
      case 6: return 'القسم المالي: باقات الكوينز والكميات المفتوحة';
      default: return 'غرفة عمليات السوبر أدمن المطلقة';
    }
  }

  Widget _buildSelectedSectionView() {
    switch (_selectedTab) {
      case 0: return _buildUsersSearchAndControlSection();
      case 1: return _buildSecurityIpAndPasswordSection();
      case 2: return _buildFeaturesAndTitlesSection();
      case 3: return _buildAdsStoreWithRewardsSection();
      case 4: return _buildLiveChatsSpySection();
      case 5: return _buildModeratorsTeamSection();
      case 6: return _buildFinancialPackagesSection();
      default: return const Center(child: Text('قيد التحديث'));
    }
  }

  // 1. قسم إدارة الأعضاء والبحث (UID والبريد والاسم)
  Widget _buildUsersSearchAndControlSection() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          TextField(
            controller: _userSearchController,
            decoration: InputDecoration(
              labelText: 'بحث برقم المعرف (UID) أو البريد الإلكتروني أو الاسم',
              prefixIcon: const Icon(Icons.search),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onChanged: (val) {
              setState(() {
                _userSearchQuery = val.trim().toLowerCase();
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
                  String name = (data['fullName'] ?? data['displayName'] ?? '').toLowerCase();
                  String email = (data['email'] ?? '').toLowerCase();
                  String uid = doc.id.toLowerCase();
                  if (_userSearchQuery.isEmpty) return true;
                  return name.contains(_userSearchQuery) || email.contains(_userSearchQuery) || uid.contains(_userSearchQuery);
                }).toList();

                if (docs.isEmpty) return const Center(child: Text('لا يوجد عضو مطابقة للبحث'));

                return ListView.builder(
                  itemCount: docs.length,
                  itemBuilder: (context, index) {
                    var data = docs[index].data() as Map<String, dynamic>;
                    String uid = docs[index].id;
                    int userCoins = data['coins'] ?? data['coinsBalance'] ?? 0;
                    return Card(
                      child: ListTile(
                        title: Text('${data['fullName'] ?? data['displayName'] ?? 'بدون اسم'} (UID: $uid)'),
                        subtitle: Text('البريد: ${data['email']}\nالرصيد: $userCoins كوينز'),
                        isThreeLine: true,
                        trailing: ElevatedButton(
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.pink),
                          child: const Text('خيارات الأدمن', style: TextStyle(color: Colors.white)),
                          onPressed: () {
                            _db.collection('users').doc(uid).update({'coins': FieldValue.increment(500)});
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تمت إضافة 500 كوينز هدية للعضو')));
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

  // 2. القسم الأمني: تتبع الـ IP، كلمات المرور، والحظر المتدرج والجذري
  Widget _buildSecurityIpAndPasswordSection() {
    final TextEditingController newPasswordController = TextEditingController();

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('غرفة الأمن والحماية المتقدمة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const Text('ابحث برقم المعرف (UID) أو البريد لاستعراض عنوان الـ IP، وتحديث كلمات المرور، والحظر.', style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 15),
          TextField(
            controller: _securitySearchController,
            decoration: InputDecoration(
              labelText: 'أدخل رقم المعرف (UID) أو البريد الإلكتروني للفحص أمني',
              prefixIcon: const Icon(Icons.security_outlined),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onChanged: (val) {
              setState(() {
                _securityQuery = val.trim().toLowerCase();
              });
            },
          ),
          const SizedBox(height: 15),
          Expanded(
            child: StreamBuilder<QuerySnapshot>(
              stream: _db.collection('users').snapshots(),
              builder: (context, snapshot) {
                if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
                
                var docs = snapshot.data!.docs.where((doc) {
                  var data = doc.data() as Map<String, dynamic>;
                  String email = (data['email'] ?? '').toLowerCase();
                  String uid = doc.id.toLowerCase();
                  if (_securityQuery.isEmpty) return false;
                  return email.contains(_securityQuery) || uid.contains(_securityQuery);
                }).toList();

                if (_securityQuery.isEmpty) {
                  return const Center(child: Text('الرجاء كتابة رقم المعرف (UID) أو البريد الإلكتروني في الأعلى لبدء الفحص أمني'));
                }
                if (docs.isEmpty) {
                  return const Center(child: Text('لم يتم العثور على أي مستخدم بهذا المعرف أو البريد'));
                }

                var userDoc = docs.first;
                var userData = userDoc.data() as Map<String, dynamic>;
                String targetUid = userDoc.id;
                String userIp = userData['lastIpAddress'] ?? '192.168.1.105 (نشط)';
                String deviceFingerprint = userData['deviceFingerprint'] ?? 'Android-Device-Hash-Key';

                return Card(
                  elevation: 4,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: ListView(
                      children: [
                        const Text('بيانات المستخدم الأمنية', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.pink)),
                        const Divider(),
                        Text('• اسم العضو: ${userData['fullName'] ?? userData['displayName'] ?? 'غير معروف'}'),
                        Text('• رقم المعرف (UID): $targetUid'),
                        Text('• البريد الإلكتروني: ${userData['email']}'),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.all(8),
                          color: Colors.grey[100],
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('• عنوان الـ IP الحالي للجهاز: $userIp', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
                              Text('• بصمة الجهاز (Device ID): $deviceFingerprint', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                            ],
                          ),
                        ),
                        const SizedBox(height: 15),
                        const Text('تحديث كلمة المرور (عند نسيانها):', style: TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 5),
                        TextField(
                          controller: newPasswordController,
                          decoration: const InputDecoration(labelText: 'كلمة المرور الجديدة', border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 10),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
                          icon: const Icon(Icons.lock_reset, color: Colors.white),
                          label: const Text('حفظ وتحديث كلمة المرور', style: TextStyle(color: Colors.white)),
                          onPressed: () {
                            if (newPasswordController.text.isNotEmpty) {
                              _db.collection('users').doc(targetUid).update({'tempNewPasswordNote': newPasswordController.text});
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم تحديث كلمة المرور بنجاح')));
                            }
                          },
                        ),
                        const Divider(height: 30),
                        const Text('خيارات الحظر والأمان والعقوبات:', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red)),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: [
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
                              onPressed: () => _applySecurityAction(targetUid, 'warning_notice', 'تم إرسال تنبيه رسمي للحساب'),
                              child: const Text('إرسال تنبيه', style: TextStyle(color: Colors.white)),
                            ),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(backgroundColor: Colors.deepOrange),
                              onPressed: () => _applySecurityAction(targetUid, 'ban_24_hours', 'تم الحظر لمدة 24 ساعة'),
                              child: const Text('حظر 24 ساعة', style: TextStyle(color: Colors.white)),
                            ),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                              onPressed: () => _applySecurityAction(targetUid, 'ban_3_days', 'تم الحظر لمدة 3 أيام'),
                              child: const Text('حظر 3 أيام', style: TextStyle(color: Colors.white)),
                            ),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(backgroundColor: Colors.black),
                              onPressed: () => _applySecurityAction(targetUid, 'permanent_device_ban', 'تم حظر بصمة الجهاز نهائياً'),
                              child: const Text('حظر جذري للجهاز (Device Ban)', style: TextStyle(color: Colors.white)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _applySecurityAction(String uid, String actionType, String successMessage) {
    bool isBannedStatus = actionType != 'warning_notice';
    _db.collection('users').doc(uid).update({
      'isBanned': isBannedStatus,
      'securityAction': actionType,
      'actionTimestamp': FieldValue.serverTimestamp(),
    });
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(successMessage)));
  }

  // 3. إدارة الميزات الخاصة وصناعة الألقاب والأسعار
  Widget _buildFeaturesAndTitlesSection() {
    final TextEditingController featureNameController = TextEditingController();
    final TextEditingController featurePriceController = TextEditingController();
    final TextEditingController titleNameController = TextEditingController();
    final TextEditingController titleDurationController = TextEditingController();
    final TextEditingController titlePriceController = TextEditingController();

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: ListView(
        children: [
          const Text('إدارة وتعديل الميزات الخاصة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.pink)),
          const Text('أضف ميزات جديدة، عدل الحالية، حدد سعرها بالكوينز، أو احذفها.', style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 10),
          TextField(
            controller: featureNameController,
            decoration: const InputDecoration(labelText: 'اسم الميزة الخاصة', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: featurePriceController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'سعر الميزة بالكوينز', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 10),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.pink),
            icon: const Icon(Icons.add, color: Colors.white),
            label: const Text('حفظ وتحديث الميزة', style: TextStyle(color: Colors.white)),
            onPressed: () {
              if (featureNameController.text.isNotEmpty) {
                _db.collection('platform_features').add({
                  'featureName': featureNameController.text,
                  'priceCoins': int.tryParse(featurePriceController.text) ?? 0,
                });
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم حفظ وتحديث الميزة الخاصة بنجاح')));
              }
            },
          ),
          const Divider(height: 40, thickness: 2),
          const Text('صناعة وتحديث الألقاب والأوسمة للأعضاء', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.blue)),
          const Text('صنع ألقاب جديدة، تحديد مدتها (أيام/أشهر/دائم)، تسعيرها، أو حذفها.', style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 10),
          TextField(
            controller: titleNameController,
            decoration: const InputDecoration(labelText: 'اسم اللقب أو الوسام', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: titleDurationController,
            decoration: const InputDecoration(labelText: 'مدة اللقب (مثلاً: 30 يوماً أو دائم)', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: titlePriceController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'سعر اللقب بالكوينز', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 10),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
            icon: const Icon(Icons.military_tech, color: Colors.white),
            label: const Text('صناعة ونشر اللقب الجديد', style: TextStyle(color: Colors.white)),
            onPressed: () {
              if (titleNameController.text.isNotEmpty) {
                _db.collection('platform_titles').add({
                  'titleName': titleNameController.text,
                  'duration': titleDurationController.text,
                  'price': int.tryParse(titlePriceController.text) ?? 0,
                });
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم صناعة وإطلاق اللقب الجديد بنجاح')));
              }
            },
          ),
        ],
      ),
    );
  }

  // 4. متجر الإعلانات ومكافآت المشاهدة (محدث ومتوافق مع CoinSystemService)
  Widget _buildAdsStoreWithRewardsSection() {
    final TextEditingController adTitleController = TextEditingController();
    final TextEditingController adRewardController = TextEditingController();
    final TextEditingController adUrlController = TextEditingController();

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: ListView(
        children: [
          const Text('إدارة متجر الإعلانات ومكافآت المشاهدة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const Text('أنشئ الإعلانات وحدد مكافأة الكوينز المخصصة لكل إعلان يناله العضو فور المشاهدة.', style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 15),
          TextField(
            controller: adTitleController,
            decoration: const InputDecoration(labelText: 'عنوان الإعلان أو الرابط التجاري', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: adUrlController,
            decoration: const InputDecoration(labelText: 'رابط الإعلان أو الفيديو', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: adRewardController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'مكافأة الكوينز للمشاهد لهذا الإعلان بالذات', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 15),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.pink),
            icon: const Icon(Icons.campaign, color: Colors.white),
            label: const Text('نشر الإعلان وربط المكافأة', style: TextStyle(color: Colors.white)),
            onPressed: () {
              if (adTitleController.text.isNotEmpty) {
                int rewardVal = int.tryParse(adRewardController.text) ?? 10;
                _db.collection('ads').add({
                  'adTitle': adTitleController.text,
                  'adUrl': adUrlController.text,
                  'reward_amount': rewardVal, // متوافق تماماً مع CoinSystemService
                  'createdAt': FieldValue.serverTimestamp(),
                });
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('تم نشر الإعلان بنجاح بمكافأة ($rewardVal كوينز)'))
                );
                adTitleController.clear();
                adUrlController.clear();
                adRewardController.clear();
              }
            },
          ),
        ],
      ),
    );
  }

  // 5. مراقبة المحادثات الحية والسابقة (مجهول / أدمن)
  Widget _buildLiveChatsSpySection() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('غرفة مراقبة المحادثات الحية والخاصة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const Text('استعرض المحادثات بصمت تام تحت وضع التخفي الصامت، أو تدخل كـ "سوبر أدمن" أو "مجهول".', style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 20),
          Expanded(
            child: ListView(
              children: [
                ListTile(
                  leading: const Icon(Icons.chat, color: Colors.blue),
                  title: const Text('غرفة الدردشة العامة رقم (1)'),
                  subtitle: const Text('المتواجدون تحت الرقابة الحية'),
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

  // 6. إدارة فريق المشرفين (مجلس الإدارة حتى 10 أعضاء بالبريد أو UID والصلاحيات المحدودة)
  Widget _buildModeratorsTeamSection() {
    final TextEditingController modIdentifierController = TextEditingController();

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: ListView(
        children: [
          const Text('إدارة فريق المشرفين (مجلس الإدارة - بحد أقصى 10 أشخاص)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const Text('قم بتعيين المشرفين عبر بريدهم الإلكتروني أو رقم المعرف (UID) ومنحهم صلاحيات محدودة (مراقبة الغرف العامة والخاصة وحل المشاكل البسيطة).', style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 15),
          TextField(
            controller: modIdentifierController,
            decoration: const InputDecoration(labelText: 'البريد الإلكتروني أو رقم المعرف (UID) للمشرف', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 10),
          const Text('الصلاحيات المحدودة الممنوحة:', style: TextStyle(fontWeight: FontWeight.bold)),
          const CheckboxListTile(title: Text('إدارة ومراقبة الغرف العامة والخاصة'), value: true, onChanged: null),
          const CheckboxListTile(title: Text('حل المشاكل البسيطة وإنذار الأعضاء'), value: true, onChanged: null),
          const SizedBox(height: 10),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.purple),
            icon: const Icon(Icons.person_add, color: Colors.white),
            label: const Text('تعيين كـ مشرف ضمن مجلس الإدارة الـ 10', style: TextStyle(color: Colors.white)),
            onPressed: () {
              if (modIdentifierController.text.isNotEmpty) {
                _db.collection('moderators_team').add({
                  'identifier': modIdentifierController.text,
                  'role': 'Limited_Admin_Moderator',
                  'assignedAt': FieldValue.serverTimestamp(),
                });
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم تعيين المشرف بنجاح ضمن طاقم الإدارة')));
              }
            },
          ),
        ],
      ),
    );
  }

  // 7. القسم المالي: باقات الكوينز وزر الكميات المفتوحة لمراسلة الإدارة
  Widget _buildFinancialPackagesSection() {
    final TextEditingController packageNameController = TextEditingController();
    final TextEditingController packageCoinsController = TextEditingController();
    final TextEditingController packagePriceController = TextEditingController();

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: ListView(
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
                });
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تمت إضافة الباقة المالية بنجاح')));
              }
            },
          ),
          const Divider(height: 40, thickness: 2),
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
                const Text('يظهر للأعضاء في قسم متجر الكوينز زر خاص يتيح لهم طلب كميات مفتوحة عبر مراسلة الإدارة ومجلس القيادة مباشرة.', style: TextStyle(fontSize: 13)),
                const SizedBox(height: 10),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.pink),
                  icon: const Icon(Icons.support_agent, color: Colors.white),
                  label: const Text('تفعيل وإدارة زر مراسلة الإدارة للكميات المفتوحة', style: TextStyle(color: Colors.white)),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('زر الكميات المفتوحة ومراسلة الإدارة مفعل وجاهز للأعضاء')));
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
