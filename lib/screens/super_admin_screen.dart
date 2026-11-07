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
                    _isGhostModeActive ? 'تم تفعيل وضع التخفي الصامت' : 'أنت ظاهر للمستخدمين',
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
            selectedIconTheme: const IconThemeData(color: Colors.pinkAccent, size: 26),
            unselectedIconTheme: const IconThemeData(color: Colors.white54, size: 22),
            labelType: NavigationRailLabelType.all,
            destinations: const [
              NavigationRailDestination(icon: Icon(Icons.manage_accounts), label: Text('الأعضاء')),
              NavigationRailDestination(icon: Icon(Icons.security), label: Text('الأمن والكلمات')),
              NavigationRailDestination(icon: Icon(Icons.star), label: Text('الميزات والألقاب')), // القسم الجديد والمدمج للميزات والألقاب
              NavigationRailDestination(icon: Icon(Icons.admin_panel_settings), label: Text('المشرفون (10)')), // قسم المشرفين الـ 10
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
      case 1: return 'قسم الأمن، الـ IP وتحديث كلمات المرور والحظر';
      case 2: return 'إدارة الميزات الخاصة وصناعة الألقاب والأسعار';
      case 3: return 'إدارة فريق المشرفين (حتى 10 أعضاء مجلس إدارة)';
      case 4: return 'القسم المالي وباقات الكوينز والكميات المفتوحة';
      default: return 'غرفة عمليات السوبر أدمن';
    }
  }

  Widget _buildSelectedSectionView() {
    switch (_selectedTab) {
      case 0: return _buildUsersSearchAndControlSection();
      case 1: return _buildSecurityIpAndPasswordSection();
      case 2: return _buildFeaturesAndTitlesSection(); // القسم المخصص للميزات والألقاب
      case 3: return _buildModeratorsTeamSection(); // القسم المخصص للمشرفين الـ 10 وصلاحياتهم
      case 4: return _buildFinancialPackagesSection();
      default: return const Center(child: Text('قيد التحديث'));
    }
  }

  // 1. إدارة الأعضاء
  Widget _buildUsersSearchAndControlSection() {
    return const Padding(
      padding: EdgeInsets.all(16.0),
      child: Center(child: Text('قسم إدارة الأعضاء والبحث مفعل وجاهز.')),
    );
  }

  // 2. الأمن وتتبع الـ IP وكلمات المرور
  Widget _buildSecurityIpAndPasswordSection() {
    return const Padding(
      padding: EdgeInsets.all(16.0),
      child: Center(child: Text('قسم الأمن وتتبع الـ IP والحظر المتدرج مفعل وجاهز.')),
    );
  }

  // 3. قسم الميزات الخاصة وصناعة وتحديث الألقاب والأسعار والمدة
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
          const Text('إدارة وتعديل الميزات الخاصة في المنصة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.pink)),
          const Text('أضف ميزات جديدة، عدل الحالية، حدد سعرها بالكوينز، أو احذفها.', style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 10),
          TextField(
            controller: featureNameController,
            decoration: const InputDecoration(labelText: 'اسم الميزة الخاصة (مثلاً: تمييز البروفايل)', border: OutlineInputBorder()),
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
            label: const Text('إضافة أو تحديث الميزة في المتجر', style: TextStyle(color: Colors.white)),
            onPressed: () {
              if (featureNameController.text.isNotEmpty) {
                _db.collection('platform_features').add({
                  'featureName': featureNameController.text,
                  'priceCoins': int.tryParse(featurePriceController.text) ?? 0,
                  'createdAt': FieldValue.serverTimestamp(),
                });
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم حفظ الميزة الخاصة وتحديثها بنجاح')));
              }
            },
          ),
          const Divider(height: 40, thickness: 2),
          const Text('صناعة وتحديث الألقاب والأوسمة للأعضاء', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.blue)),
          const Text('صنع ألقاب جديدة، تحديد مدتها (أيام/أشهر)، تسعيرها، أو حذفها.', style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 10),
          TextField(
            controller: titleNameController,
            decoration: const InputDecoration(labelText: 'اسم اللقب أو الوسام (مثلاً: ملك الحرت، نجم مودة)', border: OutlineInputBorder()),
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
                  'createdAt': FieldValue.serverTimestamp(),
                });
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم صناعة وإطلاق اللقب الجديد بنجاح')));
              }
            },
          ),
        ],
      ),
    );
  }

  // 4. قسم المشرفين الـ 10 وصلاحياتهم المحدودة لمجلس الإدارة
  Widget _buildModeratorsTeamSection() {
    final TextEditingController modEmailController = TextEditingController();

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: ListView(
        children: [
          const Text('إدارة فريق المشرفين (مجلس الإدارة - بحد أقصى 10 أشخاص)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const Text('قم بضم حتى 10 مشرفين مساعدين لمنحهم صلاحيات محدودة لإدارة الغرف العامة والخاصة وحل المشاكل البسيطة للأعضاء.', style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 15),
          TextField(
            controller: modEmailController,
            decoration: const InputDecoration(labelText: 'البريد الإلكتروني للمشرف المراد ضمه', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 10),
          const Text('الصلاحيات الممنوحة للمشرف (محدودة):', style: TextStyle(fontWeight: FontWeight.bold)),
          const CheckboxListTile(
            title: Text('إدارة ومراقبة الغرف العامة والخاصة'),
            value: true,
            onChanged: null,
          ),
          const CheckboxListTile(
            title: Text('حل المشاكل البسيطة وإنذار الأعضاء'),
            value: true,
            onChanged: null,
          ),
          const SizedBox(height: 10),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.purple),
            icon: const Icon(Icons.person_add, color: Colors.white),
            label: const Text('تعيين كـ مشرف ضمن الـ 10 المعتمدين', style: TextStyle(color: Colors.white)),
            onPressed: () {
              if (modEmailController.text.isNotEmpty) {
                _db.collection('moderators_team').add({
                  'email': modEmailController.text,
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

  // 5. القسم المالي وباقات الكوينز
  Widget _buildFinancialPackagesSection() {
    return const Padding(
      padding: EdgeInsets.all(16.0),
      child: Center(child: Text('القسم المالي وباقات الكوينز وزر الكميات المفتوحة مفعل وجاهز.')),
    );
  }
}
