import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class UserProfileScreen extends StatefulWidget {
  final String userId; // معرف المستخدم الحالي

  const UserProfileScreen({Key? key, required this.userId}) : super(key: key);

  @override
  _UserProfileScreenState createState() => _UserProfileScreenState();
}

class _UserProfileScreenState extends State<UserProfileScreen> {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // متحكمات الحقول الشخصية التي تحدث عنها
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _ageController = TextEditingController();
  final TextEditingController _professionController = TextEditingController();
  
  String _maritalStatus = 'أعزب / عزباء';
  String _relationshipGoal = 'زواج جاد وعلاقة مستقرة';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  // جلب بيانات المستخدم الحالية من قاعدة البيانات
  Future<void> _loadUserData() async {
    DocumentSnapshot doc = await _db.collection('users').doc(widget.userId).get();
    if (doc.exists) {
      var data = doc.data() as Map<String, dynamic>;
      setState(() {
        _nameController.text = data['fullName'] ?? '';
        _ageController.text = data['age']?.toString() ?? '';
        _professionController.text = data['profession'] ?? '';
        _maritalStatus = data['maritalStatus'] ?? 'أعزب / عزباء';
        _relationshipGoal = data['relationshipGoal'] ?? 'زواج جاد وعلاقة مستقرة';
        _isLoading = false;
      });
    } else {
      setState(() {
        _isLoading = false;
      });
    }
  }

  // حفظ وتحديث المعلومات الشخصية في Firebase
  Future<void> _saveProfileChanges() async {
    setState(() => _isLoading = true);
    await _db.collection('users').doc(widget.userId).update({
      'fullName': _nameController.text.trim(),
      'age': int.tryParse(_ageController.text.trim()) ?? 25,
      'profession': _professionController.text.trim(),
      'maritalStatus': _maritalStatus,
      'relationshipGoal': _relationshipGoal,
      'updatedAt': FieldValue.serverTimestamp(),
    });
    setState(() => _isLoading = false);

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('تم تحديث معلومات الملف الشخصي بنجاح')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('الملف الشخصي وتعديل المعلومات'),
        backgroundColor: Colors.pink,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: ListView(
                children: [
                  const Center(
                    child: CircleAvatar(
                      radius: 50,
                      backgroundColor: Colors.pinkAccent,
                      child: Icon(Icons.person, size: 50, color: Colors.white),
                    ),
                  ),
                  const SizedBox(height: 20),
                  TextField(
                    controller: _nameController,
                    decoration: const InputDecoration(
                      labelText: 'الاسم الكامل',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.person_outline),
                    ),
                  ),
                  const SizedBox(height: 15),
                  TextField(
                    controller: _ageController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'العمر',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.cake_outlined),
                    ),
                  ),
                  const SizedBox(height: 15),
                  TextField(
                    controller: _professionController,
                    decoration: const InputDecoration(
                      labelText: 'المهنة',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.work_outline),
                    ),
                  ),
                  const SizedBox(height: 15),
                  DropdownButtonFormField<String>(
                    value: _maritalStatus,
                    decoration: const InputDecoration(
                      labelText: 'الحالة الاجتماعية',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.family_restroom),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'أعزب / عزباء', child: Text('أعزب / عزباء')),
                      DropdownMenuItem(value: 'متزوج / متزوجة', child: Text('متزوج / متزوجة')),
                      DropdownMenuItem(value: 'مطلق / مطلقة', child: Text('مطلق / مطلقة')),
                      DropdownMenuItem(value: 'أرمل / أرملة', child: Text('أرمل / أرملة')),
                    ],
                    onChanged: (val) {
                      if (val != null) setState(() => _maritalStatus = val);
                    },
                  ),
                  const SizedBox(height: 15),
                  DropdownButtonFormField<String>(
                    value: _relationshipGoal,
                    decoration: const InputDecoration(
                      labelText: 'الهدف من التعارف / الزواج',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.favorite_outline),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'زواج جاد وعلاقة مستقرة', child: Text('زواج جاد وعلاقة مستقرة')),
                      DropdownMenuItem(value: 'تعارف وصداقة جادة', child: Text('تعارف وصداقة جادة')),
                      DropdownMenuItem(value: 'نقاشات وتواصل اجتماعي', child: Text('نقاشات وتواصل اجتماعي')),
                    ],
                    onChanged: (val) {
                      if (val != null) setState(() => _relationshipGoal = val);
                    },
                  ),
                  const SizedBox(height: 25),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.pink,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    icon: const Icon(Icons.save, color: Colors.white),
                    label: const Text(
                      'حفظ وتحديث التعديلات',
                      style: TextStyle(fontSize: 16, color: Colors.white),
                    ),
                    onPressed: _saveProfileChanges,
                  ),
                ],
              ),
            ),
    );
  }
}
