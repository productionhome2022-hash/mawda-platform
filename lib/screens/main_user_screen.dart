// File: lib/screens/main_user_screen.dart
// Production Home 2022 - Mawda Platform Main User Interface
import 'package:flutter/material.dart';
import '../firebase_options.dart'; // تأكد من المسار السليم أو حذفه إن لم الحاجة
import '../services/auth_service.dart';
import '../services/coin_system_service.dart';
import 'login_screen.dart';

class MainUserScreen extends StatefulWidget {
  const MainUserScreen({super.key});

  @override
  State<MainUserScreen> createState() => _MainUserScreenState();
}

class _MainUserScreenState extends State<MainUserScreen> {
  final AuthService _authService = AuthService();
  final CoinSystemService _coinService = CoinSystemService();
  int _userCoins = 0;
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadUserCoins();
  }

  void _loadUserCoins() async {
    int coins = await _coinService.getUserCoins();
    if (mounted) {
      setState(() {
        _userCoins = coins;
      });
    }
  }

  void _logout() async {
    await _authService.signOut();
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> pages = [
      // الصفحة الرئيسية والغرف العامة
      Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.favorite, size: 80, color: Colors.pink),
            const SizedBox(height: 16),
            const Text(
              'أهلاً بك في منصة مودة للتعارف والزواج',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 10),
            Text(
              'رصيدك الحالي: $_userCoins كوينز',
              style: const TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 30),
            ElevatedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('جارِ فتح غرف الدردشة العامة...')),
                );
              },
              icon: const Icon(Icons.chat),
              label: const Text('دخول الغرف العامة والدردشة'),
            ),
          ],
        ),
      ),
      // صفحة المتجر والشحن
      Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.store, size: 80, color: Colors.amber),
            const SizedBox(height: 16),
            const Text(
              'متجر العملات والكوينز',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                _coinService.updateCoins(_userCoins + 50);
                _loadUserCoins();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('تمت إضافة 50 كوينز تجريبية بنجاح!')),
                );
              },
              child: const Text('شحن رصيد تجريبي (50 كوينز)'),
            ),
          ],
        ),
      ),
      // صفحة الملف الشخصي
      Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.person, size: 80, color: Colors.blue),
            const SizedBox(height: 16),
            const Text(
              'الملف الشخصي للأعضاء',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 30),
            ElevatedButton.icon(
              onPressed: _logout,
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              icon: const Icon(Icons.logout, color: Colors.white),
              label: const Text('تسجيل الخروج', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('منصة مودة - الرئيسية'),
        centerTitle: true,
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12.0),
              child: Text(
                '🪙 $_userCoins',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
      body: pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'الرئيسية والغرف',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.store),
            label: 'المتجر',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'حسابي',
          ),
        ],
      ),
    );
  }
}
