import 'package:flutter/material.dart';
import 'chat_room_screen.dart';

class MainUserScreen extends StatelessWidget {
  final String userId;
  const MainUserScreen({Key? key, required this.userId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('منصة مودة - الرئيسية'),
        backgroundColor: Colors.pink.shade700,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'أهلاً بك في منصة مودة للتعارف والزواج الآمن',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.pink),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const ChatRoomScreen(
                      chatId: 'general_room',
                      currentUserId: 'user_default',
                      peerName: 'العضو المميز',
                    ),
                  ),
                );
              },
              child: const Text('دخول غرفة الدردشة العامة'),
            ),
          ],
        ),
      ),
    );
  }
}
