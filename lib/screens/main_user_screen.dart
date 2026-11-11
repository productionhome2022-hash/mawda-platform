import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../services/auth_service.dart';

class MainUserScreen extends StatelessWidget {
  final String userId;
  const MainUserScreen({super.key, required this.userId});

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    return Scaffold(
      appBar: AppBar(
        title: const Text('مودة | MAWDA'),
        actions: [
          IconButton(
            tooltip: 'تسجيل الخروج',
            onPressed: () => AuthService().signOut(),
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 520),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.favorite, size: 72, color: Color(0xFFE8A0B5)),
                const SizedBox(height: 16),
                const Text(
                  'تم التحقق من بريدك الإلكتروني بنجاح',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                Text(user?.email ?? '', textAlign: TextAlign.center),
                const SizedBox(height: 8),
                const Text(
                  'أصبحت هوية الدخول جاهزة. يجري تجهيز خطوة استكمال الملف الشخصي وربطها بالخادم قبل فتح بقية وظائف المنصة.',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                SelectableText('معرّف حساب Firebase: $userId', textAlign: TextAlign.center),
                const SizedBox(height: 24),
                const Card(
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: Text(
                      'لن نعرض أرصدة أو محادثات أو متاجر تجريبية على أنها بيانات حقيقية. ستُفعّل الأقسام تباعاً بعد اكتمال قواعد الأمان والخدمات الخادمية.',
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
