import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'screens/login_screen.dart';
import 'screens/super_admin_screen.dart';
import 'screens/main_user_screen.dart';

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
      title: 'تطبيق مودة للتعارف والدردشه والزواج والعلاقات الجاده',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.pink,
        scaffoldBackgroundColor: Colors.white,
      ),
      home: const AuthWrapper(),
    );
  }
}

// فئة التوجيه الذكي وفحص حالة تسجيل الدخول وصلاحيات المستخدم
class AuthWrapper extends StatelessWidget {
  const AuthWrapper({Key? key}) : super(key: key);

  // البريد الإلكتروني المخصص لمالك التطبيق (السوبر أدمن)
  final String superAdminEmail = "admin@mawda.com"; // يمكنك تعديله ليطابق بريدك الإداري

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        // حالة التحميل أثناء فحص الاتصال بـ Firebase
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(color: Colors.pink),
            ),
          );
        }

        // إذا لم يكن المستخدم مسجلاً للدخول، توجه به إلى شاشة الدخول
        if (!snapshot.hasData || snapshot.data == null) {
          return const LoginScreen();
        }

        User currentUser = snapshot.data!;
        
        // التحقق الذكي: هل المستخدم الحالي هو السوبر أدمن؟
        if (currentUser.email == superAdminEmail) {
          return const SuperAdminScreen();
        } else {
          // إذا كان مستخدماً عادياً، توجه به إلى الشاشة الرئيسية للعضو مع تمرير الـ UID الخاص به
          return MainUserScreen(userId: currentUser.uid);
        }
      },
    );
  }
}
