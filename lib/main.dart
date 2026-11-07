// File: lib/main.dart
// Production Home 2022 - Mawda Platform Main Entry
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'screens/login_screen.dart';

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
      // التوجيه المباشر إلى شاشة تسجيل الدخول والتحكم ليبدأ التطبيق بعرض واجهاته بانتظام
      home: const LoginScreen(),
    );
  }
}
