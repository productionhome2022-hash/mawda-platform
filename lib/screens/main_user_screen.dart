import 'package:flutter/material.dart';

class MainUserScreen extends StatelessWidget {
  final String userId;
  const MainUserScreen({super.key, required this.userId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('منصة مودة - الرئيسية'),
        backgroundColor: Colors.pink,
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'أهلاً بك في منصة مودة الحية',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.pink),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 30),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.pink, foregroundColor: Colors.white),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('تم فتح قسم الدردشة بنجاح')),
                );
              },
              icon: const Icon(Icons.chat),
              label: const Text('غرف الدردشة والتعارف'),
            ),
            const SizedBox(height: 15),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.purple, foregroundColor: Colors.white),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('متجر المميزات قيد التشغيل')),
                );
              },
              icon: const Icon(Icons.store),
              label: const Text('متجر المميزات والعملات'),
            ),
          ],
        ),
      ),
    );
  }
}
