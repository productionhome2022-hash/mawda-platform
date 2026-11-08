import 'package:flutter/material.dart';

class ShopScreen extends StatelessWidget {
  final String userId;
  const ShopScreen({super.key, required this.userId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('متجر المميزات'),
        backgroundColor: Colors.pink,
        centerTitle: true,
      ),
      body: const Center(
        child: Text(
          'متجر منصة مودة - قيد التشغيل',
          style: TextStyle(color: Colors.white, fontSize: 20),
        ),
      ),
    );
  }
}
