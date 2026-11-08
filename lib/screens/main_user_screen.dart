import 'package:flutter/material.dart';

class MainUserScreen extends StatelessWidget {
  final String userId;
  const MainUserScreen({super.key, required this.userId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('منصة مودة - العشق واللقاء', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.2)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF0F0C29), Color(0xFF302B63), Color(0xFF24243E)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 20),
                const Text(
                  'عالم وصال ومودة الرقمي',
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.amberAccent, shadows: [Shadow(color: Colors.pink, blurRadius: 10)]),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 40),
                Expanded(
                  child: GridView.count(
                    crossAxisCount: 2,
                    crossAxisSpacing: 15,
                    mainAxisSpacing: 15,
                    children: [
                      _buildCinematicCard(context, 'غرف الدردشة', Icons.chat_bubble_rounded, Colors.pinkAccent, () {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('جاري فتح غرف الدردشة السينمائية الحية...')));
                      }),
                      _buildCinematicCard(context, 'المتجر والعملات', Icons.monetization_on, Colors.amber, () {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('جاري فتح المتجر ونظام العملات الافتراضية...')));
                      }),
                      _buildCinematicCard(context, 'الملف الشخصي', Icons.person_pin, Colors.purpleAccent, () {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('جاري فتح معرض الملف الشخصي...')));
                      }),
                      _buildCinematicCard(context, 'لوحة الأدمن', Icons.admin_panel_settings, Colors.cyanAccent, () {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('جاري فتح لوحة الرقابة والتحكم الإداري...')));
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
          color: Colors.white.withOpacity(0.08),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withOpacity(0.5), width: 1.5),
          boxShadow: [BoxShadow(color: color.withOpacity(0.2), blurRadius: 15, spreadRadius: 2)],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 50, color: color),
            const SizedBox(height: 12),
            Text(title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
