// File: lib/main.dart
// Production Home 2022 - Mawda Platform Main Entry & Perfect Routing
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
      // التوجيه الذكي المباشر المعتمد على حالة المصادقة وحساب المستخدم
      home: StreamBuilder<User?>(
        stream: FirebaseAuth.instance.authStateChanges(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(
              body: Center(
                child: CircularProgressIndicator(color: Colors.pink),
              ),
            );
          }
          
          // إذا كان المستخدم مسجلاً دخوله مسبقاً، يتم توجيهه للشاشة الرئيسية للمنصة
          if (snapshot.hasData && snapshot.data != null) {
            return const MainUserScreen();
          }
          
          // إذا لم يكن مسجلاً، يتم إظهار شاشة تسجيل الدخول الاحترافية التي أريتني إياها
          return const LoginScreen();
        },
      ),
    );
  }
}
