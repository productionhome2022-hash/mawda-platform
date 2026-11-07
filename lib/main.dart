// File: lib/main.dart
// Production Home 2022 - Mawda Platform Dynamic Entry with Auth Routing
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'firebase_options.dart';
import 'screens/login_screen.dart';
import 'screens/main_user_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const MawdaPlatformApp());
}

class MawdaPlatformApp extends StatelessWidget {
  const MawdaPlatformApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'منصة مودة',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.pink,
        scaffoldBackgroundColor: Colors.white,
      ),
      // التوجيه الذكي المباشر بناءً على حالة تسجيل الدخول لفايربيس
      home: StreamBuilder<User?>(
        stream: FirebaseAuth.instance.authStateChanges(),
        builder: (context, snapshot) {
          // أثناء فحص حالة الاتصال بقاعدة البيانات
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(
              body: Center(
                child: CircularProgressIndicator(),
              ),
            );
          }
          
          // إذا كان المستخدم مسجلاً دخوله مسبقاً، توجيهه للشاشة الرئيسية فوراً
          if (snapshot.hasData && snapshot.data != null) {
            return const MainUserScreen();
          }
          
          // إذا لم يكن مسجلاً، إظهار شاشة تسجيل الدخول الخارجية مباشرة
          return const LoginScreen();
        },
      ),
    );
  }
}
