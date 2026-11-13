import 'dart:async';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/member_media_upload_service.dart';
import '../services/super_admin_security_service.dart';

class ChatRoomScreen extends StatefulWidget {
  final String chatId;
  final String currentUserId;
  final bool isPublicRoom;
  final bool isSuperAdmin;
  final bool isRoomOwner;
  final bool isModerator;
  final String? peerName;

  const ChatRoomScreen({
    Key? key,
    required this.chatId,
    required this.currentUserId,
    this.isPublicRoom = true,
    this.isSuperAdmin = false,
    this.isRoomOwner = false,
    this.isModerator = false,
    this.peerName,
  }) : super(key: key);

  @override
  State<ChatRoomScreen> createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends State<ChatRoomScreen> {
  final TextEditingController _messageController = TextEditingController();
  final SuperAdminSecurityService _service = SuperAdminSecurityService();
  final ImagePicker _imagePicker = ImagePicker();
  final MemberMediaUploadService _mediaService = MemberMediaUploadService();
  final Map<String, Future<String?>> _attachmentUrlFutures = {};
  late Future<List<Map<String, dynamic>>> _messagesFuture;
  bool _sending = false;
  bool _refreshing = false;
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _messagesFuture = _service.getRoomMessages(widget.chatId);
    _refreshTimer = Timer.periodic(const Duration(seconds: 8), (_) {
      if (mounted && !_sending) _reloadMessages();
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _messageController.dispose();
    _mediaService.close();
    super.dispose();
  }

  Future<void> _reloadMessages() async {
    if (!mounted || _refreshing) return;
    setState(() => _refreshing = true);
    try {
      final next = _service.getRoomMessages(widget.chatId);
      setState(() => _messagesFuture = next);
      await next;
    } finally {
      if (mounted) setState(() => _refreshing = false);
    }
  }

  Future<void> _sendMessage() async {
    final content = _messageController.text.trim();
    if (content.isEmpty || _sending) return;

    setState(() => _sending = true);
    try {
      await _service.sendRoomMessage(
        roomId: widget.chatId,
        content: content,
        clientMessageId: DateTime.now().microsecondsSinceEpoch.toString(),
      );
      if (!mounted) return;
      _messageController.clear();
      _reloadMessages();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر إرسال الرسالة. تحقق من عضويتك واتصالك ثم حاول مجدداً.')),
      );
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  Future<void> _pickAndSendImage() async {
    if (_sending) return;
    final file = await _imagePicker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 90,
      maxWidth: 2048,
      maxHeight: 2048,
    );
    if (file == null || !mounted) return;
    setState(() => _sending = true);
    try {
      final mediaId = await _mediaService.uploadImage(file: file, purpose: 'room');
      await _mediaService.sendChatImageAttachment(
        scope: 'room',
        roomId: widget.chatId,
        mediaId: mediaId,
        clientMessageId: 'roomimg_${DateTime.now().microsecondsSinceEpoch}',
      );
      if (!mounted) return;
      await _reloadMessages();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('أُرسلت الصورة بعد اجتياز فحص الأمان.')),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('تعذر إرسال الصورة: $error')),
      );
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  Future<String?> _attachmentUrl(Map<String, dynamic> message) {
    final mediaId = message['mediaId'] as String? ?? '';
    final messageId = message['messageId'] as String? ?? '';
    final key = '$messageId:$mediaId';
    return _attachmentUrlFutures.putIfAbsent(key, () async {
      if (mediaId.isEmpty || messageId.isEmpty) return null;
      try {
        return await _mediaService.getChatImageAttachmentUrl(
          scope: 'room', roomId: widget.chatId,
          messageId: messageId, mediaId: mediaId,
        );
      } catch (_) {
        return null;
      }
    });
  }

  Future<void> _deleteMessage(String messageId) async {
    final action = await showDialog<String>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('خيارات حذف الرسالة'),
        content: const Text('اختر أين تريد حذف الرسالة.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('إلغاء'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, 'me'),
            child: const Text('الحذف لدي'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(dialogContext, 'everyone'),
            child: const Text('الحذف لدى الجميع'),
          ),
        ],
      ),
    );
    if (action == null || !mounted) return;

    try {
      if (action == 'me') {
        await _service.deleteRoomMessageForMe(
          roomId: widget.chatId,
          messageId: messageId,
        );
      } else {
        await _service.deleteRoomMessage(
          roomId: widget.chatId,
          messageId: messageId,
        );
      }
      if (mounted) _reloadMessages();
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('لم يُسمح بالحذف أو تعذر إتمام العملية.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final roomTitle = widget.peerName ??
        (widget.isPublicRoom ? 'الغرفة العامة' : 'الغرفة الخاصة');

    return Scaffold(
      appBar: AppBar(
        title: Text(roomTitle),
        actions: [
          IconButton(
            tooltip: 'تحديث الرسائل',
            onPressed: _reloadMessages,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: FutureBuilder<List<Map<String, dynamic>>>(
              future: _messagesFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.lock_outline, size: 36),
                          const SizedBox(height: 12),
                          const Text('تعذر تحميل الرسائل. تأكد من تسجيل الدخول والانضمام إلى الغرفة.'),
                          TextButton(onPressed: _reloadMessages, child: const Text('إعادة المحاولة')),
                        ],
                      ),
                    ),
                  );
                }

                final messages = snapshot.data ?? const <Map<String, dynamic>>[];
                if (messages.isEmpty) {
                  return const Center(child: Text('لا توجد رسائل بعد. كن أول من يبدأ الحديث.'));
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    final message = messages[index];
                    final senderUid = message['senderUid'] as String? ?? '';
                    final messageId = message['messageId'] as String? ?? '';
                    final isMe = senderUid == widget.currentUserId;
                    final canRequestDelete = isMe || widget.isSuperAdmin ||
                        widget.isRoomOwner || widget.isModerator;

                    return Align(
                      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                      child: ConstrainedBox(
                        constraints: BoxConstraints(
                          maxWidth: MediaQuery.of(context).size.width * 0.82,
                        ),
                        child: Card(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  isMe ? 'أنت' : senderUid,
                                  style: Theme.of(context).textTheme.labelSmall,
                                ),
                                const SizedBox(height: 4),
                                if (message['type'] == 'attachment' && message['mediaId'] is String)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 8),
                                    child: FutureBuilder<String?>(
                                      future: _attachmentUrl(message),
                                      builder: (context, imageSnapshot) {
                                        if (imageSnapshot.connectionState == ConnectionState.waiting) {
                                          return const SizedBox(
                                            height: 120,
                                            child: Center(child: CircularProgressIndicator()),
                                          );
                                        }
                                        final url = imageSnapshot.data;
                                        if (url == null) {
                                          return const Text('الصورة غير متاحة أو انتهت مدة الاحتفاظ بها.');
                                        }
                                        return ClipRRect(
                                          borderRadius: BorderRadius.circular(12),
                                          child: Image.network(
                                            url, width: 260, height: 220, fit: BoxFit.cover,
                                            errorBuilder: (_, __, ___) => const SizedBox(
                                              height: 100,
                                              child: Center(child: Text('تعذر تحميل الصورة الآمنة.')),
                                            ),
                                          ),
                                        );
                                      },
                                    ),
                                  ),
                                if ((message['content'] as String? ?? '').isNotEmpty)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 4),
                                    child: Text(message['content'] as String),
                                  ),
                                if (canRequestDelete && messageId.isNotEmpty && message['isDeleted'] != true)
                                  Align(
                                    alignment: AlignmentDirectional.centerEnd,
                                    child: TextButton.icon(
                                      onPressed: () => _deleteMessage(messageId),
                                      icon: const Icon(Icons.delete_outline, size: 16),
                                      label: const Text('حذف للجميع'),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
              child: Row(
                children: [
                  IconButton(
                    tooltip: 'إرفاق صورة',
                    onPressed: _sending ? null : _pickAndSendImage,
                    icon: const Icon(Icons.image_outlined),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      minLines: 1,
                      maxLines: 4,
                      maxLength: 4000,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _sendMessage(),
                      decoration: const InputDecoration(
                        hintText: 'اكتب رسالتك...',
                        border: OutlineInputBorder(),
                        counterText: '',
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    tooltip: 'إرسال',
                    onPressed: _sending ? null : _sendMessage,
                    icon: _sending
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.send),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
