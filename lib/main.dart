// File: lib/main.dart
// Production Home 2022 - Mawda Platform Root Entry
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

void main() async {
  // التأكد من تهيئة بيئة فلاتر الأساسية قبل أي عملية ربط
  WidgetsFlutterBinding.ensureInitialized();
  
  // تهيئة فايربيس باستخدام الإحصائيات ومنصة التشغيل الحالية
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
      // نقطة الانطلاق والتوجه لشاشة تسجيل الدخول أو الشاشة الرئيسية
      home: const Scaffold(
        body: Center(
          child: Text(
            'مرحباً بك في منصة مودة - جارِ التحميل...',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
        ),
      ),
    );
  }
}
