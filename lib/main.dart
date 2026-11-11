import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';

import 'firebase_options.dart';
import 'screens/auth_gate.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MawdaPlatformApp());
}

class MawdaPlatformApp extends StatelessWidget {
  const MawdaPlatformApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'مودة | MAWDA',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF8B234B),
            brightness: Brightness.dark,
          ),
          scaffoldBackgroundColor: const Color(0xFF160D1B),
          useMaterial3: true,
        ),
        home: const _FirebaseBootstrapScreen(),
      );
}

class _FirebaseBootstrapScreen extends StatefulWidget {
  const _FirebaseBootstrapScreen();

  @override
  State<_FirebaseBootstrapScreen> createState() =>
      _FirebaseBootstrapScreenState();
}

class _FirebaseBootstrapScreenState extends State<_FirebaseBootstrapScreen> {
  Object? _initializationError;
  bool _initializing = true;

  @override
  void initState() {
    super.initState();
    _initializeFirebase();
  }

  Future<void> _initializeFirebase() async {
    if (mounted) {
      setState(() {
        _initializing = true;
        _initializationError = null;
      });
    }

    try {
      if (Firebase.apps.isEmpty) {
        await Firebase.initializeApp(
          options: DefaultFirebaseOptions.currentPlatform,
        );
      }
      if (!mounted) return;
      setState(() => _initializing = false);
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _initializationError = error;
        _initializing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_initializing) {
      return const Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text('جارٍ تهيئة خدمات مودة بأمان...'),
            ],
          ),
        ),
      );
    }

    if (_initializationError != null) {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.cloud_off_outlined, size: 56),
                  const SizedBox(height: 16),
                  Text(
                    'تعذر الاتصال بخدمات المنصة وتهيئتها. لم يتم فتح تسجيل الدخول حتى لا تتعطل العمليات أو تُعرض بيانات غير موثوقة.',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'تحقق من إعداد Firebase واتصال الإنترنت، ثم أعد المحاولة. لا تشارك مفاتيح خاصة أو كلمات مرور.',
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),
                  FilledButton.icon(
                    onPressed: _initializeFirebase,
                    icon: const Icon(Icons.refresh),
                    label: const Text('إعادة المحاولة'),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return AuthGate();
  }
}
