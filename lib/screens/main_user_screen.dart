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
        title: const Text('منصة مودة - العشق واللقاء', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF0F0C29), Color(0xFF302B63), Color(0xFF24243E)],
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
                  'لوحة التحكم السينمائية الشاملة',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.amberAccent, shadows: [Shadow(color: Colors.pink, blurRadius: 10)]),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 30),
                Expanded(
                  child: GridView.count(
                    crossAxisCount: 2,
                    crossAxisSpacing: 15,
                    mainAxisSpacing: 15,
                    children: [
                      _buildCinematicCard(context, 'غرف الدردشة', Icons.chat_bubble_rounded, Colors.pinkAccent, () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ChatRoomScreen(userId: userId, userName: 'عضو مودة المميز'),
                          ),
                        );
                      }),
                      _buildCinematicCard(context, 'المتجر والعملات', Icons.monetization_on_rounded, Colors.amber, () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ShopScreen(userId: userId),
                          ),
                        );
                      }),
                      _buildCinematicCard(context, 'الملف الشخصي', Icons.person_pin_rounded, Colors.purpleAccent, () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ProfileScreen(userId: userId),
                          ),
                        );
                      }),
                      _buildCinematicCard(context, 'لوحة الأدمن', Icons.admin_panel_settings_rounded, Colors.cyanAccent, () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const SuperAdminScreen(),
                          ),
                        );
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

  Widget _buildCinematicCard(BuildContext context, String title, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.06),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: color.withOpacity(0.7), width: 1.5),
          boxShadow: [BoxShadow(color: color.withOpacity(0.25), blurRadius: 15, spreadRadius: 2)],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 52, color: color),
            const SizedBox(height: 12),
            Text(title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
