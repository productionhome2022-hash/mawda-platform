import 'package:flutter/material.dart';
import 'chat_room_screen.dart';
import 'shop_screen.dart';
import 'profile_screen.dart';
import 'super_admin_screen.dart';

class MainUserScreen extends StatelessWidget {
  final String userId;
  const MainUserScreen({super.key, required this.userId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('منصة مودة - الوصال واللقاء', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF1a0033), Color(0xFF330066), Color(0xFF000000)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'لوحة التحكم الشاملة',
                  style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Colors.pinkAccent, shadows: [Shadow(color: Colors.purple, blurRadius: 10)]),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 30),
                Expanded(
                  child: GridView.count(
                    crossAxisCount: 2,
                    crossAxisSpacing: 15,
                    mainAxisSpacing: 15,
                    children: [
                      _buildCard(context, 'غرف الدردشة', Icons.chat_rounded, Colors.pink, () {
                        Navigator.push(context, MaterialPageRoute(builder: (context) => const ChatRoomScreen()));
                      }),
                      _buildCard(context, 'المتجر والعملات', Icons.storefront_rounded, Colors.amber, () {
                        Navigator.push(context, MaterialPageRoute(builder: (context) => const ShopScreen()));
                      }),
                      _buildCard(context, 'الملف الشخصي', Icons.person_rounded, Colors.purpleAccent, () {
                        Navigator.push(context, MaterialPageRoute(builder: (context) => const ProfileScreen()));
                      }),
                      _buildCard(context, 'لوحة الأدمن', Icons.admin_panel_settings_rounded, Colors.cyanAccent, () {
                        Navigator.push(context, MaterialPageRoute(builder: (context) => const SuperAdminScreen()));
                      }),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCard(BuildContext context, String title, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withOpacity(0.6), width: 1.5),
          boxShadow: [BoxShadow(color: color.withOpacity(0.15), blurRadius: 12, spreadRadius: 1)],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: color),
            const SizedBox(height: 12),
            Text(title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
