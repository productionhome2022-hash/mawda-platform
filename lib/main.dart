import 'package:flutter/material.dart';
import 'firebase_options.dart';
import 'package:firebase_core/firebase_core.dart';
import 'screens/login_screen.dart';
import 'screens/chat_room_screen.dart';
import 'screens/shop_screen.dart';
import 'screens/super_admin_screen.dart';
import 'screens/main_user_screen.dart';
import 'screens/profile_screen.dart';

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
      title: 'منصة مودة - المنصة الشاملة',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.pink,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const LoginScreen(),
        '/main': (context) => const MainUserScreen(),
        '/chat': (context) => const ChatRoomScreen(),
        '/shop': (context) => const ShopScreen(),
        '/admin': (context) => const SuperAdminScreen(),
        '/profile': (context) => const UserProfileScreen(),
      },
    );
  }
}
