import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class ChatRoomScreen extends StatefulWidget {
  final String userId;
  final String userName;

  const ChatRoomScreen({Key? key, required this.userId, required this.userName}) : super(key: key);

  @override
  _ChatRoomScreenState createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends State<ChatRoomScreen> {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final TextEditingController _messageController = TextEditingController();

  void _sendMessage() async {
    String text = _messageController.text.trim();
    if (text.isEmpty) return;

    try {
      await _db.collection('chat_messages').add({
        'userId': widget.userId,
        'userName': widget.userName,
        'message': text,
        'timestamp': FieldValue.serverTimestamp(),
      });
      _messageController.clear();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('خطأ في إرسال الرسالة: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('غرفة الدردشة الحية - منصة مودة'),
        backgroundColor: Colors.black,
      ),
      body: Column(
        children: [
          // عرض رسائل الغرفة الحية بشكل لحظي
          Expanded(
            child: StreamBuilder<QuerySnapshot>(
              stream: _db.collection('chat_messages').orderBy('timestamp', descending: true).snapshots(),
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }

                var docs = snapshot.data!.docs;
                if (docs.isEmpty) {
                  return const Center(child: Text('لا توجد رسائل بعد، كن أول المطارحين!'));
                }

                return ListView.builder(
                  reverse: true,
                  itemCount: docs.length,
                  itemBuilder: (context, index) {
                    var data = docs[index].data() as Map<String, dynamic>;
                    String senderName = data['userName'] ?? 'عضو مجهول';
                    String messageText = data['message'] ?? '';
                    bool isMe = data['userId'] == widget.userId;

                    return Container(
                      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isMe ? Colors.pink[100] : Colors.grey[200],
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                          children: [
                            Text(
                              senderName,
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.pink[800]),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              messageText,
                              style: const TextStyle(fontSize: 16),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
          // شريط كتابة وإرسال الرسائل
          Container(
            padding: const EdgeInsets.all(8),
            color: Colors.white,
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: const InputDecoration(
                      hintText: 'اكتب رسالتك هنا...',
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.send, color: Colors.pink),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
