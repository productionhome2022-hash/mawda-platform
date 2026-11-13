import 'dart:async';

import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:image_picker/image_picker.dart';
import 'package:uuid/uuid.dart';
import 'package:url_launcher/url_launcher.dart';

import '../services/member_media_upload_service.dart';

class DirectChatScreen extends StatefulWidget {
  const DirectChatScreen({
    super.key,
    required this.peerUid,
    required this.peerName,
    required this.currentUserId,
  });

  final String peerUid;
  final String peerName;
  final String currentUserId;

  @override
  State<DirectChatScreen> createState() => _DirectChatScreenState();
}

class _DirectChatScreenState extends State<DirectChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ImagePicker _imagePicker = ImagePicker();
  final MemberMediaUploadService _mediaService = MemberMediaUploadService();
  final Map<String, ({Future<String?> future, DateTime expiresAt})> _attachmentUrlFutures = {};
  late Future<Map<String, dynamic>> _messagesFuture;
  bool _sending = false;
  bool _refreshing = false;
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _messagesFuture = _loadMessages();
    _refreshTimer = Timer.periodic(const Duration(seconds: 8), (_) {
      if (mounted && !_sending) _refresh();
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _messageController.dispose();
    _mediaService.close();
    super.dispose();
  }

  Future<Map<String, dynamic>> _loadMessages() async {
    final response = await FirebaseFunctions.instance
        .httpsCallable('getDirectMessages')
        .call(<String, dynamic>{'peerUid': widget.peerUid});
    final data = Map<String, dynamic>.from(response.data as Map);
    final messages = (data['messages'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((message) => Map<String, dynamic>.from(message))
        .toList(growable: false);
    final chatId = data['chatId'] as String?;
    if (chatId != null && messages.isNotEmpty) {
      // Only the active participant UI marks its own conversation read.
      // The separate owner-review callable never invokes this path.
      try {
        await FirebaseFunctions.instance
            .httpsCallable('markDirectChatRead')
            .call(<String, dynamic>{'chatId': chatId});
      } on FirebaseFunctionsException {
        // Message reading remains available if receipt persistence is temporarily unavailable.
      }
    }
    return {
      ...data,
      'messages': messages,
    };
  }

  Future<void> _refresh() async {
    if (!mounted || _refreshing) return;
    setState(() => _refreshing = true);
    try {
      final next = _loadMessages();
      setState(() => _messagesFuture = next);
      await next;
    } finally {
      if (mounted) setState(() => _refreshing = false);
    }
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty || _sending) return;
    setState(() => _sending = true);
    try {
      await FirebaseFunctions.instance.httpsCallable('sendDirectMessage').call({
        'recipientUid': widget.peerUid,
        'text': text,
        'clientMessageId': const Uuid().v4(),
      });
      if (!mounted) return;
      _messageController.clear();
      _refresh();
    } on FirebaseFunctionsException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر إرسال الرسالة.')),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('حدث خطأ أثناء إرسال الرسالة.')),
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
      final mediaId = await _mediaService.uploadImage(file: file, purpose: 'chat');
      await _mediaService.sendChatImageAttachment(
        scope: 'direct',
        recipientUid: widget.peerUid,
        mediaId: mediaId,
        clientMessageId: const Uuid().v4(),
      );
      if (!mounted) return;
      await _refresh();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('أُرسلت الصورة بعد اجتياز فحص الأمان.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر إرسال الصورة.')),
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

  Future<void> _pickAndSendAttachment() async {
    if (_sending) return;
    final picked = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: const [
        'jpg', 'jpeg', 'png', 'webp', 'gif',
        'mp3', 'm4a', 'ogg', 'wav', 'mp4', 'pdf',
      ],
      allowMultiple: false,
      withData: false,
    );
    if (picked == null || picked.files.isEmpty || !mounted) return;
    final selected = picked.files.single;
    final path = selected.path;
    if (path == null || path.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر الوصول إلى الملف المحدد على هذا الجهاز.')),
      );
      return;
    }
    setState(() => _sending = true);
    try {
      final mediaId = await _mediaService.uploadChatAttachment(
        file: XFile(path, name: selected.name),
        scope: 'direct',
      );
      await _mediaService.sendChatMediaAttachment(
        scope: 'direct',
        recipientUid: widget.peerUid,
        mediaId: mediaId,
        clientMessageId: const Uuid().v4(),
      );
      if (!mounted) return;
      await _refresh();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم إرسال المرفق بعد الفحص والمعالجة الآمنة.')),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('تعذر إرسال المرفق: $error')),
      );
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  Future<void> _openAttachment(String url) async {
    final opened = await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    if (!opened && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر فتح المرفق على هذا الجهاز.')),
      );
    }
  }

  Future<String?> _attachmentUrl(Map<String, dynamic> message) {
    final mediaId = message['mediaId'] as String? ?? '';
    final messageId = message['messageId'] as String? ?? '';
    final key = '$messageId:$mediaId';
    final cached = _attachmentUrlFutures[key];
    if (cached != null && cached.expiresAt.isAfter(DateTime.now())) {
      return cached.future;
    }
    final future = () async {
      if (mediaId.isEmpty || messageId.isEmpty) return null;
      try {
        final conversation = await _messagesFuture;
        final chatId = conversation['chatId'] as String? ?? '';
        if (chatId.isEmpty) return null;
        return await _mediaService.getChatMediaAttachmentUrl(
          scope: 'direct', chatId: chatId,
          messageId: messageId, mediaId: mediaId,
        );
      } catch (_) {
        return null;
      }
    }();
    _attachmentUrlFutures[key] = (
      future: future,
      expiresAt: DateTime.now().add(const Duration(seconds: 100)),
    );
    return future;
  }

  Future<void> _deleteMessage(Map<String, dynamic> message) async {
    final messageId = message['messageId'] as String? ?? '';
    if (messageId.isEmpty) return;
    final mine = message['senderUid'] == widget.currentUserId;
    final action = await showDialog<String>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('خيارات حذف الرسالة'),
        content: const Text('اختر طريقة الحذف.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('إلغاء'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, 'me'),
            child: const Text('الحذف لدي'),
          ),
          if (mine)
            FilledButton(
              onPressed: () => Navigator.pop(dialogContext, 'everyone'),
              child: const Text('الحذف لدى الجميع'),
            ),
        ],
      ),
    );
    if (action == null || !mounted) return;
    try {
      final data = await _messagesFuture;
      final currentChatId = data['chatId'] as String? ?? '';
      if (currentChatId.isEmpty) {
        throw StateError('المحادثة غير متاحة');
      }
      final callable = FirebaseFunctions.instance.httpsCallable(
        action == 'me' ? 'deleteDirectMessageForMe' : 'deleteDirectMessageForEveryone',
      );
      await callable.call(<String, dynamic>{
        'chatId': currentChatId,
        'messageId': messageId,
      });
      if (mounted) _refresh();
    } on FirebaseFunctionsException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر حذف الرسالة.')),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر حذف الرسالة. حاول تحديث المحادثة ثم أعد المحاولة.')),
      );
    }
  }

  String _timeLabel(dynamic value) {
    if (value is! num) return '';
    final date = DateTime.fromMillisecondsSinceEpoch(value.toInt()).toLocal();
    final hour = date.hour.toString().padLeft(2, '0');
    final minute = date.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  Widget _messageBubble(Map<String, dynamic> message) {
    final mine = message['senderUid'] == widget.currentUserId;
    final text = message['text'] as String? ?? '';
    return Align(
      alignment: mine ? AlignmentDirectional.centerEnd : AlignmentDirectional.centerStart,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 340),
        child: Card(
          color: mine
              ? Theme.of(context).colorScheme.primaryContainer
              : Theme.of(context).colorScheme.surfaceContainerHighest,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                if (!mine && message['isPlatformOwnerMessage'] == true)
                  Align(
                    alignment: AlignmentDirectional.centerStart,
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Text(
                        message['senderLabel'] as String? ?? 'إدارة منصة مودة',
                        style: Theme.of(context).textTheme.labelLarge?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                if (message['isOwnerReviewNotice'] == true)
                  Align(
                    alignment: AlignmentDirectional.centerStart,
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.campaign_outlined,
                            size: 14,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'إشعار مراجعة معلنة',
                            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: Theme.of(context).colorScheme.primary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
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
                        final category = message['mediaCategory'] as String? ?? 'image';
                        if (category == 'image' || category == 'gif') {
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
                        }
                        final isDocument = category == 'document';
                        final label = category == 'audio' ? 'ملف صوتي آمن' :
                            category == 'video' ? 'مقطع فيديو آمن' : 'مستند PDF من إدارة مودة';
                        final icon = category == 'audio' ? Icons.audio_file_outlined :
                            category == 'video' ? Icons.video_file_outlined : Icons.picture_as_pdf_outlined;
                        return SizedBox(
                          width: 260,
                          child: Card(
                            child: ListTile(
                              leading: Icon(icon),
                              title: Text(label),
                              subtitle: Text(isDocument ? 'تنزيل المستند' : 'فتح المرفق'),
                              trailing: IconButton(
                                tooltip: 'فتح المرفق',
                                onPressed: () => _openAttachment(url),
                                icon: const Icon(Icons.open_in_new),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                if (text.isNotEmpty) SelectableText(text),
                const SizedBox(height: 4),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      _timeLabel(message['createdAt']),
                      style: Theme.of(context).textTheme.labelSmall,
                    ),
                    if (mine) ...[
                      const SizedBox(width: 6),
                      Icon(
                        message['isReadByPeer'] == true ? Icons.done_all : Icons.check,
                        size: 14,
                        color: message['isReadByPeer'] == true
                            ? Theme.of(context).colorScheme.primary
                            : Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: 3),
                      Text(
                        message['isReadByPeer'] == true ? 'مقروءة' : 'مرسلة',
                        style: Theme.of(context).textTheme.labelSmall,
                      ),
                    ],
                    const SizedBox(width: 4),
                    IconButton(
                      tooltip: 'حذف الرسالة',
                      visualDensity: VisualDensity.compact,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                      onPressed: () => _deleteMessage(message),
                      icon: const Icon(Icons.delete_outline, size: 18),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.peerName.isEmpty ? 'محادثة خاصة' : widget.peerName),
        actions: [
          IconButton(
            tooltip: 'تحديث الرسائل',
            onPressed: _refresh,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: FutureBuilder<Map<String, dynamic>>(
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
                          const Text(
                            'تعذر تحميل المحادثة. قد لا تسمح إعدادات العضوية أو الخصوصية بفتحها.',
                            textAlign: TextAlign.center,
                          ),
                          TextButton(
                            onPressed: _refresh,
                            child: const Text('إعادة المحاولة'),
                          ),
                        ],
                      ),
                    ),
                  );
                }
                final data = snapshot.data ?? const <String, dynamic>{};
                final messages = (data['messages'] as List<dynamic>? ?? const [])
                    .whereType<Map>()
                    .map((message) => Map<String, dynamic>.from(message))
                    .toList(growable: false);
                if (messages.isEmpty) {
                  return const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: Text(
                        'هذه بداية المحادثة. أرسل رسالة محترمة لبدء التواصل.',
                        textAlign: TextAlign.center,
                      ),
                    ),
                  );
                }
                return ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: messages.length,
                  itemBuilder: (context, index) => _messageBubble(messages[index]),
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
                  IconButton(
                    tooltip: 'إرفاق GIF أو صوت أو فيديو أو PDF',
                    onPressed: _sending ? null : _pickAndSendAttachment,
                    icon: const Icon(Icons.attach_file),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      minLines: 1,
                      maxLines: 5,
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
