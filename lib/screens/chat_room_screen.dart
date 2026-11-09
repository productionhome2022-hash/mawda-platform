import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../services/super_admin_security_service.dart';

class ChatRoomScreen extends StatefulWidget {
  final String chatId;
  final String currentUserId;
  final bool isPublicRoom; // true = غرفة عامة للإدارة، false = غرفة خاصة مستأجرة
  final bool isSuperAdmin; // هل المستخدم الحالي هو السوبر أدمن؟
  final bool isRoomOwner; // هل المستخدم هو مالك الغرفة الخاصة؟

  const ChatRoomScreen({
    Key? key,
    required this.chatId,
    required this.currentUserId,
    required this.isPublicRoom,
    required this.isSuperAdmin,
    required this.isRoomOwner,
  }) : super(key: key);

  @override
  State<ChatRoomScreen> createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends State<ChatRoomScreen> {
  final TextEditingController _messageController = TextEditingController();
  final SuperAdminSecurityService _securityService = SuperAdminSecurityService();
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  void _sendMessage() async {
    if (_messageController.text.trim().isEmpty) return;

    String content = _messageController.text.trim();
    _messageController.clear();

    await _firestore
        .collection('chats')
        .doc(widget.chatId)
        .collection('messages')
        .add({
      'senderId': widget.currentUserId,
      'content': content,
      'timestamp': FieldValue.serverTimestamp(),
      'hasMedia': false,
    });
  }

  // لوحة تحكم السوبر أدمن المطلقة للغرف العامة
  void _showSuperAdminPublicRoomControls() {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Super Admin Absolute Sovereignty 🛡️',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.red),
              ),
              const SizedBox(height: 15),
              ListTile(
                leading: const Icon(Icons.wallpaper, color: Colors.purple),
                title: const Text('Change Public Room Interior Background'),
                onTap: () {
                  Navigator.pop(context);
                  // منطق تغيير الخلفية الداخلية للغرفة العامة من قبل السوبر أدمن
                },
              ),
              ListTile(
                leading: const Icon(Icons.image, color: Colors.blue),
                title: const Text('Update Public Room External Cover'),
                onTap: () {
                  Navigator.pop(context);
                  // منطق تغيير الغلاف الخارجي للغرفة العامة
                },
              ),
              ListTile(
                leading: const Icon(Icons.security, color: Colors.orange),
                title: const Text('Configure Room Operation Rules'),
                onTap: () {
                  Navigator.pop(context);
                  // إعدادات طريقة عمل الغرفة العامة
                },
              ),
              ListTile(
                leading: const Icon(Icons.block, color: Colors.red),
                title: const Text('Kick, Ban or HWID Block User'),
                onTap: () {
                  Navigator.pop(context);
                  // الحظر الشامل
                },
              ),
            ],
          ),
        );
      },
    );
  }

  // لوحة مالك الغرفة الخاصة المستأجرة
  void _showRentedRoomControls() {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Rented Room Owner Panel 👑',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 15),
              ListTile(
                leading: const Icon(Icons.wallpaper, color: Colors.purple),
                title: const Text('Change Room Background'),
                onTap: () => Navigator.pop(context),
              ),
              ListTile(
                leading: const Icon(Icons.image, color: Colors.blue),
                title: const Text('Update Room Cover'),
                onTap: () => Navigator.pop(context),
              ),
              ListTile(
                leading: const Icon(Icons.block, color: Colors.red),
                title: const Text('Manage Room Members'),
                onTap: () => Navigator.pop(context),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    // تحديد صلاحية التحكم: للغرف العامة يشترط أن يكون المستخدم سوبر أدمن، وللخاصة يشترط أن يكون المالك أو سوبر أدمن
    bool hasPrivilege = widget.isPublicRoom ? widget.isSuperAdmin : (widget.isRoomOwner || widget.isSuperAdmin);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.isPublicRoom ? 'Mawda Public Room (Super Admin Controlled) 🌐' : 'Mawda Rented Private Room 🏠'),
        backgroundColor: widget.isPublicRoom ? Colors.black87 : Colors.deepPurple,
        actions: [
          if (hasPrivilege)
            IconButton(
              icon: Icon(widget.isPublicRoom ? Icons.admin_panel_settings : Icons.settings, color: Colors.amber),
              onPressed: widget.isPublicRoom ? _showSuperAdminPublicRoomControls : _showRentedRoomControls,
              tooltip: 'Room Management Controls',
            ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: StreamBuilder<QuerySnapshot>(
              stream: _securityService.streamSpyChatMessages(widget.chatId),
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }

                var messages = snapshot.data!.docs;

                return ListView.builder(
                  reverse: true,
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    var msg = messages[index].data() as Map<String, dynamic>;
                    String messageId = messages[index].id;
                    bool isMe = msg['senderId'] == widget.currentUserId;

                    return ListTile(
                      title: Align(
                        alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isMe ? Colors.deepPurple[100] : Colors.grey[200],
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(msg['content'] ?? ''),
                              if (isMe || widget.isSuperAdmin || (widget.isRoomOwner && !widget.isPublicRoom))
                                TextButton(
                                  onPressed: () => _securityService.deleteMessageForEveryone(widget.chatId, messageId),
                                  child: const Text('Delete for Everyone 🗑️', style: TextStyle(fontSize: 10, color: Colors.red)),
                                ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: const InputDecoration(
                      hintText: 'Type a message...',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.send, color: Colors.deepPurple),
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
