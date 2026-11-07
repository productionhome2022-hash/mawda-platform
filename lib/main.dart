import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'screens/login_screen.dart';
import 'screens/super_admin_screen.dart';
import 'screens/shop_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const MawdaPlatformApp());
}

class MawdaPlatformApp extends StatelessWidget {
  const MawdaPlatformApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'منصة مودة',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.pink,
        scaffoldBackgroundColor: Colors.white,
      ),
      // الشاشة الافتتاحية عند فتح التطبيق لأول مرة هي شاشة تسجيل الدخول
      initialRoute: '/',
      routes: {
        '/': (context) => const LoginScreen(),
        '/super_admin': (context) => const SuperAdminScreen(),
        // ملاحظة: شاشة الأعضاء ShopScreen تتطلب تمرير userId عند الانتقال إليها
      },
    );
  }
}
