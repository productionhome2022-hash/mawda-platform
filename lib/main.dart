// File: lib/main.dart
// Production Home 2022 - Mawda Platform Absolute Safe Build Entry
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

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
      home: const MawdaHomePortal(),
    );
  }
}

class MawdaHomePortal extends StatelessWidget {
  const MawdaHomePortal({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('منصة مودة - البوابة الرسمية'),
        backgroundColor: Colors.pink,
        centerTitle: true,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.favorite, size: 80, color: Colors.pink),
              const SizedBox(height: 20),
              const Text(
                'أهلاً بك في منصة مودة الرقمية',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.pink),
              ),
              const SizedBox(height: 10),
              const Text(
                'المنصة تعمل الآن بكامل طاقتها على سحابة فايربيس وجيت هاب',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey, fontSize: 14),
              ),
              const SizedBox(height: 30),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.pink,
                  padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                ),
                onPressed: () {
                  ScaffoldMessenger.contextOf(context)?.showSnackBar(
                    const SnackBar(content: Text('جاري الانتقال إلى لوحة الأعضاء والخدمات...')),
                  );
                },
                icon: const Icon(Icons.login, color: Colors.white),
                label: const Text('دخول الأعضاء والخدمات', style: TextStyle(color: Colors.white, fontSize: 16)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
